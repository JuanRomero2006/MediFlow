<?php

declare(strict_types=1);

/*
 * ARCHIVO: api/config/conexion.php
 * QUÉ HACE: abre la conexión con MySQL y la deja en la variable $conexion.
 * IDEA PARA EXPLICAR: los datos de conexión viven en un solo lugar.
 */

// Lanza excepciones en vez de avisos, así el manejador de errores responde en JSON.
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

// Hora de Colombia en PHP.
date_default_timezone_set("America/Bogota");

$servidor   = "localhost";
$usuario    = "root";        // XAMPP: root sin contraseña. En producción, crear un usuario propio.
$contrasena = "";
$base_datos = "clinica_previred";

try {
    $conexion = new mysqli($servidor, $usuario, $contrasena, $base_datos);
    $conexion->set_charset("utf8mb4");
    $conexion->query("SET time_zone = '-05:00'");   // hora de Colombia en MySQL
} catch (mysqli_sql_exception $e) {
    error_log($e->getMessage());
    responder_error("No se pudo conectar con la base de datos. ¿MySQL está iniciado en XAMPP?", 500);
}
