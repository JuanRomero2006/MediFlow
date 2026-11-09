<?php

declare(strict_types=1);

/*
 * ARCHIVO: api/config/funciones.php
 * QUÉ HACE: caja de herramientas de la API (todas las respuestas son JSON).
 * SECCIONES: 1) respuestas y datos de entrada   2) sesión y CSRF
 *            3) reglas y bitácora   4) usuario con el formato que espera el front
 * IDEA PARA EXPLICAR: el front (JavaScript) y el servidor (PHP) se hablan en JSON.
 */

// Si algo inesperado falla, el front recibe un JSON claro y no una página en blanco.
set_exception_handler(function (Throwable $e): void {
    error_log($e->getMessage());
    responder_error("Error interno del servidor.", 500);
});

/* ---------------------------------------------------------
 * 1. Respuestas y datos de entrada
 * --------------------------------------------------------- */

/** Envía una respuesta JSON y termina. */
function responder_json(array $datos, int $codigo = 200): void
{
    http_response_code($codigo);
    header("Content-Type: application/json; charset=utf-8");
    echo json_encode($datos, JSON_UNESCAPED_UNICODE);
    exit;
}

/** Respuesta de error: el front la lee como { ok: false, error: "..." }. */
function responder_error(string $mensaje, int $codigo = 422): void
{
    responder_json(["ok" => false, "error" => $mensaje], $codigo);
}

/** Solo permite el método HTTP indicado (GET o POST). */
function solo_metodo(string $metodo): void
{
    if ($_SERVER["REQUEST_METHOD"] !== $metodo) {
        responder_error("Método no permitido.", 405);
    }
}

/** Lee el cuerpo JSON que manda el front (fetch con JSON.stringify). */
function leer_json(): array
{
    $datos = json_decode(file_get_contents("php://input"), true);
    return is_array($datos) ? $datos : [];
}

/** Toma un texto de un arreglo y lo recorta. Si no es texto, devuelve "". */
function texto(array $datos, string $campo): string
{
    $valor = $datos[$campo] ?? "";
    return is_string($valor) ? trim($valor) : "";
}

/* ---------------------------------------------------------
 * 2. Sesión y CSRF
 * --------------------------------------------------------- */

/** Inicia la sesión de PHP con cookies más seguras. */
function iniciar_sesion_segura(): void
{
    if (session_status() === PHP_SESSION_NONE) {
        session_set_cookie_params([
            "httponly" => true,       // JavaScript no puede leer la cookie
            "samesite" => "Lax",      // no se envía desde otros sitios
            "secure"   => !empty($_SERVER["HTTPS"]),
        ]);
        session_start();
    }
}

/** Devuelve (o crea) el token CSRF de la sesión. */
function csrf_token(): string
{
    iniciar_sesion_segura();
    if (empty($_SESSION["csrf"])) {
        $_SESSION["csrf"] = bin2hex(random_bytes(32));
    }
    return $_SESSION["csrf"];
}

/** Revisa que el front mande el token en el encabezado X-CSRF-Token. */
function verificar_csrf(): void
{
    iniciar_sesion_segura();
    $enviado = $_SERVER["HTTP_X_CSRF_TOKEN"] ?? "";
    if (empty($_SESSION["csrf"]) || !hash_equals($_SESSION["csrf"], $enviado)) {
        responder_error("Sesión expirada. Recarga la página e intenta de nuevo.", 419);
    }
}

/* ---------------------------------------------------------
 * 3. Reglas y bitácora
 * --------------------------------------------------------- */

/** Lee un parámetro numérico de REGLA_NEGOCIO (o devuelve el valor por defecto). */
function regla_valor(mysqli $conexion, string $nombre, int $defecto): int
{
    $stmt = $conexion->prepare("SELECT fn_regla_valor(?, ?)");
    $stmt->bind_param("si", $nombre, $defecto);
    $stmt->execute();
    $stmt->bind_result($valor);
    $stmt->fetch();
    $stmt->close();
    return (int) $valor;
}

