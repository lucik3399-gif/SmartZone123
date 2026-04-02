

function getUserProfile(){
  return loadJson(STORAGE_KEYS.userProfile, {
    name: '',
    phone: '',
    email: '',
    city: '',
    address: ''
  });
}
function setUserProfile(profile){ saveJson(STORAGE_KEYS.userProfile, profile); }


function getSiteSettings(){
  return loadJson(STORAGE_KEYS.siteSettings, {
    siteName: 'SmartZone',
    siteTagline: 'маркет техніки',
    heroBadge: 'SMARTZONE MAX',
    heroTitle: 'Великий маркетплейс-стиль для твого магазину',
    heroText: 'Велика шапка, дерево категорій, банери, хіти продажів, каталог із лівими фільтрами, вибране, кошик, швидке замовлення і прихована адмінка.',
    promo1Title: 'Знижки на смартфони',
    promo1Text: 'Спеціальні ціни на популярні моделі',
    promo2Title: 'SMART10 і POWER5',
    promo2Text: 'Додавай промокод у кошику',
    promo3Title: 'По всій Україні',
    promo3Text: 'Зручне оформлення і перевірка статусу',
    footerText: 'Український маркетплейс електроніки з прихованою адмінкою.',
    contactsPhone: '+38 (000) 000-00-00',
    contactsEmail: 'smartzone@example.com',
    contactsCity: 'Львів',
    categoryTiles: [
      {title:'Смартфони', text:'Новинки, флагмани, хіти продажів'},
      {title:'Навушники', text:'ANC, TWS, преміальний звук'},
      {title:'Смарт-годинники', text:'Для спорту, дзвінків і стилю'},
      {title:'Аксесуари', text:'Павербанки, чохли, зарядки'}
    ],
    services: [
      {title:'🚚 Швидка доставка', text:'По Україні за кілька днів'},
      {title:'💳 Зручна оплата', text:'Готівка або післяплата'},
      {title:'🛡 Гарантія', text:'На смартфони і аксесуари'},
      {title:'📦 Відстеження', text:'Статус замовлення онлайн'}
    ],
    reviews: [
      {name:'Марія', text:'Виглядає дуже серйозно, як великий магазин техніки.'},
      {name:'Віталій', text:'Зручно шукати товари і сортувати по бренду та ціні.'},
      {name:'Наталія', text:'Дуже сподобалась головна сторінка з банерами і хітами продажів.'}
    ],
    themeColor: '#16a34a',
    accentColor: '#f59e0b',
    logoLetter: 'S',
    toplineItems: [
      '⚡ Щоденні акції',
      '🚚 Доставка по Україні',
      '🛡 Офіційна гарантія',
      '💬 Підтримка 7 днів на тиждень'
    ],
    menuLinks: [
      'Акції',
      'Хіти продажів',
      'Каталог',
      'Сервіси',
      'Відгуки'
    ],
    showHits: true,
    showRecommended: true,
    showServices: true,
    showReviews: true,
    showCategories: true,
    showPromo: true,
    showQuickOrder: true,
    showTopline: true,
    logoImage: '',
    faviconEmoji: '🛍️',
    heroImages: [
      'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?auto=format&fit=crop&w=1200&q=80'
    ],
    seoTitle: 'SmartZone Max — маркетплейс електроніки',
    seoDescription: 'SmartZone — український магазин смартфонів, навушників, аксесуарів і техніки.',
    socialInstagram: '@smartzone',
    socialTelegram: '@smartzone_shop',
    socialFacebook: 'facebook.com/smartzone',
    sectionOrder: ['hero','promo','categories','hits','services','catalog','quickorder','reviews'],
    paymentMethods: [
      { id: 'cash', name: 'Готівка при отриманні', enabled: true, type: 'offline', description: 'Оплата при отриманні замовлення', recipient: '', iban: '', cardNumber: '', instructions: 'Сплатіть готівкою під час отримання замовлення.' },
      { id: 'card', name: 'Оплата на картку', enabled: true, type: 'offline', description: 'Оплата на банківську картку', recipient: 'SmartZone', iban: '', cardNumber: '4444 1111 2222 3333', instructions: 'Переказуйте суму замовлення на картку і натисніть кнопку "Я оплатив".' },
      { id: 'invoice', name: 'Оплата за реквізитами', enabled: false, type: 'offline', description: 'Оплата на рахунок магазину', recipient: 'ФОП SmartZone', iban: 'UA123456789012345678901234567', cardNumber: '', instructions: 'Оплатіть замовлення за IBAN і вкажіть номер замовлення в призначенні платежу.' }
    ]
  });
}
function setSiteSettings(settings){ saveJson(STORAGE_KEYS.siteSettings, settings); }


function getPaymentMethods(){
  const settings = getSiteSettings();
  return Array.isArray(settings.paymentMethods) ? settings.paymentMethods : [];
}
function setPaymentMethods(methods){
  const settings = getSiteSettings();
  settings.paymentMethods = methods;
  setSiteSettings(settings);
}

function getPaymentMethodById(id){
  return getPaymentMethods().find(item => item.id === id) || null;
}
