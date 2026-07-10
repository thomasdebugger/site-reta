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
