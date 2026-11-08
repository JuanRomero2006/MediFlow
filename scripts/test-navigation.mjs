/**
 * MEDIFLOW — SUITE DE PRUEBAS DE ARQUITECTURA DE LAYOUT Y NAVEGACIÓN (ETAPA 3)
 * Prueba unitaria sin dependencias externas (Node.js nativo).
 */

import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import fs from 'node:fs/promises';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

let passed = 0;
let failed = 0;

function assert(description, condition) {
  if (condition) {
    passed++;
    console.log(`  PASS: ${description}`);
  } else {
    failed++;
    console.error(`  FAIL: ${description}`);
  }
}

console.log('\n--- 1. VALIDACIÓN ESTÁTICA DE PLANTILLAS GENERADAS (gen_pages.py) ---');

const patientHtml = await fs.readFile(path.join(root, 'pages/paciente/dashboard.html'), 'utf8');
const receptionHtml = await fs.readFile(path.join(root, 'pages/recepcion/dashboard.html'), 'utf8');
const doctorHtml = await fs.readFile(path.join(root, 'pages/medico/dashboard.html'), 'utf8');
const adminHtml = await fs.readFile(path.join(root, 'pages/administrador/dashboard.html'), 'utf8');
const tvHtml = await fs.readFile(path.join(root, 'pages/recepcion/pantalla-turnos.html'), 'utf8');

// Comprobaciones estructurales
assert('Paciente dashboard contiene app-shell', patientHtml.includes('id="app-shell"'));
assert('Paciente dashboard contiene app-sidebar', patientHtml.includes('id="app-sidebar"'));
assert('Paciente dashboard contiene sidebar-backdrop', patientHtml.includes('id="sidebar-backdrop"'));
assert('Paciente dashboard contiene app-topbar', patientHtml.includes('class="app-topbar"'));
assert('Paciente dashboard contiene breadcrumbs', patientHtml.includes('id="topbar-breadcrumbs"'));
assert('Paciente dashboard contiene profile dropdown', patientHtml.includes('id="profile-dropdown"'));
assert('Paciente dashboard contiene sidebar-collapse-toggle', patientHtml.includes('id="sidebar-collapse-toggle"'));
assert('Paciente dashboard contiene sidebar-mobile-toggle', patientHtml.includes('id="sidebar-mobile-toggle"'));
assert('Paciente dashboard contiene data-dashboard-nav', patientHtml.includes('data-dashboard-nav'));
assert('Paciente dashboard no tiene navegación móvil duplicada', !patientHtml.includes('dash-mobile-nav'));

assert('Recepción dashboard contiene app-shell y sidebar', receptionHtml.includes('id="app-shell"') && receptionHtml.includes('id="app-sidebar"'));
assert('Médico dashboard contiene app-shell y sidebar', doctorHtml.includes('id="app-shell"') && doctorHtml.includes('id="app-sidebar"'));
assert('Administrador dashboard contiene app-shell y sidebar', adminHtml.includes('id="app-shell"') && adminHtml.includes('id="app-sidebar"'));
assert('Pantalla de turnos TV contiene app-shell y sidebar', tvHtml.includes('id="app-shell"') && tvHtml.includes('id="app-sidebar"'));

console.log('\n--- 2. VALIDACIÓN DE COMPONENTES JS Y LÓGICA DE NAVEGACIÓN ---');

// Mock DOM nativo mínimo para ejecutar sidebar.js
class MockElement {
  constructor(tagName = 'div', id = '') {
    this.tagName = tagName;
    this.id = id;
    this._classes = new Set();
    this.classList = {
      add: (c) => this._classes.add(c),
      remove: (c) => this._classes.delete(c),
      toggle: (c, force) => {
        if (force !== undefined) {
          if (force) this._classes.add(c);
          else this._classes.delete(c);
          return force;
        }
        if (this._classes.has(c)) { this._classes.delete(c); return false; }
        this._classes.add(c); return true;
      },
      contains: (c) => this._classes.has(c),
    };
    this.attributes = new Map();
    this.listeners = new Map();
    this.innerHTML = '';
    this.textContent = '';
    this.hidden = false;
    this.children = [];
    this.dataset = {};
  }
  querySelector(sel) { return null; }
  querySelectorAll(sel) { return []; }
  setAttribute(k, v) { this.attributes.set(k, String(v)); }
  getAttribute(k) { return this.attributes.get(k) || null; }
  addEventListener(event, fn) {
    if (!this.listeners.has(event)) this.listeners.set(event, []);
    this.listeners.get(event).push(fn);
  }
  click() {
    const list = this.listeners.get('click') || [];
    for (const fn of list) fn({ target: this, preventDefault: () => {}, stopPropagation: () => {} });
  }
}

