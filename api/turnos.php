<?php

declare(strict_types=1);

/** API de turnos para check-in virtual, consulta y gestión de recepción. */
require_once __DIR__ . "/config/inicio.php";
iniciar_sesion_segura();
if (empty($_SESSION["usuario_id"])) responder_error("Debes iniciar sesión.", 401);
$usuario = cargar_usuario_frontend($conexion, (int) $_SESSION["usuario_id"]);
if (!$usuario) responder_error("La sesión no es válida.", 401);

if ($_SERVER["REQUEST_METHOD"] === "GET") {
    if (!in_array($usuario["rol"], ["paciente", "recepcion", "administrador"], true)) responder_error("No tienes permiso para consultar turnos.", 403);
    $fecha = isset($_GET["fecha"]) && preg_match("/^\d{4}-\d{2}-\d{2}$/", (string) $_GET["fecha"]) ? (string) $_GET["fecha"] : date("Y-m-d");
    $sql = "SELECT t.turno_id, t.cita_id, t.numero_turno, t.fecha_turno, t.estado, t.modulo, t.paciente_id, s.nombre AS sede, CONCAT(u.nombres, ' ', u.apellidos) AS paciente
              FROM turno t JOIN usuario u ON u.usuario_id = t.paciente_id JOIN sede s ON s.sede_id = t.sede_id
             WHERE t.fecha_turno = ?";
    $params = [$fecha]; $types = "s";
    if ($usuario["rol"] === "paciente") { $sql .= " AND t.paciente_id = ?"; $params[] = (int) $usuario["pacienteId"]; $types .= "i"; }
    $sql .= " ORDER BY t.hora_generacion ASC LIMIT 500";
    $stmt = $conexion->prepare($sql); $stmt->bind_param($types, ...$params); $stmt->execute();
    $rows = $stmt->get_result()->fetch_all(MYSQLI_ASSOC); $stmt->close(); $conexion->close();
    $turnos = array_map(static fn(array $r): array => [
        "id" => (string) $r["turno_id"], "numero" => (string) $r["numero_turno"],
        "citaId" => $r["cita_id"] === null ? null : (int) $r["cita_id"],
        "pacienteId" => (int) $r["paciente_id"], "pacienteNombre" => (string) $r["paciente"],
        "fecha" => (string) $r["fecha_turno"], "estado" => (string) $r["estado"],
        "modulo" => (string) ($r["modulo"] ?? ""), "sede" => (string) $r["sede"],
    ], $rows);
    responder_json(["ok" => true, "turnos" => $turnos]);
}

if ($_SERVER["REQUEST_METHOD"] !== "POST") { header("Allow: GET, POST"); responder_error("Método no permitido.", 405); }
verificar_csrf();
$datos = leer_json();
$accion = texto($datos, "accion");

