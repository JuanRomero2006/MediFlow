-- Horarios de demostración para habilitar el agendamiento en local.
-- Ejecutar después de 01_clinica_previred.sql y 02_datos_demo.sql.
-- Habilita Medicina general y hasta tres especialidades adicionales.
-- No borra datos ni crea citas; desactiva franjas inválidas y agrega/actualiza horarios.
USE clinica_previred;
SET NAMES utf8mb4;

UPDATE horario_medico
SET activo = 0
WHERE medico_id IN (3, 5, 6, 7)
  AND dia_semana = ''
  AND activo = 1;

INSERT INTO horario_medico
    (medico_id, sede_id, especialidad_id, dia_semana, hora_inicio, hora_fin, duracion_cita_min, cupo_maximo, activo)
SELECT asignacion.medico_id, s.sede_id, e.especialidad_id, dias.dia_semana,
       franjas.hora_inicio, franjas.hora_fin, 30, 1, 1
FROM (
    SELECT 3 AS medico_id, 2 AS especialidad_id, 1 AS sede_id
    UNION ALL SELECT 5, 4, 2
    UNION ALL SELECT 6, 3, 3
    UNION ALL SELECT 7, 1, 1
) AS asignacion
JOIN medico m ON m.medico_id = asignacion.medico_id AND m.activo = 1
JOIN usuario u ON u.usuario_id = m.medico_id AND u.estado = 'activo'
JOIN medico_especialidad me
  ON me.medico_id = asignacion.medico_id
 AND me.especialidad_id = asignacion.especialidad_id
JOIN sede s ON s.sede_id = asignacion.sede_id AND s.activo = 1
JOIN especialidad e ON e.especialidad_id = asignacion.especialidad_id AND e.activo = 1
JOIN (
    SELECT 'Lunes' AS dia_semana UNION ALL SELECT 'Martes' UNION ALL
    SELECT 'Miércoles' UNION ALL SELECT 'Jueves' UNION ALL SELECT 'Viernes'
) AS dias ON 1 = 1
JOIN (
    SELECT '07:00:00' AS hora_inicio, '12:00:00' AS hora_fin
    UNION ALL SELECT '14:00:00', '17:00:00'
) AS franjas ON 1 = 1
ON DUPLICATE KEY UPDATE
    hora_fin = VALUES(hora_fin), duracion_cita_min = VALUES(duracion_cita_min),
    cupo_maximo = VALUES(cupo_maximo), activo = VALUES(activo);
