<?php

declare(strict_types=1);

/*
 * ARCHIVO: api/me.php  (GET)
 * QUÉ HACE: dice quién tiene la sesión abierta. El front lo usa para saber si
 *           hay que mandar al login y a qué panel corresponde el usuario.
 * SALIDA:   { "ok": true, "user": { ... } }   o 401 { "ok": false, "error": "..." }
 * IDEA PARA EXPLICAR: se vuelve a leer el usuario de la base de datos; si lo
 *           desactivan, pierde el acceso en la siguiente petición.
 */

require_once __DIR__ . "/config/inicio.php";

solo_metodo("GET");
iniciar_sesion_segura();

if (empty($_SESSION["usuario_id"])) {
    responder_error("No hay sesión iniciada.", 401);
}

$usuario = cargar_usuario_frontend($conexion, (int) $_SESSION["usuario_id"]);
if ($usuario === null) {
    $_SESSION = [];
    responder_error("Tu sesión ya no es válida.", 401);
}

$conexion->close();
responder_json(["ok" => true, "user" => $usuario]);
