# 🧁 Little Whisk Bakery

*"Big flavor, baked by small hands."*

A website for a home bakery run by a 12-year-old baker who sells cookies, brownies and tiramisu. It's a one-page site built with plain HTML, CSS and JavaScript: no frameworks, no build step and no dependencies.

---

## ✨ Features

| Feature | What it does | File |
|---|---|---|
| 🍪 **Menu filter** | Filter the menu by cookies, brownies, tiramisu or gift boxes | `script.js` |
| 🛒 **Add to cart** | Add treats, change quantities and see a running total. The cart is saved between visits | `cart.js` |
| 📬 **Contact form** | Checks the form before sending and shows friendly error messages | `form.js` |
| ❓ **FAQ accordion** | Open the whole list from its heading, then expand each question on its own | `faq.js` |
| 🧭 **Smooth navigation** | Smooth scrolling between sections, a mobile menu and a back-to-top button | `nav.js` |
| 🎮 **Treat Catch game** | A mini-game where you catch falling treats in a mixing bowl | `game.js` |
| ✨ **Enable AI** | Paste your own Gemini API key to turn on AI features (Gemini 3.5 Flash-Lite) | `ai.js` |

The page also works on phones and stays usable without JavaScript. For example, every FAQ answer stays visible if scripts are turned off.

---

## 🎮 Treat Catch

Move the bowl to catch falling treats and avoid the burnt cookies.

| Treat | Points |
|---|:-:|
| Cookie | +1 |
| Brownie | +2 |
| Tiramisu cup | +3 |
| Golden cookie | +5 |
| Burnt cookie 🔥 | lose a heart |

- You start with **3 hearts**. You lose one when you **drop a good treat** or **catch a burnt cookie**.
- The game gets faster as your score goes up, and burnt cookies show up more often.
- Your **best score** is saved in the browser.

**Controls:** `←` `→` or `A` `D` to move, `Space` or `Enter` to start, `P` or `Esc` to pause. With a mouse or touchscreen, the bowl follows your pointer or finger.

---

## 🚀 Getting started

You don't need to install anything.

```bash
git clone https://github.com/cbhatt-collab/little-whisk-bakery.git
cd little-whisk-bakery
open index.html        # macOS. On Windows use "start index.html"
```

You can also serve it locally:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

### ✨ Turning on AI

1. Get a free API key from [Google AI Studio](https://aistudio.google.com/apikey).
2. Click **✨ Enable AI** in the navbar and paste your key.
3. The site checks the key with Google before turning AI on.

Your key is **never stored in the code or in this repository**. It stays in your browser: it's forgotten when you close the tab, unless you tick "Remember on this device." Click the ✨ button again at any time to turn AI off and remove the key.

---

## 📁 Project structure

```
little-whisk-bakery/
├── index.html       # The whole one-page site
├── styles.css       # Colors, layout and responsive styles
├── script.js        # Menu filter
├── cart.js          # Shopping cart (prices kept in cents)
├── form.js          # Contact form validation
├── faq.js           # FAQ accordion
├── nav.js           # Smooth scrolling, mobile menu, back-to-top
├── game.js          # Treat Catch mini-game
├── ai.js            # "Enable AI" button and Gemini API key box
├── brand-story.md   # Brand name, story, menu and contact details
└── prompts.md       # Every AI prompt used to build the site
```

---

## 🍰 The menu

| Item | Price |
|---|---|
| Classic Chocolate Chip Cookie | $2.00 each / $20 per dozen |
| Cinnamon Snickerdoodle | $2.00 each / $20 per dozen |
| Double Fudge Brownie | $3.00 |
| Salted Caramel Brownie | $3.50 |
| Tiramisu Cup | $6.00 |
| Family Tiramisu Tray (serves 8) | $36.00 |
| Sweet Sampler Box | $15.00 |

The full brand story is in [`brand-story.md`](brand-story.md).

---

## 🤖 How it was built

This site was built step by step with an AI coding assistant, Claude Code. [`prompts.md`](prompts.md) lists every prompt in order, from the brand story to the finished game, with a note on what each prompt produced.

---

<p align="center">Made with 🧈 real butter and 💛 big dreams.</p>
