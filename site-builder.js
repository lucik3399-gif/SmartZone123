requireAdmin();

const siteSettingsForm = document.getElementById('siteSettingsForm');
const extraContentForm = document.getElementById('extraContentForm');

function serializeLines(items){
  return items.map(item => `${item.title || item.name}|${item.text}`).join('\n');
}

function parseLines(text, mode = 'title'){
  return String(text || '')
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => {
      const parts = line.split('|');
      return mode === 'review'
        ? { name: (parts[0] || '').trim(), text: (parts[1] || '').trim() }
        : { title: (parts[0] || '').trim(), text: (parts[1] || '').trim() };
    });
}

function fillForms(){
  const s = getSiteSettings();

  Object.keys(s).forEach(key => {
    if(siteSettingsForm[key] && typeof s[key] !== 'object'){
      siteSettingsForm[key].value = s[key] || '';
    }
  });

  extraContentForm.categoryTiles.value = serializeLines(s.categoryTiles || []);
  extraContentForm.services.value = serializeLines(s.services || []);
  extraContentForm.reviews.value = (s.reviews || []).map(item => `${item.name}|${item.text}`).join('\n');
}

siteSettingsForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const current = getSiteSettings();
  const form = new FormData(siteSettingsForm);

  const updated = {
    ...current,
    siteName: String(form.get('siteName') || '').trim(),
    siteTagline: String(form.get('siteTagline') || '').trim(),
    heroBadge: String(form.get('heroBadge') || '').trim(),
    heroTitle: String(form.get('heroTitle') || '').trim(),
    heroText: String(form.get('heroText') || '').trim(),
    promo1Title: String(form.get('promo1Title') || '').trim(),
    promo1Text: String(form.get('promo1Text') || '').trim(),
    promo2Title: String(form.get('promo2Title') || '').trim(),
    promo2Text: String(form.get('promo2Text') || '').trim(),
    promo3Title: String(form.get('promo3Title') || '').trim(),
    promo3Text: String(form.get('promo3Text') || '').trim(),
    footerText: String(form.get('footerText') || '').trim(),
    contactsPhone: String(form.get('contactsPhone') || '').trim(),
    contactsEmail: String(form.get('contactsEmail') || '').trim(),
    contactsCity: String(form.get('contactsCity') || '').trim()
  };

  setSiteSettings(updated);
  showToast('Сайт оновлено', 'Основні тексти сайту збережено.');
});

extraContentForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const current = getSiteSettings();
  const form = new FormData(extraContentForm);

  const updated = {
    ...current,
    categoryTiles: parseLines(form.get('categoryTiles')),
    services: parseLines(form.get('services')),
    reviews: parseLines(form.get('reviews'), 'review')
  };

  setSiteSettings(updated);
  showToast('Блоки оновлено', 'Категорії, сервіси і відгуки збережено.');
});

fillForms();