// Configurar entorno simulado
const mockDocument = {
  body: new MockElement('body'),
  documentElement: { dataset: { appRoot: '../../' } },
  elements: new Map(),
  addEventListener: () => {},
  querySelector: (sel) => mockDocument.elements.get(sel) || null,
  querySelectorAll: (sel) => {
    const found = [];
    for (const [k, el] of mockDocument.elements.entries()) {
      if (k === sel || el.tagName.toLowerCase() === sel) found.push(el);
    }
    return found;
  }
};

const mockLocalStorage = {
  data: new Map(),
  getItem: (k) => mockLocalStorage.data.get(k) || null,
  setItem: (k, v) => mockLocalStorage.data.set(k, String(v)),
};

// Crear elementos de prueba requeridos por sidebar.js
const elShell = new MockElement('div', 'app-shell');
const elSidebar = new MockElement('aside', 'app-sidebar');
const elBackdrop = new MockElement('div', 'sidebar-backdrop');
const elCollapseBtn = new MockElement('button', 'sidebar-collapse-toggle');
const elMobileToggleBtn = new MockElement('button', 'sidebar-mobile-toggle');
const elMobileCloseBtn = new MockElement('button', 'sidebar-mobile-close');
const elNav = new MockElement('nav');
elNav.setAttribute('data-dashboard-nav', '');
const elBreadcrumbs = new MockElement('nav', 'topbar-breadcrumbs');
const elProfileTrigger = new MockElement('button', 'topbar-profile-trigger');
const elProfileDropdown = new MockElement('div', 'profile-dropdown');
elProfileDropdown.hidden = true;
const elAvatar = new MockElement('div');
const elUserNameText = new MockElement('span');
const elUserRoleText = new MockElement('span');
const elLogoutBtn = new MockElement('button');

mockDocument.elements.set('#app-shell', elShell);
mockDocument.elements.set('.dash-shell', elShell);
mockDocument.elements.set('#app-sidebar', elSidebar);
mockDocument.elements.set('.dash-sidebar', elSidebar);
mockDocument.elements.set('#sidebar-backdrop', elBackdrop);
mockDocument.elements.set('#sidebar-collapse-toggle', elCollapseBtn);
mockDocument.elements.set('#sidebar-mobile-toggle', elMobileToggleBtn);
mockDocument.elements.set('#sidebar-mobile-close', elMobileCloseBtn);
mockDocument.elements.set('[data-dashboard-nav]', elNav);
mockDocument.elements.set('#topbar-breadcrumbs', elBreadcrumbs);
mockDocument.elements.set('#topbar-profile-trigger', elProfileTrigger);
mockDocument.elements.set('#profile-dropdown', elProfileDropdown);
mockDocument.elements.set('[data-user-avatar]', elAvatar);
mockDocument.elements.set('[data-user-avatar-top]', elAvatar);
mockDocument.elements.set('[data-user-name-text]', elUserNameText);
mockDocument.elements.set('[data-user-role-text]', elUserRoleText);
mockDocument.elements.set('[data-logout]', elLogoutBtn);

global.window = {
  innerWidth: 1200,
  addEventListener: () => {},
  removeEventListener: () => {},
};
global.document = mockDocument;
global.localStorage = mockLocalStorage;

const sidebarModuleUrl = pathToFileURL(path.join(root, 'js/components/sidebar.js')).href;
const { initDashboardChrome } = await import(sidebarModuleUrl);

const testUser = {
  id: 1,
  nombres: 'Carlos',
  apellidos: 'Pérez',
  nombreCompleto: 'Carlos Pérez',
  email: 'carlos.perez@previred.com',
  rol: 'paciente',
  pacienteId: 1
};

