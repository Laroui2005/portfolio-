import { supabase, SUPABASE_BUCKET } from './supabase-config.js';

/* ===== Theme toggle (shared behavior with main site) ===== */
const root = document.documentElement;
const themeToggle = document.getElementById('themeToggle');
function applyTheme(theme) {
  if (theme === 'dark' || theme === 'light') root.setAttribute('data-theme', theme);
  else root.removeAttribute('data-theme');
}
try { applyTheme(localStorage.getItem('theme')); } catch { /* ignore */ }
themeToggle.addEventListener('click', () => {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const current = root.getAttribute('data-theme') || (prefersDark ? 'dark' : 'light');
  const next = current === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  try { localStorage.setItem('theme', next); } catch { /* ignore */ }
});

/* ===== Elements ===== */
const loginSection = document.getElementById('loginSection');
const dashboardSection = document.getElementById('dashboardSection');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const logoutBtn = document.getElementById('logoutBtn');

const projectForm = document.getElementById('projectForm');
const formTitle = document.getElementById('formTitle');
const formMessage = document.getElementById('formMessage');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const saveBtn = document.getElementById('saveBtn');
const projectsList = document.getElementById('projectsList');

const fId = document.getElementById('projectId');
const fCategory = document.getElementById('fCategory');
const fSortOrder = document.getElementById('fSortOrder');
const fTitle = document.getElementById('fTitle');
const fTitleAr = document.getElementById('fTitleAr');
const fDescription = document.getElementById('fDescription');
const fImageFiles = document.getElementById('fImageFiles');
const fIcon = document.getElementById('fIcon');
const fTags = document.getElementById('fTags');
const fBadge = document.getElementById('fBadge');
const fLinkUrl = document.getElementById('fLinkUrl');
const fPublished = document.getElementById('fPublished');
const imageGallery = document.getElementById('imageGallery');

let currentImages = [];

function renderGallery() {
  if (currentImages.length === 0) {
    imageGallery.classList.add('hidden');
    imageGallery.innerHTML = '';
    return;
  }
  imageGallery.classList.remove('hidden');
  imageGallery.innerHTML = currentImages
    .map((url, i) => `
      <div class="image-gallery-item">
        <img src="${url}" alt="">
        <button type="button" class="remove-image" data-index="${i}" title="حذف هذه الصورة">✕</button>
      </div>`)
    .join('');

  imageGallery.querySelectorAll('.remove-image').forEach((btn) => {
    btn.addEventListener('click', () => {
      currentImages.splice(Number(btn.dataset.index), 1);
      renderGallery();
    });
  });
}

/* ===== Auth state ===== */
async function refreshAuthUI() {
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    loginSection.classList.add('hidden');
    dashboardSection.classList.remove('hidden');
    logoutBtn.classList.remove('hidden');
    loadProjects();
  } else {
    loginSection.classList.remove('hidden');
    dashboardSection.classList.add('hidden');
    logoutBtn.classList.add('hidden');
  }
}

supabase.auth.onAuthStateChange(() => refreshAuthUI());
refreshAuthUI();

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  loginError.textContent = '';
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) loginError.textContent = 'فشل تسجيل الدخول: بيانات غير صحيحة.';
});

logoutBtn.addEventListener('click', async () => {
  await supabase.auth.signOut();
});

/* ===== Form helpers ===== */
function resetForm() {
  fId.value = '';
  projectForm.reset();
  fCategory.value = 'mobile';
  fPublished.checked = true;
  currentImages = [];
  renderGallery();
  formTitle.textContent = 'إضافة مشروع جديد';
  cancelEditBtn.classList.add('hidden');
  saveBtn.textContent = 'حفظ المشروع';
  formMessage.textContent = '';
  formMessage.className = 'form-message';
}

cancelEditBtn.addEventListener('click', resetForm);

