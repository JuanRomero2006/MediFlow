-- =========================================================
-- PROYECTO: MEDIFLOW - CLÍNICA PREVIRED (Neiva, Huila)
-- BASE DE DATOS: clinica_previred  (versión 3 - núcleo)
-- MOTOR: MariaDB 10.4+ / MySQL 8 (XAMPP)
-- NORMALIZACIÓN: hasta 3FN (ver ANALISIS_FORMAS_NORMALES.md)
--
-- ALCANCE: solo lo que el front-end ya usa hoy:
--   login por roles, pacientes, médicos, especialidades, sedes,
--   citas y turnos. Chatbot y notificaciones están en
--   03_fase2_chatbot_notificaciones.sql (se importa cuando se necesiten).
--
-- Orden de importación en phpMyAdmin (pestaña Importar):
--   1) 01_clinica_previred.sql   2) 02_datos_demo.sql
-- ⚠ La sección 0 BORRA las tablas si ya existen (solo desarrollo).
-- =========================================================

CREATE DATABASE IF NOT EXISTS clinica_previred
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE clinica_previred;

SET NAMES utf8mb4;

-- =========================================================
-- 0. LIMPIEZA (solo desarrollo)
-- =========================================================
SET FOREIGN_KEY_CHECKS = 0;

DROP VIEW IF EXISTS vw_cola_turnos;
DROP VIEW IF EXISTS vw_cita_detalle;
DROP PROCEDURE IF EXISTS sp_generar_turno;
DROP PROCEDURE IF EXISTS sp_validar_cita;
DROP FUNCTION IF EXISTS fn_regla_valor;

DROP TABLE IF EXISTS regla_negocio;
DROP TABLE IF EXISTS bitacora;
DROP TABLE IF EXISTS turno;
DROP TABLE IF EXISTS cita;
DROP TABLE IF EXISTS horario_medico;
DROP TABLE IF EXISTS medico_especialidad;
DROP TABLE IF EXISTS especialidad;
DROP TABLE IF EXISTS medico;
DROP TABLE IF EXISTS paciente;
DROP TABLE IF EXISTS usuario_rol;
DROP TABLE IF EXISTS rol;
DROP TABLE IF EXISTS usuario;
DROP TABLE IF EXISTS sede;
DROP TABLE IF EXISTS ciudad;
DROP TABLE IF EXISTS departamento;

SET FOREIGN_KEY_CHECKS = 1;

-- =========================================================
-- 1. DEPARTAMENTO
-- =========================================================
CREATE TABLE departamento (
    departamento_id VARCHAR(5) NOT NULL COMMENT 'Código DANE',
    nombre VARCHAR(100) NOT NULL,
    estado ENUM('Activo','Inactivo') NOT NULL DEFAULT 'Activo',
    PRIMARY KEY (departamento_id),
    UNIQUE KEY uq_departamento_nombre (nombre)
) ENGINE=InnoDB;

