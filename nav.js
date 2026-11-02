/* =========================================================
   Little Whisk Bakery — smooth scrolling & back-to-top button
   ========================================================= */

const navToggle = document.getElementById('nav-toggle');
const backToTop = document.querySelector('.back-to-top');
const hero = document.getElementById('home');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

function scrollToSection(target) {
  // The sticky navbar is accounted for by scroll-margin-top in the CSS
  target.scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth' });

  // Move keyboard focus to the section too, so Tab continues from there
  if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
  target.focus({ preventScroll: true });
}

// Every in-page link (#about, #menu, ...) — navbar, buttons and footer alike
document.addEventListener('click', (event) => {
  const link = event.target.closest('a[href^="#"]');
  if (!link || link.getAttribute('href').length < 2) return; // skip placeholder "#" links

  const target = document.querySelector(link.getAttribute('href'));
  if (!target) return;

  event.preventDefault();
  navToggle.checked = false; // close the phone menu after choosing a section
  scrollToSection(target);
  history.pushState(null, '', link.getAttribute('href'));
});

// Back-to-top button: shown once the visitor has scrolled past the hero
function updateBackToTop() {
  backToTop.classList.toggle('is-visible', window.scrollY > hero.offsetHeight * 0.8);
}
window.addEventListener('scroll', updateBackToTop, { passive: true });
updateBackToTop();

backToTop.addEventListener('click', () => {
  scrollToSection(hero);
  history.pushState(null, '', location.pathname + location.search);
});
