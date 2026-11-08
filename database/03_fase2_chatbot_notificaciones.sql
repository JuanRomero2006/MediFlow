-- =========================================================
-- FASE 2: CHATBOT Y NOTIFICACIONES (opcional, importar después de 01 y 02)
-- Tablas 14 a 18 del modelo. Las preguntas salen de data/faqs.js del front.
-- =========================================================
USE clinica_previred;
SET NAMES utf8mb4;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS notificacion;
DROP TABLE IF EXISTS mensaje_chatbot;
DROP TABLE IF EXISTS conversacion_chatbot;
DROP TABLE IF EXISTS chatbot_palabra_clave;
DROP TABLE IF EXISTS chatbot_pregunta;
DROP TABLE IF EXISTS chatbot_tema;
SET FOREIGN_KEY_CHECKS = 1;

-- =========================================================
-- 14. CHATBOT_TEMA
-- =========================================================
CREATE TABLE chatbot_tema (
    tema_id INT NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    descripcion VARCHAR(255) NULL,
    activo TINYINT(1) NOT NULL DEFAULT 1,
    PRIMARY KEY (tema_id),
    UNIQUE KEY uq_chatbot_tema_nombre (nombre),
    CONSTRAINT chk_chatbot_tema_activo CHECK (activo IN (0,1))
) ENGINE=InnoDB;

