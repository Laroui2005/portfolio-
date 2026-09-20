import { supabase } from './supabase-config.js';
import { initLang, setLang, getLang, t } from './i18n.js';

initLang();

/* ===== Language toggle ===== */
const langToggle = document.getElementById('langToggle');
langToggle.checked = getLang() === 'en';
langToggle.addEventListener('change', () => {
  setLang(langToggle.checked ? 'en' : 'ar');
});
document.addEventListener('langchange', () => loadProjects());

/* ===== Theme toggle ===== */
const root = document.documentElement;
const themeToggle = document.getElementById('themeToggle');

function getStoredTheme() {
  try { return localStorage.getItem('theme'); } catch { return null; }
}
function storeTheme(value) {
  try { localStorage.setItem('theme', value); } catch { /* ignore */ }
}
function applyTheme(theme) {
  if (theme === 'dark' || theme === 'light') {
    root.setAttribute('data-theme', theme);
  } else {
    root.removeAttribute('data-theme');
  }
}

applyTheme(getStoredTheme() || 'dark');

themeToggle.addEventListener('click', () => {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const current = root.getAttribute('data-theme') || (prefersDark ? 'dark' : 'light');
  const next = current === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  storeTheme(next);
});

/* ===== Mobile nav toggle ===== */
const navToggle = document.getElementById('navToggle');
const mainNav = document.getElementById('mainNav');

function setNavOpen(open) {
  mainNav.classList.toggle('open', open);
  navToggle.classList.toggle('open', open);
  navToggle.setAttribute('aria-expanded', String(open));
}

navToggle.addEventListener('click', () => setNavOpen(!mainNav.classList.contains('open')));
mainNav.querySelectorAll('a').forEach((link) =>
  link.addEventListener('click', () => setNavOpen(false))
);
document.addEventListener('click', (e) => {
  if (mainNav.classList.contains('open') && !mainNav.contains(e.target) && !navToggle.contains(e.target)) {
    setNavOpen(false);
  }
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && mainNav.classList.contains('open')) setNavOpen(false);
});

/* ===== Projects tabs ===== */
const tabButtons = document.querySelectorAll('.tab-btn');
const tabPanels = document.querySelectorAll('.tab-panel');

tabButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    tabButtons.forEach((b) => { b.classList.remove('active'); b.setAttribute('aria-selected', 'false'); });
    tabPanels.forEach((p) => p.classList.remove('active'));

    btn.classList.add('active');
    btn.setAttribute('aria-selected', 'true');
    document.getElementById(`panel-${btn.dataset.tab}`).classList.add('active');
  });
});

/* ===== Render one project card ===== */
function renderCard(project) {
  const { category, title, title_ar, description, image_urls = [], icon, tags = [], store_badge, link_url } = project;

  const chipRow = tags.length
    ? `<div class="chip-row">${tags.map((t) => `<span class="chip chip-${category}">${escapeHtml(t)}</span>`).join('')}</div>`
    : '';

  const nameHtml = title_ar
    ? `${escapeHtml(title)} <span class="ar-name">(${escapeHtml(title_ar)})</span>`
    : escapeHtml(title);

  const linkHtml = link_url
    ? `<a href="${escapeAttr(link_url)}" target="_blank" rel="noopener" class="btn btn-small">${t('projects.visitLink')}</a>`
    : '';

  const mediaHtml = buildMediaHtml(category, title, image_urls, icon, store_badge);

  const isService = category === 'services';

  return `
    <article class="project-card${isService ? ' service-card' : ''}">
      ${mediaHtml}
      <div class="project-body">
        <h3>${nameHtml}</h3>
        <p>${escapeHtml(description)}</p>
        ${chipRow}
        ${linkHtml}
      </div>
    </article>`;
}

function buildMediaHtml(category, title, images, icon, storeBadge) {
  if (category === 'services' && images.length === 0) {
    return `<div class="service-icon">${icon ? escapeHtml(icon) : '🚀'}</div>`;
  }

  const frameClass = category === 'desktop' ? 'frame-desktop' : 'frame-mobile';
  const windowBar = category === 'desktop' ? '<div class="window-bar"><span></span><span></span><span></span></div>' : '';
  const badge = storeBadge ? `<span class="badge-store">${escapeHtml(storeBadge)}</span>` : '';

  const frames = images.length
    ? images.map((url) => `<div class="media-frame ${frameClass}">${windowBar}<img src="${escapeAttr(url)}" alt="${escapeAttr(title)}" loading="lazy"></div>`).join('')
    : `<div class="media-frame ${frameClass} media-missing">${windowBar}</div>`;

  const hint = images.length > 1 ? `<p class="media-hint">${t('projects.dragHint')}</p>` : '';

  return `
    <div class="project-media">
      ${badge}
      <div class="media-scroll">${frames}</div>
    </div>
    ${hint}`;
}

