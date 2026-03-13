const adminState = {
  data: getStoreData(),
  loggedIn: sessionStorage.getItem("smartzone-admin-auth") === "ok",
  tab: "products",
  editingId: null
};

function escapeHtml(v) {
  return String(v ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function renderAdmin() {
  adminState.data = getStoreData();
  const root = document.getElementById("adminApp");

  if (!adminState.loggedIn) {
    root.innerHTML = `
      <div class="login-page">
        <form class="login-card" onsubmit="loginAdmin(event)">
          <span class="hero-badge">SmartZone Admin</span>
          <h1>Вхід в адмінку</h1>
          <p class="muted">Керування товарами, категоріями і брендами</p>
          <input id="adminPass" type="password" placeholder="Введіть пароль" required />
          <button class="primary-btn full-btn" type="submit">Увійти</button>
          <a class="secondary-btn full-btn" href="index.html">Назад до магазину</a>
        </form>
      </div>
    `;
    return;
  }

  const editingProduct = adminState.data.products.find(p => p.id === adminState.editingId);

  root.innerHTML = `
    <header class="admin-topbar">
      <div>
        <span class="hero-badge">Панель керування</span>
        <h1>SmartZone Admin</h1>
      </div>
      <div class="admin-actions">
        <a class="secondary-btn" href="index.html">Відкрити магазин</a>
        <button class="header-btn" onclick="logoutAdmin()">Вийти</button>
      </div>
    </header>

    <section class="admin-stats">
      <div class="admin-stat-card"><strong>${adminState.data.products.length}</strong><span>товарів</span></div>
      <div class="admin-stat-card"><strong>${adminState.data.categories.length}</strong><span>категорій</span></div>
      <div class="admin-stat-card"><strong>${adminState.data.brands.length}</strong><span>брендів</span></div>
    </section>

    <section class="admin-layout">
      <aside class="admin-sidebar">
        <button class="side-btn ${adminState.tab === "products" ? "active" : ""}" onclick="setTab('products')">Товари</button>
        <button class="side-btn ${adminState.tab === "categories" ? "active" : ""}" onclick="setTab('categories')">Категорії</button>
        <button class="side-btn ${adminState.tab === "brands" ? "active" : ""}" onclick="setTab('brands')">Бренди</button>
        <button class="side-btn ${adminState.tab === "settings" ? "active" : ""}" onclick="setTab('settings')">Пароль</button>
        <button class="side-btn ${adminState.tab === "json" ? "active" : ""}" onclick="setTab('json')">JSON</button>
      </aside>

      <main class="admin-main">
        ${renderTabContent(editingProduct)}
      </main>
    </section>
  `;
}

function setTab(tab) {
  adminState.tab = tab;
  renderAdmin();
}
window.setTab = setTab;

function loginAdmin(e) {
  e.preventDefault();
  const pass = document.getElementById("adminPass").value;
  if (pass === adminState.data.adminPassword) {
    adminState.loggedIn = true;
    sessionStorage.setItem("smartzone-admin-auth", "ok");
    renderAdmin();
  } else {
    alert("Неправильний пароль");
  }
}
window.loginAdmin = loginAdmin;

function logoutAdmin() {
  sessionStorage.removeItem("smartzone-admin-auth");
  adminState.loggedIn = false;
  renderAdmin();
}
window.logoutAdmin = logoutAdmin;

function renderTabContent(editingProduct) {
  if (adminState.tab === "products") {
    return `
      <section class="panel-card">
        <div class="panel-head">
          <div>
            <h2>${editingProduct ? "Редагувати товар" : "Додати товар"}</h2>
            <p class="muted">Заповни форму і товар одразу з’явиться в каталозі магазину</p>
          </div>
        </div>
        ${renderProductForm(editingProduct)}
      </section>

      <section class="panel-card">
        <div class="panel-head"><h2>Список товарів</h2></div>
        <div class="list-wrap">
          ${adminState.data.products.map(p => `
            <div class="list-row">
              <div class="row-info">
                <img class="thumb" src="${p.image}" alt="${escapeHtml(p.name)}">
                <div>
                  <strong>${p.name}</strong>
                  <div class="muted">${p.category} • ${p.brand}</div>
                  <div class="muted">${formatMoney(p.price)} • Залишок: ${p.stock}</div>
                </div>
              </div>
              <div class="row-actions">
                <button class="secondary-btn small-btn" onclick="editProduct('${p.id}')">Редагувати</button>
                <button class="header-btn small-btn" onclick="deleteProduct('${p.id}')">Видалити</button>
              </div>
            </div>
          `).join("")}
        </div>
      </section>
    `;
  }

  if (adminState.tab === "categories") {
    return `
      <section class="panel-card">
        <div class="panel-head">
          <div>
            <h2>Категорії</h2>
            <p class="muted">Додавай та видаляй категорії товарів</p>
          </div>
        </div>
        <form class="simple-form inline-form" onsubmit="addCategory(event)">
          <input name="categoryName" placeholder="Назва категорії" required />
          <button class="primary-btn" type="submit">Додати категорію</button>
        </form>
        <div class="tag-list">
          ${adminState.data.categories.map(c => `
            <div class="tag-row">
              <span>${c}</span>
              <button class="header-btn small-btn" onclick="deleteCategory('${c.replace(/'/g, "\'")}')">Видалити</button>
            </div>
          `).join("")}
        </div>
      </section>
    `;
  }

  if (adminState.tab === "brands") {
    return `
      <section class="panel-card">
        <div class="panel-head">
          <div>
            <h2>Бренди</h2>
            <p class="muted">Керування брендами магазину</p>
          </div>
        </div>
        <form class="simple-form inline-form" onsubmit="addBrand(event)">
          <input name="brandName" placeholder="Назва бренду" required />
          <button class="primary-btn" type="submit">Додати бренд</button>
        </form>
        <div class="tag-list">
          ${adminState.data.brands.map(b => `
            <div class="tag-row">
              <span>${b}</span>
              <button class="header-btn small-btn" onclick="deleteBrand('${b.replace(/'/g, "\'")}')">Видалити</button>
            </div>
          `).join("")}
        </div>
      </section>
    `;
  }

  if (adminState.tab === "settings") {
    return `
      <section class="panel-card">
        <div class="panel-head">
          <div>
            <h2>Пароль адмінки</h2>
            <p class="muted">Тут можна змінити пароль входу</p>
          </div>
        </div>
        <form class="simple-form" onsubmit="changePassword(event)">
          <input name="newPassword" value="${escapeHtml(adminState.data.adminPassword)}" required />
          <button class="primary-btn" type="submit">Зберегти пароль</button>
        </form>
      </section>
    `;
  }

  return `
    <section class="panel-card">
      <div class="panel-head">
        <div>
          <h2>Повне редагування JSON</h2>
          <p class="muted">Можна змінити весь магазин одним блоком</p>
        </div>
      </div>
      <textarea id="jsonEditor" class="json-editor">${escapeHtml(JSON.stringify(adminState.data, null, 2))}</textarea>
      <div class="row-actions top-gap">
        <button class="primary-btn" onclick="saveJson()">Зберегти JSON</button>
        <button class="secondary-btn" onclick="resetStore()">Скинути все</button>
      </div>
    </section>
  `;
}

