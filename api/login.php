<?php

declare(strict_types=1);

/*
 * ARCHIVO: api/login.php  (POST, JSON)
 * ENTRADA:  { "identifier": "correo, usuario o documento", "password": "..." }
 * SALIDA:   { "ok": true, "user": { ... } }   o   { "ok": false, "error": "..." }
 * PASOS:  1. Revisar método y token CSRF   2. Leer y validar los datos
 *         3. Revisar el bloqueo por intentos fallidos   4. Buscar al usuario
 *         5. Comprobar la contraseña   6. Crear la sesión   7. Responder
 * IDEA PARA EXPLICAR: la contraseña nunca se guarda; solo su hash (password_verify la compara).
 */

require_once __DIR__ . "/config/inicio.php";

// Paso 1
solo_metodo("POST");
verificar_csrf();

// Paso 2
$datos         = leer_json();
$identificador = mb_strtolower(texto($datos, "identifier"));
$password      = is_string($datos["password"] ?? null) ? $datos["password"] : "";

if ($identificador === "" || $password === "") {
    responder_error("Ingresa tu correo o usuario y tu contraseña.");
}

// Paso 3: demasiados fallos recientes con este identificador -> bloqueo temporal
$max_intentos = regla_valor($conexion, "Máximo de intentos fallidos de login", 5);
$minutos      = regla_valor($conexion, "Minutos de bloqueo por intentos fallidos", 15);

$stmt = $conexion->prepare(
    "SELECT COUNT(*) FROM bitacora
      WHERE accion = 'login_fallido' AND detalle = ?
        AND fecha_hora >= (NOW() - INTERVAL ? MINUTE)"
);
$stmt->bind_param("si", $identificador, $minutos);
$stmt->execute();
$stmt->bind_result($intentos);
$stmt->fetch();
$stmt->close();

if ($intentos >= $max_intentos) {
    responder_error("Demasiados intentos fallidos. Intenta de nuevo en $minutos minutos.", 429);
}

// Paso 4: el identificador puede ser el correo, el usuario o el número de documento
$stmt = $conexion->prepare(
    "SELECT usuario_id, password_hash FROM usuario
      WHERE email = ? OR username = ? OR numero_documento = ?
      LIMIT 1"
);
$stmt->bind_param("sss", $identificador, $identificador, $identificador);
$stmt->execute();
$stmt->bind_result($usuario_id, $password_hash);
$existe = $stmt->fetch();
$stmt->close();

// Paso 5: mismo mensaje si no existe o si la contraseña está mal (no revela cuál fue)
if (!$existe || !password_verify($password, $password_hash)) {
    registrar_bitacora($conexion, null, "login_fallido", $identificador);
    responder_error("Correo, usuario o contraseña incorrectos.", 401);
}

$usuario = cargar_usuario_frontend($conexion, (int) $usuario_id);
if ($usuario === null) {
    registrar_bitacora($conexion, (int) $usuario_id, "login_cuenta_no_habilitada");
    responder_error("Tu cuenta no está habilitada. Comunícate con la clínica.", 403);
}

// Si PHP mejoró su algoritmo de hash, se actualiza el guardado
if (password_needs_rehash($password_hash, PASSWORD_DEFAULT)) {
    $nuevo = password_hash($password, PASSWORD_DEFAULT);
    $stmt = $conexion->prepare("UPDATE usuario SET password_hash = ? WHERE usuario_id = ?");
    $stmt->bind_param("si", $nuevo, $usuario_id);
    $stmt->execute();
    $stmt->close();
}

$stmt = $conexion->prepare("UPDATE usuario SET ultimo_acceso = NOW() WHERE usuario_id = ?");
$stmt->bind_param("i", $usuario_id);
$stmt->execute();
$stmt->close();

// Paso 6: sesión nueva (evita la fijación de sesión)
session_regenerate_id(true);
$_SESSION["usuario_id"] = (int) $usuario_id;

registrar_bitacora($conexion, (int) $usuario_id, "login_exitoso");

// Paso 7
$conexion->close();
responder_json(["ok" => true, "user" => $usuario]);