-- =========================================================
-- 2. CIUDAD
-- =========================================================
CREATE TABLE ciudad (
    ciudad_id VARCHAR(5) NOT NULL COMMENT 'Código DANE',
    nombre VARCHAR(100) NOT NULL,
    departamento_id VARCHAR(5) NOT NULL,
    estado ENUM('Activo','Inactivo') NOT NULL DEFAULT 'Activo',
    PRIMARY KEY (ciudad_id),
    UNIQUE KEY uq_ciudad_nombre_departamento (nombre, departamento_id),
    KEY idx_ciudad_departamento (departamento_id),
    CONSTRAINT fk_ciudad_departamento
        FOREIGN KEY (departamento_id) REFERENCES departamento (departamento_id)
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

-- =========================================================
-- 3. SEDE
-- =========================================================
CREATE TABLE sede (
    sede_id INT NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(150) NOT NULL,
    direccion VARCHAR(200) NOT NULL,
    ciudad_id VARCHAR(5) NOT NULL,
    telefono VARCHAR(20) NULL,
    email VARCHAR(120) NULL,
    fecha_apertura DATE NULL,
    activo TINYINT(1) NOT NULL DEFAULT 1,
    PRIMARY KEY (sede_id),
    UNIQUE KEY uq_sede_nombre_ciudad (nombre, ciudad_id),
    KEY idx_sede_ciudad (ciudad_id),
    CONSTRAINT fk_sede_ciudad
        FOREIGN KEY (ciudad_id) REFERENCES ciudad (ciudad_id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT chk_sede_activo CHECK (activo IN (0,1)),
    CONSTRAINT chk_sede_email CHECK (email IS NULL OR email REGEXP '^[^@ ]+@[^@ ]+[.][^@ ]+$')
) ENGINE=InnoDB;

-- =========================================================
-- 4. USUARIO
-- =========================================================
CREATE TABLE usuario (
    usuario_id INT NOT NULL AUTO_INCREMENT,
    tipo_documento ENUM('CC','CE','TI','PP','NIT') NOT NULL,
    numero_documento VARCHAR(30) NOT NULL,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    email VARCHAR(120) NOT NULL,
    username VARCHAR(50) NULL COMMENT 'Nombre de usuario alternativo para el login (opcional)',
    telefono VARCHAR(20) NULL,
    password_hash VARCHAR(255) NOT NULL,
    estado ENUM('activo','inactivo','suspendido') NOT NULL DEFAULT 'activo',
    fecha_registro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ultimo_acceso DATETIME NULL,
    PRIMARY KEY (usuario_id),
    UNIQUE KEY uq_usuario_documento (numero_documento),
    UNIQUE KEY uq_usuario_email (email),
    UNIQUE KEY uq_usuario_username (username),
    CONSTRAINT chk_usuario_email CHECK (email REGEXP '^[^@ ]+@[^@ ]+[.][^@ ]+$'),
    CONSTRAINT chk_usuario_username CHECK (username IS NULL OR username REGEXP '^[A-Za-z0-9._-]{3,50}$')
) ENGINE=InnoDB;

-- =========================================================
-- 5. ROL
-- =========================================================
CREATE TABLE rol (
    rol_id INT NOT NULL AUTO_INCREMENT,
    nombre ENUM('paciente','medico','recepcionista','administrador','superadmin') NOT NULL,
    descripcion VARCHAR(255) NULL,
    PRIMARY KEY (rol_id),
    UNIQUE KEY uq_rol_nombre (nombre)
) ENGINE=InnoDB;

-- =========================================================
-- 6. USUARIO_ROL  (N:M)
-- =========================================================
CREATE TABLE usuario_rol (
    usuario_id INT NOT NULL,
    rol_id INT NOT NULL,
    fecha_asignacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (usuario_id, rol_id),
    KEY idx_usuario_rol_rol (rol_id),
    CONSTRAINT fk_usuario_rol_usuario
        FOREIGN KEY (usuario_id) REFERENCES usuario (usuario_id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_usuario_rol_rol
        FOREIGN KEY (rol_id) REFERENCES rol (rol_id)
        ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

-- =========================================================
-- 7. PACIENTE  (extiende USUARIO)
--    La fecha de nacimiento no futura se valida con trigger.
-- =========================================================
CREATE TABLE paciente (
    paciente_id INT NOT NULL,
    fecha_nacimiento DATE NULL,
    sexo ENUM('M','F','O') NULL,
    direccion VARCHAR(200) NULL,
    ciudad_id VARCHAR(5) NULL,
    eps VARCHAR(100) NULL,
    tipo_sangre ENUM('O+','O-','A+','A-','B+','B-','AB+','AB-') NULL,
    alergias TEXT NULL,
    antecedentes TEXT NULL,
    PRIMARY KEY (paciente_id),
    KEY idx_paciente_ciudad (ciudad_id),
    CONSTRAINT fk_paciente_usuario
        FOREIGN KEY (paciente_id) REFERENCES usuario (usuario_id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_paciente_ciudad
        FOREIGN KEY (ciudad_id) REFERENCES ciudad (ciudad_id)
        ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;

-- =========================================================
-- 8. MEDICO  (extiende USUARIO)
-- =========================================================
CREATE TABLE medico (
    medico_id INT NOT NULL,
    registro_medico VARCHAR(50) NOT NULL,
    telefono_consultorio VARCHAR(20) NULL,
    activo TINYINT(1) NOT NULL DEFAULT 1,
    PRIMARY KEY (medico_id),
    UNIQUE KEY uq_medico_registro (registro_medico),
    CONSTRAINT fk_medico_usuario
        FOREIGN KEY (medico_id) REFERENCES usuario (usuario_id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT chk_medico_activo CHECK (activo IN (0,1))
) ENGINE=InnoDB;

-- =========================================================
-- 9. ESPECIALIDAD
-- =========================================================
CREATE TABLE especialidad (
    especialidad_id INT NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    descripcion VARCHAR(255) NULL,
    activo TINYINT(1) NOT NULL DEFAULT 1,
    PRIMARY KEY (especialidad_id),
    UNIQUE KEY uq_especialidad_nombre (nombre),
    CONSTRAINT chk_especialidad_activo CHECK (activo IN (0,1))
) ENGINE=InnoDB;

-- =========================================================
-- 10. MEDICO_ESPECIALIDAD  (N:M)
-- =========================================================
CREATE TABLE medico_especialidad (
    medico_id INT NOT NULL,
    especialidad_id INT NOT NULL,
    es_principal TINYINT(1) NOT NULL DEFAULT 0,
    PRIMARY KEY (medico_id, especialidad_id),
    KEY idx_medico_esp_especialidad (especialidad_id),
    CONSTRAINT fk_medico_esp_medico
        FOREIGN KEY (medico_id) REFERENCES medico (medico_id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_medico_esp_especialidad
        FOREIGN KEY (especialidad_id) REFERENCES especialidad (especialidad_id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT chk_medico_esp_principal CHECK (es_principal IN (0,1))
) ENGINE=InnoDB;

-- =========================================================
-- 11. HORARIO_MEDICO
--     MEJORA: FK compuesta (medico_id, especialidad_id) hacia
--     MEDICO_ESPECIALIDAD: un médico solo puede tener horario
--     en especialidades que realmente ejerce.
--     cupo_maximo = citas simultáneas permitidas por hora.
-- =========================================================
CREATE TABLE horario_medico (
    horario_id INT NOT NULL AUTO_INCREMENT,
    medico_id INT NOT NULL,
    sede_id INT NOT NULL,
    especialidad_id INT NOT NULL,
    dia_semana ENUM('Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo') NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    duracion_cita_min INT NOT NULL DEFAULT 30,
    cupo_maximo INT NOT NULL DEFAULT 1,
    activo TINYINT(1) NOT NULL DEFAULT 1,
    PRIMARY KEY (horario_id),
    UNIQUE KEY uq_horario_medico_sede_dia_hora (medico_id, sede_id, dia_semana, hora_inicio),
    -- Necesario para la FK compuesta desde CITA
    UNIQUE KEY uq_horario_coherencia (horario_id, medico_id, sede_id, especialidad_id),
    KEY idx_horario_sede (sede_id),
    KEY idx_horario_especialidad (especialidad_id),
    CONSTRAINT fk_horario_medico
        FOREIGN KEY (medico_id) REFERENCES medico (medico_id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_horario_sede
        FOREIGN KEY (sede_id) REFERENCES sede (sede_id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_horario_especialidad
        FOREIGN KEY (especialidad_id) REFERENCES especialidad (especialidad_id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_horario_medico_esp
        FOREIGN KEY (medico_id, especialidad_id) REFERENCES medico_especialidad (medico_id, especialidad_id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT chk_horario_horas CHECK (hora_fin > hora_inicio),
    CONSTRAINT chk_horario_duracion CHECK (duracion_cita_min >= 5),
    CONSTRAINT chk_horario_cupo CHECK (cupo_maximo >= 1),
    CONSTRAINT chk_horario_activo CHECK (activo IN (0,1))
) ENGINE=InnoDB;

-- =========================================================
-- 12. CITA
--     NORMALIZACIÓN (3FN): se QUITAN medico_id, especialidad_id y sede_id.
--     horario_id ya determina esos tres datos:
--         horario_id -> medico_id, sede_id, especialidad_id
--     y cita_id -> horario_id, así que guardarlos aquí era una
--     dependencia transitiva (cita -> horario -> médico/sede/especialidad).
--     Ahora se obtienen con JOIN a HORARIO_MEDICO (ver vw_cita_detalle).
--
--     Se QUITA el UNIQUE(medico, fecha, hora): impedía volver a agendar
--     una hora cuya cita fue cancelada y no permitía cupo_maximo > 1.
--     Ahora lo controla sp_validar_cita (trigger) ignorando canceladas.
-- =========================================================
CREATE TABLE cita (
    cita_id INT NOT NULL AUTO_INCREMENT,
    paciente_id INT NOT NULL,
    horario_id INT NOT NULL,
    fecha_cita DATE NOT NULL,
    hora_cita TIME NOT NULL,
    duracion_min INT NOT NULL DEFAULT 30,
    estado ENUM('agendada','confirmada','cancelada','atendida','no_asistio') NOT NULL DEFAULT 'agendada',
    motivo VARCHAR(255) NULL,
    observaciones TEXT NULL,
    fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    creada_por_usuario_id INT NULL,
    PRIMARY KEY (cita_id),
    -- Necesario para la FK compuesta desde TURNO
    UNIQUE KEY uq_cita_paciente (cita_id, paciente_id),
    KEY idx_cita_horario_fecha (horario_id, fecha_cita, hora_cita, estado),
    KEY idx_cita_paciente_fecha (paciente_id, fecha_cita),
    KEY idx_cita_creada_por (creada_por_usuario_id),
    KEY idx_cita_fecha_estado (fecha_cita, estado),
    CONSTRAINT fk_cita_paciente
        FOREIGN KEY (paciente_id) REFERENCES paciente (paciente_id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_cita_horario
        FOREIGN KEY (horario_id) REFERENCES horario_medico (horario_id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_cita_creada_por
        FOREIGN KEY (creada_por_usuario_id) REFERENCES usuario (usuario_id)
        ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT chk_cita_duracion CHECK (duracion_min >= 5)
) ENGINE=InnoDB;

-- =========================================================
-- 13. TURNO
--     * FK compuesta (cita_id, paciente_id) -> CITA: el turno de una cita
--       es del mismo paciente de la cita.
--     * turno.sede_id se conserva porque un turno puede existir SIN cita
--       (atención directa). Cuando sí hay cita, trg_turno_bi comprueba que
--       coincida con la sede del horario de la cita (redundancia controlada).
--     * UNIQUE(cita_id): una cita genera a lo sumo un turno.
--     * CHECK de coherencia entre las horas del turno.
-- =========================================================
CREATE TABLE turno (
    turno_id INT NOT NULL AUTO_INCREMENT,
    cita_id INT NULL,
    paciente_id INT NOT NULL,
    sede_id INT NOT NULL,
    numero_turno VARCHAR(10) NOT NULL,
    fecha_turno DATE NOT NULL,
    hora_generacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    hora_llamado DATETIME NULL,
    hora_atencion DATETIME NULL,
    estado ENUM('generado','en_espera','llamado','en_atencion','atendido','cancelado','no_presento') NOT NULL DEFAULT 'generado',
    prioridad INT NOT NULL DEFAULT 0,
    modulo VARCHAR(50) NULL COMMENT 'Consultorio o ventanilla',
    observaciones VARCHAR(255) NULL,
    PRIMARY KEY (turno_id),
    UNIQUE KEY uq_turno_sede_fecha_numero (sede_id, fecha_turno, numero_turno),
    UNIQUE KEY uq_turno_cita (cita_id),
    KEY idx_turno_paciente (paciente_id),
    KEY idx_turno_fecha_estado (fecha_turno, estado),
    CONSTRAINT fk_turno_cita_coherente
        FOREIGN KEY (cita_id, paciente_id) REFERENCES cita (cita_id, paciente_id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_turno_paciente
        FOREIGN KEY (paciente_id) REFERENCES paciente (paciente_id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_turno_sede
        FOREIGN KEY (sede_id) REFERENCES sede (sede_id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT chk_turno_prioridad CHECK (prioridad >= 0),
    CONSTRAINT chk_turno_llamado CHECK (hora_llamado IS NULL OR hora_llamado >= hora_generacion),
    CONSTRAINT chk_turno_atencion CHECK (hora_atencion IS NULL OR (hora_llamado IS NOT NULL AND hora_atencion >= hora_llamado))
) ENGINE=InnoDB;

-- =========================================================
-- 19. BITACORA
--     MEJORA: índice (accion, detalle, fecha_hora) usado para
--     limitar intentos fallidos de login.
-- =========================================================
CREATE TABLE bitacora (
    bitacora_id INT NOT NULL AUTO_INCREMENT,
    usuario_id INT NULL COMMENT 'NULL = acción del sistema o anónima',
    accion VARCHAR(150) NOT NULL,
    tabla_afectada VARCHAR(50) NULL,
    registro_id INT NULL,
    detalle TEXT NULL,
    fecha_hora DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ip_origen VARCHAR(45) NULL,
    PRIMARY KEY (bitacora_id),
    KEY idx_bitacora_usuario (usuario_id),
    KEY idx_bitacora_fecha (fecha_hora),
    KEY idx_bitacora_accion_fecha (accion, fecha_hora),
    CONSTRAINT fk_bitacora_usuario
        FOREIGN KEY (usuario_id) REFERENCES usuario (usuario_id)
        ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;

-- =========================================================
-- 20. REGLA_NEGOCIO
--     MEJORA: nombre único (así fn_regla_valor es inequívoca).
-- =========================================================
CREATE TABLE regla_negocio (
    regla_id INT NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    tipo ENUM('cita','turno','chatbot','acceso','notificacion') NOT NULL,
    valor VARCHAR(255) NOT NULL COMMENT 'Parámetro configurable',
    descripcion VARCHAR(255) NULL,
    activo TINYINT(1) NOT NULL DEFAULT 1,
    PRIMARY KEY (regla_id),
    UNIQUE KEY uq_regla_nombre (nombre),
    CONSTRAINT chk_regla_activo CHECK (activo IN (0,1))
) ENGINE=InnoDB;

-- =========================================================
-- DATOS BASE (roles y parámetros; el resto está en 02_datos_demo.sql)
-- =========================================================
INSERT INTO rol (nombre, descripcion) VALUES
('paciente', 'Usuario que agenda citas y consulta turnos'),
('medico', 'Profesional de la salud'),
('recepcionista', 'Personal de recepción y gestión de turnos'),
('administrador', 'Gestiona citas, turnos y configuración'),
('superadmin', 'Control total del sistema');

INSERT INTO regla_negocio (nombre, tipo, valor, descripcion) VALUES
('Máximo de citas activas por día', 'cita', '1', 'Citas activas (agendada/confirmada) que un paciente puede tener el mismo día'),
('Días máximos de anticipación para agendar', 'cita', '60', 'Hasta cuántos días en el futuro se puede agendar una cita'),
('Máximo de turnos por sede y fecha', 'turno', '999', 'Límite de turnos diarios por sede'),
('Turno solo el día de la cita', 'turno', '1', '1 = el turno solo se genera para el día actual; 0 = permite fechas futuras'),
('Máximo de intentos fallidos de login', 'acceso', '5', 'Intentos fallidos antes de bloquear temporalmente'),
('Minutos de bloqueo por intentos fallidos', 'acceso', '15', 'Duración del bloqueo temporal de login'),
('Longitud mínima de contraseña', 'acceso', '8', 'Caracteres mínimos al registrar una contraseña');


-- =========================================================
-- FUNCIONES, PROCEDIMIENTOS Y TRIGGERS
-- =========================================================
DELIMITER $$

-- Lee un parámetro numérico de REGLA_NEGOCIO (o el valor por defecto)
CREATE FUNCTION fn_regla_valor(p_nombre VARCHAR(100), p_defecto INT)
RETURNS INT
READS SQL DATA
BEGIN
    DECLARE v_valor INT;
    SELECT CAST(valor AS SIGNED) INTO v_valor
    FROM regla_negocio
    WHERE nombre = p_nombre AND activo = 1
    LIMIT 1;
    RETURN COALESCE(v_valor, p_defecto);
END$$

-- Valida una cita contra su horario y las reglas de negocio.
-- p_cita_id = 0 cuando es una cita nueva.
CREATE PROCEDURE sp_validar_cita(
    IN p_cita_id INT,
    IN p_paciente_id INT,
    IN p_horario_id INT,
    IN p_fecha DATE,
    IN p_hora TIME,
    IN p_duracion INT
)
BEGIN
    DECLARE v_medico INT;
    DECLARE v_dia VARCHAR(10);
    DECLARE v_ini TIME;
    DECLARE v_fin TIME;
    DECLARE v_dur INT;
    DECLARE v_cupo INT;
    DECLARE v_activo TINYINT;
    DECLARE v_ocupadas INT;

    -- El médico, la sede y la especialidad salen del horario (no se guardan en CITA)
    SELECT medico_id, dia_semana, hora_inicio, hora_fin, duracion_cita_min, cupo_maximo, activo
      INTO v_medico, v_dia, v_ini, v_fin, v_dur, v_cupo, v_activo
      FROM horario_medico
     WHERE horario_id = p_horario_id;

    IF v_activo IS NULL OR v_activo = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El horario no existe o está inactivo';
    END IF;

    IF p_fecha < CURDATE() OR (p_fecha = CURDATE() AND p_hora <= CURTIME()) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'La cita no puede programarse en una fecha u hora pasada';
    END IF;

    IF p_fecha > DATE_ADD(CURDATE(), INTERVAL fn_regla_valor('Días máximos de anticipación para agendar', 60) DAY) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'La fecha excede los días máximos de anticipación permitidos';
    END IF;

    IF ELT(WEEKDAY(p_fecha) + 1, 'Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo') <> v_dia THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'La fecha no corresponde al día de la semana del horario';
    END IF;

    IF p_hora < v_ini OR ADDTIME(p_hora, SEC_TO_TIME(p_duracion * 60)) > v_fin THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'La hora está fuera del horario del médico';
    END IF;

    IF MOD(TIME_TO_SEC(p_hora) - TIME_TO_SEC(v_ini), v_dur * 60) <> 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'La hora no coincide con las franjas del horario';
    END IF;

    -- Cupo por franja del MÉDICO (en cualquiera de sus horarios/sedes);
    -- ignora citas canceladas y la propia cita
    SELECT COUNT(*) INTO v_ocupadas
      FROM cita c
      JOIN horario_medico h ON h.horario_id = c.horario_id
     WHERE h.medico_id = v_medico
       AND c.fecha_cita = p_fecha
       AND c.hora_cita = p_hora
       AND c.estado <> 'cancelada'
       AND c.cita_id <> p_cita_id;

    IF v_ocupadas >= v_cupo THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'No hay cupo disponible en ese horario';
    END IF;

    -- Regla: máximo de citas activas por paciente y día
    SELECT COUNT(*) INTO v_ocupadas
      FROM cita
     WHERE paciente_id = p_paciente_id
       AND fecha_cita = p_fecha
       AND estado IN ('agendada','confirmada')
       AND cita_id <> p_cita_id;

    IF v_ocupadas >= fn_regla_valor('Máximo de citas activas por día', 1) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El paciente ya alcanzó el máximo de citas activas para ese día';
    END IF;
END$$

-- Genera un turno numerado (A-001, A-002...) por sede y fecha.
-- IMPORTANTE: llamar dentro de una transacción (el FOR UPDATE sobre
-- la sede serializa la numeración).
CREATE PROCEDURE sp_generar_turno(
    IN p_paciente_id INT,
    IN p_sede_id INT,
    IN p_cita_id INT,
    IN p_prioridad INT,
    OUT p_turno_id INT,
    OUT p_numero_turno VARCHAR(10)
)
BEGIN
    DECLARE v_sede INT;
    DECLARE v_sig INT;

    SELECT sede_id INTO v_sede
      FROM sede
     WHERE sede_id = p_sede_id AND activo = 1
       FOR UPDATE;

    IF v_sede IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'La sede no existe o está inactiva';
    END IF;

    IF EXISTS (SELECT 1 FROM turno
                WHERE paciente_id = p_paciente_id
                  AND sede_id = p_sede_id
                  AND fecha_turno = CURDATE()
                  AND estado IN ('generado','en_espera','llamado','en_atencion')) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El paciente ya tiene un turno activo hoy en esta sede';
    END IF;

    SELECT COALESCE(MAX(CAST(SUBSTRING(numero_turno, 3) AS UNSIGNED)), 0) + 1
      INTO v_sig
      FROM turno
     WHERE sede_id = p_sede_id AND fecha_turno = CURDATE();

    IF v_sig > fn_regla_valor('Máximo de turnos por sede y fecha', 999) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Se alcanzó el máximo de turnos del día en esta sede';
    END IF;

    SET p_numero_turno = CONCAT('A-', LPAD(v_sig, GREATEST(3, CHAR_LENGTH(v_sig)), '0'));

    INSERT INTO turno (cita_id, paciente_id, sede_id, numero_turno, fecha_turno, prioridad)
    VALUES (p_cita_id, p_paciente_id, p_sede_id, p_numero_turno, CURDATE(), COALESCE(p_prioridad, 0));

    SET p_turno_id = LAST_INSERT_ID();
END$$

-- PACIENTE: la fecha de nacimiento no puede ser futura
CREATE TRIGGER trg_paciente_bi BEFORE INSERT ON paciente
FOR EACH ROW
BEGIN
    IF NEW.fecha_nacimiento IS NOT NULL AND NEW.fecha_nacimiento > CURDATE() THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'La fecha de nacimiento no puede ser futura';
    END IF;
END$$

CREATE TRIGGER trg_paciente_bu BEFORE UPDATE ON paciente
FOR EACH ROW
BEGIN
    IF NEW.fecha_nacimiento IS NOT NULL AND NEW.fecha_nacimiento > CURDATE() THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'La fecha de nacimiento no puede ser futura';
    END IF;
END$$

-- CITA: valida al crear y al reprogramar
CREATE TRIGGER trg_cita_bi BEFORE INSERT ON cita
FOR EACH ROW
BEGIN
    IF NEW.estado IN ('agendada','confirmada') THEN
        CALL sp_validar_cita(0, NEW.paciente_id, NEW.horario_id,
                             NEW.fecha_cita, NEW.hora_cita, NEW.duracion_min);
    END IF;
END$$

CREATE TRIGGER trg_cita_bu BEFORE UPDATE ON cita
FOR EACH ROW
BEGIN
    IF NEW.estado IN ('agendada','confirmada')
       AND (NEW.fecha_cita <> OLD.fecha_cita
            OR NEW.hora_cita <> OLD.hora_cita
            OR NEW.horario_id <> OLD.horario_id
            OR OLD.estado = 'cancelada') THEN
        CALL sp_validar_cita(OLD.cita_id, NEW.paciente_id, NEW.horario_id,
                             NEW.fecha_cita, NEW.hora_cita, NEW.duracion_min);
    END IF;
END$$

-- TURNO: coherencia con la cita y con la regla "solo el día actual"
CREATE TRIGGER trg_turno_bi BEFORE INSERT ON turno
FOR EACH ROW
BEGIN
    DECLARE v_fecha DATE;
    DECLARE v_estado VARCHAR(20);
    DECLARE v_sede INT;

    IF fn_regla_valor('Turno solo el día de la cita', 1) = 1 AND NEW.fecha_turno <> CURDATE() THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El turno solo puede generarse para el día actual';
    END IF;

    IF NEW.cita_id IS NOT NULL THEN
        SELECT c.fecha_cita, c.estado, h.sede_id
          INTO v_fecha, v_estado, v_sede
          FROM cita c
          JOIN horario_medico h ON h.horario_id = c.horario_id
         WHERE c.cita_id = NEW.cita_id;

        IF v_sede IS NOT NULL AND v_sede <> NEW.sede_id THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'La sede del turno debe coincidir con la sede de la cita';
        END IF;

        IF v_fecha IS NOT NULL AND v_fecha <> NEW.fecha_turno THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'La fecha del turno debe coincidir con la fecha de la cita';
        END IF;

        IF v_estado IN ('cancelada','atendida','no_asistio') THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'La cita no admite generar un turno en su estado actual';
        END IF;
    END IF;
END$$

DELIMITER ;

-- =========================================================
-- VISTAS (para el panel administrativo y consultas)
-- =========================================================
-- Médico, sede y especialidad se obtienen del horario (CITA ya no los guarda)
CREATE VIEW vw_cita_detalle AS
SELECT c.cita_id, c.fecha_cita, c.hora_cita, c.duracion_min, c.estado, c.motivo,
       c.paciente_id,
       CONCAT(up.nombres, ' ', up.apellidos) AS paciente,
       up.numero_documento AS documento_paciente,
       up.telefono AS telefono_paciente,
       up.email AS email_paciente,
       h.medico_id,
       CONCAT(um.nombres, ' ', um.apellidos) AS medico,
       h.especialidad_id,
       e.nombre AS especialidad,
       h.sede_id,
       s.nombre AS sede
FROM cita c
JOIN horario_medico h ON h.horario_id = c.horario_id
JOIN usuario up ON up.usuario_id = c.paciente_id
JOIN usuario um ON um.usuario_id = h.medico_id
JOIN especialidad e ON e.especialidad_id = h.especialidad_id
JOIN sede s ON s.sede_id = h.sede_id;

-- Cola del día: orden de atención por prioridad y hora de generación
CREATE VIEW vw_cola_turnos AS
SELECT t.turno_id, t.sede_id, t.numero_turno, t.estado, t.prioridad,
       t.hora_generacion, t.modulo,
       CONCAT(u.nombres, ' ', u.apellidos) AS paciente,
       ROW_NUMBER() OVER (PARTITION BY t.sede_id ORDER BY t.prioridad DESC, t.hora_generacion) AS posicion
FROM turno t
JOIN usuario u ON u.usuario_id = t.paciente_id
WHERE t.fecha_turno = CURDATE()
  AND t.estado IN ('generado','en_espera','llamado','en_atencion');