function renderProductForm(product) {
  const p = product || {
    name: "",
    category: adminState.data.categories[0] || "",
    brand: adminState.data.brands[0] || "",
    price: "",
    oldPrice: "",
    stock: "",
    featured: false,
    image: "",
    description: ""
  };

  return `
    <form class="product-form" onsubmit="saveProduct(event)">
      <div class="form-grid">
        <label><span>Назва товару</span><input name="name" value="${escapeHtml(p.name)}" required /></label>
        <label><span>Категорія</span>
          <select name="category">
            ${adminState.data.categories.map(c => `<option value="${escapeHtml(c)}" ${p.category === c ? "selected" : ""}>${c}</option>`).join("")}
          </select>
        </label>
        <label><span>Бренд</span>
          <select name="brand">
            ${adminState.data.brands.map(b => `<option value="${escapeHtml(b)}" ${p.brand === b ? "selected" : ""}>${b}</option>`).join("")}
          </select>
        </label>
        <label><span>Ціна</span><input type="number" name="price" value="${p.price}" required /></label>
        <label><span>Стара ціна</span><input type="number" name="oldPrice" value="${p.oldPrice}" /></label>
        <label><span>Кількість на складі</span><input type="number" name="stock" value="${p.stock}" /></label>
      </div>
      <label><span>Фото URL</span><input name="image" value="${escapeHtml(p.image)}" required /></label>
      <label><span>Опис</span><textarea name="description">${escapeHtml(p.description)}</textarea></label>
      <label class="checkbox-row"><input type="checkbox" name="featured" ${p.featured ? "checked" : ""}> Хіт продажів</label>
      <div class="row-actions">
        <button class="primary-btn" type="submit">${product ? "Оновити товар" : "Додати товар"}</button>
        ${product ? `<button class="secondary-btn" type="button" onclick="cancelEdit()">Скасувати</button>` : ""}
      </div>
    </form>
  `;
}

