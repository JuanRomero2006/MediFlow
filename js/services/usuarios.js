import { DEMO_USERS } from '../../data/demo-users.js';
import { fullName } from '../utils/formatters.js';

export function listDemoPacientes() {
  return DEMO_USERS.filter((u) => u.rol === 'paciente').map((u) => ({
    id: u.pacienteId || u.id,
    usuarioId: u.id,
    nombre: fullName(u),
    email: u.email,
    documento: '1000000001',
    telefono: '(608) 000 0000',
    eps: 'EPS Demo',
  }));
}

export function listDemoStaff() {
  return DEMO_USERS.filter((u) => u.rol !== 'paciente').map((u) => ({
    id: u.id,
    nombre: fullName(u),
    email: u.email,
    rol: u.rol,
  }));
}
