import { apiFetch } from './api.js';
import { appPath } from '../utils/helpers.js';

/**
 * Autenticación contra el backend PHP (api/login.php, api/me.php, api/logout.php).
 * La sesión vive en el servidor (cookie de PHP); el navegador ya no guarda la sesión.
 */

export const ROLE_PATHS = {
  paciente: 'pages/paciente/dashboard.html',
  recepcion: 'pages/recepcion/dashboard.html',
  medico: 'pages/medico/dashboard.html',
  administrador: 'pages/administrador/dashboard.html',
};

export function normalizeRole(rol) {
  if (rol === 'recepcionista') return 'recepcion';
  if (rol === 'superadmin') return 'administrador';
  return rol;
}

function toPublicUser(user) {
  return { ...user, rol: normalizeRole(user.rol) };
}

export async function login(identifier, password) {
  try {
    const data = await apiFetch('login.php', {
      method: 'POST',
      body: { identifier, password },
    });
    return { ok: true, user: toPublicUser(data.user) };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

export async function getCurrentUser() {
  try {
    const data = await apiFetch('me.php');
    return toPublicUser(data.user);
  } catch {
    return null; // sin sesión (o sin conexión): se trata como no autenticado
  }
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
  try {
    await apiFetch('logout.php', { method: 'POST' });
  } catch {
    // aunque falle la petición, se lleva al usuario al login
  }
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