function fillFormForEdit(project) {
  fId.value = project.id;
  fCategory.value = project.category;
  fSortOrder.value = project.sort_order ?? 0;
  fTitle.value = project.title || '';
  fTitleAr.value = project.title_ar || '';
  fDescription.value = project.description || '';
  fIcon.value = project.icon || '';
  fTags.value = (project.tags || []).join(', ');
  fBadge.value = project.store_badge || '';
  fLinkUrl.value = project.link_url || '';
  fPublished.checked = !!project.is_published;
  currentImages = [...(project.image_urls || [])];
  renderGallery();

  formTitle.textContent = `تعديل: ${project.title}`;
  cancelEditBtn.classList.remove('hidden');
  saveBtn.textContent = 'حفظ التعديلات';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ===== Save (create / update) ===== */
projectForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  saveBtn.disabled = true;
  formMessage.textContent = 'جارِ الحفظ…';
  formMessage.className = 'form-message';

  try {
    const files = Array.from(fImageFiles.files);
    const uploadedUrls = [];

    for (const file of files) {
      const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '-');
      const path = `${fCategory.value}/${Date.now()}-${Math.random().toString(36).slice(2, 7)}-${safeName}`;
      const { error: uploadError } = await supabase.storage
        .from(SUPABASE_BUCKET)
        .upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from(SUPABASE_BUCKET).getPublicUrl(path);
      uploadedUrls.push(data.publicUrl);
    }

    const imageUrls = [...currentImages, ...uploadedUrls];
    const tags = fTags.value.split(',').map((t) => t.trim()).filter(Boolean);

    const payload = {
      category: fCategory.value,
      sort_order: Number(fSortOrder.value) || 0,
      title: fTitle.value.trim(),
      title_ar: fTitleAr.value.trim() || null,
      description: fDescription.value.trim(),
      image_urls: imageUrls,
      icon: fIcon.value.trim() || null,
      tags,
      store_badge: fBadge.value.trim() || null,
      link_url: fLinkUrl.value.trim() || null,
      is_published: fPublished.checked,
    };

    const editingId = fId.value;
    const { error } = editingId
      ? await supabase.from('projects').update(payload).eq('id', editingId)
      : await supabase.from('projects').insert(payload);

    if (error) throw error;

    formMessage.textContent = 'تم الحفظ بنجاح ✓';
    formMessage.className = 'form-message success';
    resetForm();
    loadProjects();
  } catch (err) {
    formMessage.textContent = `خطأ: ${err.message || 'حدث خطأ غير متوقع'}`;
    formMessage.className = 'form-message error';
  } finally {
    saveBtn.disabled = false;
  }
});

/* ===== List + row actions ===== */
const CATEGORY_LABELS = { mobile: '📱 موبايل', desktop: '🖥️ ديسكتوب', services: '🚀 خدمات' };

async function loadProjects() {
  projectsList.innerHTML = '<p class="grid-status">جارِ التحميل…</p>';
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('category', { ascending: true })
    .order('sort_order', { ascending: true });

  if (error) {
    projectsList.innerHTML = `<p class="grid-status">تعذّر التحميل: ${error.message}</p>`;
    return;
  }

  if (!data || data.length === 0) {
    projectsList.innerHTML = '<p class="grid-status">لا توجد مشاريع بعد. أضف أول مشروع من الأعلى.</p>';
    return;
  }

  projectsList.innerHTML = '';
  data.forEach((project) => projectsList.appendChild(buildRow(project)));
}

function buildRow(project) {
  const row = document.createElement('div');
  row.className = `admin-row${project.is_published ? '' : ' unpublished'}`;

  const firstImage = (project.image_urls || [])[0];
  const media = firstImage
    ? `<img src="${firstImage}" alt="">`
    : `<div class="row-icon">${project.icon || '📦'}</div>`;

  row.innerHTML = `
    ${media}
    <div class="row-info">
      <div class="row-title">
        <span>${project.title}</span>
        <span class="row-cat">${CATEGORY_LABELS[project.category] || project.category}</span>
        ${project.is_published ? '' : '<span class="row-cat">مخفي</span>'}
      </div>
      <div class="row-desc">${project.description || ''}</div>
    </div>
    <div class="row-actions">
      <button type="button" data-action="toggle">${project.is_published ? 'إخفاء' : 'إظهار'}</button>
      <button type="button" data-action="edit">تعديل</button>
      <button type="button" data-action="delete" class="danger">حذف</button>
    </div>
  `;

  row.querySelector('[data-action="edit"]').addEventListener('click', () => fillFormForEdit(project));

  row.querySelector('[data-action="toggle"]').addEventListener('click', async () => {
    const { error } = await supabase
      .from('projects')
      .update({ is_published: !project.is_published })
      .eq('id', project.id);
    if (!error) loadProjects();
  });

  row.querySelector('[data-action="delete"]').addEventListener('click', async () => {
    if (!confirm(`حذف "${project.title}" نهائيًا؟`)) return;
    const { error } = await supabase.from('projects').delete().eq('id', project.id);
    if (!error) loadProjects();
  });

  return row;
}

resetForm();
