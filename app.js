const defaultProducts = [
  {
    id: 1,
    name: 'iPhone 15 Pro 256GB',
    category: 'Смартфони',
    price: 54999,
    stock: 7,
    featured: true,
    image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=900&q=80',
    description: 'Преміальний смартфон з потужною камерою, титановим корпусом і неймовірною продуктивністю.'
  },
  {
    id: 2,
    name: 'Samsung Galaxy S24 Ultra',
    category: 'Смартфони',
    price: 48999,
    stock: 5,
    featured: true,
    image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=900&q=80',
    description: 'Флагманський Android-смартфон з великим екраном, стилусом та топовою автономністю.'
  },
  {
    id: 3,
    name: 'AirPods Pro 2',
    category: 'Навушники',
    price: 10999,
    stock: 12,
    featured: true,
    image: 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?auto=format&fit=crop&w=900&q=80',
    description: 'Бездротові навушники з активним шумозаглушенням і чистим преміальним звуком.'
  },
  {
    id: 4,
    name: 'Чохол Premium Black',
    category: 'Чохли',
    price: 899,
    stock: 30,
    featured: false,
    image: 'https://images.unsplash.com/photo-1601593346740-925612772716?auto=format&fit=crop&w=900&q=80',
    description: 'Стильний захисний чохол з м’яким покриттям і надійним захистом від ударів.'
  },
  {
    id: 5,
    name: 'Power Bank 20000 mAh',
    category: 'Аксесуари',
    price: 1799,
    stock: 18,
    featured: false,
    image: 'https://images.unsplash.com/photo-1585336261022-680e295ce3fe?auto=format&fit=crop&w=900&q=80',
    description: 'Швидка зарядка для смартфонів, навушників і планшетів у будь-якій ситуації.'
  },
  {
    id: 6,
    name: 'Зарядний блок 35W USB-C',
    category: 'Зарядки',
    price: 1299,
    stock: 24,
    featured: false,
    image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=900&q=80',
    description: 'Компактний адаптер швидкої зарядки для сучасних смартфонів та аксесуарів.'
  },
  {
    id: 7,
    name: 'Xiaomi Redmi Note 14 Pro',
    category: 'Смартфони',
    price: 16999,
    stock: 9,
    featured: false,
    image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=900&q=80',
    description: 'Стильний смартфон з яскравим екраном, великою батареєю та хорошою камерою.'
  },
  {
    id: 8,
    name: 'MagSafe зарядка',
    category: 'Зарядки',
    price: 1599,
    stock: 16,
    featured: false,
    image: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=900&q=80',
    description: 'Магнітна бездротова зарядка для швидкого і зручного підживлення iPhone.'
  }
];

const state = {
  products: loadProducts(),
  cart: loadLS('smartzone_cart', []),
  favorites: loadLS('smartzone_favorites', []),
  currentCategory: 'all',
  search: '',
  sort: 'popular'
};

function loadLS(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}

function saveLS(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function loadProducts() {
  const saved = loadLS('smartzone_products', null);
  if (saved && Array.isArray(saved) && saved.length) return saved;
  saveLS('smartzone_products', defaultProducts);
  return defaultProducts;
}

const productsGrid = document.getElementById('productsGrid');
const featuredGrid = document.getElementById('featuredGrid');
const categoryNav = document.getElementById('categoryNav');
const categoryFilter = document.getElementById('categoryFilter');
const sortSelect = document.getElementById('sortSelect');
const searchInput = document.getElementById('searchInput');
const searchForm = document.getElementById('searchForm');
const cartCount = document.getElementById('cartCount');
const favoritesCount = document.getElementById('favoritesCount');
const cartDrawer = document.getElementById('cartDrawer');
const favoritesDrawer = document.getElementById('favoritesDrawer');
const cartItems = document.getElementById('cartItems');
const favoritesItems = document.getElementById('favoritesItems');
const cartTotal = document.getElementById('cartTotal');
const productModal = document.getElementById('productModal');
const modalContent = document.getElementById('modalContent');
const checkoutModal = document.getElementById('checkoutModal');

function formatPrice(price) {
  return `${Number(price).toLocaleString('uk-UA')} грн`;
}

function getCategories() {
  return ['all', ...new Set(state.products.map(p => p.category))];
}

function renderCategories() {
  const cats = getCategories();
  categoryNav.innerHTML = cats.map(cat => `
    <button class="${state.currentCategory === cat ? 'active' : ''}" data-cat="${cat}">
      ${cat === 'all' ? 'Усі товари' : cat}
    </button>
  `).join('');

  categoryFilter.innerHTML = cats.map(cat => `
    <option value="${cat}" ${state.currentCategory === cat ? 'selected' : ''}>
      ${cat === 'all' ? 'Усі категорії' : cat}
    </option>
  `).join('');

  categoryNav.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => {
      state.currentCategory = btn.dataset.cat;
      renderAll();
    });
  });
}

