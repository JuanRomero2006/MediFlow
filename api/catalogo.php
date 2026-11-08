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
              LEFT JOIN medico_especialidad me ON me.especialidad_id = e.especialidad_id
              LEFT JOIN medico m ON m.medico_id = me.medico_id AND m.activo = 1
              LEFT JOIN usuario u ON u.usuario_id = m.medico_id AND u.estado = 'activo'
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
              LEFT JOIN horario_medico hm ON hm.medico_id = m.medico_id AND hm.especialidad_id = e.especialidad_id AND hm.activo = 1
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
    // Resolver los identificadores comparando slugs normalizados en PHP.
    $medicos = $conexion->query(
        "SELECT m.medico_id, u.nombres, u.apellidos
           FROM medico m JOIN usuario u ON u.usuario_id = m.medico_id
          WHERE m.activo = 1 AND u.estado = 'activo'"
    )->fetch_all(MYSQLI_ASSOC);
    $medicoId = 0;
    foreach ($medicos as $medico) {
        if (slug_profesional((string)$medico["nombres"], (string)$medico["apellidos"]) === $medicoSlug) {
            $medicoId = (int)$medico["medico_id"];
            break;
        }
    }
    $especialidades = $conexion->query("SELECT especialidad_id, nombre FROM especialidad WHERE activo = 1")->fetch_all(MYSQLI_ASSOC);
    $especialidadId = 0;
    foreach ($especialidades as $especialidad) {
        if (slug_profesional((string)$especialidad["nombre"], "") === $especialidadSlug) {
            $especialidadId = (int)$especialidad["especialidad_id"];
            break;
        }
    }
    if (!$medicoId || !$especialidadId) responder_error("El profesional o la especialidad no están disponibles.", 404);
    $stmt = $conexion->prepare(
        "SELECT hm.horario_id, hm.hora_inicio, hm.hora_fin, hm.duracion_cita_min, hm.cupo_maximo
           FROM horario_medico hm
          WHERE hm.medico_id = ? AND hm.especialidad_id = ? AND hm.dia_semana = ? AND hm.activo = 1
          ORDER BY hm.hora_inicio"
    );
    $diaMap = ["Monday"=>"Lunes", "Tuesday"=>"Martes", "Wednesday"=>"Miércoles", "Thursday"=>"Jueves", "Friday"=>"Viernes", "Saturday"=>"Sábado", "Sunday"=>"Domingo"];
    $dia = $diaMap[$fechaObj->format("l")];
    $stmt->bind_param("iis", $medicoId, $especialidadId, $dia);
    $stmt->execute();
    $horarios = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    $stmt->close();

    $slots = [];
    foreach ($horarios as $h) {
        $inicio = new DateTimeImmutable($fecha . " " . $h["hora_inicio"]);
        $fin = new DateTimeImmutable($fecha . " " . $h["hora_fin"]);
        $duracion = max(5, (int)$h["duracion_cita_min"]);
        while ($inicio->modify("+{$duracion} minutes") <= $fin) {
            $hora = $inicio->format("H:i:s");
            $stmt = $conexion->prepare(
                "SELECT COUNT(*) AS ocupados FROM cita
                  WHERE horario_id = ? AND fecha_cita = ? AND hora_cita = ? AND estado <> 'cancelada'"
            );
            $horarioId = (int)$h["horario_id"];
            $stmt->bind_param("iss", $horarioId, $fecha, $hora);
            $stmt->execute();
            $ocupados = (int)$stmt->get_result()->fetch_assoc()["ocupados"];
            $stmt->close();
            $disponibles = max(0, (int)$h["cupo_maximo"] - $ocupados);
            if ($disponibles > 0 && ($fecha > date("Y-m-d") || $hora > date("H:i:s"))) {
                $slots[] = ["hora" => date("h:i A", strtotime($hora)), "disponibles" => $disponibles];
            }
            $inicio = $inicio->modify("+{$duracion} minutes");
        }
    }
    $conexion->close();
    responder_json(["ok" => true, "horarios" => $slots]);
}

$conexion->close();
responder_error("Tipo de catálogo no válido.", 400);
