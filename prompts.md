# 🧁 Little Whisk Bakery: Session Prompts

Every prompt used to build the **Little Whisk Bakery** website, in the order it was given. The prompt text is exactly as typed, including the original spelling. Each prompt also has a short note on what it produced.

---

## 📋 Overview

| # | Phase | Prompt | Result |
|:-:|---|---|---|
| 1 | Brand | [Brand story](#1-brand-story) | `brand-story.md` |
| 2 | Website | [Website design (interrupted)](#2-website-design-first-attempt) | — |
| 3 | Website | [Website design with sections](#3-website-design-with-sections) | `index.html`, `styles.css` |
| 4 | Features | [Product filter](#4-product-filter) | `script.js` |
| 5 | Features | [Add to cart](#5-add-to-cart) | `cart.js` |
| 6 | Features | [Form validation](#6-form-validation) | `form.js` |
| 7 | Features | [FAQ accordion](#7-faq-accordion) | `faq.js` |
| 8 | Features | [FAQ: start collapsed](#8-faq-start-collapsed) | `faq.js` |
| 9 | Features | [FAQ: open and close the whole list](#9-faq-open-and-close-the-whole-list) | `faq.js` |
| 10 | Features | [Smooth scrolling and back to top](#10-smooth-scrolling-and-back-to-top) | `nav.js` |
| 11 | Game | [Treat Catch game](#11-treat-catch-game) | `game.js` |
| 12 | Game | [Points on falling treats](#12-points-on-falling-treats) | `game.js` |
| 13 | Game | [When does the game end?](#13-when-does-the-game-end) | Explanation only |
| 14 | Game | [Checking how the game stops](#14-checking-how-the-game-stops) | `game.js` |
| 15 | Game | [Hearts explained](#15-hearts-explained) | `game.js`, `index.html` |
| 16 | Wrap-up | [Collect the prompts](#16-collect-the-prompts) | `prompts.md` |
| 17 | Wrap-up | [Format the prompts file](#17-format-the-prompts-file) | `prompts.md` |

---

## Phase 1 · Brand

### 1. Brand story

> I want to create a website for a homemade bakery business.  It is run by a 12 year old who sells cookies, brownies and tiramasu. Based on the details below create a brand story with the following information
>
> - [ ]  Brand name and tagline
> - [ ]  About the brand (150–300 words)
> - [ ]  What the brand sells or offers (at least 5 items with prices)
> - [ ]  Why customers should choose this brand (3–5 points)
> - [ ]  Contact details (made-up address, email, phone)

**Result:** the brand name *Little Whisk Bakery* with the tagline *"Big flavor, baked by small hands."*, a 217-word story, a 7-item menu, 5 reasons to choose the bakery, and made-up contact details.

---

## Phase 2 · Website

### 2. Website design (first attempt)

> I want you to create a premium website using html and CSS. Make sure the website is attractive for buyers and is visually appealing with the following charctersitics.
> **Design requirements:**
>
> Choose a playful theme appropriate for a 12 year old girl who is doing the business
> - Use a consistent colour palette and good fonts
> - Make it look good on both **laptop and mobile**

**Result:** interrupted before any work was done, then resent with the section list (see #3).

### 3. Website design with sections

> I want you to create a premium website using html and CSS. Make sure the website is attractive for buyers and is visually appealing with the following charctersitics.
> **Design requirements:**
>
> Choose a playful theme appropriate for a 12 year old girl who is doing the business
> - Use a consistent colour palette and good fonts
> - Make it look good on both **laptop and mobile**
>
> ## Website Design (HTML + CSS)
>
> Turn your brand story into a **single-page website** with these sections:
>
> | Section | What it should have |
> |---|---|
> | Navbar | Brand name/logo text and links to each section |
> | Hero section | Big headline, tagline, and a "Shop Now" or "Explore" button |
> | About | Short brand story |
> | Products / Menu | Cards showing each item with a name, short description, and price |
> | Why Choose Us | 3–5 points with icons or emojis |
> | Contact | Contact form (name, email, message) and contact details |
> | Footer | Copyright line and social media links |

*Note: in the original message the design requirements were pasted twice, with a "[Request interrupted by user]" line between the copies. They appear once here.*

**Result:** a single-page site with a pastel "sprinkles" theme, the Fredoka, Nunito and Caveat fonts, hand-drawn SVG treats, and a layout that works on laptop and phone.

---

## Phase 3 · Interactive features (JavaScript)

### 4. Product filter

> I want you to add a javascript feature:
> Product filter: buttons such as "All / Cookies/Tiramasu" including all products that we are selling that show only matching items

**Result:** filter buttons for All, Cookies, Brownies, Tiramisu and Gift Boxes, each with an item count and a status line showing what's displayed.

### 5. Add to cart

> now lets another feature using javascript - Add to Cart: clicking "Add" on a product updates a cart counter and shows the total price

**Result:** "Add" buttons on the menu cards, a cart counter and total in the navbar, and a slide-out cart where customers change quantities. Checkout copies the order into the contact form.

### 6. Form validation

> add 1 more feature - - **Form validation:** the contact form shows an error if the name or email is empty or the email is invalid, and a "Thank you!" message on success.

**Result:** error messages under each field and a personalised "Thank you, Priya!" panel after a valid submit.

### 7. FAQ accordion

> Add one more feature, plan and tell me where you will add this feature where it makes most sense and why. Also tell me how it works.
> FAQ accordion: questions that expand and collapse when clicked

**Result:** 9 questions placed between "Why Choose Us" and "Contact", where buyers usually have doubts just before ordering. One answer opens at a time, and the arrow keys move between questions.

### 8. FAQ: start collapsed

> can you make the FAQ so all the Q&A are collapased at the beginning. Right now all the Q&A are taking up a lot of real estate.

**Result:** every answer starts closed.

### 9. FAQ: open and close the whole list

> I still see each Q&A listed, can we make it so that once someone clicks on Frequently Asked Question the questions show up, also add ability to close FAQ

**Result:** the whole list is hidden behind the "Frequently asked questions" heading, with a "Show 9 questions" / "Hide questions" button and a "Close FAQ ✕" button.

### 10. Smooth scrolling and back to top

> Add 2 more features:
> - **Smooth scrolling:** clicking a navbar link scrolls smoothly to that section
> - **Back to top button:** appears when you scroll down

**Result:** in-page links glide to their section, and the phone menu closes after a tap. A pink ↑ button appears after scrolling down.

---

## Phase 4 · Game

### 11. Treat Catch game

> Please add one more feature:
>
> Suggest a fun game to be added at the bottom of the page.
>
> **Game requirements:**
>
> - [ ]  Playable with the keyboard or mouse
> - [ ]  Shows a score
> - [ ]  Has Start and Restart buttons
> - [ ]  Ends with a "Game Over" message and the final score

**Result:** *Treat Catch 🧁*, where you catch falling treats in Maya's mixing bowl using the keyboard, the mouse or touch. It has a score, Start and Restart buttons, and a "Game Over!" card with the final and best score.

### 12. Points on falling treats

> Can we show the points in the treats when the treats are falling down?

**Result:** each falling treat has a badge showing its points (+1, +2, +3 or +5).

### 13. When does the game end?

> when does the game get over?

**Result:** an explanation: the game ends when all 3 hearts are lost, and you lose a heart by dropping a treat or catching a burnt cookie.

### 14. Checking how the game stops

> can validate how the game stops again. I felt that it stopped even where there was 1 heart.

**Result:** 30 automated games showed the logic was correct, but two hearts could be lost almost at once. Fixes: a 1-second safe moment after losing a heart, hearts shown inside the play area, and a "💔 Last heart: …" line on the Game Over card.

### 15. Hearts explained

> I still don't understand the heart concept? I see some itmes falling with heart?

**Result:** the burnt-cookie badge changed from "−♥" to a red "✕", and the start card now explains that hearts are your 3 lives.

---

## Phase 5 · Wrap-up

### 16. Collect the prompts

> I want you to give me all the prompts as it is that I have used in this session in a prompts.md file

**Result:** the first version of this file.

### 17. Format the prompts file

> make it well formatted and structred

**Result:** this version, with an overview table, phases and a short result note for each prompt.
