const DEFAULT_PRODUCTS = [
  { id:'p1', name:'iPhone 15 Pro', category:'Смартфони', price:54999, image:'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80', badge:'Хіт', description:'Преміальний смартфон Apple з потужною камерою.' },
  { id:'p2', name:'Samsung Galaxy S24', category:'Смартфони', price:42999, image:'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=800&q=80', badge:'Новинка', description:'Флагман Android для щоденного використання.' },
  { id:'p3', name:'AirPods Pro', category:'Навушники', price:10999, image:'https://images.unsplash.com/photo-1606741965509-0f0c2f7a79e9?auto=format&fit=crop&w=800&q=80', badge:'Топ', description:'Бездротові навушники з шумозаглушенням.' },
  { id:'p4', name:'Power Bank 20000mAh', category:'Зарядки', price:1599, image:'https://images.unsplash.com/photo-1585338447937-7082f8fc763d?auto=format&fit=crop&w=800&q=80', badge:'Хіт', description:'Надійний повербанк для подорожей.' },
  { id:'p5', name:'USB-C Кабель', category:'Аксесуари', price:399, image:'https://images.unsplash.com/photo-1587033411391-5d9e51cce126?auto=format&fit=crop&w=800&q=80', badge:'', description:'Швидка зарядка та передача даних.' },
  { id:'p6', name:'Чохол MagSafe', category:'Аксесуари', price:799, image:'https://images.unsplash.com/photo-1601593346740-925612772716?auto=format&fit=crop&w=800&q=80', badge:'Новинка', description:'Стильний захист для сучасних смартфонів.' },
  { id:'p7', name:'Xiaomi Redmi Note', category:'Смартфони', price:11999, image:'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&q=80', badge:'', description:'Доступний смартфон із хорошою автономністю.' },
  { id:'p8', name:'Bluetooth Колонка', category:'Аксесуари', price:2199, image:'https://images.unsplash.com/photo-1589003077984-894e133dabab?auto=format&fit=crop&w=800&q=80', badge:'', description:'Портативний звук для дому та відпочинку.' }
];

const PRODUCTS_KEY = 'smartzone_products';
const CART_KEY = 'smartzone_cart';
const ORDERS_KEY = 'smartzone_orders';

const getProducts = () => JSON.parse(localStorage.getItem(PRODUCTS_KEY) || 'null') || saveDefaultProducts();
function saveDefaultProducts(){ localStorage.setItem(PRODUCTS_KEY, JSON.stringify(DEFAULT_PRODUCTS)); return DEFAULT_PRODUCTS; }
const saveProducts = (items) => localStorage.setItem(PRODUCTS_KEY, JSON.stringify(items));
const getCart = () => JSON.parse(localStorage.getItem(CART_KEY) || '[]');
const saveCart = (items) => localStorage.setItem(CART_KEY, JSON.stringify(items));
const getOrders = () => JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]');
const saveOrders = (items) => localStorage.setItem(ORDERS_KEY, JSON.stringify(items));

let currentCategory = 'all';
let currentSearch = '';
let currentSort = 'popular';

const productGrid = document.getElementById('productGrid');
const searchInput = document.getElementById('searchInput');
const cartDrawer = document.getElementById('cartDrawer');
const cartItemsEl = document.getElementById('cartItems');
const cartTotalEl = document.getElementById('cartTotal');
const cartCountEl = document.getElementById('cartCount');
const checkoutModal = document.getElementById('checkoutModal');

function formatPrice(n){ return `${Number(n).toLocaleString('uk-UA')} грн`; }

function filteredProducts(){
  let items = [...getProducts()];
  if (currentCategory !== 'all') items = items.filter(p => p.category === currentCategory);
  if (currentSearch.trim()) {
    const q = currentSearch.toLowerCase();
    items = items.filter(p => `${p.name} ${p.category} ${p.description}`.toLowerCase().includes(q));
  }
  if (currentSort === 'cheap') items.sort((a,b)=>a.price-b.price);
  if (currentSort === 'expensive') items.sort((a,b)=>b.price-a.price);
  if (currentSort === 'name') items.sort((a,b)=>a.name.localeCompare(b.name,'uk'));
  return items;
}

