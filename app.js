const appState = {
  search: "",
  cartOpen: false
};

function scrollToDeals() {
  document.getElementById("deals").scrollIntoView({ behavior: "smooth" });
}
window.scrollToDeals = scrollToDeals;

function setSearch(value) {
  appState.search = value.toLowerCase();
  renderStore();
}
window.setSearch = setSearch;

function getFilteredProducts(data) {
  let products = [...data.products];
  const category = document.getElementById("categoryFilter")?.value || "";
  const brand = document.getElementById("brandFilter")?.value || "";
  const sort = document.getElementById("sortFilter")?.value || "default";

  if (appState.search) {
    products = products.filter(p =>
      p.name.toLowerCase().includes(appState.search) ||
      p.category.toLowerCase().includes(appState.search) ||
      p.brand.toLowerCase().includes(appState.search)
    );
  }
  if (category) products = products.filter(p => p.category === category);
  if (brand) products = products.filter(p => p.brand === brand);
  if (sort === "cheap") products.sort((a, b) => a.price - b.price);
  if (sort === "expensive") products.sort((a, b) => b.price - a.price);
  if (sort === "name") products.sort((a, b) => a.name.localeCompare(b.name, "uk"));

  return products;
}

function addToCart(id) {
  const data = getStoreData();
  const product = data.products.find(p => p.id === id);
  if (!product) return;
  const cart = getCart();
  const item = cart.find(x => x.id === id);
  if (item) item.qty += 1;
  else cart.push({ id, qty: 1 });
  saveCart(cart);
  renderCart();
}
window.addToCart = addToCart;

function updateQty(id, delta) {
  const cart = getCart();
  const item = cart.find(x => x.id === id);
  if (!item) return;
  item.qty += delta;
  const next = cart.filter(x => x.qty > 0);
  saveCart(next);
  renderCart();
}
window.updateQty = updateQty;

function toggleCart() {
  appState.cartOpen = !appState.cartOpen;
  document.getElementById("cartDrawer").classList.toggle("hidden", !appState.cartOpen);
  document.getElementById("overlay").classList.toggle("hidden", !appState.cartOpen);
  renderCart();
}
window.toggleCart = toggleCart;

function checkout() {
  const cart = getCart();
  if (!cart.length) {
    alert("Кошик порожній");
    return;
  }
  alert("Замовлення оформлено! У реальному магазині тут буде форма доставки та оплата.");
  saveCart([]);
  renderCart();
}
window.checkout = checkout;

function openProduct(id) {
  location.href = "product.html?id=" + encodeURIComponent(id);
}
window.openProduct = openProduct;

function renderStore() {
  const data = getStoreData();
  const categories = document.getElementById("categories");
  const featured = document.getElementById("featuredProducts");
  const productsGrid = document.getElementById("productsGrid");
  const categoryFilter = document.getElementById("categoryFilter");
  const brandFilter = document.getElementById("brandFilter");

  document.getElementById("statProducts").textContent = data.products.length;
  document.getElementById("statCategories").textContent = data.categories.length;
  document.getElementById("statBrands").textContent = data.brands.length;

  categories.innerHTML = data.categories.map(cat => `
    <button class="category-card" onclick="setCategoryFilter('${cat.replace(/'/g, "\'")}')">${cat}</button>
  `).join("");

  const selectedCategory = categoryFilter.value;
  categoryFilter.innerHTML = '<option value="">Всі категорії</option>' + data.categories.map(cat => `<option value="${cat}">${cat}</option>`).join("");
  categoryFilter.value = data.categories.includes(selectedCategory) ? selectedCategory : "";

  const selectedBrand = brandFilter.value;
  brandFilter.innerHTML = '<option value="">Всі бренди</option>' + data.brands.map(brand => `<option value="${brand}">${brand}</option>`).join("");
  brandFilter.value = data.brands.includes(selectedBrand) ? selectedBrand : "";

  const products = getFilteredProducts(data);
  const featuredProducts = data.products.filter(p => p.featured);

  featured.innerHTML = featuredProducts.map(renderProductCard).join("");
  productsGrid.innerHTML = products.length ? products.map(renderProductCard).join("") : '<div class="empty-box">Нічого не знайдено</div>';

  renderCart();
}

function setCategoryFilter(category) {
  document.getElementById("categoryFilter").value = category;
  renderStore();
}
window.setCategoryFilter = setCategoryFilter;

function renderProductCard(p) {
  return `
    <article class="product-card">
      <img src="${p.image}" alt="${p.name}">
      <div class="product-content">
        <div class="mini-row">
          <span class="tag">${p.category}</span>
          <span class="tag tag-light">${p.brand}</span>
        </div>
        <h3>${p.name}</h3>
        <p class="muted">${p.description}</p>
        <div class="price-row">
          <strong>${formatMoney(p.price)}</strong>
          <span class="old-price">${p.oldPrice ? formatMoney(p.oldPrice) : ""}</span>
        </div>
        <div class="mini-row">
          <span class="stock">${p.stock > 0 ? "В наявності: " + p.stock : "Немає в наявності"}</span>
          ${p.featured ? '<span class="hit-badge">Хіт</span>' : ""}
        </div>
        <div class="card-actions">
          <button class="secondary-btn small-btn" onclick="openProduct('${p.id}')">Детальніше</button>
          <button class="primary-btn small-btn" onclick="addToCart('${p.id}')">Купити</button>
        </div>
      </div>
    </article>
  `;
}

function renderCart() {
  const data = getStoreData();
  const cart = getCart();
  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const itemsWrap = document.getElementById("cartItems");
  const totalEl = document.getElementById("cartTotal");
  document.getElementById("cartCount").textContent = cartCount;

  const detailed = cart.map(item => {
    const product = data.products.find(p => p.id === item.id);
    return product ? { ...product, qty: item.qty } : null;
  }).filter(Boolean);

  const total = detailed.reduce((sum, item) => sum + item.price * item.qty, 0);
  totalEl.textContent = formatMoney(total);

  itemsWrap.innerHTML = detailed.length ? detailed.map(item => `
    <div class="cart-item">
      <img src="${item.image}" alt="${item.name}">
      <div class="cart-item-info">
        <strong>${item.name}</strong>
        <div class="muted">${formatMoney(item.price)}</div>
        <div class="qty-controls">
          <button onclick="updateQty('${item.id}', -1)">−</button>
          <span>${item.qty}</span>
          <button onclick="updateQty('${item.id}', 1)">+</button>
        </div>
      </div>
    </div>
  `).join("") : '<div class="empty-box">Кошик порожній</div>';
}

window.addEventListener("storage", () => {
  renderStore();
  renderCart();
});

renderStore();
