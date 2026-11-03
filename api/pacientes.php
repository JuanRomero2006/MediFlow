<?php

declare(strict_types=1);

/** Lista de pacientes persistidos; accesible solo para recepción y administración. */
require_once __DIR__ . "/config/inicio.php";
iniciar_sesion_segura();
if (empty($_SESSION["usuario_id"])) responder_error("Debes iniciar sesión.", 401);
$usuario = cargar_usuario_frontend($conexion, (int) $_SESSION["usuario_id"]);
if (!$usuario) responder_error("La sesión no es válida. Inicia sesión de nuevo.", 401);
if (!in_array($usuario["rol"], ["recepcion", "administrador"], true)) responder_error("No tienes permiso para consultar pacientes.", 403);
if ($_SERVER["REQUEST_METHOD"] !== "GET") { header("Allow: GET"); responder_error("Método no permitido.", 405); }

$sql = "SELECT u.usuario_id, u.nombres, u.apellidos, u.numero_documento, u.tipo_documento,
               u.email, u.telefono, p.eps
          FROM paciente p JOIN usuario u ON u.usuario_id = p.paciente_id
         WHERE u.estado = 'activo'
         ORDER BY u.apellidos, u.nombres LIMIT 1000";
$stmt = $conexion->prepare($sql);
$stmt->execute();
$rows = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
$stmt->close();
$conexion->close();
$pacientes = array_map(static fn(array $r): array => [
    "id" => (int) $r["usuario_id"],
    "nombre" => trim((string) $r["nombres"] . " " . (string) $r["apellidos"]),
    "documento" => (string) $r["tipo_documento"] . " " . (string) $r["numero_documento"],
    "email" => (string) $r["email"],
    "telefono" => (string) ($r["telefono"] ?? ""),
    "eps" => (string) ($r["eps"] ?? "Sin registrar"),
], $rows);
responder_json(["ok" => true, "pacientes" => $pacientes]);
