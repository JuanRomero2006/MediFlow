import { specialties, timeSlots } from '../../data/specialties.js';
import { professionals } from '../../data/professionals.js';
import { createCita, slotTaken } from '../services/citas.js';
import { getCurrentUser } from '../services/auth.js';
import { nextDays, qs, qsa, appPath } from '../utils/helpers.js';
import { showAlert, clearAlert } from '../components/alerts.js';
import { initChatbot } from '../components/chatbot.js';

const steps = ['Especialidad', 'Profesional', 'Fecha', 'Horario', 'Paciente', 'Confirmación'];

export async function initAgendarPage() {
  initChatbot();
  const params = new URLSearchParams(window.location.search);
  const preProfessional = params.get('profesional');
  let preSpecialty = params.get('especialidad');
  if (preProfessional && !preSpecialty) {
    const prof = professionals.find((p) => p.id === preProfessional);
    if (prof) preSpecialty = prof.specialtySlug;
  }

  const state = {
    step: preProfessional || preSpecialty ? 1 : 0,
    specialty: preSpecialty || null,
    professionalId: preProfessional || null,
    date: null,
    time: null,
    patient: { nombre: '', documento: '', telefono: '', email: '' },
  };

  const user = await getCurrentUser();
  if (user?.rol === 'paciente') {
    state.patient.nombre = user.nombreCompleto;
    state.patient.email = user.email;
  }

  const alertBox = qs('#agendar-alert');
  const stepper = qs('#stepper');
  const panel = qs('#step-panel');
  const btnBack = qs('#btn-back');
  const btnNext = qs('#btn-next');

  const days = nextDays(10);

  function renderStepper() {
    stepper.innerHTML = steps
      .map(
        (label, i) =>
          `<li class="${i === state.step ? 'active' : i < state.step ? 'done' : ''}"><span>${i + 1}</span>${label}</li>`,
      )
      .join('');
  }

  function renderPanel() {
    clearAlert(alertBox);
    switch (state.step) {
      case 0:
        panel.innerHTML = `<div class="choice-grid">${specialties
          .map(
            (s) =>
              `<button type="button" class="choice-card${state.specialty === s.slug ? ' selected' : ''}" data-specialty="${s.slug}"><b>${s.icon}</b><strong>${s.name}</strong><small>${s.description}</small></button>`,
          )
          .join('')}</div>`;
        qsa('[data-specialty]', panel).forEach((btn) =>
          btn.addEventListener('click', () => {
            state.specialty = btn.dataset.specialty;
            state.professionalId = null;
            renderPanel();
          }),
        );
        break;
      case 1: {
        const list = professionals.filter((p) => !state.specialty || p.specialtySlug === state.specialty);
        panel.innerHTML = list.length
          ? `<div class="choice-grid">${list
              .map(
                (p) =>
                  `<button type="button" class="choice-card${state.professionalId === p.id ? ' selected' : ''}" data-prof="${p.id}"><strong>${p.name}</strong><small>${p.specialty} · ${p.city}</small><em>${p.nextAvailable}</em></button>`,
              )
              .join('')}</div>`
          : '<p>No hay profesionales para esta especialidad en la demostración.</p>';
        qsa('[data-prof]', panel).forEach((btn) =>
          btn.addEventListener('click', () => {
            state.professionalId = btn.dataset.prof;
            renderPanel();
          }),
        );
        break;
      }
      case 2:
        panel.innerHTML = `<div class="date-grid">${days
          .map(
            (d) =>
              `<button type="button" class="date-card${state.date === d.iso ? ' selected' : ''}" data-date="${d.iso}"><small>${d.day}</small><strong>${d.num}</strong><span>${d.month}</span></button>`,
          )
          .join('')}</div>`;
        qsa('[data-date]', panel).forEach((btn) =>
          btn.addEventListener('click', () => {
            state.date = btn.dataset.date;
            renderPanel();
          }),
        );
        break;
      case 3:
        panel.innerHTML = `<div class="slot-grid">${timeSlots
          .map((slot) => {
            const taken = slotTaken({
              fecha: state.date,
              hora: slot,
              profesionalId: state.professionalId,
            });
            return `<button type="button" class="slot${state.time === slot ? ' selected' : ''}" data-slot="${slot}" ${taken ? 'disabled' : ''}>${slot}${taken ? ' (ocupado)' : ''}</button>`;
          })
          .join('')}</div>`;
        qsa('[data-slot]:not([disabled])', panel).forEach((btn) =>
          btn.addEventListener('click', () => {
            state.time = btn.dataset.slot;
            renderPanel();
          }),
        );
        break;
      case 4:
        panel.innerHTML = `
          <form id="patient-form" class="form-grid">
            <label>Nombre completo<input required name="nombre" value="${state.patient.nombre}"></label>
            <label>Documento<input name="documento" value="${state.patient.documento}"></label>
            <label>Teléfono<input required name="telefono" value="${state.patient.telefono}"></label>
            <label>Correo<input type="email" name="email" value="${state.patient.email}"></label>
          </form>`;
        qs('#patient-form', panel)?.addEventListener('input', (e) => {
          const fd = new FormData(e.currentTarget);
          state.patient = Object.fromEntries(fd.entries());
        });
        break;
      default: {
        const prof = professionals.find((p) => p.id === state.professionalId);
        const spec = specialties.find((s) => s.slug === state.specialty);
        panel.innerHTML = `
          <div class="summary-card">
            <h3>Resumen de la cita (demostración)</h3>
            <ul>
              <li><strong>Especialidad:</strong> ${spec?.name || ''}</li>
              <li><strong>Profesional:</strong> ${prof?.name || ''}</li>
              <li><strong>Fecha:</strong> ${state.date}</li>
              <li><strong>Hora:</strong> ${state.time}</li>
              <li><strong>Paciente:</strong> ${state.patient.nombre}</li>
            </ul>
          </div>`;
      }
    }
    btnBack.disabled = state.step === 0;
    btnNext.textContent = state.step === steps.length - 1 ? 'Confirmar cita' : 'Continuar';
    renderStepper();
  }

  function canContinue() {
    switch (state.step) {
      case 0:
        return Boolean(state.specialty);
      case 1:
        return Boolean(state.professionalId);
      case 2:
        return Boolean(state.date);
      case 3:
        return Boolean(state.time);
      case 4:
        return state.patient.nombre.trim().length > 2 && state.patient.telefono.trim().length > 6;
      default:
        return true;
    }
  }

  btnBack?.addEventListener('click', () => {
    if (state.step > 0) {
      state.step -= 1;
      renderPanel();
    }
  });

  btnNext?.addEventListener('click', async () => {
    if (!canContinue()) {
      showAlert(alertBox, 'Completa la información de este paso antes de continuar.', 'error');
      return;
    }
    if (state.step < steps.length - 1) {
      state.step += 1;
      renderPanel();
      return;
    }

    btnNext.disabled = true;
    btnNext.textContent = 'Guardando...';
    const result = createCita({
      pacienteId: user?.pacienteId || null,
      pacienteNombre: state.patient.nombre,
      documento: state.patient.documento,
      telefono: state.patient.telefono,
      email: state.patient.email,
      especialidadSlug: state.specialty,
      profesionalId: state.professionalId,
      fecha: state.date,
      hora: state.time,
    });
    btnNext.disabled = false;
    btnNext.textContent = 'Confirmar cita';

    if (!result.ok) {
      showAlert(alertBox, result.error, 'error');
      return;
    }

    panel.innerHTML = `
      <div class="success-panel">
        <h3>Cita registrada (demostración local)</h3>
        <p>Tu solicitud quedó guardada en este navegador. ID: <strong>${result.cita.id}</strong></p>
        <div class="hero-buttons">
          <a class="btn" href="${appPath('pages/paciente/citas.html')}">Ver mis citas</a>
          <a class="btn outline" href="${appPath('index.html')}">Volver al inicio</a>
        </div>
      </div>`;
    btnBack.hidden = true;
    btnNext.hidden = true;
  });

  renderPanel();
}
