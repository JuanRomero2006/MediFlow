# MediFlow mejorado — instrucciones de instalación

Esta versión organiza el sitio público en páginas independientes, conserva los módulos por rol y añade el backend PHP/MySQL entregado en el archivo de base de datos.

## Tecnologías
- Frontend: HTML, CSS y JavaScript modular.
- Backend disponible: PHP 8+ con MySQLi.
- Base de datos: MySQL/MariaDB, base `clinica_previred`.
- Entorno local recomendado: XAMPP.

## Instalación con XAMPP
1. Descomprime esta carpeta dentro de `C:\xampp\htdocs\MediFlow` (o utiliza el nombre `Proyecto` y adapta la URL).
2. Inicia Apache y MySQL desde XAMPP.
3. Abre `http://localhost/phpmyadmin`.
4. Importa `database/01_clinica_previred.sql`.
5. Importa `database/02_datos_demo.sql`.
6. Importa `database/04_horarios_demo.sql` para crear horarios de demostración (solo lunes a viernes).
7. Importa `database/05_actualizar_vista_citas_contacto.sql` para actualizar la vista usada por la agenda médica (también aplica sobre instalaciones existentes).
8. Opcional: importa `database/03_fase2_chatbot_notificaciones.sql` para tablas del chatbot y notificaciones.
9. Comprueba que `api/config/conexion.php` tenga el host, usuario, contraseña y base de datos correctos. En XAMPP local predeterminado utiliza `root` sin contraseña.
10. Abre `http://localhost/MediFlow/` y luego `http://localhost/MediFlow/pages/login.html`.

> No abras el proyecto con `file://`. PHP necesita Apache; `npm start` no ejecuta los endpoints PHP.

## Páginas públicas separadas
- `index.html`: inicio y accesos destacados.
- `pages/nosotros.html`
- `pages/servicios.html`
- `pages/especialidades.html`
- `pages/profesionales.html`
- `pages/faq.html`
- `pages/contacto.html`
- `pages/agendar.html` y `pages/login.html`.

Los menús apuntan a páginas específicas y los módulos privados mantienen rutas separadas para paciente, recepción, médico y administración.

## Estado real de la conexión
El backend PHP incluido implementa autenticación de servidor y sesión PHP (`api/login.php`, `api/me.php`, `api/logout.php`) con token CSRF. El modelo SQL incluye usuarios/roles, pacientes, médicos, especialidades, sedes, citas, horarios y turnos, además de las tablas opcionales de chatbot y notificaciones.

**Estado de citas:** `api/citas.php` registra una cita en MySQL mediante una sesión de paciente autenticado y valida al profesional, la especialidad y el horario configurado. La base de datos aplica además sus reglas de negocio y evita registrar una cita cuando el cupo ya está ocupado. `database/04_horarios_demo.sql` añade horarios ilustrativos para pruebas locales; deben reemplazarse por los horarios reales de la clínica. Los paneles de paciente y recepción consultan las citas mediante `api/citas.php`; el paciente puede cancelar sus propias citas y recepción puede confirmarlas o registrar llegadas. `api/turnos.php` permite a recepción consultar los turnos del día y actualizar sus estados. La agenda y listado de pacientes del médico consultan ahora las citas asignadas a su usuario; al finalizar una cita se actualizan también los turnos relacionados. El panel de paciente consulta sus turnos desde MySQL. El administrador consulta el listado de usuarios y sus roles desde MySQL. El módulo de historia clínica todavía no persiste notas médicas y debe implementarse como una fase independiente. Los perfiles e imágenes del sitio público son ilustrativos y no constituyen disponibilidad médica real.

## Cuentas de demostración
Las cuentas que contiene `database/02_datos_demo.sql` usan la contraseña documentada en `README_BACKEND.md` del paquete de backend: `MediFlow2026`. Si no funciona el login, verifica que hayas importado ambos archivos SQL en el orden indicado y que el servidor PHP tenga la extensión `mysqli` habilitada.

## Referencia visual
La organización de la página pública toma como inspiración la estructura general de `https://previred.com.co/` (hero/banner, tarjetas de servicios, imágenes y enlaces claros). No copia el sitio original ni implica afiliación oficial. Las imágenes externas requieren conexión a internet; reemplázalas por recursos autorizados/locales si el proyecto debe funcionar sin internet.


### Módulos conectados a MySQL

- `pages/recepcion/citas.html` consulta citas reales desde `api/citas.php`; el filtro permite seleccionar una fecha o dejarlo vacío para consultar todas.
- `pages/recepcion/pacientes.html` obtiene pacientes activos desde `api/pacientes.php`.
- `pages/recepcion/turnos.html` consulta y actualiza turnos mediante `api/turnos.php`.
- Las acciones de confirmar cita y registrar llegada están limitadas a recepción/administración y se validan en el backend.

Usa una cuenta con rol de recepción para acceder. Los horarios y datos de demostración deben validarse contra los datos reales de la clínica antes de usarse en producción.


### Conexiones añadidas en esta versión

- `api/citas.php` permite al médico consultar únicamente las citas asignadas a su usuario y marcar como atendidas sus propias citas.
- `api/usuarios.php` entrega al administrador el listado de usuarios, roles y estado, sin exponer hashes ni contraseñas.
- `pages/paciente/turnos.html` consulta los turnos del paciente desde `api/turnos.php`.
- `database/05_actualizar_vista_citas_contacto.sql` actualiza la vista de citas para incluir teléfono y correo del paciente; debe importarse después del esquema base.

**Agendamiento actualizado:** `api/catalogo.php` consulta especialidades, profesionales y horarios disponibles directamente en MySQL. El formulario `pages/agendar.html` dejó de usar catálogos locales para estas selecciones; la disponibilidad se calcula con los horarios activos, cupos y citas no canceladas. `api/citas.php` resuelve los identificadores de profesional y especialidad desde MySQL y vuelve a validar el horario al guardar para evitar reservas duplicadas. El módulo de historia clínica aún no guarda notas y no debe utilizarse con información médica real.
