import { login, redirectByRole, getCurrentUser } from '../services/auth.js';
import { validateLoginForm } from '../utils/validators.js';
import { showAlert, clearAlert } from '../components/alerts.js';
import { qs } from '../utils/helpers.js';

export async function initLoginPage() {
  const existing = await getCurrentUser();
  if (existing) {
    redirectByRole(existing.rol);
    return;
  }

  const form = qs('#login-form');
  const alertBox = qs('#login-alert');
  const submitBtn = qs('#login-submit');

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
    submitBtn.textContent = 'Ingresando...';

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
