import { requireAuth } from '../services/auth.js';
import { listCitasBackend, actualizarCitaBackend } from '../services/citas.js';
import { initDashboardChrome } from '../components/sidebar.js';
import { formatCitaEstado } from '../utils/formatters.js';
import { qs, qsa, todayISO, formatDateShort, escapeHtml } from '../utils/helpers.js';
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
  if (page === 'Dashboard') await renderDashboard(user);
  if (page === 'Agenda') await renderAgenda(user);
  if (page === 'Pacientes') await renderPacientes(user);
  if (page === 'Consulta') await renderConsulta(user);
}

async function citasMedico() {
  const citas = await listCitasBackend({ fecha: todayISO() });
  return citas;
}

async function renderDashboard(user) {
  qs('[data-greeting]')?.replaceChildren(document.createTextNode(`Buenos días, ${user.nombres} 👋`));
  try {
    const citas = await citasMedico();
    qs('[data-stat-citas]')?.replaceChildren(document.createTextNode(String(citas.length)));
    qs('[data-stat-pendientes]')?.replaceChildren(document.createTextNode(String(citas.filter((c) => c.estado === 'pendiente').length)));
    renderAgendaList(citas, '[data-agenda-list]');
  } catch (error) { showAlert(qs('#page-alert'), error.message, 'error'); }
}

async function renderAgenda(user) {
  try { renderAgendaList(await citasMedico(), '[data-agenda-list]'); }
  catch (error) { showAlert(qs('#page-alert'), error.message, 'error'); }
}

function renderAgendaList(citas, selector) {
  const list = qs(selector);
  if (!list) return;
  list.innerHTML = citas.map((c) => {
    const st = formatCitaEstado(c.estado);
    const canAttend = ['pendiente', 'confirmada'].includes(c.estado);
    return `<article class="dash-card" data-cita-id="${c.id}">
      <div class="dash-card-head"><strong>${escapeHtml(c.hora)} · ${escapeHtml(c.pacienteNombre)}</strong><span class="badge ${st.className}">${st.label}</span></div>
      <p>${escapeHtml(c.especialidad)}</p><p>${formatDateShort(c.fecha)} · ${escapeHtml(c.sede)}</p>
      ${canAttend ? '<button type="button" class="btn outline small" data-action="atender">Finalizar atención</button>' : ''}
    </article>`;
  }).join('') || '<p>No hay citas asignadas para hoy.</p>';
  qsa('[data-cita-id]', list).forEach((card) => {
    card.querySelector('[data-action="atender"]')?.addEventListener('click', async () => {
      const button = card.querySelector('[data-action="atender"]');
      button.disabled = true;
      try {
        await actualizarCitaBackend(card.dataset.citaId, 'atender');
        showAlert(qs('#page-alert'), 'La cita se marcó como atendida en la base de datos.', 'success');
        const refreshed = await listCitasBackend({ fecha: todayISO() });
        renderAgendaList(refreshed, selector);
      } catch (error) {
        button.disabled = false;
        showAlert(qs('#page-alert'), error.message, 'error');
      }
    });
  });
}

async function renderPacientes(user) {
  const tbody = qs('#pacientes-table tbody');
  if (!tbody) return;
  try {
    const citas = await listCitasBackend({});
    const unique = [...new Map(citas.map((c) => [c.pacienteId, c])).values()];
    tbody.innerHTML = unique.map((c) => `<tr><td>${escapeHtml(c.pacienteNombre)}</td><td>${escapeHtml(c.telefono || '—')}</td><td>${escapeHtml(c.email || '—')}</td><td>Paciente con cita asignada</td></tr>`).join('') || '<tr><td colspan="4">No hay pacientes asociados a tus citas.</td></tr>';
  } catch (error) { showAlert(qs('#page-alert'), error.message, 'error'); }
}

async function renderConsulta(user) {
  const select = qs('#consulta-cita');
  const form = qs('#consulta-form');
  if (!select) return;
  try {
    const citas = (await citasMedico()).filter((c) => ['pendiente', 'confirmada'].includes(c.estado));
    select.innerHTML = '<option value="">Selecciona una cita de hoy</option>' + citas.map((c) => `<option value="${c.id}">${escapeHtml(c.hora)} · ${escapeHtml(c.pacienteNombre)}</option>`).join('');
  } catch (error) { showAlert(qs('#page-alert'), error.message, 'error'); return; }
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const notas = qs('#consulta-notas')?.value.trim();
    if (!select.value || !notas || notas.length < 5) {
      showAlert(qs('#page-alert'), 'Selecciona una cita y escribe una nota de al menos 5 caracteres.', 'error');
      return;
    }
    showAlert(qs('#page-alert'), 'Este proyecto aún no tiene una tabla de historia clínica. Las notas no se guardaron. Puedes finalizar la cita desde Agenda.', 'info');
  });
}
