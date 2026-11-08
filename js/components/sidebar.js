/**
 * ==============================================================================
 * MEDIFLOW LAYOUT & NAVIGATION ARCHITECTURE (ETAPA 3)
 * Manejo unificado del Shell, Sidebar colapsable, Topbar ejecutiva, Breadcrumbs,
 * Menú de perfil y Drawer móvil accesible.
 * ==============================================================================
 */

import { appPath, qs, qsa, escapeHtml } from '../utils/helpers.js';
import { logout } from '../services/auth.js';
import { icon, resolveIconName } from './icons.js';

const ROLE_LABELS = {
  paciente: 'Paciente',
  recepcion: 'Recepción',
  medico: 'Médico',
  administrador: 'Administrador',
};

const ROLE_PROFILE_PATHS = {
  paciente: 'pages/paciente/perfil.html',
  recepcion: 'pages/recepcion/dashboard.html',
  medico: 'pages/medico/dashboard.html',
  administrador: 'pages/administrador/dashboard.html',
};

/**
 * Calcula las iniciales del usuario para el avatar
 */
function getInitials(user) {
  if (user.nombres && user.apellidos) {
    return `${user.nombres[0] || ''}${user.apellidos[0] || ''}`.toUpperCase();
  }
  if (user.nombreCompleto) {
    const parts = user.nombreCompleto.replace(/^(Dr\.|Dra\.)\s*/i, '').trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0] || ''}${parts[1][0] || ''}`.toUpperCase();
    }
    return (parts[0] ? parts[0].slice(0, 2) : 'MF').toUpperCase();
  }
  return 'MF';
}

/**
 * Inicializa la arquitectura de layout y navegación de MediFlow
 * @param {object} params
 * @param {object} params.user - Usuario autenticado
 * @param {Array<{label: string, href: string, icon: string}>} params.navItems - Enlaces del rol
 * @param {string} params.activeLabel - Nombre de la sección activa
 */
export function initDashboardChrome({ user, navItems, activeLabel }) {
  document.body.classList.add(`dash-role-${user.rol}`);

  const roleLabel = ROLE_LABELS[user.rol] || user.rol;
  const initials = getInitials(user);

  // 1. Identificación y Avatares de Usuario
  qsa('[data-user-avatar], [data-user-avatar-top]').forEach((el) => {
    el.textContent = initials;
  });

  qsa('[data-user-name-text], [data-topbar-user-name], [data-dropdown-user-name]').forEach((el) => {
    el.textContent = user.nombreCompleto || `${user.nombres || ''} ${user.apellidos || ''}`.trim();
  });

  qsa('[data-user-role-text], [data-topbar-user-role], [data-sidebar-role-label]').forEach((el) => {
    el.textContent = roleLabel;
  });

  qsa('[data-dropdown-user-email]').forEach((el) => {
    el.textContent = user.email || `${user.username || 'usuario'}@mediflow.local`;
  });

  // Compatibilidad legacy con selectores [data-user-name] y [data-user-role]
  const legacyNameEl = qs('[data-user-name]');
  if (legacyNameEl && !legacyNameEl.querySelector('.dash-user-name')) {
    legacyNameEl.innerHTML = `
      <span class="dash-user-name">${escapeHtml(user.nombreCompleto)}</span>
      <span class="dash-user-role">${escapeHtml(roleLabel)}</span>
    `;
  }

  // 2. Renderizado de Navegación del Sidebar
  const navContainers = qsa('[data-dashboard-nav]');
  if (navContainers.length && navItems?.length) {
    const navHtml = navItems
      .map((item, index) => {
        const iconName = resolveIconName(item.icon, item.label);
        const iconSvg = icon(iconName, { size: 19 });
        const isActive = item.label === activeLabel;
        const section = index === 0 ? '<span class="sidebar-nav-section">Principal</span>' :
          (index === 1 ? '<span class="sidebar-nav-section">Gestión</span>' : '');
        return `${section}
          <a href="${appPath(item.href)}" 
             class="dash-nav-link${isActive ? ' active' : ''}" 
             ${isActive ? 'aria-current="page"' : ''}
             aria-label="${escapeHtml(item.label)}"
             title="${escapeHtml(item.label)}"
             data-nav-item="${escapeHtml(item.label)}">
            <span class="dash-nav-icon" aria-hidden="true">${iconSvg}</span>
            <span class="dash-nav-label">${escapeHtml(item.label)}</span>
            ${isActive ? '<span class="active-indicator" aria-hidden="true"></span>' : ''}
          </a>`;
      })
      .join('');

    navContainers.forEach((container) => {
      container.innerHTML = navHtml;
    });
  }

  // 3. Generación Dinámica de Breadcrumbs
  renderBreadcrumbs(roleLabel, activeLabel);

  // 4. Configurar Estado Colapsable del Sidebar (Desktop)
  setupSidebarCollapse();

  // 5. Configurar Drawer Móvil y Overlay
  setupMobileDrawer();

  // 6. Configurar Dropdown de Perfil en Topbar
  setupProfileDropdown(user);

  // 7. Enlace a "Mi Perfil" en el Dropdown
  const profileLink = qs('#dropdown-profile-link');
  if (profileLink) {
    const profilePath = ROLE_PROFILE_PATHS[user.rol];
    if (profilePath) {
      profileLink.href = appPath(profilePath);
    } else {
      profileLink.style.display = 'none';
    }
  }

  // 8. Botones de Cierre de Sesión
  qsa('[data-logout]').forEach((btn) => {
    if (!btn.dataset.boundLogout) {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        logout('pages/login.html');
      });
      btn.dataset.boundLogout = 'true';
    }
  });
}

/**
 * Genera el breadcrumb dinámico en la barra superior
 */
function renderBreadcrumbs(roleLabel, activeLabel) {
  const container = qs('#topbar-breadcrumbs');
  if (!container) return;

  const chevronSvg = icon('chevron-right', { size: 14, className: 'breadcrumb-sep' });

  container.innerHTML = `
    <ol class="breadcrumb-list">
      <li class="breadcrumb-item">
        <a href="${appPath('index.html')}" class="breadcrumb-link" title="Ir al inicio">MediFlow</a>
      </li>
      <li class="breadcrumb-separator" aria-hidden="true">${chevronSvg}</li>
      <li class="breadcrumb-item">
        <span class="breadcrumb-text">${escapeHtml(roleLabel)}</span>
      </li>
      <li class="breadcrumb-separator" aria-hidden="true">${chevronSvg}</li>
      <li class="breadcrumb-item active" aria-current="page">
        <span class="breadcrumb-current">${escapeHtml(activeLabel)}</span>
      </li>
    </ol>
  `;
}

/**
 * Controla el colapso/expansión del Sidebar en escritorio con persistencia
 */
function setupSidebarCollapse() {
  const shell = qs('#app-shell') || qs('.dash-shell');
  const toggleBtn = qs('#sidebar-collapse-toggle');
  if (!toggleBtn || !shell) return;

  const STORAGE_KEY = 'mediflow_sidebar_collapsed';
  let isCollapsed = false;
  try { isCollapsed = localStorage.getItem(STORAGE_KEY) === 'true'; } catch { /* El menú sigue funcionando sin almacenamiento local. */ }

  const setCollapsed = (collapsed) => {
    shell.classList.toggle('sidebar-collapsed', collapsed);
    toggleBtn.setAttribute('aria-expanded', String(!collapsed));
    toggleBtn.setAttribute('title', collapsed ? 'Expandir menú lateral' : 'Contraer menú lateral');
    toggleBtn.innerHTML = icon(collapsed ? 'chevron-right' : 'chevron-left', { size: 16 });
    try { localStorage.setItem(STORAGE_KEY, String(collapsed)); } catch { /* Persistencia opcional. */ }
  };

  // Inicializar estado previo
  if (isCollapsed && window.innerWidth >= 1024) {
    setCollapsed(true);
  }

  toggleBtn.addEventListener('click', () => {
    const current = shell.classList.contains('sidebar-collapsed');
    setCollapsed(!current);
  });
}

/**
 * Controla el menú drawer para móvil con overlay y cierre accesible
 */
function setupMobileDrawer() {
  const sidebar = qs('#app-sidebar') || qs('.dash-sidebar');
  const backdrop = qs('#sidebar-backdrop');
  const openBtn = qs('#sidebar-mobile-toggle') || qs('[data-dash-menu-toggle]');
  const closeBtn = qs('#sidebar-mobile-close');

  if (!sidebar) return;

  const openDrawer = () => {
    sidebar.classList.add('mobile-open');
    backdrop?.classList.add('mobile-open');
    document.body.classList.add('drawer-open');
    openBtn?.setAttribute('aria-expanded', 'true');
    if (typeof closeBtn?.focus === 'function') closeBtn.focus();
  };

  const closeDrawer = () => {
    sidebar.classList.remove('mobile-open');
    backdrop?.classList.remove('mobile-open');
    document.body.classList.remove('drawer-open');
    openBtn?.setAttribute('aria-expanded', 'false');
    if (document.activeElement === closeBtn && typeof openBtn?.focus === 'function') openBtn.focus();
  };

  openBtn?.addEventListener('click', openDrawer);
  closeBtn?.addEventListener('click', closeDrawer);
  backdrop?.addEventListener('click', closeDrawer);

  // Cierre con la tecla Escape
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && sidebar.classList.contains('mobile-open')) {
      closeDrawer();
    }
  });

  // Cerrar drawer al hacer clic en un enlace de navegación
  sidebar.querySelectorAll('.dash-nav-link').forEach((link) => {
    link.addEventListener('click', () => {
      if (window.innerWidth < 1024) {
        closeDrawer();
      }
    });
  });
}

/**
 * Controla el menú desplegable del perfil en la barra superior
 */
function setupProfileDropdown(user) {
  const trigger = qs('#topbar-profile-trigger');
  const dropdown = qs('#profile-dropdown');
  if (!trigger || !dropdown) return;

  const toggleDropdown = (show) => {
    const isShown = show !== undefined ? show : dropdown.hidden;
    dropdown.hidden = !isShown;
    trigger.setAttribute('aria-expanded', String(isShown));
  };

  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleDropdown();
  });

  // Cierre al hacer clic fuera del dropdown
  document.addEventListener('click', (e) => {
    if (!dropdown.hidden && !dropdown.contains(e.target) && !trigger.contains(e.target)) {
      toggleDropdown(false);
    }
  });

  // Cierre con Escape
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !dropdown.hidden) {
      toggleDropdown(false);
      trigger.focus();
    }
  });
}
