import { requireAuth } from '../services/auth.js';
import { listCitas, updateCitaEstado } from '../services/citas.js';
import { listTurnos, createTurnoFromCita, updateTurnoEstado } from '../services/turnos.js';
import { listDemoPacientes } from '../services/usuarios.js';
import { initDashboardChrome } from '../components/sidebar.js';
import { formatCitaEstado, formatTurnoEstado } from '../utils/formatters.js';
import { qs, qsa, todayISO, formatDateShort } from '../utils/helpers.js';
import { showAlert } from '../components/alerts.js';

const NAV = [
  { label: 'Dashboard', href: 'pages/recepcion/dashboard.html', icon: '▣' },
  { label: 'Citas', href: 'pages/recepcion/citas.html', icon: '📅' },
  { label: 'Pacientes', href: 'pages/recepcion/pacientes.html', icon: '👥' },
  { label: 'Turnos', href: 'pages/recepcion/turnos.html', icon: '🎫' },
];

export async function initRecepcionPage(page) {
  const user = await requireAuth(['recepcion']);
  if (!user) return;
  initDashboardChrome({ user, navItems: NAV, activeLabel: page });

  if (page === 'Dashboard') renderDashboard();
  if (page === 'Citas') renderCitasTable();
  if (page === 'Pacientes') renderPacientes();
  if (page === 'Turnos') renderTurnos();
}

function renderDashboard() {
  const citas = listCitas({ fecha: todayISO() });
  qs('[data-stat-citas]')?.replaceChildren(document.createTextNode(String(citas.length)));
  qs('[data-stat-pendientes]')?.replaceChildren(
    document.createTextNode(String(citas.filter((c) => c.estado === 'pendiente').length)),
  );
  renderCitasTable('#dashboard-citas-table');
}

function renderCitasTable(selector = '#citas-table') {
  const table = qs(selector);
  if (!table) return;
  const citas = listCitas({ fecha: todayISO() });
  table.innerHTML = `
    <thead><tr><th>Hora</th><th>Paciente</th><th>Profesional</th><th>Estado</th><th>Acciones</th></tr></thead>
    <tbody>${citas
      .map((c) => {
        const st = formatCitaEstado(c.estado);
        return `<tr data-cita-id="${c.id}">
          <td>${c.hora}</td><td>${c.pacienteNombre}</td><td>${c.profesional}</td>
          <td><span class="badge ${st.className}">${st.label}</span></td>
          <td class="table-actions">
            <button type="button" class="btn outline small" data-action="confirm">Confirmar</button>
            <button type="button" class="button-link" data-action="llegada">Registrar llegada</button>
          </td></tr>`;
      })
      .join('')}</tbody>`;

  qsa('[data-cita-id]', table).forEach((row) => {
    const id = row.dataset.citaId;
    row.querySelector('[data-action="confirm"]')?.addEventListener('click', () => {
      updateCitaEstado(id, 'confirmada');
      showAlert(qs('#page-alert'), 'Cita confirmada (demostración).', 'success');
      renderCitasTable(selector);
    });
    row.querySelector('[data-action="llegada"]')?.addEventListener('click', () => {
      const cita = listCitas().find((c) => c.id === id);
      if (!cita) return;
      const turnoRes = createTurnoFromCita(cita);
      if (turnoRes.turno) updateTurnoEstado(turnoRes.turno.id, 'en_espera');
      showAlert(qs('#page-alert'), 'Llegada registrada y turno en espera.', 'success');
      renderTurnos();
    });
  });
}

function renderPacientes() {
  const tbody = qs('#pacientes-table tbody');
  if (!tbody) return;
  tbody.innerHTML = listDemoPacientes()
    .map(
      (p) => `<tr><td>${p.nombre}</td><td>${p.documento}</td><td>${p.email}</td><td>${p.eps}</td></tr>`,
    )
    .join('');
}

function renderTurnos() {
  const tbody = qs('#turnos-table tbody');
  if (!tbody) return;
  const turnos = listTurnos({ fecha: todayISO() });
  tbody.innerHTML = turnos
    .map((t) => {
      const st = formatTurnoEstado(t.estado);
      return `<tr data-turno-id="${t.id}">
        <td>${t.numero}</td><td>${t.pacienteNombre}</td><td>${formatDateShort(t.fecha)}</td>
        <td><span class="badge ${st.className}">${st.label}</span></td>
        <td class="table-actions">
          <button class="btn outline small" data-action="llamar">Llamar</button>
          <button class="btn ghost small" data-action="atencion">En atención</button>
          <button class="btn ghost small" data-action="atendido">Atendido</button>
        </td></tr>`;
    })
    .join('');

  qsa('[data-turno-id]', tbody).forEach((row) => {
    const id = row.dataset.turnoId;
    row.querySelector('[data-action="llamar"]')?.addEventListener('click', () => {
      updateTurnoEstado(id, 'llamado');
      renderTurnos();
    });
    row.querySelector('[data-action="atencion"]')?.addEventListener('click', () => {
      updateTurnoEstado(id, 'en_atencion');
      renderTurnos();
    });
    row.querySelector('[data-action="atendido"]')?.addEventListener('click', () => {
      updateTurnoEstado(id, 'atendido');
      renderTurnos();
    });
  });
}
