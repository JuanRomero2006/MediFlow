<?php

declare(strict_types=1);

/** Listado administrativo de usuarios; nunca devuelve contraseñas ni hashes. */
require_once __DIR__ . "/config/inicio.php";
iniciar_sesion_segura();
if (empty($_SESSION["usuario_id"])) responder_error("Debes iniciar sesión.", 401);
$actual = cargar_usuario_frontend($conexion, (int) $_SESSION["usuario_id"]);
if (!$actual) responder_error("La sesión no es válida.", 401);
if ($actual["rol"] !== "administrador") responder_error("No tienes permiso para consultar usuarios.", 403);
if ($_SERVER["REQUEST_METHOD"] !== "GET") { header("Allow: GET"); responder_error("Método no permitido.", 405); }

$sql = "SELECT u.usuario_id, u.nombres, u.apellidos, u.email, u.telefono, u.estado,
               GROUP_CONCAT(r.nombre ORDER BY r.nombre SEPARATOR ', ') AS roles
          FROM usuario u
          JOIN usuario_rol ur ON ur.usuario_id = u.usuario_id
          JOIN rol r ON r.rol_id = ur.rol_id
         GROUP BY u.usuario_id, u.nombres, u.apellidos, u.email, u.telefono, u.estado
         ORDER BY u.apellidos, u.nombres LIMIT 2000";
$resultado = $conexion->query($sql);
$usuarios = [];
while ($fila = $resultado->fetch_assoc()) {
    $usuarios[] = [
        "id" => (int) $fila["usuario_id"],
        "nombre" => trim($fila["nombres"] . " " . $fila["apellidos"]),
        "email" => (string) $fila["email"],
        "telefono" => (string) ($fila["telefono"] ?? ""),
        "estado" => (string) $fila["estado"],
        "rol" => (string) $fila["roles"],
    ];
}
$conexion->close();
responder_json(["ok" => true, "usuarios" => $usuarios]);
