import { login, redirectByRole, getCurrentUser } from '../services/auth.js';
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

  const form = qs('#login-form');
  const alertBox = qs('#login-alert');
  const submitBtn = qs('#login-submit');
  const togglePassBtn = qs('#toggle-password');
  const passwordInput = qs('#password');

  // Toggle de visibilidad de contraseña
  togglePassBtn?.addEventListener('click', () => {
    if (!passwordInput) return;
    const isPassword = passwordInput.type === 'password';
    passwordInput.type = isPassword ? 'text' : 'password';
    togglePassBtn.innerHTML = icon(isPassword ? 'eye-off' : 'eye', { size: 18 });
    togglePassBtn.setAttribute('aria-label', isPassword ? 'Ocultar contraseña' : 'Mostrar contraseña');
  });

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearAlert(alertBox);

    const identifier = qs('#identifier')?.value;
    const password = qs('#password')?.value;
    const errors = validateLoginForm(identifier, password);

    if (errors.identifier || errors.password) {
      showAlert(alertBox, errors.identifier || errors.password, 'error');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner spinner-sm"></span> <span>Ingresando...</span>';

    const result = await login(identifier, password);

    submitBtn.disabled = false;
    submitBtn.textContent = 'Iniciar sesión';

    if (!result.ok) {
      showAlert(alertBox, result.error, 'error');
      return;
    }

    redirectByRole(result.user.rol);
  });
}
