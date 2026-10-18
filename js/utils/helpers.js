export function appPath(relativePath) {
  const root = document.documentElement.dataset.appRoot || '';
  const joined = `${root}${relativePath}`.replace(/([^:]\/)\/+/g, '$1');
  return joined;
}

export function qs(selector, scope = document) {
  return scope.querySelector(selector);
}

export function qsa(selector, scope = document) {
  return [...scope.querySelectorAll(selector)];
}

export function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function debounce(fn, wait = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), wait);
  };
}

export function todayISO() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

export function formatDateShort(iso) {
  if (!iso) return '';
  const d = new Date(`${iso}T12:00:00`);
  return d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });
}

export function nextDays(count = 10) {
  const out = [];
  const base = new Date();
  for (let i = 1; i <= count; i += 1) {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    out.push({
      iso: d.toISOString().slice(0, 10),
      day: d.toLocaleDateString('es-CO', { weekday: 'short' }),
      num: String(d.getDate()),
      month: d.toLocaleDateString('es-CO', { month: 'short' }),
    });
  }
  return out;
}
