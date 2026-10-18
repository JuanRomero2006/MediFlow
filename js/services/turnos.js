import { getItem, setItem } from '../utils/storage.js';
import { todayISO } from '../utils/helpers.js';

const STORAGE_KEY = 'turnos';

function seedTurnos() {
  return [
    {
      id: 'turno-demo-1',
      numero: 'A-014',
      pacienteId: 1,
      pacienteNombre: 'Juan Pérez',
      citaId: 'cita-demo-1',
      fecha: todayISO(),
      sede: 'Sede Centro',
      modulo: 'Consultorio 3',
      estado: 'en_espera',
      prioridad: 0,
      actualizadoEn: Date.now(),
    },
    {
      id: 'turno-demo-2',
      numero: 'A-015',
      pacienteId: null,
      pacienteNombre: 'Ana Gómez',
      citaId: null,
      fecha: todayISO(),
      sede: 'Sede Centro',
      modulo: 'Consultorio 1',
      estado: 'generado',
      prioridad: 0,
      actualizadoEn: Date.now(),
    },
  ];
}

function readAll() {
  const stored = getItem(STORAGE_KEY);
  if (!stored) {
    const seed = seedTurnos();
    setItem(STORAGE_KEY, seed);
    return seed;
  }
  return stored;
}

function writeAll(turnos) {
  setItem(STORAGE_KEY, turnos);
}

export function resetDemoTurnos() {
  writeAll(seedTurnos());
}

export function listTurnos(filters = {}) {
  let turnos = readAll();
  if (filters.fecha) {
    turnos = turnos.filter((t) => t.fecha === filters.fecha);
  }
  if (filters.pacienteId) {
    turnos = turnos.filter((t) => t.pacienteId === filters.pacienteId);
  }
  if (filters.estado) {
    turnos = turnos.filter((t) => t.estado === filters.estado);
  }
  return turnos.sort((a, b) => a.numero.localeCompare(b.numero));
}

export function getTurnoById(id) {
  return readAll().find((t) => t.id === id) || null;
}

function nextNumero(fecha) {
  const sameDay = readAll().filter((t) => t.fecha === fecha);
  const max = sameDay.reduce((acc, t) => {
    const n = parseInt(String(t.numero).replace(/\D/g, ''), 10);
    return Number.isNaN(n) ? acc : Math.max(acc, n);
  }, 0);
  return `A-${String(max + 1).padStart(3, '0')}`;
}

export function createTurnoFromCita(cita) {
  const turnos = readAll();
  const exists = turnos.find(
    (t) => t.citaId === cita.id && t.fecha === cita.fecha && t.estado !== 'cancelado',
  );
  if (exists) return { ok: true, turno: exists };

  const turno = {
    id: `turno-${Date.now()}`,
    numero: nextNumero(cita.fecha),
    pacienteId: cita.pacienteId,
    pacienteNombre: cita.pacienteNombre,
    citaId: cita.id,
    fecha: cita.fecha,
    sede: cita.sede,
    modulo: 'Consultorio 3',
    estado: 'generado',
    prioridad: 0,
    actualizadoEn: Date.now(),
  };
  turnos.push(turno);
  writeAll(turnos);
  return { ok: true, turno };
}

export function updateTurnoEstado(id, estado) {
  const turnos = readAll();
  const index = turnos.findIndex((t) => t.id === id);
  if (index === -1) return { ok: false, error: 'Turno no encontrado.' };
  turnos[index] = { ...turnos[index], estado, actualizadoEn: Date.now() };
  writeAll(turnos);
  return { ok: true, turno: turnos[index] };
}

export function registrarLlegada(citaId) {
  const citasTurnos = readAll();
  let turno = citasTurnos.find((t) => t.citaId === citaId);
  if (turno) {
    return updateTurnoEstado(turno.id, 'en_espera');
  }
  return { ok: false, error: 'No hay turno asociado a esta cita.' };
}
