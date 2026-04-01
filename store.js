const STORAGE_KEYS = {
  products: 'smartzone_ultra_products_v1',
  cart: 'smartzone_ultra_cart_v1',
  orders: 'smartzone_ultra_orders_v1',
  adminSession: 'smartzone_ultra_admin_session_v1',
  adminCredentials: 'smartzone_ultra_admin_credentials_v1'
};

const defaultProducts = [
  {
    id: crypto.randomUUID(),
    title: 'iPhone 15 Pro Max',
    brand: 'Apple',
    category: 'Смартфони',
    image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=1200&q=80',
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
    image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=1200&q=80',
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
    image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=1200&q=80',
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
    image: 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?auto=format&fit=crop&w=1200&q=80',
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
    image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=1200&q=80',
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
    image: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=1200&q=80',
    price: 1699,
    oldPrice: 1999,
    memory: 'Fast Charge',
    color: 'Black',
    stock: 20,
    status: 'sale',
    description: 'Ємний павербанк для смартфонів, планшетів та аксесуарів з підтримкою швидкої зарядки.'
  }
];

const defaultAdminCredentials = { username: 'admin', password: '1234' };

function loadJson(key, fallback) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
}
function saveJson(key, value) { localStorage.setItem(key, JSON.stringify(value)); }

function getProducts() {
  const saved = loadJson(STORAGE_KEYS.products, null);
  if (saved && Array.isArray(saved) && saved.length) return saved;
  saveJson(STORAGE_KEYS.products, defaultProducts);
  return defaultProducts;
}
function setProducts(products) { saveJson(STORAGE_KEYS.products, products); }

function getCart() { return loadJson(STORAGE_KEYS.cart, []); }
function setCart(cart) { saveJson(STORAGE_KEYS.cart, cart); }

function getOrders() { return loadJson(STORAGE_KEYS.orders, []); }
function setOrders(orders) { saveJson(STORAGE_KEYS.orders, orders); }

function getAdminCredentials() {
  const creds = loadJson(STORAGE_KEYS.adminCredentials, null);
  if (creds && creds.username && creds.password) return creds;
  saveJson(STORAGE_KEYS.adminCredentials, defaultAdminCredentials);
  return defaultAdminCredentials;
}
function setAdminCredentials(creds) { saveJson(STORAGE_KEYS.adminCredentials, creds); }

function getAdminSession() { return loadJson(STORAGE_KEYS.adminSession, { loggedIn: false, username: '' }); }
function setAdminSession(session) { saveJson(STORAGE_KEYS.adminSession, session); }
function logoutAdmin() { setAdminSession({ loggedIn: false, username: '' }); }
function isAdminLoggedIn() { return !!getAdminSession().loggedIn; }
function requireAdmin() { if (!isAdminLoggedIn()) window.location.href = 'admin-login.html'; }

function formatPrice(value) {
  return new Intl.NumberFormat('uk-UA').format(Number(value || 0)) + ' грн';
}
function normalizePhone(phone) {
  return String(phone || '').replace(/[^\d+]/g, '');
}
function createOrderId() {
  return 'SZ-' + Date.now();
}
function defaultOrderStatus() {
  return 'new';
}
function statusLabel(status) {
  const map = {
    new: 'Нове',
    processing: 'В обробці',
    shipped: 'Відправлено',
    done: 'Завершено',
    cancelled: 'Скасовано'
  };
  return map[status] || 'Невідомо';
}
function statusClass(status) {
  return 'status-' + status;
}
function showToast(title, text) {
  const toast = document.getElementById('toast');
  const toastTitle = document.getElementById('toastTitle');
  const toastText = document.getElementById('toastText');
  if (!toast || !toastTitle || !toastText) return;
  toastTitle.textContent = title;
  toastText.textContent = text;
  toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('show'), 2600);
}