if ($accion === "checkin_virtual") {
    if ($usuario["rol"] !== "paciente" || empty($usuario["pacienteId"])) {
        responder_error("El check-in virtual está disponible para pacientes.", 403);
    }
    $citaId = filter_var($datos["citaId"] ?? null, FILTER_VALIDATE_INT);
    if (!$citaId || $citaId < 1) responder_error("La cita seleccionada no es válida.");

    $stmt = $conexion->prepare(
        "SELECT c.paciente_id, c.fecha_cita, c.estado, h.sede_id
           FROM cita c
           JOIN horario_medico h ON h.horario_id = c.horario_id
          WHERE c.cita_id = ?"
    );
    $stmt->bind_param("i", $citaId);
    $stmt->execute();
    $cita = $stmt->get_result()->fetch_assoc();
    $stmt->close();
    if (!$cita) responder_error("No se encontró la cita.", 404);
    if ((int) $cita["paciente_id"] !== (int) $usuario["pacienteId"]) {
        responder_error("Solo puedes generar un turno para una cita propia.", 403);
    }
    if ((string) $cita["fecha_cita"] !== date("Y-m-d")) {
        responder_error("El turno virtual solo se puede generar el día de la cita.", 422);
    }
    if (!in_array($cita["estado"], ["agendada", "confirmada"], true)) {
        responder_error("Esta cita no está disponible para generar un turno.", 422);
    }

    $stmt = $conexion->prepare(
        "SELECT t.turno_id, t.numero_turno, t.fecha_turno, t.estado, t.modulo, s.nombre AS sede
           FROM turno t JOIN sede s ON s.sede_id = t.sede_id
          WHERE t.cita_id = ? AND t.paciente_id = ? LIMIT 1"
    );
    $pacienteId = (int) $usuario["pacienteId"];
    $stmt->bind_param("ii", $citaId, $pacienteId);
    $stmt->execute();
    $existente = $stmt->get_result()->fetch_assoc();
    $stmt->close();
    if ($existente) {
        $conexion->close();
        responder_json([
            "ok" => true,
            "message" => "Esta cita ya tiene un turno.",
            "turno" => [
                "id" => (int) $existente["turno_id"],
                "numero" => (string) $existente["numero_turno"],
                "fecha" => (string) $existente["fecha_turno"],
                "estado" => (string) $existente["estado"],
                "modulo" => (string) ($existente["modulo"] ?? ""),
                "sede" => (string) $existente["sede"],
            ],
        ]);
    }

    $transaccionIniciada = false;
    try {
        $sedeId = (int) $cita["sede_id"];
        $fecha = (string) $cita["fecha_cita"];
        $conexion->begin_transaction();
        $transaccionIniciada = true;

        $stmt = $conexion->prepare("SELECT sede_id FROM sede WHERE sede_id = ? AND activo = 1 FOR UPDATE");
        $stmt->bind_param("i", $sedeId);
        $stmt->execute();
        $sedeActiva = $stmt->get_result()->fetch_assoc();
        $stmt->close();
        if (!$sedeActiva) throw new DomainException("La sede de la cita no está disponible.");

        $stmt = $conexion->prepare(
            "SELECT turno_id, numero_turno, fecha_turno, estado, modulo
               FROM turno WHERE cita_id = ? AND paciente_id = ? LIMIT 1"
        );
        $stmt->bind_param("ii", $citaId, $pacienteId);
        $stmt->execute();
        $existente = $stmt->get_result()->fetch_assoc();
        $stmt->close();
        if ($existente) {
            $conexion->commit();
            $transaccionIniciada = false;
            $stmt = $conexion->prepare("SELECT nombre FROM sede WHERE sede_id = ?");
            $stmt->bind_param("i", $sedeId);
            $stmt->execute();
            $nombreSede = (string) ($stmt->get_result()->fetch_assoc()["nombre"] ?? "");
            $stmt->close();
            $conexion->close();
            responder_json([
                "ok" => true,
                "message" => "Esta cita ya tiene un turno.",
                "turno" => [
                    "id" => (int) $existente["turno_id"],
                    "numero" => (string) $existente["numero_turno"],
                    "fecha" => (string) $existente["fecha_turno"],
                    "estado" => (string) $existente["estado"],
                    "modulo" => (string) ($existente["modulo"] ?? ""),
                    "sede" => $nombreSede,
                ],
            ]);
        }

        $limite = regla_valor($conexion, "Máximo de turnos por sede y fecha", 999);
        $stmt = $conexion->prepare(
            "SELECT COUNT(*) AS total,
                    COALESCE(MAX(CASE WHEN numero_turno REGEXP '^T[0-9]+$'
                                      THEN CAST(SUBSTRING(numero_turno, 2) AS UNSIGNED)
                                      ELSE 0 END), 0) AS ultimo
               FROM turno WHERE sede_id = ? AND fecha_turno = ?"
        );
        $stmt->bind_param("is", $sedeId, $fecha);
        $stmt->execute();
        $conteo = $stmt->get_result()->fetch_assoc();
        $stmt->close();
        if ((int) $conteo["total"] >= $limite) {
            $conexion->rollback();
            $transaccionIniciada = false;
            responder_error("La sede alcanzó el límite de turnos para este día.", 409);
        }

        $numero = "T" . str_pad((string) ((int) $conteo["ultimo"] + 1), 3, "0", STR_PAD_LEFT);
        $estado = "en_espera";
        $observaciones = "Check-in virtual desde el portal del paciente.";
        $stmt = $conexion->prepare(
            "INSERT INTO turno (cita_id, paciente_id, sede_id, numero_turno, fecha_turno, estado, observaciones)
             VALUES (?, ?, ?, ?, ?, ?, ?)"
        );
        $stmt->bind_param("iiissss", $citaId, $pacienteId, $sedeId, $numero, $fecha, $estado, $observaciones);
        $stmt->execute();
        $turnoId = (int) $conexion->insert_id;
        $stmt->close();
        $conexion->commit();
        $transaccionIniciada = false;
    } catch (Throwable $e) {
        if ($transaccionIniciada) $conexion->rollback();
        if ($e instanceof DomainException) responder_error($e->getMessage(), 422);
        error_log("Error creando turno virtual: " . $e->getMessage());

        $stmt = $conexion->prepare(
            "SELECT turno_id, numero_turno, fecha_turno, estado, modulo, s.nombre AS sede
               FROM turno t JOIN sede s ON s.sede_id = t.sede_id
              WHERE t.cita_id = ? AND t.paciente_id = ? LIMIT 1"
        );
        $stmt->bind_param("ii", $citaId, $pacienteId);
        $stmt->execute();
        $duplicado = $stmt->get_result()->fetch_assoc();
        $stmt->close();
        if ($duplicado) {
            $conexion->close();
            responder_json([
                "ok" => true,
                "message" => "Esta cita ya tiene un turno.",
                "turno" => [
                    "id" => (int) $duplicado["turno_id"],
                    "numero" => (string) $duplicado["numero_turno"],
                    "fecha" => (string) $duplicado["fecha_turno"],
                    "estado" => (string) $duplicado["estado"],
                    "modulo" => (string) ($duplicado["modulo"] ?? ""),
                    "sede" => (string) $duplicado["sede"],
                ],
            ]);
        }
        responder_error("No fue posible generar el turno virtual.", 409);
    }

    registrar_bitacora($conexion, (int) $usuario["id"], "turno_virtual_creado", "Turno " . $numero . " para cita #" . $citaId);
    $stmt = $conexion->prepare("SELECT nombre FROM sede WHERE sede_id = ?");
    $stmt->bind_param("i", $sedeId);
    $stmt->execute();
    $nombreSede = (string) ($stmt->get_result()->fetch_assoc()["nombre"] ?? "");
    $stmt->close();
    $conexion->close();
    responder_json([
        "ok" => true,
        "message" => "Turno virtual generado correctamente.",
        "turno" => [
            "id" => $turnoId, "numero" => $numero, "fecha" => $fecha,
            "estado" => $estado, "modulo" => "", "sede" => $nombreSede,
        ],
    ], 201);
}

