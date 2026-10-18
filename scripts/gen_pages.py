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
  <header class="dash-header">
    <div class="container dash-header-inner">
      <a class="brand" href="../../index.html"><span class="brand-mark">♥</span><span>MediFlow<span class="dash-brand-sub">Panel {role_labels.get(role_key, role_key)}</span></span></a>
      <div class="nav-actions">
        <span class="dash-user" data-user-name></span>
        <button type="button" class="btn outline small dash-menu-toggle" data-dash-menu-toggle aria-expanded="false">Menú</button>
        <!-- Enlace "Inicio" se inserta por sidebar.js -->
        <button type="button" class="btn outline small" data-logout>Salir</button>
      </div>
    </div>
    <div class="container dash-mobile-nav" data-dash-mobile-nav>
      <nav class="dash-nav" data-dashboard-nav></nav>
    </div>
  </header>
  <div class="container dash-layout">
    <aside class="dash-sidebar"><nav class="dash-nav" data-dashboard-nav></nav></aside>
    <main class="dash-main">
      <div id="page-alert"></div>
      {content}
    </main>
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
