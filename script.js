const PROMO_CODES = {
  SMART10: { type: 'percent', value: 10 },
  POWER5: { type: 'fixed', value: 500 }
};

const state = {
  products: getProducts(),
  cart: getCart(),
  wishlist: getWishlist(),
  activeCategory: 'Всі',
  search: '',
  sort: 'popular',
  stock: 'all',
  brand: 'all',
  priceRange: 'all',
  promoCode: getPromoCode(),
  theme: getTheme()
};

const els = {
  productsGrid: document.getElementById('productsGrid'),
  categoryChips: document.getElementById('categoryChips'),
  searchInput: document.getElementById('searchInput'),
  sortSelect: document.getElementById('sortSelect'),
  stockSelect: document.getElementById('stockSelect'),
  brandSelect: document.getElementById('brandSelect'),
  priceSelect: document.getElementById('priceSelect'),
  cartCount: document.getElementById('cartCount'),
  wishlistCount: document.getElementById('wishlistCount'),
  productView: document.getElementById('productView'),
  cartItems: document.getElementById('cartItems'),
  wishlistItems: document.getElementById('wishlistItems'),
  summaryItems: document.getElementById('summaryItems'),
  summarySubtotal: document.getElementById('summarySubtotal'),
  summaryDiscount: document.getElementById('summaryDiscount'),
  summaryTotal: document.getElementById('summaryTotal'),
  promoInput: document.getElementById('promoInput'),
  promoMessage: document.getElementById('promoMessage'),
  themeToggleBtn: document.getElementById('themeToggleBtn')
};

applyTheme();

function getCategories() {
  return ['Всі', ...new Set(state.products.map(p => p.category))];
}

function getBrands() {
  return ['all', ...new Set(state.products.map(p => p.brand))];
}

function renderBrandOptions() {
  if (!els.brandSelect) return;
  els.brandSelect.innerHTML = getBrands().map(brand => `
    <option value="${brand}">${brand === 'all' ? 'Бренд: всі' : brand}</option>
  `).join('');
  els.brandSelect.value = state.brand;
}

function renderCategories() {
  els.categoryChips.innerHTML = getCategories().map(cat => `
    <button class="chip ${state.activeCategory === cat ? 'active' : ''}" data-category="${cat}">${cat}</button>
  `).join('');
}

function getFilteredProducts() {
  let items = [...state.products];

  if (state.activeCategory !== 'Всі') items = items.filter(p => p.category === state.activeCategory);

  if (state.search.trim()) {
    const q = state.search.toLowerCase();
    items = items.filter(p => [p.title, p.brand, p.category, p.memory, p.color, p.description].join(' ').toLowerCase().includes(q));
  }

  if (state.stock === 'in') items = items.filter(p => Number(p.stock) > 0);
  if (state.stock === 'out') items = items.filter(p => Number(p.stock) <= 0);
  if (state.brand !== 'all') items = items.filter(p => p.brand === state.brand);

  if (state.priceRange !== 'all') {
    const [min, max] = state.priceRange.split('-').map(Number);
    items = items.filter(p => p.price >= min && p.price <= max);
  }

  if (state.sort === 'cheap') items.sort((a,b) => a.price - b.price);
  if (state.sort === 'expensive') items.sort((a,b) => b.price - a.price);
  if (state.sort === 'name') items.sort((a,b) => a.title.localeCompare(b.title, 'uk'));
  if (state.sort === 'popular') items.sort((a,b) => (b.status === 'hit') - (a.status === 'hit') || b.stock - a.stock);

  return items;
}

