'use strict';

// State
let CHARACTERS = [];
let ALTER_EGO_PAIRS = [];
let currentFilter = 'all';
let currentSearch = '';
let lastFocusedCard = null;

// DOM refs
const grid          = document.getElementById('character-grid');
const emptyState    = document.getElementById('empty-state');
const archiveCount  = document.getElementById('archive-count');
const searchInput   = document.getElementById('search-input');
const filterChips   = document.querySelectorAll('.chip');
const alterEgosList = document.getElementById('alter-egos-list');
const modalOverlay  = document.getElementById('modal-overlay');
const modal         = document.getElementById('modal');
const modalClose    = document.getElementById('modal-close');

// Image fallback (called via onerror on <img>)
function imgFallback(el, text) {
  el.src = `https://placehold.co/400x534/F7F4EC/1A1A1A?text=${encodeURIComponent(text || '?')}`;
  el.onerror = null;
}

// Build a single character card
function buildCard(char) {
  const li = document.createElement('li');
  li.className = 'char-card';
  li.setAttribute('role', 'button');
  li.setAttribute('tabindex', '0');
  li.setAttribute('aria-label', `Lihat detail ${char.name}`);
  li.dataset.cat = char.category;

  li.innerHTML = `
    <div class="char-card__image-wrap">
      <img
        class="char-card__image"
        src="${char.image}"
        alt="${char.name}"
        loading="lazy"
        onerror="imgFallback(this, '${char.name.replace(/'/g, '')}')"
      />
      <div class="char-card__overlay" aria-hidden="true"></div>
      <div class="char-card__content">
        <span class="char-card__tag">${char.tags[0] ?? char.category}</span>
        <h3 class="char-card__name">${char.name}</h3>
        <p class="char-card__subtitle">${char.title}</p>
      </div>
    </div>
  `;

  li.addEventListener('click', () => openModal(char.id, li));
  li.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal(char.id, li); }
  });

  return li;
}

// Render character grid based on current filter + search
function renderGrid() {
  const filtered = CHARACTERS.filter((char) => {
    const matchCat    = currentFilter === 'all' || char.category.toLowerCase() === currentFilter.toLowerCase();
    const matchSearch = currentSearch === '' || char.name.toLowerCase().includes(currentSearch.toLowerCase());
    return matchCat && matchSearch;
  });

  grid.innerHTML = '';

  if (filtered.length === 0) {
    emptyState.hidden = false;
    archiveCount.textContent = '0 karakter';
  } else {
    emptyState.hidden = true;
    archiveCount.textContent = `${filtered.length} dari ${CHARACTERS.length} karakter`;
    const frag = document.createDocumentFragment();
    filtered.forEach((c) => frag.appendChild(buildCard(c)));
    grid.appendChild(frag);
  }
}

// Alter Ego section
const PAIR_COLORS = [
  { bg: '#D4BBFF', dk: '#5A2D9C' },
  { bg: '#B5EDDA', dk: '#14603F' },
  { bg: '#FFB8C8', dk: '#8A1A38' },
  { bg: '#FFF3A8', dk: '#6B5400' },
  { bg: '#B8DEFF', dk: '#0F4C8A' },
];

function renderAlterEgos() {
  const frag = document.createDocumentFragment();

  ALTER_EGO_PAIRS.forEach((pair, index) => {
    const isReverse = index % 2 !== 0;
    const { bg, dk } = PAIR_COLORS[index] ?? PAIR_COLORS[0];

    const row = document.createElement('div');
    row.className = `pair-row${isReverse ? ' pair-row--reverse' : ''}`;
    row.style.setProperty('--pair-bg', bg);
    row.style.setProperty('--pair-dk', dk);
    row.setAttribute('aria-label', `${pair.member} dipasangkan dengan ${pair.character}`);

    row.innerHTML = `
      <div class="pair-row__image-col">
        <div class="pair-row__image-wrap">
          <img
            class="pair-row__image"
            src="${pair.charImage}"
            alt="${pair.character}"
            loading="lazy"
            onerror="imgFallback(this, '${pair.character.replace(/'/g, '')}')"
          />
        </div>
      </div>
      <div class="pair-row__text-col">
        <p class="pair-row__eyebrow">★ ALTER EGO · ${pair.category.toUpperCase()}</p>
        <h3 class="pair-row__names">
          ${pair.member}<em class="x-sep">&times;</em>${pair.character}
        </h3>
        <p class="pair-row__nim">NIM: ${pair.nim}</p>
        <p class="pair-row__char">"${pair.character}"</p>
        <p class="pair-row__divider" aria-hidden="true">· · · · · · · · · · · ·</p>
        <p class="pair-row__desc">${pair.desc}</p>
        <span class="pair-row__badge">${pair.category}</span>
      </div>
    `;

    frag.appendChild(row);
  });

  alterEgosList.appendChild(frag);
}

