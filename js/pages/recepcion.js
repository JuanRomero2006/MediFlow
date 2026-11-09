import { requireAuth } from '../services/auth.js';
import { listCitasBackend, actualizarCitaBackend } from '../services/citas.js';
import { listTurnosBackend, actualizarTurnoBackend } from '../services/turnos.js';
import { listPacientesBackend } from '../services/usuarios.js';
import { initDashboardChrome } from '../components/sidebar.js';
import { formatCitaEstado, formatTurnoEstado } from '../utils/formatters.js';
import { qs, qsa, todayISO, formatDateShort, escapeHtml } from '../utils/helpers.js';
import { showAlert } from '../components/alerts.js';

const NAV = [
  { label: 'Dashboard', href: 'pages/recepcion/dashboard.html', icon: '▣' },
  { label: 'Citas', href: 'pages/recepcion/citas.html', icon: '📅' },
  { label: 'Pacientes', href: 'pages/recepcion/pacientes.html', icon: '👥' },
  { label: 'Turnos', href: 'pages/recepcion/turnos.html', icon: '🎫' },
  { label: 'Pantalla de turnos', href: 'pages/recepcion/pantalla-turnos.html', icon: '📺' },
];

export async function initRecepcionPage(page) {
  const user = await requireAuth(['recepcion']);
  if (!user) return;
  initDashboardChrome({ user, navItems: NAV, activeLabel: page });

  if (page === 'Dashboard') renderDashboard();
  if (page === 'Citas') {
    const filtro = qs('#filtro-fecha-citas');
    if (filtro) { filtro.value = ''; filtro.addEventListener('change', () => renderCitasTable('#citas-table', filtro.value)); }
    renderCitasTable('#citas-table', '');
  }
  if (page === 'Pacientes') renderPacientes();
  if (page === 'Turnos') renderTurnos();
  if (page === 'Pantalla de turnos') {
    await renderPantallaTurnos();
    window.setInterval(() => renderPantallaTurnos(), 10000);
  }
}

async function renderDashboard() {
  let citas;
  try { citas = await listCitasBackend({ fecha: todayISO() }); }
  catch (error) { showAlert(qs('#page-alert'), error.message, 'error'); return; }
  qs('[data-stat-citas]')?.replaceChildren(document.createTextNode(String(citas.length)));
  qs('[data-stat-pendientes]')?.replaceChildren(
    document.createTextNode(String(citas.filter((c) => c.estado === 'pendiente').length)),
  );
  try {
    const turnos = await listTurnosBackend({ fecha: todayISO() });
    qs('[data-stat-turnos]')?.replaceChildren(document.createTextNode(String(turnos.filter((t) => ['generado', 'en_espera', 'llamado', 'en_atencion'].includes(t.estado)).length)));
  } catch (error) {
    qs('[data-stat-turnos]')?.replaceChildren(document.createTextNode('—'));
    showAlert(qs('#page-alert'), `No fue posible consultar los turnos: ${error.message}`, 'error');
  }
  // El resumen conserva métricas del día, pero la tabla muestra citas de cualquier fecha
  // para que las reservas futuras no parezcan haber desaparecido.
  renderCitasTable('#dashboard-citas-table', '');
}

async function renderCitasTable(selector = '#citas-table', fecha = todayISO()) {
  const table = qs(selector);
  if (!table) return;
  let citas;
  try { citas = await listCitasBackend(fecha ? { fecha } : {}); }
  catch (error) { showAlert(qs('#page-alert'), error.message, 'error'); table.innerHTML = '<tbody><tr><td colspan="6">No se pudieron cargar las citas desde el servidor.</td></tr></tbody>'; return; }
  if (citas.length === 0) {
    table.innerHTML = '<tbody><tr><td colspan="6">No hay citas para el filtro seleccionado.</td></tr></tbody>';
    return;
  }
  table.innerHTML = `
    <thead><tr><th>Fecha</th><th>Hora</th><th>Paciente</th><th>Profesional</th><th>Estado</th><th>Acciones</th></tr></thead>
    <tbody>${citas
      .map((c) => {
        const st = formatCitaEstado(c.estado);
        return `<tr data-cita-id="${c.id}">
          <td>${escapeHtml(c.fecha)}</td><td>${escapeHtml(c.hora)}</td><td>${escapeHtml(c.pacienteNombre)}</td><td>${escapeHtml(c.profesional)}</td>
          <td><span class="badge ${st.className}">${st.label}</span></td>
          <td class="table-actions">
            ${c.estado === 'pendiente' ? '<button type="button" class="btn outline small" data-action="confirm">Confirmar</button>' : ''}
            ${!['cancelada', 'atendida'].includes(c.estado) ? '<button type="button" class="button-link" data-action="llegada">Registrar llegada</button>' : ''}
          </td></tr>`;
      })
      .join('')}</tbody>`;

  qsa('[data-cita-id]', table).forEach((row) => {
    const id = row.dataset.citaId;
    row.querySelector('[data-action="confirm"]')?.addEventListener('click', () => {
      actualizarCitaBackend(id, 'confirmar').then(() => {
        showAlert(qs('#page-alert'), 'Cita confirmada correctamente.', 'success');
        renderCitasTable(selector, fecha);
      }).catch((error) => showAlert(qs('#page-alert'), error.message, 'error'));
    });
    row.querySelector('[data-action="llegada"]')?.addEventListener('click', () => {
      actualizarCitaBackend(id, 'registrar_llegada').then((result) => {
        showAlert(qs('#page-alert'), result.message || 'Llegada registrada y turno en espera.', 'success');
        renderCitasTable(selector, fecha);
        renderTurnos();
      }).catch((error) => showAlert(qs('#page-alert'), error.message, 'error'));
    });
  });
}

