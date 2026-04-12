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

  let audioCtx = null;
  let bgStep = 0;
  let bgTimer = null;
  let sharpTimer = null;

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

  /* ---------- 1. Entry Overlay ---------- */
  overlay.addEventListener('click', () => {
    const isDesktop = window.matchMedia('(min-width: 901px)').matches;
    overlay.classList.add(isDesktop ? 'revealing-desktop' : 'revealing');

    startBgMusic();

    setTimeout(() => {
      overlay.remove();
      pageContent.classList.add('revealed');
      document.body.style.background = 'var(--bg)';
      document.body.classList.remove('no-scroll');
      musicPlayer.classList.remove('hidden');
      catPet.classList.remove('hidden');
      observeFadeIns();
    }, isDesktop ? 1080 : 1280);
  });

  /* ---------- 2. Music Player Controls (8-bit) ---------- */
  function setMusicState(isPlaying) {
    musicPlaying = isPlaying;
    musicIcon.textContent = isPlaying ? '⏸' : '▶';
    musicEq.classList.toggle('playing', isPlaying);
  }

  function startBgMusic() {
    if (bgTimer) return;
    ensureAudioContext();

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
      const i = bgStep % lead.length;
      playTone({ frequency: lead[i], duration: 0.12, volume: 0.03, type: 'square' });
      playTone({ frequency: bass[i], duration: 0.18, volume: 0.02, type: 'triangle' });
      if (i % 4 === 0) {
        playTone({ frequency: lead[i] * 2, duration: 0.05, volume: 0.012, type: 'square', when: 0.04 });
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

  musicToggle.addEventListener('click', () => {
    if (musicPlaying) {
      stopBgMusic();
    } else {
      startBgMusic();
    }
  });

  /* ---------- 3. Cat Pet ---------- */
  const catNormal = ' /ᐠ｡ꞈ｡ᐟ\\\n(  づ♡ど )\n しーＪ';
  const catHappy = ' /ᐠ˵• ⩊ •˵ᐟ\\\n(  づ♡ど )\n しーＪ';
  const catBlush = ' /ᐠ˶//ω//˶ᐟ\\\n(  づ♡ど )\n しーＪ';
  const catAngy = ' /ᐠ`ω´ᐟ\\\n(  づ♡ど )\n しーＪ';
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
    for (let i = 0; i < BARRAGE_BULLET_COUNT; i++) {
      const bullet = document.createElement('div');
      bullet.className = 'cat-bullet';
      bullet.textContent = catBarrageFaces[Math.floor(Math.random() * catBarrageFaces.length)];
      bullet.style.top = `${Math.random() * 82 + 6}%`;
      bullet.style.fontSize = `${Math.random() * 12 + 13}px`;
      bullet.style.animationDelay = `${Math.random() * 1.1}s`;
      bullet.style.animationDuration = `${Math.random() * 2.2 + 3.8}s`;
      catBarrage.appendChild(bullet);
      setTimeout(() => bullet.remove(), 7000);
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
  contactTrigger?.addEventListener('click', () => {
    if (contactVerified) {
      showContactInfoOnly();
      return;
    }
    contactInput.value = '';
    contactInputBlock.classList.remove('hidden');
    contactInfo.classList.add('hidden');
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
    hidePopup(contactModal);
    await startPunishSequence();
  });

  punishConfirm?.addEventListener('click', () => {
    stopSharpTone();
    punishOverlay.classList.add('hidden');
    punishConfirm.classList.add('hidden');
    punishMessage.classList.remove('flash', 'show', 'recovery');
    punishMessage.textContent = '';
    document.body.classList.remove('no-scroll');
  });

  function showContactInfoOnly() {
    contactInputBlock.classList.add('hidden');
    contactInfo.classList.remove('hidden');
    showPopup(contactModal);
  }

  async function startPunishSequence() {
    stopBgMusic();
    document.body.classList.add('no-scroll');
    punishOverlay.classList.remove('hidden');
    punishOverlay.classList.add('active');
    punishConfirm.classList.add('hidden');
    punishMessage.textContent = '';
    punishMessage.classList.remove('show', 'flash', 'recovery');

    startSharpTone();

    await wait(320);
    punishMessage.textContent = '你';
    punishMessage.classList.add('show', 'flash');

    for (let i = 0; i < 15; i++) {
      await wait(110);
      punishMessage.textContent += '！';
    }

    punishMessage.classList.remove('flash');
    await wait(3000);

    punishMessage.classList.remove('show');
    await wait(240);
    punishMessage.textContent = '';

    stopSharpTone();
    punishOverlay.classList.add('hidden');
    document.body.classList.remove('no-scroll');
  }

  function startSharpTone() {
    if (sharpTimer) return;
    ensureAudioContext();
    sharpTimer = window.setInterval(() => {
      const base = 1320 + Math.random() * 420;
      playTone({ frequency: base, duration: 0.05, volume: 0.07, type: 'sawtooth' });
      playTone({ frequency: base * 0.5, duration: 0.03, volume: 0.04, type: 'square', when: 0.015 });
    }, 85);
  }

  function stopSharpTone() {
    if (sharpTimer) {
      clearInterval(sharpTimer);
      sharpTimer = null;
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
