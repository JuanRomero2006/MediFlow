export function isRequired(value) {
  return String(value ?? '').trim().length > 0;
}

export function isEmail(value) {
  const v = String(value || '').trim();
  if (!v) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

export function minLength(value, min) {
  return String(value || '').trim().length >= min;
}

export function isFutureOrTodayDate(iso) {
  if (!iso) return false;
  const selected = new Date(`${iso}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return selected >= today;
}

export function validateLoginForm(identifier, password) {
  const errors = {};
  if (!isRequired(identifier)) {
    errors.identifier = 'Ingresa tu correo o nombre de usuario.';
  }
  if (!isRequired(password)) {
    errors.password = 'Ingresa tu contraseña.';
  }
  return errors;
}
