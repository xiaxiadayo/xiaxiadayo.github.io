/* ===== 夏夏的小世界 — Main Script ===== */

document.addEventListener('DOMContentLoaded', () => {
  const overlay = document.getElementById('entryOverlay');
  const bgMusic = document.getElementById('bgMusic');
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
  const gameArea = document.getElementById('gameArea');
  const gameGuessInput = document.getElementById('gameGuessInput');
  const gameGuessButton = document.getElementById('gameGuessButton');
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
  const prankDoneKey = 'xiaxia_contact_prank_done';
  let contactVerified = localStorage.getItem(verifiedKey) === '1';
  let prankDone = localStorage.getItem(prankDoneKey) === '1';
  let sharpOsc = null;
  let sharpGain = null;
  let audioCtx = null;

  /* ---------- 1. Entry Overlay ---------- */
  overlay.addEventListener('click', () => {
    overlay.classList.add('revealing');

    bgMusic.currentTime = 0;
    bgMusic.play().then(() => {
      setMusicState(true);
    }).catch(() => {
      setMusicState(false);
    });

    setTimeout(() => {
      overlay.remove();
      document.body.classList.remove('no-scroll');
      musicPlayer.classList.remove('hidden');
      catPet.classList.remove('hidden');
      observeFadeIns();
    }, 1280);
  });

  /* ---------- 2. Music Player Controls ---------- */
  function setMusicState(isPlaying) {
    musicPlaying = isPlaying;
    musicIcon.textContent = isPlaying ? '⏸' : '▶';
    musicEq.classList.toggle('playing', isPlaying);
  }

  musicToggle.addEventListener('click', () => {
    if (!bgMusic.paused && musicPlaying) {
      bgMusic.pause();
      setMusicState(false);
    } else {
      bgMusic.play().then(() => {
        setMusicState(true);
      }).catch(() => {});
    }
  });

  bgMusic.addEventListener('ended', () => {
    setMusicState(false);
  });

  bgMusic.addEventListener('pause', () => {
    if (!bgMusic.ended) setMusicState(false);
  });

  bgMusic.addEventListener('play', () => {
    setMusicState(true);
  });

  /* ---------- 3. Cat Pet ---------- */
  const catNormal = '    ／l、\n（°､ 。 ７\n　l、 ~ヽ\n　じしf_, )ノ';
  const catHappy = '    ／l、\n（^､ ^ ７\n　l、 ~ヽ\n　じしf_, )ノ';
  const catBlush = '    ／l、\n（*､ * ７\n　l、 ~ヽ\n　じしf_, )ノ';
  const catAngy = '    ／l、\n（>､ < ７\n　l、 ~ヽ\n　じしf_, )ノ';

  const catMessages = [
    '喵~',
    '别戳我啦~',
    '今天也要开心哦',
    '摸摸好舒服~',
    '猫猫来啦',
    '你今天也很可爱',
    '再摸一下嘛',
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
    for (let i = 0; i < 18; i++) {
      const bullet = document.createElement('div');
      bullet.className = 'cat-bullet';
      bullet.textContent = i % 3 === 0 ? '(=^･ω･^=)' : i % 3 === 1 ? 'ฅ(•ㅅ•❀)ฅ' : '／l、（°､ 。 ７';
      bullet.style.top = `${Math.random() * 80 + 8}%`;
      bullet.style.fontSize = `${Math.random() * 14 + 14}px`;
      bullet.style.animationDelay = `${Math.random() * 1.3}s`;
      bullet.style.animationDuration = `${Math.random() * 2.5 + 3.8}s`;
      catBarrage.appendChild(bullet);
      setTimeout(() => bullet.remove(), 7000);
    }
  }

  /* ---------- 4. Likes interactions ---------- */
  const likeContentMap = {
    music: { title: '♪ 音乐', text: '我喜欢在傍晚放慢节奏听歌，像在云里慢慢散步。' },
    daydream: { title: '☁ 发呆', text: '偶尔发呆是一种充电方式，什么都不做也很好。' },
    cat: { title: '🐱 猫猫', text: '猫猫是世界级治愈源，看到就会不自觉笑出来。' },
    rain: { title: '🌧 雨天', text: '雨声像天然白噪音，和心情一起慢慢沉下来。' },
    sunset: { title: '🌅 日落', text: '每次日落颜色都不一样，像今天专属的结尾。' },
    game: { title: '🎮 玩游戏', text: '来玩一个小小的猜数字游戏吧！', game: true },
    travel: { title: '🧳 旅行', text: '喜欢走走停停，收集陌生城市里温柔的小细节。' },
    movie: { title: '🎬 电影', text: '好电影像一段借来的生命，两个小时很值得。' },
    photography: { title: '📷 拍照', text: '拍照是为了留住当时那一秒“啊真好”的感觉。' },
    coding: { title: '💻 写代码', text: '把想法变成可运行的页面，超有成就感。' },
    nightwalk: { title: '🌃 夜游', text: '夜风很轻的时候，街道会变得像一条慢镜头。' },
    dessert: { title: '🍰 甜点', text: '甜甜的食物会把坏情绪先按下暂停键。' },
    stargaze: { title: '✨ 看星星', text: '抬头看星星，会觉得很多事都没那么可怕。' },
  };

  likesGrid?.addEventListener('click', (event) => {
    const target = event.target.closest('.like-tag');
    if (!target) return;
    const key = target.dataset.like;
    const data = key && likeContentMap[key];
    if (!data) return;
    likeModalTitle.textContent = data.title;
    likeModalBody.textContent = data.text;
    gameArea.classList.toggle('hidden', !data.game);
    if (!data.game) gameResult.textContent = '';
    showPopup(likeModal);
  });

  gameGuessButton?.addEventListener('click', () => {
    const value = Number(gameGuessInput.value);
    if (!Number.isInteger(value) || value < 1 || value > 9) {
      gameResult.textContent = '请输入 1-9 的数字。';
      return;
    }
    const answer = Math.floor(Math.random() * 9) + 1;
    gameResult.textContent = value === answer ? `猜中啦！答案就是 ${answer}。` : `这次是 ${answer}，再来一局！`;
    gameGuessInput.value = '';
  });

  likeModalClose?.addEventListener('click', () => hidePopup(likeModal));
  likeModal?.addEventListener('click', (event) => {
    if (event.target === likeModal) hidePopup(likeModal);
  });

  /* ---------- 5. Contact flow ---------- */
  contactTrigger?.addEventListener('click', () => {
    if (contactVerified || prankDone) {
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
    punishMessage.classList.remove('flash', 'show');
    punishMessage.textContent = '';
    punishOverlay.style.transition = '';
    punishOverlay.style.background = '';
    document.body.classList.remove('no-scroll');
    prankDone = true;
    localStorage.setItem(prankDoneKey, '1');
  });

  function showContactInfoOnly() {
    contactInputBlock.classList.add('hidden');
    contactInfo.classList.remove('hidden');
    showPopup(contactModal);
  }

  async function startPunishSequence() {
    document.body.classList.add('no-scroll');
    punishOverlay.classList.remove('hidden');
    punishOverlay.classList.add('active', 'blackening');
    punishConfirm.classList.add('hidden');
    punishMessage.textContent = '';
    punishMessage.classList.remove('show', 'flash');
    startSharpTone();

    await wait(2000);
    punishOverlay.classList.remove('blackening');
    punishMessage.textContent = '你';
    punishMessage.classList.add('show');

    await wait(1000);
    punishMessage.classList.add('flash');
    for (let i = 0; i < 15; i++) {
      await wait(110);
      punishMessage.textContent += '！';
    }
    punishMessage.classList.remove('flash');
    await wait(1000);
    punishMessage.textContent = '';
    await wait(30000);

    punishOverlay.style.transition = 'background 2.2s ease';
    punishOverlay.style.background = '#d4f1f9';
    await wait(2400);

    punishMessage.style.color = '#2f5370';
    punishMessage.textContent = '哎嘿 开个玩笑';
    punishMessage.classList.add('show');
    await wait(1400);
    punishMessage.classList.remove('show');
    await wait(600);
    punishMessage.textContent = '夏夏哦。';
    punishMessage.classList.add('show');
    await wait(1200);

    punishConfirm.classList.remove('hidden');
  }

  function startSharpTone() {
    if (sharpOsc) return;
    if (!audioCtx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      audioCtx = new AudioCtx();
    }
    sharpOsc = audioCtx.createOscillator();
    sharpGain = audioCtx.createGain();
    sharpOsc.frequency.value = 1480;
    sharpOsc.type = 'sawtooth';
    sharpGain.gain.value = 0.035;
    sharpOsc.connect(sharpGain);
    sharpGain.connect(audioCtx.destination);
    sharpOsc.start();
  }

  function stopSharpTone() {
    if (sharpOsc) {
      sharpOsc.stop();
      sharpOsc.disconnect();
      sharpOsc = null;
    }
    if (sharpGain) {
      sharpGain.disconnect();
      sharpGain = null;
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

  /* ---------- 6. Scroll Fade-in Animation ---------- */
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

  /* ---------- 7. Hero Floating Particles ---------- */
  function createParticles() {
    const container = document.getElementById('heroParticles');
    if (!container) return;

    for (let i = 0; i < 15; i++) {
      const p = document.createElement('div');
      p.className = 'hero-particle';
      const size = Math.random() * 12 + 6;
      p.style.width = size + 'px';
      p.style.height = size + 'px';
      p.style.left = Math.random() * 100 + '%';
      p.style.top = Math.random() * 100 + '%';
      p.style.animationDuration = (Math.random() * 6 + 4) + 's';
      p.style.animationDelay = (Math.random() * 4) + 's';
      container.appendChild(p);
    }
  }

  createParticles();
});
