const STORAGE_KEYS = {
  products: 'smartzone_products_v2',
  cart: 'smartzone_cart_v2',
  orders: 'smartzone_orders_v2',
  admin: 'smartzone_admin_v2'
};

const defaultProducts = [
  {
    id: crypto.randomUUID(),
    title: 'iPhone 15 Pro Max',
    brand: 'Apple',
    category: 'Смартфони',
    image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80',
    price: 58999,
    oldPrice: 62999,
    memory: '256 GB',
    color: 'Titanium',
    stock: 8,
    status: 'hit',
    description: 'Преміальний флагман з потужною камерою, яскравим дисплеєм і топовою продуктивністю.'
  },
  {
    id: crypto.randomUUID(),
    title: 'Samsung Galaxy S25 Ultra',
    brand: 'Samsung',
    category: 'Смартфони',
    image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=800&q=80',
    price: 54999,
    oldPrice: 57999,
    memory: '512 GB',
    color: 'Graphite',
    stock: 6,
    status: 'sale',
    description: 'Флагманський смартфон Samsung з великим дисплеєм, стилусом і професійною камерою.'
  },
  {
    id: crypto.randomUUID(),
    title: 'Xiaomi 14',
    brand: 'Xiaomi',
    category: 'Смартфони',
    image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&q=80',
    price: 28999,
    oldPrice: 30999,
    memory: '256 GB',
    color: 'Black',
    stock: 11,
    status: 'sale',
    description: 'Потужний смартфон з відмінним балансом ціни, дизайну та характеристик.'
  },
  {
    id: crypto.randomUUID(),
    title: 'AirPods Pro 2',
    brand: 'Apple',
    category: 'Навушники',
    image: 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?auto=format&fit=crop&w=800&q=80',
    price: 10499,
    oldPrice: 11999,
    memory: 'ANC',
    color: 'White',
    stock: 15,
    status: 'hit',
    description: 'Бездротові навушники з шумопоглинанням, просторовим аудіо і зручним кейсом.'
  },
  {
    id: crypto.randomUUID(),
    title: 'Galaxy Watch 7',
    brand: 'Samsung',
    category: 'Смарт-годинники',
    image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=800&q=80',
    price: 12999,
    oldPrice: 0,
    memory: '44 mm',
    color: 'Silver',
    stock: 9,
    status: 'hit',
    description: 'Стильний смарт-годинник для спорту, дзвінків, сповіщень і контролю здоров’я.'
  },
  {
    id: crypto.randomUUID(),
    title: 'Power Bank 20000 mAh',
    brand: 'Baseus',
    category: 'Аксесуари',
    image: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=800&q=80',
    price: 1699,
    oldPrice: 1999,
    memory: 'Fast Charge',
    color: 'Black',
    stock: 20,
    status: 'sale',
    description: 'Ємний павербанк для смартфонів, планшетів та аксесуарів з підтримкою швидкої зарядки.'
  }
];

const state = {
  products: loadProducts(),
  cart: loadJson(STORAGE_KEYS.cart, []),
  activeCategory: 'Всі',
  search: '',
  sort: 'popular',
  stock: 'all',
  admin: loadJson(STORAGE_KEYS.admin, { loggedIn: false }),
  editingId: null
};

const els = {
  productsGrid: document.getElementById('productsGrid'),
  categoryChips: document.getElementById('categoryChips'),
  searchInput: document.getElementById('searchInput'),
  sortSelect: document.getElementById('sortSelect'),
  stockSelect: document.getElementById('stockSelect'),
  cartCount: document.getElementById('cartCount'),
  productModal: document.getElementById('productModal'),
  productView: document.getElementById('productView'),
  cartDrawer: document.getElementById('cartDrawer'),
  cartItems: document.getElementById('cartItems'),
  summaryItems: document.getElementById('summaryItems'),
  summarySubtotal: document.getElementById('summarySubtotal'),
  summaryTotal: document.getElementById('summaryTotal'),
  adminLocked: document.getElementById('adminLocked'),
  adminUnlocked: document.getElementById('adminUnlocked'),
  adminProducts: document.getElementById('adminProducts'),
  productForm: document.getElementById('productForm'),
  toast: document.getElementById('toast'),
  toastTitle: document.getElementById('toastTitle'),
  toastText: document.getElementById('toastText')
};