function renderProducts(){
  const items = filteredProducts();
  productGrid.innerHTML = items.map(p => `
    <article class="product-card">
      <div class="product-image"><img src="${p.image}" alt="${p.name}" loading="lazy"></div>
      <div class="product-body">
        <div class="product-top">
          <div class="product-name">${p.name}</div>
          ${p.badge ? `<span class="product-badge">${p.badge}</span>` : ''}
        </div>
        <div class="product-desc">${p.description || ''}</div>
        <div class="product-bottom">
          <div class="price">${formatPrice(p.price)}</div>
          <button class="btn btn-primary" onclick="addToCart('${p.id}')">Купити</button>
        </div>
      </div>
    </article>
  `).join('');
}

window.addToCart = function(id){
  const cart = getCart();
  const existing = cart.find(i => i.id === id);
  if (existing) existing.qty += 1;
  else cart.push({ id, qty:1 });
  saveCart(cart);
  renderCart();
  cartDrawer.classList.remove('hidden');
}

function renderCart(){
  const cart = getCart();
  const products = getProducts();
  const merged = cart.map(item => ({ ...item, product: products.find(p => p.id === item.id) })).filter(x=>x.product);
  cartCountEl.textContent = cart.reduce((s,i)=>s+i.qty,0);
  if (!merged.length) {
    cartItemsEl.innerHTML = '<p>У кошику поки немає товарів.</p>';
    cartTotalEl.textContent = '0 грн';
    return;
  }
  cartItemsEl.innerHTML = merged.map(({qty, product}) => `
    <div class="cart-item">
      <img src="${product.image}" alt="${product.name}">
      <div>
        <strong>${product.name}</strong>
        <div>${formatPrice(product.price)}</div>
        <div class="qty-box">
          <button onclick="changeQty('${product.id}', -1)">−</button>
          <span>${qty}</span>
          <button onclick="changeQty('${product.id}', 1)">+</button>
          <button class="small-btn delete" onclick="removeFromCart('${product.id}')">Видалити</button>
        </div>
      </div>
      <strong>${formatPrice(product.price * qty)}</strong>
    </div>
  `).join('');
  const total = merged.reduce((s, item) => s + item.product.price * item.qty, 0);
  cartTotalEl.textContent = formatPrice(total);
}
window.changeQty = function(id, delta){
  const cart = getCart();
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart.splice(cart.findIndex(i=>i.id===id),1);
  saveCart(cart);
  renderCart();
}
window.removeFromCart = function(id){
  saveCart(getCart().filter(i => i.id !== id));
  renderCart();
}

function placeOrder(formData){
  const cart = getCart();
  const products = getProducts();
  const items = cart.map(item => ({ ...item, product: products.find(p => p.id === item.id) })).filter(x=>x.product);
  const total = items.reduce((s,item)=>s + item.product.price * item.qty, 0);
  const orders = getOrders();
  orders.unshift({
    id: `SZ-${Date.now().toString().slice(-6)}`,
    date: new Date().toLocaleString('uk-UA'),
    status: 'Нове',
    customer: Object.fromEntries(formData.entries()),
    items: items.map(i => ({ id:i.id, name:i.product.name, qty:i.qty, price:i.product.price })),
    total
  });
  saveOrders(orders);
  saveCart([]);
  renderCart();
  checkoutModal.classList.add('hidden');
  cartDrawer.classList.add('hidden');
  alert('Замовлення оформлено успішно! Воно вже збережене в адмін-панелі.');
}

document.querySelectorAll('.menu-link').forEach(btn => btn.addEventListener('click', () => {
  currentCategory = btn.dataset.category;
  renderProducts();
}));
searchInput.addEventListener('input', e => { currentSearch = e.target.value; renderProducts(); });
document.getElementById('sortSelect').addEventListener('change', e => { currentSort = e.target.value; renderProducts(); });
document.getElementById('cartButton').addEventListener('click', ()=> cartDrawer.classList.remove('hidden'));
document.getElementById('closeCart').addEventListener('click', ()=> cartDrawer.classList.add('hidden'));
document.getElementById('checkoutButton').addEventListener('click', ()=> {
  if (!getCart().length) return alert('Кошик порожній.');
  checkoutModal.classList.remove('hidden');
});
document.getElementById('closeCheckout').addEventListener('click', ()=> checkoutModal.classList.add('hidden'));
document.getElementById('checkoutForm').addEventListener('submit', e => { e.preventDefault(); placeOrder(new FormData(e.target)); e.target.reset(); });

renderProducts();
renderCart();
