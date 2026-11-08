<?php

declare(strict_types=1);

/** API de citas: lectura por rol, cancelación del paciente y gestión en recepción. */
require_once __DIR__ . "/config/inicio.php";
iniciar_sesion_segura();

if (empty($_SESSION["usuario_id"])) {
    responder_error("Debes iniciar sesión para consultar las citas.", 401);
}

$usuario = cargar_usuario_frontend($conexion, (int) $_SESSION["usuario_id"]);
if (!$usuario) {
    responder_error("La sesión no es válida. Inicia sesión de nuevo.", 401);
}

function mapear_cita_frontend(array $row): array
{
    $estados = ["agendada" => "pendiente", "confirmada" => "confirmada", "cancelada" => "cancelada", "atendida" => "atendida", "no_asistio" => "no_asistio"];
    $hora = DateTimeImmutable::createFromFormat("!H:i:s", (string) $row["hora_cita"]);
    return [
        "id" => (string) $row["cita_id"],
        "pacienteId" => (int) $row["paciente_id"],
        "pacienteNombre" => (string) $row["paciente"],
        "documento" => (string) ($row["documento_paciente"] ?? ""),
        "telefono" => (string) ($row["telefono_paciente"] ?? ""),
        "email" => (string) ($row["email_paciente"] ?? ""),
        "especialidadSlug" => slug_profesional((string) $row["especialidad"], ""),
        "especialidad" => (string) $row["especialidad"],
        "profesionalId" => slug_profesional((string) $row["medico"], ""),
        "profesional" => (string) $row["medico"],
        "fecha" => (string) $row["fecha_cita"],
        "hora" => $hora ? $hora->format("h:i A") : (string) $row["hora_cita"],
        "sede" => (string) $row["sede"],
        "estado" => $estados[(string) $row["estado"]] ?? (string) $row["estado"],
        "motivo" => (string) ($row["motivo"] ?? ""),
        "creadaEn" => strtotime((string) ($row["fecha_creacion"] ?? "now")) * 1000,
    ];
}

function cargar_cita(mysqli $conexion, int $id): ?array
{
    $stmt = $conexion->prepare("SELECT * FROM vw_cita_detalle WHERE cita_id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $row = $stmt->get_result()->fetch_assoc();
    $stmt->close();
    return $row ?: null;
}

if ($_SERVER["REQUEST_METHOD"] === "GET") {
    if (!in_array($usuario["rol"], ["paciente", "medico", "recepcion", "administrador"], true)) {
        responder_error("No tienes permiso para consultar estas citas.", 403);
    }
    $fecha = isset($_GET["fecha"]) && preg_match("/^\d{4}-\d{2}-\d{2}$/", (string) $_GET["fecha"]) ? (string) $_GET["fecha"] : "";
    $sql = "SELECT * FROM vw_cita_detalle";
    $params = [];
    $types = "";
    $where = [];
    if ($usuario["rol"] === "paciente") {
        $where[] = "paciente_id = ?";
        $params[] = (int) $usuario["pacienteId"];
        $types .= "i";
    } elseif ($usuario["rol"] === "medico") {
        // El médico solo puede consultar citas asignadas a su propio usuario.
        $where[] = "medico_id = ?";
        $params[] = (int) $usuario["id"];
        $types .= "i";
    }
    if ($fecha !== "") {
        $where[] = "fecha_cita = ?";
        $params[] = $fecha;
        $types .= "s";
    }
    if ($where) $sql .= " WHERE " . implode(" AND ", $where);
    $sql .= " ORDER BY fecha_cita DESC, hora_cita DESC LIMIT 500";
    $stmt = $conexion->prepare($sql);
    if ($params) $stmt->bind_param($types, ...$params);
    $stmt->execute();
    $rows = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    $stmt->close();
    $conexion->close();
    responder_json(["ok" => true, "citas" => array_map("mapear_cita_frontend", $rows)]);
}

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    header("Allow: GET, POST");
    responder_error("Método no permitido.", 405);
}
verificar_csrf();
$datos = leer_json();
$accion = texto($datos, "accion");

