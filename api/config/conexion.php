<?php

declare(strict_types=1);

mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

date_default_timezone_set("America/Bogota");

$archivo_env = dirname(__DIR__, 2) . DIRECTORY_SEPARATOR . ".env";
$variables_archivo_env = [];

if (is_file($archivo_env)) {
    $variables_archivo_env = parse_ini_file($archivo_env, false, INI_SCANNER_RAW);
    if ($variables_archivo_env === false) {
        throw new RuntimeException("No se pudo leer la configuración local de la base de datos.");
    }
}

// Las variables configuradas en el servidor tienen prioridad sobre el .env local.
function obtenerVariable(string $nombre, string $valorPredeterminado = ''): string
{
    global $variables_archivo_env;

    $valor = $_ENV[$nombre] ?? $_SERVER[$nombre] ?? getenv($nombre);

    if ($valor === false || $valor === null) {
        $valor = $variables_archivo_env[$nombre] ?? $valorPredeterminado;
    }

    return (string) $valor;
}

$servidor   = obtenerVariable('DB_HOST', 'localhost');
$usuario    = obtenerVariable('DB_USERNAME', 'root');
$contrasena = obtenerVariable('DB_PASSWORD', '');
$base_datos = obtenerVariable('DB_DATABASE', 'clinica_previred');
$puerto     = (int) obtenerVariable('DB_PORT', '3306');

try {
    $conexion = new mysqli(
        $servidor,
        $usuario,
        $contrasena,
        $base_datos,
        $puerto
    );

    $conexion->set_charset("utf8mb4");
    $conexion->query("SET time_zone = '-05:00'");

} catch (mysqli_sql_exception $e) {

    error_log("Error de conexión MySQL: " . $e->getMessage());

    responder_error(
        "No se pudo conectar con la base de datos. Verifica la configuración de MySQL en XAMPP.",
        500
    );

    exit;
}