/** Registra una acción en BITACORA. Nunca interrumpe el flujo si falla. */
function registrar_bitacora(
    mysqli $conexion,
    ?int $usuario_id,
    string $accion,
    ?string $detalle = null
): void {
    try {
        $ip = $_SERVER["REMOTE_ADDR"] ?? null;
        $tabla = "usuario";
        $stmt = $conexion->prepare(
            "INSERT INTO bitacora (usuario_id, accion, tabla_afectada, registro_id, detalle, ip_origen)
             VALUES (?, ?, ?, ?, ?, ?)"
        );
        $stmt->bind_param("ississ", $usuario_id, $accion, $tabla, $usuario_id, $detalle, $ip);
        $stmt->execute();
        $stmt->close();
    } catch (mysqli_sql_exception $e) {
        error_log("Bitácora: " . $e->getMessage());
    }
}

/* ---------------------------------------------------------
 * 4. Usuario con el formato que espera el front (js/services/auth.js)
 * --------------------------------------------------------- */

/** "María Rodríguez" -> "maria-rodriguez" (así se llaman los ids de data/professionals.js). */
function slug_profesional(string $nombres, string $apellidos): string
{
    $acentos = ["á" => "a", "é" => "e", "í" => "i", "ó" => "o", "ú" => "u", "ü" => "u", "ñ" => "n"];
    $texto   = strtr(mb_strtolower($nombres . " " . $apellidos), $acentos);
    return trim(preg_replace("/[^a-z0-9]+/", "-", $texto), "-");
}

/** Resuelve los slugs públicos de agendamiento a identificadores de MySQL. */
function resolver_ids_agendamiento(mysqli $conexion, string $medicoSlug, string $especialidadSlug): array
{
    $medicos = $conexion->query(
        "SELECT m.medico_id, u.nombres, u.apellidos
           FROM medico m JOIN usuario u ON u.usuario_id = m.medico_id
          WHERE m.activo = 1 AND u.estado = 'activo'"
    )->fetch_all(MYSQLI_ASSOC);
    $medicoId = 0;
    foreach ($medicos as $medico) {
        if (slug_profesional((string)$medico["nombres"], (string)$medico["apellidos"]) === $medicoSlug) {
            $medicoId = (int)$medico["medico_id"];
            break;
        }
    }

    $especialidades = $conexion->query("SELECT especialidad_id, nombre FROM especialidad WHERE activo = 1")->fetch_all(MYSQLI_ASSOC);
    $especialidadId = 0;
    foreach ($especialidades as $especialidad) {
        if (slug_profesional((string)$especialidad["nombre"], "") === $especialidadSlug) {
            $especialidadId = (int)$especialidad["especialidad_id"];
            break;
        }
    }

    return [$medicoId, $especialidadId];
}

/** Agrupa las citas que consumen cupo por médico, fecha y hora, igual que la regla de negocio. */
function cargar_ocupacion_agendamiento(mysqli $conexion, int $medicoId, string $desde, string $hasta): array
{
    $stmt = $conexion->prepare(
        "SELECT c.fecha_cita, c.hora_cita, COUNT(*) AS ocupados
           FROM cita c
           JOIN horario_medico hm ON hm.horario_id = c.horario_id
          WHERE hm.medico_id = ? AND c.fecha_cita BETWEEN ? AND ? AND c.estado <> 'cancelada'
          GROUP BY c.fecha_cita, c.hora_cita"
    );
    $stmt->bind_param("iss", $medicoId, $desde, $hasta);
    $stmt->execute();
    $rows = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    $stmt->close();

    $ocupacion = [];
    foreach ($rows as $row) {
        $ocupacion[(string)$row["fecha_cita"]][(string)$row["hora_cita"]] = (int)$row["ocupados"];
    }
    return $ocupacion;
}

