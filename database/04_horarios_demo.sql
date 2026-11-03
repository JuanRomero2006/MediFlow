-- Horarios de demostración para habilitar el agendamiento en local.
-- Ejecutar después de 01_clinica_previred.sql y 02_datos_demo.sql.
-- No borra datos ni crea citas; solo agrega/actualiza franjas de horario.
USE clinica_previred;
SET NAMES utf8mb4;

INSERT INTO horario_medico
    (medico_id, sede_id, especialidad_id, dia_semana, hora_inicio, hora_fin, duracion_cita_min, cupo_maximo, activo)
SELECT asignacion.medico_id, s.sede_id, e.especialidad_id, dias.dia_semana,
       franjas.hora_inicio, franjas.hora_fin, 30, 1, 1
FROM (
    SELECT 3 AS medico_id, 'Dermatología' AS especialidad, 'Sede Centro' AS sede
    UNION ALL SELECT 5, 'Cardiología', 'Sede Norte'
    UNION ALL SELECT 6, 'Pediatría', 'Sede Pitalito'
    UNION ALL SELECT 7, 'Medicina general', 'Sede Centro'
    UNION ALL SELECT 8, 'Ginecología', 'Sede Garzón'
    UNION ALL SELECT 9, 'Odontología', 'Sede Norte'
) AS asignacion
JOIN sede s ON s.nombre = asignacion.sede
JOIN especialidad e ON e.nombre = asignacion.especialidad
JOIN (
    SELECT 'Lunes' AS dia_semana UNION ALL SELECT 'Martes' UNION ALL
    SELECT 'Miércoles' UNION ALL SELECT 'Jueves' UNION ALL SELECT 'Viernes'
) AS dias
JOIN (
    SELECT '07:00:00' AS hora_inicio, '12:00:00' AS hora_fin
    UNION ALL SELECT '14:00:00', '17:00:00'
) AS franjas
ON DUPLICATE KEY UPDATE
    hora_fin = VALUES(hora_fin), duracion_cita_min = VALUES(duracion_cita_min),
    cupo_maximo = VALUES(cupo_maximo), activo = VALUES(activo);
