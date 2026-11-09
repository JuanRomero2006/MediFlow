import { icon, replaceIconPlaceholders } from './components/icons.js';
import { initScrollReveal } from './components/scroll-reveal.js';

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
      if (button && menu) {
        const setMenuOpen = (opened) => {
          menu.classList.toggle('open', opened);
          button.setAttribute('aria-expanded', String(opened));
          button.setAttribute('aria-label', opened ? 'Cerrar menú' : 'Abrir menú');
          button.innerHTML = icon(opened ? 'x' : 'menu', { size: 20 });
        };

        button.setAttribute('aria-controls', menu.id);
        button.addEventListener('click', () => setMenuOpen(!menu.classList.contains('open')));
        menu.querySelectorAll('a').forEach((link) => {
          link.addEventListener('click', () => setMenuOpen(false));
        });
        window.addEventListener('keydown', (event) => {
          if (event.key === 'Escape' && menu.classList.contains('open')) {
            setMenuOpen(false);
            button.focus();
          }
        });
      }
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
    .then(() => {
      initScrollReveal();
      replaceIconPlaceholders();
    })
    .catch((err) => console.error(err));
});
