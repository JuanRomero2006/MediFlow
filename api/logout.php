<?php

declare(strict_types=1);

/*
 * ARCHIVO: api/logout.php  (POST)
 * QUÉ HACE: cierra la sesión (borra los datos y la cookie).
 */

require_once __DIR__ . "/config/inicio.php";

solo_metodo("POST");
verificar_csrf();

if (!empty($_SESSION["usuario_id"])) {
    registrar_bitacora($conexion, (int) $_SESSION["usuario_id"], "logout");
}

$_SESSION = [];
if (ini_get("session.use_cookies")) {
    $p = session_get_cookie_params();
    setcookie(session_name(), "", time() - 42000, $p["path"], $p["domain"], $p["secure"], $p["httponly"]);
}
session_destroy();

$conexion->close();
responder_json(["ok" => true]);
