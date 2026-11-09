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
const patientTurnsHtml = await fs.readFile(path.join(root, 'pages/paciente/turnos.html'), 'utf8');
const patientScript = await fs.readFile(path.join(root, 'js/pages/paciente.js'), 'utf8');
const receptionScript = await fs.readFile(path.join(root, 'js/pages/recepcion.js'), 'utf8');
const turnosApi = await fs.readFile(path.join(root, 'api/turnos.php'), 'utf8');
const turnosService = await fs.readFile(path.join(root, 'js/services/turnos.js'), 'utf8');
const revealScript = await fs.readFile(path.join(root, 'js/components/scroll-reveal.js'), 'utf8');
const designSystemCss = await fs.readFile(path.join(root, 'css/design-system.css'), 'utf8');
const publicPagesCss = await fs.readFile(path.join(root, 'css/pages/public-pages.css'), 'utf8');
const catalogApi = await fs.readFile(path.join(root, 'api/catalogo.php'), 'utf8');
const apiHelpers = await fs.readFile(path.join(root, 'api/config/funciones.php'), 'utf8');
const bookingScript = await fs.readFile(path.join(root, 'js/pages/agendar.js'), 'utf8');
const bookingCss = await fs.readFile(path.join(root, 'css/pages/agendar.css'), 'utf8');
const demoScheduleSql = await fs.readFile(path.join(root, 'database/04_horarios_demo.sql'), 'utf8');
const databaseSchema = await fs.readFile(path.join(root, 'database/01_clinica_previred.sql'), 'utf8');
const { nextDays } = await import(pathToFileURL(path.join(root, 'js/utils/helpers.js')).href);

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
assert('Los cuatro dashboards usan bienvenida y navegación por rol', [patientHtml, receptionHtml, doctorHtml, adminHtml].every((html) => html.includes('class="dashboard-welcome"')));
assert('Recepción muestra turnos con datos del backend', receptionHtml.includes('data-stat-turnos') && receptionScript.includes("listTurnosBackend({ fecha: todayISO() })"));
assert('Errores de consulta de turnos se muestran en el dashboard', receptionScript.includes('No fue posible consultar los turnos'));
assert('Paciente dispone de check-in virtual para citas activas de hoy', patientTurnsHtml.includes('data-checkin-citas') && patientScript.includes('crearTurnoVirtualBackend') && patientScript.includes("['pendiente', 'confirmada'].includes(cita.estado)"));
assert('API de check-in limita el turno a una cita propia del día', turnosApi.includes('"checkin_virtual"') && turnosApi.includes('(int) $cita["paciente_id"] !== (int) $usuario["pacienteId"]') && turnosApi.includes('(string) $cita["fecha_cita"] !== date("Y-m-d")'));
assert('Check-in es idempotente y la base impide turnos repetidos por cita', turnosApi.includes('WHERE t.cita_id = ? AND t.paciente_id = ? LIMIT 1') && turnosApi.includes('"Esta cita ya tiene un turno."') && databaseSchema.includes('UNIQUE KEY uq_turno_cita (cita_id)'));
assert('Servicio frontend envía check-in virtual al backend', turnosService.includes("body: { accion: 'checkin_virtual', citaId: Number(citaId) }"));
assert('El estado del turno del paciente se refresca automáticamente', patientScript.includes('setInterval(() => renderTurnos(user), 10000)'));
assert('Los números de turno se generan bajo bloqueo de la sede', turnosApi.includes('FOR UPDATE') && turnosApi.includes("MAX(CASE WHEN numero_turno REGEXP '^T[0-9]+$'"));
assert('Próximas citas de paciente excluyen citas pasadas y canceladas', patientScript.includes("c.fecha >= todayISO()") && patientScript.includes("!['cancelada', 'atendida', 'no_asistio'].includes(c.estado)"));
assert('Limitaciones clínicas se documentan en los dashboards', patientHtml.includes('historial clínico') && doctorHtml.includes('no persiste diagnósticos') && adminHtml.includes('reportes no están implementados'));
assert('Las animaciones al desplazarse usan IntersectionObserver y revelan cada elemento una sola vez', revealScript.includes('new IntersectionObserver') && revealScript.includes('currentObserver.unobserve(entry.target)'));
assert('Los elementos siguen visibles si IntersectionObserver no está disponible', revealScript.includes("!('IntersectionObserver' in window)") && designSystemCss.includes('html.motion-ready [data-scroll-reveal]:not(.is-visible)'));
assert('Las animaciones respetan prefers-reduced-motion', revealScript.includes("prefers-reduced-motion: reduce") && designSystemCss.includes('@media (prefers-reduced-motion: reduce)'));
assert('Las imágenes de tarjetas tienen zoom contenido', publicPagesCss.includes('.public-card:hover img{transform:scale(1.045)') && publicPagesCss.includes('overflow:hidden'));
assert('El selector consulta las fechas disponibles antes de habilitarlas', bookingScript.includes("tipo: 'fechas'") && bookingScript.includes('fechasDisponibles.has(d.iso)') && bookingScript.includes('disabled'));
assert('La API limita fechas al cupo restante por médico y franja', apiHelpers.includes('GROUP BY c.fecha_cita, c.hora_cita') && apiHelpers.includes('cargar_ocupacion_agendamiento'));
assert('La API ofrece disponibilidad por rango de fechas', catalogApi.includes('$tipo === "fechas"') && catalogApi.includes('generar_slots_agendamiento'));
assert('El endpoint horario incluye el día requerido por el cálculo de cupos', catalogApi.includes('SELECT hm.horario_id, hm.dia_semana, hm.hora_inicio'));
assert('El catálogo no ofrece profesionales sin horarios válidos activos', catalogApi.includes('JOIN horario_medico hm ON hm.medico_id = m.medico_id') && catalogApi.includes("hm.dia_semana IN ('Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo')"));
assert('El catálogo de especialidades solo cuenta médicos con agenda válida', catalogApi.includes('JOIN medico_especialidad me ON me.especialidad_id = e.especialidad_id') && catalogApi.includes('COUNT(DISTINCT m.medico_id) AS total_medicos'));
assert('Las fechas completas retornan al selector y actualizan la disponibilidad', bookingScript.includes('Ese día se ocupó mientras seleccionabas') && bookingScript.includes('state.availableDates = null'));
assert('Si un cupo se ocupa al confirmar, se refrescan los horarios y se bloquea el día completo', bookingScript.includes("error.message.includes('Ese horario acaba de ocuparse')") && bookingScript.includes('La fecha se quedó sin horarios disponibles'));
assert('Las fechas sin cupo se muestran desactivadas', bookingCss.includes('.date-card:disabled'));
const scheduleAssignments = demoScheduleSql.match(/FROM \(([\s\S]*?)\) AS asignacion/)?.[1] || '';
assert('El SQL habilita tres especialistas adicionales y desactiva horarios de día inválido', [
  'SELECT 3 AS medico_id, 2 AS especialidad_id, 1 AS sede_id',
  'UNION ALL SELECT 5, 4, 2',
  'UNION ALL SELECT 6, 3, 3',
  'UNION ALL SELECT 7, 1, 1',
].every((assignment) => scheduleAssignments.includes(assignment))
  && !/SELECT (?:8|9),/.test(scheduleAssignments)
  && demoScheduleSql.includes('SET activo = 0')
  && demoScheduleSql.includes("AND dia_semana = ''"));
const nextDateList = nextDays(3);
const expectedNext = new Date();
expectedNext.setDate(expectedNext.getDate() + 1);
const localIso = [expectedNext.getFullYear(), String(expectedNext.getMonth() + 1).padStart(2, '0'), String(expectedNext.getDate()).padStart(2, '0')].join('-');
assert('El selector genera fechas ISO locales consecutivas', nextDateList.length === 3 && nextDateList[0].iso === localIso && nextDateList[1].iso > nextDateList[0].iso);

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
