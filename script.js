const state = {
  products: getProducts(),
  cart: getCart(),
  activeCategory: 'Всі',
  search: '',
  sort: 'popular',
  stock: 'all'
};

const els = {
  productsGrid: document.getElementById('productsGrid'),
  categoryChips: document.getElementById('categoryChips'),
  searchInput: document.getElementById('searchInput'),
  sortSelect: document.getElementById('sortSelect'),
  stockSelect: document.getElementById('stockSelect'),
  cartCount: document.getElementById('cartCount'),
  productView: document.getElementById('productView'),
  cartItems: document.getElementById('cartItems'),
  summaryItems: document.getElementById('summaryItems'),
  summarySubtotal: document.getElementById('summarySubtotal'),
  summaryTotal: document.getElementById('summaryTotal')
};

function getCategories() {
  return ['Всі', ...new Set(state.products.map(p => p.category))];
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
    els.productsGrid.innerHTML = '<div class="empty" style="grid-column:1/-1;">Нічого не знайдено. Зміни фільтри.</div>';
    return;
  }

  els.productsGrid.innerHTML = items.map(product => `
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

  setCart(state.cart);
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
    items: isCartOrder ? cart : [],
    total: isCartOrder ? cart.reduce((a,b) => a + b.total, 0) : 0,
    type: isCartOrder ? 'cart' : 'quick'
  };

  orders.unshift(order);
  setOrders(orders);
  formElement.reset();

  if (isCartOrder) {
    state.cart = [];
    setCart(state.cart);
    renderCart();
    closeOverlay('cartDrawer');
  }

  showToast('Замовлення прийнято', 'Номер замовлення: ' + order.id);
}

function renderAll() {
  state.products = getProducts();
  state.cart = getCart();
  renderCategories();
  renderProducts();
  renderCart();
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

els.searchInput.addEventListener('input', (e) => { state.search = e.target.value; renderProducts(); });
els.sortSelect.addEventListener('change', (e) => { state.sort = e.target.value; renderProducts(); });
els.stockSelect.addEventListener('change', (e) => { state.stock = e.target.value; renderProducts(); });

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
