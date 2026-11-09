import { requireAuth } from '../services/auth.js';
import { listCitasBackend, actualizarCitaBackend } from '../services/citas.js';
import { listTurnosBackend, crearTurnoVirtualBackend } from '../services/turnos.js?virtual-checkin';
import { initDashboardChrome } from '../components/sidebar.js';
import { initChatbot } from '../components/chatbot.js';
import { formatCitaEstado, formatTurnoEstado } from '../utils/formatters.js';
import { qs, qsa, formatDateShort, escapeHtml, todayISO } from '../utils/helpers.js';
import { showAlert } from '../components/alerts.js';

const NAV = [
  { label: 'Dashboard', href: 'pages/paciente/dashboard.html', icon: '▣' },
  { label: 'Mis citas', href: 'pages/paciente/citas.html', icon: '📅' },
  { label: 'Turnos', href: 'pages/paciente/turnos.html', icon: '🎫' },
  { label: 'Mi perfil', href: 'pages/paciente/perfil.html', icon: '👤' },
];

let turnosRefreshTimer = null;
let turnosRefreshPending = false;

export async function initPacientePage(page) {
  const user = await requireAuth(['paciente']);
  if (!user) return;

  initDashboardChrome({ user, navItems: NAV, activeLabel: page });
  initChatbot();

  if (page === 'Dashboard') renderDashboard(user);
  if (page === 'Mis citas') renderCitas(user);
  if (page === 'Turnos') {
    await renderTurnos(user);
    window.clearInterval(turnosRefreshTimer);
    turnosRefreshTimer = window.setInterval(() => renderTurnos(user), 10000);
  }
  if (page === 'Mi perfil') renderPerfil(user);
}

async function renderDashboard(user) {
  let citas;
  try { citas = await listCitasBackend({ pacienteId: user.pacienteId }); }
  catch (error) { showAlert(qs('#page-alert'), error.message, 'error'); return; }
  const proximas = citas
    .filter((c) => !['cancelada', 'atendida', 'no_asistio'].includes(c.estado) && c.fecha >= todayISO())
    .sort((a, b) => a.fecha.localeCompare(b.fecha) || a.hora.localeCompare(b.hora));
  qs('[data-greeting]')?.replaceChildren(document.createTextNode(`Hola, ${user.nombres} 👋`));
  qs('[data-stat-citas]')?.replaceChildren(document.createTextNode(String(proximas.length)));
  const next = proximas[0];
  const nextBox = qs('[data-next-cita]');
  if (nextBox && next) {
    nextBox.innerHTML = `<p class="truncate-title">${escapeHtml(next.especialidad)}</p>
      <p>${escapeHtml(next.profesional)} · ${escapeHtml(next.sede)}</p>
      <p><strong>${formatDateShort(next.fecha)} · ${escapeHtml(next.hora)}</strong></p>`;
  }
  const list = qs('[data-citas-list]');
  if (list) {
    list.innerHTML = proximas.slice(0, 2)
      .map((c) => cardCita(c, user))
      .join('') || '<p>No tienes citas próximas registradas.</p>';
    bindCitaActions(user, citas);
  }
}

async function renderCitas(user) {
  let citas;
  try { citas = await listCitasBackend({ pacienteId: user.pacienteId }); }
  catch (error) { showAlert(qs('#page-alert'), error.message, 'error'); return; }
  const list = qs('[data-citas-list]');
  if (list) {
    list.innerHTML =
      citas.map((c) => cardCita(c, user)).join('') ||
      '<p>Aún no tienes citas registradas en la base de datos.</p>';
    bindCitaActions(user, citas);
  }
}

function cardCita(c, user) {
  const st = formatCitaEstado(c.estado);
  return `<article class="dash-card" data-cita-id="${c.id}">
    <div class="dash-card-head"><strong>${escapeHtml(c.especialidad)}</strong><span class="badge ${st.className}">${st.label}</span></div>
    <p>${escapeHtml(c.profesional)}</p>
    <p>${formatDateShort(c.fecha)} · ${escapeHtml(c.hora)} · ${escapeHtml(c.sede)}</p>
    <div class="dash-card-actions">
      <button type="button" class="btn outline small" data-action="detail">Ver detalle</button>
      ${!['cancelada', 'atendida', 'no_asistio'].includes(c.estado) ? '<button type="button" class="btn ghost small" data-action="cancel">Cancelar</button>' : ''}
    </div>
  </article>`;
}

