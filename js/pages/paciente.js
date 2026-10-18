import { requireAuth } from '../services/auth.js';
import { listCitas, cancelCita, getCitaById } from '../services/citas.js';
import { listTurnos } from '../services/turnos.js';
import { initDashboardChrome } from '../components/sidebar.js';
import { initChatbot } from '../components/chatbot.js';
import { formatCitaEstado, formatTurnoEstado } from '../utils/formatters.js';
import { qs, qsa, formatDateShort } from '../utils/helpers.js';
import { showAlert } from '../components/alerts.js';

const NAV = [
  { label: 'Dashboard', href: 'pages/paciente/dashboard.html', icon: '▣' },
  { label: 'Mis citas', href: 'pages/paciente/citas.html', icon: '📅' },
  { label: 'Turnos', href: 'pages/paciente/turnos.html', icon: '🎫' },
  { label: 'Mi perfil', href: 'pages/paciente/perfil.html', icon: '👤' },
];

export async function initPacientePage(page) {
  const user = await requireAuth(['paciente']);
  if (!user) return;

  initDashboardChrome({ user, navItems: NAV, activeLabel: page });
  initChatbot();

  if (page === 'Dashboard') renderDashboard(user);
  if (page === 'Mis citas') renderCitas(user);
  if (page === 'Turnos') renderTurnos(user);
  if (page === 'Mi perfil') renderPerfil(user);
}

function renderDashboard(user) {
  const citas = listCitas({ pacienteId: user.pacienteId });
  const proximas = citas.filter((c) => c.estado !== 'cancelada').slice(0, 2);
  qs('[data-greeting]')?.replaceChildren(document.createTextNode(`Hola, ${user.nombres} 👋`));
  qs('[data-stat-citas]')?.replaceChildren(document.createTextNode(String(proximas.length)));
  const next = proximas[0];
  const nextBox = qs('[data-next-cita]');
  if (nextBox && next) {
    nextBox.innerHTML = `<p class="truncate-title">${next.especialidad}</p>
      <p>${next.profesional} · ${next.sede}</p>
      <p><strong>${formatDateShort(next.fecha)} · ${next.hora}</strong></p>`;
  }
  const list = qs('[data-citas-list]');
  if (list) {
    list.innerHTML = proximas
      .map((c) => cardCita(c, user))
      .join('') || '<p>No tienes citas próximas en la demostración.</p>';
    bindCitaActions(user);
  }
}

function renderCitas(user) {
  const citas = listCitas({ pacienteId: user.pacienteId });
  const list = qs('[data-citas-list]');
  if (list) {
    list.innerHTML =
      citas.map((c) => cardCita(c, user)).join('') ||
      '<p>Aún no tienes citas registradas en esta demostración.</p>';
    bindCitaActions(user);
  }
}

function cardCita(c, user) {
  const st = formatCitaEstado(c.estado);
  return `<article class="dash-card" data-cita-id="${c.id}">
    <div class="dash-card-head"><strong>${c.especialidad}</strong><span class="badge ${st.className}">${st.label}</span></div>
    <p>${c.profesional}</p>
    <p>${formatDateShort(c.fecha)} · ${c.hora} · ${c.sede}</p>
    <div class="dash-card-actions">
      <button type="button" class="btn outline small" data-action="detail">Ver detalle</button>
      ${c.estado !== 'cancelada' ? '<button type="button" class="btn ghost small" data-action="cancel">Cancelar</button>' : ''}
    </div>
  </article>`;
}

function bindCitaActions(user) {
  qsa('[data-cita-id]').forEach((card) => {
    card.querySelector('[data-action="detail"]')?.addEventListener('click', () => {
      const cita = getCitaById(card.dataset.citaId);
      const modal = qs('#detail-modal');
      const body = qs('#detail-body');
      if (!cita || !modal || !body) return;
      body.innerHTML = `<ul class="detail-list">
        <li><strong>Paciente:</strong> ${cita.pacienteNombre}</li>
        <li><strong>Especialidad:</strong> ${cita.especialidad}</li>
        <li><strong>Profesional:</strong> ${cita.profesional}</li>
        <li><strong>Fecha:</strong> ${formatDateShort(cita.fecha)} ${cita.hora}</li>
        <li><strong>Sede:</strong> ${cita.sede}</li>
        <li><strong>Estado:</strong> ${formatCitaEstado(cita.estado).label}</li>
      </ul>`;
      modal.hidden = false;
    });
    card.querySelector('[data-action="cancel"]')?.addEventListener('click', () => {
      if (!window.confirm('¿Cancelar esta cita en la demostración?')) return;
      cancelCita(card.dataset.citaId);
      renderCitas(user);
      showAlert(qs('#page-alert'), 'Cita cancelada en la demostración local.', 'success');
    });
  });
  qs('[data-modal-close]')?.addEventListener('click', () => {
    qs('#detail-modal').hidden = true;
  });
}

function renderTurnos(user) {
  const turnos = listTurnos({ pacienteId: user.pacienteId });
  const current = turnos[0];
  const box = qs('[data-turno-actual]');
  if (box) {
    if (!current) {
      box.textContent = 'No tienes turno activo hoy en la demostración.';
      return;
    }
    const st = formatTurnoEstado(current.estado);
    box.classList.add('turno-panel');
    box.innerHTML = `<p class="turno-num">${current.numero}</p>
      <p>Estado: <span class="badge ${st.className}">${st.label}</span></p>
      <p>${current.sede} · ${current.modulo || 'Módulo por asignar'}</p>
      <p class="hint">Los cambios los realiza recepción y médico en sus paneles (sin tiempo real).</p>`;
  }
}

function renderPerfil(user) {
  qs('[data-perfil-nombre]')?.replaceChildren(document.createTextNode(user.nombreCompleto));
  qs('[data-perfil-email]')?.replaceChildren(document.createTextNode(user.email));
  qs('[data-perfil-rol]')?.replaceChildren(document.createTextNode('Paciente (demostración)'));
}