/** Genera los cupos que el endpoint de creación también aceptará para ese médico y franja. */
function generar_slots_agendamiento(array $horarios, array $ocupacion, DateTimeImmutable $fecha): array
{
    $dias = ["Monday"=>"Lunes", "Tuesday"=>"Martes", "Wednesday"=>"Miércoles", "Thursday"=>"Jueves", "Friday"=>"Viernes", "Saturday"=>"Sábado", "Sunday"=>"Domingo"];
    $dia = $dias[$fecha->format("l")];
    $fechaIso = $fecha->format("Y-m-d");
    $slots = [];
    $franjasEvaluadas = [];

    foreach ($horarios as $horario) {
        if ((string)$horario["dia_semana"] !== $dia) {
            continue;
        }
        $inicio = new DateTimeImmutable($fechaIso . " " . $horario["hora_inicio"]);
        $fin = new DateTimeImmutable($fechaIso . " " . $horario["hora_fin"]);
        $duracion = max(5, (int)$horario["duracion_cita_min"]);

        while ($inicio->modify("+{$duracion} minutes") <= $fin) {
            $hora = $inicio->format("H:i:s");
            $clave = $fechaIso . "|" . $hora;

            if (!isset($franjasEvaluadas[$clave])) {
                $franjasEvaluadas[$clave] = true;
                $esFuturo = $fechaIso > date("Y-m-d") || $hora > date("H:i:s");
                $ocupados = (int)($ocupacion[$fechaIso][$hora] ?? 0);
                $disponibles = (int)$horario["cupo_maximo"] - $ocupados;

                if ($esFuturo && $disponibles > 0) {
                    $slots[] = [
                        "hora" => date("h:i A", strtotime($hora)),
                        "disponibles" => $disponibles,
                    ];
                }
            }
            $inicio = $inicio->modify("+{$duracion} minutes");
        }
    }

    return $slots;
}

/**
 * Busca al usuario y lo devuelve como lo usa el front:
 * { id, email, username, nombres, apellidos, nombreCompleto, rol, medicoId, pacienteId }
 * Devuelve null si no existe, no está activo o no tiene rol.
 */
function cargar_usuario_frontend(mysqli $conexion, int $usuario_id): ?array
{
    $stmt = $conexion->prepare(
        "SELECT usuario_id, email, username, nombres, apellidos, estado
           FROM usuario WHERE usuario_id = ?"
    );
    $stmt->bind_param("i", $usuario_id);
    $stmt->execute();
    $u = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    if (!$u || $u["estado"] !== "activo") {
        return null;
    }

    // Roles que tiene el usuario en la base de datos
    $stmt = $conexion->prepare(
        "SELECT r.nombre FROM usuario_rol ur JOIN rol r ON r.rol_id = ur.rol_id WHERE ur.usuario_id = ?"
    );
    $stmt->bind_param("i", $usuario_id);
    $stmt->execute();
    $roles = array_column($stmt->get_result()->fetch_all(MYSQLI_ASSOC), "nombre");
    $stmt->close();

    // Si tiene varios roles, gana el de mayor jerarquía.
    // La base de datos usa 'recepcionista' y 'superadmin'; el front usa 'recepcion' y 'administrador'.
    $a_front = [
        "superadmin"    => "administrador",
        "administrador" => "administrador",
        "medico"        => "medico",
        "recepcionista" => "recepcion",
        "paciente"      => "paciente",
    ];
    $rol = null;
    foreach ($a_front as $nombre_bd => $nombre_front) {
        if (in_array($nombre_bd, $roles, true)) {
            $rol = $nombre_front;
            break;
        }
    }
    if ($rol === null) {
        return null;
    }

    return [
        "id"             => (int) $u["usuario_id"],
        "email"          => $u["email"],
        "username"       => $u["username"],
        "nombres"        => $u["nombres"],
        "apellidos"      => $u["apellidos"],
        "nombreCompleto" => trim($u["nombres"] . " " . $u["apellidos"]),
        "rol"            => $rol,
        "medicoId"       => in_array("medico", $roles, true) ? slug_profesional($u["nombres"], $u["apellidos"]) : null,
        "pacienteId"     => in_array("paciente", $roles, true) ? (int) $u["usuario_id"] : null,
    ];
}