function renderProducts() {
  const items = getFilteredProducts();
  if (!items.length) {
    els.productsGrid.innerHTML = '<div class="empty" style="grid-column:1/-1;">Нічого не знайдено. Зміни фільтри.</div>';
    return;
  }

  els.productsGrid.innerHTML = items.map(product => {
    const wished = state.wishlist.includes(product.id);
    return `
    <article class="card">
      <div class="card-media">
        <div class="badge-row">
          ${product.status === 'hit' ? '<div class="badge hit">Хіт</div>' : ''}
          ${product.oldPrice ? '<div class="badge sale">Знижка</div>' : ''}
        </div>
        <img src="${product.image}" alt="${product.title}" onerror="this.src='https://via.placeholder.com/700x700?text=SmartZone'" />
      </div>
      <div class="card-body">
        <h3 class="card-title">${product.title}</h3>
        <div class="meta">
          <span>${product.brand}</span>
          <span>•</span>
          <span>${product.memory || 'Без характеристики'}</span>
          <span>•</span>
          <span>${product.color || 'Колір не вказано'}</span>
        </div>
        <div class="price-row">
          <div class="price-wrap">
            <strong>${formatPrice(product.price)}</strong>
            ${product.oldPrice ? `<div class="old-price">${formatPrice(product.oldPrice)}</div>` : ''}
          </div>
          <div class="stock">${Number(product.stock) > 0 ? 'В наявності: ' + product.stock : 'Немає в наявності'}</div>
        </div>
        <div class="card-actions">
          <button class="ghost-btn" onclick="openProduct('${product.id}')">Детальніше</button>
          <button class="ghost-btn fav-btn ${wished ? 'active' : ''}" onclick="toggleWishlist('${product.id}')">${wished ? '♥' : '♡'}</button>
          <button class="primary-btn" onclick="addToCart('${product.id}')" ${Number(product.stock) <= 0 ? 'disabled' : ''}>Купити</button>
        </div>
      </div>
    </article>`;
  }).join('');
}

function recommendationList(currentId, category) {
  return state.products.filter(p => p.id !== currentId && p.category === category).slice(0, 3);
}

function openProduct(id) {
  const product = state.products.find(p => p.id === id);
  if (!product) return;
  const wished = state.wishlist.includes(product.id);
  const recs = recommendationList(product.id, product.category);

  els.productView.innerHTML = `
    <div class="gallery">
      <img src="${product.image}" alt="${product.title}" onerror="this.src='https://via.placeholder.com/700x700?text=SmartZone'" />
    </div>
    <div class="details">
      <div class="badge-row" style="position:static; margin-bottom:12px;">
        <div class="badge">${product.category}</div>
        ${product.status === 'hit' ? '<div class="badge hit">Хіт</div>' : ''}
        ${product.oldPrice ? '<div class="badge sale">Акція</div>' : ''}
      </div>
      <h2 style="margin:0 0 12px; font-size:34px;">${product.title}</h2>
      <p style="color:var(--muted); margin:0 0 16px;">${product.description}</p>
      <div class="meta" style="font-size:14px; margin-bottom:16px;">
        <span><strong>Бренд:</strong> ${product.brand}</span>
        <span>•</span>
        <span><strong>Пам'ять:</strong> ${product.memory || '—'}</span>
        <span>•</span>
        <span><strong>Колір:</strong> ${product.color || '—'}</span>
      </div>
      <div class="price-row" style="margin-bottom:18px;">
        <div class="price-wrap">
          <strong style="font-size:36px;">${formatPrice(product.price)}</strong>
          ${product.oldPrice ? `<div class="old-price">${formatPrice(product.oldPrice)}</div>` : ''}
        </div>
        <div class="stock">${Number(product.stock) > 0 ? 'Є на складі: ' + product.stock : 'Немає в наявності'}</div>
      </div>
      <div class="card-actions" style="margin-bottom:16px;">
        <button class="primary-btn" onclick="addToCart('${product.id}'); closeOverlay('productModal');" ${Number(product.stock) <= 0 ? 'disabled' : ''}>Додати в кошик</button>
        <button class="ghost-btn fav-btn ${wished ? 'active' : ''}" onclick="toggleWishlist('${product.id}')">${wished ? 'У вибраному ♥' : 'У вибране ♡'}</button>
      </div>
      <div class="glass" style="padding:14px; border-radius:20px; margin-bottom:16px;">
        <strong>Рейтинг:</strong> ★★★★★
        <div class="meta" style="margin-top:8px;">Швидка доставка • Гарантія • Оригінальний товар</div>
      </div>
      ${recs.length ? `
        <div class="glass" style="padding:14px; border-radius:20px;">
          <strong>Схожі товари</strong>
          <div style="display:grid; gap:8px; margin-top:10px;">
            ${recs.map(r => `<button class="ghost-btn" style="text-align:left;" onclick="openProduct('${r.id}')">${r.title} — ${formatPrice(r.price)}</button>`).join('')}
          </div>
        </div>
      ` : ''}
    </div>
  `;
  document.getElementById('productModal').classList.add('active');
}

