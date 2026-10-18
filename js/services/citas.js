import { getItem, setItem } from '../utils/storage.js';
import { todayISO } from '../utils/helpers.js';
import { getProfessionalById } from '../../data/professionals.js';
import { specialties } from '../../data/specialties.js';

const STORAGE_KEY = 'citas';

function seedCitas() {
  return [
    {
      id: 'cita-demo-1',
      pacienteId: 1,
      pacienteNombre: 'Juan Pérez',
      especialidadSlug: 'dermatologia',
      especialidad: 'Dermatología',
      profesionalId: 'maria-rodriguez',
      profesional: 'Dra. María Rodríguez',
      fecha: todayISO(),
      hora: '10:30 AM',
      sede: 'Sede Centro',
      estado: 'confirmada',
      creadaEn: Date.now(),
    },
    {
      id: 'cita-demo-2',
      pacienteId: 1,
      pacienteNombre: 'Juan Pérez',
      especialidadSlug: 'odontologia',
      especialidad: 'Odontología',
      profesionalId: 'julian-ortiz',
      profesional: 'Dr. Julián Ortiz',
      fecha: todayISO(),
      hora: '09:00 AM',
      sede: 'Sede Norte',
      estado: 'pendiente',
      creadaEn: Date.now(),
    },
  ];
}

function readAll() {
  const stored = getItem(STORAGE_KEY);
  if (!stored) {
    const seed = seedCitas();
    setItem(STORAGE_KEY, seed);
    return seed;
  }
  return stored;
}

function writeAll(citas) {
  setItem(STORAGE_KEY, citas);
}

export function resetDemoCitas() {
  writeAll(seedCitas());
}

export function listCitas(filters = {}) {
  let citas = readAll();
  if (filters.pacienteId) {
    citas = citas.filter((c) => c.pacienteId === filters.pacienteId);
  }
  if (filters.profesionalId) {
    citas = citas.filter((c) => c.profesionalId === filters.profesionalId);
  }
  if (filters.fecha) {
    citas = citas.filter((c) => c.fecha === filters.fecha);
  }
  return citas.sort((a, b) => `${a.fecha}${a.hora}`.localeCompare(`${b.fecha}${b.hora}`));
}

export function getCitaById(id) {
  return readAll().find((c) => c.id === id) || null;
}

export function slotTaken({ fecha, hora, profesionalId, excludeId }) {
  return readAll().some(
    (c) =>
      c.id !== excludeId &&
      c.fecha === fecha &&
      c.hora === hora &&
      c.profesionalId === profesionalId &&
      c.estado !== 'cancelada',
  );
}

export function createCita(payload) {
  const citas = readAll();
  if (
    slotTaken({
      fecha: payload.fecha,
      hora: payload.hora,
      profesionalId: payload.profesionalId,
    })
  ) {
    return { ok: false, error: 'Ese horario ya no está disponible. Elige otro.' };
  }

  const professional = getProfessionalById(payload.profesionalId);
  const specialty = specialties.find((s) => s.slug === payload.especialidadSlug);

  const cita = {
    id: `cita-${Date.now()}`,
    pacienteId: payload.pacienteId || null,
    pacienteNombre: payload.pacienteNombre,
    documento: payload.documento || '',
    telefono: payload.telefono || '',
    email: payload.email || '',
    especialidadSlug: payload.especialidadSlug,
    especialidad: specialty?.name || payload.especialidadSlug,
    profesionalId: payload.profesionalId,
    profesional: professional?.name || payload.profesionalId,
    fecha: payload.fecha,
    hora: payload.hora,
    sede: professional?.address?.split('·')[0]?.trim() || 'Sede Centro',
    estado: 'pendiente',
    creadaEn: Date.now(),
  };

  citas.push(cita);
  writeAll(citas);
  return { ok: true, cita };
}

export function updateCitaEstado(id, estado) {
  const citas = readAll();
  const index = citas.findIndex((c) => c.id === id);
  if (index === -1) return { ok: false, error: 'Cita no encontrada.' };
  citas[index] = { ...citas[index], estado };
  writeAll(citas);
  return { ok: true, cita: citas[index] };
}

export function cancelCita(id) {
  return updateCitaEstado(id, 'cancelada');
}
