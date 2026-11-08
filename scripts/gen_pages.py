from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def dash_page(role_key, title, active, content, extra=""):
    role_labels = {
        "paciente": "paciente",
        "recepcion": "recepción",
        "medico": "médico",
        "admin": "administrador",
    }
    data_page = f"{role_key}:{active}"
    fonts = (
        "https://fonts.googleapis.com/css2?"
        "family=Inter:wght@400;500;600;700;800&"
        "family=Plus+Jakarta+Sans:wght@700;800&display=swap"
    )
    role_cap = role_labels.get(role_key, role_key).capitalize()
    return f"""<!DOCTYPE html>
<html lang="es" data-app-root="../../">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{title} | MediFlow</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="{fonts}" rel="stylesheet">
  <link rel="stylesheet" href="../../css/main.css">
  <link rel="stylesheet" href="../../css/layout/dashboard.css">
  {extra}
</head>
<body class="dash-shell" data-page="{data_page}">
  <div class="app-shell" id="app-shell">
    <div class="sidebar-backdrop" id="sidebar-backdrop" aria-hidden="true"></div>

    <aside class="app-sidebar" id="app-sidebar" aria-label="Navegación principal">
      <div class="sidebar-head">
        <a class="sidebar-brand" href="../../index.html" title="MediFlow Inicio">
          <span class="brand-mark" data-icon="heart-pulse"></span>
          <span class="brand-text">
            <span class="brand-name">MediFlow</span>
            <span class="brand-role-badge" data-sidebar-role-label>{role_cap}</span>
          </span>
        </a>
        <button type="button" class="sidebar-collapse-btn" id="sidebar-collapse-toggle" title="Contraer menú lateral" aria-label="Contraer menú lateral">
          <span data-icon="chevron-left" data-icon-size="16"></span>
        </button>
        <button type="button" class="sidebar-close-btn" id="sidebar-mobile-close" aria-label="Cerrar menú lateral">
          <span data-icon="x" data-icon-size="18"></span>
        </button>
      </div>

      <nav class="sidebar-nav" data-dashboard-nav aria-label="Módulos del sistema"></nav>

      <div class="sidebar-footer">
        <div class="sidebar-user" id="sidebar-user-card">
          <div class="user-avatar" data-user-avatar>MF</div>
          <div class="user-details">
            <span class="user-name" data-user-name-text>Usuario</span>
            <span class="user-role" data-user-role-text>{role_cap}</span>
          </div>
        </div>
        <button type="button" class="sidebar-logout-btn" data-logout title="Cerrar sesión" aria-label="Cerrar sesión">
          <span data-icon="log-out" data-icon-size="18"></span>
          <span class="logout-label">Salir</span>
        </button>
      </div>
    </aside>

    <div class="app-body">
      <header class="app-topbar">
        <div class="topbar-left">
          <button type="button" class="topbar-menu-btn" id="sidebar-mobile-toggle" aria-label="Abrir menú de navegación">
            <span data-icon="menu" data-icon-size="20"></span>
          </button>
          <nav class="topbar-breadcrumbs" id="topbar-breadcrumbs" aria-label="Ruta de navegación"></nav>
        </div>

        <div class="topbar-right">
          <a href="../../index.html" class="btn ghost small topbar-action-link" title="Ir al sitio público">
            <span data-icon="home" data-icon-size="16"></span>
            <span class="topbar-action-text">Inicio</span>
          </a>

          <div class="topbar-notifications" id="topbar-notifications" title="Notificaciones del sistema">
            <button type="button" class="btn ghost small btn-icon topbar-icon-btn" aria-label="Notificaciones" id="notifications-btn">
              <span data-icon="bell" data-icon-size="18"></span>
            </button>
          </div>

          <div class="topbar-divider"></div>

          <div class="topbar-profile" id="topbar-profile-container">
            <button type="button" class="topbar-profile-trigger" id="topbar-profile-trigger" aria-expanded="false" aria-haspopup="true">
              <div class="user-avatar user-avatar-sm" data-user-avatar-top>MF</div>
              <div class="topbar-profile-info">
                <span class="topbar-user-name" data-topbar-user-name>Usuario</span>
                <span class="topbar-user-role" data-topbar-user-role>{role_cap}</span>
              </div>
              <span class="profile-chevron" data-icon="chevron-down" data-icon-size="14"></span>
            </button>

            <div class="profile-dropdown" id="profile-dropdown" hidden>
              <div class="dropdown-header">
                <strong data-dropdown-user-name>Usuario</strong>
                <small data-dropdown-user-email>correo@mediflow.local</small>
              </div>
              <div class="dropdown-divider"></div>
              <a href="#" class="dropdown-item" id="dropdown-profile-link">
                <span data-icon="user" data-icon-size="16"></span>
                <span>Mi perfil</span>
              </a>
              <a href="../../index.html" class="dropdown-item">
                <span data-icon="home" data-icon-size="16"></span>
                <span>Página principal</span>
              </a>
              <div class="dropdown-divider"></div>
              <button type="button" class="dropdown-item dropdown-item-danger" data-logout>
                <span data-icon="log-out" data-icon-size="16"></span>
                <span>Cerrar sesión</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main class="app-main" id="main-content">
        <div id="page-alert"></div>
        {content}
      </main>
    </div>
  </div>
  <script type="module" src="../../js/main.js"></script>
</body>
</html>"""


