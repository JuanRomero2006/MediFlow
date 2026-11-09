const revealSelector = [
  '.card',
  '.dash-card',
  '.stat-card',
  '.agendar-panel',
  '.public-card',
  '.home-role-card',
  '.specialty',
  '.dashboard-panel',
  '.highlight-panel',
  '.turno-board-card',
  '.choice-card',
  '.date-card',
  '.slot',
  '.summary-card',
  '.login-card',
  '.public-hero-grid > div',
  '.home-hero .hero-copy',
  '.intro',
  '.section-heading',
  '.content-copy',
].join(',');

export function initScrollReveal(root = document) {
  if (
    !('IntersectionObserver' in window) ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
    return;
  }

  const elements = [...root.querySelectorAll(revealSelector)].filter(
    (element) => !element.hasAttribute('data-scroll-reveal'),
  );
  if (!elements.length) return;

  try {
    const observer = new IntersectionObserver(
      (entries, currentObserver) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          currentObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -32px 0px' },
    );

    elements.forEach((element) => {
      const siblings = [...(element.parentElement?.children || [])];
      const siblingIndex = Math.max(siblings.indexOf(element), 0);
      element.style.setProperty('--reveal-delay', `${Math.min(siblingIndex, 4) * 70}ms`);
      element.setAttribute('data-scroll-reveal', '');
      observer.observe(element);
    });

    document.documentElement.classList.add('motion-ready');
  } catch (error) {
    elements.forEach((element) => {
      element.removeAttribute('data-scroll-reveal');
      element.style.removeProperty('--reveal-delay');
    });
    document.documentElement.classList.remove('motion-ready');
    console.error('No fue posible iniciar las animaciones al desplazarse.', error);
  }
}
