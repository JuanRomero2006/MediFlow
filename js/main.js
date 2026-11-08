import { replaceIconPlaceholders } from './components/icons.js';

const page = document.body.dataset.page;

async function boot() {
  switch (page) {
    case 'home': {
      const { initHomePage } = await import('./pages/home.js');
      initHomePage();
      break;
    }
    case 'public': {
      const button = document.querySelector('.menu-button');
      const menu = document.querySelector('.mobile-menu');
      const closeMenu = () => {
        menu?.classList.remove('open');
        button?.setAttribute('aria-expanded', 'false');
        button?.setAttribute('aria-label', 'Abrir menú de navegación');
        if (button) button.innerHTML = '<span aria-hidden="true">☰</span>';
      };
      if (button && menu) button.addEventListener('click', () => {
        const opened = menu.classList.toggle('open');
        button.setAttribute('aria-expanded', String(opened));
        button.setAttribute('aria-label', opened ? 'Cerrar menú de navegación' : 'Abrir menú de navegación');
        button.innerHTML = opened ? '<span aria-hidden="true">×</span>' : '<span aria-hidden="true">☰</span>';
      });
      menu?.querySelectorAll('a').forEach((a) => a.addEventListener('click', closeMenu));
      window.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && menu?.classList.contains('open')) {
          closeMenu();
          button?.focus();
        }
      });
      break;
    }
    case 'login': {
      const { initLoginPage } = await import('./pages/login.js');
      await initLoginPage();
      break;
    }
    case 'agendar': {
      const { initAgendarPage } = await import('./pages/agendar.js');
      await initAgendarPage();
      break;
    }
    default:
      if (page?.startsWith('paciente:')) {
        const { initPacientePage } = await import('./pages/paciente.js');
        await initPacientePage(page.replace('paciente:', ''));
      } else if (page?.startsWith('recepcion:')) {
        const { initRecepcionPage } = await import('./pages/recepcion.js');
        await initRecepcionPage(page.replace('recepcion:', ''));
      } else if (page?.startsWith('medico:')) {
        const { initMedicoPage } = await import('./pages/medico.js');
        await initMedicoPage(page.replace('medico:', ''));
      } else if (page?.startsWith('admin:')) {
        const { initAdminPage } = await import('./pages/administrador.js');
        await initAdminPage(page.replace('admin:', ''));
      }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  boot()
    .then(() => replaceIconPlaceholders())
    .catch((err) => console.error(err));
});
