/* ===== 夏夏的小世界 — Main Script ===== */

document.addEventListener('DOMContentLoaded', () => {
  const overlay = document.getElementById('entryOverlay');
  const pageContent = document.getElementById('pageContent');
  const musicPlayer = document.getElementById('musicPlayer');
  const musicToggle = document.getElementById('musicToggle');
  const musicIcon = document.getElementById('musicIcon');
  const musicEq = document.getElementById('musicEq');
  const catPet = document.getElementById('catPet');
  const catArt = document.getElementById('catArt');
  const catBubble = document.getElementById('catBubble');
  const catBarrage = document.getElementById('catBarrage');
  const likesGrid = document.getElementById('likesGrid');
  const likeModal = document.getElementById('likeModal');
  const likeModalClose = document.getElementById('likeModalClose');
  const likeModalTitle = document.getElementById('likeModalTitle');
  const likeModalBody = document.getElementById('likeModalBody');
  const musicPadArea = document.getElementById('musicPadArea');
  const musicPadGrid = document.getElementById('musicPadGrid');
  const gameArea = document.getElementById('gameArea');
  const tetrisBoard = document.getElementById('tetrisBoard');
  const tetrisLeftButton = document.getElementById('tetrisLeftButton');
  const tetrisRotateButton = document.getElementById('tetrisRotateButton');
  const tetrisRightButton = document.getElementById('tetrisRightButton');
  const tetrisDropButton = document.getElementById('tetrisDropButton');
  const gameResult = document.getElementById('gameResult');
  const contactTrigger = document.getElementById('contactTrigger');
  const contactModal = document.getElementById('contactModal');
  const contactModalClose = document.getElementById('contactModalClose');
  const contactInputBlock = document.getElementById('contactInputBlock');
  const contactInfo = document.getElementById('contactInfo');
  const contactInput = document.getElementById('contactInput');
  const contactConfirmButton = document.getElementById('contactConfirmButton');
  const punishOverlay = document.getElementById('punishOverlay');
  const punishMessage = document.getElementById('punishMessage');
  const punishConfirm = document.getElementById('punishConfirm');

  let musicPlaying = false;
  const verifiedKey = 'xiaxia_contact_verified';
  let contactVerified = localStorage.getItem(verifiedKey) === '1';
  let punishUsed = false;
  let wrongInputCount = 0;

  let audioCtx = null;
  let bgStep = 0;
  let bgTimer = null;
  let sharpOsc = null;
  let sharpGain = null;
  let sharpLfo = null;
  let sharpLfoGain = null;
  let resumeAfterPunish = false;
  let bgStartTime = 0;
  const BG_MUSIC_PLAY_MS = 20000;
  const BG_MUSIC_FADE_MS = 3000;

  const BARRAGE_BULLET_COUNT = 56;

  function ensureAudioContext() {
    if (!audioCtx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return null;
      audioCtx = new AudioCtx();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  }

  function playTone({ frequency, duration = 0.2, volume = 0.04, type = 'square', when = 0 }) {
    const ctx = ensureAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime + when;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, now);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  /* ---------- helpers: animation detection ---------- */
  function cssAnimationsBlocked() {
    try {
      const el = document.createElement('div');
      el.style.animation = 'none 0s';
      document.body.appendChild(el);
      const cs = getComputedStyle(el);
      const blocked = cs.animationName === '' && cs.animationDuration === '';
      el.remove();
      return blocked;
    } catch { return false; }
  }

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1. Entry Overlay ---------- */
  overlay.addEventListener('click', () => {
    const animBlocked = reducedMotion || cssAnimationsBlocked();

    startBgMusic();

    document.body.classList.remove('no-scroll');
    musicPlayer.classList.remove('hidden');
    catPet.classList.remove('hidden');

    if (animBlocked) {
      overlay.classList.add('anim-fallback');
      pageContent.classList.add('revealed');
      document.body.style.background = 'var(--bg)';
      setTimeout(() => {
        if (overlay.parentNode) overlay.remove();
        finishEntry();
      }, 60);
      return;
    }

    runEntryRings();
  });

  function runEntryRings() {
    overlay.classList.add('rings');

    const layer = document.createElement('div');
    layer.className = 'entry-rings-layer';
    overlay.appendChild(layer);

    const rings = 5;
    const gap = 140;
    const ringDur = 760;
    const total = gap * (rings - 1) + ringDur;

    for (let i = 0; i < rings; i++) {
      const r = document.createElement('div');
      r.className = 'entry-ring';
      r.style.animationDelay = i * gap + 'ms';
      r.style.borderColor = 'rgba(240, 248, 255, ' + Math.max(0.25, 0.9 - i * 0.13) + ')';
      layer.appendChild(r);
    }

    const safetyTimer = setTimeout(() => {
      if (overlay.parentNode) {
        overlay.remove();
        finishEntry();
      }
    }, total + 600);

    setTimeout(() => {
      clearTimeout(safetyTimer);
      document.body.style.background = 'var(--bg)';
      pageContent.classList.add('revealed');
      if (overlay.parentNode) overlay.remove();
      finishEntry();
    }, total + 60);
  }

  function finishEntry() {
    pageContent.classList.remove('circle-revealing');
    pageContent.classList.add('revealed');
    observeFadeIns();
  }

  /* ---------- 2. Music Player Controls (8-bit) ---------- */
  function setMusicState(isPlaying) {
    musicPlaying = isPlaying;
    musicIcon.textContent = isPlaying ? '⏸' : '▶';
    musicEq.classList.toggle('playing', isPlaying);
  }

  function startBgMusic() {
    if (bgTimer) return;
    ensureAudioContext();
    bgStartTime = Date.now();

    const lead = [
      659.25, 783.99, 987.77, 783.99,
      659.25, 587.33, 523.25, 587.33,
      659.25, 783.99, 880.0, 783.99,
      659.25, 587.33, 523.25, 493.88,
    ];
    const bass = [
      164.81, 164.81, 196.0, 196.0,
      130.81, 130.81, 146.83, 146.83,
      174.61, 174.61, 196.0, 196.0,
      130.81, 130.81, 123.47, 123.47,
    ];

    bgTimer = window.setInterval(() => {
      const elapsed = Date.now() - bgStartTime;
      if (elapsed >= BG_MUSIC_PLAY_MS + BG_MUSIC_FADE_MS) {
        stopBgMusic();
        return;
      }
      let vol = 1;
      if (elapsed >= BG_MUSIC_PLAY_MS) {
        vol = Math.max(0, 1 - (elapsed - BG_MUSIC_PLAY_MS) / BG_MUSIC_FADE_MS);
      }
      const i = bgStep % lead.length;
      playTone({ frequency: lead[i], duration: 0.12, volume: 0.03 * vol, type: 'square' });
      playTone({ frequency: bass[i], duration: 0.18, volume: 0.02 * vol, type: 'triangle' });
      if (i % 4 === 0) {
        playTone({ frequency: lead[i] * 2, duration: 0.05, volume: 0.012 * vol, type: 'square', when: 0.04 });
      }
      bgStep += 1;
    }, 180);

    setMusicState(true);
  }

  function stopBgMusic() {
    if (bgTimer) {
      clearInterval(bgTimer);
      bgTimer = null;
    }
    setMusicState(false);
  }

  /** Resume music, play for 5 seconds at full volume, then fade out and stop */
  const RESUME_PLAY_MS = 5000;
  const RESUME_FADE_MS = 3000;

  function resumeMusicThenFadeOut() {
    if (bgTimer) return;
    ensureAudioContext();
    bgStartTime = Date.now();

    const lead = [
      659.25, 783.99, 987.77, 783.99,
      659.25, 587.33, 523.25, 587.33,
      659.25, 783.99, 880.0, 783.99,
      659.25, 587.33, 523.25, 493.88,
    ];
    const bass = [
      164.81, 164.81, 196.0, 196.0,
      130.81, 130.81, 146.83, 146.83,
      174.61, 174.61, 196.0, 196.0,
      130.81, 130.81, 123.47, 123.47,
    ];

    bgStep = 0;
    bgTimer = window.setInterval(() => {
      const elapsed = Date.now() - bgStartTime;
      if (elapsed >= RESUME_PLAY_MS + RESUME_FADE_MS) {
        stopBgMusic();
        return;
      }
      let vol = 1;
      if (elapsed >= RESUME_PLAY_MS) {
        vol = Math.max(0, 1 - (elapsed - RESUME_PLAY_MS) / RESUME_FADE_MS);
      }
      const i = bgStep % lead.length;
      playTone({ frequency: lead[i], duration: 0.12, volume: 0.03 * vol, type: 'square' });
      playTone({ frequency: bass[i], duration: 0.18, volume: 0.02 * vol, type: 'triangle' });
      if (i % 4 === 0) {
        playTone({ frequency: lead[i] * 2, duration: 0.05, volume: 0.012 * vol, type: 'square', when: 0.04 });
      }
      bgStep += 1;
    }, 180);

    setMusicState(true);
  }

  musicToggle.addEventListener('click', () => {
    if (musicPlaying) {
      stopBgMusic();
    } else {
      startBgMusic();
    }
  });

  /* ---------- 3. Cat Pet ---------- */
  const catNormal = '(=^･ω･^=)';
  const catHappy = '(=^˃ᴗ˂^=)';
  const catBlush = '(=^˶ᵕ˶^=)';
  const catAngy = '(=^`ω´^=)';
  const catBarrageFaces = [
    '(=^･ω･^=)', '(=^･ｪ･^=)', '(=①ω①=)', '(=ＴェＴ=)', '(=｀ω´=)', '(=^‥^=)', '(=^-ω-^=)',
    'ฅ(•ㅅ•❀)ฅ', 'ฅ(=✧ω✧=)ฅ', 'ฅ(๑•̀ω•́๑)ฅ', 'ฅ(^◕ᴥ◕^)ฅ', 'ฅ(^ω^ฅ)', 'ฅ(⌯͒• ɪ •⌯͒)ฅ',
    'ฅ(=˃ᆺ˂=)ฅ', 'ฅ(≚ᄌ≚)ฅ', 'ฅ(ↀᴥↀ)ฅ', 'ฅ(^._.^)ﾉ', 'ฅ( ̳• ·̫ • ̳ฅ)', 'ฅ(｡•ㅅ•｡)ฅ', 'ฅ(•̀㉨•́ )ฅ',
    '/ᐠ｡ꞈ｡ᐟ\\', '/ᐠ˵• ⩊ •˵ᐟ\\', '/ᐠ - ˕ -マ', '/ᐠ˶>⩊<˶ᐟ\\', '/ᐠ˶•ᵕ•˶ᐟ\\', '/ᐠ˶•ω•˶ᐟ\\',
    '/ᐠ˶• - •˶ᐟ\\', '/ᐠ˶ᵔ ᵕ ᵔ˶ᐟ\\', '/ᐠᵔ ﻌ ᵔᐟ\\', '/ᐠ ˵ ᴗ ˵ ᐟ\\', '/ᐠ˵  ˘ ᵕ ˘ ˵ᐟ\\', '/ᐠ˵◕ᴗ◕˵ᐟ\\',
    '(^=◕ᴥ◕=^)', '(^=･ω･^=)', '(^=˃ᆺ˂=^)', '(^=◔ᴥ◔=^)', '(^=•̀ω•́=^)', '(^=•ﻌ•=^)', '(^=･ｪ･=^)',
    '(=^-ェ-^=)', '(=^･^=)', '(=^･ω･^)y＝', '(=^･o･^=)', '(=^･ｘ･^=)', '(=;ェ;=)', '(=｀ェ´=)',
    '(=｀(∞)´=)', '(=ＴωＴ=)', '(=；ェ；=)', '(=✪ ﻌ ✪=)', '(=ↀωↀ=)', '(=^･^=)ﾉ', '(=⁎˃ᴗ˂⁎=)',
    '(=^･ω･^)b', '(=￣ω￣=)', '(=^-^=)', '(=◕ᴥ◕=)', '(=⚈ω⚈=)', '(=^･ω･^=)♪', '(=^･ﻌ･^=)'
  ];

  const catMessages = [
    '喵~', '再摸一下嘛', '你今天也超可爱', '给你一个猫猫抱抱', '喵喵巡逻中',
    '心情 +1', '摸摸有好运', '要不要一起听 8-bit？', 'ฅ^•ﻌ•^ฅ', '嘿嘿~'
  ];

  let bubbleTimer = null;
  let catMoodIndex = 0;
  const catMoodCycle = [catHappy, catBlush, catAngy, catHappy];

  catPet.addEventListener('mouseenter', () => {
    catArt.textContent = catHappy;
  });

  catPet.addEventListener('mouseleave', () => {
    catArt.textContent = catNormal;
  });

  catPet.addEventListener('click', () => {
    const msg = catMessages[Math.floor(Math.random() * catMessages.length)];
    catBubble.textContent = msg;
    catBubble.classList.add('show');

    catArt.textContent = catMoodCycle[catMoodIndex % catMoodCycle.length];
    catMoodIndex += 1;
    setTimeout(() => {
      catArt.textContent = catHappy;
    }, 550);

    clearTimeout(bubbleTimer);
    bubbleTimer = setTimeout(() => {
      catBubble.classList.remove('show');
    }, 2200);

    launchCatBarrage();
  });

  function launchCatBarrage() {
    const isDesktop = window.matchMedia('(min-width: 901px)').matches;
    const count = isDesktop ? Math.min(BARRAGE_BULLET_COUNT, 80) : BARRAGE_BULLET_COUNT;
    const animBlocked = reducedMotion || cssAnimationsBlocked();

    for (let i = 0; i < count; i++) {
      const bullet = document.createElement('div');
      bullet.className = 'cat-bullet';
      bullet.textContent = catBarrageFaces[Math.floor(Math.random() * catBarrageFaces.length)];
      const topPos = Math.random() * 82 + 6;
      bullet.style.top = `${topPos}%`;
      const baseFontSize = isDesktop ? 16 : 13;
      const fontRange = isDesktop ? 14 : 12;
      bullet.style.fontSize = `${Math.random() * fontRange + baseFontSize}px`;

      const delayMs = Math.random() * 1500;
      const durationMs = (Math.random() * 2.5 + (isDesktop ? 5 : 3.8)) * 1000;
      bullet.style.animationDelay = `${delayMs}ms`;
      bullet.style.animationDuration = `${durationMs}ms`;

      /* Fallback for when CSS animations are blocked by plugins */
      if (animBlocked) {
        bullet.classList.add('no-anim');
        bullet.style.animation = 'none';
        bullet.style.opacity = '0.9';
        bullet.style.transform = 'translateX(0)';
        requestAnimationFrame(() => {
          bullet.style.transitionDelay = `${delayMs}ms`;
          bullet.style.transitionDuration = `${durationMs}ms`;
          bullet.style.transform = `translateX(calc(100vw + 250px))`;
          bullet.style.opacity = '0';
        });
      }

      catBarrage.appendChild(bullet);
      setTimeout(() => bullet.remove(), durationMs + delayMs + 1000);
    }
  }

  /* ---------- 4. Likes interactions ---------- */
  const likeContentMap = {
    music: { title: '♪ 音乐', text: '点下面 4×4 格子，像打击垫一样每格一个不同音色。', pad: true },
    daydream: { title: '☁ 发呆', text: '偶尔发呆是一种充电方式，什么都不做也很好。' },
    cat: { title: '🐱 猫猫', text: '猫猫是世界级治愈源，看到就会不自觉笑出来。' },
    rain: { title: '🌧 雨天', text: '雨声像天然白噪音，和心情一起慢慢沉下来。' },
    sunset: { title: '�� 日落', text: '每次日落颜色都不一样，像今天专属的结尾。' },
    game: { title: '🎮 玩游戏', text: '来玩猫猫主题俄罗斯方块吧（中间不填充颜色）。', game: true },
    travel: { title: '🧳 旅行', text: '喜欢走走停停，收集陌生城市里温柔的小细节。' },
    movie: { title: '🎬 电影', text: '好电影像一段借来的生命，两个小时很值得。' },
    photography: { title: '📷 拍照', text: '拍照是为了留住当时那一秒“啊真好”的感觉。' },
    coding: { title: '💻 写代码', text: '把想法变成可运行的页面，超有成就感。' },
    nightwalk: { title: '🌃 夜游', text: '夜风很轻的时候，街道会变得像一条慢镜头。' },
    dessert: { title: '🍰 甜点', text: '甜甜的食物会把坏情绪先按下暂停键。' },
    stargaze: { title: '✨ 看星星', text: '抬头看星星，会觉得很多事都没那么可怕。' },
  };

  const padSounds = [
    { n: 'C4', f: 261.63, t: 'square' }, { n: 'D4', f: 293.66, t: 'triangle' }, { n: 'E4', f: 329.63, t: 'sawtooth' }, { n: 'G4', f: 392.0, t: 'square' },
    { n: 'A4', f: 440.0, t: 'triangle' }, { n: 'B4', f: 493.88, t: 'sawtooth' }, { n: 'C5', f: 523.25, t: 'square' }, { n: 'D5', f: 587.33, t: 'triangle' },
    { n: 'E5', f: 659.25, t: 'sawtooth' }, { n: 'G5', f: 783.99, t: 'square' }, { n: 'A5', f: 880.0, t: 'triangle' }, { n: 'B5', f: 987.77, t: 'sawtooth' },
    { n: 'C6', f: 1046.5, t: 'square' }, { n: 'D6', f: 1174.66, t: 'triangle' }, { n: 'E6', f: 1318.51, t: 'sawtooth' }, { n: 'G6', f: 1567.98, t: 'square' },
  ];

  function buildMusicPad() {
    if (!musicPadGrid) return;
    musicPadGrid.innerHTML = '';
    padSounds.forEach((sound, index) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'music-pad-cell';
      btn.textContent = sound.n;
      btn.dataset.padIndex = String(index);
      musicPadGrid.appendChild(btn);
    });
  }

  buildMusicPad();

  musicPadGrid?.addEventListener('click', (event) => {
    const button = event.target.closest('.music-pad-cell');
    if (!button) return;
    const index = Number(button.dataset.padIndex);
    const sound = padSounds[index];
    if (!sound) return;
    playTone({ frequency: sound.f, duration: 0.2, type: sound.t, volume: 0.06 });
    playTone({ frequency: sound.f * 2, duration: 0.08, type: 'square', volume: 0.012, when: 0.03 });
    button.classList.add('active');
    setTimeout(() => button.classList.remove('active'), 120);
  });

  /* ---------- 5. Tetris ---------- */
  const TETRIS_COLS = 10;
  const TETRIS_ROWS = 16;
  const EMPTY = 0;
  const SHAPES = [
    [[1, 1, 1, 1]],
    [[1, 1], [1, 1]],
    [[0, 1, 0], [1, 1, 1]],
    [[1, 0, 0], [1, 1, 1]],
    [[0, 0, 1], [1, 1, 1]],
    [[1, 1, 0], [0, 1, 1]],
    [[0, 1, 1], [1, 1, 0]],
  ];

  const tetrisCells = [];
  let tetrisBoardData = [];
  let activePiece = null;
  let tetrisTimer = null;
  let tetrisScore = 0;

  function initTetrisBoardView() {
    if (!tetrisBoard) return;
    tetrisBoard.innerHTML = '';
    tetrisCells.length = 0;
    for (let i = 0; i < TETRIS_ROWS * TETRIS_COLS; i++) {
      const cell = document.createElement('div');
      cell.className = 'tetris-cell';
      tetrisBoard.appendChild(cell);
      tetrisCells.push(cell);
    }
  }

  function createEmptyBoard() {
    return Array.from({ length: TETRIS_ROWS }, () => Array(TETRIS_COLS).fill(EMPTY));
  }

  function cloneMatrix(matrix) {
    return matrix.map(row => [...row]);
  }

  function randomShape() {
    const base = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    return cloneMatrix(base);
  }

  function spawnPiece() {
    const shape = randomShape();
    const piece = {
      shape,
      x: Math.floor((TETRIS_COLS - shape[0].length) / 2),
      y: 0,
    };
    if (hasCollision(piece, 0, 0, shape)) {
      gameResult.textContent = `游戏结束，得分 ${tetrisScore}。已重新开始。`;
      resetTetris();
      return;
    }
    activePiece = piece;
  }

  function hasCollision(piece, moveX, moveY, nextShape = piece.shape) {
    for (let y = 0; y < nextShape.length; y++) {
      for (let x = 0; x < nextShape[y].length; x++) {
        if (!nextShape[y][x]) continue;
        const nx = piece.x + x + moveX;
        const ny = piece.y + y + moveY;
        if (nx < 0 || nx >= TETRIS_COLS || ny >= TETRIS_ROWS) return true;
        if (ny >= 0 && tetrisBoardData[ny][nx] !== EMPTY) return true;
      }
    }
    return false;
  }

  function mergePiece() {
    if (!activePiece) return;
    activePiece.shape.forEach((row, y) => {
      row.forEach((v, x) => {
        if (v) {
          const by = activePiece.y + y;
          const bx = activePiece.x + x;
          if (by >= 0 && by < TETRIS_ROWS && bx >= 0 && bx < TETRIS_COLS) {
            tetrisBoardData[by][bx] = 1;
          }
        }
      });
    });
  }

  function clearLines() {
    let cleared = 0;
    for (let y = TETRIS_ROWS - 1; y >= 0; y--) {
      if (tetrisBoardData[y].every(v => v !== EMPTY)) {
        tetrisBoardData.splice(y, 1);
        tetrisBoardData.unshift(Array(TETRIS_COLS).fill(EMPTY));
        cleared += 1;
        y += 1;
      }
    }
    if (cleared > 0) {
      tetrisScore += cleared * 100;
      gameResult.textContent = `当前分数：${tetrisScore}`;
    }
  }

  function rotate(shape) {
    const h = shape.length;
    const w = shape[0].length;
    const rotated = Array.from({ length: w }, () => Array(h).fill(0));
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        rotated[x][h - 1 - y] = shape[y][x];
      }
    }
    return rotated;
  }

  function tick() {
    if (!activePiece) return;
    if (!hasCollision(activePiece, 0, 1)) {
      activePiece.y += 1;
    } else {
      mergePiece();
      clearLines();
      spawnPiece();
    }
    drawTetris();
  }

  function drawTetris() {
    if (!tetrisCells.length) return;
    const display = tetrisBoardData.map(row => [...row]);

    if (activePiece) {
      activePiece.shape.forEach((row, y) => {
        row.forEach((v, x) => {
          if (v) {
            const by = activePiece.y + y;
            const bx = activePiece.x + x;
            if (by >= 0 && by < TETRIS_ROWS && bx >= 0 && bx < TETRIS_COLS) {
              display[by][bx] = 1;
            }
          }
        });
      });
    }

    for (let y = 0; y < TETRIS_ROWS; y++) {
      for (let x = 0; x < TETRIS_COLS; x++) {
        const idx = y * TETRIS_COLS + x;
        tetrisCells[idx].classList.toggle('filled', display[y][x] !== EMPTY);
      }
    }
  }

  function movePiece(deltaX) {
    if (!activePiece || hasCollision(activePiece, deltaX, 0)) return;
    activePiece.x += deltaX;
    drawTetris();
  }

  function rotatePiece() {
    if (!activePiece) return;
    const next = rotate(activePiece.shape);
    if (hasCollision(activePiece, 0, 0, next)) return;
    activePiece.shape = next;
    drawTetris();
  }

  function dropPiece() {
    if (!activePiece) return;
    while (!hasCollision(activePiece, 0, 1)) {
      activePiece.y += 1;
    }
    tick();
  }

  function startTetris() {
    if (tetrisTimer) return;
    tetrisTimer = window.setInterval(tick, 560);
  }

  function stopTetris() {
    if (tetrisTimer) {
      clearInterval(tetrisTimer);
      tetrisTimer = null;
    }
  }

  function resetTetris() {
    tetrisBoardData = createEmptyBoard();
    tetrisScore = 0;
    spawnPiece();
    drawTetris();
  }

  initTetrisBoardView();
  tetrisBoardData = createEmptyBoard();
  spawnPiece();
  drawTetris();

  tetrisLeftButton?.addEventListener('click', () => movePiece(-1));
  tetrisRightButton?.addEventListener('click', () => movePiece(1));
  tetrisRotateButton?.addEventListener('click', rotatePiece);
  tetrisDropButton?.addEventListener('click', dropPiece);

  document.addEventListener('keydown', (event) => {
    if (likeModal?.classList.contains('hidden') || gameArea?.classList.contains('hidden')) return;
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      movePiece(-1);
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      movePiece(1);
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      rotatePiece();
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      dropPiece();
    }
  });

  likesGrid?.addEventListener('click', (event) => {
    const target = event.target.closest('.like-tag');
    if (!target) return;
    const key = target.dataset.like;
    const data = key && likeContentMap[key];
    if (!data) return;

    likeModalTitle.textContent = data.title;
    likeModalBody.textContent = data.text;

    musicPadArea.classList.toggle('hidden', !data.pad);
    gameArea.classList.toggle('hidden', !data.game);

    if (data.game) {
      if (!gameResult.textContent) gameResult.textContent = '当前分数：0';
      startTetris();
      drawTetris();
    } else {
      stopTetris();
    }

    showPopup(likeModal);
  });

  likeModalClose?.addEventListener('click', () => {
    hidePopup(likeModal);
    stopTetris();
  });

  likeModal?.addEventListener('click', (event) => {
    if (event.target === likeModal) {
      hidePopup(likeModal);
      stopTetris();
    }
  });

  /* ---------- 6. Contact flow ---------- */
  const wrongInputWarnings = [
    '别乱输啦~ (╯°□°)╯',
    '说了是夏夏嘛！(ﾉ｀Д´)ﾉ',
    '你是不是故意的 (；¬_¬)',
    '再乱来我要生气了哦 (ó﹏ò｡)',
    '拜托啦好好输入嘛 (っ˘̩╭╮˘̩)っ',
    '你到底想干嘛！！ (╬▔皿▔)╬',
    '求你了好好输入好不好 (´;ω;`)',
    '真的不是夏夏很难输入吗 ┐(´～`)┌',
    '我真的会生气了哦 (ノಠ益ಠ)ノ',
    '好啦好啦答案就是夏夏啦 ╮(╯▽╰)╭',
    '你在考验我的耐心吗 (−_−) zzZ',
    '最后提示一次！是！夏！夏！ ╰(‵□′)╯',
  ];

  contactTrigger?.addEventListener('click', () => {
    if (contactVerified) {
      showContactInfoOnly();
      return;
    }
    contactInput.value = '';
    contactInputBlock.classList.remove('hidden');
    contactInfo.classList.add('hidden');
    if (punishUsed) {
      document.querySelector('#contactInputBlock p').innerHTML = '<strong>输入错误请重新输入</strong>';
    }
    showPopup(contactModal);
  });

  contactModalClose?.addEventListener('click', () => hidePopup(contactModal));
  contactModal?.addEventListener('click', (event) => {
    if (event.target === contactModal) hidePopup(contactModal);
  });

  contactConfirmButton?.addEventListener('click', async () => {
    const value = contactInput.value.trim();
    if (value === '夏夏') {
      contactVerified = true;
      localStorage.setItem(verifiedKey, '1');
      showContactInfoOnly();
      return;
    }

    wrongInputCount += 1;

    if (!punishUsed) {
      hidePopup(contactModal);
      await startPunishSequence();
      return;
    }

    /* After first punishment: show warning messages with kaomoji.
       wrongInputCount starts at 1 for the first error (which triggers punishment).
       Subtract 2: -1 because punishment was the 1st error, -1 for 0-based index. */
    const warningIdx = Math.min(wrongInputCount - 2, wrongInputWarnings.length - 1);
    const msg = wrongInputWarnings[Math.max(0, warningIdx)];
    contactInput.value = '';
    document.querySelector('#contactInputBlock p').innerHTML = '<strong>输入错误请重新输入</strong>';
    alert(msg);
    contactInput.focus();
  });

  punishConfirm?.addEventListener('click', () => {
    stopSharpTone();
    punishOverlay.classList.add('hidden');
    punishOverlay.classList.remove('active', 'locked');
    punishConfirm.classList.add('hidden');
    punishMessage.classList.remove('flash', 'show', 'recovery', 'fade-in-msg', 'fade-out-msg');
    punishMessage.textContent = '';
    punishOverlay.style.transition = '';
    punishOverlay.style.background = '';
    document.body.classList.remove('no-scroll');
    if (resumeAfterPunish) {
      resumeAfterPunish = false;
      resumeMusicThenFadeOut();
    }
  });

  function showContactInfoOnly() {
    contactInputBlock.classList.add('hidden');
    contactInfo.classList.remove('hidden');
    showPopup(contactModal);
  }

  async function startPunishSequence() {
    punishUsed = true;

    /* Pause music */
    stopBgMusic();

    document.body.classList.add('no-scroll');
    punishOverlay.classList.remove('hidden');
    punishOverlay.classList.add('active', 'locked');
    punishConfirm.classList.add('hidden');
    punishMessage.textContent = '';
    punishMessage.classList.remove('show', 'flash', 'recovery', 'fade-in-msg', 'fade-out-msg');
    startSharpTone();

    /* Phase 1: Page goes black slowly (~2s) */
    punishOverlay.style.transition = 'background 2s linear';
    punishOverlay.style.background = 'rgba(0,0,0,0.15)';
    await wait(50);
    punishOverlay.style.background = '#000';
    await wait(2200);

    /* Phase 2: Show red "你" then start fast flashing */
    punishMessage.textContent = '你';
    punishMessage.classList.add('show');
    await wait(1000);

    /* Start flashing and adding "！" */
    punishMessage.classList.add('flash');

    /* Calculate how many "！" can fit to edge of screen */
    const testSpan = document.createElement('span');
    testSpan.style.position = 'absolute';
    testSpan.style.visibility = 'hidden';
    testSpan.style.whiteSpace = 'nowrap';
    testSpan.style.fontWeight = '700';
    testSpan.style.fontSize = getComputedStyle(punishMessage).fontSize;
    document.body.appendChild(testSpan);
    const screenW = window.innerWidth * 0.96;
    let maxBangs = 0;
    let testStr = '你';
    for (let i = 0; i < 200; i++) {
      testStr += '！';
      testSpan.textContent = testStr;
      if (testSpan.offsetWidth >= screenW) {
        maxBangs = i + 1;
        break;
      }
    }
    if (maxBangs === 0) maxBangs = 30;
    testSpan.remove();

    for (let i = 0; i < maxBangs; i++) {
      await wait(110);
      punishMessage.textContent += '！';
    }

    /* Stop flashing, pause 1s */
    punishMessage.classList.remove('flash');
    await wait(1000);

    /* Text disappears */
    punishMessage.classList.remove('show');
    await wait(500);
    punishMessage.textContent = '';

    stopSharpTone();

    /* Phase 3: 30 second black screen - completely non-interactive (required by design) */
    await wait(30000);

    /* Phase 4: Slowly transition from black to theme color */
    punishOverlay.style.transition = 'background 3s ease';
    punishOverlay.style.background = 'var(--bg)';
    await wait(3500);

    /* Phase 5: Show "哎嘿开个玩笑" then fade out */
    punishMessage.textContent = '哎嘿开个玩笑';
    punishMessage.classList.add('recovery', 'fade-in-msg');
    await wait(2500);

    punishMessage.classList.remove('fade-in-msg');
    punishMessage.classList.add('fade-out-msg');
    await wait(1300);

    /* Phase 6: Fade in "是夏夏哦" with confirm button */
    punishMessage.classList.remove('fade-out-msg');
    punishMessage.textContent = '是夏夏哦';
    punishMessage.classList.add('fade-in-msg');
    await wait(1500);

    punishConfirm.classList.remove('hidden');
    punishOverlay.classList.remove('locked');
    resumeAfterPunish = true;
  }

  function startSharpTone() {
    if (sharpOsc) return;
    const ctx = ensureAudioContext();
    if (!ctx) return;
    punishOverlay.classList.add('strobing');

    sharpOsc = ctx.createOscillator();
    sharpGain = ctx.createGain();
    sharpLfo = ctx.createOscillator();
    sharpLfoGain = ctx.createGain();

    sharpOsc.type = 'sawtooth';
    sharpOsc.frequency.setValueAtTime(1710, ctx.currentTime);

    sharpGain.gain.setValueAtTime(0.0001, ctx.currentTime);
    sharpGain.gain.linearRampToValueAtTime(0.065, ctx.currentTime + 0.08);

    sharpLfo.type = 'square';
    sharpLfo.frequency.setValueAtTime(12, ctx.currentTime);
    sharpLfoGain.gain.setValueAtTime(0.022, ctx.currentTime);

    sharpLfo.connect(sharpLfoGain);
    sharpLfoGain.connect(sharpGain.gain);
    sharpOsc.connect(sharpGain);
    sharpGain.connect(ctx.destination);

    sharpOsc.start();
    sharpLfo.start();
  }

  function stopSharpTone() {
    punishOverlay.classList.remove('strobing');
    if (sharpOsc) {
      sharpOsc.stop();
      sharpOsc.disconnect();
      sharpOsc = null;
    }
    if (sharpLfo) {
      sharpLfo.stop();
      sharpLfo.disconnect();
      sharpLfo = null;
    }
    if (sharpGain) {
      sharpGain.disconnect();
      sharpGain = null;
    }
    if (sharpLfoGain) {
      sharpLfoGain.disconnect();
      sharpLfoGain = null;
    }
  }

  function showPopup(node) {
    node.classList.remove('hidden');
    node.setAttribute('aria-hidden', 'false');
  }

  function hidePopup(node) {
    node.classList.add('hidden');
    node.setAttribute('aria-hidden', 'true');
  }

  function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /* ---------- 7. Scroll Fade-in Animation ---------- */
  function observeFadeIns() {
    const fadeEls = document.querySelectorAll('.fade-in');
    if (!('IntersectionObserver' in window)) {
      fadeEls.forEach(el => el.classList.add('visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    fadeEls.forEach(el => observer.observe(el));
  }

  /* ---------- 8. Hero Floating Particles ---------- */
  function createParticles() {
    const container = document.getElementById('heroParticles');
    if (!container) return;

    for (let i = 0; i < 15; i++) {
      const p = document.createElement('div');
      p.className = 'hero-particle';
      const size = Math.random() * 12 + 6;
      p.style.width = `${size}px`;
      p.style.height = `${size}px`;
      p.style.left = `${Math.random() * 100}%`;
      p.style.top = `${Math.random() * 100}%`;
      p.style.animationDuration = `${Math.random() * 6 + 4}s`;
      p.style.animationDelay = `${Math.random() * 4}s`;
      container.appendChild(p);
    }
  }

  createParticles();
});
