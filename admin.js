const ADMIN_PASSWORD = 'SmartZone2026';
const ADMIN_SESSION_KEY = 'smartzone_admin_logged_in';
const PRODUCTS_KEY = 'smartzone_products';
const ORDERS_KEY = 'smartzone_orders';

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
  }
];

function getProducts() {
  const saved = localStorage.getItem(PRODUCTS_KEY);
  if (!saved) {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(defaultProducts));
    return defaultProducts;
  }
  return JSON.parse(saved);
}

function saveProducts(products) {
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
}

function getOrders() {
  return JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]');
}

function saveOrders(orders) {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}

function formatPrice(price) {
  return new Intl.NumberFormat('uk-UA').format(price) + ' ₴';
}

const loginSection = document.getElementById('loginSection');
const adminPanel = document.getElementById('adminPanel');
const loginForm = document.getElementById('loginForm');
const logoutBtn = document.getElementById('logoutBtn');
const productForm = document.getElementById('productForm');
const adminProducts = document.getElementById('adminProducts');
const ordersList = document.getElementById('ordersList');
const resetProductsBtn = document.getElementById('resetProductsBtn');
const clearOrdersBtn = document.getElementById('clearOrdersBtn');
const formTitle = document.getElementById('formTitle');

function checkAuth() {
  const isLogged = localStorage.getItem(ADMIN_SESSION_KEY) === 'true';
  loginSection.classList.toggle('hidden', isLogged);
  adminPanel.classList.toggle('hidden', !isLogged);
  if (isLogged) renderAdmin();
}

loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const pass = document.getElementById('adminPassword').value;
  if (pass === ADMIN_PASSWORD) {
    localStorage.setItem(ADMIN_SESSION_KEY, 'true');
    checkAuth();
  } else {
    alert('Невірний пароль');
  }
});

logoutBtn.addEventListener('click', () => {
  localStorage.removeItem(ADMIN_SESSION_KEY);
  checkAuth();
});

function renderStats() {
  const products = getProducts();
  const orders = getOrders();
  const revenue = orders.reduce((sum, order) => sum + Number(order.total || 0), 0);
  document.getElementById('statProducts').textContent = products.length;
  document.getElementById('statOrders').textContent = orders.length;
  document.getElementById('statRevenue').textContent = formatPrice(revenue);
}

function renderProductsList() {
  const products = getProducts();
  if (!products.length) {
    adminProducts.innerHTML = '<div class="empty-box small">Товарів ще немає</div>';
    return;
  }

  adminProducts.innerHTML = products.map(product => `
    <div class="admin-item">
      <img src="${product.image}" alt="${product.name}" />
      <div class="admin-item-content">
        <h4>${product.name}</h4>
        <p>${product.category} • ${formatPrice(product.price)}</p>
        <small>${product.badge || 'Без мітки'}</small>
      </div>
      <div class="admin-item-actions">
        <button class="btn btn-secondary" onclick="editProduct('${product.id}')">Редагувати</button>
        <button class="btn btn-danger" onclick="deleteProduct('${product.id}')">Видалити</button>
      </div>
    </div>
  `).join('');
}

function renderOrders() {
  const orders = getOrders();
  if (!orders.length) {
    ordersList.innerHTML = '<div class="empty-box small">Замовлень ще немає</div>';
    return;
  }

  ordersList.innerHTML = orders.map(order => `
    <div class="order-card">
      <div class="order-top">
        <div>
          <h4>${order.id}</h4>
          <p>${order.createdAt}</p>
        </div>
        <span class="status-pill">${order.status}</span>
      </div>
      <p><strong>Клієнт:</strong> ${order.customer.name}</p>
      <p><strong>Телефон:</strong> ${order.customer.phone}</p>
      <p><strong>Місто:</strong> ${order.customer.city}</p>
      <p><strong>Доставка:</strong> ${order.customer.delivery}</p>
      <p><strong>Оплата:</strong> ${order.customer.payment}</p>
      <p><strong>Сума:</strong> ${formatPrice(order.total)}</p>
      <details>
        <summary>Товари у замовленні</summary>
        ${order.items.map(item => `<div class="order-item-row">${item.name} × ${item.qty} — ${formatPrice(item.price * item.qty)}</div>`).join('')}
      </details>
    </div>
  `).join('');
}

function resetForm() {
  productForm.reset();
  document.getElementById('productId').value = '';
  formTitle.textContent = 'Додати товар';
}

productForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const id = document.getElementById('productId').value;
  const product = {
    id: id || crypto.randomUUID(),
    name: document.getElementById('productName').value.trim(),
    price: Number(document.getElementById('productPrice').value),
    image: document.getElementById('productImage').value.trim(),
    badge: document.getElementById('productBadge').value.trim(),
    category: document.getElementById('productCategory').value,
    description: document.getElementById('productDescription').value.trim(),
    popular: document.getElementById('productPopular').checked
  };

  const products = getProducts();
  const index = products.findIndex(p => p.id === product.id);
  if (index >= 0) {
    products[index] = product;
  } else {
    products.unshift(product);
  }

  saveProducts(products);
  renderAdmin();
  resetForm();
  alert('Товар збережено');
});

function editProduct(productId) {
  const product = getProducts().find(p => p.id === productId);
  if (!product) return;
  formTitle.textContent = 'Редагувати товар';
  document.getElementById('productId').value = product.id;
  document.getElementById('productName').value = product.name;
  document.getElementById('productPrice').value = product.price;
  document.getElementById('productImage').value = product.image;
  document.getElementById('productBadge').value = product.badge || '';
  document.getElementById('productCategory').value = product.category;
  document.getElementById('productDescription').value = product.description;
  document.getElementById('productPopular').checked = !!product.popular;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
window.editProduct = editProduct;

function deleteProduct(productId) {
  if (!confirm('Видалити товар?')) return;
  const products = getProducts().filter(p => p.id !== productId);
  saveProducts(products);
  renderAdmin();
}
window.deleteProduct = deleteProduct;

resetProductsBtn.addEventListener('click', () => {
  if (!confirm('Повернути демо-товари? Ваші зміни будуть замінені.')) return;
  saveProducts(defaultProducts);
  renderAdmin();
  resetForm();
});

clearOrdersBtn.addEventListener('click', () => {
  if (!confirm('Очистити всі замовлення?')) return;
  saveOrders([]);
  renderAdmin();
});

function renderAdmin() {
  renderStats();
  renderProductsList();
  renderOrders();
}

checkAuth();