function closeOverlay(id) {
  document.getElementById(id).classList.remove('active');
}

function addToCart(id) {
  const product = state.products.find(p => p.id === id);
  if (!product || Number(product.stock) <= 0) return;
  const existing = state.cart.find(item => item.id === id);
  if (existing) {
    if (existing.qty < product.stock) existing.qty += 1;
  } else {
    state.cart.push({ id, qty: 1 });
  }
  setCart(state.cart);
  renderCart();
  showToast('Товар додано', product.title + ' вже у кошику.');
}

function toggleWishlist(id) {
  if (state.wishlist.includes(id)) {
    state.wishlist = state.wishlist.filter(x => x !== id);
  } else {
    state.wishlist.push(id);
  }
  setWishlist(state.wishlist);
  renderWishlist();
  renderProducts();
  showToast('Список бажань', 'Оновлено список вибраного.');
}

function renderWishlist() {
  els.wishlistCount.textContent = state.wishlist.length;
  const items = state.wishlist.map(id => state.products.find(p => p.id === id)).filter(Boolean);

  if (!items.length) {
    els.wishlistItems.innerHTML = '<div class="empty">Список бажань порожній.</div>';
    return;
  }

  els.wishlistItems.innerHTML = `<div class="cart-list">${items.map(item => `
    <div class="cart-item">
      <img src="${item.image}" alt="${item.title}" onerror="this.src='https://via.placeholder.com/700x700?text=SmartZone'" />
      <div>
        <strong>${item.title}</strong>
        <div class="meta" style="margin:6px 0 0;">${item.brand} • ${item.memory || '—'} • ${formatPrice(item.price)}</div>
      </div>
      <div style="display:grid; gap:8px;">
        <button class="primary-btn" onclick="addToCart('${item.id}')">У кошик</button>
        <button class="danger-btn" onclick="toggleWishlist('${item.id}')">Прибрати</button>
      </div>
    </div>
  `).join('')}</div>`;
}

function changeQty(id, delta) {
  const item = state.cart.find(i => i.id === id);
  const product = state.products.find(p => p.id === id);
  if (!item || !product) return;
  item.qty += delta;
  if (item.qty <= 0) state.cart = state.cart.filter(i => i.id !== id);
  if (item.qty > product.stock) item.qty = product.stock;
  setCart(state.cart);
  renderCart();
}

function removeFromCart(id) {
  state.cart = state.cart.filter(i => i.id !== id);
  setCart(state.cart);
  renderCart();
  showToast('Кошик оновлено', 'Товар видалено з кошика.');
}

function getCartDetailed() {
  return state.cart.map(item => {
    const product = state.products.find(p => p.id === item.id);
    return product ? { ...product, qty: item.qty, total: product.price * item.qty } : null;
  }).filter(Boolean);
}

function getDiscount(subtotal) {
  const code = (state.promoCode || '').toUpperCase();
  const promo = PROMO_CODES[code];
  if (!promo) return 0;
  if (promo.type === 'percent') return Math.round(subtotal * promo.value / 100);
  if (promo.type === 'fixed') return Math.min(subtotal, promo.value);
  return 0;
}