// Crear una cita nueva cuando el frontend envía los datos del agendamiento.
// Las acciones de cancelar/confirmar/registrar_llegada siguen requiriendo citaId.
if ($accion === "" && !isset($datos["citaId"])) {
    if ($usuario["rol"] !== "paciente" || empty($usuario["pacienteId"])) {
        responder_error("Para agendar una cita debes iniciar sesión con una cuenta de paciente.", 403);
    }

    $profesionalSlug = texto($datos, "profesionalId");
    $especialidadSlug = texto($datos, "especialidadSlug");
    $fecha = texto($datos, "fecha");
    $horaEntrada = texto($datos, "hora");
    $motivo = mb_substr(trim(texto($datos, "motivo")), 0, 255, "UTF-8");

    if ($profesionalSlug === "" || $especialidadSlug === "" || $fecha === "" || $horaEntrada === "") {
        responder_error("Faltan datos obligatorios para registrar la cita.");
    }
    $fechaObj = DateTimeImmutable::createFromFormat("!Y-m-d", $fecha);
    if (!$fechaObj || $fechaObj->format("Y-m-d") !== $fecha) {
        responder_error("La fecha seleccionada no es válida.");
    }
    $horaObj = DateTimeImmutable::createFromFormat("!h:i A", strtoupper($horaEntrada));
    if (!$horaObj) responder_error("La hora seleccionada no es válida.");
    $hora = $horaObj->format("H:i:s");

    // Resolver profesional y especialidad desde MySQL (sin IDs ficticios ni catálogos locales).
    $medicos = $conexion->query(
        "SELECT m.medico_id, u.nombres, u.apellidos
           FROM medico m JOIN usuario u ON u.usuario_id = m.medico_id
          WHERE m.activo = 1 AND u.estado = 'activo'"
    )->fetch_all(MYSQLI_ASSOC);
    $medicoId = 0;
    foreach ($medicos as $medico) {
        if (slug_profesional((string)$medico["nombres"], (string)$medico["apellidos"]) === $profesionalSlug) {
            $medicoId = (int)$medico["medico_id"];
            break;
        }
    }
    if (!$medicoId) responder_error("El profesional seleccionado no está disponible.", 422);

    $especialidades = $conexion->query("SELECT especialidad_id, nombre FROM especialidad WHERE activo = 1")->fetch_all(MYSQLI_ASSOC);
    $especialidadId = 0;
    foreach ($especialidades as $especialidadRow) {
        if (slug_profesional((string)$especialidadRow["nombre"], "") === $especialidadSlug) {
            $especialidadId = (int)$especialidadRow["especialidad_id"];
            break;
        }
    }
    if (!$especialidadId) responder_error("La especialidad seleccionada no está disponible.", 422);
    $dias = ["Monday"=>"Lunes", "Tuesday"=>"Martes", "Wednesday"=>"Miércoles", "Thursday"=>"Jueves", "Friday"=>"Viernes", "Saturday"=>"Sábado", "Sunday"=>"Domingo"];
    $dia = $dias[$fechaObj->format("l")];
    $stmt = $conexion->prepare(
        "SELECT horario_id, duracion_cita_min, cupo_maximo
           FROM horario_medico
          WHERE medico_id = ? AND especialidad_id = ? AND dia_semana = ? AND activo = 1
            AND hora_inicio <= ?
            AND ADDTIME(?, SEC_TO_TIME(duracion_cita_min * 60)) <= hora_fin
            AND MOD(TIME_TO_SEC(?) - TIME_TO_SEC(hora_inicio), duracion_cita_min * 60) = 0
          ORDER BY horario_id LIMIT 1"
    );
    $stmt->bind_param("iissss", $medicoId, $especialidadId, $dia, $hora, $hora, $hora);
    $stmt->execute();
    $horario = $stmt->get_result()->fetch_assoc();
    $stmt->close();
    if (!$horario) responder_error("No hay un horario configurado para ese profesional, fecha y hora. Elige otro horario.", 422);

    try {
        $estado = "agendada";
        $duracion = (int) $horario["duracion_cita_min"];
        $pacienteId = (int) $usuario["pacienteId"];
        $creadaPor = (int) $usuario["id"];
        $stmt = $conexion->prepare(
            "INSERT INTO cita (paciente_id, horario_id, fecha_cita, hora_cita, duracion_min, estado, motivo, creada_por_usuario_id)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
        );
        $horarioId = (int) $horario["horario_id"];
        $stmt->bind_param("iississi", $pacienteId, $horarioId, $fecha, $hora, $duracion, $estado, $motivo, $creadaPor);
        $stmt->execute();
        $citaIdNueva = (int) $conexion->insert_id;
        $stmt->close();
    } catch (mysqli_sql_exception $e) {
        error_log("Error creando cita: " . $e->getMessage());
        $mensaje = $e->getMessage();
        if (str_contains($mensaje, "máximo de citas activas")) responder_error("Ya tienes una cita activa para ese día.", 422);
        if (str_contains($mensaje, "No hay cupo disponible")) responder_error("Ese horario acaba de ocuparse. Selecciona otro.", 409);
        if (str_contains($mensaje, "fecha u hora pasada")) responder_error("No puedes agendar una cita en una fecha u hora pasada.", 422);
        responder_error("No fue posible registrar la cita. Verifica el horario e inténtalo de nuevo.", 422);
    }
    registrar_bitacora($conexion, (int) $usuario["id"], "cita_creada", "Cita #" . $citaIdNueva);
    $conexion->close();
    responder_json(["ok" => true, "message" => "Cita registrada correctamente.", "cita" => ["id" => $citaIdNueva, "fecha" => $fecha, "hora" => $hora, "estado" => "pendiente"]], 201);
}

$citaId = filter_var($datos["citaId"] ?? null, FILTER_VALIDATE_INT);
if (!$citaId || $citaId < 1) responder_error("El identificador de la cita no es válido.");
$cita = cargar_cita($conexion, $citaId);
if (!$cita) responder_error("No se encontró la cita solicitada.", 404);