function getFilteredProducts() {
  let products = [...state.products];

  if (state.currentCategory !== 'all') {
    products = products.filter(p => p.category === state.currentCategory);
  }

  if (state.search.trim()) {
    const q = state.search.trim().toLowerCase();
    products = products.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q)
    );
  }

  switch (state.sort) {
    case 'cheap':
      products.sort((a, b) => a.price - b.price);
      break;
    case 'expensive':
      products.sort((a, b) => b.price - a.price);
      break;
    case 'name':
      products.sort((a, b) => a.name.localeCompare(b.name, 'uk'));
      break;
    default:
      products.sort((a, b) => (b.featured - a.featured) || (b.stock - a.stock));
  }

  return products;
}

function productCard(product) {
  const fav = state.favorites.includes(product.id);
  return `
    <article class="product-card">
      <div class="product-image-wrap">
        <img class="product-image" src="${product.image}" alt="${product.name}" />
        <button class="fav-toggle" data-fav="${product.id}">${fav ? '❤' : '♡'}</button>
      </div>
      <div class="product-content">
        <div class="product-category">${product.category}</div>
        <h3 class="product-title">${product.name}</h3>
        <p class="product-desc">${product.description}</p>
        <div class="product-meta">
          <div>
            <div class="price">${formatPrice(product.price)}</div>
            <div class="stock">В наявності: ${product.stock}</div>
          </div>
        </div>
        <div class="product-actions">
          <button class="btn-outline" data-details="${product.id}">Деталі</button>
          <button class="btn-buy" data-add="${product.id}">В кошик</button>
        </div>
      </div>
    </article>
  `;
}

function renderProducts() {
  const products = getFilteredProducts();
  productsGrid.innerHTML = products.length
    ? products.map(productCard).join('')
    : `<div class="empty-state">Нічого не знайдено. Спробуй інший запит або категорію.</div>`;

  attachProductEvents(productsGrid);
}

function renderFeatured() {
  const featured = state.products.filter(p => p.featured).slice(0, 3);
  featuredGrid.innerHTML = featured.map(productCard).join('');
  attachProductEvents(featuredGrid);
}

function attachProductEvents(scope) {
  scope.querySelectorAll('[data-add]').forEach(btn => {
    btn.addEventListener('click', () => addToCart(Number(btn.dataset.add)));
  });
  scope.querySelectorAll('[data-details]').forEach(btn => {
    btn.addEventListener('click', () => openProductModal(Number(btn.dataset.details)));
  });
  scope.querySelectorAll('[data-fav]').forEach(btn => {
    btn.addEventListener('click', () => toggleFavorite(Number(btn.dataset.fav)));
  });
}

function addToCart(productId) {
  const item = state.cart.find(i => i.id === productId);
  if (item) item.qty += 1;
  else state.cart.push({ id: productId, qty: 1 });
  saveLS('smartzone_cart', state.cart);
  renderCart();
}

function toggleFavorite(productId) {
  if (state.favorites.includes(productId)) {
    state.favorites = state.favorites.filter(id => id !== productId);
  } else {
    state.favorites.push(productId);
  }
  saveLS('smartzone_favorites', state.favorites);
  renderAll();
  renderFavorites();
}

function renderCart() {
  cartCount.textContent = state.cart.reduce((sum, item) => sum + item.qty, 0);

  if (!state.cart.length) {
    cartItems.innerHTML = `<div class="empty-state">Кошик порожній. Додай товари для замовлення.</div>`;
    cartTotal.textContent = '0 грн';
    return;
  }

  const cartProducts = state.cart.map(item => {
    const product = state.products.find(p => p.id === item.id);
    return { ...product, qty: item.qty };
  }).filter(Boolean);

  cartItems.innerHTML = cartProducts.map(item => `
    <div class="cart-item">
      <img src="${item.image}" alt="${item.name}" />
      <div>
        <strong>${item.name}</strong>
        <div class="muted">${formatPrice(item.price)}</div>
        <div class="qty-row">
          <button class="qty-btn" data-qty="minus" data-id="${item.id}">−</button>
          <span>${item.qty}</span>
          <button class="qty-btn" data-qty="plus" data-id="${item.id}">+</button>
        </div>
        <div class="item-actions">
          <button class="mini-btn" data-remove="${item.id}">Видалити</button>
        </div>
      </div>
    </div>
  `).join('');

  const total = cartProducts.reduce((sum, item) => sum + item.price * item.qty, 0);
  cartTotal.textContent = formatPrice(total);

  cartItems.querySelectorAll('[data-qty]').forEach(btn => {
    btn.addEventListener('click', () => changeQty(Number(btn.dataset.id), btn.dataset.qty));
  });
  cartItems.querySelectorAll('[data-remove]').forEach(btn => {
    btn.addEventListener('click', () => removeFromCart(Number(btn.dataset.remove)));
  });
}

function changeQty(id, type) {
  const item = state.cart.find(i => i.id === id);
  if (!item) return;
  item.qty = type === 'plus' ? item.qty + 1 : item.qty - 1;
  state.cart = state.cart.filter(i => i.qty > 0);
  saveLS('smartzone_cart', state.cart);
  renderCart();
}

function removeFromCart(id) {
  state.cart = state.cart.filter(i => i.id !== id);
  saveLS('smartzone_cart', state.cart);
  renderCart();
}

