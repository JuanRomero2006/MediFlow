export const TURNO_ESTADOS = {
  generado: { label: 'Pendiente', className: 'badge-neutral' },
  en_espera: { label: 'En espera', className: 'badge-warning' },
  llamado: { label: 'Llamado', className: 'badge-info' },
  en_atencion: { label: 'En atención', className: 'badge-primary' },
  atendido: { label: 'Atendido', className: 'badge-success' },
  cancelado: { label: 'Cancelado', className: 'badge-danger' },
  no_presento: { label: 'No presentado', className: 'badge-danger' },
};

export const CITA_ESTADOS = {
  pendiente: { label: 'Pendiente', className: 'badge-warning' },
  confirmada: { label: 'Confirmada', className: 'badge-primary' },
  cancelada: { label: 'Cancelada', className: 'badge-danger' },
  atendida: { label: 'Atendida', className: 'badge-success' },
};

export function formatTurnoEstado(estado) {
  return TURNO_ESTADOS[estado] || { label: estado, className: 'badge-neutral' };
}

export function formatCitaEstado(estado) {
  return CITA_ESTADOS[estado] || { label: estado, className: 'badge-neutral' };
}

export function fullName(user) {
  if (!user) return '';
  return `${user.nombres} ${user.apellidos}`.trim();
}
