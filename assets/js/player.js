/**
 * Lofi Music Player – Vertical Bar Style
 * Position: bottom-right corner
 * Features: play/pause, prev/next, volume, autoplay with fallback prompt
 * Visualizer: Web Audio API frequency bars
 *
 * Playlist uses placeholder files in /assets/music/.
 * Replace with your own CC0/royalty-free lofi tracks.
 */

(function () {
  'use strict';

  /* ── Playlist ── */
  const playlist = [
    { title: 'Dreamy Afternoon', src: '/assets/music/track1.mp3' },
    { title: 'Rainy Window', src: '/assets/music/track2.mp3' },
    { title: 'Starlit Study', src: '/assets/music/track3.mp3' }
  ];

  let currentIndex = 0;
  let isPlaying = false;
  let audioReady = false;

  /* ── Audio ── */
  const audio = new Audio();
  audio.crossOrigin = 'anonymous';
  audio.preload = 'auto';
  audio.loop = false;

  /* ── Web Audio API for visualizer ── */
  let audioCtx, analyser, source, dataArray;

  function initAudioContext() {
    if (audioCtx) return;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 64;
    source = audioCtx.createMediaElementSource(audio);
    source.connect(analyser);
    analyser.connect(audioCtx.destination);
    dataArray = new Uint8Array(analyser.frequencyBinCount);
  }

  /* ── DOM refs ── */
  const playerEl = document.getElementById('musicPlayer');
  const promptEl = document.getElementById('musicPrompt');
  const btnPlay = document.getElementById('mpPlay');
  const btnPrev = document.getElementById('mpPrev');
  const btnNext = document.getElementById('mpNext');
  const volumeSlider = document.getElementById('mpVolume');
  const titleEl = document.getElementById('mpTitle');
  const barsContainer = document.getElementById('mpBars');

  if (!playerEl) return;

  /* ── Load track ── */
  function loadTrack(index) {
    currentIndex = ((index % playlist.length) + playlist.length) % playlist.length;
    const track = playlist[currentIndex];
    audio.src = track.src;
    if (titleEl) titleEl.textContent = track.title;
    audio.load();
  }

  /* ── Play / Pause ── */
  function play() {
    initAudioContext();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    audio.play().then(function () {
      isPlaying = true;
      audioReady = true;
      if (btnPlay) btnPlay.textContent = '⏸';
      if (promptEl) promptEl.style.display = 'none';
      playerEl.classList.add('active');
    }).catch(function () {
      // Autoplay blocked – show prompt
      if (promptEl) promptEl.style.display = 'flex';
    });
  }

  function pause() {
    audio.pause();
    isPlaying = false;
    if (btnPlay) btnPlay.textContent = '▶';
  }

  function togglePlay() {
    if (isPlaying) pause();
    else play();
  }

  function prevTrack() {
    loadTrack(currentIndex - 1);
    if (isPlaying || audioReady) play();
  }

  function nextTrack() {
    loadTrack(currentIndex + 1);
    if (isPlaying || audioReady) play();
  }

  /* ── Volume ── */
  function setVolume(v) {
    audio.volume = Math.max(0, Math.min(1, v));
  }

  /* ── Visualizer bars ── */
  const NUM_BARS = 8;
  const bars = [];

  function createBars() {
    if (!barsContainer) return;
    barsContainer.innerHTML = '';
    for (let i = 0; i < NUM_BARS; i++) {
      const bar = document.createElement('div');
      bar.className = 'mp-bar';
      barsContainer.appendChild(bar);
      bars.push(bar);
    }
  }

  function updateBars() {
    if (!analyser || !dataArray) {
      // Idle animation when not playing
      for (let i = 0; i < bars.length; i++) {
        const h = 4 + Math.sin(Date.now() / 500 + i) * 3;
        bars[i].style.height = h + 'px';
      }
      return;
    }
    analyser.getByteFrequencyData(dataArray);
    const step = Math.floor(dataArray.length / NUM_BARS);
    for (let i = 0; i < NUM_BARS; i++) {
      const val = dataArray[i * step] || 0;
      const h = 4 + (val / 255) * 40;
      bars[i].style.height = h + 'px';
    }
  }

  function visualizerLoop() {
    updateBars();
    requestAnimationFrame(visualizerLoop);
  }

  /* ── Events ── */
  if (btnPlay) btnPlay.addEventListener('click', togglePlay);
  if (btnPrev) btnPrev.addEventListener('click', prevTrack);
  if (btnNext) btnNext.addEventListener('click', nextTrack);

  if (volumeSlider) {
    volumeSlider.addEventListener('input', function () {
      setVolume(this.value / 100);
    });
  }

  // Auto-next
  audio.addEventListener('ended', function () {
    nextTrack();
  });

  // Prompt click
  if (promptEl) {
    promptEl.addEventListener('click', function () {
      promptEl.style.display = 'none';
      play();
    });
  }

  /* ── Keyboard shortcuts ── */
  document.addEventListener('keydown', function (e) {
    // Only if not typing in an input
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if (e.key === 'm' || e.key === 'M') togglePlay();
    if (e.key === 'n' || e.key === 'N') nextTrack();
    if (e.key === 'b' || e.key === 'B') prevTrack();
  });

  /* ── Init ── */
  createBars();
  loadTrack(0);
  setVolume(0.5);
  if (volumeSlider) volumeSlider.value = 50;
  visualizerLoop();

  // Attempt autoplay (muted first, then unmute on interaction)
  audio.muted = true;
  audio.play().then(function () {
    // Muted autoplay succeeded, show prompt to unmute
    isPlaying = true;
    if (btnPlay) btnPlay.textContent = '⏸';
    if (promptEl) {
      promptEl.style.display = 'flex';
      var promptText = promptEl.querySelector('.prompt-text');
      if (promptText) promptText.textContent = '🔇 点击开启声音';
    }
    playerEl.classList.add('active');

    // On any user interaction, unmute
    function unmute() {
      audio.muted = false;
      initAudioContext();
      if (audioCtx.state === 'suspended') audioCtx.resume();
      if (promptEl) promptEl.style.display = 'none';
      audioReady = true;
      document.removeEventListener('click', unmute);
      document.removeEventListener('touchstart', unmute);
      document.removeEventListener('keydown', unmute);
    }
    document.addEventListener('click', unmute, { once: true });
    document.addEventListener('touchstart', unmute, { once: true });
    document.addEventListener('keydown', unmute, { once: true });
  }).catch(function () {
    // Autoplay fully blocked
    audio.muted = false;
    if (promptEl) promptEl.style.display = 'flex';
  });
})();