function saveProduct(e) {
  e.preventDefault();
  const form = new FormData(e.target);
  const data = structuredClone(adminState.data);

  const product = {
    id: adminState.editingId || "p" + Date.now(),
    name: form.get("name"),
    category: form.get("category"),
    brand: form.get("brand"),
    price: Number(form.get("price") || 0),
    oldPrice: Number(form.get("oldPrice") || 0),
    stock: Number(form.get("stock") || 0),
    featured: form.get("featured") === "on",
    image: form.get("image"),
    description: form.get("description")
  };

  const index = data.products.findIndex(p => p.id === product.id);
  if (index >= 0) data.products[index] = product;
  else data.products.unshift(product);

  adminState.editingId = null;
  saveStoreData(data);
  renderAdmin();
}
window.saveProduct = saveProduct;

function editProduct(id) {
  adminState.editingId = id;
  adminState.tab = "products";
  renderAdmin();
}
window.editProduct = editProduct;

function cancelEdit() {
  adminState.editingId = null;
  renderAdmin();
}
window.cancelEdit = cancelEdit;

function deleteProduct(id) {
  const data = structuredClone(adminState.data);
  data.products = data.products.filter(p => p.id !== id);
  saveStoreData(data);
  renderAdmin();
}
window.deleteProduct = deleteProduct;

function addCategory(e) {
  e.preventDefault();
  const value = new FormData(e.target).get("categoryName").toString().trim();
  if (!value) return;
  const data = structuredClone(adminState.data);
  if (!data.categories.includes(value)) data.categories.push(value);
  saveStoreData(data);
  renderAdmin();
}
window.addCategory = addCategory;

function deleteCategory(value) {
  const data = structuredClone(adminState.data);
  data.categories = data.categories.filter(c => c !== value);
  if (data.categories.length === 0) data.categories.push("Без категорії");
  data.products = data.products.map(p => p.category === value ? { ...p, category: data.categories[0] } : p);
  saveStoreData(data);
  renderAdmin();
}
window.deleteCategory = deleteCategory;

function addBrand(e) {
  e.preventDefault();
  const value = new FormData(e.target).get("brandName").toString().trim();
  if (!value) return;
  const data = structuredClone(adminState.data);
  if (!data.brands.includes(value)) data.brands.push(value);
  saveStoreData(data);
  renderAdmin();
}
window.addBrand = addBrand;

function deleteBrand(value) {
  const data = structuredClone(adminState.data);
  data.brands = data.brands.filter(b => b !== value);
  if (data.brands.length === 0) data.brands.push("Інше");
  data.products = data.products.map(p => p.brand === value ? { ...p, brand: data.brands[0] } : p);
  saveStoreData(data);
  renderAdmin();
}
window.deleteBrand = deleteBrand;

function changePassword(e) {
  e.preventDefault();
  const value = new FormData(e.target).get("newPassword").toString().trim();
  if (!value) return;
  const data = structuredClone(adminState.data);
  data.adminPassword = value;
  saveStoreData(data);
  alert("Пароль змінено");
  renderAdmin();
}
window.changePassword = changePassword;

function saveJson() {
  try {
    const parsed = JSON.parse(document.getElementById("jsonEditor").value);
    saveStoreData(parsed);
    renderAdmin();
    alert("JSON збережено");
  } catch (e) {
    alert("Помилка в JSON");
  }
}
window.saveJson = saveJson;

function resetStore() {
  localStorage.removeItem(STORE_KEY);
  adminState.data = getStoreData();
  adminState.editingId = null;
  renderAdmin();
}
window.resetStore = resetStore;

window.addEventListener("storage", renderAdmin);
renderAdmin();
