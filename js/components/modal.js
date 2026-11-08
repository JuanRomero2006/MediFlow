/**
 * ==============================================================================
 * MEDIFLOW MODAL DIALOG — SISTEMA ACCESIBLE DE VENTANAS MODALES (shadcn/ui style)
 * Manejo de foco, teclado (Escape), clic en backdrop y soporte ARIA
 * ==============================================================================
 */

let activeModal = null;

function handleKeyDown(e) {
  if (e.key === 'Escape' && activeModal) {
    closeModal(activeModal);
  }
}

export function openModal(modal) {
  if (!modal) return;
  modal.hidden = false;
  modal.setAttribute('aria-hidden', 'false');
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  document.body.classList.add('modal-open');
  activeModal = modal;

  window.addEventListener('keydown', handleKeyDown);

  // Cierre al hacer clic fuera de la tarjeta modal (backdrop)
  if (!modal.dataset.backdropBound) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal(modal);
      }
    });
    modal.dataset.backdropBound = 'true';
  }

  // Foco en el primer elemento interactivo o el botón de cierre
  const focusable = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
  focusable?.focus();
}

export function closeModal(modal) {
  if (!modal) return;
  modal.hidden = true;
  modal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
  if (activeModal === modal) {
    activeModal = null;
    window.removeEventListener('keydown', handleKeyDown);
  }
}

export function initModalTriggers(root = document) {
  root.querySelectorAll('[data-modal-open]').forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const id = trigger.getAttribute('data-modal-open');
      openModal(document.getElementById(id));
    });
  });
  root.querySelectorAll('[data-modal-close]').forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const modal = trigger.closest('.modal');
      closeModal(modal);
    });
  });
}