function loadJson(key, fallback) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
}

function saveJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function loadProducts() {
  const saved = loadJson(STORAGE_KEYS.products, null);
  if (saved && Array.isArray(saved) && saved.length) return saved;
  saveJson(STORAGE_KEYS.products, defaultProducts);
  return defaultProducts;
}

function formatPrice(value) {
  return new Intl.NumberFormat('uk-UA').format(Number(value || 0)) + ' грн';
}

function showToast(title, text) {
  els.toastTitle.textContent = title;
  els.toastText.textContent = text;
  els.toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => els.toast.classList.remove('show'), 2600);
}

function getCategories() {
  const dynamic = [...new Set(state.products.map(p => p.category))];
  return ['Всі', ...dynamic];
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

  if (state.sort === 'cheap') items.sort((a,b) => a.price - b.price);
  if (state.sort === 'expensive') items.sort((a,b) => b.price - a.price);
  if (state.sort === 'name') items.sort((a,b) => a.title.localeCompare(b.title, 'uk'));
  if (state.sort === 'popular') items.sort((a,b) => (b.status === 'hit') - (a.status === 'hit') || b.stock - a.stock);

  return items;
}

function renderProducts() {
  const items = getFilteredProducts();
  if (!items.length) {
    els.productsGrid.innerHTML = '<div class="empty" style="grid-column:1/-1;">Нічого не знайдено. Зміни фільтри або додай товар в адмінці.</div>';
    return;
  }

  els.productsGrid.innerHTML = items.map(product => `
    <article class="card">
      <div class="card-media">
        <div class="badge-row">
          ${product.status === 'hit' ? '<div class="badge hit">Хіт</div>' : ''}
          ${product.oldPrice ? '<div class="badge sale">Знижка</div>' : ''}
        </div>
        <img src="${product.image}" alt="${product.title}" onerror="this.src='https://via.placeholder.com/500x500?text=SmartZone'" />
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
          <button class="primary-btn" onclick="addToCart('${product.id}')" ${Number(product.stock) <= 0 ? 'disabled' : ''}>Купити</button>
        </div>
      </div>
    </article>
  `).join('');
}

