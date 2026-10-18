/**
 * Punto central para futuras peticiones HTTP al backend.
 * Actualmente no hay API conectada.
 */

const API_BASE = '';

export async function apiFetch(path, options = {}) {
  if (!API_BASE) {
    throw new Error('Backend no configurado. Use los servicios locales de demostración.');
  }
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Error HTTP ${response.status}`);
  }
  return response.json();
}

export function isBackendEnabled() {
  return Boolean(API_BASE);
}
