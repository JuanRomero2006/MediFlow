import { requireAuth } from '../services/auth.js';
import { resetDemoCitas } from '../services/citas.js';
import { resetDemoTurnos } from '../services/turnos.js';
import { listDemoStaff, listDemoPacientes } from '../services/usuarios.js';
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

  if (page === 'Dashboard') {
    qs('[data-stat-pacientes]')?.replaceChildren(
      document.createTextNode(String(listDemoPacientes().length)),
    );
    qs('[data-stat-staff]')?.replaceChildren(
      document.createTextNode(String(listDemoStaff().length)),
    );
  }

  if (page === 'Usuarios') {
    const tbody = qs('#usuarios-table tbody');
    if (tbody) {
      tbody.innerHTML = [...listDemoPacientes(), ...listDemoStaff()]
        .map((u) => `<tr><td>${u.nombre}</td><td>${u.email || '—'}</td><td>${u.rol || 'paciente'}</td></tr>`)
        .join('');
    }
  }

  if (page === 'Configuración') {
    qs('#reset-demo')?.addEventListener('click', () => {
      if (!window.confirm('¿Restablecer citas y turnos de demostración en este navegador?')) return;
      resetDemoCitas();
      resetDemoTurnos();
      showAlert(qs('#page-alert'), 'Datos de demostración restablecidos.', 'success');
    });
  }
}
