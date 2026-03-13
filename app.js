const STORAGE_KEYS = {
  products: 'smartzone_products',
  cart: 'smartzone_cart',
  orders: 'smartzone_orders'
};

const defaultProducts = [
  {
    id: crypto.randomUUID(),
    name: 'iPhone 15 Pro 128GB',
    price: 44999,
    image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=900&q=80',
    category: 'Смартфони',
    badge: 'Хіт продажів',
    description: 'Потужний флагман Apple з титановим корпусом, чудовою камерою та USB‑C.',
    popular: true
  },
  {
    id: crypto.randomUUID(),
    name: 'Samsung Galaxy S24',
    price: 35999,
    image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=900&q=80',
    category: 'Смартфони',
    badge: 'Новинка',
    description: 'Яскравий AMOLED дисплей, швидкий процесор та крута камера для щоденного використання.',
    popular: true
  },
  {
    id: crypto.randomUUID(),
    name: 'AirPods Pro',
    price: 9999,
    image: 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f37?auto=format&fit=crop&w=900&q=80',
    category: 'Навушники',
    badge: 'Топ',
    description: 'Бездротові навушники з активним шумозаглушенням та чудовим звуком.',
    popular: true
  },
  {
    id: crypto.randomUUID(),
    name: 'Швидка зарядка 25W USB-C',
    price: 899,
    image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=900&q=80',
    category: 'Зарядки',
    badge: 'Вигідно',
    description: 'Компактний блок живлення для швидкої зарядки смартфонів та аксесуарів.',
    popular: false
  },
  {
    id: crypto.randomUUID(),
    name: 'Силіконовий чохол MagSafe',
    price: 799,
    image: 'https://images.unsplash.com/photo-1601593346740-925612772716?auto=format&fit=crop&w=900&q=80',
    category: 'Чохли',
    badge: 'Рекомендуємо',
    description: 'Міцний та стильний чохол з підтримкою MagSafe.',
    popular: false
  },
  {
    id: crypto.randomUUID(),
    name: 'Power Bank 20000 mAh',
    price: 1699,
    image: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=900&q=80',
    category: 'Аксесуари',
    badge: 'Надійно',
    description: 'Ємний павербанк для подорожей і щоденного використання.',
    popular: true
  }
];

function getProducts() {
  const saved = localStorage.getItem(STORAGE_KEYS.products);
  if (!saved) {
    localStorage.setItem(STORAGE_KEYS.products, JSON.stringify(defaultProducts));
    return defaultProducts;
  }
  return JSON.parse(saved);
}

function saveProducts(products) {
  localStorage.setItem(STORAGE_KEYS.products, JSON.stringify(products));
}

function getCart() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.cart) || '[]');
}

function saveCart(cart) {
  localStorage.setItem(STORAGE_KEYS.cart, JSON.stringify(cart));
}

function getOrders() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.orders) || '[]');
}

function saveOrders(orders) {
  localStorage.setItem(STORAGE_KEYS.orders, JSON.stringify(orders));
}

const productsGrid = document.getElementById('productsGrid');
const categoryFilter = document.getElementById('categoryFilter');
const sortFilter = document.getElementById('sortFilter');
const searchInput = document.getElementById('searchInput');
const quickCategories = document.getElementById('quickCategories');
const cartCount = document.getElementById('cartCount');
const cartItems = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const cartDrawer = document.getElementById('cartDrawer');
const overlay = document.getElementById('overlay');
const checkoutModal = document.getElementById('checkoutModal');

function formatPrice(price) {
  return new Intl.NumberFormat('uk-UA').format(price) + ' ₴';
}

function fillCategories() {
  const products = getProducts();
  const categories = [...new Set(products.map(p => p.category))];
  categoryFilter.innerHTML = '<option value="all">Усі категорії</option>' + categories.map(c => `<option value="${c}">${c}</option>`).join('');
  quickCategories.innerHTML = categories.map(c => `
    <button class="category-chip" onclick="selectCategory('${c.replace(/'/g, "\\'")}')">${c}</button>
  `).join('');
}

function selectCategory(category) {
  categoryFilter.value = category;
  renderProducts();
  document.getElementById('catalog').scrollIntoView({ behavior: 'smooth' });
}
window.selectCategory = selectCategory;
window.scrollToCatalog = () => document.getElementById('catalog').scrollIntoView({ behavior: 'smooth' });

