const ADMIN_PASSWORD = 'SmartZone2026';
const loginView = document.getElementById('loginView');
const adminView = document.getElementById('adminView');
const loginForm = document.getElementById('loginForm');
const logoutBtn = document.getElementById('logoutBtn');
const productForm = document.getElementById('productForm');
const productsTableBody = document.getElementById('productsTableBody');
const ordersTableBody = document.getElementById('ordersTableBody');
const resetFormBtn = document.getElementById('resetFormBtn');

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
function formatPrice(price) {
  return `${Number(price).toLocaleString('uk-UA')} грн`;
}

function isLoggedIn() {
  return sessionStorage.getItem('smartzone_admin_auth') === '1';
}

function showAdmin() {
  loginView.classList.add('hidden');
  adminView.classList.remove('hidden');
  renderAdmin();
}

function showLogin() {
  loginView.classList.remove('hidden');
  adminView.classList.add('hidden');
}

loginForm?.addEventListener('submit', (e) => {
  e.preventDefault();
  const password = document.getElementById('adminPassword').value.trim();
  if (password !== ADMIN_PASSWORD) {
    alert('Невірний пароль.');
    return;
  }
  sessionStorage.setItem('smartzone_admin_auth', '1');
  showAdmin();
});

logoutBtn?.addEventListener('click', () => {
  sessionStorage.removeItem('smartzone_admin_auth');
  showLogin();
});

function getProducts() {
  return loadLS('smartzone_products', []);
}
function getOrders() {
  return loadLS('smartzone_orders', []);
}

function renderStats() {
  const products = getProducts();
  const orders = getOrders();
  document.getElementById('productsStat').textContent = products.length;
  document.getElementById('ordersStat').textContent = orders.length;
  const revenue = orders.reduce((sum, order) => sum + Number(order.total || 0), 0);
  document.getElementById('revenueStat').textContent = formatPrice(revenue);
}

function renderProductsTable() {
  const products = getProducts();
  productsTableBody.innerHTML = products.length ? products.map(product => `
    <tr>
      <td><img class="thumb" src="${product.image}" alt="${product.name}" /></td>
      <td>${product.name}</td>
      <td>${product.category}</td>
      <td>${formatPrice(product.price)}</td>
      <td>${product.stock}</td>
      <td>
        <div class="admin-actions">
          <button class="mini-btn" data-edit="${product.id}">Редагувати</button>
          <button class="mini-btn" data-delete="${product.id}">Видалити</button>
        </div>
      </td>
    </tr>
  `).join('') : `<tr><td colspan="6">Товарів поки немає.</td></tr>`;

  productsTableBody.querySelectorAll('[data-edit]').forEach(btn => {
    btn.addEventListener('click', () => fillForm(Number(btn.dataset.edit)));
  });
  productsTableBody.querySelectorAll('[data-delete]').forEach(btn => {
    btn.addEventListener('click', () => deleteProduct(Number(btn.dataset.delete)));
  });
}

function renderOrdersTable() {
  const orders = getOrders();
  ordersTableBody.innerHTML = orders.length ? orders.map(order => `
    <tr>
      <td>${order.createdAt}</td>
      <td>${order.customer?.name || '-'}</td>
      <td>${order.customer?.phone || '-'}</td>
      <td>${(order.items || []).map(i => `${i.name} × ${i.qty}`).join('<br>')}</td>
      <td>${formatPrice(order.total)}</td>
    </tr>
  `).join('') : `<tr><td colspan="5">Замовлень поки немає.</td></tr>`;
}

function renderAdmin() {
  renderStats();
  renderProductsTable();
  renderOrdersTable();
}

function fillForm(id) {
  const product = getProducts().find(p => p.id === id);
  if (!product) return;
  document.getElementById('productId').value = product.id;
  document.getElementById('productName').value = product.name;
  document.getElementById('productCategory').value = product.category;
  document.getElementById('productPrice').value = product.price;
  document.getElementById('productStock').value = product.stock;
  document.getElementById('productImage').value = product.image;
  document.getElementById('productDescription').value = product.description;
  document.getElementById('productFeatured').checked = !!product.featured;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function clearForm() {
  productForm.reset();
  document.getElementById('productId').value = '';
}

resetFormBtn?.addEventListener('click', clearForm);

productForm?.addEventListener('submit', (e) => {
  e.preventDefault();
  const products = getProducts();
  const id = document.getElementById('productId').value;
  const payload = {
    id: id ? Number(id) : Date.now(),
    name: document.getElementById('productName').value.trim(),
    category: document.getElementById('productCategory').value,
    price: Number(document.getElementById('productPrice').value),
    stock: Number(document.getElementById('productStock').value),
    image: document.getElementById('productImage').value.trim(),
    description: document.getElementById('productDescription').value.trim(),
    featured: document.getElementById('productFeatured').checked
  };

  const index = products.findIndex(p => p.id === payload.id);
  if (index >= 0) products[index] = payload;
  else products.unshift(payload);

  saveLS('smartzone_products', products);
  clearForm();
  renderAdmin();
  alert('Товар збережено.');
});

function deleteProduct(id) {
  const ok = confirm('Видалити цей товар?');
  if (!ok) return;
  const products = getProducts().filter(p => p.id !== id);
  saveLS('smartzone_products', products);
  renderAdmin();
}

if (isLoggedIn()) showAdmin();
else showLogin();
