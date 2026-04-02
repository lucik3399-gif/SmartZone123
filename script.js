
function renderPaymentMethods(){
  const methods = getPaymentMethods().filter(item => item.enabled);
  const selects = [
    document.getElementById('paymentMethodSelect'),
    document.getElementById('quickPaymentMethodSelect')
  ].filter(Boolean);

  selects.forEach(select => {
    if(!methods.length){
      select.innerHTML = '<option value="">Спосіб оплати тимчасово недоступний</option>';
      return;
    }
    select.innerHTML = methods.map(method => `
      <option value="${method.id}">${method.name} — ${method.type === 'online' ? 'онлайн' : 'офлайн'}</option>
    `).join('');
  });
}


function applyThemeSettings(){
  const s = getSiteSettings();
  document.documentElement.style.setProperty('--theme-color', s.themeColor || '#16a34a');
  document.documentElement.style.setProperty('--accent-color', s.accentColor || '#f59e0b');
}
function applySeoSettings(){
  const s = getSiteSettings();
  if(s.seoTitle) document.title = s.seoTitle;
  let meta = document.querySelector('meta[name="description"]');
  if(!meta){
    meta = document.createElement('meta');
    meta.name = 'description';
    document.head.appendChild(meta);
  }
  meta.content = s.seoDescription || '';
}
function applyLogoSettings(){
  const s = getSiteSettings();
  document.querySelectorAll('.logo-badge').forEach(badge => {
    badge.textContent = s.logoLetter || 'S';
    if(s.logoImage){
      badge.style.backgroundImage = `url(${s.logoImage})`;
      badge.style.backgroundSize = 'cover';
      badge.style.backgroundPosition = 'center';
      badge.style.color = 'transparent';
    } else {
      badge.style.backgroundImage = '';
      badge.style.color = '#fff';
    }
  });
}
function applyHeroImages(){
  const s = getSiteSettings();
  const imgs = s.heroImages || [];
  ['heroImage1','heroImage2','heroImage3'].forEach((id, idx) => {
    const el = document.getElementById(id);
    if(el){
      el.src = imgs[idx] || 'https://via.placeholder.com/800x1200?text=SmartZone';
    }
  });
}
function applySectionOrder(){
  const order = (getSiteSettings().sectionOrder || []).slice();
  const main = document.querySelector('main');
  if(!main || !order.length) return;
  const map = {
    hero: document.getElementById('heroSection'),
    promo: document.getElementById('promoSection'),
    categories: document.getElementById('categoriesSection'),
    hits: document.getElementById('hitsSection'),
    services: document.getElementById('servicesSection'),
    catalog: document.getElementById('catalogSection'),
    quickorder: document.getElementById('quickOrderSection'),
    reviews: document.getElementById('reviewsSection')
  };
  order.forEach(key => {
    if(map[key]) main.appendChild(map[key]);
  });
}

function toggleSection(selector, shouldShow){
  const el = document.querySelector(selector);
  if(el) el.style.display = shouldShow ? '' : 'none';
}


function renderSiteSettings(){
  const s = getSiteSettings();

  const setText = (selector, value) => {
    const el = document.querySelector(selector);
    if(el) el.textContent = value;
  };

  setText('.logo-text strong', s.siteName);
  setText('.logo-text small', s.siteTagline);
  setText('.hero-badge', s.heroBadge);
  setText('.hero-copy h1', s.heroTitle);
  setText('.hero-copy p', s.heroText);
  setText('.promo-card.green strong', s.promo1Title);
  setText('.promo-card.green p', s.promo1Text);
  setText('.promo-card.orange strong', s.promo2Title);
  setText('.promo-card.orange p', s.promo2Text);
  setText('.promo-card.blue strong', s.promo3Title);
  setText('.promo-card.blue p', s.promo3Text);
  setText('#footerBrand', s.siteName || 'SmartZone');
  setText('#footerTextNode', s.footerText);
  setText('#footerPhone', s.contactsPhone || '');
  setText('#footerEmail', s.contactsEmail || '');
  setText('#footerCity', s.contactsCity || '');

  const topline = document.querySelector('.topline-inner');
  if(topline && Array.isArray(s.toplineItems)){
    topline.innerHTML = s.toplineItems.map(item => `<span>${item}</span>`).join('');
  }

  const nav = document.querySelector('.header-subnav');
  if(nav && Array.isArray(s.menuLinks)){
    const anchors = nav.querySelectorAll('a');
    const ids = ['promo','hits','catalog-section','services','reviews'];
    anchors.forEach((link, idx) => {
      if(idx < 5 && s.menuLinks[idx]){
        link.textContent = s.menuLinks[idx];
        link.setAttribute('href', '#' + ids[idx]);
      }
    });
  }

  const tilesWrap = document.querySelector('.category-tiles');
  if(tilesWrap && Array.isArray(s.categoryTiles)){
    tilesWrap.innerHTML = s.categoryTiles.map(tile => `
      <article class="tile"><strong>${tile.title}</strong><span>${tile.text}</span></article>
    `).join('');
  }

  const serviceWrap = document.querySelector('.service-grid');
  if(serviceWrap && Array.isArray(s.services)){
    serviceWrap.innerHTML = s.services.map(item => `
      <article class="service-card"><strong>${item.title}</strong><span>${item.text}</span></article>
    `).join('');
  }

  const reviewWrap = document.querySelector('.review-grid');
  if(reviewWrap && Array.isArray(s.reviews)){
    reviewWrap.innerHTML = s.reviews.map(item => `
      <article class="review-card"><strong>${item.name}</strong><div class="stars">★★★★★</div><p>${item.text}</p></article>
    `).join('');
  }

  const inst = document.getElementById('footerInstagram');
  const tg = document.getElementById('footerTelegram');
  const fb = document.getElementById('footerFacebook');
  if(inst){ inst.textContent = s.socialInstagram || 'Instagram'; inst.href = '#'; }
  if(tg){ tg.textContent = s.socialTelegram || 'Telegram'; tg.href = '#'; }
  if(fb){ fb.textContent = s.socialFacebook || 'Facebook'; fb.href = '#'; }

  toggleSection('.hits', s.showHits !== false);
  toggleSection('.recommended', s.showRecommended !== false);
  toggleSection('.services', s.showServices !== false);
  toggleSection('.reviews', s.showReviews !== false);
  toggleSection('.categories-showcase', s.showCategories !== false);
  toggleSection('.promo', s.showPromo !== false);
  toggleSection('.quick-order', s.showQuickOrder !== false);
  const toplineBlock = document.getElementById('toplineSection');
  if(toplineBlock) toplineBlock.style.display = s.showTopline !== false ? '' : 'none';

  applyThemeSettings();
  applySeoSettings();
  applyLogoSettings();
  applyHeroImages();
  applySectionOrder();
}

