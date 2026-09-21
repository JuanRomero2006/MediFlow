# 🏥 MediFlow

## Sistema de Turnos Virtuales y Agendamiento de Citas

MediFlow es un sistema web desarrollado para apoyar la gestión de citas y turnos de una clínica, permitiendo digitalizar procesos que tradicionalmente requieren atención presencial.

El sistema busca facilitar el acceso de los pacientes, disminuir los tiempos de espera y organizar el flujo de atención mediante herramientas como agendamiento de citas, turnos virtuales, paneles diferenciados por usuario y un chatbot de asistencia.

**Caso de estudio:** Clínica Previred — Neiva, Huila, Colombia.

---

# 📋 Tabla de contenidos

* [Descripción del proyecto](#-descripción-del-proyecto)
* [Problema](#-problema)
* [Objetivos](#-objetivos)
* [Alcance](#-alcance)
* [Módulos del sistema](#-módulos-del-sistema)
* [Roles de usuario](#-roles-de-usuario)
* [Tecnologías](#-tecnologías)
* [Estructura del proyecto](#-estructura-del-proyecto)
* [Descripción de carpetas](#-descripción-de-carpetas)
* [Descripción de archivos](#-descripción-de-archivos)
* [Flujo general del sistema](#-flujo-general-del-sistema)
* [Flujo del paciente](#-flujo-del-paciente)
* [Flujo de recepción](#-flujo-de-recepción)
* [Flujo del médico](#-flujo-del-médico)
* [Sistema de turnos](#-sistema-de-turnos)
* [Chatbot](#-chatbot)
* [Organización del código](#-organización-del-código)
* [Instalación](#-instalación)
* [Ejecución](#-ejecución)
* [Buenas prácticas](#-buenas-prácticas)
* [Git y GitHub](#-git-y-github)
* [Estado del proyecto](#-estado-del-proyecto)
* [Plan de desarrollo](#-plan-de-desarrollo)
* [Equipo](#-equipo)

---

# 📌 Descripción del proyecto

MediFlow es una plataforma web orientada a la gestión digital de citas y turnos médicos.

El sistema permite que los usuarios puedan acceder mediante autenticación, consultar información de la clínica, agendar citas y realizar seguimiento de sus turnos sin necesidad de permanecer continuamente en la sala de espera.

Además, cuenta con diferentes interfaces dependiendo del rol del usuario y un chatbot encargado de brindar orientación sobre el uso de la plataforma y responder preguntas frecuentes relacionadas con la atención.

El proyecto contempla módulos de acceso, agendamiento, turnos, paneles administrativos y asistencia al usuario.

---

# ❗ Problema

La atención presencial puede generar congestión en las salas de espera, largas filas y pérdida de tiempo debido a que los pacientes deben acudir físicamente para solicitar o esperar su turno.

También existe la necesidad de diferenciar el acceso de los distintos tipos de usuarios y proporcionar asistencia durante el uso de la plataforma.

MediFlow plantea una solución digital que permite gestionar citas y turnos, organizar el flujo de atención y proporcionar orientación al usuario.

---

# 🎯 Objetivos

## Objetivo general

Desarrollar un sistema web integral para una clínica que permita gestionar el inicio de sesión por roles, la agendación de citas, el seguimiento de turnos virtuales y un chatbot de asistencia para los pacientes.

## Objetivos específicos

1. Implementar un sistema de autenticación diferenciado para los diferentes tipos de usuarios.
2. Permitir la gestión y agendamiento de citas.
3. Permitir consultar y realizar seguimiento de los turnos.
4. Implementar un chatbot de asistencia para los usuarios.
5. Crear paneles específicos para pacientes, recepción y médicos.
6. Organizar digitalmente el flujo de atención de la clínica.
7. Facilitar la consulta de información relacionada con citas y atención.

---

# 🎯 Alcance

MediFlow contempla inicialmente las siguientes funcionalidades:

* Página principal.
* Información de la clínica.
* Servicios médicos.
* Especialidades.
* Profesionales.
* Inicio de sesión.
* Agendamiento de citas.
* Consulta de citas.
* Seguimiento de turnos.
* Panel del paciente.
* Panel de recepción.
* Panel médico.
* Chatbot de asistencia.
* Gestión de pacientes.
* Gestión de agenda.
* Gestión del flujo de atención.

Las funcionalidades que requieran persistencia de datos podrán conectarse posteriormente a un backend y una base de datos.

---

# 🧩 Módulos del sistema

## 1. Módulo público

Permite consultar información general de la clínica sin iniciar sesión.

### Funcionalidades

* Página de inicio.
* Servicios.
* Especialidades.
* Profesionales.
* Información de contacto.
* Preguntas frecuentes.
* Acceso al inicio de sesión.

---

## 2. Módulo de autenticación

Permite identificar al usuario antes de acceder a las funcionalidades privadas.

### Funcionalidades

* Inicio de sesión.
* Validación de datos.
* Identificación del rol.
* Redirección al panel correspondiente.
* Cierre de sesión.
* Control de acceso.

---

## 3. Módulo de agendamiento

Permite al paciente programar una cita.

### Flujo

```text
Seleccionar especialidad
        ↓
Seleccionar profesional
        ↓
Seleccionar fecha
        ↓
Seleccionar horario
        ↓
Confirmar cita
        ↓
Cita registrada
```

---

## 4. Módulo de turnos

Permite realizar seguimiento al turno asignado.

### Funcionalidades

* Consultar turno actual.
* Visualizar número de turno.
* Visualizar estado.
* Consultar posición.
* Mostrar información de atención.
* Actualizar el estado del turno.

---

## 5. Panel del paciente

El paciente podrá consultar y administrar información relacionada con sus citas y turnos.

### Funcionalidades

* Resumen de citas.
* Citas próximas.
* Historial de citas.
* Turno actual.
* Estado del turno.
* Perfil del paciente.
* Acceso al chatbot.

---

## 6. Panel de recepción

Permite al personal de recepción gestionar el flujo de atención.

### Funcionalidades

* Visualizar pacientes.
* Consultar citas.
* Gestionar llegada de pacientes.
* Asignar turnos.
* Llamar turnos.
* Consultar estado de atención.
* Gestionar el flujo de pacientes.

---

## 7. Panel médico

Permite al médico gestionar su agenda y la atención de pacientes.

### Funcionalidades

* Agenda del día.
* Pacientes pendientes.
* Paciente actual.
* Registro de consulta.
* Estado de atención.
* Historial relacionado con la atención.

---

## 8. Chatbot

El chatbot funciona como asistente dentro de la plataforma.

### Funciones principales

* Orientar sobre el inicio de sesión.
* Explicar cómo agendar una cita.
* Explicar cómo consultar un turno.
* Resolver preguntas frecuentes.
* Orientar sobre el uso de la página.
* Proporcionar información general relacionada con los servicios.

> El chatbot no reemplaza la atención ni el diagnóstico de un profesional médico.

---

# 👥 Roles de usuario

| Rol           | Funciones principales                                                  |
| ------------- | ---------------------------------------------------------------------- |
| Paciente      | Agendar citas, consultar citas, consultar turnos y utilizar el chatbot |
| Recepción     | Gestionar pacientes, citas y turnos                                    |
| Médico        | Consultar agenda y gestionar la atención                               |
| Administrador | Gestionar información y configuración del sistema                      |

---

# 🛠️ Tecnologías

El desarrollo de esta versión se realizará utilizando tecnologías web fundamentales.

### Frontend

* HTML5
* CSS3
* JavaScript

### Organización

* Arquitectura modular.
* Componentes reutilizables.
* Separación entre estructura, estilos y lógica.

### Control de versiones

* Git
* GitHub

### Posibles tecnologías futuras

* Backend/API.
* Base de datos.
* Autenticación real.
* Servicio de chatbot.
* Sistema de notificaciones.

---

# 📁 Estructura del proyecto

```text
MediFlow/
│
├── index.html
├── README.md
├── .gitignore
├── package.json
│
├── pages/
│   │
│   ├── login.html
│   ├── agendar.html
│   │
│   ├── paciente/
│   │   ├── dashboard.html
│   │   ├── citas.html
│   │   ├── turnos.html
│   │   └── perfil.html
│   │
│   ├── recepcion/
│   │   ├── dashboard.html
│   │   ├── pacientes.html
│   │   ├── turnos.html
│   │   └── citas.html
│   │
│   └── medico/
│       ├── dashboard.html
│       ├── agenda.html
│       ├── pacientes.html
│       └── consulta.html
│
├── css/
│   │
│   ├── base/
│   │   ├── reset.css
│   │   └── variables.css
│   │
│   ├── components/
│   │   ├── buttons.css
│   │   ├── cards.css
│   │   ├── forms.css
│   │   ├── navbar.css
│   │   ├── sidebar.css
│   │   ├── modal.css
│   │   ├── table.css
│   │   ├── chatbot.css
│   │   └── alerts.css
│   │
│   ├── layout/
│   │   ├── header.css
│   │   ├── footer.css
│   │   └── dashboard.css
│   │
│   ├── pages/
│   │   ├── home.css
│   │   ├── login.css
│   │   ├── agendar.css
│   │   ├── paciente.css
│   │   ├── recepcion.css
│   │   └── medico.css
│   │
│   └── main.css
│
├── js/
│   │
│   ├── components/
│   │   ├── navbar.js
│   │   ├── sidebar.js
│   │   ├── modal.js
│   │   ├── chatbot.js
│   │   ├── alerts.js
│   │   └── notifications.js
│   │
│   ├── services/
│   │   ├── api.js
│   │   ├── auth.js
│   │   ├── citas.js
│   │   ├── turnos.js
│   │   └── usuarios.js
│   │
│   ├── utils/
│   │   ├── validators.js
│   │   ├── helpers.js
│   │   ├── formatters.js
│   │   └── storage.js
│   │
│   ├── pages/
│   │   ├── home.js
│   │   ├── login.js
│   │   ├── agendar.js
│   │   ├── paciente.js
│   │   ├── recepcion.js
│   │   └── medico.js
│   │
│   └── main.js
│
├── assets/
│   │
│   ├── images/
│   │   ├── logo/
│   │   ├── doctors/
│   │   └── backgrounds/
│   │
│   ├── icons/
│   └── fonts/
│
└── data/
    ├── specialties.js
    ├── professionals.js
    └── faqs.js
```

---

# 📂 Descripción de carpetas

## `/pages`

Contiene las diferentes páginas HTML del sistema.

Las páginas privadas se organizan por rol para mantener una estructura clara.

```text
pages/
├── paciente/
├── recepcion/
└── medico/
```

---

## `/css`

Contiene todos los estilos visuales del sistema.

### `/css/base`

Estilos generales:

* `reset.css`: normaliza los estilos del navegador.
* `variables.css`: colores, tamaños, fuentes, sombras y otras variables.

### `/css/components`

Contiene estilos de elementos reutilizables:

* Botones.
* Formularios.
* Tarjetas.
* Navbar.
* Sidebar.
* Modales.
* Tablas.
* Chatbot.
* Alertas.

### `/css/layout`

Contiene estilos relacionados con la distribución general:

* Header.
* Footer.
* Dashboard.

### `/css/pages`

Contiene estilos específicos de cada sección.

---

# 📂 `/js`

Contiene toda la lógica JavaScript.

## `/js/components`

Componentes reutilizables.

Ejemplos:

```text
navbar.js
sidebar.js
modal.js
chatbot.js
notifications.js
```

---

## `/js/services`

Contiene la lógica relacionada con los servicios y datos.

### `api.js`

Será responsable de centralizar las futuras peticiones al backend.

### `auth.js`

Gestionará la autenticación.

### `citas.js`

Gestionará las operaciones relacionadas con citas.

### `turnos.js`

Gestionará la lógica de turnos.

### `usuarios.js`

Gestionará información relacionada con usuarios.

---

## `/js/utils`

Funciones auxiliares reutilizables.

Ejemplos:

* Validaciones.
* Formateo.
* Manipulación de almacenamiento.
* Funciones generales.

---

## `/js/pages`

Contiene la lógica específica de cada página.

Esto evita colocar toda la lógica del sistema en un único archivo `main.js`.

---

# 📂 `/assets`

Contiene los recursos visuales.

```text
assets/
├── images/
├── icons/
└── fonts/
```

Aquí se almacenarán:

* Logos.
* Fotografías.
* Imágenes de médicos.
* Fondos.
* Íconos.
* Fuentes.

---

# 📂 `/data`

Contiene información estática que puede utilizarse durante el desarrollo inicial.

Ejemplo:

```text
specialties.js
professionals.js
faqs.js
```

Esta información podrá reemplazarse posteriormente por datos provenientes de una API o base de datos.

---

# 📄 Descripción de archivos principales

| Archivo         | Función                                   |
| --------------- | ----------------------------------------- |
| `index.html`    | Página principal                          |
| `README.md`     | Documentación del proyecto                |
| `package.json`  | Configuración y dependencias del proyecto |
| `main.css`      | Archivo CSS principal                     |
| `main.js`       | Punto principal de JavaScript             |
| `api.js`        | Comunicación futura con backend           |
| `auth.js`       | Autenticación                             |
| `citas.js`      | Gestión de citas                          |
| `turnos.js`     | Gestión de turnos                         |
| `usuarios.js`   | Gestión de usuarios                       |
| `chatbot.js`    | Lógica del chatbot                        |
| `validators.js` | Validaciones                              |
| `storage.js`    | Manejo de almacenamiento local            |

---

# 🔄 Flujo general del sistema

```text
                    INICIO
                       │
                       ▼
                Página principal
                       │
             ┌─────────┴─────────┐
             │                   │
       Consultar información    Login
                                 │
                                 ▼
                         Validar usuario
                                 │
                 ┌───────────────┼───────────────┐
                 │               │               │
                 ▼               ▼               ▼
             Paciente        Recepción         Médico
                 │               │               │
                 ▼               ▼               ▼
              Citas           Turnos          Agenda
                 │               │               │
                 └───────────────┼───────────────┘
                                 │
                                 ▼
                            Atención
                                 │
                                 ▼
                               FIN
```

---

# 👤 Flujo del paciente

```text
Inicio
  ↓
Login
  ↓
Panel del paciente
  ↓
Agendar cita
  ↓
Seleccionar especialidad
  ↓
Seleccionar profesional
  ↓
Seleccionar fecha
  ↓
Seleccionar horario
  ↓
Confirmar cita
  ↓
Consultar cita
  ↓
Consultar turno
  ↓
Seguimiento de atención
```

---

# 🧑‍💼 Flujo de recepción

```text
Login
  ↓
Panel de recepción
  ↓
Consultar citas
  ↓
Ver pacientes
  ↓
Registrar llegada
  ↓
Asignar / gestionar turno
  ↓
Llamar paciente
  ↓
Actualizar estado
  ↓
Enviar paciente a atención
```

---

# 👨‍⚕️ Flujo del médico

```text
Login
  ↓
Panel médico
  ↓
Agenda del día
  ↓
Consultar pacientes
  ↓
Seleccionar paciente
  ↓
Iniciar atención
  ↓
Registrar consulta
  ↓
Finalizar atención
  ↓
Actualizar estado
```

---

# 🎫 Sistema de turnos

El sistema de turnos debe permitir representar el estado de atención del paciente.

### Estados sugeridos

```text
PENDIENTE
    ↓
EN ESPERA
    ↓
LLAMADO
    ↓
EN ATENCIÓN
    ↓
ATENDIDO
```

También pueden contemplarse estados como:

```text
CANCELADO
NO PRESENTADO
REPROGRAMADO
```

---

# 🤖 Chatbot

El chatbot estará disponible como componente reutilizable dentro de la plataforma.

### Arquitectura inicial

```text
Usuario
   ↓
Chatbot
   ↓
Identificar pregunta
   ↓
Consultar preguntas frecuentes
   ↓
Generar respuesta
   ↓
Mostrar respuesta
```

### Categorías iniciales

* Inicio de sesión.
* Agendamiento.
* Citas.
* Turnos.
* Servicios.
* Especialidades.
* Información general.
* Preguntas frecuentes.

---

# 🧱 Organización del código

El proyecto seguirá el principio de separación de responsabilidades.

```text
HTML
 ↓
Estructura
 ↓
CSS
 ↓
Presentación
 ↓
JavaScript
 ↓
Lógica
 ↓
Services
 ↓
Datos / API
```

No se debe colocar toda la lógica del sistema directamente dentro de los archivos HTML.

---

# 🔐 Autenticación

Durante la etapa inicial, la autenticación podrá ser simulada utilizando JavaScript y almacenamiento local.

Ejemplo conceptual:

```text
Usuario
   ↓
Formulario Login
   ↓
Validación
   ↓
Identificar rol
   ↓
Guardar sesión
   ↓
Redirigir al panel
```

En una versión conectada a backend, la autenticación deberá trasladarse al servidor.

---

# 💾 Almacenamiento

Durante el desarrollo inicial se puede utilizar:

```javascript
localStorage
```

para simular:

* Sesiones.
* Usuarios.
* Citas.
* Turnos.
* Preferencias.

Posteriormente, estos datos podrán ser reemplazados por una base de datos mediante una API.

---

# 🔌 Integración futura con Backend

La carpeta:

```text
js/services/
```

está preparada para realizar la integración futura.

Ejemplo:

```javascript
async function obtenerCitas() {
    const response = await fetch('/api/citas');
    return await response.json();
}
```

De esta manera, la interfaz no dependerá directamente de la implementación de la base de datos.

---

# 🗄️ Base de datos

La base de datos deberá contemplar como mínimo las entidades necesarias para:

* Usuarios.
* Roles.
* Pacientes.
* Profesionales.
* Especialidades.
* Citas.
* Turnos.
* Preguntas frecuentes.
* Respuestas del chatbot.

> La estructura definitiva de la base de datos deberá mantenerse alineada con el modelo entidad-relación aprobado para el proyecto.

---

# 📱 Diseño responsive

MediFlow deberá adaptarse a:

* Computadores.
* Portátiles.
* Tablets.
* Teléfonos móviles.

Los elementos principales deben conservar su funcionalidad y legibilidad en diferentes tamaños de pantalla.

---

# ♿ Accesibilidad

El sistema debe procurar:

* Contraste adecuado.
* Textos legibles.
* Botones claramente identificables.
* Formularios con etiquetas.
* Navegación intuitiva.
* Mensajes claros de error.
* Compatibilidad con diferentes tamaños de pantalla.

---

# 🧪 Pruebas

Cada módulo deberá probarse antes de integrarse al sistema.

## Login

* Usuario válido.
* Usuario inválido.
* Campos vacíos.
* Rol correcto.
* Cierre de sesión.

## Citas

* Selección de especialidad.
* Selección de profesional.
* Fecha válida.
* Horario disponible.
* Confirmación de cita.

## Turnos

* Generación de turno.
* Consulta de turno.
* Cambio de estado.
* Llamado.
* Finalización.

## Chatbot

* Preguntas frecuentes.
* Respuestas correctas.
* Preguntas desconocidas.
* Interacción desde diferentes páginas.

---

# 📝 Buenas prácticas

## HTML

* Utilizar HTML semántico.
* Evitar código duplicado.
* Utilizar `label` en formularios.
* Mantener una estructura clara.

## CSS

* Utilizar variables.
* Evitar estilos duplicados.
* Mantener componentes reutilizables.
* Utilizar nombres descriptivos.

## JavaScript

* Utilizar funciones pequeñas.
* Evitar duplicación de código.
* Separar lógica por módulos.
* Validar datos.
* Utilizar nombres descriptivos.

## Archivos

Cada archivo debe tener una responsabilidad clara.

Evitar crear archivos gigantes que mezclen:

```text
HTML + CSS + JavaScript + datos
```

---

# 🌿 Git y GitHub

Se recomienda trabajar utilizando ramas.

### Rama principal

```text
main
```

Contiene las versiones estables.

### Ramas de desarrollo

Ejemplos:

```text
feature/login
feature/agendamiento
feature/turnos
feature/chatbot
feature/panel-paciente
feature/panel-recepcion
feature/panel-medico
```

### Ejemplo de flujo

```bash
git checkout -b feature/login
```

Realizar cambios:

```bash
git add .
```

Crear commit:

```bash
git commit -m "feat: implementar módulo de login"
```

Subir rama:

```bash
git push origin feature/login
```

Después se puede realizar un Pull Request hacia `main`.

---

# 📌 Convención de commits

Se recomienda utilizar:

```text
feat:
```

Para nuevas funcionalidades.

```text
fix:
```

Para corrección de errores.

```text
style:
```

Para cambios visuales.

```text
refactor:
```

Para reorganización del código.

```text
docs:
```

Para documentación.

```text
chore:
```

Para configuración o mantenimiento.

### Ejemplos

```text
feat: crear formulario de login
feat: implementar agendamiento de citas
feat: agregar sistema de turnos
feat: crear chatbot
fix: corregir validación de login
style: mejorar diseño del panel paciente
docs: actualizar README
```

---

# 🚀 Instalación

## 1. Clonar el repositorio

```bash
git clone URL_DEL_REPOSITORIO
```

## 2. Entrar al proyecto

```bash
cd MediFlow
```

## 3. Abrir el proyecto

Si se trabaja inicialmente con HTML, CSS y JavaScript puro, se puede utilizar un servidor local como **Live Server**.

También puede utilizarse cualquier servidor HTTP local compatible.

---

# ▶️ Ejecución

La página principal se encuentra en:

```text
index.html
```

El sistema debe ejecutarse mediante un servidor local para evitar problemas con rutas, módulos JavaScript y futuras peticiones.

---

# 📊 Estado del proyecto

| Módulo           | Estado           |
| ---------------- | ---------------- |
| Página principal | 🟡 En desarrollo |
| Servicios        | 🟡 En desarrollo |
| Especialidades   | 🟡 En desarrollo |
| Profesionales    | 🟡 En desarrollo |
| Login            | 🟡 En desarrollo |
| Agendamiento     | 🟡 En desarrollo |
| Turnos virtuales | 🟡 En desarrollo |
| Panel paciente   | 🟡 En desarrollo |
| Panel recepción  | 🟡 En desarrollo |
| Panel médico     | 🟡 En desarrollo |
| Chatbot          | 🟡 En desarrollo |
| Backend          | ⚪ Pendiente      |
| Base de datos    | 🟡 Diseño        |
| Pruebas          | ⚪ Pendiente      |
| Despliegue       | ⚪ Pendiente      |

---

# 📅 Plan de desarrollo

El proyecto contempla un desarrollo de aproximadamente **15 semanas**, dividido en diferentes fases.

```text
Semanas 1-2
Inicio y análisis
        ↓
Semanas 3-4
Diseño UI/UX + Base de datos
        ↓
Semanas 5-8
Desarrollo de módulos principales
        ↓
Semanas 9-11
Paneles de recepción y médicos
        ↓
Semanas 12-13
Integración y pruebas
        ↓
Semanas 14-15
Implementación, despliegue y cierre
```

---

# 📚 Documentación adicional

El proyecto deberá mantener documentación relacionada con:

```text
/docs/
│
├── requisitos/
├── diagramas/
├── arquitectura/
├── base-datos/
├── interfaces/
├── pruebas/
└── manuales/
```

Se recomienda documentar:

* Requisitos funcionales.
* Requisitos no funcionales.
* Casos de uso.
* Diagramas de flujo.
* Diagrama de clases.
* Modelo entidad-relación.
* Arquitectura.
* Diseño de interfaces.
* Casos de prueba.
* Manual de usuario.
* Manual técnico.

---

# 📐 Diagramas recomendados

Para documentar correctamente el sistema se recomienda incluir:

### Diagrama de casos de uso

Representará las acciones disponibles para:

* Paciente.
* Recepción.
* Médico.
* Administrador.

### Diagrama de flujo

Representará procesos como:

* Login.
* Agendamiento.
* Gestión de turnos.
* Atención del paciente.

### Diagrama de clases

Representará las principales entidades y relaciones del sistema.

### Modelo entidad-relación

Representará la estructura de la base de datos.

### Diagrama de arquitectura

Representará:

```text
Frontend
    ↓
JavaScript
    ↓
API / Backend
    ↓
Base de datos
```

---

# 🔒 Seguridad

Aunque la primera versión sea desarrollada con HTML, CSS y JavaScript, se deben considerar desde el diseño:

* Validación de formularios.
* Control de acceso por roles.
* Protección de información personal.
* Manejo seguro de sesiones.
* Validación también en backend cuando exista.
* No almacenar contraseñas reales en `localStorage`.
* No incluir credenciales directamente en el código fuente.

---

# 🔮 Futuras mejoras

Entre las posibles mejoras se encuentran:

* Backend completo.
* Base de datos.
* Autenticación segura.
* Notificaciones.
* Actualización de turnos en tiempo real.
* Integración con servicios de mensajería.
* Chatbot conectado a un servicio de IA.
* Historial médico.
* Reportes administrativos.
* Sistema de estadísticas.
* Despliegue en producción.

---

# 👨‍💻 Equipo

### Integrantes

* **Mateo Tafur Piedrahita**
* **Jhostin Eduardo Buitrago Mejía**
* **Juan David Romero Suaza**
* **David Julián Perdomo Quimbaya** — colaborador en base de datos.

---

# 📄 Información académica

**Proyecto:** MediFlow
**Tipo:** Sistema web
**Área:** Ingeniería de Software
**Caso de estudio:** Clínica Previred
**Ubicación:** Neiva, Huila, Colombia

---

# 📌 Nota de desarrollo

MediFlow se desarrollará inicialmente como una aplicación web utilizando HTML, CSS y JavaScript, manteniendo una arquitectura modular que permita posteriormente incorporar un backend, una base de datos y servicios externos sin tener que reconstruir completamente el frontend.

La estructura del proyecto está diseñada para mantener separadas las responsabilidades de presentación, estilos, lógica, componentes y servicios.

---

# 📜 Licencia

Este proyecto es desarrollado con fines académicos.

© 2026 — MediFlow
