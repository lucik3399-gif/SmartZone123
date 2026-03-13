function getProductId() {
  const params = new URLSearchParams(location.search);
  return params.get("id");
}

function addProductToCart(id) {
  const cart = getCart();
  const item = cart.find(x => x.id === id);
  if (item) item.qty += 1;
  else cart.push({ id, qty: 1 });
  saveCart(cart);
  alert("Товар додано в кошик");
}
window.addProductToCart = addProductToCart;

function renderProductPage() {
  const data = getStoreData();
  const id = getProductId();
  const product = data.products.find(p => p.id === id);
  const root = document.getElementById("productPage");

  if (!product) {
    root.innerHTML = '<div class="empty-box">Товар не знайдено</div>';
    return;
  }

  const related = data.products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 3);

  root.innerHTML = `
    <div class="product-page-grid">
      <div class="product-image-card">
        <img src="${product.image}" alt="${product.name}">
      </div>
      <div class="product-info-card">
        <div class="mini-row">
          <span class="tag">${product.category}</span>
          <span class="tag tag-light">${product.brand}</span>
        </div>
        <h1 class="product-title">${product.name}</h1>
        <p class="product-description">${product.description}</p>
        <div class="product-price">${formatMoney(product.price)} <span>${product.oldPrice ? formatMoney(product.oldPrice) : ""}</span></div>
        <div class="product-stock">${product.stock > 0 ? "В наявності: " + product.stock : "Немає в наявності"}</div>
        <div class="card-actions">
          <button class="primary-btn" onclick="addProductToCart('${product.id}')">Купити</button>
          <a class="secondary-btn" href="index.html">Повернутись у каталог</a>
        </div>

        <div class="info-box">
          <h3>Характеристики</h3>
          <ul>
            <li>Бренд: ${product.brand}</li>
            <li>Категорія: ${product.category}</li>
            <li>Гарантія: 12 місяців</li>
            <li>Доставка по Україні</li>
          </ul>
        </div>
      </div>
    </div>

    <section class="section">
      <div class="section-head">
        <div>
          <h2>Схожі товари</h2>
        </div>
      </div>
      <div class="products-grid">
        ${related.map(p => `
          <article class="product-card">
            <img src="${p.image}" alt="${p.name}">
            <div class="product-content">
              <h3>${p.name}</h3>
              <div class="price-row"><strong>${formatMoney(p.price)}</strong></div>
              <div class="card-actions">
                <a class="secondary-btn small-btn" href="product.html?id=${p.id}">Детальніше</a>
              </div>
            </div>
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

renderProductPage();
