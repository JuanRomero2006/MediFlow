# Resumen del modelo de datos (Excel académico)

Fuente: `Proyecto_base_de_datos_Clinica.xlsx` (descarga del equipo).

## Alcance declarado

Login, agendación de citas, turnos virtuales, chatbot de asesoría y panel administrativo.

## Entidades principales (extracto)

| Entidad | Propósito |
| --- | --- |
| DEPARTAMENTO / CIUDAD | Ubicación geográfica (ej. Huila, Neiva) |
| SEDE | Instalación física de la clínica |
| USUARIO | Credenciales y acceso al sistema |
| ROL | Permisos (Administrador, Paciente, etc.) |
| PACIENTE / PROFESIONAL | Datos de personas atendidas y médicos |
| ESPECIALIDAD / SERVICIO | Catálogo clínico |
| CITA | Agendamiento |
| TURNO | Flujo de atención en sala |

La capa JavaScript (`js/services/`, `data/`) usa estructuras simplificadas alineadas con estas entidades para la demostración sin backend.
