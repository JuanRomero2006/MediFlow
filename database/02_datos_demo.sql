-- =========================================================
-- DATOS DE DEMOSTRACIÓN (solo desarrollo local)
-- Ejecutar DESPUÉS de 01_clinica_previred.sql
--
-- Son las mismas cuentas de data/demo-users.js y del README:
--   contraseña de TODAS: MediFlow2026
--   los usuario_id 1 a 4 coinciden con los id del front
--   (pacienteId = 1, medicoId = 'maria-rodriguez').
-- Los profesionales, especialidades y sedes salen de
-- data/professionals.js y data/specialties.js.
-- =========================================================
USE clinica_previred;
SET NAMES utf8mb4;

-- ---------- Ubicación y sedes (data/professionals.js) ----------
INSERT INTO departamento (departamento_id, nombre) VALUES ('41', 'Huila');

INSERT INTO ciudad (ciudad_id, nombre, departamento_id) VALUES
('41001', 'Neiva',    '41'),
('41551', 'Pitalito', '41'),
('41298', 'Garzón',   '41');

INSERT INTO sede (nombre, direccion, ciudad_id) VALUES
('Sede Centro',   'Calle 8 #12-45',   '41001'),
('Sede Norte',    'Carrera 5 #40-12', '41001'),
('Sede Pitalito', 'Calle 3 #7-20',    '41551'),
('Sede Garzón',   'Carrera 10 #6-30', '41298');

-- ---------- Especialidades (data/specialties.js) ----------
INSERT INTO especialidad (nombre, descripcion) VALUES
('Medicina general', 'Primera línea de atención y control de salud.'),
('Dermatología',     'Piel, cabello y uñas.'),
('Pediatría',        'Atención para niñas y niños.'),
('Cardiología',      'Corazón y sistema circulatorio.'),
('Ginecología',      'Salud femenina y control prenatal.'),
('Odontología',      'Salud oral integral.');

-- ---------- Usuarios (ids fijos: coinciden con el front) ----------
SET @hash = '$2y$10$/jFwabAgovsL3kFqDqAZ8uifjYr3TDBEA/Sz2fRv67le7b2nrHG9m';

INSERT INTO usuario (usuario_id, tipo_documento, numero_documento, nombres, apellidos, email, username, password_hash) VALUES
(1, 'CC', '1000000001', 'Juan',   'Pérez',     'paciente.demo@previred.demo',  'jperez',     @hash),
(2, 'CC', '1000000002', 'Camila', 'Torres',    'recepcion.demo@previred.demo', 'ctorres',    @hash),
(3, 'CC', '1000000003', 'María',  'Rodríguez', 'medico.demo@previred.demo',    'mrodriguez', @hash),
(4, 'CC', '1000000004', 'Admin',  'Previred',  'admin.demo@previred.demo',     'admin',      @hash),
(5, 'CC', '1000000005', 'Carlos', 'Méndez',    'carlos.mendez@previred.demo',  'cmendez',    @hash),
(6, 'CC', '1000000006', 'Laura',  'Castro',    'laura.castro@previred.demo',   'lcastro',    @hash),
(7, 'CC', '1000000007', 'Andrés', 'Pineda',    'andres.pineda@previred.demo',  'apineda',    @hash),
(8, 'CC', '1000000008', 'Sofía',  'Vargas',    'sofia.vargas@previred.demo',   'svargas',    @hash),
(9, 'CC', '1000000009', 'Julián', 'Ortiz',     'julian.ortiz@previred.demo',   'jortiz',     @hash);

-- ---------- Roles ----------
INSERT INTO usuario_rol (usuario_id, rol_id)
SELECT 1, rol_id FROM rol WHERE nombre = 'paciente';
INSERT INTO usuario_rol (usuario_id, rol_id)
SELECT 2, rol_id FROM rol WHERE nombre = 'recepcionista';
INSERT INTO usuario_rol (usuario_id, rol_id)
SELECT 4, rol_id FROM rol WHERE nombre = 'administrador';
INSERT INTO usuario_rol (usuario_id, rol_id)
SELECT u.id, r.rol_id
  FROM (SELECT 3 AS id UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) u
  JOIN rol r ON r.nombre = 'medico';

-- ---------- Paciente (pacienteId = 1) ----------
INSERT INTO paciente (paciente_id, fecha_nacimiento, sexo, ciudad_id, eps)
VALUES (1, '1990-05-15', 'M', '41001', 'EPS Demo');

-- ---------- Médicos y su especialidad principal ----------
INSERT INTO medico (medico_id, registro_medico) VALUES
(3, 'RM-0001'), (5, 'RM-0002'), (6, 'RM-0003'), (7, 'RM-0004'), (8, 'RM-0005'), (9, 'RM-0006');

INSERT INTO medico_especialidad (medico_id, especialidad_id, es_principal)
SELECT m.medico_id, e.especialidad_id, 1
  FROM (SELECT 3 AS medico_id, 'Dermatología' AS esp
        UNION SELECT 5, 'Cardiología'
        UNION SELECT 6, 'Pediatría'
        UNION SELECT 7, 'Medicina general'
        UNION SELECT 8, 'Ginecología'
        UNION SELECT 9, 'Odontología') m
  JOIN especialidad e ON e.nombre = m.esp;
