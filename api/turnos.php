<?php

declare(strict_types=1);

/** API de turnos para consulta de recepción y actualización de estado. */
require_once __DIR__ . "/config/inicio.php";
iniciar_sesion_segura();
if (empty($_SESSION["usuario_id"])) responder_error("Debes iniciar sesión.", 401);
$usuario = cargar_usuario_frontend($conexion, (int) $_SESSION["usuario_id"]);
if (!$usuario) responder_error("La sesión no es válida.", 401);

if ($_SERVER["REQUEST_METHOD"] === "GET") {
    if (!in_array($usuario["rol"], ["paciente", "recepcion", "administrador"], true)) responder_error("No tienes permiso para consultar turnos.", 403);
    $fecha = isset($_GET["fecha"]) && preg_match("/^\d{4}-\d{2}-\d{2}$/", (string) $_GET["fecha"]) ? (string) $_GET["fecha"] : date("Y-m-d");
    $sql = "SELECT t.turno_id, t.numero_turno, t.fecha_turno, t.estado, t.modulo, t.paciente_id, s.nombre AS sede, CONCAT(u.nombres, ' ', u.apellidos) AS paciente
              FROM turno t JOIN usuario u ON u.usuario_id = t.paciente_id JOIN sede s ON s.sede_id = t.sede_id
             WHERE t.fecha_turno = ?";
    $params = [$fecha]; $types = "s";
    if ($usuario["rol"] === "paciente") { $sql .= " AND t.paciente_id = ?"; $params[] = (int) $usuario["pacienteId"]; $types .= "i"; }
    $sql .= " ORDER BY t.hora_generacion ASC LIMIT 500";
    $stmt = $conexion->prepare($sql); $stmt->bind_param($types, ...$params); $stmt->execute();
    $rows = $stmt->get_result()->fetch_all(MYSQLI_ASSOC); $stmt->close(); $conexion->close();
    $turnos = array_map(static fn(array $r): array => [
        "id" => (string) $r["turno_id"], "numero" => (string) $r["numero_turno"],
        "pacienteId" => (int) $r["paciente_id"], "pacienteNombre" => (string) $r["paciente"],
        "fecha" => (string) $r["fecha_turno"], "estado" => (string) $r["estado"],
        "modulo" => (string) ($r["modulo"] ?? ""), "sede" => (string) $r["sede"],
    ], $rows);
    responder_json(["ok" => true, "turnos" => $turnos]);
}

if ($_SERVER["REQUEST_METHOD"] !== "POST") { header("Allow: GET, POST"); responder_error("Método no permitido.", 405); }
verificar_csrf();
if (!in_array($usuario["rol"], ["recepcion", "administrador"], true)) responder_error("Solo recepción puede actualizar turnos.", 403);
$datos = leer_json();
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
