/* Nav scroll */
const nav = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

/* Burger */
function toggleMenu() {
  document.getElementById('navLinks').classList.toggle('open');
}
document.querySelectorAll('#navLinks a').forEach(a =>
  a.addEventListener('click', () => document.getElementById('navLinks').classList.remove('open'))
);

/* Before / After slider */
const baWrap  = document.getElementById('baWrap');
const baAfter = document.getElementById('baAfter');
const baLine  = document.getElementById('baLine');
if (baWrap) {
  const lblBefore = baWrap.querySelector('.ba-label-before');
  const lblAfter  = baWrap.querySelector('.ba-label-after');
  function updateBA(clientX) {
    const rect = baWrap.getBoundingClientRect();
    const x    = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const pct  = (x / rect.width) * 100;
    baAfter.style.clipPath  = `inset(0 ${100 - pct}% 0 0)`;
    baLine.style.left       = pct + '%';
    lblBefore.style.opacity = pct < 85 ? '1' : '0';
    lblAfter.style.opacity  = pct > 15 ? '1' : '0';
  }
  baWrap.addEventListener('mousemove', e => updateBA(e.clientX));
  baWrap.addEventListener('touchmove', e => {
    e.preventDefault();
    updateBA(e.touches[0].clientX);
  }, { passive: false });
  /* Position initiale : 50% — les deux labels visibles */
  baAfter.style.clipPath  = 'inset(0 50% 0 0)';
  baLine.style.left       = '50%';
  lblBefore.style.opacity = '1';
  lblAfter.style.opacity  = '1';
}

/* Mosaïque hero : une seule photo (ou vidéo) plein cadre, découpée en tuiles,
   qui bascule vers le média suivant via une vague de tuiles décalées */