function bindCitaActions(user, citasActuales) {
  qsa('[data-cita-id]').forEach((card) => {
    card.querySelector('[data-action="detail"]')?.addEventListener('click', () => {
      const cita = citasActuales.find((item) => String(item.id) === String(card.dataset.citaId));
      const modal = qs('#detail-modal');
      const body = qs('#detail-body');
      if (!cita || !modal || !body) return;
      body.innerHTML = `<ul class="detail-list">
        <li><strong>Paciente:</strong> ${escapeHtml(cita.pacienteNombre)}</li>
        <li><strong>Especialidad:</strong> ${escapeHtml(cita.especialidad)}</li>
        <li><strong>Profesional:</strong> ${escapeHtml(cita.profesional)}</li>
        <li><strong>Fecha:</strong> ${formatDateShort(cita.fecha)} ${escapeHtml(cita.hora)}</li>
        <li><strong>Sede:</strong> ${escapeHtml(cita.sede)}</li>
        <li><strong>Estado:</strong> ${formatCitaEstado(cita.estado).label}</li>
      </ul>`;
      modal.hidden = false;
    });
    card.querySelector('[data-action="cancel"]')?.addEventListener('click', () => {
      if (!window.confirm('¿Deseas cancelar esta cita?')) return;
      actualizarCitaBackend(card.dataset.citaId, 'cancelar').then(() => {
        showAlert(qs('#page-alert'), 'Cita cancelada correctamente.', 'success');
        renderCitas(user);
      }).catch((error) => showAlert(qs('#page-alert'), error.message, 'error'));
    });
  });
  qs('[data-modal-close]')?.addEventListener('click', () => {
    qs('#detail-modal').hidden = true;
  });
}

async function renderTurnos(user) {
  const box = qs('[data-turno-actual]');
  const appointmentsBox = qs('[data-checkin-citas]');
  if (!box || !appointmentsBox || turnosRefreshPending) return;
  turnosRefreshPending = true;
  try {
    const [turnos, citas] = await Promise.all([
      listTurnosBackend({ fecha: todayISO(), pacienteId: user.pacienteId }),
      listCitasBackend({ fecha: todayISO(), pacienteId: user.pacienteId }),
    ]);
    const current = turnos.find((t) => ['generado', 'en_espera', 'llamado', 'en_atencion'].includes(t.estado));
    if (!current) {
      box.textContent = 'Aún no tienes un turno activo para hoy.';
    } else {
      const st = formatTurnoEstado(current.estado);
      box.classList.add('turno-panel');
      box.innerHTML = `<p class="turno-num">${escapeHtml(current.numero)}</p>
        <p>Estado: <span class="badge ${st.className}">${st.label}</span></p>
        <p>${escapeHtml(current.sede)} · ${escapeHtml(current.modulo || 'Módulo por asignar')}</p>
        <p class="hint">Este turno se actualiza automáticamente mientras recepción gestiona la fila.</p>`;
    }

    const citasElegibles = citas.filter((cita) => ['pendiente', 'confirmada'].includes(cita.estado));
    appointmentsBox.innerHTML = citasElegibles.length
      ? citasElegibles.map((cita) => {
        const turno = turnos.find((item) => Number(item.citaId) === Number(cita.id));
        if (turno) {
          const estadoTurno = formatTurnoEstado(turno.estado);
          return `<article class="virtual-checkin-item">
            <div><strong>${escapeHtml(cita.especialidad)} · ${escapeHtml(cita.hora)}</strong>
              <span>${escapeHtml(cita.profesional)} · ${escapeHtml(cita.sede)}</span></div>
            <p>Turno ${escapeHtml(turno.numero)} · <span class="badge ${estadoTurno.className}">${estadoTurno.label}</span></p>
          </article>`;
        }
        return `<article class="virtual-checkin-item">
          <div><strong>${escapeHtml(cita.especialidad)} · ${escapeHtml(cita.hora)}</strong>
            <span>${escapeHtml(cita.profesional)} · ${escapeHtml(cita.sede)}</span></div>
          <button type="button" class="btn primary small" data-checkin-cita="${escapeHtml(cita.id)}">Hacer check-in</button>
        </article>`;
      }).join('')
      : '<p class="virtual-checkin-empty">No tienes citas activas para hoy. El check-in estará disponible el día de tu cita.</p>';

    appointmentsBox.querySelectorAll('[data-checkin-cita]').forEach((button) => {
      button.addEventListener('click', async () => {
        button.disabled = true;
        try {
          const result = await crearTurnoVirtualBackend(button.dataset.checkinCita);
          showAlert(qs('#page-alert'), result.message || 'Turno virtual generado.', 'success');
          await renderTurnos(user);
        } catch (error) {
          button.disabled = false;
          showAlert(qs('#page-alert'), error.message, 'error');
        }
      });
    });
  } catch (error) {
    box.textContent = error.message || 'No fue posible consultar tu turno.';
    appointmentsBox.textContent = 'No fue posible cargar tus citas de hoy.';
    showAlert(qs('#page-alert'), error.message, 'error');
  } finally {
    turnosRefreshPending = false;
  }
}

function renderPerfil(user) {
  qs('[data-perfil-nombre]')?.replaceChildren(document.createTextNode(user.nombreCompleto));
  qs('[data-perfil-email]')?.replaceChildren(document.createTextNode(user.email));
  qs('[data-perfil-rol]')?.replaceChildren(document.createTextNode('Paciente'));
}