function renderProducts() {
  let products = [...getProducts()];
  const search = searchInput.value.trim().toLowerCase();
  const category = categoryFilter.value;
  const sort = sortFilter.value;

  if (search) {
    products = products.filter(p =>
      p.name.toLowerCase().includes(search) ||
      p.description.toLowerCase().includes(search) ||
      p.category.toLowerCase().includes(search)
    );
  }

  if (category !== 'all') {
    products = products.filter(p => p.category === category);
  }

  if (sort === 'cheap') products.sort((a, b) => a.price - b.price);
  if (sort === 'expensive') products.sort((a, b) => b.price - a.price);
  if (sort === 'name') products.sort((a, b) => a.name.localeCompare(b.name, 'uk'));
  if (sort === 'popular') products.sort((a, b) => Number(b.popular) - Number(a.popular));

  if (!products.length) {
    productsGrid.innerHTML = '<div class="empty-box">Нічого не знайдено. Спробуйте змінити фільтри.</div>';
    return;
  }

  productsGrid.innerHTML = products.map(product => `
    <article class="product-card">
      <div class="product-image-wrap">
        <img src="${product.image}" alt="${product.name}" class="product-image" />
        ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ''}
      </div>
      <div class="product-body">
        <div class="product-category">${product.category}</div>
        <h3>${product.name}</h3>
        <p>${product.description}</p>
        <div class="product-footer">
          <strong>${formatPrice(product.price)}</strong>
          <button class="btn btn-primary" onclick="addToCart('${product.id}')">В кошик</button>
        </div>
      </div>
    </article>
  `).join('');
}

function addToCart(productId) {
  const cart = getCart();
  const products = getProducts();
  const product = products.find(p => p.id === productId);
  if (!product) return;

  const existing = cart.find(item => item.id === productId);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...product, qty: 1 });
  }

  saveCart(cart);
  renderCart();
  openCart();
}
window.addToCart = addToCart;

function changeQty(productId, delta) {
  let cart = getCart();
  cart = cart.map(item => item.id === productId ? { ...item, qty: item.qty + delta } : item)
             .filter(item => item.qty > 0);
  saveCart(cart);
  renderCart();
}
window.changeQty = changeQty;

function removeFromCart(productId) {
  const cart = getCart().filter(item => item.id !== productId);
  saveCart(cart);
  renderCart();
}
window.removeFromCart = removeFromCart;

function renderCart() {
  const cart = getCart();
  cartCount.textContent = cart.reduce((sum, item) => sum + item.qty, 0);

  if (!cart.length) {
    cartItems.innerHTML = '<div class="empty-box small">Кошик порожній</div>';
    cartTotal.textContent = '0 ₴';
    return;
  }

  cartItems.innerHTML = cart.map(item => `
    <div class="cart-item">
      <img src="${item.image}" alt="${item.name}" />
      <div class="cart-item-info">
        <h4>${item.name}</h4>
        <p>${formatPrice(item.price)}</p>
        <div class="qty-row">
          <button onclick="changeQty('${item.id}', -1)">−</button>
          <span>${item.qty}</span>
          <button onclick="changeQty('${item.id}', 1)">+</button>
          <button class="remove-link" onclick="removeFromCart('${item.id}')">Видалити</button>
        </div>
      </div>
    </div>
  `).join('');

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  cartTotal.textContent = formatPrice(total);
}

function openCart() {
  cartDrawer.classList.add('open');
  overlay.classList.add('show');
}
function closeCart() {
  cartDrawer.classList.remove('open');
  overlay.classList.remove('show');
}
function openCheckout() {
  if (!getCart().length) return alert('Кошик порожній');
  checkoutModal.classList.add('show');
  overlay.classList.add('show');
}
function closeCheckout() {
  checkoutModal.classList.remove('show');
  overlay.classList.remove('show');
}

document.getElementById('openCartBtn').addEventListener('click', openCart);
document.getElementById('closeCartBtn').addEventListener('click', closeCart);
document.getElementById('checkoutBtn').addEventListener('click', openCheckout);
document.getElementById('closeCheckoutBtn').addEventListener('click', closeCheckout);
document.getElementById('openSearchBtn').addEventListener('click', () => searchInput.focus());
overlay.addEventListener('click', () => {
  closeCart();
  closeCheckout();
});

[searchInput, categoryFilter, sortFilter].forEach(el => el.addEventListener('input', renderProducts));
[categoryFilter, sortFilter].forEach(el => el.addEventListener('change', renderProducts));

const checkoutForm = document.getElementById('checkoutForm');
checkoutForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const formData = new FormData(checkoutForm);
  const cart = getCart();
  const orders = getOrders();
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const order = {
    id: 'SZ-' + Date.now(),
    createdAt: new Date().toLocaleString('uk-UA'),
    customer: Object.fromEntries(formData.entries()),
    items: cart,
    total,
    status: 'Нове'
  };

  orders.unshift(order);
  saveOrders(orders);
  saveCart([]);
  renderCart();
  closeCheckout();
  checkoutForm.reset();
  alert('Замовлення успішно оформлено! Ми скоро зв’яжемося з вами.');
});

fillCategories();
renderProducts();
renderCart();