pages = [
    (
        "pages/paciente/dashboard.html",
        "paciente",
        "Dashboard",
        "Dashboard",
        """
      <section><h1 class="dash-title" data-greeting>Hola 👋</h1><p class="dash-subtitle">Resumen de tu atención (demostración).</p></section>
      <section class="stat-grid">
        <article class="stat-card"><small>Citas próximas</small><strong data-stat-citas>0</strong></article>
        <article class="stat-card"><small>Turnos hoy</small><strong>1</strong></article>
        <article class="stat-card"><small>Notificaciones</small><strong>0</strong></article>
      </section>
      <section class="highlight-panel" data-next-cita><p>Próxima cita aparecerá aquí.</p></section>
      <section><h2 class="dash-title" style="font-size:1.1rem">Mis citas</h2><div class="cards-grid" data-citas-list></div></section>
      <div class="modal" id="detail-modal" hidden aria-hidden="true"><div class="modal-card"><button type="button" class="close-chat" data-modal-close>×</button><div id="detail-body"></div></div></div>
""",
    ),
    (
        "pages/paciente/citas.html",
        "paciente",
        "Mis citas",
        "Mis citas",
        """
      <section><h1 class="dash-title">Mis citas</h1><p class="dash-subtitle">Consulta y cancela citas en la demostración local.</p></section>
      <section class="cards-grid" data-citas-list></section>
      <div class="modal" id="detail-modal" hidden aria-hidden="true"><div class="modal-card"><button type="button" class="close-chat" data-modal-close>×</button><div id="detail-body"></div></div></div>
""",
    ),
    (
        "pages/paciente/turnos.html",
        "paciente",
        "Turnos",
        "Turnos",
        """
      <section><h1 class="dash-title">Turno virtual</h1><p class="dash-subtitle">Estado sincronizado con recepción en esta demostración (sin tiempo real).</p></section>
      <section class="highlight-panel" data-turno-actual></section>
""",
    ),
    (
        "pages/paciente/perfil.html",
        "paciente",
        "Mi perfil",
        "Mi perfil",
        """
      <section><h1 class="dash-title">Mi perfil</h1></section>
      <article class="dash-card"><p><strong>Nombre:</strong> <span data-perfil-nombre></span></p><p><strong>Correo:</strong> <span data-perfil-email></span></p><p><strong>Rol:</strong> <span data-perfil-rol></span></p></article>
""",
    ),
    (
        "pages/recepcion/dashboard.html",
        "recepcion",
        "Dashboard",
        "Dashboard",
        """
      <section><h1 class="dash-title">Operación del día</h1><p class="dash-subtitle">Clínica Previred · Neiva (demostración)</p></section>
      <section class="stat-grid"><article class="stat-card"><small>Citas hoy</small><strong data-stat-citas>0</strong></article><article class="stat-card"><small>Pendientes</small><strong data-stat-pendientes>0</strong></article><article class="stat-card"><small>Turnos activos</small><strong>—</strong></article></section>
      <section class="data-table-wrap"><table class="data-table" id="dashboard-citas-table"></table></section>
""",
    ),
    (
        "pages/recepcion/citas.html",
        "recepcion",
        "Citas",
        "Citas",
        """
      <section><h1 class="dash-title">Citas del día</h1></section>
      <section class="data-table-wrap"><table class="data-table" id="citas-table"></table></section>
""",
    ),
    (
        "pages/recepcion/pacientes.html",
        "recepcion",
        "Pacientes",
        "Pacientes",
        """
      <section><h1 class="dash-title">Pacientes</h1></section>
      <section class="data-table-wrap"><table class="data-table" id="pacientes-table"><thead><tr><th>Nombre</th><th>Documento</th><th>Correo</th><th>EPS</th></tr></thead><tbody></tbody></table></section>
""",
    ),
    (
        "pages/recepcion/turnos.html",
        "recepcion",
        "Turnos",
        "Turnos",
        """
      <section><h1 class="dash-title">Gestión de turnos</h1><p class="dash-subtitle">Llamar pacientes y actualizar estados.</p></section>
      <section class="data-table-wrap"><table class="data-table" id="turnos-table"><thead><tr><th>Turno</th><th>Paciente</th><th>Fecha</th><th>Estado</th><th>Acciones</th></tr></thead><tbody></tbody></table></section>
""",
    ),
    (
        "pages/medico/dashboard.html",
        "medico",
        "Dashboard",
        "Dashboard",
        """
      <section><h1 class="dash-title" data-greeting>Buenos días 👋</h1></section>
      <section class="stat-grid"><article class="stat-card"><small>Citas hoy</small><strong data-stat-citas>0</strong></article><article class="stat-card"><small>Pendientes</small><strong data-stat-pendientes>0</strong></article><article class="stat-card"><small>Atendidas</small><strong>—</strong></article></section>
      <section><h2 class="dash-title" style="font-size:1.1rem">Agenda de hoy</h2><div class="cards-grid" data-agenda-list></div></section>
""",
    ),
    (
        "pages/medico/agenda.html",
        "medico",
        "Agenda",
        "Agenda",
        """
      <section><h1 class="dash-title">Agenda del día</h1></section>
      <section class="cards-grid" data-agenda-list></section>
""",
    ),
    (
        "pages/medico/pacientes.html",
        "medico",
        "Pacientes",
        "Pacientes",
        """
      <section><h1 class="dash-title">Pacientes</h1></section>
      <section class="data-table-wrap"><table class="data-table" id="pacientes-table"><thead><tr><th>Paciente</th><th>Teléfono</th><th>Correo</th><th>Notas</th></tr></thead><tbody></tbody></table></section>
""",
    ),
    (
        "pages/medico/consulta.html",
        "medico",
        "Consulta",
        "Consulta",
        """
      <section><h1 class="dash-title">Registro de consulta</h1><p class="dash-subtitle">Solo datos ficticios para la demostración académica.</p></section>
      <form id="consulta-form" class="dash-card form-grid">
        <label>Cita<select id="consulta-cita" required></select></label>
        <label>Notas de consulta<textarea id="consulta-notas" rows="4" required placeholder="Motivo, plan y recomendaciones ficticias"></textarea></label>
        <button class="btn" type="submit">Guardar consulta</button>
      </form>
""",
    ),
    (
        "pages/administrador/dashboard.html",
        "admin",
        "Dashboard",
        "Dashboard",
        """
      <section><h1 class="dash-title">Panel administrativo</h1><p class="dash-subtitle">Gestión de demostración — requiere backend para producción.</p></section>
      <section class="stat-grid"><article class="stat-card"><small>Pacientes demo</small><strong data-stat-pacientes>0</strong></article><article class="stat-card"><small>Personal demo</small><strong data-stat-staff>0</strong></article><article class="stat-card"><small>Chatbot</small><strong>FAQ local</strong></article></section>
""",
    ),
    (
        "pages/administrador/usuarios.html",
        "admin",
        "Usuarios",
        "Usuarios",
        """
      <section><h1 class="dash-title">Usuarios de demostración</h1></section>
      <section class="data-table-wrap"><table class="data-table" id="usuarios-table"><thead><tr><th>Nombre</th><th>Correo</th><th>Rol</th></tr></thead><tbody></tbody></table></section>
""",
    ),
    (
        "pages/administrador/configuracion.html",
        "admin",
        "Configuración",
        "Configuración",
        """
      <section><h1 class="dash-title">Configuración</h1></section>
      <article class="dash-card"><p>Restablece citas y turnos semilla en este navegador.</p><button type="button" class="btn outline" id="reset-demo">Restablecer datos demo</button></article>
""",
    ),
]

for path, role, title, active, content in pages:
    out = ROOT / path
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(dash_page(role, title, active, content), encoding="utf-8")

print(f"Generated {len(pages)} pages")
