/* =========================================================
   Little Whisk Bakery — "Enable AI" (Gemini API key)
   The key is never written into the code. It lives only in this browser:
   sessionStorage (forgotten when the tab closes), or localStorage if "Remember" is ticked.
   Other scripts can call littleWhiskAI.getKey() and listen for the "ai:change" event.
   Wrapped in a function so its names don't clash with the other scripts.
   ========================================================= */

(() => {
  const MODEL = 'gemini-3.5-flash-lite';
  const MODEL_NAME = 'Gemini 3.5 Flash-Lite';
  const API = 'https://generativelanguage.googleapis.com/v1beta';
  const KEY_NAME = 'little-whisk-gemini-key';

  const aiBtn = document.querySelector('.ai-btn');
  const aiBtnText = aiBtn.querySelector('.ai-btn-text');
  const dialog = document.querySelector('.ai-dialog');
  const aiForm = dialog.querySelector('.ai-form');
  const input = dialog.querySelector('#ai-key');
  const showBtn = dialog.querySelector('.ai-show');
  const remember = dialog.querySelector('#ai-remember');
  const errorEl = dialog.querySelector('#ai-key-error');
  const statusEl = dialog.querySelector('.ai-status');
  const connectBtn = dialog.querySelector('.ai-connect');
  const disableBtn = dialog.querySelector('.ai-disable');

  /* ---------- Where the key is kept ---------- */

  // Storage can be blocked (private windows, strict settings), so every access is guarded
  function readStored(storage) {
    try { return window[storage].getItem(KEY_NAME) || ''; } catch { return ''; }
  }

  function forgetStored() {
    for (const storage of ['sessionStorage', 'localStorage']) {
      try { window[storage].removeItem(KEY_NAME); } catch { /* ignore */ }
    }
  }

  function saveKey(key, persist) {
    forgetStored();
    try { (persist ? localStorage : sessionStorage).setItem(KEY_NAME, key); } catch { /* memory only */ }
  }

  // Also kept in memory, so AI still works for this visit if storage is blocked
  let apiKey = readStored('sessionStorage') || readStored('localStorage');
  remember.checked = Boolean(readStored('localStorage'));

  /* ---------- Checking a key with Google ---------- */

  // Asks Google for the model's details: costs nothing and proves the key works.
  // Returns an error message, or '' when the key is fine.
  async function checkKey(key) {
    let res;
    try {
      res = await fetch(`${API}/models/${MODEL}`, { headers: { 'x-goog-api-key': key } });
    } catch {
      return "Couldn't reach Google. Check your internet connection and try again.";
    }
    if (res.ok) return '';
    if (res.status === 404) return `This key can't use ${MODEL_NAME}. Try a key from Google AI Studio.`;
    if (res.status === 429) return 'Too many tries right now. Wait a minute and try again.';
    return "That key didn't work. Check you copied all of it.";
  }

  /* ---------- Navbar button & dialog ---------- */

  function updateUI() {
    const on = Boolean(apiKey);
    aiBtn.classList.toggle('is-on', on);
    aiBtnText.textContent = on ? 'AI on' : 'Enable AI';
    aiBtn.setAttribute('aria-label', on ? 'AI is on. Manage your Gemini API key' : 'Enable AI features');
    connectBtn.textContent = on ? 'Replace key' : 'Connect';
    input.placeholder = on ? 'Paste a new key to replace the current one' : 'Paste your key here';
    disableBtn.hidden = !on;
  }

  function announce() {
    document.dispatchEvent(new CustomEvent('ai:change', { detail: { enabled: Boolean(apiKey) } }));
  }

  function setShown(shown) {
    input.type = shown ? 'text' : 'password';
    showBtn.textContent = shown ? 'Hide' : 'Show';
    showBtn.setAttribute('aria-pressed', shown);
  }

  function openDialog() {
    errorEl.textContent = '';
    input.classList.remove('is-invalid');
    statusEl.textContent = apiKey ? `✅ AI is on, using ${MODEL_NAME}.` : '';
    dialog.showModal();
    input.focus();
  }

  aiBtn.addEventListener('click', openDialog);
  dialog.querySelector('.ai-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close(); // click on the dimmed backdrop
  });

  // Don't leave a pasted key sitting in the page once the box is closed
  dialog.addEventListener('close', () => {
    input.value = '';
    setShown(false);
  });

  showBtn.addEventListener('click', () => setShown(input.type === 'password'));

  // Ticking or unticking "Remember" moves an existing key to the matching storage
  remember.addEventListener('change', () => {
    if (apiKey) saveKey(apiKey, remember.checked);
  });

  aiForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const key = input.value.trim();
    statusEl.textContent = '';

    let error = key ? '' : 'Please paste your API key.';
    if (!error) {
      connectBtn.disabled = true;
      connectBtn.textContent = 'Checking your key…';
      error = await checkKey(key);
      connectBtn.disabled = false;
    }

    errorEl.textContent = error;
    input.classList.toggle('is-invalid', Boolean(error));
    input.setAttribute('aria-invalid', Boolean(error));
    if (error) {
      updateUI(); // put the button label back
      input.focus();
      return;
    }

    apiKey = key;
    saveKey(key, remember.checked);
    updateUI();
    announce();
    dialog.close();
  });

  disableBtn.addEventListener('click', () => {
    apiKey = '';
    forgetStored();
    remember.checked = false;
    updateUI();
    announce();
    statusEl.textContent = 'AI is off. Your key was removed from this browser.';
    input.focus();
  });

  // For the AI features to come: littleWhiskAI.getKey() returns '' while AI is off
  window.littleWhiskAI = {
    model: MODEL,
    isEnabled: () => Boolean(apiKey),
    getKey: () => apiKey,
    open: openDialog,
  };

  updateUI();
})();