function renderCart() {
  const cart = getCartDetailed();
  const itemsCount = cart.reduce((acc, item) => acc + item.qty, 0);
  const subtotal = cart.reduce((acc, item) => acc + item.total, 0);
  const discount = getDiscount(subtotal);
  const total = Math.max(0, subtotal - discount);

  els.cartCount.textContent = itemsCount;
  els.summaryItems.textContent = itemsCount;
  els.summarySubtotal.textContent = formatPrice(subtotal);
  els.summaryDiscount.textContent = formatPrice(discount);
  els.summaryTotal.textContent = formatPrice(total);
  if (els.promoInput) els.promoInput.value = state.promoCode || '';

  if (!cart.length) {
    els.cartItems.innerHTML = '<div class="empty">Кошик порожній. Додай товари з каталогу.</div>';
    return;
  }

  els.cartItems.innerHTML = `<div class="cart-list">${cart.map(item => `
    <div class="cart-item">
      <img src="${item.image}" alt="${item.title}" onerror="this.src='https://via.placeholder.com/700x700?text=SmartZone'" />
      <div>
        <strong>${item.title}</strong>
        <div class="meta" style="margin:6px 0 0;">${item.brand} • ${item.memory || '—'} • ${item.color || '—'}</div>
        <div class="qty">
          <button class="icon-btn" onclick="changeQty('${item.id}', -1)">−</button>
          <strong>${item.qty}</strong>
          <button class="icon-btn" onclick="changeQty('${item.id}', 1)">+</button>
          <button class="danger-btn" onclick="removeFromCart('${item.id}')">Видалити</button>
        </div>
      </div>
      <strong>${formatPrice(item.total)}</strong>
    </div>
  `).join('')}</div>`;
}

function submitOrder(formElement, isCartOrder = false) {
  const form = new FormData(formElement);
  const orders = getOrders();
  const cart = getCartDetailed();
  const subtotal = cart.reduce((acc, item) => acc + item.total, 0);
  const discount = isCartOrder ? getDiscount(subtotal) : 0;
  const total = isCartOrder ? Math.max(0, subtotal - discount) : 0;

  const order = {
    id: createOrderId(),
    createdAt: new Date().toISOString(),
    status: defaultOrderStatus(),
    customer: {
      name: form.get('name') || '',
      phone: form.get('phone') || '',
      city: form.get('city') || '',
      email: form.get('email') || '',
      comment: form.get('comment') || ''
    },
    promoCode: state.promoCode || '',
    items: isCartOrder ? cart : [],
    total,
    type: isCartOrder ? 'cart' : 'quick'
  };

  orders.unshift(order);
  setOrders(orders);
  formElement.reset();

  if (isCartOrder) {
    state.cart = [];
    setCart(state.cart);
    state.promoCode = '';
    setPromoCode('');
    renderCart();
    closeOverlay('cartDrawer');
  }

  showToast('Замовлення прийнято', 'Номер замовлення: ' + order.id);
}

function applyPromo() {
  const code = String(els.promoInput.value || '').trim().toUpperCase();
  if (!code) {
    state.promoCode = '';
    setPromoCode('');
    els.promoMessage.textContent = 'Промокод очищено.';
    renderCart();
    return;
  }

  if (!PROMO_CODES[code]) {
    els.promoMessage.textContent = 'Промокод не знайдено.';
    showToast('Промокод', 'Невірний код.');
    return;
  }

  state.promoCode = code;
  setPromoCode(code);
  els.promoMessage.textContent = 'Промокод ' + code + ' застосовано.';
  renderCart();
  showToast('Промокод активовано', code);
}

function applyTheme() {
  document.body.classList.toggle('light', state.theme === 'light');
  if (els.themeToggleBtn) els.themeToggleBtn.textContent = state.theme === 'light' ? '☾' : '☼';
}

