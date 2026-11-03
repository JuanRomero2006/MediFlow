<?php

declare(strict_types=1);

/*
 * ARCHIVO: api/csrf.php  (GET)
 * QUÉ HACE: entrega el token CSRF de la sesión. El front lo guarda y lo manda
 *           en el encabezado X-CSRF-Token de cada petición POST.
 * IDEA PARA EXPLICAR: el token demuestra que la petición sale de NUESTRA página.
 */

require_once __DIR__ . "/config/funciones.php";

solo_metodo("GET");

responder_json(["ok" => true, "token" => csrf_token()]);
