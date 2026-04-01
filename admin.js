requireAdmin();

const els = {
  adminProducts: document.getElementById('adminProducts'),
  productForm: document.getElementById('productForm')
};

function renderAdminProducts() {
  const products = getProducts();

  if (!products.length) {
    els.adminProducts.innerHTML = '<div class="empty">Немає товарів.</div>';
    return;
  }

  els.adminProducts.innerHTML = products.map(product => `
    <div class="admin-item">
      <img src="${product.image}" alt="${product.title}" onerror="this.src='https://via.placeholder.com/700x700?text=SmartZone'" />
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

function editProduct(id) {
  const product = getProducts().find(p => p.id === id);
  if (!product) return;

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
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function deleteProduct(id) {
  const products = getProducts();
  const product = products.find(p => p.id === id);
  if (!product) return;

  setProducts(products.filter(p => p.id !== id));
  setCart(getCart().filter(item => item.id !== id));
  renderAdminProducts();
  showToast('Товар видалено', product.title + ' було видалено.');
}

function exportProducts() {
  const blob = new Blob([JSON.stringify(getProducts(), null, 2)], { type: 'application/json' });
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

  const products = getProducts();
  const existingIndex = products.findIndex(p => p.id === product.id);

  if (existingIndex >= 0) {
    products[existingIndex] = product;
    showToast('Товар оновлено', product.title + ' успішно збережено.');
  } else {
    products.unshift(product);
    showToast('Товар додано', product.title + ' додано до каталогу.');
  }

  setProducts(products);
  event.target.reset();
  event.target.productId.value = '';
  renderAdminProducts();
}

document.getElementById('logoutBtn').addEventListener('click', () => {
  logoutAdmin();
  window.location.href = 'admin-login.html';
});
document.getElementById('exportProductsBtn').addEventListener('click', exportProducts);
document.getElementById('resetProductsBtn').addEventListener('click', () => {
  setProducts(JSON.parse(JSON.stringify(defaultProducts)));
  renderAdminProducts();
  showToast('Скидання виконано', 'Товари повернуті до стандартних.');
});

els.productForm.addEventListener('submit', saveProductFromForm);
renderAdminProducts();

window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
