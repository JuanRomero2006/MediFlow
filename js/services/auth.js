import {
  findDemoUserByIdentifier,
  findDemoUserById,
} from '../../data/demo-users.js';
import {
  getSessionItem,
  setSessionItem,
  removeSessionItem,
} from '../utils/storage.js';
import { fullName } from '../utils/formatters.js';
import { appPath } from '../utils/helpers.js';

const SESSION_KEY = 'session';
const DEMO_SALT = 'mediflow-demo-v1';
const SESSION_TTL_MS = 8 * 60 * 60 * 1000;

export const ROLE_PATHS = {
  paciente: 'pages/paciente/dashboard.html',
  recepcion: 'pages/recepcion/dashboard.html',
  medico: 'pages/medico/dashboard.html',
  administrador: 'pages/administrador/dashboard.html',
};

async function hashValue(value) {
  const data = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function hashPassword(password) {
  return hashValue(`${DEMO_SALT}:${password}`);
}

async function signSession(userId, issuedAt) {
  return hashValue(`${DEMO_SALT}:session:${userId}:${issuedAt}`);
}

export function normalizeRole(rol) {
  if (rol === 'recepcionista') return 'recepcion';
  return rol;
}

function toPublicUser(user) {
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    nombres: user.nombres,
    apellidos: user.apellidos,
    nombreCompleto: fullName(user),
    rol: normalizeRole(user.rol),
    medicoId: user.medicoId || null,
    pacienteId: user.pacienteId || null,
  };
}

async function validateSessionRecord(session) {
  if (!session?.userId || !session?.issuedAt || !session?.signature) return null;
  if (Date.now() - session.issuedAt > SESSION_TTL_MS) return null;

  const expected = await signSession(session.userId, session.issuedAt);
  if (expected !== session.signature) return null;

  const user = findDemoUserById(session.userId);
  if (!user) return null;

  return toPublicUser(user);
}

export async function login(identifier, password) {
  const user = findDemoUserByIdentifier(identifier);
  if (!user) {
    return { ok: false, error: 'No encontramos una cuenta con esos datos.' };
  }

  const passwordHash = await hashPassword(password);
  if (passwordHash !== user.passwordHash) {
    return { ok: false, error: 'Contraseña incorrecta. Verifica e intenta de nuevo.' };
  }

  const issuedAt = Date.now();
  const signature = await signSession(user.id, issuedAt);
  const saved = setSessionItem(SESSION_KEY, {
    userId: user.id,
    issuedAt,
    signature,
  });

  if (!saved) {
    return { ok: false, error: 'No fue posible guardar la sesión en este navegador.' };
  }

  return { ok: true, user: toPublicUser(user) };
}

export async function getCurrentUser() {
  const session = getSessionItem(SESSION_KEY);
  return validateSessionRecord(session);
}

export function redirectByRole(rol) {
  const role = normalizeRole(rol);
  const path = ROLE_PATHS[role];
  if (!path) {
    throw new Error(`Rol no soportado: ${rol}`);
  }
  window.location.href = appPath(path);
}

export async function logout(loginRelative = 'pages/login.html') {
  removeSessionItem(SESSION_KEY);
  window.location.href = appPath(loginRelative);
}

export async function requireAuth(allowedRoles = [], options = {}) {
  const loginUrl = options.loginUrl || appPath('pages/login.html');
  const user = await getCurrentUser();

  if (!user) {
    window.location.href = loginUrl;
    return null;
  }

  if (allowedRoles.length && !allowedRoles.includes(user.rol)) {
    if (options.deniedUrl) {
      window.location.href = options.deniedUrl;
    } else {
      redirectByRole(user.rol);
    }
    return null;
  }

  return user;
}
