/**
 * ==============================================================================
 * MEDIFLOW ICONS SYSTEM — ICONOS LUCIDE EN SVG NATIVO
 * Proporciona iconografía médica y de producto SaaS con estilo Lucide (24x24, 2px stroke)
 * ==============================================================================
 */

const LUCIDE_ICONS = {
  // Brand / Clínica
  'heart-pulse': `
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
    <path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h4.27"/>
  `,
  'shield-plus': `
    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>
    <path d="M9 12h6"/>
    <path d="M12 9v6"/>
  `,

  // Navegación de Dashboards
  'layout-dashboard': `
    <rect width="7" height="9" x="3" y="3" rx="1"/>
    <rect width="7" height="5" x="14" y="3" rx="1"/>
    <rect width="7" height="9" x="14" y="12" rx="1"/>
    <rect width="7" height="5" x="3" y="16" rx="1"/>
  `,
  'calendar': `
    <path d="M8 2v4"/>
    <path d="M16 2v4"/>
    <rect width="18" height="18" x="3" y="4" rx="2"/>
    <path d="M3 10h18"/>
  `,
  'calendar-days': `
    <path d="M8 2v4"/>
    <path d="M16 2v4"/>
    <rect width="18" height="18" x="3" y="4" rx="2"/>
    <path d="M3 10h18"/>
    <path d="M8 14h.01"/>
    <path d="M12 14h.01"/>
    <path d="M16 14h.01"/>
    <path d="M8 18h.01"/>
    <path d="M12 18h.01"/>
    <path d="M16 18h.01"/>
  `,
  'ticket': `
    <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/>
    <path d="M13 5v2"/>
    <path d="M13 11v2"/>
    <path d="M13 17v2"/>
  `,
  'tv': `
    <rect width="20" height="15" x="2" y="7" rx="2"/>
    <polyline points="17 2 12 7 7 2"/>
  `,
  'users': `
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  `,
  'user': `
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  `,
  'stethoscope': `
    <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/>
    <path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/>
    <circle cx="20" cy="10" r="2"/>
  `,
  'settings': `
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
    <circle cx="12" cy="12" r="3"/>
  `,
  'home': `
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  `,
  'log-out': `
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" x2="9" y1="12" y2="12"/>
  `,

  // Acciones y Estados
  'check-circle': `
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  `,
  'clock': `
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  `,
  'alert-circle': `
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" x2="12" y1="8" y2="12"/>
    <line x1="12" x2="12.01" y1="16" y2="16"/>
  `,
  'x-circle': `
    <circle cx="12" cy="12" r="10"/>
    <path d="m15 9-6 6"/>
    <path d="m9 9 6 6"/>
  `,
  'x': `
    <path d="M18 6 6 18"/>
    <path d="m6 6 12 12"/>
  `,
  'search': `
    <circle cx="11" cy="11" r="8"/>
    <path d="m21 21-4.3-4.3"/>
  `,
  'eye': `
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
    <circle cx="12" cy="12" r="3"/>
  `,
  'eye-off': `
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/>
    <line x1="2" x2="22" y1="2" y2="22"/>
  `,
  'arrow-left': `
    <path d="m12 19-7-7 7-7"/>
    <path d="M19 12H5"/>
  `,
  'arrow-right': `
    <path d="M5 12h14"/>
    <path d="m12 5 7 7-7 7"/>
  `,
  'chevron-down': `
    <path d="m6 9 6 6 6-6"/>
  `,
  'chevron-left': `
    <path d="m15 18-6-6 6-6"/>
  `,
  'chevron-right': `
    <path d="m9 18 6-6-6-6"/>
  `,
  'bell': `
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
  `,
  'refresh-cw': `
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
    <path d="M21 3v5h-5"/>
    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
    <path d="M8 16H3v5"/>
  `,
  'message-square': `
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  `,
  'send': `
    <path d="m22 2-7 20-4-9-9-4Z"/>
    <path d="M22 2 11 13"/>
  `,
  'map-pin': `
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
    <circle cx="12" cy="10" r="3"/>
  `,
  'calendar-check': `
    <path d="M8 2v4"/>
    <path d="M16 2v4"/>
    <rect width="18" height="18" x="3" y="4" rx="2"/>
    <path d="M3 10h18"/>
    <path d="m9 16 2 2 4-4"/>
  `,
  'log-in': `
    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
    <polyline points="10 17 15 12 10 7"/>
    <line x1="15" x2="3" y1="12" y2="12"/>
  `,
  'user-round': `
    <circle cx="12" cy="8" r="5"/>
    <path d="M20 21a8 8 0 0 0-16 0"/>
  `,
  'clipboard-list': `
    <rect width="16" height="18" x="4" y="4" rx="2"/>
    <path d="M9 4.5V3h6v1.5"/>
    <path d="M8 10h8"/>
    <path d="M8 14h8"/>
    <path d="M8 18h5"/>
  `,
  'lock-keyhole': `
    <rect width="18" height="12" x="3" y="10" rx="2"/>
    <path d="M7 10V7a5 5 0 0 1 10 0v3"/>
    <circle cx="12" cy="16" r="1"/>
    <path d="M12 17v2"/>
  `,
  'shield-check': `
    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>
    <path d="m9 12 2 2 4-4"/>
  `,
  'phone': `
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
  `,
  'mail': `
    <rect width="20" height="16" x="2" y="4" rx="2"/>
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  `,
  'menu': `
    <line x1="4" x2="20" y1="12" y2="12"/>
    <line x1="4" x2="20" y1="6" y2="6"/>
    <line x1="4" x2="20" y1="18" y2="18"/>
  `,
};

