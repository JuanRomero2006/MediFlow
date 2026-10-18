import { appPath, qs, escapeHtml } from '../utils/helpers.js';
import { logout } from '../services/auth.js';

const ROLE_LABELS = {
  paciente: 'Paciente',
  recepcion: 'Recepción',
  medico: 'Médico',
  administrador: 'Administrador',
};

export function initDashboardChrome({ user, navItems, activeLabel }) {
  document.body.classList.add(`dash-role-${user.rol}`);

  const nameEl = qs('[data-user-name]');
  const roleEl = qs('[data-user-role]');
  const roleLabel = ROLE_LABELS[user.rol] || user.rol;
  if (nameEl) {
    nameEl.innerHTML = `<span class="dash-user-name">${escapeHtml(user.nombreCompleto)}</span><span class="dash-user-role">${escapeHtml(roleLabel)}</span>`;
    nameEl.title = `${user.nombreCompleto} · ${roleLabel}`;
  }
  if (roleEl) roleEl.textContent = user.rol;

  const actions = qs('.dash-header .nav-actions');
  const logoutBtn = qs('[data-logout]');
  if (actions && logoutBtn && !qs('[data-back-home]', actions)) {
    const homeLink = document.createElement('a');
    homeLink.href = appPath('index.html');
    homeLink.className = 'btn ghost small';
    homeLink.dataset.backHome = '';
    homeLink.textContent = 'Inicio';
    actions.insertBefore(homeLink, logoutBtn);
  }

  const nav = qs('[data-dashboard-nav]');
  if (nav && navItems?.length) {
    nav.innerHTML = navItems
      .map(
        (item) => `
      <a href="${appPath(item.href)}" class="dash-nav-link${item.label === activeLabel ? ' active' : ''}">
        <span class="dash-nav-icon" aria-hidden="true">${item.icon}</span>
        <span>${item.label}</span>
      </a>`,
      )
      .join('');
  }

  qs('[data-logout]')?.addEventListener('click', (e) => {
    e.preventDefault();
    logout('pages/login.html');
  });

  const toggle = qs('[data-dash-menu-toggle]');
  const mobileNav = qs('[data-dash-mobile-nav]');
  toggle?.addEventListener('click', () => {
    const open = mobileNav?.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(Boolean(open)));
  });
}