if ($accion === "cancelar") {
    if ($usuario["rol"] !== "paciente" || (int) $cita["paciente_id"] !== (int) $usuario["pacienteId"]) {
        responder_error("Solo puedes cancelar tus propias citas.", 403);
    }
    if (in_array($cita["estado"], ["cancelada", "atendida", "no_asistio"], true)) {
        responder_error("Esta cita ya no se puede cancelar.", 422);
    }
    $nuevoEstado = "cancelada";
} elseif ($accion === "confirmar") {
    if (!in_array($usuario["rol"], ["recepcion", "administrador"], true)) responder_error("No tienes permiso para confirmar citas.", 403);
    if ($cita["estado"] !== "agendada") responder_error("Solo se pueden confirmar citas agendadas.", 422);
    $nuevoEstado = "confirmada";
} elseif ($accion === "atender") {
    if ($usuario["rol"] !== "medico") responder_error("Solo el médico asignado puede finalizar la atención.", 403);
    if ((int) $cita["medico_id"] !== (int) $usuario["id"]) responder_error("No puedes modificar una cita asignada a otro profesional.", 403);
    if (!in_array($cita["estado"], ["agendada", "confirmada"], true)) responder_error("Esta cita no está disponible para atención.", 422);
    $nuevoEstado = "atendida";
} elseif ($accion === "registrar_llegada") {
    if (!in_array($usuario["rol"], ["recepcion", "administrador"], true)) responder_error("No tienes permiso para registrar llegadas.", 403);
    if ($cita["estado"] === "cancelada") responder_error("No se puede registrar la llegada de una cita cancelada.", 422);
    $stmt = $conexion->prepare("SELECT turno_id FROM turno WHERE cita_id = ? LIMIT 1");
    $stmt->bind_param("i", $citaId);
    $stmt->execute();
    $turnoExistente = $stmt->get_result()->fetch_assoc();
    $stmt->close();
    if ($turnoExistente) responder_error("Esta cita ya tiene un turno registrado.", 409);

    $stmt = $conexion->prepare("SELECT sede_id FROM horario_medico WHERE horario_id = (SELECT horario_id FROM cita WHERE cita_id = ?)");
    $stmt->bind_param("i", $citaId);
    $stmt->execute();
    $horario = $stmt->get_result()->fetch_assoc();
    $stmt->close();
    if (!$horario) responder_error("No se encontró la sede de esta cita.", 422);
    $sedeId = (int) $horario["sede_id"];
    $fechaCita = (string) $cita["fecha_cita"];
    $conexion->begin_transaction();
    try {
        $stmt = $conexion->prepare("SELECT COUNT(*) AS total FROM turno WHERE sede_id = ? AND fecha_turno = ?");
        $stmt->bind_param("is", $sedeId, $fechaCita);
        $stmt->execute();
        $total = (int) $stmt->get_result()->fetch_assoc()["total"];
        $stmt->close();
        $numero = "T" . str_pad((string) ($total + 1), 3, "0", STR_PAD_LEFT);
        $estadoTurno = "en_espera";
        $stmt = $conexion->prepare("INSERT INTO turno (cita_id, paciente_id, sede_id, numero_turno, fecha_turno, estado, observaciones) VALUES (?, ?, ?, ?, ?, ?, ?)");
        $pacienteId = (int) $cita["paciente_id"];
        $observaciones = "Llegada registrada desde recepción para la cita #" . $citaId;
        $stmt->bind_param("iiissss", $citaId, $pacienteId, $sedeId, $numero, $fechaCita, $estadoTurno, $observaciones);
        $stmt->execute();
        $turnoId = (int) $conexion->insert_id;
        $stmt->close();
        $conexion->commit();
    } catch (Throwable $e) {
        $conexion->rollback();
        error_log("Error registrando llegada: " . $e->getMessage());
        responder_error("No fue posible registrar la llegada. Puede que ya exista un turno para esta cita.", 409);
    }
    registrar_bitacora($conexion, (int) $usuario["id"], "llegada_registrada", "Turno " . $numero . " para cita #" . $citaId);
    $conexion->close();
    responder_json(["ok" => true, "message" => "Llegada registrada y turno creado.", "turno" => ["id" => $turnoId, "numero" => $numero, "estado" => "en_espera"]], 201);
} else {
    responder_error("La acción solicitada no está permitida.");
}

$stmt = $conexion->prepare("UPDATE cita SET estado = ? WHERE cita_id = ?");
$stmt->bind_param("si", $nuevoEstado, $citaId);
$stmt->execute();
$stmt->close();
if ($accion === "atender") {
    $estadoTurno = "atendido";
    $stmt = $conexion->prepare("UPDATE turno SET estado = ? WHERE cita_id = ? AND estado IN ('generado','en_espera','llamado','en_atencion')");
    $stmt->bind_param("si", $estadoTurno, $citaId);
    $stmt->execute();
    $stmt->close();
}
registrar_bitacora($conexion, (int) $usuario["id"], "cita_" . $nuevoEstado, "Cita #" . $citaId);
$conexion->close();
responder_json(["ok" => true, "message" => "Estado de la cita actualizado.", "citaId" => $citaId, "estado" => $nuevoEstado === "agendada" ? "pendiente" : $nuevoEstado]);