const testNav = [
  { label: 'Dashboard', href: 'pages/paciente/dashboard.html', icon: '▣' },
  { label: 'Mis citas', href: 'pages/paciente/citas.html', icon: '📅' },
  { label: 'Turnos', href: 'pages/paciente/turnos.html', icon: '🎫' },
  { label: 'Mi perfil', href: 'pages/paciente/perfil.html', icon: '👤' },
];

initDashboardChrome({ user: testUser, navItems: testNav, activeLabel: 'Mis citas' });

// Validaciones
assert('initDashboardChrome asigna clase dash-role-paciente al body', mockDocument.body.classList.contains('dash-role-paciente'));
assert('Navegación genera enlaces para los 4 módulos', elNav.innerHTML.includes('Mis citas') && elNav.innerHTML.includes('Dashboard'));
assert('Enlace activo tiene aria-current="page"', elNav.innerHTML.includes('aria-current="page"'));
assert('Breadcrumbs generados con "MediFlow", "Paciente" y "Mis citas"', elBreadcrumbs.innerHTML.includes('MediFlow') && elBreadcrumbs.innerHTML.includes('Paciente') && elBreadcrumbs.innerHTML.includes('Mis citas'));

// Probar colapso
assert('Shell inicialmente no está colapsado', !elShell.classList.contains('sidebar-collapsed'));
elCollapseBtn.click();
assert('Clic en toggle agrega clase sidebar-collapsed', elShell.classList.contains('sidebar-collapsed'));
assert('localStorage guardó mediflow_sidebar_collapsed = true', mockLocalStorage.getItem('mediflow_sidebar_collapsed') === 'true');
elCollapseBtn.click();
assert('Segundo clic remueve clase sidebar-collapsed', !elShell.classList.contains('sidebar-collapsed'));

// Probar drawer móvil
assert('Sidebar no está abierto en móvil al inicio', !elSidebar.classList.contains('mobile-open'));
elMobileToggleBtn.click();
assert('Clic en botón móvil abre sidebar (mobile-open)', elSidebar.classList.contains('mobile-open'));
assert('Backdrop se activa (mobile-open)', elBackdrop.classList.contains('mobile-open'));
assert('Body adquiere drawer-open para evitar doble scroll', mockDocument.body.classList.contains('drawer-open'));
elMobileCloseBtn.click();
assert('Botón cerrar remueve mobile-open del sidebar', !elSidebar.classList.contains('mobile-open'));
assert('Botón cerrar remueve drawer-open del body', !mockDocument.body.classList.contains('drawer-open'));

// Probar dropdown de perfil
assert('Dropdown de perfil cerrado al inicio', elProfileDropdown.hidden === true);
elProfileTrigger.click();
assert('Clic en perfil abre dropdown (hidden = false)', elProfileDropdown.hidden === false);

console.log('\n--- 3. PRUEBAS DE REGRESIÓN DE AUTENTICACIÓN ---');
const authModuleUrl = pathToFileURL(path.join(root, 'js/services/auth.js')).href;
const { ROLE_PATHS, normalizeRole } = await import(authModuleUrl);
assert('ROLE_PATHS para paciente sigue intacto', ROLE_PATHS.paciente === 'pages/paciente/dashboard.html');
assert('ROLE_PATHS para recepción sigue intacto', ROLE_PATHS.recepcion === 'pages/recepcion/dashboard.html');
assert('ROLE_PATHS para médico sigue intacto', ROLE_PATHS.medico === 'pages/medico/dashboard.html');
assert('ROLE_PATHS para administrador sigue intacto', ROLE_PATHS.administrador === 'pages/administrador/dashboard.html');
assert('Normalización de recepcionista funciona', normalizeRole('recepcionista') === 'recepcion');
assert('Normalización de superadmin funciona', normalizeRole('superadmin') === 'administrador');

console.log(`\n========================================`);
console.log(`RESULTADOS: ${passed} pruebas superadas, ${failed} fallos.`);
console.log(`========================================\n`);

process.exit(failed ? 1 : 0);
