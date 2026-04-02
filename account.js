const profileForm = document.getElementById('profileForm');
const accountUserName = document.getElementById('accountUserName');
const accountUserEmail = document.getElementById('accountUserEmail');
const accountAvatar = document.getElementById('accountAvatar');
const ordersCount = document.getElementById('ordersCount');
const wishlistCountStat = document.getElementById('wishlistCountStat');
const totalSpent = document.getElementById('totalSpent');
const accountOrdersList = document.getElementById('accountOrdersList');
const accountWishlistList = document.getElementById('accountWishlistList');

function renderProfile(){
  const profile = getUserProfile();
  if(profileForm.name) profileForm.name.value = profile.name || '';
  if(profileForm.phone) profileForm.phone.value = profile.phone || '';
  if(profileForm.email) profileForm.email.value = profile.email || '';
  if(profileForm.city) profileForm.city.value = profile.city || '';
  if(profileForm.address) profileForm.address.value = profile.address || '';

  accountUserName.textContent = profile.name || 'Користувач';
  accountUserEmail.textContent = profile.email || 'email не вказано';
  accountAvatar.textContent = (profile.name || 'U').trim().charAt(0).toUpperCase();
}

function renderStats(){
  const orders = getOrders();
  const wishlist = getWishlist();
  const spent = orders.reduce((sum, order) => sum + Number(order.total || 0), 0);

  ordersCount.textContent = String(orders.length);
  wishlistCountStat.textContent = String(wishlist.length);
  totalSpent.textContent = formatPrice(spent);
}

function renderOrders(){
  const orders = getOrders();
  if(!orders.length){
    accountOrdersList.innerHTML = '<div class="account-empty">У тебе ще немає замовлень.</div>';
    return;
  }

  accountOrdersList.innerHTML = `<div class="account-order-list">${orders.map(order => `
    <div class="account-order-item">
      <div class="account-order-top">
        <div>
          <strong>${order.id}</strong>
          <div class="muted">${new Date(order.createdAt).toLocaleString('uk-UA')}</div>
        </div>
        <div class="status-badge ${statusClass(order.status)}">${statusLabel(order.status)}</div>
      </div>
      <div class="muted">Сума: ${formatPrice(order.total || 0)}</div>
      <div class="muted">Промокод: ${order.promoCode || 'Немає'}</div><div class="muted">Оплата: ${order.paymentMethodName || order.paymentMethod || 'Не вказано'}</div><div class="muted">Статус оплати: ${order.paymentStatus || 'Не вказано'}</div>
      ${order.items && order.items.length ? `
        <div style="margin-top:10px;">
          ${order.items.map(item => `<div class="muted">${item.title} • ${item.qty} шт • ${formatPrice(item.total)}</div>`).join('')}
        </div>
      ` : '<div style="margin-top:10px;" class="muted">Швидка заявка без списку товарів</div>'}
    </div>
  `).join('')}</div>`;
}

function renderWishlist(){
  const wishlist = getWishlist();
  const products = getProducts();
  const items = wishlist.map(id => products.find(p => p.id === id)).filter(Boolean);

  if(!items.length){
    accountWishlistList.innerHTML = '<div class="account-empty">Список бажань порожній.</div>';
    return;
  }

  accountWishlistList.innerHTML = `<div class="account-wishlist-list">${items.map(item => `
    <div class="account-wishlist-item">
      <img src="${item.image}" alt="${item.title}" onerror="this.src='https://via.placeholder.com/700x700?text=SmartZone'" />
      <div>
        <strong>${item.title}</strong>
        <div class="muted" style="margin-top:6px;">${item.brand} • ${item.memory || '—'} • ${formatPrice(item.price)}</div>
      </div>
      <div style="display:grid; gap:8px;">
        <a class="main-btn" href="index.html">Перейти до товару</a>
      </div>
    </div>
  `).join('')}</div>`;
}

function openTab(tab){
  document.querySelectorAll('.account-menu button').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tab);
  });
  document.getElementById('profileSection').classList.toggle('hidden-section', tab !== 'profile');
  document.getElementById('ordersSection').classList.toggle('hidden-section', tab !== 'orders');
  document.getElementById('wishlistSection').classList.toggle('hidden-section', tab !== 'wishlist');
}

document.querySelectorAll('.account-menu button').forEach(btn => {
  btn.addEventListener('click', () => openTab(btn.dataset.tab));
});

profileForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const form = new FormData(profileForm);
  setUserProfile({
    name: String(form.get('name') || '').trim(),
    phone: String(form.get('phone') || '').trim(),
    email: String(form.get('email') || '').trim(),
    city: String(form.get('city') || '').trim(),
    address: String(form.get('address') || '').trim()
  });
  renderProfile();
  showToast('Профіль збережено', 'Дані користувача оновлено.');
});

renderProfile();
renderStats();
renderOrders();
renderWishlist();
openTab('profile');
