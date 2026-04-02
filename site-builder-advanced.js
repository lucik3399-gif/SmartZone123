requireAdmin();

const siteSettingsForm = document.getElementById('siteSettingsForm');
const extraContentForm = document.getElementById('extraContentForm');

function linesToArray(text){
  return String(text || '').split('\n').map(x => x.trim()).filter(Boolean);
}
function parsePairs(text, review = false){
  return String(text || '').split('\n').map(x => x.trim()).filter(Boolean).map(line => {
    const [a,b] = line.split('|');
    return review ? { name: (a || '').trim(), text: (b || '').trim() } : { title: (a || '').trim(), text: (b || '').trim() };
  });
}
function joinPairs(items, review = false){
  return (items || []).map(item => review ? `${item.name}|${item.text}` : `${item.title}|${item.text}`).join('\n');
}

function fillForms(){
  const s = getSiteSettings();

  [
    'siteName','siteTagline','logoLetter','logoImage','heroBadge','heroTitle','heroText',
    'promo1Title','promo1Text','promo2Title','promo2Text','promo3Title','promo3Text',
    'footerText','contactsPhone','contactsEmail','contactsCity','themeColor','accentColor',
    'seoTitle','seoDescription','socialInstagram','socialTelegram','socialFacebook'
  ].forEach(key => {
    if(siteSettingsForm[key]) siteSettingsForm[key].value = s[key] || '';
  });

  siteSettingsForm.heroImage1.value = (s.heroImages && s.heroImages[0]) || '';
  siteSettingsForm.heroImage2.value = (s.heroImages && s.heroImages[1]) || '';
  siteSettingsForm.heroImage3.value = (s.heroImages && s.heroImages[2]) || '';

  extraContentForm.toplineItems.value = (s.toplineItems || []).join('\n');
  extraContentForm.menuLinks.value = (s.menuLinks || []).join('\n');
  extraContentForm.categoryTiles.value = joinPairs(s.categoryTiles || []);
  extraContentForm.services.value = joinPairs(s.services || []);
  extraContentForm.reviews.value = joinPairs(s.reviews || [], true);
  extraContentForm.sectionOrder.value = (s.sectionOrder || []).join('\n');

  ['showTopline','showPromo','showHits','showRecommended','showServices','showReviews','showCategories','showQuickOrder'].forEach(key => {
    if(extraContentForm[key]) extraContentForm[key].checked = s[key] !== false;
  });
}

siteSettingsForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const current = getSiteSettings();
  const form = new FormData(siteSettingsForm);

  const updated = {
    ...current,
    siteName: String(form.get('siteName') || '').trim(),
    siteTagline: String(form.get('siteTagline') || '').trim(),
    logoLetter: String(form.get('logoLetter') || '').trim() || 'S',
    logoImage: String(form.get('logoImage') || '').trim(),
    heroBadge: String(form.get('heroBadge') || '').trim(),
    heroTitle: String(form.get('heroTitle') || '').trim(),
    heroText: String(form.get('heroText') || '').trim(),
    heroImages: [
      String(form.get('heroImage1') || '').trim(),
      String(form.get('heroImage2') || '').trim(),
      String(form.get('heroImage3') || '').trim()
    ],
    promo1Title: String(form.get('promo1Title') || '').trim(),
    promo1Text: String(form.get('promo1Text') || '').trim(),
    promo2Title: String(form.get('promo2Title') || '').trim(),
    promo2Text: String(form.get('promo2Text') || '').trim(),
    promo3Title: String(form.get('promo3Title') || '').trim(),
    promo3Text: String(form.get('promo3Text') || '').trim(),
    footerText: String(form.get('footerText') || '').trim(),
    contactsPhone: String(form.get('contactsPhone') || '').trim(),
    contactsEmail: String(form.get('contactsEmail') || '').trim(),
    contactsCity: String(form.get('contactsCity') || '').trim(),
    themeColor: String(form.get('themeColor') || '').trim() || '#16a34a',
    accentColor: String(form.get('accentColor') || '').trim() || '#f59e0b',
    seoTitle: String(form.get('seoTitle') || '').trim(),
    seoDescription: String(form.get('seoDescription') || '').trim(),
    socialInstagram: String(form.get('socialInstagram') || '').trim(),
    socialTelegram: String(form.get('socialTelegram') || '').trim(),
    socialFacebook: String(form.get('socialFacebook') || '').trim()
  };

  setSiteSettings(updated);
  showToast('Основні дані збережено', 'Тексти, кольори, SEO і картинки оновлено.');
});

extraContentForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const current = getSiteSettings();
  const form = new FormData(extraContentForm);

  const updated = {
    ...current,
    toplineItems: linesToArray(form.get('toplineItems')),
    menuLinks: linesToArray(form.get('menuLinks')),
    categoryTiles: parsePairs(form.get('categoryTiles')),
    services: parsePairs(form.get('services')),
    reviews: parsePairs(form.get('reviews'), true),
    sectionOrder: linesToArray(form.get('sectionOrder')),
    showTopline: !!form.get('showTopline'),
    showPromo: !!form.get('showPromo'),
    showHits: !!form.get('showHits'),
    showRecommended: !!form.get('showRecommended'),
    showServices: !!form.get('showServices'),
    showReviews: !!form.get('showReviews'),
    showCategories: !!form.get('showCategories'),
    showQuickOrder: !!form.get('showQuickOrder')
  };

  setSiteSettings(updated);
  showToast('Контент збережено', 'Меню, блоки і порядок секцій оновлено.');
});

fillForms();
