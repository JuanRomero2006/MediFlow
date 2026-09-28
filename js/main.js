document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initChat();
});

function initMobileMenu() {
  const menuButton = document.querySelector('.menu-button');
  const mobileMenu = document.querySelector('.mobile-menu');

  if (!menuButton || !mobileMenu) return;

  const closeMenu = () => {
    mobileMenu.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.textContent = '☰';
  };

  menuButton.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(isOpen));
    menuButton.textContent = isOpen ? '×' : '☰';
  });

  mobileMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });
}

function initChat() {
  const chat = document.querySelector('.chat');
  const chatTrigger = document.querySelector('.chat-trigger');
  const closeButton = document.querySelector('.close-chat');
  const chatMessageArea = document.querySelector('.chat-body');

  if (!chat || !chatTrigger || !closeButton || !chatMessageArea) return;

  const triggerLabel = chatTrigger.querySelector('span');

  const setChatState = (isOpen) => {
    chat.classList.toggle('open', isOpen);

    if (triggerLabel) {
      triggerLabel.textContent = isOpen ? 'Cerrar' : '¿Necesitas ayuda?';
    }
  };

  chatTrigger.addEventListener('click', () => {
    setChatState(!chat.classList.contains('open'));
  });

  closeButton.addEventListener('click', () => setChatState(false));

  document.querySelectorAll('.quick button').forEach((button) => {
    button.addEventListener('click', () => {
      addUserMessage(chatMessageArea, button.textContent);
    });
  });
}

function addUserMessage(messageArea, message) {
  const userMessage = document.createElement('p');

  userMessage.textContent = message;
  userMessage.className = 'user-message';
  messageArea.appendChild(userMessage);
}
