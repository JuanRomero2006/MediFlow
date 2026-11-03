/**
 * Punto central de las peticiones HTTP al backend (carpeta api/ en XAMPP).
 *
 * Reglas:
 *  - Las respuestas del servidor siempre son JSON: { ok: true, ... } o { ok: false, error }.
 *  - Si algo sale mal, apiFetch lanza un Error con el mensaje que mostrará la interfaz.
 *  - En peticiones POST se envía el token CSRF en el encabezado X-CSRF-Token.
 */

import { appPath } from '../utils/helpers.js';

let csrfToken = null;

async function getCsrfToken() {
  if (!csrfToken) {
    const response = await fetch(appPath('api/csrf.php'), { credentials: 'same-origin' });
    const data = await response.json();
    csrfToken = data.token;
  }
  return csrfToken;
}

export async function apiFetch(path, options = {}) {
  const method = (options.method || 'GET').toUpperCase();
  const config = {
    method,
    credentials: 'same-origin', // envía la cookie de sesión de PHP
    headers: { Accept: 'application/json' },
  };

  if (method !== 'GET') {
    config.headers['Content-Type'] = 'application/json';
    config.headers['X-CSRF-Token'] = await getCsrfToken();
    config.body = JSON.stringify(options.body || {});
  }

  let response;
  try {
    response = await fetch(appPath(`api/${path}`), config);
  } catch {
    throw new Error('No hay conexión con el servidor. ¿Apache está iniciado en XAMPP?');
  }

  // Token vencido (la sesión se reinició): se pide uno nuevo y se reintenta una vez.
  if (response.status === 419 && !options.reintento) {
    csrfToken = null;
    return apiFetch(path, { ...options, reintento: true });
  }

  const data = await response.json().catch(() => null);
  if (!response.ok || !data?.ok) {
    throw new Error(data?.error || `Error del servidor (${response.status}).`);
  }
  return data;
}

export function isBackendEnabled() {
  return true;
}
