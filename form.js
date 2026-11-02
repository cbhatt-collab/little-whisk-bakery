/* =========================================================
   Little Whisk Bakery — contact form validation
   ========================================================= */

const form = document.querySelector('.contact-form');
const success = document.querySelector('.form-success');
const fields = {
  name: form.querySelector('#name'),
  email: form.querySelector('#email'),
  message: form.querySelector('#message'),
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Returns an error message, or '' when the field is fine
const rules = {
  name: (value) => (value ? '' : 'Please tell us your name.'),
  email: (value) => {
    if (!value) return 'Please enter your email so we can reply.';
    if (!EMAIL_PATTERN.test(value)) return "That email doesn't look quite right, e.g. you@example.com";
    return '';
  },
  message: (value) => (value ? '' : 'Please write a message or your order.'),
};

function validateField(key) {
  const input = fields[key];
  const error = rules[key](input.value.trim());
  const errorEl = document.getElementById(`${key}-error`);

  errorEl.textContent = error;
  input.classList.toggle('is-invalid', Boolean(error));
  input.classList.toggle('is-valid', !error);
  input.setAttribute('aria-invalid', Boolean(error));
  return !error;
}

// After the first try, re-check fields as the visitor fixes them
let attempted = false;
for (const key of Object.keys(fields)) {
  fields[key].addEventListener('input', () => { if (attempted) validateField(key); });
  fields[key].addEventListener('blur', () => { if (attempted || fields[key].value) validateField(key); });
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  attempted = true;

  const results = Object.keys(fields).map(validateField);
  const firstInvalid = Object.keys(fields).find((key, i) => !results[i]);
  if (firstInvalid) {
    form.classList.remove('shake');
    void form.offsetWidth; // restart the shake animation
    form.classList.add('shake');
    fields[firstInvalid].focus();
    return;
  }

  // Valid: hand the message to the visitor's email app, then say thank you
  form.submit();
  success.querySelector('.form-success-name').textContent = `, ${fields.name.value.trim().split(' ')[0]}`;
  form.hidden = true;
  success.hidden = false;
  success.focus();
});

success.querySelector('.form-reset').addEventListener('click', () => {
  form.reset();
  attempted = false;
  for (const key of Object.keys(fields)) {
    fields[key].classList.remove('is-invalid', 'is-valid');
    fields[key].removeAttribute('aria-invalid');
    document.getElementById(`${key}-error`).textContent = '';
  }
  success.hidden = true;
  form.hidden = false;
  fields.name.focus();
});
