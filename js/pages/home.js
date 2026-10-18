import { initChatbot } from '../components/chatbot.js';
import { specialties } from '../../data/specialties.js';
import { professionals } from '../../data/professionals.js';
import { escapeHtml } from '../utils/helpers.js';

export function initHomePage() {
  initMobileMenu();
  renderSpecialtyGrid();
  renderProfessionalsGrid();
  initChatbot({ brandName: 'MediFlow' });
}

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

  mobileMenu.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
}

function renderSpecialtyGrid() {
  const grid = document.querySelector('[data-specialty-grid]');
  if (!grid) return;

  grid.innerHTML = specialties
    .map(
      (s) =>
        `<a class="specialty" href="pages/agendar.html?especialidad=${encodeURIComponent(s.slug)}"><b>${escapeHtml(s.icon)}</b><span><strong>${escapeHtml(s.name)}</strong><small>${escapeHtml(s.description)}</small><em>${s.professionals} profesionales</em></span></a>`,
    )
    .join('');
}

function initials(name) {
  return name
    .replace(/^(Dr\.|Dra\.)\s*/i, '')
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() || '')
    .join('');
}

function renderProfessionalsGrid() {
  const grid = document.querySelector('[data-professionals-grid]');
  if (!grid) return;

  const featured = professionals.slice(0, 3);
  grid.innerHTML = featured
    .map((p) => {
      const agendar = `pages/agendar.html?profesional=${encodeURIComponent(p.id)}&especialidad=${encodeURIComponent(p.specialtySlug)}`;
      return `<article class="card professional">
        <div class="person"><b>${escapeHtml(initials(p.name))}</b>
          <div>
            <h3>${escapeHtml(p.name)}</h3><span>${escapeHtml(p.specialty)}</span><small>⌖ ${escapeHtml(p.city)}</small>
          </div>
        </div>
        <p class="rating">★ ${p.rating} <small>(${p.reviews})</small><span>${escapeHtml(p.experience)}</span></p>
        <p class="next">Próxima disponibilidad: <strong>${escapeHtml(p.nextAvailable)}</strong></p>
        <div class="card-buttons">
          <a class="btn outline" href="${agendar}">Ver perfil</a>
          <a class="btn" href="${agendar}">Agendar</a>
        </div>
      </article>`;
    })
    .join('');
}
