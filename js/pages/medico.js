import { requireAuth } from '../services/auth.js';
import { listCitas, updateCitaEstado } from '../services/citas.js';
import { listTurnos, updateTurnoEstado } from '../services/turnos.js';
import { initDashboardChrome } from '../components/sidebar.js';
import { formatCitaEstado, formatTurnoEstado } from '../utils/formatters.js';
import { qs, qsa, todayISO, formatDateShort } from '../utils/helpers.js';
import { showAlert } from '../components/alerts.js';

const NAV = [
  { label: 'Dashboard', href: 'pages/medico/dashboard.html', icon: '▣' },
  { label: 'Agenda', href: 'pages/medico/agenda.html', icon: '📅' },
  { label: 'Pacientes', href: 'pages/medico/pacientes.html', icon: '👥' },
  { label: 'Consulta', href: 'pages/medico/consulta.html', icon: '🩺' },
];

export async function initMedicoPage(page) {
  const user = await requireAuth(['medico']);
  if (!user) return;
  initDashboardChrome({ user, navItems: NAV, activeLabel: page });

  if (page === 'Dashboard') renderDashboard(user);
  if (page === 'Agenda') renderAgenda(user);
  if (page === 'Pacientes') renderPacientes(user);
  if (page === 'Consulta') renderConsulta(user);
}

function citasMedico(user) {
  return listCitas({ profesionalId: user.medicoId, fecha: todayISO() });
}

function renderDashboard(user) {
  const citas = citasMedico(user);
  qs('[data-greeting]')?.replaceChildren(
    document.createTextNode(`Buenos días, ${user.nombres} 👋`),
  );
  qs('[data-stat-citas]')?.replaceChildren(document.createTextNode(String(citas.length)));
  qs('[data-stat-pendientes]')?.replaceChildren(
    document.createTextNode(String(citas.filter((c) => c.estado === 'pendiente').length)),
  );
  renderAgendaList(user, '[data-agenda-list]');
}

function renderAgenda(user) {
  renderAgendaList(user, '[data-agenda-list]');
}

function renderAgendaList(user, selector) {
  const list = qs(selector);
  if (!list) return;
  const citas = citasMedico(user);
  list.innerHTML =
    citas
      .map((c) => {
        const st = formatCitaEstado(c.estado);
        return `<article class="dash-card" data-cita-id="${c.id}">
          <div class="dash-card-head"><strong>${c.hora} · ${c.pacienteNombre}</strong><span class="badge ${st.className}">${st.label}</span></div>
          <p>${c.especialidad}</p>
          <p>${formatDateShort(c.fecha)} · ${c.sede}</p>
          <button type="button" class="btn outline small" data-action="atender">Iniciar atención</button>
        </article>`;
      })
      .join('') || '<p>No hay citas programadas para hoy en la demostración.</p>';

  qsa('[data-cita-id]', list).forEach((card) => {
    card.querySelector('[data-action="atender"]')?.addEventListener('click', () => {
      updateCitaEstado(card.dataset.citaId, 'atendida');
      const turno = listTurnos({ fecha: todayISO() }).find((t) => t.citaId === card.dataset.citaId);
      if (turno) updateTurnoEstado(turno.id, 'atendido');
      showAlert(qs('#page-alert'), 'Atención finalizada en la demostración.', 'success');
      renderAgendaList(user, selector);
    });
  });
}

function renderPacientes(user) {
  const tbody = qs('#pacientes-table tbody');
  if (!tbody) return;
  const citas = listCitas({ profesionalId: user.medicoId });
  const unique = [...new Map(citas.map((c) => [c.pacienteNombre, c])).values()];
  tbody.innerHTML = unique
    .map(
      (c) =>
        `<tr><td>${c.pacienteNombre}</td><td>${c.telefono || '—'}</td><td>${c.email || '—'}</td><td>Datos ficticios</td></tr>`,
    )
    .join('');
}

function renderConsulta(user) {
  const select = qs('#consulta-cita');
  const form = qs('#consulta-form');
  if (!select) return;
  const citas = citasMedico(user).filter((c) => c.estado !== 'cancelada');
  select.innerHTML =
    `<option value="">Selecciona una cita de hoy</option>` +
    citas.map((c) => `<option value="${c.id}">${c.hora} · ${c.pacienteNombre}</option>`).join('');

  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const notas = qs('#consulta-notas')?.value.trim();
    if (!select.value) {
      showAlert(qs('#page-alert'), 'Selecciona una cita.', 'error');
      return;
    }
    if (!notas || notas.length < 5) {
      showAlert(qs('#page-alert'), 'Registra notas de consulta (mínimo 5 caracteres, ficticias).', 'error');
      return;
    }
    updateCitaEstado(select.value, 'atendida');
    showAlert(qs('#page-alert'), 'Consulta registrada (demostración, sin historial clínico real).', 'success');
    form.reset();
  });
}