/**
 * Genera el string HTML de un icono SVG Lucide
 * @param {string} name - Nombre del icono (ej. 'calendar', 'users')
 * @param {object} [options] - Opciones de configuración
 * @param {number} [options.size=20] - Tamaño en px
 * @param {string} [options.className=''] - Clases CSS adicionales
 * @param {string} [options.strokeWidth='2'] - Grosor del trazo
 * @param {boolean} [options.ariaHidden=true] - Ocultar para lectores de pantalla si es decorativo
 * @param {string} [options.ariaLabel] - Etiqueta accesible si es accionable
 * @returns {string} Markup SVG
 */
export function icon(name, options = {}) {
  const content = LUCIDE_ICONS[name] || LUCIDE_ICONS['alert-circle'];
  const size = options.size || 20;
  const className = ['lucide', `lucide-${name}`, options.className || ''].filter(Boolean).join(' ');
  const strokeWidth = options.strokeWidth || '2';
  const ariaAttr = options.ariaLabel
    ? `role="img" aria-label="${options.ariaLabel}"`
    : `aria-hidden="${options.ariaHidden !== false ? 'true' : 'false'}"`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" class="${className}" ${ariaAttr}>${content}</svg>`;
}

/**
 * Mapeo de emojis o identificadores antiguos a nombres de Lucide
 */
const EMOJI_MAP = {
  '♥': 'heart-pulse',
  '♡': 'heart-pulse',
  '✚': 'shield-plus',
  '▣': 'layout-dashboard',
  '📅': 'calendar',
  '🎫': 'ticket',
  '📺': 'tv',
  '👥': 'users',
  '👤': 'user',
  '🩺': 'stethoscope',
  '⚙': 'settings',
  '×': 'x',
  '✕': 'x',
  '☰': 'menu',
  '★': 'heart-pulse',
  '⌖': 'map-pin',
  '→': 'arrow-right',
  '←': 'arrow-left',
};

/**
 * Devuelve el icono Lucide adecuado para un ítem de navegación o texto legacy
 * @param {string} rawIcon
 * @param {string} [label]
 * @returns {string} Nombre del icono Lucide
 */
export function resolveIconName(rawIcon, label = '') {
  if (LUCIDE_ICONS[rawIcon]) return rawIcon;
  if (EMOJI_MAP[rawIcon]) return EMOJI_MAP[rawIcon];

  const l = label.toLowerCase();
  if (l.includes('dashboard')) return 'layout-dashboard';
  if (l.includes('cita') || l.includes('agenda')) return 'calendar';
  if (l.includes('turno')) return 'ticket';
  if (l.includes('paciente')) return 'users';
  if (l.includes('perfil')) return 'user';
  if (l.includes('consulta')) return 'stethoscope';
  if (l.includes('usuario')) return 'users';
  if (l.includes('configuraci')) return 'settings';
  if (l.includes('pantalla')) return 'tv';
  return 'layout-dashboard';
}

/**
 * Escanea el contenedor y reemplaza elementos con [data-icon="name"]
 * @param {HTMLElement|Document} container
 */
export function replaceIconPlaceholders(container = document) {
  container.querySelectorAll('[data-icon]').forEach((el) => {
    const name = el.getAttribute('data-icon');
    const size = parseInt(el.getAttribute('data-icon-size') || '20', 10);
    const className = el.getAttribute('data-icon-class') || '';
    el.innerHTML = icon(name, { size, className });
  });

  // Sustitución automática de brand-mark tradicional por Lucide heart-pulse
  container.querySelectorAll('.brand-mark').forEach((el) => {
    if (!el.querySelector('svg')) {
      el.innerHTML = icon('heart-pulse', { size: 20 });
    }
  });
}
