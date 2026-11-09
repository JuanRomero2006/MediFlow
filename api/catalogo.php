<?php

declare(strict_types=1);
/** Catálogo público para el agendamiento: especialidades, médicos y disponibilidad real. */
require_once __DIR__ . "/config/inicio.php";

if ($_SERVER["REQUEST_METHOD"] !== "GET") {
    header("Allow: GET");
    responder_error("Método no permitido.", 405);
}

$tipo = trim((string)($_GET["tipo"] ?? ""));

if ($tipo === "especialidades") {
    $sql = "SELECT e.especialidad_id, e.nombre, e.descripcion, COUNT(DISTINCT m.medico_id) AS total_medicos
              FROM especialidad e
              JOIN medico_especialidad me ON me.especialidad_id = e.especialidad_id
              JOIN medico m ON m.medico_id = me.medico_id AND m.activo = 1
              JOIN usuario u ON u.usuario_id = m.medico_id AND u.estado = 'activo'
              JOIN horario_medico hm ON hm.medico_id = m.medico_id
                   AND hm.especialidad_id = e.especialidad_id
                   AND hm.activo = 1
                   AND hm.dia_semana IN ('Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo')
             WHERE e.activo = 1
             GROUP BY e.especialidad_id, e.nombre, e.descripcion
             ORDER BY e.nombre";
    $rows = $conexion->query($sql)->fetch_all(MYSQLI_ASSOC);
    $items = array_map(static fn($r) => [
        "id" => (int)$r["especialidad_id"],
        "slug" => slug_profesional((string)$r["nombre"], ""),
        "nombre" => (string)$r["nombre"],
        "descripcion" => (string)($r["descripcion"] ?? ""),
        "profesionales" => (int)$r["total_medicos"],
    ], $rows);
    $conexion->close();
    responder_json(["ok" => true, "especialidades" => $items]);
}

if ($tipo === "profesionales") {
    $especialidadSlug = trim((string)($_GET["especialidad"] ?? ""));
    $sql = "SELECT DISTINCT u.usuario_id, u.nombres, u.apellidos, e.nombre AS especialidad,
                   e.especialidad_id, s.nombre AS sede
              FROM medico m
              JOIN usuario u ON u.usuario_id = m.medico_id
              JOIN medico_especialidad me ON me.medico_id = m.medico_id
              JOIN especialidad e ON e.especialidad_id = me.especialidad_id
              JOIN horario_medico hm ON hm.medico_id = m.medico_id
                   AND hm.especialidad_id = e.especialidad_id
                   AND hm.activo = 1
                   AND hm.dia_semana IN ('Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo')
              LEFT JOIN sede s ON s.sede_id = hm.sede_id
             WHERE m.activo = 1 AND u.estado = 'activo' AND e.activo = 1
             ORDER BY u.apellidos, u.nombres";
    $rows = $conexion->query($sql)->fetch_all(MYSQLI_ASSOC);
    if ($especialidadSlug !== "") {
        $rows = array_values(array_filter($rows, static fn($r) => slug_profesional((string)$r["especialidad"], "") === $especialidadSlug));
    }
    $items = [];
    foreach ($rows as $r) {
        $slug = slug_profesional((string)$r["nombres"], (string)$r["apellidos"]);
        $items[$slug] = [
            "id" => $slug,
            "nombre" => "Dr./Dra. " . trim($r["nombres"] . " " . $r["apellidos"]),
            "especialidad" => (string)$r["especialidad"],
            "especialidadSlug" => slug_profesional((string)$r["especialidad"], ""),
            "sede" => (string)($r["sede"] ?? "Sede por confirmar"),
        ];
    }
    $conexion->close();
    responder_json(["ok" => true, "profesionales" => array_values($items)]);
}

