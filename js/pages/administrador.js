import { requireAuth } from '../services/auth.js';
import { apiFetch } from '../services/api.js';
import { initDashboardChrome } from '../components/sidebar.js';
import { qs } from '../utils/helpers.js';
import { showAlert } from '../components/alerts.js';

const NAV = [
  { label: 'Dashboard', href: 'pages/administrador/dashboard.html', icon: '▣' },
  { label: 'Usuarios', href: 'pages/administrador/usuarios.html', icon: '👥' },
  { label: 'Configuración', href: 'pages/administrador/configuracion.html', icon: '⚙' },
];

export async function initAdminPage(page) {
  const user = await requireAuth(['administrador']);
  if (!user) return;
  initDashboardChrome({ user, navItems: NAV, activeLabel: page });
  if (page === 'Dashboard' || page === 'Usuarios') {
    try {
      const data = await apiFetch('usuarios.php');
      const usuarios = data.usuarios || [];
      const pacientes = usuarios.filter((u) => u.rol.split(', ').includes('paciente'));
      const staff = usuarios.filter((u) => !u.rol.split(', ').includes('paciente'));
      qs('[data-stat-pacientes]')?.replaceChildren(document.createTextNode(String(pacientes.length)));
      qs('[data-stat-staff]')?.replaceChildren(document.createTextNode(String(staff.length)));
      if (page === 'Usuarios') {
        const tbody = qs('#usuarios-table tbody');
        if (tbody) tbody.innerHTML = usuarios.map((u) => `<tr><td>${escapeHtml(u.nombre)}</td><td>${escapeHtml(u.email || '—')}</td><td>${escapeHtml(u.rol)}</td><td>${escapeHtml(u.estado)}</td></tr>`).join('') || '<tr><td colspan="4">No hay usuarios registrados.</td></tr>';
      }
    } catch (error) { showAlert(qs('#page-alert'), error.message, 'error'); }
  }
  if (page === 'Configuración') {
    const info = qs('#config-info');
    if (info) info.textContent = 'La configuración de conexión se administra en api/config/conexion.php. No se modifican datos de producción desde esta pantalla.';
  }
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
}
