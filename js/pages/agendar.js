import { apiFetch } from '../services/api.js';
import { getCurrentUser } from '../services/auth.js';
import { nextDays, qs, qsa, appPath, escapeHtml } from '../utils/helpers.js';
import { showAlert, clearAlert } from '../components/alerts.js';
import { initChatbot } from '../components/chatbot.js';
import { initScrollReveal } from '../components/scroll-reveal.js';

const steps = ['Especialidad', 'Profesional', 'Fecha', 'Horario', 'Paciente', 'Confirmación'];
const query = (values) => new URLSearchParams(values).toString();

export async function initAgendarPage() {
  initChatbot();
  const params = new URLSearchParams(window.location.search);
  const state = {
    step: 0,
    specialty: params.get('especialidad') || null,
    professionalId: params.get('profesional') || null,
    date: null,
    time: null,
    specialties: [],
    professionals: [],
    slots: [],
    availableDates: null,
    availabilityMessage: '',
    patient: { nombre: '', documento: '', telefono: '', email: '' },
  };

  const alertBox = qs('#agendar-alert');
  const stepper = qs('#stepper');
  const panel = qs('#step-panel');
  const btnBack = qs('#btn-back');
  const btnNext = qs('#btn-next');
  const user = await getCurrentUser();
  if (user?.rol === 'paciente') {
    state.patient.nombre = user.nombreCompleto || '';
    state.patient.email = user.email || '';
  }

  try {
    const data = await apiFetch('catalogo.php?tipo=especialidades');
    state.specialties = data.especialidades || [];
    if (!state.specialties.some((item) => item.slug === state.specialty)) state.specialty = null;
    if (state.specialty) {
      const doctors = await apiFetch(`catalogo.php?${query({ tipo: 'profesionales', especialidad: state.specialty })}`);
      state.professionals = doctors.profesionales || [];
      if (!state.professionals.some((item) => item.id === state.professionalId)) state.professionalId = null;
    }
  } catch (error) {
    showAlert(alertBox, `No fue posible cargar el catálogo desde MySQL. ${error.message}`, 'error');
  }

  if (state.professionalId) state.step = 2;
  else if (state.specialty) state.step = 1;

  function renderStepper() {
    stepper.innerHTML = steps.map((label, i) =>
      `<li class="${i === state.step ? 'active' : i < state.step ? 'done' : ''}"><span>${i + 1}</span>${label}</li>`
    ).join('');
  }

  async function loadProfessionals() {
    const data = await apiFetch(`catalogo.php?${query({ tipo: 'profesionales', especialidad: state.specialty })}`);
    state.professionals = data.profesionales || [];
  }

  async function loadSlots() {
    const data = await apiFetch(`catalogo.php?${query({ tipo: 'horarios', medico: state.professionalId, especialidad: state.specialty, fecha: state.date })}`);
    state.slots = data.horarios || [];
  }

  async function loadAvailableDates(days) {
    const data = await apiFetch(`catalogo.php?${query({
      tipo: 'fechas',
      medico: state.professionalId,
      especialidad: state.specialty,
      desde: days[0].iso,
      dias: days.length,
    })}`);
    state.availableDates = new Set(data.fechas || []);
  }

  async function renderPanel() {
    clearAlert(alertBox);
    btnNext.disabled = false;
    switch (state.step) {
      case 0:
        panel.innerHTML = state.specialties.length
          ? `<div class="choice-grid">${state.specialties.map((s) =>
              `<button type="button" class="choice-card${state.specialty === s.slug ? ' selected' : ''}" data-specialty="${escapeHtml(s.slug)}"><b>✚</b><strong>${escapeHtml(s.nombre)}</strong><small>${escapeHtml(s.descripcion || 'Atención médica especializada')}</small><em>${s.profesionales} profesionales</em></button>`
            ).join('')}</div>`
          : '<p>No hay especialidades activas registradas en la base de datos.</p>';
        qsa('[data-specialty]', panel).forEach((button) => button.addEventListener('click', async () => {
          state.specialty = button.dataset.specialty;
          state.professionalId = null;
          state.date = null;
          state.time = null;
          state.availableDates = null;
          state.slots = [];
          try { await loadProfessionals(); renderPanel(); }
          catch (error) { showAlert(alertBox, error.message, 'error'); }
        }));
        break;
      case 1:
        panel.innerHTML = state.professionals.length
          ? `<div class="choice-grid">${state.professionals.map((p) =>
              `<button type="button" class="choice-card${state.professionalId === p.id ? ' selected' : ''}" data-prof="${escapeHtml(p.id)}"><strong>${escapeHtml(p.nombre)}</strong><small>${escapeHtml(p.especialidad)} · ${escapeHtml(p.sede)}</small></button>`
            ).join('')}</div>`
          : '<p>No hay profesionales activos asociados a esta especialidad.</p>';
        qsa('[data-prof]', panel).forEach((button) => button.addEventListener('click', () => {
          state.professionalId = button.dataset.prof;
          state.date = null;
          state.time = null;
          state.availableDates = null;
          state.slots = [];
          renderPanel();
        }));
        break;
      case 2: {
        const days = nextDays(21);
        try {
          await loadAvailableDates(days);
        } catch (error) {
          state.availableDates = null;
          btnNext.disabled = true;
          panel.innerHTML = '<div class="empty-state"><h3>No fue posible verificar los horarios</h3><p>Vuelve a intentarlo para consultar las fechas disponibles.</p><button type="button" class="btn outline" data-retry-dates>Reintentar</button></div>';
          qsa('[data-retry-dates]', panel).forEach((button) => button.addEventListener('click', () => renderPanel()));
          state.availabilityMessage = `No fue posible comprobar la disponibilidad. ${error.message}`;
          break;
        }

        const fechasDisponibles = state.availableDates;
        const hayFechasDisponibles = fechasDisponibles.size > 0;
        btnNext.disabled = true;
        panel.innerHTML = `<p class="step-hint">Selecciona una fecha con horarios disponibles. Las fechas completas o sin agenda están desactivadas.</p><div class="date-grid">${days.map((d) => {
          const disponible = fechasDisponibles.has(d.iso);
          return `<button type="button" class="date-card${state.date === d.iso ? ' selected' : ''}" data-date="${d.iso}" aria-label="${d.day} ${d.num} ${d.month}${disponible ? ', disponible' : ', sin horarios disponibles'}"${disponible ? '' : ' disabled'}><small>${d.day}</small><strong>${d.num}</strong><span>${d.month}</span><em>${disponible ? 'Disponible' : 'Sin cupos'}</em></button>`;
        }).join('')}</div>`;
        if (!hayFechasDisponibles) {
          panel.insertAdjacentHTML('beforeend', '<div class="empty-state"><h3>No hay fechas disponibles</h3><p>Este profesional no tiene horarios libres en los próximos días.</p></div>');
        }
        qsa('[data-date]', panel).forEach((button) => button.addEventListener('click', async () => {
          if (!fechasDisponibles.has(button.dataset.date)) return;
          state.date = button.dataset.date;
          state.time = null;
          state.step = 3;
          btnNext.disabled = true;
          try {
            await loadSlots();
            if (!state.slots.length) {
              state.step = 2;
              state.date = null;
              state.availableDates = null;
              state.availabilityMessage = 'Ese día se ocupó mientras seleccionabas. Elige otra fecha disponible.';
              await renderPanel();
              return;
            }
            await renderPanel();
          } catch (error) {
            state.step = 2;
            state.date = null;
            state.availableDates = null;
            state.availabilityMessage = `No fue posible confirmar los horarios de esa fecha. ${error.message}`;
            await renderPanel();
          }
        }));
        break;
      }
      case 3:
        btnNext.disabled = !state.time;
        panel.innerHTML = state.slots.length
          ? `<p class="step-hint">Horarios calculados con la agenda y las citas registradas en MySQL.</p><div class="slot-grid">${state.slots.map((slot) =>
              `<button type="button" class="slot${state.time === slot.hora ? ' selected' : ''}" data-slot="${escapeHtml(slot.hora)}">${escapeHtml(slot.hora)}${slot.disponibles > 1 ? ` · ${slot.disponibles} cupos` : ''}</button>`
            ).join('')}</div>`
          : '<div class="empty-state"><h3>Sin disponibilidad</h3><p>No encontramos horarios libres para este día. Regresa y selecciona otra fecha.</p></div>';
        qsa('[data-slot]', panel).forEach((button) => button.addEventListener('click', () => {
          state.time = button.dataset.slot;
          renderPanel();
        }));
        break;
      case 4:
        panel.innerHTML = `<form id="patient-form" class="form-grid">
          <label>Nombre completo<input required name="nombre" autocomplete="name" value="${escapeHtml(state.patient.nombre)}"></label>
          <label>Documento<input name="documento" autocomplete="off" value="${escapeHtml(state.patient.documento)}"></label>
          <label>Teléfono<input required name="telefono" autocomplete="tel" value="${escapeHtml(state.patient.telefono)}"></label>
          <label>Correo electrónico<input type="email" name="email" autocomplete="email" value="${escapeHtml(state.patient.email)}"></label>
        </form><p class="step-hint">La cita se asociará a tu cuenta de paciente. Los datos de contacto se mantienen como referencia del formulario.</p>`;
        qs('#patient-form', panel)?.addEventListener('input', (event) => {
          state.patient = Object.fromEntries(new FormData(event.currentTarget).entries());
        });
        break;
      default: {
        const prof = state.professionals.find((p) => p.id === state.professionalId);
        const spec = state.specialties.find((s) => s.slug === state.specialty);
        panel.innerHTML = `<div class="summary-card"><span class="eyebrow">Revisa tu solicitud</span><h3>Resumen de la cita</h3><ul>
          <li><strong>Especialidad:</strong> ${escapeHtml(spec?.nombre || '')}</li>
          <li><strong>Profesional:</strong> ${escapeHtml(prof?.nombre || '')}</li>
          <li><strong>Fecha:</strong> ${escapeHtml(state.date || '')}</li>
          <li><strong>Hora:</strong> ${escapeHtml(state.time || '')}</li>
          <li><strong>Paciente:</strong> ${escapeHtml(state.patient.nombre)}</li>
        </ul></div>`;
      }
    }
    btnBack.disabled = state.step === 0;
    btnNext.textContent = state.step === steps.length - 1 ? 'Confirmar cita' : 'Continuar';
    renderStepper();
    initScrollReveal(panel);
    if (state.availabilityMessage) {
      showAlert(alertBox, state.availabilityMessage, 'error');
      state.availabilityMessage = '';
    }
  }

  function canContinue() {
    if (state.step === 0) return Boolean(state.specialty);
    if (state.step === 1) return Boolean(state.professionalId);
    if (state.step === 2) return Boolean(state.date);
    if (state.step === 3) return Boolean(state.time);
    if (state.step === 4) return state.patient.nombre.trim().length > 2 && state.patient.telefono.trim().length > 6;
    return true;
  }

  btnBack?.addEventListener('click', async () => {
    if (state.step > 0) {
      state.step -= 1;
      if (state.step === 1 && !state.professionals.length) await loadProfessionals();
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
    if (!user || user.rol !== 'paciente') {
      showAlert(alertBox, `Para registrar una cita debes iniciar sesión con una cuenta de paciente. <a href="${appPath('pages/login.html')}">Iniciar sesión</a>.`, 'error');
      return;
    }
    btnNext.disabled = true;
    btnNext.textContent = 'Guardando...';
    try {
      const result = await apiFetch('citas.php', {
        method: 'POST',
        body: { especialidadSlug: state.specialty, profesionalId: state.professionalId, fecha: state.date, hora: state.time },
      });
      panel.innerHTML = `<div class="success-panel"><span class="success-icon">✓</span><h3>Cita registrada correctamente</h3><p>Tu cita quedó guardada en MySQL. Número de cita: <strong>${result.cita.id}</strong></p><p>Fecha: <strong>${escapeHtml(state.date)}</strong> · Hora: <strong>${escapeHtml(state.time)}</strong></p><div class="hero-buttons"><a class="btn" href="${appPath('pages/paciente/citas.html')}">Ver mis citas</a><a class="btn outline" href="${appPath('index.html')}">Volver al inicio</a></div></div>`;
      btnBack.hidden = true;
      btnNext.hidden = true;
    } catch (error) {
      if (error.message.includes('Ese horario acaba de ocuparse')) {
        state.time = null;
        try {
          await loadSlots();
          if (state.slots.length) {
            state.step = 3;
            state.availabilityMessage = 'Ese horario acaba de ocuparse. Selecciona otro horario disponible.';
          } else {
            state.step = 2;
            state.date = null;
            state.availableDates = null;
            state.availabilityMessage = 'La fecha se quedó sin horarios disponibles. Selecciona otra fecha.';
          }
          await renderPanel();
          return;
        } catch (refreshError) {
          state.step = 2;
          state.date = null;
          state.availableDates = null;
          state.availabilityMessage = `No fue posible actualizar la disponibilidad. ${refreshError.message}`;
          await renderPanel();
          return;
        }
      }
      showAlert(alertBox, error.message, 'error');
      btnNext.disabled = false;
      btnNext.textContent = 'Confirmar cita';
    }
  });

  renderPanel();
}