// Modal — focus trap helpers
function getModalFocusables() {
  return modal.querySelectorAll('a[href], button:not([disabled]), input, textarea, select, [tabindex]:not([tabindex="-1"])');
}

function handleFocusTrap(e) {
  if (e.key !== 'Tab') return;
  const focusables = getModalFocusables();
  if (!focusables.length) return;
  const first = focusables[0];
  const last  = focusables[focusables.length - 1];
  if (e.shiftKey) {
    if (document.activeElement === first) { e.preventDefault(); last.focus(); }
  } else {
    if (document.activeElement === last)  { e.preventDefault(); first.focus(); }
  }
}

function handleEscapeKey(e) {
  if (e.key === 'Escape') closeModal();
}

function getScrollbarWidth() {
  return window.innerWidth - document.documentElement.clientWidth;
}

function openModal(charId, triggerEl) {
  const char = CHARACTERS.find((c) => c.id === charId);
  if (!char) return;
  lastFocusedCard = triggerEl;

  const img = document.getElementById('modal-image');
  img.src   = char.image;
  img.alt   = `${char.name} — ${char.title}`;
  img.onerror = () => imgFallback(img, char.name);

  document.getElementById('modal-char-name').textContent  = char.name;
  document.getElementById('modal-char-title').textContent = char.title;
  document.getElementById('modal-char-lore').textContent  = char.lore;

  document.getElementById('modal-tags').innerHTML = char.tags
    .map((t, i) => `<span class="modal__tag" data-cat="${i === 0 ? char.category : t}">${t}</span>`)
    .join('');

  document.getElementById('modal-stats').innerHTML = char.stats
    .map((s) => `<div class="modal__stat"><p class="modal__stat-label">${s.label}</p><p class="modal__stat-value">${s.value}</p></div>`)
    .join('');

  modalOverlay.hidden = false;
  document.body.style.overflow     = 'hidden';
  document.body.style.paddingRight = getScrollbarWidth() + 'px';
  requestAnimationFrame(() => modalClose.focus());
  document.addEventListener('keydown', handleFocusTrap);
  document.addEventListener('keydown', handleEscapeKey);
}

function closeModal() {
  modalOverlay.hidden = true;
  document.body.style.overflow     = '';
  document.body.style.paddingRight = '';
  document.removeEventListener('keydown', handleFocusTrap);
  document.removeEventListener('keydown', handleEscapeKey);
  if (lastFocusedCard) { lastFocusedCard.focus(); lastFocusedCard = null; }
}

// Event listeners — modal
modalClose.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) closeModal(); });

// Event listeners — search (debounced)
let searchTimeout;
searchInput.addEventListener('input', () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    currentSearch = searchInput.value.trim();
    renderGrid();
  }, 120);
});

// Event listeners — filter chips
filterChips.forEach((chip) => {
  chip.addEventListener('click', () => {
    filterChips.forEach((c) => c.classList.remove('chip--active'));
    chip.classList.add('chip--active');
    currentFilter = chip.getAttribute('data-filter');
    renderGrid();
  });
});

// Hamburger menu
const hamburger  = document.getElementById('hamburger-btn');
const mobileMenu = document.getElementById('mobile-menu');

function setMobileMenu(open) {
  hamburger.setAttribute('aria-expanded', String(open));
  mobileMenu.classList.toggle('is-open', open);
}

hamburger.addEventListener('click', (e) => {
  e.stopPropagation();
  setMobileMenu(hamburger.getAttribute('aria-expanded') !== 'true');
});

