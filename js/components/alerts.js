/**
 * ==============================================================================
 * MEDIFLOW NOTIFICACIONES — ALERTAS Y TOASTS EMPRESARIALES
 * Sistema de alertas en contenedor y notificaciones toast flotantes no intrusivas
 * ==============================================================================
 */

import { icon } from './icons.js';

const TYPE_ICONS = {
  error: 'alert-circle',
  danger: 'alert-circle',
  success: 'check-circle',
  warning: 'alert-circle',
  info: 'bell',
};

/**
 * Muestra una alerta estática dentro de un contenedor específico
 * @param {HTMLElement} container
 * @param {string} message
 * @param {'error'|'success'|'warning'|'info'} [type='error']
 */
export function showAlert(container, message, type = 'error') {
  if (!container) return;
  const iconName = TYPE_ICONS[type] || 'alert-circle';
  const iconSvg = icon(iconName, { size: 18, className: 'alert-icon' });
  container.innerHTML = `
    <div class="alert alert-${type}" role="alert">
      <span class="alert-icon-wrap" aria-hidden="true">${iconSvg}</span>
      <div class="alert-content">${message}</div>
    </div>
  `;
}

/**
 * Limpia la alerta del contenedor
 * @param {HTMLElement} container
 */
export function clearAlert(container) {
  if (container) container.innerHTML = '';
}

/**
 * Muestra una notificación flotante (Toast)
 * @param {string} message - Mensaje a mostrar
 * @param {'info'|'success'|'warning'|'error'} [type='info'] - Tipo visual
 * @param {number} [duration=4000] - Tiempo de visualización en ms (0 para infinito)
 */
export function showToast(message, type = 'info', duration = 4000) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.setAttribute('aria-live', 'polite');
    container.setAttribute('aria-atomic', 'true');
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.setAttribute('role', 'status');

  const iconName = TYPE_ICONS[type] || 'bell';
  const iconSvg = icon(iconName, { size: 18 });
  const closeSvg = icon('x', { size: 14 });

  toast.innerHTML = `
    <span class="toast-icon" aria-hidden="true">${iconSvg}</span>
    <span class="toast-message">${message}</span>
    <button type="button" class="toast-close" aria-label="Cerrar notificación">${closeSvg}</button>
  `;

  const closeBtn = toast.querySelector('.toast-close');
  const dismiss = () => {
    toast.classList.add('toast-hide');
    setTimeout(() => {
      toast.remove();
      if (container && container.children.length === 0) {
        container.remove();
      }
    }, 200);
  };

  closeBtn?.addEventListener('click', dismiss);

  if (duration > 0) {
    setTimeout(dismiss, duration);
  }

  container.appendChild(toast);
}
