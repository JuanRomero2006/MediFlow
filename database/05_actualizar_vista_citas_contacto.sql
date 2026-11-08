-- Actualiza la vista para que el módulo médico pueda mostrar los datos
-- de contacto que el paciente ya registró. No expone contraseñas ni hashes.
CREATE OR REPLACE VIEW vw_cita_detalle AS
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
