/* ===== 夏夏的小世界 — Main Script ===== */

document.addEventListener('DOMContentLoaded', () => {
  const overlay = document.getElementById('entryOverlay');
  const pageContent = document.getElementById('pageContent');
  const bgMusic = document.getElementById('bgMusic');
  const musicPlayer = document.getElementById('musicPlayer');
  const musicToggle = document.getElementById('musicToggle');
  const musicIcon = document.getElementById('musicIcon');
  const musicEq = document.getElementById('musicEq');
  const catPet = document.getElementById('catPet');
  const catArt = document.getElementById('catArt');
  const catBubble = document.getElementById('catBubble');

  let musicPlaying = false;

  /* ---------- 1. Entry Overlay → Circle Reveal ---------- */
  overlay.addEventListener('click', () => {
    overlay.classList.add('fade-out');

    /* Start circle reveal */
    pageContent.classList.add('revealing');

    /* Try to play music */
    bgMusic.play().then(() => {
      musicPlaying = true;
      musicIcon.textContent = '⏸';
      musicEq.classList.add('playing');
    }).catch(() => {
      /* Autoplay blocked — user can click play later */
      musicPlaying = false;
    });

    /* After overlay fade */
    setTimeout(() => {
      overlay.remove();
    }, 600);

    /* After circle reveal completes */
    setTimeout(() => {
      pageContent.classList.remove('revealing');
      pageContent.classList.add('revealed');
      document.body.style.background = '#F0F8FF';
      document.body.classList.remove('no-scroll');

      /* Show music player & cat */
      musicPlayer.classList.remove('hidden');
      catPet.classList.remove('hidden');

      /* Trigger fade-in for elements already in viewport */
      observeFadeIns();
    }, 1500);
  });

  /* ---------- 2. Music Player Controls ---------- */
  musicToggle.addEventListener('click', () => {
    if (musicPlaying) {
      bgMusic.pause();
      musicPlaying = false;
      musicIcon.textContent = '▶';
      musicEq.classList.remove('playing');
    } else {
      bgMusic.play().then(() => {
        musicPlaying = true;
        musicIcon.textContent = '⏸';
        musicEq.classList.add('playing');
      }).catch(() => {});
    }
  });

  /* Sync state when music ends */
  bgMusic.addEventListener('ended', () => {
    musicPlaying = false;
    musicIcon.textContent = '▶';
    musicEq.classList.remove('playing');
  });

  /* ---------- 3. Cat Pet ---------- */
  /* Cat expressions: Normal = (• · •), Happy = (≧ω≦), Sleepy = (– ω –) */
  const catNormal = '  ∧,,,∧\n( ̳• · • ̳)\n /    づ♡';
  const catHappy = '  ∧,,,∧\n( ̳≧ω≦ ̳)\n /    づ✨';
  const catSleepy = '  ∧,,,∧\n( ̳– ω – ̳)\n /    づ💤';

  const catMessages = [
    '喵~',
    '别戳我啦~',
    '今天也要开心哦',
    '想吃小鱼干...',
    '摸摸~',
    '(=^-ω-^=)',
    '你好呀~',
    '嗯...困了',
  ];

  let bubbleTimer = null;

  catPet.addEventListener('mouseenter', () => {
    catArt.textContent = catHappy;
  });

  catPet.addEventListener('mouseleave', () => {
    catArt.textContent = catNormal;
  });

  catPet.addEventListener('click', () => {
    /* Show random message */
    const msg = catMessages[Math.floor(Math.random() * catMessages.length)];
    catBubble.textContent = msg;
    catBubble.classList.add('show');

    /* Briefly show sleepy face */
    catArt.textContent = catSleepy;
    setTimeout(() => {
      catArt.textContent = catHappy;
    }, 800);

    /* Hide bubble after delay */
    clearTimeout(bubbleTimer);
    bubbleTimer = setTimeout(() => {
      catBubble.classList.remove('show');
    }, 2500);
  });

  /* ---------- 4. Scroll Fade-in Animation ---------- */
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

  /* ---------- 5. Hero Floating Particles ---------- */
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