function renderFavorites() {
  favoritesCount.textContent = state.favorites.length;
  const favProducts = state.products.filter(p => state.favorites.includes(p.id));
  favoritesItems.innerHTML = favProducts.length ? favProducts.map(item => `
    <div class="favorite-item">
      <img src="${item.image}" alt="${item.name}" />
      <div>
        <strong>${item.name}</strong>
        <div class="muted">${item.category}</div>
        <div class="price">${formatPrice(item.price)}</div>
        <div class="item-actions">
          <button class="mini-btn" data-open-details="${item.id}">Деталі</button>
          <button class="mini-btn" data-remove-fav="${item.id}">Прибрати</button>
        </div>
      </div>
    </div>
  `).join('') : `<div class="empty-state">Тут поки немає товарів. Додавай улюблені позиції в обране ❤</div>`;

  favoritesItems.querySelectorAll('[data-open-details]').forEach(btn => {
    btn.addEventListener('click', () => openProductModal(Number(btn.dataset.openDetails)));
  });
  favoritesItems.querySelectorAll('[data-remove-fav]').forEach(btn => {
    btn.addEventListener('click', () => toggleFavorite(Number(btn.dataset.removeFav)));
  });
}

function openProductModal(id) {
  const product = state.products.find(p => p.id === id);
  if (!product) return;
  modalContent.innerHTML = `
    <div class="modal-header-row">
      <h3>${product.name}</h3>
      <button class="close-btn" data-close-modal>✕</button>
    </div>
    <div class="modal-product">
      <img src="${product.image}" alt="${product.name}" />
      <div>
        <div class="eyebrow">${product.category}</div>
        <span class="price">${formatPrice(product.price)}</span>
        <p class="muted">${product.description}</p>
        <p>В наявності: <strong>${product.stock}</strong></p>
        <div class="hero-actions">
          <button class="btn btn-primary" id="modalAddBtn">Додати в кошик</button>
          <button class="btn btn-secondary" id="modalFavBtn">${state.favorites.includes(id) ? 'Прибрати з обраного' : 'Додати в обране'}</button>
        </div>
      </div>
    </div>
  `;
  productModal.classList.add('open');
  document.getElementById('modalAddBtn').addEventListener('click', () => {
    addToCart(id);
    productModal.classList.remove('open');
    cartDrawer.classList.add('open');
  });
  document.getElementById('modalFavBtn').addEventListener('click', () => toggleFavorite(id));
  modalContent.querySelector('[data-close-modal]').addEventListener('click', () => productModal.classList.remove('open'));
}

function renderAll() {
  renderCategories();
  renderProducts();
  renderFeatured();
  renderCart();
  renderFavorites();
}

categoryFilter.addEventListener('change', (e) => {
  state.currentCategory = e.target.value;
  renderAll();
});

sortSelect.addEventListener('change', (e) => {
  state.sort = e.target.value;
  renderProducts();
});

searchForm.addEventListener('submit', (e) => {
  e.preventDefault();
  state.search = searchInput.value;
  renderProducts();
});

searchInput.addEventListener('input', () => {
  state.search = searchInput.value;
  renderProducts();
});

document.getElementById('cartBtn').addEventListener('click', () => cartDrawer.classList.add('open'));
document.getElementById('favoritesBtn').addEventListener('click', () => favoritesDrawer.classList.add('open'));
document.querySelectorAll('[data-close-drawer]').forEach(el => el.addEventListener('click', () => cartDrawer.classList.remove('open')));
document.querySelectorAll('[data-close-favorites]').forEach(el => el.addEventListener('click', () => favoritesDrawer.classList.remove('open')));
document.querySelectorAll('[data-close-modal]').forEach(el => el.addEventListener('click', () => productModal.classList.remove('open')));
document.querySelectorAll('[data-close-checkout]').forEach(el => el.addEventListener('click', () => checkoutModal.classList.remove('open')));
document.getElementById('openCheckoutBtn').addEventListener('click', () => {
  if (!state.cart.length) return alert('Кошик порожній.');
  checkoutModal.classList.add('open');
});

document.getElementById('checkoutForm').addEventListener('submit', (e) => {
  e.preventDefault();
  if (!state.cart.length) return;

  const formData = Object.fromEntries(new FormData(e.target).entries());
  const orders = loadLS('smartzone_orders', []);
  orders.unshift({
    id: Date.now(),
    customer: formData,
    items: state.cart.map(item => {
      const p = state.products.find(prod => prod.id === item.id);
      return { id: item.id, qty: item.qty, name: p?.name || 'Товар', price: p?.price || 0 };
    }),
    total: state.cart.reduce((sum, item) => {
      const p = state.products.find(prod => prod.id === item.id);
      return sum + (p?.price || 0) * item.qty;
    }, 0),
    createdAt: new Date().toLocaleString('uk-UA')
  });
  saveLS('smartzone_orders', orders);
  state.cart = [];
  saveLS('smartzone_cart', state.cart);
  renderCart();
  checkoutModal.classList.remove('open');
  cartDrawer.classList.remove('open');
  e.target.reset();
  alert('Замовлення успішно оформлено!');
});

renderAll();
