/**
 * ==============================================================================
 * MEDIFLOW CHATBOT — ASISTENTE VIRTUAL CLÍNICO
 * Soporte interactivo para orientación de citas, turnos y servicios con Lucide
 * ==============================================================================
 */

import { faqs, chatQuickReplies } from '../../data/faqs.js';
import { appPath, escapeHtml } from '../utils/helpers.js';
import { icon } from './icons.js';

const WELCOME =
  'Hola 👋 Soy el asistente de MediFlow. Puedo orientarte sobre citas médicas, turnos virtuales y servicios de la clínica. No entrego diagnósticos médicos.';

function findFaqAnswer(text) {
  const q = text.toLowerCase();
  const match = faqs.find(
    (f) =>
      f.q.toLowerCase().includes(q) ||
      f.keywords.some((k) => q.includes(k) || k.includes(q)),
  );
  return match?.a;
}

function defaultAnswer() {
  return 'No tengo una respuesta exacta para eso. Prueba seleccionando una de las opciones sugeridas o revisa la sección de Preguntas frecuentes.';
}

export function initChatbot(options = {}) {
  const chat = document.querySelector('.chat');
  const chatTrigger = document.querySelector('.chat-trigger');
  const closeButton = document.querySelector('.close-chat');
  const chatBody = document.querySelector('.chat-body');
  const quick = document.querySelector('.chat-quick') || document.querySelector('.quick');
  const form = document.querySelector('.chat-form');
  const input = document.querySelector('.chat-input');

  if (!chat || !chatTrigger || !chatBody) return;

  const brand = options.brandName || 'MediFlow';
  const triggerLabel = chatTrigger.querySelector('span');

  // Aplicar icono Lucide al disparador flotante
  if (!chatTrigger.dataset.iconEnhanced) {
    const chatIconSvg = icon('message-square', { size: 18 });
    chatTrigger.innerHTML = `${chatIconSvg} <span>¿Necesitas ayuda?</span>`;
    chatTrigger.dataset.iconEnhanced = 'true';
  }

  // Aplicar icono de cierre a la cabecera
  if (closeButton && !closeButton.dataset.iconEnhanced) {
    closeButton.innerHTML = icon('x', { size: 18 });
    closeButton.dataset.iconEnhanced = 'true';
  }

  // Aplicar icono de envío al botón del formulario
  const submitBtn = form?.querySelector('button[type="submit"]');
  if (submitBtn && !submitBtn.dataset.iconEnhanced) {
    submitBtn.innerHTML = `${icon('send', { size: 15 })} <span class="sr-only">Enviar</span>`;
    submitBtn.dataset.iconEnhanced = 'true';
  }

  const setOpen = (open) => {
    chat.classList.toggle('open', open);
    const label = chatTrigger.querySelector('span');
    if (label) {
      label.textContent = open ? 'Cerrar' : '¿Necesitas ayuda?';
    }
    if (open) {
      input?.focus();
    }
  };

  const addMessage = (text, from = 'bot') => {
    const p = document.createElement('p');
    p.className = from === 'user' ? 'user-message' : '';
    p.textContent = text;
    chatBody.appendChild(p);
    chatBody.scrollTop = chatBody.scrollHeight;
  };

  if (!chatBody.dataset.initialized) {
    chatBody.innerHTML = '';
    addMessage(WELCOME.replace('MediFlow', brand));
    chatBody.dataset.initialized = 'true';
  }

  chatTrigger.addEventListener('click', () => setOpen(!chat.classList.contains('open')));
  closeButton?.addEventListener('click', () => setOpen(false));

  quick?.querySelectorAll('button').forEach((button) => {
    button.addEventListener('click', () => {
      const item = chatQuickReplies.find((r) => r.label === button.textContent.trim());
      addMessage(button.textContent.trim(), 'user');
      addMessage(item?.answer || defaultAnswer());
    });
  });

  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = input?.value.trim();
    if (!text) return;
    addMessage(text, 'user');
    input.value = '';
    const answer = findFaqAnswer(text) || defaultAnswer();
    addMessage(answer);
  });

  const agendarLink = document.querySelector('[data-chat-agendar]');
  if (agendarLink) {
    agendarLink.href = appPath('pages/agendar.html');
  }
}
