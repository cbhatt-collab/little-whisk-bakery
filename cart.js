/* =========================================================
   Little Whisk Bakery — add to cart
   Prices are kept in cents (data-price="350" = $3.50) to avoid rounding errors.
   ========================================================= */

const STORAGE_KEY = 'little-whisk-cart';

const cartBtn = document.querySelector('.cart-btn');
const cartCount = cartBtn.querySelector('.cart-count');
const cartTotal = cartBtn.querySelector('.cart-total');
const drawer = document.querySelector('.cart-drawer');
const itemList = drawer.querySelector('.cart-items');
const emptyState = drawer.querySelector('.cart-empty');
const footer = drawer.querySelector('.cart-foot');
const sumTotal = drawer.querySelector('.cart-sum-total');
const toast = document.querySelector('.toast');

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
const formatPrice = (cents) => money.format(cents / 100);

// Product catalogue, read from the menu cards: { "Tiramisu Cup": 600, ... }
const products = {};
document.querySelectorAll('.product-card').forEach((card) => {
  products[card.querySelector('h3').textContent] = Number(card.dataset.price);
});

// Cart contents: { "Tiramisu Cup": 2, ... } — remembered between visits when storage is available
let cart = {};
try {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  for (const [name, qty] of Object.entries(saved)) {
    if (products[name] && qty > 0) cart[name] = qty;
  }
} catch { /* storage blocked or corrupt — start empty */ }

function saveCart() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cart)); } catch { /* ignore */ }
}

function totals() {
  let count = 0;
  let cents = 0;
  for (const [name, qty] of Object.entries(cart)) {
    count += qty;
    cents += products[name] * qty;
  }
  return { count, cents };
}

function render() {
  const { count, cents } = totals();

  cartCount.textContent = count;
  cartTotal.textContent = formatPrice(cents);
  cartBtn.classList.toggle('has-items', count > 0);
  cartBtn.setAttribute('aria-label',
    `Open cart, ${count} ${count === 1 ? 'item' : 'items'}, total ${formatPrice(cents)}`);

  itemList.innerHTML = '';
  for (const [name, qty] of Object.entries(cart)) {
    const li = document.createElement('li');
    li.className = 'cart-item';
    li.dataset.name = name;
    li.innerHTML = `
      <div class="cart-item-info">
        <strong></strong>
        <span>${formatPrice(products[name])} each</span>
      </div>
      <div class="qty" role="group">
        <button type="button" data-action="decrease">−</button>
        <span class="qty-value">${qty}</span>
        <button type="button" data-action="increase">+</button>
      </div>
      <span class="cart-item-total">${formatPrice(products[name] * qty)}</span>
      <button type="button" class="cart-remove" data-action="remove">&times;</button>`;
    li.querySelector('strong').textContent = name;
    li.querySelector('.qty').setAttribute('aria-label', `Quantity of ${name}`);
    li.querySelector('[data-action="decrease"]').setAttribute('aria-label', `Remove one ${name}`);
    li.querySelector('[data-action="increase"]').setAttribute('aria-label', `Add one more ${name}`);
    li.querySelector('.cart-remove').setAttribute('aria-label', `Remove ${name} from cart`);
    itemList.append(li);
  }

  emptyState.hidden = count > 0;
  footer.hidden = count === 0;
  sumTotal.textContent = formatPrice(cents);
  saveCart();
}

let toastTimer;
function showToast(message) {
  toast.textContent = message;
  toast.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2200);
}

function bumpCounter() {
  cartBtn.classList.remove('bump');
  void cartBtn.offsetWidth; // restart the bump animation
  cartBtn.classList.add('bump');
}

// "Add" buttons on the menu cards
document.querySelector('.menu-grid').addEventListener('click', (event) => {
  const btn = event.target.closest('.add-btn');
  if (!btn) return;

  const name = btn.closest('.product-card').querySelector('h3').textContent;
  cart[name] = (cart[name] || 0) + 1;
  render();
  bumpCounter();
  showToast(`Added ${name} 🎉 · Total ${formatPrice(totals().cents)}`);

  btn.classList.add('is-added');
  btn.firstChild.textContent = 'Added ';
  setTimeout(() => {
    btn.classList.remove('is-added');
    btn.firstChild.textContent = 'Add ';
  }, 1200);
});

// +, − and × buttons inside the drawer
itemList.addEventListener('click', (event) => {
  const btn = event.target.closest('[data-action]');
  if (!btn) return;

  const name = btn.closest('.cart-item').dataset.name;
  if (btn.dataset.action === 'increase') cart[name] += 1;
  if (btn.dataset.action === 'decrease') cart[name] -= 1;
  if (btn.dataset.action === 'remove' || cart[name] <= 0) delete cart[name];
  render();

  // Keep keyboard focus inside the drawer after the list is rebuilt
  const row = itemList.querySelector(`[data-name="${CSS.escape(name)}"]`);
  (row?.querySelector(`[data-action="${btn.dataset.action}"]`) || drawer.querySelector('.cart-close')).focus();
});

// Opening and closing the drawer
cartBtn.addEventListener('click', () => drawer.showModal());
drawer.querySelector('.cart-close').addEventListener('click', () => drawer.close());
drawer.addEventListener('click', (event) => {
  if (event.target === drawer) drawer.close(); // click on the dimmed backdrop
});

drawer.querySelector('.cart-clear').addEventListener('click', () => {
  cart = {};
  render();
  drawer.querySelector('.cart-close').focus();
});

// Checkout: copy the order into the contact form so it can be sent
drawer.querySelector('.cart-checkout').addEventListener('click', () => {
  const lines = Object.entries(cart).map(
    ([name, qty]) => `- ${qty} × ${name} (${formatPrice(products[name] * qty)})`
  );
  document.getElementById('message').value =
    `Hi Little Whisk! I'd like to order:\n${lines.join('\n')}\n\nTotal: ${formatPrice(totals().cents)}\n\nPickup or delivery date: `;

  drawer.close();
  document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
  document.getElementById('name').focus({ preventScroll: true });
});

render();