if ($tipo === "horarios") {
    $medicoSlug = trim((string)($_GET["medico"] ?? ""));
    $especialidadSlug = trim((string)($_GET["especialidad"] ?? ""));
    $fecha = trim((string)($_GET["fecha"] ?? ""));
    $fechaObj = DateTimeImmutable::createFromFormat("!Y-m-d", $fecha);
    if (!$fechaObj || $fechaObj->format("Y-m-d") !== $fecha || $fecha < date("Y-m-d")) {
        responder_error("Selecciona una fecha válida a partir de hoy.", 422);
    }
    if ($medicoSlug === "" || $especialidadSlug === "") responder_error("Selecciona el profesional y la especialidad.", 422);
    [$medicoId, $especialidadId] = resolver_ids_agendamiento($conexion, $medicoSlug, $especialidadSlug);
    if (!$medicoId || !$especialidadId) responder_error("El profesional o la especialidad no están disponibles.", 404);
    $stmt = $conexion->prepare(
        "SELECT hm.horario_id, hm.dia_semana, hm.hora_inicio, hm.hora_fin, hm.duracion_cita_min, hm.cupo_maximo
           FROM horario_medico hm
          WHERE hm.medico_id = ? AND hm.especialidad_id = ? AND hm.dia_semana = ? AND hm.activo = 1
          ORDER BY hm.horario_id"
    );
    $diaMap = ["Monday"=>"Lunes", "Tuesday"=>"Martes", "Wednesday"=>"Miércoles", "Thursday"=>"Jueves", "Friday"=>"Viernes", "Saturday"=>"Sábado", "Sunday"=>"Domingo"];
    $dia = $diaMap[$fechaObj->format("l")];
    $stmt->bind_param("iis", $medicoId, $especialidadId, $dia);
    $stmt->execute();
    $horarios = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    $stmt->close();
    $ocupacion = cargar_ocupacion_agendamiento($conexion, $medicoId, $fecha, $fecha);
    $slots = generar_slots_agendamiento($horarios, $ocupacion, $fechaObj);
    $conexion->close();
    responder_json(["ok" => true, "horarios" => $slots]);
}

if ($tipo === "fechas") {
    $medicoSlug = trim((string)($_GET["medico"] ?? ""));
    $especialidadSlug = trim((string)($_GET["especialidad"] ?? ""));
    $desde = trim((string)($_GET["desde"] ?? ""));
    $dias = filter_var($_GET["dias"] ?? 21, FILTER_VALIDATE_INT);
    $desdeObj = DateTimeImmutable::createFromFormat("!Y-m-d", $desde);

    if (!$desdeObj || $desdeObj->format("Y-m-d") !== $desde || $desde < date("Y-m-d")) {
        responder_error("El rango de fechas para consultar disponibilidad no es válido.", 422);
    }
    if ($medicoSlug === "" || $especialidadSlug === "" || $dias === false || $dias < 1 || $dias > 31) {
        responder_error("Selecciona un profesional, una especialidad y un rango de hasta 31 días.", 422);
    }

    [$medicoId, $especialidadId] = resolver_ids_agendamiento($conexion, $medicoSlug, $especialidadSlug);
    if (!$medicoId || !$especialidadId) responder_error("El profesional o la especialidad no están disponibles.", 404);

    $hastaObj = $desdeObj->modify("+" . ($dias - 1) . " days");
    $hasta = $hastaObj->format("Y-m-d");
    $stmt = $conexion->prepare(
        "SELECT hm.horario_id, hm.dia_semana, hm.hora_inicio, hm.hora_fin, hm.duracion_cita_min, hm.cupo_maximo
           FROM horario_medico hm
          WHERE hm.medico_id = ? AND hm.especialidad_id = ? AND hm.activo = 1
          ORDER BY hm.horario_id"
    );
    $stmt->bind_param("ii", $medicoId, $especialidadId);
    $stmt->execute();
    $horarios = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    $stmt->close();
    $ocupacion = cargar_ocupacion_agendamiento($conexion, $medicoId, $desde, $hasta);
    $fechas = [];

    for ($i = 0; $i < $dias; $i++) {
        $fechaObj = $desdeObj->modify("+{$i} days");
        if (generar_slots_agendamiento($horarios, $ocupacion, $fechaObj)) {
            $fechas[] = $fechaObj->format("Y-m-d");
        }
    }

    $conexion->close();
    responder_json(["ok" => true, "fechas" => $fechas]);
}

$conexion->close();
responder_error("Tipo de catálogo no válido.", 400);
