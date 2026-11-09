/**
 * Pruebas estáticas del contrato de autenticación PHP.
 * No simula una sesión real: para probar login/cookies se debe usar XAMPP.
 * Ejecutar: npm run test:auth
 */
import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const authUrl = pathToFileURL(path.join(root, 'js/services/auth.js')).href;
const { ROLE_PATHS, normalizeRole } = await import(authUrl);
let passed = 0;
let failed = 0;
function assert(name, condition) {
  if (condition) { passed++; console.log(`OK  ${name}`); }
  else { failed++; console.error(`FAIL ${name}`); }
}

assert('ruta de paciente definida', ROLE_PATHS.paciente === 'pages/paciente/dashboard.html');
assert('ruta de recepción definida', ROLE_PATHS.recepcion === 'pages/recepcion/dashboard.html');
assert('ruta de médico definida', ROLE_PATHS.medico === 'pages/medico/dashboard.html');
assert('ruta de administrador definida', ROLE_PATHS.administrador === 'pages/administrador/dashboard.html');
assert('normaliza rol recepcionista', normalizeRole('recepcionista') === 'recepcion');
assert('normaliza rol superadmin', normalizeRole('superadmin') === 'administrador');

const api = await readFile(path.join(root, 'js/services/api.js'), 'utf8');
const phpLogin = await readFile(path.join(root, 'api/login.php'), 'utf8');
const phpMe = await readFile(path.join(root, 'api/me.php'), 'utf8');
const phpEstado = await readFile(path.join(root, 'api/estado.php'), 'utf8');
const phpConexion = await readFile(path.join(root, 'api/config/conexion.php'), 'utf8');
assert('frontend usa fetch con sesión same-origin', api.includes("credentials: 'same-origin'"));
assert('login valida contraseña con password_verify', phpLogin.includes('password_verify'));
assert('sesión PHP se consulta desde me.php', phpMe.includes('$_SESSION["usuario_id"]'));
assert('diagnóstico consulta MySQL por la API existente', phpEstado.includes('information_schema.tables'));
assert('conexión carga la configuración local ignorada por Git', phpConexion.includes("parse_ini_file($archivo_env"));
assert('strict_types es la primera declaración PHP', /^<\?php\s+declare\(strict_types=1\);/.test(phpConexion));
assert('la conexión no fuerza errores PHP al cuerpo JSON', !/ini_set\(['"]display_errors['"],\s*['"]1['"]\)/.test(phpConexion));

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
