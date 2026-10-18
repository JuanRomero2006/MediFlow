/**
 * Cuentas de demostración — solo para pruebas locales sin backend.
 * No usar en producción. Las contraseñas se validan mediante hash (ver auth.js).
 */

export const DEMO_PASSWORD_HINT =
  'Contraseña de demostración documentada en README.md (simulación académica).';

/** SHA-256 de "mediflow-demo-v1:MediFlow2026" */
export const DEMO_PASSWORD_HASH =
  'effef96ace68451821d93abd721bf61b4222655a271312bb37c1513620368053';

/** @typedef {'paciente'|'recepcion'|'medico'|'administrador'} RolDemo */

/**
 * @type {Array<{
 *   id: number;
 *   email: string;
 *   username: string;
 *   nombres: string;
 *   apellidos: string;
 *   rol: RolDemo;
 *   passwordHash: string;
 *   medicoId?: string;
 *   pacienteId?: number;
 * }>}
 */
export const DEMO_USERS = [
  {
    id: 1,
    email: 'paciente.demo@previred.demo',
    username: 'jperez',
    nombres: 'Juan',
    apellidos: 'Pérez',
    rol: 'paciente',
    pacienteId: 1,
    passwordHash: DEMO_PASSWORD_HASH,
  },
  {
    id: 2,
    email: 'recepcion.demo@previred.demo',
    username: 'ctorres',
    nombres: 'Camila',
    apellidos: 'Torres',
    rol: 'recepcion',
    passwordHash: DEMO_PASSWORD_HASH,
  },
  {
    id: 3,
    email: 'medico.demo@previred.demo',
    username: 'mrodriguez',
    nombres: 'María',
    apellidos: 'Rodríguez',
    rol: 'medico',
    medicoId: 'maria-rodriguez',
    passwordHash: DEMO_PASSWORD_HASH,
  },
  {
    id: 4,
    email: 'admin.demo@previred.demo',
    username: 'admin',
    nombres: 'Admin',
    apellidos: 'Previred',
    rol: 'administrador',
    passwordHash: DEMO_PASSWORD_HASH,
  },
];

export function findDemoUserByIdentifier(identifier) {
  const value = String(identifier || '').trim().toLowerCase();
  if (!value) return null;
  return (
    DEMO_USERS.find(
      (u) => u.email.toLowerCase() === value || u.username.toLowerCase() === value,
    ) || null
  );
}

export function findDemoUserById(id) {
  return DEMO_USERS.find((u) => u.id === Number(id)) || null;
}