-- =========================================================
-- 15. CHATBOT_PREGUNTA
--     MEJORA: índice FULLTEXT para buscar la respuesta por
--     texto de la pregunta o palabras clave.
-- =========================================================
CREATE TABLE chatbot_pregunta (
    pregunta_id INT NOT NULL AUTO_INCREMENT,
    tema_id INT NOT NULL,
    pregunta TEXT NOT NULL,
    respuesta TEXT NOT NULL,
    prioridad INT NOT NULL DEFAULT 1,
    activo TINYINT(1) NOT NULL DEFAULT 1,
    fecha_actualizacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    actualizado_por_usuario_id INT NULL,
    PRIMARY KEY (pregunta_id),
    KEY idx_chatbot_pregunta_tema (tema_id),
    KEY idx_chatbot_pregunta_usuario (actualizado_por_usuario_id),
    FULLTEXT KEY ft_chatbot_busqueda (pregunta),
    CONSTRAINT fk_chatbot_pregunta_tema
        FOREIGN KEY (tema_id) REFERENCES chatbot_tema (tema_id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_chatbot_pregunta_usuario
        FOREIGN KEY (actualizado_por_usuario_id) REFERENCES usuario (usuario_id)
        ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT chk_chatbot_pregunta_prioridad CHECK (prioridad >= 1),
    CONSTRAINT chk_chatbot_pregunta_activo CHECK (activo IN (0,1))
) ENGINE=InnoDB;

-- =========================================================
-- 15b. CHATBOT_PALABRA_CLAVE   (NORMALIZACIÓN 1FN)
--      Antes: chatbot_pregunta.palabras_clave = 'agendar,cita,solicitar'
--      (una lista dentro de una celda). Ahora cada palabra es una fila.
--      Relación 1:N: una pregunta tiene varias palabras clave.
-- =========================================================
CREATE TABLE chatbot_palabra_clave (
    pregunta_id INT NOT NULL,
    palabra VARCHAR(50) NOT NULL,
    PRIMARY KEY (pregunta_id, palabra),
    KEY idx_palabra (palabra),
    CONSTRAINT fk_palabra_pregunta
        FOREIGN KEY (pregunta_id) REFERENCES chatbot_pregunta (pregunta_id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT chk_palabra_longitud CHECK (CHAR_LENGTH(TRIM(palabra)) >= 2)
) ENGINE=InnoDB;

-- =========================================================
-- 16. CONVERSACION_CHATBOT
-- =========================================================
CREATE TABLE conversacion_chatbot (
    conversacion_id INT NOT NULL AUTO_INCREMENT,
    usuario_id INT NULL COMMENT 'NULL = conversación anónima',
    fecha_inicio DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_fin DATETIME NULL,
    canal ENUM('web','app','whatsapp') NOT NULL DEFAULT 'web',
    PRIMARY KEY (conversacion_id),
    KEY idx_conversacion_usuario (usuario_id),
    CONSTRAINT fk_conversacion_usuario
        FOREIGN KEY (usuario_id) REFERENCES usuario (usuario_id)
        ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT chk_conversacion_fechas CHECK (fecha_fin IS NULL OR fecha_fin >= fecha_inicio)
) ENGINE=InnoDB;

-- =========================================================
-- 17. MENSAJE_CHATBOT
-- =========================================================
CREATE TABLE mensaje_chatbot (
    mensaje_id INT NOT NULL AUTO_INCREMENT,
    conversacion_id INT NOT NULL,
    emisor ENUM('usuario','bot') NOT NULL,
    mensaje TEXT NOT NULL,
    fecha_hora DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    intencion_detectada VARCHAR(100) NULL,
    pregunta_id INT NULL,
    metadata JSON NULL,
    PRIMARY KEY (mensaje_id),
    KEY idx_mensaje_conversacion (conversacion_id, fecha_hora),
    KEY idx_mensaje_pregunta (pregunta_id),
    CONSTRAINT fk_mensaje_conversacion
        FOREIGN KEY (conversacion_id) REFERENCES conversacion_chatbot (conversacion_id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_mensaje_pregunta
        FOREIGN KEY (pregunta_id) REFERENCES chatbot_pregunta (pregunta_id)
        ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT chk_mensaje_metadata CHECK (metadata IS NULL OR JSON_VALID(metadata))
) ENGINE=InnoDB;

-- =========================================================
-- 18. NOTIFICACION
-- =========================================================
CREATE TABLE notificacion (
    notificacion_id INT NOT NULL AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    tipo ENUM('cita','turno','chatbot','sistema','recordatorio') NOT NULL,
    titulo VARCHAR(100) NOT NULL,
    mensaje TEXT NOT NULL,
    fecha_envio DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    leida TINYINT(1) NOT NULL DEFAULT 0,
    canal ENUM('app','email','sms','push') NOT NULL DEFAULT 'app',
    prioridad ENUM('baja','media','alta','urgente') NOT NULL DEFAULT 'media',
    PRIMARY KEY (notificacion_id),
    KEY idx_notificacion_usuario_leida (usuario_id, leida),
    CONSTRAINT fk_notificacion_usuario
        FOREIGN KEY (usuario_id) REFERENCES usuario (usuario_id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT chk_notificacion_leida CHECK (leida IN (0,1))
) ENGINE=InnoDB;


INSERT INTO chatbot_tema (nombre, descripcion) VALUES
('Citas', 'Agendar, cancelar y consultar citas'),
('Acceso', 'Cuenta e inicio de sesión'),
('Turnos', 'Consulta y estado del turno'),
('Servicios', 'Servicios de la clínica'),
('Atención general', 'Alcance del asistente');

INSERT INTO chatbot_pregunta (tema_id, pregunta, respuesta, prioridad)
SELECT tema_id, '¿Cómo agendo una cita médica?', 'Ingresa a Solicitar cita, elige la especialidad, el profesional, la fecha y el horario disponible. Luego confirmas tus datos.', 1 FROM chatbot_tema WHERE nombre = 'Citas';
INSERT INTO chatbot_pregunta (tema_id, pregunta, respuesta, prioridad)
SELECT tema_id, '¿Necesito una cuenta para agendar?', 'Puedes agendar como invitado. Si inicias sesión como paciente, tus citas quedarán vinculadas a tu panel.', 1 FROM chatbot_tema WHERE nombre = 'Acceso';
INSERT INTO chatbot_pregunta (tema_id, pregunta, respuesta, prioridad)
SELECT tema_id, '¿Cómo inicio sesión?', 'Usa el enlace Iniciar sesión con tu correo o usuario de demostración. El sistema te llevará al panel según tu rol.', 1 FROM chatbot_tema WHERE nombre = 'Acceso';
INSERT INTO chatbot_pregunta (tema_id, pregunta, respuesta, prioridad)
SELECT tema_id, '¿Cómo consulto mi turno?', 'En el panel del paciente, sección Turnos, verás el número y estado de tu turno virtual del día.', 1 FROM chatbot_tema WHERE nombre = 'Turnos';
INSERT INTO chatbot_pregunta (tema_id, pregunta, respuesta, prioridad)
SELECT tema_id, '¿Puedo cancelar o reprogramar?', 'Desde Mis citas puedes cancelar hasta 4 horas antes del horario agendado (demostración local).', 1 FROM chatbot_tema WHERE nombre = 'Citas';
INSERT INTO chatbot_pregunta (tema_id, pregunta, respuesta, prioridad)
SELECT tema_id, '¿Atienden a domicilio?', 'Sí, contamos con atención domiciliaria para pacientes que no pueden desplazarse (información demostrativa).', 1 FROM chatbot_tema WHERE nombre = 'Servicios';
INSERT INTO chatbot_pregunta (tema_id, pregunta, respuesta, prioridad)
SELECT tema_id, '¿El chat entrega diagnósticos?', 'No. El asistente orienta sobre navegación, citas y turnos. No sustituye la consulta médica.', 1 FROM chatbot_tema WHERE nombre = 'Atención general';

INSERT INTO chatbot_palabra_clave (pregunta_id, palabra)
SELECT pregunta_id, 'agendar' FROM chatbot_pregunta WHERE pregunta = '¿Cómo agendo una cita médica?';
INSERT INTO chatbot_palabra_clave (pregunta_id, palabra)
SELECT pregunta_id, 'cita' FROM chatbot_pregunta WHERE pregunta = '¿Cómo agendo una cita médica?';
INSERT INTO chatbot_palabra_clave (pregunta_id, palabra)
SELECT pregunta_id, 'solicitar' FROM chatbot_pregunta WHERE pregunta = '¿Cómo agendo una cita médica?';
INSERT INTO chatbot_palabra_clave (pregunta_id, palabra)
SELECT pregunta_id, 'cuenta' FROM chatbot_pregunta WHERE pregunta = '¿Necesito una cuenta para agendar?';
INSERT INTO chatbot_palabra_clave (pregunta_id, palabra)
SELECT pregunta_id, 'registro' FROM chatbot_pregunta WHERE pregunta = '¿Necesito una cuenta para agendar?';
INSERT INTO chatbot_palabra_clave (pregunta_id, palabra)
SELECT pregunta_id, 'login' FROM chatbot_pregunta WHERE pregunta = '¿Necesito una cuenta para agendar?';
INSERT INTO chatbot_palabra_clave (pregunta_id, palabra)
SELECT pregunta_id, 'iniciar' FROM chatbot_pregunta WHERE pregunta = '¿Cómo inicio sesión?';
INSERT INTO chatbot_palabra_clave (pregunta_id, palabra)
SELECT pregunta_id, 'sesión' FROM chatbot_pregunta WHERE pregunta = '¿Cómo inicio sesión?';
INSERT INTO chatbot_palabra_clave (pregunta_id, palabra)
SELECT pregunta_id, 'login' FROM chatbot_pregunta WHERE pregunta = '¿Cómo inicio sesión?';
INSERT INTO chatbot_palabra_clave (pregunta_id, palabra)
SELECT pregunta_id, 'acceso' FROM chatbot_pregunta WHERE pregunta = '¿Cómo inicio sesión?';
INSERT INTO chatbot_palabra_clave (pregunta_id, palabra)
SELECT pregunta_id, 'turno' FROM chatbot_pregunta WHERE pregunta = '¿Cómo consulto mi turno?';
INSERT INTO chatbot_palabra_clave (pregunta_id, palabra)
SELECT pregunta_id, 'espera' FROM chatbot_pregunta WHERE pregunta = '¿Cómo consulto mi turno?';
INSERT INTO chatbot_palabra_clave (pregunta_id, palabra)
SELECT pregunta_id, 'número' FROM chatbot_pregunta WHERE pregunta = '¿Cómo consulto mi turno?';
INSERT INTO chatbot_palabra_clave (pregunta_id, palabra)
SELECT pregunta_id, 'cancelar' FROM chatbot_pregunta WHERE pregunta = '¿Puedo cancelar o reprogramar?';
INSERT INTO chatbot_palabra_clave (pregunta_id, palabra)
SELECT pregunta_id, 'reprogramar' FROM chatbot_pregunta WHERE pregunta = '¿Puedo cancelar o reprogramar?';
INSERT INTO chatbot_palabra_clave (pregunta_id, palabra)
SELECT pregunta_id, 'domicilio' FROM chatbot_pregunta WHERE pregunta = '¿Atienden a domicilio?';
INSERT INTO chatbot_palabra_clave (pregunta_id, palabra)
SELECT pregunta_id, 'casa' FROM chatbot_pregunta WHERE pregunta = '¿Atienden a domicilio?';
INSERT INTO chatbot_palabra_clave (pregunta_id, palabra)
SELECT pregunta_id, 'diagnóstico' FROM chatbot_pregunta WHERE pregunta = '¿El chat entrega diagnósticos?';
INSERT INTO chatbot_palabra_clave (pregunta_id, palabra)
SELECT pregunta_id, 'chat' FROM chatbot_pregunta WHERE pregunta = '¿El chat entrega diagnósticos?';
INSERT INTO chatbot_palabra_clave (pregunta_id, palabra)
SELECT pregunta_id, 'bot' FROM chatbot_pregunta WHERE pregunta = '¿El chat entrega diagnósticos?';