async function renderPacientes() {
  const tbody = qs('#pacientes-table tbody');
  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="4">Cargando pacientes...</td></tr>';
  try {
    const pacientes = await listPacientesBackend();
    tbody.innerHTML = pacientes.length ? pacientes.map((p) => `<tr><td>${escapeHtml(p.nombre)}</td><td>${escapeHtml(p.documento)}</td><td>${escapeHtml(p.email)}</td><td>${escapeHtml(p.eps)}</td></tr>`).join('') : '<tr><td colspan="4">No hay pacientes activos registrados.</td></tr>';
  } catch (error) {
    tbody.innerHTML = '<tr><td colspan="4">No se pudieron cargar los pacientes desde MySQL.</td></tr>';
    showAlert(qs('#page-alert'), error.message, 'error');
  }
}

async function renderTurnos() {
  const tbody = qs('#turnos-table tbody');
  if (!tbody) return;
  let turnos;
  try { turnos = await listTurnosBackend({ fecha: todayISO() }); }
  catch (error) { showAlert(qs('#page-alert'), error.message, 'error'); tbody.innerHTML = '<tr><td colspan="5">No se pudieron cargar los turnos desde el servidor.</td></tr>'; return; }
  tbody.innerHTML = turnos
    .map((t) => {
      const st = formatTurnoEstado(t.estado);
      return `<tr data-turno-id="${t.id}">
        <td>${escapeHtml(t.numero)}</td><td>${escapeHtml(t.pacienteNombre)}</td><td>${formatDateShort(t.fecha)}</td>
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
      actualizarTurnoBackend(id, 'llamado').then(() => renderTurnos()).catch((error) => showAlert(qs('#page-alert'), error.message, 'error'));
    });
    row.querySelector('[data-action="atencion"]')?.addEventListener('click', () => {
      actualizarTurnoBackend(id, 'en_atencion').then(() => renderTurnos()).catch((error) => showAlert(qs('#page-alert'), error.message, 'error'));
    });
    row.querySelector('[data-action="atendido"]')?.addEventListener('click', () => {
      actualizarTurnoBackend(id, 'atendido').then(() => renderTurnos()).catch((error) => showAlert(qs('#page-alert'), error.message, 'error'));
    });
  });
}


async function renderPantallaTurnos() {
  const current = qs('#turno-actual');
  const waiting = qs('#turnos-espera');
  const stamp = qs('#turnos-actualizados');
  if (!current || !waiting) return;
  try {
    const turnos = await listTurnosBackend({ fecha: todayISO() });
    const activos = turnos.filter((t) => !['atendido', 'cancelado', 'no_presento'].includes(t.estado));
    const llamados = activos.filter((t) => ['llamado', 'en_atencion'].includes(t.estado));
    const actual = llamados[llamados.length - 1];
    current.innerHTML = actual
      ? `<div class="turno-board-number">${escapeHtml(actual.numero)}</div><h2>${escapeHtml(actual.pacienteNombre)}</h2><p>${actual.estado === 'en_atencion' ? 'Pase al consultorio' : 'Por favor, acérquese al módulo indicado'}</p><strong>${escapeHtml(actual.modulo || 'Recepción')}</strong>`
      : '<div class="turno-board-number">—</div><h2>Esperando el siguiente llamado</h2><p>Gracias por su paciencia.</p>';
    const enEspera = activos.filter((t) => ['generado', 'en_espera'].includes(t.estado));
    waiting.innerHTML = enEspera.length ? enEspera.map((t) => `<li><strong>${escapeHtml(t.numero)}</strong><span>${escapeHtml(t.pacienteNombre)}</span><small>${escapeHtml(t.estado === 'en_espera' ? 'En espera' : 'Pendiente')}</small></li>`).join('') : '<li class="turno-board-empty">No hay pacientes en espera.</li>';
    if (stamp) stamp.textContent = `Actualizado ${new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`;
  } catch (error) {
    current.innerHTML = '<h2>No se pudo cargar la pantalla</h2><p>Verifica la conexión con el servidor.</p>';
    showAlert(qs('#page-alert'), error.message, 'error');
  }
}
