/* =========================================================
   Little Whisk Bakery — menu filter
   ========================================================= */

const filterBar = document.querySelector('.filter-bar');
const buttons = filterBar.querySelectorAll('.filter-btn');
const cards = document.querySelectorAll('.product-card');
const status = document.querySelector('.filter-status');
const kidsNote = document.querySelector('.callout[data-category]');

// Words used in the status line, e.g. "Showing 2 cookies"
const labels = {
  all: ['treat', 'treats'],
  cookie: ['cookie', 'cookies'],
  brownie: ['brownie', 'brownies'],
  tiramisu: ['tiramisu', 'tiramisu treats'],
  gift: ['gift box', 'gift boxes'],
};

// Fill each button's count bubble from the cards on the page
buttons.forEach((btn) => {
  const filter = btn.dataset.filter;
  const count = filter === 'all'
    ? cards.length
    : [...cards].filter((card) => card.dataset.category === filter).length;
  btn.querySelector('.count').textContent = count;
});

function applyFilter(filter) {
  buttons.forEach((btn) => {
    const active = btn.dataset.filter === filter;
    btn.classList.toggle('is-active', active);
    btn.setAttribute('aria-pressed', active);
  });

  let shown = 0;
  cards.forEach((card) => {
    const match = filter === 'all' || card.dataset.category === filter;
    card.hidden = !match;
    card.classList.remove('is-entering');
    if (match) {
      shown++;
      void card.offsetWidth; // restart the pop-in animation
      card.classList.add('is-entering');
    }
  });

  kidsNote.hidden = !(filter === 'all' || filter === kidsNote.dataset.category);

  const [one, many] = labels[filter];
  status.textContent = filter === 'all'
    ? `Showing all ${shown} ${many}`
    : `Showing ${shown} ${shown === 1 ? one : many}`;
}

filterBar.addEventListener('click', (event) => {
  const btn = event.target.closest('.filter-btn');
  if (btn) applyFilter(btn.dataset.filter);
});

// Show the bar now that JavaScript is running; ?filter=cookie opens a category directly
filterBar.hidden = false;
const fromUrl = new URLSearchParams(location.search).get('filter');
applyFilter(labels[fromUrl] ? fromUrl : 'all');