const heroMosaic = document.getElementById('heroMosaic');
if (heroMosaic) {
  const slides = [
    { type: 'image', src: 'asset/landscape/antennes.png' },
    { type: 'image', src: 'asset/landscape/montagne.png' },
    { type: 'video' },
    { type: 'image', src: 'asset/landscape/flanc_montagne.png' },
    { type: 'image', src: 'asset/landscape/cern.png' }
  ];
  const TILE_SIZE = 110;
  let tiles = [];
  let cols = 0, rows = 0;
  let index = 0;
  let videoRect = null;
  let videoLoopId = null;

  const video = document.createElement('video');
  video.className = 'mosaic-video-source';
  video.src = 'asset/video/camera.mp4';
  video.muted = true;
  video.loop = true;
  video.autoplay = true;
  video.playsInline = true;
  video.preload = 'auto';
  heroMosaic.before(video);
  video.play().catch(() => {});

  const VIDEO_ZOOM_OUT = 0.9; /* <1 = montre un peu plus de champ (dézoom) */
  function computeVideoRect() {
    if (!video.videoWidth) return;
    const cw = heroMosaic.clientWidth, ch = heroMosaic.clientHeight;
    const scale = Math.max(cw / video.videoWidth, ch / video.videoHeight) * VIDEO_ZOOM_OUT;
    const sw = Math.min(cw / scale, video.videoWidth);
    const sh = Math.min(ch / scale, video.videoHeight);
    videoRect = {
      sx: Math.max(0, (video.videoWidth  - sw) / 2),
      sy: Math.max(0, (video.videoHeight - sh) / 2),
      sw, sh
    };
  }
  video.addEventListener('loadedmetadata', computeVideoRect);

  function drawVideoFrame() {
    if (videoRect && video.readyState >= 2) {
      const sw = videoRect.sw / cols, sh = videoRect.sh / rows;
      tiles.forEach(t => {
        t.ctx.drawImage(
          video,
          videoRect.sx + t.col * sw, videoRect.sy + t.row * sh, sw, sh,
          0, 0, t.canvas.width, t.canvas.height
        );
      });
    }
    videoLoopId = requestAnimationFrame(drawVideoFrame);
  }
  function startVideoLoop() { if (videoLoopId === null) drawVideoFrame(); }
  function stopVideoLoop() {
    if (videoLoopId !== null) { cancelAnimationFrame(videoLoopId); videoLoopId = null; }
  }

  function styleLayer(layer, col, row) {
    layer.style.backgroundSize     = `${cols * 100}% ${rows * 100}%`;
    layer.style.backgroundPosition =
      `${cols > 1 ? (col / (cols - 1)) * 100 : 0}% ${rows > 1 ? (row / (rows - 1)) * 100 : 0}%`;
  }

  function buildMosaic() {
    cols = Math.max(5, Math.round(heroMosaic.clientWidth / TILE_SIZE));
    rows = Math.max(4, Math.round(heroMosaic.clientHeight / TILE_SIZE));
    heroMosaic.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    heroMosaic.style.gridTemplateRows    = `repeat(${rows}, 1fr)`;
    heroMosaic.innerHTML = '';
    tiles = [];

    const startSlide = slides[index];
    const tileW = Math.ceil(heroMosaic.clientWidth / cols);
    const tileH = Math.ceil(heroMosaic.clientHeight / rows);

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const tile = document.createElement('div');
        tile.className = 'mosaic-tile';
        const layerA = document.createElement('div');
        const layerB = document.createElement('div');
        layerA.className = 'mosaic-layer';
        layerB.className = 'mosaic-layer';
        styleLayer(layerA, col, row);
        styleLayer(layerB, col, row);
        const canvas = document.createElement('canvas');
        canvas.className = 'mosaic-canvas';
        canvas.width = tileW; canvas.height = tileH;
        tile.append(layerA, layerB, canvas);
        heroMosaic.appendChild(tile);

        if (startSlide.type === 'video') {
          canvas.classList.add('active');
        } else {
          layerA.style.backgroundImage = `url(${startSlide.src})`;
          layerA.classList.add('active');
        }
        tiles.push({ front: layerA, back: layerB, canvas, ctx: canvas.getContext('2d'), row, col });
      }
    }

    computeVideoRect();
    if (startSlide.type === 'video') startVideoLoop(); else stopVideoLoop();
  }

  function rotateMosaic() {
    index = (index + 1) % slides.length;
    const next   = slides[index];
    const toVideo = next.type === 'video';
    if (toVideo) { computeVideoRect(); startVideoLoop(); }

    tiles.forEach(tile => {
      const delay      = (tile.row + tile.col) * 35;
      const fromCanvas = tile.canvas.classList.contains('active');
      const fromLayer  = fromCanvas ? null : (tile.front.classList.contains('active') ? tile.front : tile.back);
      const toLayer    = toVideo ? null : (fromLayer === tile.front ? tile.back : tile.front);
      if (toLayer) toLayer.style.backgroundImage = `url(${next.src})`;

      setTimeout(() => {
        if (toVideo) tile.canvas.classList.add('active');
        else toLayer.classList.add('active');
        if (fromCanvas) tile.canvas.classList.remove('active');
        else if (fromLayer) fromLayer.classList.remove('active');
      }, delay);
    });

    if (!toVideo) setTimeout(stopVideoLoop, (cols + rows) * 35 + 1300);
  }

  buildMosaic();
  setInterval(rotateMosaic, 5000);

  let resizeT;
  window.addEventListener('resize', () => {
    clearTimeout(resizeT);
    resizeT = setTimeout(buildMosaic, 300);
  });
}

/* Formulaire + honeypot */
function handleSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const msg  = document.getElementById('formMsg');
  if (form.website.value) { showMsg(msg, 'Merci, votre message a été envoyé.', 'ok'); return; }
  if (!form.nom.value.trim() || !form.tel.value.trim() || !form.message.value.trim()) {
    showMsg(msg, 'Veuillez remplir les champs obligatoires (*).', 'err'); return;
  }
  /*
   * TODO : fetch('https://formspree.io/f/VOTRE_ID', { method:'POST', body: new FormData(form) })
   */
  showMsg(msg, '✓ Message envoyé ! Nous vous rappelons sous 24h.', 'ok');
  form.reset();
}
function showMsg(el, txt, t) {
  el.textContent = txt; el.style.display = 'block';
  el.style.cssText += t === 'ok'
    ? ';background:rgba(34,197,94,.1);color:#15803d;border:1px solid rgba(34,197,94,.25);border-radius:4px;padding:.7rem 1rem;font-size:.85rem'
    : ';background:rgba(220,38,38,.08);color:#b91c1c;border:1px solid rgba(220,38,38,.2);border-radius:4px;padding:.7rem 1rem;font-size:.85rem';
}