function openProduct(id) {
  const product = state.products.find(p => p.id === id);
  if (!product) return;
  els.productView.innerHTML = `
    <div class="gallery">
      <img src="${product.image}" alt="${product.title}" onerror="this.src='https://via.placeholder.com/500x500?text=SmartZone'" />
    </div>
    <div class="details">
      <div class="badge-row" style="position:static; margin-bottom:12px;">
        <div class="badge">${product.category}</div>
        ${product.status === 'hit' ? '<div class="badge hit">Хіт</div>' : ''}
        ${product.oldPrice ? '<div class="badge sale">Акція</div>' : ''}
      </div>
      <h2 style="margin:0 0 12px; font-size:32px;">${product.title}</h2>
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
          <strong style="font-size:34px;">${formatPrice(product.price)}</strong>
          ${product.oldPrice ? `<div class="old-price">${formatPrice(product.oldPrice)}</div>` : ''}
        </div>
        <div class="stock">${Number(product.stock) > 0 ? 'Є на складі: ' + product.stock : 'Немає в наявності'}</div>
      </div>
      <div class="card-actions">
        <button class="primary-btn" onclick="addToCart('${product.id}'); closeOverlay('productModal');" ${Number(product.stock) <= 0 ? 'disabled' : ''}>Додати в кошик</button>
        <button class="ghost-btn" onclick="closeOverlay('productModal')">Закрити</button>
      </div>
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
  saveJson(STORAGE_KEYS.cart, state.cart);
  renderCart();
  showToast('Товар додано', product.title + ' вже у кошику.');
}

function changeQty(id, delta) {
  const item = state.cart.find(i => i.id === id);
  const product = state.products.find(p => p.id === id);
  if (!item || !product) return;
  item.qty += delta;
  if (item.qty <= 0) state.cart = state.cart.filter(i => i.id !== id);
  if (item.qty > product.stock) item.qty = product.stock;
  saveJson(STORAGE_KEYS.cart, state.cart);
  renderCart();
}

function removeFromCart(id) {
  state.cart = state.cart.filter(i => i.id !== id);
  saveJson(STORAGE_KEYS.cart, state.cart);
  renderCart();
  showToast('Кошик оновлено', 'Товар видалено з кошика.');
}

function getCartDetailed() {
  return state.cart.map(item => {
    const product = state.products.find(p => p.id === item.id);
    return product ? { ...product, qty: item.qty, total: product.price * item.qty } : null;
  }).filter(Boolean);
}

function renderCart() {
  const cart = getCartDetailed();
  const itemsCount = cart.reduce((acc, item) => acc + item.qty, 0);
  const total = cart.reduce((acc, item) => acc + item.total, 0);
  els.cartCount.textContent = itemsCount;
  els.summaryItems.textContent = itemsCount;
  els.summarySubtotal.textContent = formatPrice(total);
  els.summaryTotal.textContent = formatPrice(total);

  if (!cart.length) {
    els.cartItems.innerHTML = '<div class="empty">Кошик порожній. Додай товари з каталогу.</div>';
    return;
  }

  els.cartItems.innerHTML = `<div class="cart-list">${cart.map(item => `
    <div class="cart-item">
      <img src="${item.image}" alt="${item.title}" onerror="this.src='https://via.placeholder.com/500x500?text=SmartZone'" />
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

function renderAdminProducts() {
  if (!state.admin.loggedIn) return;
  if (!state.products.length) {
    els.adminProducts.innerHTML = '<div class="empty">Немає товарів.</div>';
    return;
  }
  els.adminProducts.innerHTML = state.products.map(product => `
    <div class="admin-item">
      <img src="${product.image}" alt="${product.title}" onerror="this.src='https://via.placeholder.com/500x500?text=SmartZone'" />
      <div>
        <strong>${product.title}</strong>
        <div class="meta" style="margin:6px 0 0;">${product.category} • ${product.brand} • ${formatPrice(product.price)} • Склад: ${product.stock}</div>
      </div>
      <div style="display:flex; gap:8px; flex-wrap:wrap; justify-content:flex-end;">
        <button class="ghost-btn" onclick="editProduct('${product.id}')">Редагувати</button>
        <button class="danger-btn" onclick="deleteProduct('${product.id}')">Видалити</button>
      </div>
    </div>
  `).join('');
}

function syncAdminView() {
  els.adminLocked.classList.toggle('hidden', !!state.admin.loggedIn);
  els.adminUnlocked.classList.toggle('hidden', !state.admin.loggedIn);
  saveJson(STORAGE_KEYS.admin, state.admin);
  if (state.admin.loggedIn) renderAdminProducts();
}

function editProduct(id) {
  const product = state.products.find(p => p.id === id);
  if (!product) return;
  state.editingId = id;
  const form = els.productForm;
  form.title.value = product.title;
  form.brand.value = product.brand;
  form.category.value = product.category;
  form.image.value = product.image;
  form.price.value = product.price;
  form.oldPrice.value = product.oldPrice || '';
  form.memory.value = product.memory || '';
  form.color.value = product.color || '';
  form.stock.value = product.stock;
  form.status.value = product.status || '';
  form.description.value = product.description || '';
  form.productId.value = id;
  showToast('Режим редагування', 'Товар завантажено у форму.');
  document.getElementById('adminSection').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function deleteProduct(id) {
  const product = state.products.find(p => p.id === id);
  if (!product) return;
  state.products = state.products.filter(p => p.id !== id);
  state.cart = state.cart.filter(i => i.id !== id);
  saveJson(STORAGE_KEYS.products, state.products);
  saveJson(STORAGE_KEYS.cart, state.cart);
  renderAll();
  showToast('Товар видалено', product.title + ' було видалено.');
}

function exportProducts() {
  const blob = new Blob([JSON.stringify(state.products, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'smartzone-products.json';
  a.click();
  URL.revokeObjectURL(url);
  showToast('Експорт готовий', 'Файл товарів завантажено.');
}

function saveProductFromForm(event) {
  event.preventDefault();
  const form = new FormData(event.target);
  const payload = Object.fromEntries(form.entries());
  const product = {
    id: payload.productId || crypto.randomUUID(),
    title: payload.title.trim(),
    brand: payload.brand.trim(),
    category: payload.category,
    image: payload.image.trim(),
    price: Number(payload.price || 0),
    oldPrice: Number(payload.oldPrice || 0),
    memory: payload.memory.trim(),
    color: payload.color.trim(),
    stock: Number(payload.stock || 0),
    status: payload.status,
    description: payload.description.trim()
  };

  const existingIndex = state.products.findIndex(p => p.id === product.id);
  if (existingIndex >= 0) {
    state.products[existingIndex] = product;
    showToast('Товар оновлено', product.title + ' успішно збережено.');
  } else {
    state.products.unshift(product);
    showToast('Товар додано', product.title + ' додано до каталогу.');
  }

  saveJson(STORAGE_KEYS.products, state.products);
  state.editingId = null;
  event.target.reset();
  event.target.productId.value = '';
  renderAll();
}

function submitOrder(formElement, isCartOrder = false) {
  const form = new FormData(formElement);
  const orders = loadJson(STORAGE_KEYS.orders, []);
  const cart = getCartDetailed();
  const order = {
    id: 'SZ-' + Date.now(),
    createdAt: new Date().toISOString(),
    customer: Object.fromEntries(form.entries()),
    items: isCartOrder ? cart : [],
    total: isCartOrder ? cart.reduce((a,b) => a + b.total, 0) : 0,
    type: isCartOrder ? 'cart' : 'quick'
  };
  orders.unshift(order);
  saveJson(STORAGE_KEYS.orders, orders);
  formElement.reset();

  if (isCartOrder) {
    state.cart = [];
    saveJson(STORAGE_KEYS.cart, state.cart);
    renderCart();
    closeOverlay('cartDrawer');
  }

  showToast('Замовлення прийнято', 'Дякуємо! Заявку збережено. Номер: ' + order.id);
}

function renderAll() {
  renderCategories();
  renderProducts();
  renderCart();
  renderAdminProducts();
  syncAdminView();
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

document.getElementById('openAdminBtn').addEventListener('click', () => {
  document.getElementById('adminSection').scrollIntoView({ behavior: 'smooth' });
});

document.getElementById('scrollAdminBtn').addEventListener('click', () => {
  document.getElementById('adminSection').scrollIntoView({ behavior: 'smooth' });
});

document.getElementById('resetFiltersBtn').addEventListener('click', () => {
  state.search = '';
  state.sort = 'popular';
  state.stock = 'all';
  state.activeCategory = 'Всі';
  els.searchInput.value = '';
  els.sortSelect.value = 'popular';
  els.stockSelect.value = 'all';
  renderAll();
});

els.searchInput.addEventListener('input', (e) => {
  state.search = e.target.value;
  renderProducts();
});

els.sortSelect.addEventListener('change', (e) => {
  state.sort = e.target.value;
  renderProducts();
});

els.stockSelect.addEventListener('change', (e) => {
  state.stock = e.target.value;
  renderProducts();
});

document.getElementById('loginAdminBtn').addEventListener('click', () => {
  const password = document.getElementById('adminPassword').value.trim();
  if (password === '1234') {
    state.admin.loggedIn = true;
    syncAdminView();
    showToast('Вхід виконано', 'Ти увійшов в адмінку SmartZone.');
  } else {
    showToast('Невірний пароль', 'Спробуй пароль 1234 для демо.');
  }
});

document.getElementById('logoutAdminBtn').addEventListener('click', () => {
  state.admin.loggedIn = false;
  syncAdminView();
  showToast('Вихід виконано', 'Адмінка заблокована.');
});

document.getElementById('exportProductsBtn').addEventListener('click', exportProducts);

document.getElementById('resetProductsBtn').addEventListener('click', () => {
  state.products = JSON.parse(JSON.stringify(defaultProducts));
  saveJson(STORAGE_KEYS.products, state.products);
  renderAll();
  showToast('Скидання виконано', 'Товари повернуті до стандартних.');
});

els.productForm.addEventListener('submit', saveProductFromForm);

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

renderAll();

window.openProduct = openProduct;
window.addToCart = addToCart;
window.changeQty = changeQty;
window.removeFromCart = removeFromCart;
window.closeOverlay = closeOverlay;
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
