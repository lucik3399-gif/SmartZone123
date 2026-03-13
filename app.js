const state = {
  search: "",
  category: "all"
};

function updateSearch(value) {
  state.search = value.toLowerCase();
  renderStore();
}
window.updateSearch = updateSearch;

function setCategory(category) {
  state.category = category;
  renderStore();
}
window.setCategory = setCategory;

function getFilteredProducts(data) {
  let products = [...data.products];
  const brand = document.getElementById("brandFilter")?.value || "";
  const sort = document.getElementById("sortFilter")?.value || "default";

  if (state.category !== "all") {
    products = products.filter(p => p.category === state.category);
  }
  if (state.search) {
    products = products.filter(p =>
      p.name.toLowerCase().includes(state.search) ||
      p.brand.toLowerCase().includes(state.search) ||
      p.category.toLowerCase().includes(state.search)
    );
  }
  if (brand) {
    products = products.filter(p => p.brand === brand);
  }

  if (sort === "cheap") products.sort((a, b) => a.price - b.price);
  if (sort === "expensive") products.sort((a, b) => b.price - a.price);
  if (sort === "name") products.sort((a, b) => a.name.localeCompare(b.name, "uk"));

  return products;
}

function renderStore() {
  const data = getStoreData();
  const categoryFilters = document.getElementById("categoryFilters");
  const productsGrid = document.getElementById("productsGrid");
  const brandFilter = document.getElementById("brandFilter");

  document.getElementById("heroProductsCount").textContent = data.products.length;
  document.getElementById("heroCategoriesCount").textContent = data.categories.length;
  document.getElementById("heroBrandsCount").textContent = data.brands.length;

  categoryFilters.innerHTML = [
    `<button class="chip ${state.category === "all" ? "active" : ""}" onclick="setCategory('all')">Усі</button>`,
    ...data.categories.map(cat => `<button class="chip ${state.category === cat ? "active" : ""}" onclick="setCategory('${cat.replace(/'/g, "\'")}')">${cat}</button>`)
  ].join("");

  const currentBrand = brandFilter.value;
  brandFilter.innerHTML = `<option value="">Всі бренди</option>` + data.brands.map(b =>
    `<option value="${b.replace(/"/g, "&quot;")}">${b}</option>`
  ).join("");
  brandFilter.value = data.brands.includes(currentBrand) ? currentBrand : "";

  const products = getFilteredProducts(data);

  productsGrid.innerHTML = products.length ? products.map(p => `
    <article class="product-card">
      <img src="${p.image}" alt="${p.name}">
      <div class="product-content">
        <div class="mini-row">
          <span class="tag">${p.category}</span>
          <span class="tag light">${p.brand}</span>
        </div>
        <h3>${p.name}</h3>
        <p class="muted">${p.description || ""}</p>
        <div class="price-box">
          <strong>${formatMoney(p.price)}</strong>
          <span class="old-price">${p.oldPrice ? formatMoney(p.oldPrice) : ""}</span>
        </div>
        <div class="mini-row">
          <span class="stock">${p.stock > 0 ? "В наявності: " + p.stock : "Немає в наявності"}</span>
          ${p.featured ? `<span class="featured">Хіт</span>` : ""}
        </div>
        <button class="buy-btn">Купити</button>
      </div>
    </article>
  `).join("") : `<div class="empty-box">Нічого не знайдено</div>`;
}

window.addEventListener("storage", renderStore);
renderStore();