mobileMenu.querySelectorAll('.navbar__mobile-link').forEach((link) => {
  link.addEventListener('click', () => setMobileMenu(false));
});

document.addEventListener('click', (e) => {
  if (hamburger.getAttribute('aria-expanded') === 'true' && !e.target.closest('.navbar')) {
    setMobileMenu(false);
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && hamburger.getAttribute('aria-expanded') === 'true') {
    setMobileMenu(false);
    hamburger.focus();
  }
});

window.addEventListener('resize', () => {
  if (window.innerWidth > 768) setMobileMenu(false);
}, { passive: true });

// Smooth scroll
document.getElementById('explore-cta').addEventListener('click', (e) => {
  e.preventDefault();
  document.getElementById('archive').scrollIntoView({ behavior: 'smooth' });
});

document.querySelectorAll('.navbar__link, .navbar__mobile-link').forEach((link) => {
  link.addEventListener('click', (e) => {
    const href = link.getAttribute('href');
    if (href?.startsWith('#')) {
      e.preventDefault();
      document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// Telegram — Request Karakter
const requestForm   = document.getElementById('request-form');
const requestStatus = document.getElementById('request-status');
const requestSubmit = document.getElementById('request-submit');

function checkRateLimit() {
  const KEY  = 'ae_req_times';
  const now  = Date.now();
  const hour = 60 * 60 * 1000;
  let times  = JSON.parse(localStorage.getItem(KEY) || '[]');
  times = times.filter(t => now - t < hour);
  if (times.length >= 3) return false;
  times.push(now);
  localStorage.setItem(KEY, JSON.stringify(times));
  return true;
}

function setRequestStatus(msg, type) {
  if (!requestStatus) return;
  requestStatus.textContent = msg;
  requestStatus.className   = `request-form__status request-form__status--${type}`;
  requestStatus.hidden      = false;
}

async function sendToTelegram(data) {
  // Kirim ke Vercel serverless function — token Telegram ada di server, bukan browser
  const res = await fetch('/api/send-request', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    // 503 = env vars belum diset di Vercel
    // 404 = sedang buka via Live Server lokal (bukan Vercel)
    if (res.status === 404) {
      throw new Error('Fitur request hanya aktif saat di-deploy ke Vercel.');
    }
    throw new Error(json.error || `Error ${res.status}`);
  }
}

if (requestForm) {
  requestForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!requestForm.checkValidity()) { requestForm.reportValidity(); return; }

    if (!checkRateLimit()) {
      setRequestStatus('⏱ Terlalu banyak request. Coba lagi dalam 1 jam.', 'err');
      return;
    }

    const data = {
      name:      document.getElementById('req-name').value.trim(),
      category:  document.getElementById('req-category').value,
      character: document.getElementById('req-character').value.trim(),
      reason:    document.getElementById('req-reason').value.trim(),
    };

    requestSubmit.disabled = true;
    setRequestStatus('Mengirim...', 'busy');

    try {
      await sendToTelegram(data);
      setRequestStatus('✓ Request terkirim! Makasih.', 'ok');
      requestForm.reset();
      requestStatus.hidden = false;
    } catch (err) {
      console.error('Request error:', err);
      setRequestStatus(`✗ ${err.message}`, 'err');
    } finally {
      requestSubmit.disabled = false;
    }
  });
}

// Init — fetch JSON then render
function showLoadError(msg) {
  grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><span class="empty-state__face">⚠</span><p>${msg}</p></div>`;
  archiveCount.textContent = 'Error';
}

async function init() {
  try {
    const [charsRes, pairsRes] = await Promise.all([
      fetch('data/characters.json'),
      fetch('data/alter-egos.json'),
    ]);
    if (!charsRes.ok || !pairsRes.ok) throw new Error('Gagal fetch JSON');
    CHARACTERS      = await charsRes.json();
    ALTER_EGO_PAIRS = await pairsRes.json();
    renderGrid();
    renderAlterEgos();
  } catch (err) {
    console.error('Init error:', err);
    showLoadError('Gagal memuat data. Buka lewat Live Server, bukan file://');
  }
}

// Guestbook
const GB_COLORS = ['#D4BBFF', '#B5EDDA', '#FFB8C8', '#FFF3A8', '#B8DEFF', '#FFDDB8'];

const gbForm    = document.getElementById('gb-form');
const gbList    = document.getElementById('gb-list');
const gbLoading = document.getElementById('gb-loading');
const gbStatus  = document.getElementById('gb-status');
const gbSubmit  = document.getElementById('gb-submit');
const gbMessage = document.getElementById('gb-message');
const gbCounter = document.getElementById('gb-counter');
const gbName    = document.getElementById('gb-name');

function setGbStatus(msg, type) {
  if (!gbStatus) return;
  gbStatus.textContent = msg;
  gbStatus.className   = `request-form__status request-form__status--${type}`;
  gbStatus.hidden      = false;
}

function formatTime(iso) {
  try {
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function buildGbCard(entry, index) {
  const card = document.createElement('article');
  card.className = 'gb-card';
  card.style.setProperty('--gb-bg', GB_COLORS[index % GB_COLORS.length]);

  const initial = (entry.name || '?').charAt(0).toUpperCase();

  card.innerHTML = `
    <div class="gb-card__header">
      <div class="gb-card__avatar" aria-hidden="true">${initial}</div>
      <div>
        <p class="gb-card__name">${entry.name}</p>
        <p class="gb-card__time">${formatTime(entry.timestamp)}</p>
      </div>
    </div>
    <p class="gb-card__message">${entry.message}</p>
  `;
  return card;
}

async function loadGuestbook() {
  if (!gbList) return;
  try {
    const res = await fetch('/api/guestbook');
    if (!res.ok) throw new Error(`${res.status}`);
    const entries = await res.json();

    if (gbLoading) gbLoading.remove();

    if (!entries.length) {
      gbList.innerHTML = '<p class="gb-empty">Belum ada pesan. Jadilah yang pertama! ★</p>';
      return;
    }

    const frag = document.createDocumentFragment();
    entries.forEach((entry, i) => frag.appendChild(buildGbCard(entry, i)));
    gbList.appendChild(frag);
  } catch (err) {
    if (gbLoading) gbLoading.textContent = 'Buku tamu tidak tersedia di lokal. Deploy ke Vercel dulu ya!';
    console.warn('Guestbook load error:', err.message);
  }
}

// Char counter
if (gbMessage) {
  gbMessage.addEventListener('input', () => {
    if (gbCounter) gbCounter.textContent = gbMessage.value.length;
  });
}

// Rate limit guestbook — 1 post per 5 menit per browser
function checkGbRateLimit() {
  const KEY  = 'ae_gb_last';
  const now  = Date.now();
  const last = parseInt(localStorage.getItem(KEY) || '0', 10);
  if (now - last < 5 * 60 * 1000) return false;
  localStorage.setItem(KEY, String(now));
  return true;
}

if (gbForm) {
  gbForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!gbForm.checkValidity()) { gbForm.reportValidity(); return; }

    if (!checkGbRateLimit()) {
      setGbStatus('⏱ Tunggu 5 menit sebelum kirim pesan lagi.', 'err');
      return;
    }

    const data = {
      name:    gbName.value.trim(),
      message: gbMessage.value.trim(),
    };

    gbSubmit.disabled = true;
    setGbStatus('Mengirim...', 'busy');

    try {
      const res = await fetch('/api/guestbook', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(data),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || `Error ${res.status}`);

      // Prepend card baru langsung tanpa reload
      const existing = gbList.querySelector('.gb-empty');
      if (existing) existing.remove();
      const card = buildGbCard(json.entry ?? { ...data, timestamp: new Date().toISOString() }, 0);
      gbList.insertBefore(card, gbList.firstChild);

      // Geser warna kartu lama
      gbList.querySelectorAll('.gb-card').forEach((c, i) => {
        c.style.setProperty('--gb-bg', GB_COLORS[i % GB_COLORS.length]);
      });

      gbForm.reset();
      if (gbCounter) gbCounter.textContent = '0';
      setGbStatus('✓ Pesan terkirim! Makasih sudah mampir.', 'ok');
    } catch (err) {
      console.error('Guestbook post error:', err);
      setGbStatus(`✗ ${err.message}`, 'err');
    } finally {
      gbSubmit.disabled = false;
    }
  });
}

init();
loadGuestbook();
