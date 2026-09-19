const translations = {
  ar: {
    'nav.about': 'نبذة',
    'nav.skills': 'المهارات',
    'nav.projects': 'المشاريع',
    'nav.contact': 'تواصل',
    'hero.eyebrow': 'مطوّر تطبيقات موبايل وديسكتوب',
    'hero.sub': 'طالب ماستر 1 علوم الحاسوب بجامعة أحمد دراية — أدرار، الجزائر. أبني تطبيقات موبايل بـ Flutter وتطبيقات سطح المكتب بـ WPF، وأدير خدمات نشر التطبيقات والتجارة الرقمية.',
    'hero.cta.projects': 'شاهد المشاريع',
    'hero.cta.contact': 'تواصل معي',
    'hero.meta.location': '📍 أدرار، الجزائر',
    'hero.meta.education': '🎓 ماستر 1 — علوم الحاسوب',
    'hero.meta.age': '🕑 20 سنة',
    'hero.location.title': 'أدرار',
    'hero.location.sub': 'الجزائر 🇩🇿',
    'about.sectionTitle': 'نبذة عني',
    'about.education.title': 'التعليم',
    'about.education.uni': 'جامعة أحمد دراية — أدرار',
    'about.education.degree1': 'ماستر 1، علوم الحاسوب (حاليًا)',
    'about.education.degree2': 'ليسانس، علوم الحاسوب — نفس الجامعة',
    'about.whatIdo.title': 'ما أقوم به',
    'about.whatIdo.body': 'أطوّر تطبيقات موبايل كاملة باستخدام Flutter و Supabase، وأنظمة سطح مكتب احترافية بـ WPF و .NET 10 تشمل أنظمة ترخيص (Licensing) مخصصة. أدير أيضًا خدمة نشر التطبيقات على المتاجر ومتجرًا رقميًا عبر إنستغرام.',
    'skills.sectionTitle': 'المهارات',
    'skills.hint': 'مرر الفأرة فوق البطاقة لرؤية التفاصيل',
    'skills.mobile.title': 'الموبايل والويب',
    'skills.desktop.title': 'سطح المكتب',
    'skills.services.title': 'الأعمال والأدوات',
    'projects.sectionTitle': 'المشاريع',
    'tabs.mobile': '📱 تطبيقات الموبايل',
    'tabs.desktop': '🖥️ تطبيقات سطح المكتب',
    'tabs.services': '🚀 الخدمات',
    'projects.error': 'تعذّر تحميل المشاريع حاليًا.',
    'projects.empty': 'لا توجد مشاريع في هذا القسم بعد.',
    'projects.dragHint': 'اسحب لعرض المزيد ⟷',
    'projects.visitLink': 'زيارة الرابط →',
    'contact.sectionTitle': 'تواصل معي',
    'contact.lead': 'هل لديك مشروع أو فكرة؟ يسعدني التعاون معك.',
    'contact.copied': 'تم النسخ ✓',
    'footer.tagline': 'مصمم ومطوّر بشغف من أدرار، الجزائر 🇩🇿',
    'footer.admin': 'لوحة التحكم',
    'lightbox.close': 'إغلاق',
    'lightbox.prev': 'الصورة السابقة',
    'lightbox.next': 'الصورة التالية',
  },
  en: {
    'nav.about': 'About',
    'nav.skills': 'Skills',
    'nav.projects': 'Projects',
    'nav.contact': 'Contact',
    'hero.eyebrow': 'Mobile & Desktop App Developer',
    'hero.sub': 'Master 1 Computer Science student at Ahmed Draia University — Adrar, Algeria. I build mobile apps with Flutter, desktop apps with WPF, and run app publishing & digital commerce services.',
    'hero.cta.projects': 'View Projects',
    'hero.cta.contact': 'Contact Me',
    'hero.meta.location': '📍 Adrar, Algeria',
    'hero.meta.education': '🎓 Master 1 — Computer Science',
    'hero.meta.age': '🕑 20 years old',
    'hero.location.title': 'Adrar',
    'hero.location.sub': 'Algeria 🇩🇿',
    'about.sectionTitle': 'About Me',
    'about.education.title': 'Education',
    'about.education.uni': 'Ahmed Draia University — Adrar',
    'about.education.degree1': "Master 1, Computer Science (current)",
    'about.education.degree2': "Bachelor's, Computer Science — same university",
    'about.whatIdo.title': 'What I Do',
    'about.whatIdo.body': 'I build full mobile apps with Flutter and Supabase, and professional desktop systems with WPF and .NET 10 including custom licensing systems. I also run an app publishing service and a digital store on Instagram.',
    'skills.sectionTitle': 'Skills',
    'skills.hint': 'Hover a card to see the details',
    'skills.mobile.title': 'Mobile & Web',
    'skills.desktop.title': 'Desktop',
    'skills.services.title': 'Business & Tools',
    'projects.sectionTitle': 'Projects',
    'tabs.mobile': '📱 Mobile Apps',
    'tabs.desktop': '🖥️ Desktop Apps',
    'tabs.services': '🚀 Services',
    'projects.error': 'Could not load projects right now.',
    'projects.empty': 'No projects in this category yet.',
    'projects.dragHint': 'Drag to see more ⟷',
    'projects.visitLink': 'Visit link →',
    'contact.sectionTitle': 'Contact Me',
    'contact.lead': 'Have a project or an idea? I would love to collaborate.',
    'contact.copied': 'Copied ✓',
    'footer.tagline': 'Designed & built with passion from Adrar, Algeria 🇩🇿',
    'footer.admin': 'Admin Panel',
    'lightbox.close': 'Close',
    'lightbox.prev': 'Previous image',
    'lightbox.next': 'Next image',
  },
};

let currentLang = 'ar';

export function getLang() {
  return currentLang;
}

export function t(key) {
  return translations[currentLang]?.[key] ?? translations.ar[key] ?? key;
}

function applyStaticTranslations() {
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    el.textContent = t(el.getAttribute('data-i18n'));
  });
  document.querySelectorAll('[data-i18n-label]').forEach((el) => {
    el.setAttribute('aria-label', t(el.getAttribute('data-i18n-label')));
  });
}

export function setLang(lang) {
  currentLang = lang === 'en' ? 'en' : 'ar';
  document.documentElement.lang = currentLang;
  document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
  applyStaticTranslations();
  try { localStorage.setItem('lang', currentLang); } catch { /* ignore */ }
  document.dispatchEvent(new CustomEvent('langchange', { detail: { lang: currentLang } }));
}

export function initLang() {
  let stored = null;
  try { stored = localStorage.getItem('lang'); } catch { /* ignore */ }
  setLang(stored === 'en' ? 'en' : 'ar');
}
