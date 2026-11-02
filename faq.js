/* =========================================================
   Little Whisk Bakery — FAQ accordion
   The whole list opens from the "Frequently asked questions" heading,
   then each question expands on its own.
   Without JavaScript every answer stays visible; .faq-ready turns on collapsing.
   ========================================================= */

const faqSection = document.getElementById('faq');
const faqToggle = faqSection.querySelector('.faq-toggle');
const faqToggleText = faqToggle.querySelector('.faq-toggle-text');
const faqPanel = document.getElementById('faq-panel');
const faqList = faqSection.querySelector('.faq-list');
const questions = [...faqList.querySelectorAll('.faq-question')];

function setOpen(question, open) {
  question.setAttribute('aria-expanded', open);
  question.closest('.faq-item').classList.toggle('is-open', open);
}

// One answer open at a time: opening a question closes the others
function toggle(question) {
  const willOpen = question.getAttribute('aria-expanded') !== 'true';
  questions.forEach((q) => setOpen(q, q === question && willOpen));
}

// Show or hide the whole question list; closing it also folds every answer
function setPanel(open) {
  faqToggle.setAttribute('aria-expanded', open);
  faqPanel.classList.toggle('is-open', open);
  faqToggleText.textContent = open ? 'Hide questions' : `Show ${questions.length} questions`;
  if (!open) questions.forEach((q) => setOpen(q, false));
}

faqToggle.addEventListener('click', () => {
  setPanel(faqToggle.getAttribute('aria-expanded') !== 'true');
});

// "Close FAQ" at the bottom: fold the list and bring the heading back into view
faqSection.querySelector('.faq-close').addEventListener('click', () => {
  setPanel(false);
  faqToggle.focus({ preventScroll: true });
  faqSection.scrollIntoView({ behavior: 'smooth' });
});

// The navbar "FAQ" link opens the list
document.querySelectorAll('a[href="#faq"]').forEach((link) => {
  link.addEventListener('click', () => setPanel(true));
});

faqList.addEventListener('click', (event) => {
  const question = event.target.closest('.faq-question');
  if (question) toggle(question);
});

// ↑ / ↓ move between questions, Home / End jump to the first / last
faqList.addEventListener('keydown', (event) => {
  const index = questions.indexOf(event.target);
  if (index === -1) return;

  const targets = {
    ArrowDown: questions[(index + 1) % questions.length],
    ArrowUp: questions[(index - 1 + questions.length) % questions.length],
    Home: questions[0],
    End: questions[questions.length - 1],
  };
  if (targets[event.key]) {
    event.preventDefault();
    targets[event.key].focus();
  }
});

// Start with the list hidden — only the heading shows until someone clicks it
setPanel(false);
faqSection.classList.add('faq-ready');
