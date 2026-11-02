/* =========================================================
   Little Whisk Bakery — "Treat Catch" mini-game
   Wrapped in a function so its names don't clash with the other scripts.
   ========================================================= */

(() => {
  const BEST_KEY = 'little-whisk-best';
  const MAX_LIVES = 3;
  const SIZE = 30;          // treat radius, in game units
  const BOWL_SPEED = 560;   // game units per second with the keyboard
  const GRACE = 1;          // seconds of safety after losing a heart, so two can't vanish at once

  const game = document.querySelector('.game');
  const stage = game.querySelector('.game-stage');
  const canvas = game.querySelector('.game-canvas');
  const ctx = canvas.getContext('2d');
  const overlay = game.querySelector('.game-overlay');
  const screens = game.querySelectorAll('.game-card');
  const scoreEl = game.querySelector('.game-score');
  const livesEl = game.querySelector('.game-lives');
  const bestEl = game.querySelector('.game-best');
  const hudRestart = game.querySelector('.game-hud .game-restart');

  // Points for each falling thing (0 = bad) and how often it appears
  const TREATS = {
    cookie:   { points: 1, weight: 50, name: 'a cookie' },
    brownie:  { points: 2, weight: 24, name: 'a brownie' },
    tiramisu: { points: 3, weight: 12, name: 'a tiramisu cup' },
    golden:   { points: 5, weight: 4, name: 'a golden cookie' },
    burnt:    { points: 0, weight: 16, name: 'a burnt cookie' },
  };

  // The play area is 720 (or 480 on phones) game units wide; height follows the stage shape
  let W = 720;
  let H = 480;
  let scale = 1;

  let state = 'idle'; // idle | running | paused | over
  let score = 0;
  let lives = MAX_LIVES;
  let items = [];
  let popups = [];
  let spawnTimer = 0;
  let flash = 0;
  let bounce = 0;
  let lastTime = 0;
  let frameId = 0;
  let gameTime = 0;     // seconds played this round (pauses don't count)
  let graceUntil = 0;   // no hearts can be lost before this gameTime
  let lastLoss = '';    // what took the last heart, shown on the Game Over card
  const bowl = { x: 360, w: 120 };
  const keys = { left: false, right: false };

  let best = 0;
  try { best = Number(localStorage.getItem(BEST_KEY)) || 0; } catch { /* storage blocked */ }

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
  const rimY = () => H - 70;

  /* ---------- Screens & score bar ---------- */

  function showScreen(name) {
    screens.forEach((card) => { card.hidden = card.dataset.screen !== name; });
    overlay.hidden = !name;
    stage.classList.toggle('is-running', !name);
  }

  function updateHud() {
    scoreEl.textContent = score;
    bestEl.textContent = best;
    livesEl.textContent = '❤️'.repeat(lives) + '🤍'.repeat(MAX_LIVES - lives);
    livesEl.setAttribute('aria-label', `${lives} ${lives === 1 ? 'heart' : 'hearts'} left`);
  }

  /* ---------- Game flow ---------- */

  function start() {
    cancelAnimationFrame(frameId);
    score = 0;
    lives = MAX_LIVES;
    items = [];
    popups = [];
    spawnTimer = 0.6;
    flash = 0;
    bounce = 0;
    gameTime = 0;
    graceUntil = 0;
    lastLoss = '';
    bowl.x = W / 2;
    keys.left = keys.right = false;
    updateHud();
    hudRestart.hidden = false;

    state = 'running';
    showScreen(null);
    canvas.focus({ preventScroll: true });
    lastTime = performance.now();
    frameId = requestAnimationFrame(loop);
  }

  function pause() {
    if (state !== 'running') return;
    state = 'paused';
    cancelAnimationFrame(frameId);
    keys.left = keys.right = false;
    showScreen('paused');
  }

  function resume() {
    if (state !== 'paused') return;
    state = 'running';
    showScreen(null);
    canvas.focus({ preventScroll: true });
    lastTime = performance.now();
    frameId = requestAnimationFrame(loop);
  }

  function gameOver() {
    state = 'over';
    const isBest = score > best;
    if (isBest) {
      best = score;
      try { localStorage.setItem(BEST_KEY, best); } catch { /* ignore */ }
    }
    game.querySelector('.game-final').textContent = score;
    game.querySelector('.game-final-unit').textContent = score === 1 ? 'point' : 'points';
    game.querySelector('.game-newbest').hidden = !isBest;
    game.querySelector('.game-best-over').textContent = best;
    game.querySelector('.game-reason').textContent = `💔 Last heart: ${lastLoss}.`;
    updateHud();
    showScreen('over');
    game.querySelector('[data-screen="over"] .game-restart').focus({ preventScroll: true });
  }

  function loop(time) {
    const dt = Math.min((time - lastTime) / 1000, 0.05); // seconds; capped so a hiccup can't teleport treats
    lastTime = time;
    update(dt);
    draw();
    if (lives <= 0) return gameOver();
    frameId = requestAnimationFrame(loop);
  }

  /* ---------- Rules ---------- */

  // Burnt cookies get a little more common as the score climbs
  function pickType() {
    const weights = Object.entries(TREATS).map(([type, t]) =>
      [type, type === 'burnt' ? t.weight + Math.min(score, 60) * 0.25 : t.weight]);
    let roll = Math.random() * weights.reduce((sum, [, w]) => sum + w, 0);
    for (const [type, w] of weights) {
      roll -= w;
      if (roll <= 0) return type;
    }
    return 'cookie';
  }

  function spawn() {
    const type = pickType();
    const round = type === 'cookie' || type === 'golden' || type === 'burnt';
    items.push({
      type,
      x: SIZE + Math.random() * (W - SIZE * 2),
      y: -SIZE,
      vy: Math.min(470, 150 + score * 3.5) * (0.85 + Math.random() * 0.3),
      rot: round ? Math.random() * Math.PI * 2 : 0,
      spin: round ? (Math.random() - 0.5) * 2.5 : 0,
    });
  }

  function addPopup(text, x, color) {
    popups.push({ text, x: clamp(x, 50, W - 50), y: rimY() - 24, life: 1, color });
  }

  function catchItem(item) {
    const { points } = TREATS[item.type];
    if (!points) return loseLife(item.x, 'Burnt! 🔥', 'you caught a burnt cookie');
    score += points;
    bounce = 1;
    addPopup(`+${points}`, item.x, '#D6336F');
    updateHud();
  }

  function loseLife(x, text, reason) {
    if (gameTime < graceUntil) return; // still in the safe moment after the last heart
    lives = Math.max(0, lives - 1);
    graceUntil = gameTime + GRACE;
    lastLoss = reason;
    flash = 1;
    addPopup(text, x, '#C4314B');
    updateHud();
  }

  function update(dt) {
    gameTime += dt;
    const dir = (keys.right ? 1 : 0) - (keys.left ? 1 : 0);
    bowl.x = clamp(bowl.x + dir * BOWL_SPEED * dt, bowl.w / 2, W - bowl.w / 2);

    // New treats arrive faster as the score goes up
    spawnTimer -= dt;
    if (spawnTimer <= 0) {
      spawn();
      spawnTimer = Math.max(0.42, 1.05 - score * 0.012) * (0.75 + Math.random() * 0.5);
    }

    const rim = rimY();
    for (const item of items) {
      item.y += item.vy * dt;
      item.rot += item.spin * dt;

      const atRim = item.y + SIZE * 0.4 >= rim && item.y - SIZE < rim;
      if (atRim && Math.abs(item.x - bowl.x) < bowl.w / 2 + SIZE * 0.3) {
        item.done = true;
        catchItem(item);
      } else if (item.y - SIZE > H) {
        item.done = true;
        if (TREATS[item.type].points) loseLife(item.x, 'Oops!', `you dropped ${TREATS[item.type].name}`);
      }
    }
    items = items.filter((item) => !item.done);

    for (const p of popups) {
      p.y -= 50 * dt;
      p.life -= dt * 1.2;
    }
    popups = popups.filter((p) => p.life > 0);
    flash = Math.max(0, flash - dt * 2.5);
    bounce = Math.max(0, bounce - dt * 4);
  }

  /* ---------- Drawing ---------- */

  function circle(x, y, r, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  function roundRect(x, y, w, h, r, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x, y, w, h, r);
    else ctx.rect(x, y, w, h);
    ctx.fill();
  }

  function drawKitchen() {
    const wall = ctx.createLinearGradient(0, 0, 0, H);
    wall.addColorStop(0, '#FFF8F0');
    wall.addColorStop(1, '#FFE6EF');
    ctx.fillStyle = wall;
    ctx.fillRect(0, 0, W, H);

    // Polka-dot wallpaper
    for (let row = 0, y = 30; y < H - 60; row++, y += 56) {
      for (let x = (row % 2) * 28 + 20; x < W; x += 56) circle(x, y, 4, 'rgba(201, 182, 242, 0.35)');
    }

    // Counter top
    ctx.fillStyle = '#C98A5B';
    ctx.fillRect(0, H - 24, W, 24);
    ctx.fillStyle = '#E2A877';
    ctx.fillRect(0, H - 24, W, 6);
  }

  function drawCookie(base, dough, chip) {
    circle(0, 0, SIZE, base);
    circle(0, 0, SIZE - 4, dough);
    for (const [x, y, r] of [[-10, -9, 5], [9, -12, 4], [12, 6, 5], [-4, 9, 4.5], [-16, 5, 3.5]]) circle(x, y, r, chip);
  }

  function drawTreat(item) {
    ctx.save();
    ctx.translate(item.x, item.y);
    ctx.rotate(item.rot);

    if (item.type === 'cookie') {
      drawCookie('#C98A44', '#E6A960', '#4A2C21');
    } else if (item.type === 'burnt') {
      drawCookie('#24150E', '#3A2418', '#120A06');
    } else if (item.type === 'golden') {
      ctx.shadowColor = '#FFD37A';
      ctx.shadowBlur = 20;
      circle(0, 0, SIZE, '#F2B04A');
      ctx.shadowBlur = 0;
      circle(0, 0, SIZE - 4, '#FFD37A');
      const sprinkles = ['#FF7BA9', '#9FE2C8', '#C9B6F2', '#D6336F', '#FFFFFF'];
      for (let i = 0; i < 10; i++) {
        ctx.save();
        ctx.rotate(i * 2.4);
        ctx.translate(8 + (i % 3) * 5, 0);
        ctx.rotate(i);
        roundRect(-5, -1.5, 10, 3, 1.5, sprinkles[i % sprinkles.length]);
        ctx.restore();
      }
    } else if (item.type === 'brownie') {
      roundRect(-28, -18, 56, 40, 8, '#4E2B1C');
      roundRect(-28, -22, 56, 30, 8, '#6B3F2A');
      ctx.strokeStyle = '#8A5A40';
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-18, -12); ctx.lineTo(-8, -7); ctx.lineTo(0, -11);
      ctx.moveTo(6, -14); ctx.lineTo(14, -6); ctx.lineTo(22, -9);
      ctx.stroke();
    } else if (item.type === 'tiramisu') {
      ctx.beginPath();
      ctx.moveTo(-22, -26); ctx.lineTo(22, -26); ctx.lineTo(17, 30); ctx.lineTo(-17, 30);
      ctx.closePath();
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
      ctx.save();
      ctx.clip();
      const layers = [['#7A4A33', 8], ['#FFF1D9', 12], ['#9C6644', 10], ['#FFF1D9', 12], ['#9C6644', 20]];
      let y = -26;
      for (const [color, h] of layers) {
        ctx.fillStyle = color;
        ctx.fillRect(-24, y, 48, h);
        y += h;
      }
      ctx.restore();
      ctx.strokeStyle = '#F3D3DF';
      ctx.lineWidth = 3;
      ctx.stroke();
      circle(0, -32, 6, '#E5487F');
    }
    ctx.restore();

    // Smoke wisps above burnt cookies (drawn upright, not spinning)
    if (item.type === 'burnt') {
      ctx.strokeStyle = 'rgba(90, 90, 90, 0.45)';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(item.x - 8, item.y - SIZE - 2);
      ctx.quadraticCurveTo(item.x - 16, item.y - SIZE - 12, item.x - 6, item.y - SIZE - 22);
      ctx.moveTo(item.x + 8, item.y - SIZE - 2);
      ctx.quadraticCurveTo(item.x, item.y - SIZE - 12, item.x + 10, item.y - SIZE - 22);
      ctx.stroke();
    }

    drawPointsBadge(item);
  }

  // Little upright badge beside each treat showing what it's worth ("+2", or a red "✕" for burnt)
  function drawPointsBadge(item) {
    const { points } = TREATS[item.type];
    const r = W < 600 ? 19 : 16; // a bit bigger on phones, where the play area is scaled down
    const x = item.x + SIZE * 0.8;
    const y = item.y - SIZE * 0.8;

    ctx.save();
    circle(x, y, r, points ? (item.type === 'golden' ? '#FFD37A' : '#FFFFFF') : '#C4314B');
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = points ? '#D6336F' : '#FFFFFF';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = points ? '#B8235A' : '#FFFFFF';
    ctx.font = `700 ${Math.round(r * 0.95)}px Fredoka, Nunito, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(points ? `+${points}` : '✕', x, y + 1);
    ctx.restore();
  }

  function drawBowl() {
    const half = bowl.w / 2;
    const squash = bounce * 6; // little bounce after a catch
    const depth = 46 - squash;

    ctx.save();
    ctx.translate(bowl.x, rimY() + squash);
    // Blink during the safe moment after losing a heart
    if (state === 'running' && gameTime < graceUntil && Math.floor(gameTime * 10) % 2) ctx.globalAlpha = 0.35;

    ctx.fillStyle = '#FF7BA9';
    ctx.beginPath();
    ctx.moveTo(-half, 0);
    ctx.quadraticCurveTo(-half + 6, depth, -half * 0.45, depth);
    ctx.lineTo(half * 0.45, depth);
    ctx.quadraticCurveTo(half - 6, depth, half, 0);
    ctx.closePath();
    ctx.fill();

    // White polka dots on the bowl
    for (const [x, y] of [[-30, 14], [0, 24], [30, 14], [-14, 34], [14, 34]]) circle(x, y * depth / 46, 3.5, 'rgba(255, 255, 255, 0.8)');

    // Rim
    ctx.fillStyle = '#E5487F';
    ctx.beginPath();
    ctx.ellipse(0, 0, half + 4, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFC2D7';
    ctx.beginPath();
    ctx.ellipse(0, 0, half - 4, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawPopups() {
    ctx.textAlign = 'center';
    ctx.font = '700 26px Fredoka, Nunito, sans-serif';
    ctx.lineJoin = 'round';
    for (const p of popups) {
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 5;
      ctx.strokeText(p.text, p.x, p.y);
      ctx.fillStyle = p.color;
      ctx.fillText(p.text, p.x, p.y);
    }
    ctx.globalAlpha = 1;
  }

  // Hearts (top-left) and score (top-right) inside the play area, where the player is looking
  function drawCanvasHud() {
    ctx.save();
    ctx.textBaseline = 'middle';
    roundRect(10, 10, 106, 34, 17, 'rgba(255, 255, 255, 0.85)');
    ctx.font = '20px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('❤️'.repeat(lives) + '🤍'.repeat(MAX_LIVES - lives), 20, 28);

    roundRect(W - 116, 10, 106, 34, 17, 'rgba(255, 255, 255, 0.85)');
    ctx.font = '700 20px Fredoka, Nunito, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#B8235A';
    ctx.fillText(`★ ${score}`, W - 63, 28);
    ctx.restore();
  }

  function draw() {
    drawKitchen();
    items.forEach(drawTreat);
    drawBowl();
    drawPopups();
    if (state !== 'idle') drawCanvasHud();
    if (flash > 0) {
      ctx.fillStyle = `rgba(196, 49, 75, ${flash * 0.25})`;
      ctx.fillRect(0, 0, W, H);
    }
  }

  // Keep the canvas sharp and correctly sized whenever the stage changes size
  function resize() {
    const rect = canvas.getBoundingClientRect();
    if (!rect.width) return;
    const dpr = window.devicePixelRatio || 1;
    W = rect.width < 600 ? 480 : 720;
    H = (W * rect.height) / rect.width;
    scale = rect.width / W;
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    ctx.setTransform(dpr * scale, 0, 0, dpr * scale, 0, 0);
    bowl.x = clamp(bowl.x, bowl.w / 2, W - bowl.w / 2);
    if (state === 'idle') {
      bowl.x = W / 2;
      items = OPENING_SCENE.map(([type, fx, fy, rot]) => ({ type, x: fx * W, y: fy * H, rot }));
    }
    draw();
  }

  // Treats scattered behind the Start card: [type, x and y as fractions of the play area, rotation]
  const OPENING_SCENE = [
    ['cookie', 0.2, 0.22, 0.4],
    ['tiramisu', 0.5, 0.4, 0],
    ['brownie', 0.8, 0.2, 0],
    ['burnt', 0.32, 0.6, 1.2],
    ['golden', 0.72, 0.58, 0.8],
  ];

  /* ---------- Controls ---------- */

  const MOVE_KEYS = { ArrowLeft: 'left', a: 'left', A: 'left', ArrowRight: 'right', d: 'right', D: 'right' };

  // Keys only act while the play area has focus, so normal page scrolling isn't hijacked
  canvas.addEventListener('keydown', (event) => {
    if (MOVE_KEYS[event.key]) {
      event.preventDefault();
      keys[MOVE_KEYS[event.key]] = true;
    } else if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      if (state === 'paused') resume();
      else if (state !== 'running') start();
    } else if (event.key === 'p' || event.key === 'P') {
      event.preventDefault();
      if (state === 'paused') resume();
      else pause();
    } else if (event.key === 'Escape') {
      pause();
    }
  });
  canvas.addEventListener('keyup', (event) => {
    if (MOVE_KEYS[event.key]) keys[MOVE_KEYS[event.key]] = false;
  });

  // Mouse and touch: the bowl follows the pointer
  function followPointer(event) {
    if (state !== 'running') return;
    const rect = canvas.getBoundingClientRect();
    bowl.x = clamp((event.clientX - rect.left) / scale, bowl.w / 2, W - bowl.w / 2);
  }
  canvas.addEventListener('pointermove', followPointer);
  canvas.addEventListener('pointerdown', followPointer);

  // Pause when the visitor clicks away or switches tabs
  canvas.addEventListener('blur', pause);
  document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); });

  game.querySelector('.game-start').addEventListener('click', start);
  game.querySelector('.game-resume').addEventListener('click', resume);
  game.querySelectorAll('.game-restart').forEach((btn) => btn.addEventListener('click', start));

  updateHud();
  showScreen('start');
  new ResizeObserver(resize).observe(canvas);
})();
