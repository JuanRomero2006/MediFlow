import { faqs, chatQuickReplies } from '../../data/faqs.js';
import { appPath, escapeHtml } from '../utils/helpers.js';

const WELCOME =
  'Hola 👋 Soy el asistente de MediFlow (versión inicial). Puedo orientarte sobre citas, turnos e inicio de sesión. No entrego diagnósticos médicos.';

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
  return 'No tengo una respuesta exacta para eso. Prueba con las opciones sugeridas o revisa Preguntas frecuentes en la página principal.';
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

  const setOpen = (open) => {
    chat.classList.toggle('open', open);
    if (triggerLabel) {
      triggerLabel.textContent = open ? 'Cerrar' : '¿Necesitas ayuda?';
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
