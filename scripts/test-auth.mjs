/**
 * Pruebas mínimas de autenticación de demostración (Node.js).
 * Ejecutar: npm run test:auth
 */
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');

class MemoryStorage {
  constructor() {
    this.store = new Map();
  }
  getItem(key) {
    return this.store.has(key) ? this.store.get(key) : null;
  }
  setItem(key, value) {
    this.store.set(key, String(value));
  }
  removeItem(key) {
    this.store.delete(key);
  }
}

const sessionStorage = new MemoryStorage();
const localStorage = new MemoryStorage();
const location = { href: '' };

global.sessionStorage = sessionStorage;
global.localStorage = localStorage;
global.window = { location, document: { documentElement: { dataset: {} } } };
global.document = {
  documentElement: { dataset: {} },
  body: { dataset: {} },
};

const authUrl = pathToFileURL(path.join(projectRoot, 'js/services/auth.js')).href;
const { login, getCurrentUser, logout, requireAuth, ROLE_PATHS, normalizeRole } = await import(authUrl);

const PASS = 'MediFlow2026';
let passed = 0;
let failed = 0;

function assert(name, condition) {
  if (condition) {
    passed += 1;
    console.log(`OK  ${name}`);
  } else {
    failed += 1;
    console.error(`FAIL ${name}`);
  }
}

async function run() {
  sessionStorage.store.clear();

  const paciente = await login('paciente.demo@previred.demo', PASS);
  assert('paciente login ok', paciente.ok && paciente.user.rol === 'paciente');
  const current = await getCurrentUser();
  assert('getCurrentUser after login', current?.email === 'paciente.demo@previred.demo');

  sessionStorage.store.clear();
  const recepcion = await login('recepcion.demo@previred.demo', PASS);
  assert('recepcion login ok', recepcion.ok && recepcion.user.rol === 'recepcion');

  sessionStorage.store.clear();
  const medico = await login('medico.demo@previred.demo', PASS);
  assert('medico login ok', medico.ok && medico.user.rol === 'medico');

  sessionStorage.store.clear();
  const admin = await login('admin.demo@previred.demo', PASS);
  assert('admin login ok', admin.ok && admin.user.rol === 'administrador');

  sessionStorage.store.clear();
  const badPass = await login('paciente.demo@previred.demo', 'wrong');
  assert('wrong password rejected', !badPass.ok);

  sessionStorage.store.clear();
  const missing = await login('noexiste@previred.demo', PASS);
  assert('unknown user rejected', !missing.ok);

  sessionStorage.store.clear();
  await login('paciente.demo@previred.demo', PASS);
  const userPac = await getCurrentUser();
  const denied = await requireAuth(['medico']);
  assert('paciente blocked from medico panel', denied === null && userPac?.rol === 'paciente');

  sessionStorage.store.clear();
  const noSession = await requireAuth(['paciente']);
  assert('no session redirects (null user)', noSession === null);

  sessionStorage.store.clear();
  await login('paciente.demo@previred.demo', PASS);
  await logout();
  assert('logout clears session', (await getCurrentUser()) === null);

  sessionStorage.store.clear();
  await login('paciente.demo@previred.demo', PASS);
  const afterReload = await getCurrentUser();
  assert('session persists while valid', afterReload?.rol === 'paciente');

  assert('ROLE_PATHS paciente', ROLE_PATHS.paciente.includes('paciente/dashboard'));
  assert('ROLE_PATHS administrador', ROLE_PATHS.administrador.includes('administrador'));
  assert('normalize recepcionista', normalizeRole('recepcionista') === 'recepcion');

  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