function escapeHtml(str = '') {
  return String(str).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function escapeAttr(str = '') {
  return escapeHtml(str);
}

/* ===== Load projects from Supabase and render into the three grids ===== */
async function loadProjects() {
  const grids = {
    mobile: document.getElementById('grid-mobile'),
    desktop: document.getElementById('grid-desktop'),
    services: document.getElementById('grid-services'),
  };

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('is_published', true)
    .order('sort_order', { ascending: true });

  if (error) {
    Object.values(grids).forEach((grid) => {
      grid.innerHTML = `<p class="grid-status">${t('projects.error')}</p>`;
    });
    console.error('Failed to load projects:', error.message);
    return;
  }

  const byCategory = { mobile: [], desktop: [], services: [] };
  (data || []).forEach((project) => {
    if (byCategory[project.category]) byCategory[project.category].push(project);
  });

  Object.entries(grids).forEach(([category, grid]) => {
    const items = byCategory[category];
    grid.innerHTML = items.length
      ? items.map(renderCard).join('')
      : `<p class="grid-status">${t('projects.empty')}</p>`;
  });
}

loadProjects();

/* ===== Lightbox (image zoom) ===== */
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxCounter = document.getElementById('lightboxCounter');
const lightboxClose = document.getElementById('lightboxClose');
const lightboxPrev = document.getElementById('lightboxPrev');
const lightboxNext = document.getElementById('lightboxNext');

let lightboxImages = [];
let lightboxIndex = 0;

function openLightbox(images, index) {
  lightboxImages = images;
  lightboxIndex = index;
  updateLightbox();
  lightbox.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  lightbox.classList.add('hidden');
  document.body.style.overflow = '';
}

function updateLightbox() {
  lightboxImg.src = lightboxImages[lightboxIndex];
  const multi = lightboxImages.length > 1;
  lightboxPrev.classList.toggle('hidden', !multi);
  lightboxNext.classList.toggle('hidden', !multi);
  lightboxCounter.textContent = multi ? `${lightboxIndex + 1} / ${lightboxImages.length}` : '';
}

function showPrev() {
  lightboxIndex = (lightboxIndex - 1 + lightboxImages.length) % lightboxImages.length;
  updateLightbox();
}
function showNext() {
  lightboxIndex = (lightboxIndex + 1) % lightboxImages.length;
  updateLightbox();
}

document.addEventListener('click', (e) => {
  const img = e.target.closest('.media-frame img');
  if (!img) return;
  const scroll = img.closest('.media-scroll');
  const images = Array.from(scroll.querySelectorAll('img')).map((el) => el.src);
  const index = Array.from(scroll.querySelectorAll('img')).indexOf(img);
  openLightbox(images, index);
});

lightboxClose.addEventListener('click', closeLightbox);
lightboxPrev.addEventListener('click', showPrev);
lightboxNext.addEventListener('click', showNext);
lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) closeLightbox();
});
document.addEventListener('keydown', (e) => {
  if (lightbox.classList.contains('hidden')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') showPrev();
  if (e.key === 'ArrowRight') showNext();
});

/* ===== Copy email to clipboard ===== */
const copyEmailBtn = document.getElementById('copyEmailBtn');
copyEmailBtn.addEventListener('click', async () => {
  const value = copyEmailBtn.dataset.copyValue;
  const textEl = copyEmailBtn.querySelector('.contact-copy-text');

  try {
    await navigator.clipboard.writeText(value);
  } catch {
    const helper = document.createElement('textarea');
    helper.value = value;
    helper.style.position = 'fixed';
    helper.style.opacity = '0';
    document.body.appendChild(helper);
    helper.select();
    document.execCommand('copy');
    helper.remove();
  }

  copyEmailBtn.classList.add('copied');
  textEl.textContent = t('contact.copied');
  clearTimeout(copyEmailBtn._resetTimer);
  copyEmailBtn._resetTimer = setTimeout(() => {
    copyEmailBtn.classList.remove('copied');
    textEl.textContent = value;
  }, 1600);
});

/* ===== Footer year ===== */
document.getElementById('year').textContent = new Date().getFullYear();
