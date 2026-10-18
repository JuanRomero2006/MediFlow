export function showAlert(container, message, type = 'error') {
  if (!container) return;
  container.innerHTML = `<div class="alert alert-${type}" role="alert">${message}</div>`;
}

export function clearAlert(container) {
  if (container) container.innerHTML = '';
}
