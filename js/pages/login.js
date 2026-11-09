import { login, redirectByRole, getCurrentUser } from '../services/auth.js';
import { apiFetch } from '../services/api.js';
import { validateLoginForm } from '../utils/validators.js';
import { showAlert, clearAlert } from '../components/alerts.js';
import { qs } from '../utils/helpers.js';
import { icon, replaceIconPlaceholders } from '../components/icons.js';

export async function initLoginPage() {
  replaceIconPlaceholders();

  const existing = await getCurrentUser();
  if (existing) {
    redirectByRole(existing.rol);
    return;
  }

  const alertBox = qs('#login-alert');
  try {
    await apiFetch('estado.php');
  } catch {
    showAlert(
      alertBox,
      'No se pudo verificar la conexión con el servidor y la base de datos. Comprueba que Apache y MySQL estén activos en XAMPP.',
      'warning'
    );
  }

  const form = qs('#login-form');
  const submitBtn = qs('#login-submit');
  const togglePassBtn = qs('#toggle-password');
  const passwordInput = qs('#password');
  const identifierInput = qs('#identifier');

  const clearFieldError = (field) => {
    if (!field) return;
    field.classList.remove('is-invalid');
    field.removeAttribute('aria-invalid');
    const error = qs(`#${field.id}-error`);
    if (error) error.textContent = '';
  };

  [identifierInput, passwordInput].forEach((field) => {
    field?.addEventListener('input', () => clearFieldError(field));
  });

  // Toggle de visibilidad de contraseña
  togglePassBtn?.addEventListener('click', () => {
    if (!passwordInput) return;
    const isPassword = passwordInput.type === 'password';
    passwordInput.type = isPassword ? 'text' : 'password';
    togglePassBtn.innerHTML = icon(isPassword ? 'eye-off' : 'eye', { size: 18 });
    togglePassBtn.setAttribute('aria-label', isPassword ? 'Ocultar contraseña' : 'Mostrar contraseña');
    togglePassBtn.setAttribute('aria-pressed', String(isPassword));
  });

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearAlert(alertBox);
    clearFieldError(identifierInput);
    clearFieldError(passwordInput);

    const identifier = identifierInput?.value;
    const password = passwordInput?.value;
    const errors = validateLoginForm(identifier, password);

    if (errors.identifier || errors.password) {
      if (errors.identifier && identifierInput) {
        identifierInput.classList.add('is-invalid');
        identifierInput.setAttribute('aria-invalid', 'true');
        qs('#identifier-error').textContent = errors.identifier;
      }
      if (errors.password && passwordInput) {
        passwordInput.classList.add('is-invalid');
        passwordInput.setAttribute('aria-invalid', 'true');
        qs('#password-error').textContent = errors.password;
      }
      showAlert(alertBox, errors.identifier || errors.password, 'error');
      (errors.identifier ? identifierInput : passwordInput)?.focus();
      return;
    }

    submitBtn.disabled = true;
    submitBtn.setAttribute('aria-busy', 'true');
    submitBtn.innerHTML = '<span class="spinner spinner-sm" aria-hidden="true"></span><span>Validando acceso...</span>';

    try {
      const result = await login(identifier, password);
      if (!result.ok) {
        showAlert(alertBox, result.error, 'error');
        return;
      }
      redirectByRole(result.user.rol);
    } finally {
      submitBtn.disabled = false;
      submitBtn.removeAttribute('aria-busy');
      submitBtn.innerHTML = `<span>Iniciar sesión</span>${icon('arrow-right', { size: 18 })}`;
    }
  });
}
