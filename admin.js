const PRODUCTS_KEY = 'smartzone_products';
const ORDERS_KEY = 'smartzone_orders';
const ADMIN_PASS_KEY = 'smartzone_admin_pass';
const SESSION_KEY = 'smartzone_admin_ok';

if (!localStorage.getItem(ADMIN_PASS_KEY)) localStorage.setItem(ADMIN_PASS_KEY, 'smartzone2026');

const getProducts = () => JSON.parse(localStorage.getItem(PRODUCTS_KEY) || '[]');
const saveProducts = (items) => localStorage.setItem(PRODUCTS_KEY, JSON.stringify(items));
const getOrders = () => JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]');
const saveOrders = (items) => localStorage.setItem(ORDERS_KEY, JSON.stringify(items));
const isLogged = () => localStorage.getItem(SESSION_KEY) === 'yes';

function formatPrice(n){ return `${Number(n).toLocaleString('uk-UA')} грн`; }
function esc(v){ return String(v ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }

const panels = document.querySelectorAll('.tab-panel');
document.querySelectorAll('.side-link').forEach(btn => btn.addEventListener('click', () => {
  document.querySelectorAll('.side-link').forEach(x => x.classList.remove('active'));
  btn.classList.add('active');
  panels.forEach(p => p.classList.add('hidden'));
  document.getElementById(btn.dataset.tab).classList.remove('hidden');
}));

document.getElementById('loginButton').addEventListener('click', () => {
  const value = document.getElementById('adminPassword').value;
  if (value === localStorage.getItem(ADMIN_PASS_KEY)) {
    localStorage.setItem(SESSION_KEY, 'yes');
    notify('Вхід виконано.');
    renderAdmin();
  } else {
    alert('Невірний пароль. Стандартний пароль: smartzone2026');
  }
});

function requireLogin(){
  if (!isLogged()) {
    document.getElementById('adminProducts').innerHTML = '<p>Увійди в адмін-панель, щоб редагувати товари.</p>';
    document.getElementById('ordersList').innerHTML = '<p>Увійди в адмін-панель, щоб переглянути замовлення.</p>';
    return false;
  }
  return true;
}

function notify(text){
  const div = document.createElement('div');
  div.className = 'notice';
  div.textContent = text;
  document.querySelector('.admin-main').prepend(div);
  setTimeout(()=>div.remove(), 2500);
}

function renderStats(){
  const products = getProducts();
  const orders = getOrders();
  document.getElementById('productsStat').textContent = products.length;
  document.getElementById('ordersStat').textContent = orders.length;
  document.getElementById('revenueStat').textContent = formatPrice(orders.reduce((s,o)=>s+Number(o.total||0),0));
  document.getElementById('pendingStat').textContent = orders.filter(o => o.status === 'Нове').length;
}

function renderProducts(){
  if (!requireLogin()) return;
  const products = getProducts();
  document.getElementById('adminProducts').innerHTML = `
    <table class="table">
      <thead><tr><th>ID</th><th>Назва</th><th>Категорія</th><th>Ціна</th><th>Дії</th></tr></thead>
      <tbody>
        ${products.map(p => `
          <tr>
            <td>${esc(p.id)}</td>
            <td>${esc(p.name)}</td>
            <td>${esc(p.category)}</td>
            <td>${formatPrice(p.price)}</td>
            <td class="table-actions">
              <button class="small-btn edit" onclick="editProduct('${esc(p.id)}')">Редагувати</button>
              <button class="small-btn delete" onclick="deleteProduct('${esc(p.id)}')">Видалити</button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

function renderOrders(){
  if (!requireLogin()) return;
  const orders = getOrders();
  if (!orders.length) {
    document.getElementById('ordersList').innerHTML = '<p>Замовлень поки немає.</p>';
    return;
  }
  document.getElementById('ordersList').innerHTML = `
    <table class="table">
      <thead><tr><th>ID</th><th>Клієнт</th><th>Телефон</th><th>Сума</th><th>Статус</th><th>Дії</th></tr></thead>
      <tbody>
        ${orders.map((o, idx) => `
          <tr>
            <td>${esc(o.id)}</td>
            <td>${esc(o.customer?.name || '')}</td>
            <td>${esc(o.customer?.phone || '')}</td>
            <td>${formatPrice(o.total)}</td>
            <td>${esc(o.status)}</td>
            <td class="table-actions">
              <button class="small-btn done" onclick="markDone(${idx})">Виконано</button>
              <button class="small-btn delete" onclick="deleteOrder(${idx})">Видалити</button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

window.editProduct = function(id){
  const product = getProducts().find(p => p.id === id);
  if (!product) return;
  const form = document.getElementById('productForm');
  Object.keys(product).forEach(key => { if (form.elements[key]) form.elements[key].value = product[key] || ''; });
  document.getElementById('products').scrollIntoView({ behavior:'smooth' });
}
window.deleteProduct = function(id){
  const items = getProducts().filter(p => p.id !== id);
  saveProducts(items);
  renderAdmin();
}
window.markDone = function(index){
  const orders = getOrders();
  if (!orders[index]) return;
  orders[index].status = 'Виконано';
  saveOrders(orders);
  renderAdmin();
}
window.deleteOrder = function(index){
  const orders = getOrders();
  orders.splice(index,1);
  saveOrders(orders);
  renderAdmin();
}

document.getElementById('productForm').addEventListener('submit', e => {
  e.preventDefault();
  if (!requireLogin()) return;
  const form = new FormData(e.target);
  const product = Object.fromEntries(form.entries());
  product.price = Number(product.price);
  const items = getProducts();
  const idx = items.findIndex(p => p.id === product.id);
  if (idx >= 0) items[idx] = product; else items.unshift(product);
  saveProducts(items);
  e.target.reset();
  notify('Товар збережено.');
  renderAdmin();
});

document.getElementById('importButton').addEventListener('click', async () => {
  if (!requireLogin()) return;
  const file = document.getElementById('csvFile').files[0];
  if (!file) return alert('Обери CSV файл.');
  const text = await file.text();
  const rows = text.trim().split(/\r?\n/).slice(1);
  const products = getProducts();
  rows.forEach(line => {
    const [id,name,category,price,image,badge,description] = line.split(',');
    if (!id || !name) return;
    const product = { id, name, category, price:Number(price||0), image, badge, description };
    const idx = products.findIndex(p => p.id === id);
    if (idx >= 0) products[idx] = product; else products.unshift(product);
  });
  saveProducts(products);
  notify('CSV імпортовано.');
  renderAdmin();
});

function renderAdmin(){ renderStats(); renderProducts(); renderOrders(); }
renderAdmin();
