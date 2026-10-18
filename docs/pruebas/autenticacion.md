# Casos de prueba — autenticación (demostración)

## Automatizados

Ejecutar desde la raíz del proyecto:

```bash
npm run test:auth
```

Cubren login por rol, credenciales inválidas, bloqueo de rol incorrecto, cierre de sesión y persistencia de sesión firmada.

## Manuales en navegador

1. Paciente válido → panel paciente.
2. Recepción válida → panel recepción.
3. Médico válido → panel médico.
4. Administrador válido → panel administrador.
5. Contraseña incorrecta → mensaje de error en login.
6. Cuenta inexistente → mensaje de error.
7. Paciente abre URL de panel médico → redirección al panel paciente.
8. Sin sesión, abrir panel privado → redirección a login.
9. Cerrar sesión → no se puede volver atrás a datos privados sin login.
10. Recargar con sesión válida → permanece autenticado (hasta TTL de 8 h).

Credenciales: ver tabla en `README.md`.
