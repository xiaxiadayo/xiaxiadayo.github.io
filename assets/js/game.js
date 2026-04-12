/**
 * 星之猫 ✦ Neko Star Catcher
 * A tribute-style star-collecting mini-game
 * Theme: anime / 猫羽雫 inspired
 *
 * Player controls a cat sprite (keyboard ← → ↑ ↓ or touch)
 * Collect falling stars & musical notes for points
 * Avoid dark clouds that reduce score
 */

(function () {
  'use strict';

  /* ── Canvas & Context ── */
  const canvas = document.getElementById('gameCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  /* ── Game State ── */
  let width, height;
  let animFrame = null;
  let state = 'idle'; // idle | playing | paused | over
  let score = 0;
  let lives = 5;
  let spawnTimer = 0;
  let difficultyTimer = 0;
  let spawnInterval = 60; // frames between spawns

  /* ── Entities ── */
  const player = { x: 0, y: 0, w: 40, h: 40, speed: 5, emoji: '🐱' };
  let items = []; // { x, y, w, h, speed, type:'star'|'note'|'cloud', emoji }

  const ITEM_TYPES = [
    { type: 'star', emoji: '⭐', points: 10, chance: 0.45 },
    { type: 'note', emoji: '🎵', points: 15, chance: 0.35 },
    { type: 'cloud', emoji: '🌧️', points: -20, chance: 0.2 }
  ];

  /* ── Input ── */
  const keys = {};
  let touchX = null;
  let touchY = null;

  /* ── Resize ── */
  function resize() {
    const container = canvas.parentElement;
    const rect = container.getBoundingClientRect();
    width = canvas.width = rect.width;
    height = canvas.height = Math.min(rect.width * 0.75, 450);
    canvas.style.height = height + 'px';
    player.y = height - player.h - 10;
    if (player.x === 0) player.x = width / 2 - player.w / 2;
  }

  /* ── Spawn item ── */
  function spawnItem() {
    const r = Math.random();
    let cumulative = 0;
    let chosen = ITEM_TYPES[0];
    for (const t of ITEM_TYPES) {
      cumulative += t.chance;
      if (r <= cumulative) { chosen = t; break; }
    }
    items.push({
      x: Math.random() * (width - 30),
      y: -30,
      w: 28,
      h: 28,
      speed: 1.5 + Math.random() * 2,
      type: chosen.type,
      emoji: chosen.emoji,
      points: chosen.points
    });
  }

  /* ── Collision ── */
  function collides(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x &&
           a.y < b.y + b.h && a.y + a.h > b.y;
  }

  /* ── Particle effects ── */
  let particles = [];
  function emitParticles(x, y, color, count) {
    for (let i = 0; i < count; i++) {
      particles.push({
        x, y,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        life: 30 + Math.random() * 20,
        maxLife: 50,
        color,
        size: 2 + Math.random() * 3
      });
    }
  }

  /* ── Update ── */
  function update() {
    if (state !== 'playing') return;

    // Player movement (keyboard)
    if (keys['ArrowLeft'] || keys['a'] || keys['A']) player.x -= player.speed;
    if (keys['ArrowRight'] || keys['d'] || keys['D']) player.x += player.speed;
    if (keys['ArrowUp'] || keys['w'] || keys['W']) player.y -= player.speed;
    if (keys['ArrowDown'] || keys['s'] || keys['S']) player.y += player.speed;

    // Touch movement
    if (touchX !== null) {
      const dx = touchX - (player.x + player.w / 2);
      const dy = touchY - (player.y + player.h / 2);
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 5) {
        player.x += (dx / dist) * player.speed;
        player.y += (dy / dist) * player.speed;
      }
    }

    // Clamp player position
    player.x = Math.max(0, Math.min(width - player.w, player.x));
    player.y = Math.max(0, Math.min(height - player.h, player.y));

    // Spawn items
    spawnTimer++;
    if (spawnTimer >= spawnInterval) {
      spawnItem();
      spawnTimer = 0;
    }

    // Increase difficulty over time
    difficultyTimer++;
    if (difficultyTimer % 600 === 0 && spawnInterval > 20) {
      spawnInterval -= 5;
    }

    // Update items
    for (let i = items.length - 1; i >= 0; i--) {
      const item = items[i];
      item.y += item.speed;

      if (collides(player, item)) {
        score += item.points;
        if (score < 0) score = 0;
        if (item.type === 'cloud') {
          lives--;
          emitParticles(item.x + item.w / 2, item.y + item.h / 2, '#7a8a9a', 8);
          if (lives <= 0) {
            state = 'over';
            updateUI();
          }
        } else {
          emitParticles(item.x + item.w / 2, item.y + item.h / 2, '#ffd700', 12);
        }
        items.splice(i, 1);
        updateUI();
        continue;
      }

      if (item.y > height + 30) {
        items.splice(i, 1);
      }
    }

    // Update particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life--;
      if (p.life <= 0) particles.splice(i, 1);
    }
  }

  /* ── Draw ── */
  function draw() {
    ctx.clearRect(0, 0, width, height);

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, '#d4eeff');
    grad.addColorStop(1, '#eef6ff');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Draw background stars
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    for (let i = 0; i < 20; i++) {
      const sx = (i * 137.5 + difficultyTimer * 0.1) % width;
      const sy = (i * 91.3) % height;
      ctx.beginPath();
      ctx.arc(sx, sy, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }

    if (state === 'idle') {
      ctx.textAlign = 'center';
      ctx.font = '600 24px Quicksand, Noto Sans SC, sans-serif';
      ctx.fillStyle = '#5a8fa8';
      ctx.fillText('🐱 星之猫 ✦ Neko Star Catcher', width / 2, height / 2 - 30);
      ctx.font = '16px Quicksand, Noto Sans SC, sans-serif';
      ctx.fillStyle = '#89b8d0';
      ctx.fillText('点击「开始游戏」收集星星与音符吧！', width / 2, height / 2 + 10);
      ctx.fillText('← → ↑ ↓ 或触屏移动 · 避开雨云 🌧️', width / 2, height / 2 + 40);
      return;
    }

    // Draw items
    ctx.font = '24px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (const item of items) {
      ctx.fillText(item.emoji, item.x + item.w / 2, item.y + item.h / 2);
    }

    // Draw player
    ctx.font = '32px sans-serif';
    ctx.fillText(player.emoji, player.x + player.w / 2, player.y + player.h / 2);

    // Draw particles
    for (const p of particles) {
      const alpha = p.life / p.maxLife;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Game over overlay
    if (state === 'over') {
      ctx.fillStyle = 'rgba(200, 230, 248, 0.85)';
      ctx.fillRect(0, 0, width, height);
      ctx.textAlign = 'center';
      ctx.font = '600 28px Quicksand, Noto Sans SC, sans-serif';
      ctx.fillStyle = '#5a8fa8';
      ctx.fillText('游戏结束！', width / 2, height / 2 - 30);
      ctx.font = '20px Quicksand, Noto Sans SC, sans-serif';
      ctx.fillText('得分: ' + score + ' ✦', width / 2, height / 2 + 10);
      ctx.font = '16px Quicksand, Noto Sans SC, sans-serif';
      ctx.fillStyle = '#89b8d0';
      ctx.fillText('点击「重新开始」再来一次吧～', width / 2, height / 2 + 45);
    }

    // Paused overlay
    if (state === 'paused') {
      ctx.fillStyle = 'rgba(200, 230, 248, 0.7)';
      ctx.fillRect(0, 0, width, height);
      ctx.textAlign = 'center';
      ctx.font = '600 24px Quicksand, Noto Sans SC, sans-serif';
      ctx.fillStyle = '#5a8fa8';
      ctx.fillText('⏸ 暂停中...', width / 2, height / 2);
    }
  }

  /* ── Game loop ── */
  function loop() {
    update();
    draw();
    animFrame = requestAnimationFrame(loop);
  }

  /* ── UI Updates ── */
  function updateUI() {
    const scoreEl = document.getElementById('gameScore');
    const livesEl = document.getElementById('gameLives');
    if (scoreEl) scoreEl.textContent = score;
    if (livesEl) livesEl.textContent = '❤️'.repeat(Math.max(0, lives));
  }

  /* ── Public controls (called from HTML buttons) ── */
  window.gameStart = function () {
    state = 'playing';
    score = 0;
    lives = 5;
    items = [];
    particles = [];
    spawnTimer = 0;
    difficultyTimer = 0;
    spawnInterval = 60;
    player.x = width / 2 - player.w / 2;
    player.y = height - player.h - 10;
    updateUI();
    document.getElementById('btnStart').textContent = '🔄 重新开始';
  };

  window.gamePause = function () {
    if (state === 'playing') {
      state = 'paused';
      document.getElementById('btnPause').textContent = '▶️ 继续';
    } else if (state === 'paused') {
      state = 'playing';
      document.getElementById('btnPause').textContent = '⏸ 暂停';
    }
  };

  /* ── Keyboard events ── */
  document.addEventListener('keydown', function (e) {
    keys[e.key] = true;
    // Space to start/restart when idle or over
    if (e.key === ' ' || e.key === 'Enter') {
      if (state === 'idle' || state === 'over') window.gameStart();
      else if (state === 'playing' || state === 'paused') window.gamePause();
    }
  });
  document.addEventListener('keyup', function (e) { keys[e.key] = false; });

  /* ── Touch events ── */
  canvas.addEventListener('touchstart', function (e) {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    touchX = (touch.clientX - rect.left) * (width / rect.width);
    touchY = (touch.clientY - rect.top) * (height / rect.height);
    if (state === 'idle' || state === 'over') window.gameStart();
  }, { passive: false });

  canvas.addEventListener('touchmove', function (e) {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    touchX = (touch.clientX - rect.left) * (width / rect.width);
    touchY = (touch.clientY - rect.top) * (height / rect.height);
  }, { passive: false });

  canvas.addEventListener('touchend', function () {
    touchX = null;
    touchY = null;
  });

  /* ── Init ── */
  resize();
  window.addEventListener('resize', resize);
  updateUI();
  loop();
})();
