const page = document.body.dataset.page;

async function boot() {
  switch (page) {
    case 'home': {
      const { initHomePage } = await import('./pages/home.js');
      initHomePage();
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
  boot().catch((err) => console.error(err));
});
