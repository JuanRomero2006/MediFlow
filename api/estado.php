<?php

declare(strict_types=1);

/*
 * Diagnóstico de disponibilidad del backend y de la conexión MySQL.
 */

require_once __DIR__ . "/config/inicio.php";

solo_metodo("GET");

$resultado = $conexion->query(
    "SELECT COUNT(*) AS cantidad
       FROM information_schema.tables
      WHERE table_schema = DATABASE()"
);
$estado = $resultado->fetch_assoc();

responder_json([
    "ok" => true,
    "mysql" => [
        "conectado" => true,
        "tablas" => (int) ($estado["cantidad"] ?? 0),
    ],
]);
