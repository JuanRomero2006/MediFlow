# Análisis de formas normales — base de datos `clinica_previred`

Aplicado con los conceptos del material de formas normales (1FN, 2FN, 3FN con su definición formal y FNBC) al modelo que usa hoy MediFlow. Se verificó importando los tres SQL en MariaDB y probando las reglas de cita y turno.

## 1. Resultado en una mirada
- **2 cambios aplicados** (los dos eran incumplimientos reales):
  1. `CITA` incumplía la **3FN** → se quitaron `medico_id`, `especialidad_id` y `sede_id`.
  2. `CHATBOT_PREGUNTA` (fase 2) incumplía la **1FN** → `palabras_clave` pasó a su propia tabla.
- **2 redundancias conservadas a propósito** y protegidas (ver sección 5).
- El resto de tablas ya cumplía 3FN; casi todas cumplen también FNBC.

## 2. Método usado (por cada tabla)
1. Identificar clave primaria y claves candidatas.
2. Escribir las dependencias funcionales (qué atributo determina a cuál).
3. **1FN:** ¿hay listas dentro de una celda o columnas repetidas?
4. **2FN:** si la clave es compuesta, ¿algún atributo depende solo de una parte?
5. **3FN (definición formal):** para cada dependencia no trivial `X → A`, ¿`X` es superclave o `A` es atributo primo? Si no, hay incumplimiento.
6. **FNBC:** ¿todo determinante es superclave?

## 3. Análisis tabla por tabla

| Tabla | Claves | Dependencias relevantes | 1FN | 2FN | 3FN | FNBC |
|---|---|---|---|---|---|---|
| `departamento` | PK `departamento_id`; CK `nombre` | id → nombre, estado | ✓ | ✓ | ✓ | ✓ |
| `ciudad` | PK `ciudad_id`; CK `(nombre, departamento_id)` | id → nombre, departamento, estado | ✓ | ✓ | ✓ | ✓ |
| `sede` | PK `sede_id`; CK `(nombre, ciudad_id)` | id → dirección, ciudad, contacto | ✓ | ✓ | ✓ | ✓ |
| `usuario` | PK `usuario_id`; CK `numero_documento`, `email`, `username` | cada clave → todos los demás | ✓ | ✓ | ✓ | ✓ |
| `rol` | PK `rol_id`; CK `nombre` | id → descripción | ✓ | ✓ | ✓ | ✓ |
| `usuario_rol` | PK `(usuario_id, rol_id)` | clave → `fecha_asignacion` (depende de **ambos**) | ✓ | ✓ | ✓ | ✓ |
| `paciente` | PK `paciente_id` | id → datos del paciente | ✓* | ✓ | ✓ | ✓ |
| `medico` | PK `medico_id`; CK `registro_medico` | id → teléfono, activo | ✓ | ✓ | ✓ | ✓ |
| `especialidad` | PK `especialidad_id`; CK `nombre` | id → descripción, activo | ✓ | ✓ | ✓ | ✓ |
| `medico_especialidad` | PK `(medico_id, especialidad_id)` | clave → `es_principal` (depende de **ambos**) | ✓ | ✓ | ✓ | ✓ |
| `horario_medico` | PK `horario_id`; CK `(medico_id, sede_id, dia_semana, hora_inicio)` | clave → especialidad, horas, duración, cupo | ✓ | ✓ | ✓ | ✓ |
| **`cita`** | PK `cita_id` | `cita_id → horario_id` y **`horario_id → medico_id, sede_id, especialidad_id`** | ✓ | ✓ | **✗ → corregido** | ✓ tras el cambio |
| `turno` | PK `turno_id`; CK `(sede_id, fecha_turno, numero_turno)`, `cita_id` | cada clave → todos los demás | ✓ | ✓ | ✓ | ✓ (con redundancia controlada) |
| `bitacora` | PK `bitacora_id` | id → resto | ✓ | ✓ | ✓ | ✓ |
| `regla_negocio` | PK `regla_id`; CK `nombre` | id → tipo, valor, activo | ✓ | ✓ | ✓ | ✓ |
| `chatbot_tema`, `conversacion_chatbot`, `mensaje_chatbot`, `notificacion` (fase 2) | PK propia | id → resto | ✓ | ✓ | ✓ | ✓ |
| **`chatbot_pregunta`** (fase 2) | PK `pregunta_id` | — | **✗ → corregido** | ✓ | ✓ | ✓ |

\* `paciente`: ver observación sobre `alergias` y `antecedentes` en la sección 6.

## 4. Los dos cambios aplicados

### 4.1 `CITA` — Tercera Forma Normal
**Problema.** Un horario ya dice quién atiende, dónde y de qué especialidad:

```
horario_id → medico_id, sede_id, especialidad_id
cita_id    → horario_id
```

Entonces `medico_id`, `sede_id` y `especialidad_id` dependían de `cita_id` **a través de otro atributo no clave** (`horario_id`). Es una dependencia transitiva, y `horario_id` no es superclave de `cita` ni esos tres atributos son primos → incumple la definición formal de 3FN.