if (!in_array($usuario["rol"], ["recepcion", "administrador"], true)) responder_error("Solo recepción puede actualizar turnos.", 403);
$id = filter_var($datos["turnoId"] ?? null, FILTER_VALIDATE_INT);
$estado = texto($datos, "estado");
$estadosPermitidos = ["en_espera", "llamado", "en_atencion", "atendido", "cancelado", "no_presento"];
if (!$id || $id < 1 || !in_array($estado, $estadosPermitidos, true)) responder_error("El turno o el estado no son válidos.");
$stmt = $conexion->prepare("SELECT turno_id FROM turno WHERE turno_id = ?"); $stmt->bind_param("i", $id); $stmt->execute(); $existe = $stmt->get_result()->fetch_assoc(); $stmt->close();
if (!$existe) responder_error("No se encontró el turno.", 404);
if ($estado === "llamado") {
    $stmt = $conexion->prepare("UPDATE turno SET estado = ?, hora_llamado = COALESCE(hora_llamado, CURRENT_TIMESTAMP) WHERE turno_id = ?");
} elseif ($estado === "en_atencion") {
    $stmt = $conexion->prepare("UPDATE turno SET estado = ?, hora_llamado = COALESCE(hora_llamado, CURRENT_TIMESTAMP), hora_atencion = COALESCE(hora_atencion, CURRENT_TIMESTAMP) WHERE turno_id = ?");
} else {
    $stmt = $conexion->prepare("UPDATE turno SET estado = ? WHERE turno_id = ?");
}
$stmt->bind_param("si", $estado, $id); $stmt->execute(); $stmt->close();
registrar_bitacora($conexion, (int) $usuario["id"], "turno_" . $estado, "Turno #" . $id);
$conexion->close();
responder_json(["ok" => true, "message" => "Estado del turno actualizado.", "turnoId" => $id, "estado" => $estado]);