function toggleTheme() {
  state.theme = state.theme === 'light' ? 'dark' : 'light';
  setTheme(state.theme);
  applyTheme();
}

function renderAll() {
  state.products = getProducts();
  state.cart = getCart();
  state.wishlist = getWishlist();
  renderBrandOptions();
  renderCategories();
  renderProducts();
  renderCart();
  renderWishlist();
}

document.addEventListener('click', (e) => {
  const category = e.target.closest('[data-category]');
  if (category) {
    state.activeCategory = category.dataset.category;
    renderCategories();
    renderProducts();
  }
  const closer = e.target.closest('[data-close]');
  if (closer) closeOverlay(closer.dataset.close);
});

document.getElementById('openCartBtn').addEventListener('click', () => {
  document.getElementById('cartDrawer').classList.add('active');
});
document.getElementById('wishlistBtn').addEventListener('click', () => {
  document.getElementById('wishlistDrawer').classList.add('active');
});
document.getElementById('resetFiltersBtn').addEventListener('click', () => {
  state.search = '';
  state.sort = 'popular';
  state.stock = 'all';
  state.brand = 'all';
  state.priceRange = 'all';
  state.activeCategory = 'Всі';
  els.searchInput.value = '';
  els.sortSelect.value = 'popular';
  els.stockSelect.value = 'all';
  els.brandSelect.value = 'all';
  els.priceSelect.value = 'all';
  renderAll();
});

els.searchInput.addEventListener('input', (e) => { state.search = e.target.value; renderProducts(); });
els.sortSelect.addEventListener('change', (e) => { state.sort = e.target.value; renderProducts(); });
els.stockSelect.addEventListener('change', (e) => { state.stock = e.target.value; renderProducts(); });
els.brandSelect.addEventListener('change', (e) => { state.brand = e.target.value; renderProducts(); });
els.priceSelect.addEventListener('change', (e) => { state.priceRange = e.target.value; renderProducts(); });
document.getElementById('applyPromoBtn').addEventListener('click', applyPromo);
els.themeToggleBtn.addEventListener('click', toggleTheme);

document.getElementById('quickOrderForm').addEventListener('submit', (e) => {
  e.preventDefault();
  submitOrder(e.target, false);
});
document.getElementById('cartOrderForm').addEventListener('submit', (e) => {
  e.preventDefault();
  if (!state.cart.length) {
    showToast('Кошик порожній', 'Спочатку додай хоча б один товар.');
    return;
  }
  submitOrder(e.target, true);
});

// Hidden admin access:
// 1) small diamond button in bottom-left
// 2) or tap the logo 5 times quickly
const hiddenAdminTrigger = document.getElementById('hiddenAdminTrigger');
if (hiddenAdminTrigger) {
  hiddenAdminTrigger.addEventListener('click', () => {
    window.location.href = 'admin-login.html';
  });
}

const brandLink = document.getElementById('brandLink');
let brandTapCount = 0;
let brandTapTimer = null;
if (brandLink) {
  brandLink.addEventListener('click', (e) => {
    e.preventDefault();
    brandTapCount += 1;
    if (brandTapTimer) clearTimeout(brandTapTimer);
    if (brandTapCount >= 5) {
      brandLink.classList.add('secret-armed');
      showToast('Secret mode', 'Відкриваємо вхід в адмінку...');
      setTimeout(() => { window.location.href = 'admin-login.html'; }, 500);
      brandTapCount = 0;
      return;
    }
    brandTapTimer = setTimeout(() => {
      brandTapCount = 0;
      brandLink.classList.remove('secret-armed');
    }, 1200);
  });
}

renderAll();

window.openProduct = openProduct;
window.addToCart = addToCart;
window.changeQty = changeQty;
window.removeFromCart = removeFromCart;
window.closeOverlay = closeOverlay;
window.toggleWishlist = toggleWishlist;