**Anomalías que causaba:**
- *Actualización:* si el horario cambiaba de médico, había que corregir cada cita (y una omisión dejaba datos contradictorios).
- *Inserción:* se podía registrar una cita con un médico que no correspondía a su horario (antes lo frenaba una FK compuesta, pero el dato seguía duplicado).

**Solución aplicada.**

| Antes | Después |
|---|---|
| `cita(cita_id, paciente_id, medico_id, especialidad_id, sede_id, horario_id, …)` | `cita(cita_id, paciente_id, horario_id, …)` |
| FK compuesta `(horario_id, medico_id, sede_id, especialidad_id)` | FK simple `horario_id → horario_medico` |

Médico, sede y especialidad se obtienen con un `JOIN` a `horario_medico`. Para no repetir esos `JOIN` se dejó la vista `vw_cita_detalle`, que mantiene las mismas columnas (`medico_id`, `medico`, `especialidad`, `sede`, …).

**Qué se ajustó en la base de datos:** `sp_validar_cita` ya no recibe `medico_id` (lo toma del horario y cuenta el cupo del médico en cualquiera de sus sedes), los triggers `trg_cita_bi` y `trg_cita_bu`, la vista y la FK compuesta de `turno`.

### 4.2 `CHATBOT_PREGUNTA` — Primera Forma Normal (fase 2)
**Problema.** `palabras_clave` guardaba una lista en una celda (`'agendar,cita,solicitar'`), igual que el ejemplo de los teléfonos del material. Era difícil buscar, contar o corregir una sola palabra.

**Solución.** Nueva tabla `chatbot_palabra_clave(pregunta_id, palabra)` con clave primaria compuesta. Relación 1:N: una pregunta tiene varias palabras. El índice `FULLTEXT` quedó solo sobre `pregunta`. Las 20 palabras salen del arreglo `keywords` de `data/faqs.js`, que ya estaba normalizado en el front.

## 5. Redundancia controlada (se conserva a propósito)
La normalización no obliga a eliminar toda repetición: hay que justificar la que se queda.

| Dato repetido | Por qué se conserva | Cómo se protege |
|---|---|---|
| `turno.paciente_id` y `turno.sede_id` (también salen de la cita) | Un turno puede existir **sin cita** (atención directa), entonces no se pueden derivar | FK compuesta `(cita_id, paciente_id) → cita` y `trg_turno_bi` verifica que la sede coincida con la sede del horario de la cita |
| `cita.duracion_min` (parecido a `horario_medico.duracion_cita_min`) | Es la duración **pactada** de esa cita y puede ser distinta a la del horario | `CHECK (duracion_min >= 5)` y validación en `sp_validar_cita` |

## 6. Observaciones sin cambio (decisiones para el equipo)
- **`paciente.alergias` y `antecedentes` (TEXT):** hoy son texto libre que solo se muestra, por lo que cumplen la 1FN según su uso. Si más adelante se necesita buscar o contar alergias individuales, habría que pasarlas a tablas propias (`alergia` y `paciente_alergia`).
- **`paciente.eps` (texto):** cumple 3FN porque ninguna otra columna depende de él. Aun así, el mismo nombre escrito de varias formas ("Sura", "SURA") genera inconsistencias; una tabla `eps` evitaría eso.
- **`usuario.numero_documento` único solo:** el Excel así lo define. En la práctica el documento se identifica por **tipo + número**; conviene revisarlo con el equipo.
- **`turno.modulo` (texto):** el front usa "Consultorio 3". Si los consultorios llegan a tener datos propios, serían una tabla.
- **`medico_especialidad.es_principal`:** el modelo no impide dos especialidades principales para un médico; no es un asunto de formas normales, pero sí de integridad.
- **`bitacora(tabla_afectada, registro_id)`:** referencia polimórfica sin FK. Es habitual en una bitácora de auditoría.

## 7. Qué actualizar en el Excel
1. **CITA:** eliminar `medico_id`, `especialidad_id` y `sede_id`; la FK de `horario_id` pasa a ser simple; agregar clave única `(cita_id, paciente_id)`.
2. **TURNO:** la FK compuesta es `(cita_id, paciente_id)`; anotar la regla "la sede debe coincidir con la del horario de la cita".
3. **CHATBOT_PREGUNTA:** eliminar `palabras_clave` y agregar la entidad **CHATBOT_PALABRA_CLAVE** (`pregunta_id`, `palabra`).
4. (Anterior) **USUARIO:** agregar `username`, opcional y único.

## 8. Consejo para cuando se conecte el front
En `localStorage`, las citas guardan `pacienteNombre`, `especialidad`, `profesional` y `sede` junto a sus ids: es la misma redundancia que se quitó de `cita`. Al migrar a la API, guardar solo los ids y pedir los nombres a `vw_cita_detalle`.
