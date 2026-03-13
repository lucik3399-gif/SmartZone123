const adminState = {
  data: getStoreData(),
  loggedIn: sessionStorage.getItem("smartzone-admin-auth") === "ok",
  editingProductId: null,
  tab: "products"
};

function escapeHtml(text) {
  return String(text ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function renderAdmin() {
  adminState.data = getStoreData();
  const app = document.getElementById("adminApp");

  if (!adminState.loggedIn) {
    app.innerHTML = `
      <div class="login-page">
        <form class="login-card" onsubmit="loginAdmin(event)">
          <span class="badge">SmartZone Admin</span>
          <h1>Вхід в адмінку</h1>
          <p class="muted">Керування товарами, категоріями і брендами</p>
          <input type="password" id="adminPassword" placeholder="Введіть пароль" required />
          <button class="primary-btn" type="submit">Увійти</button>
          <a class="secondary-btn" href="index.html">Назад на сайт</a>
        </form>
      </div>
    `;
    return;
  }

  const editingProduct = adminState.data.products.find(p => p.id === adminState.editingProductId);

  app.innerHTML = `
    <header class="admin-header">
      <div>
        <span class="badge">Панель керування</span>
        <h1>SmartZone Admin</h1>
      </div>
      <div class="admin-actions">
        <a class="secondary-btn small-btn" href="index.html">Відкрити сайт</a>
        <button class="ghost-btn small-btn" onclick="logoutAdmin()">Вийти</button>
      </div>
    </header>

    <section class="admin-stats">
      <div class="stat-card"><strong>${adminState.data.products.length}</strong><span>товарів</span></div>
      <div class="stat-card"><strong>${adminState.data.categories.length}</strong><span>категорій</span></div>
      <div class="stat-card"><strong>${adminState.data.brands.length}</strong><span>брендів</span></div>
    </section>

    <section class="admin-layout">
      <aside class="sidebar">
        <button class="side-btn ${adminState.tab === "products" ? "active" : ""}" onclick="switchTab('products')">Товари</button>
        <button class="side-btn ${adminState.tab === "categories" ? "active" : ""}" onclick="switchTab('categories')">Категорії</button>
        <button class="side-btn ${adminState.tab === "brands" ? "active" : ""}" onclick="switchTab('brands')">Бренди</button>
        <button class="side-btn ${adminState.tab === "settings" ? "active" : ""}" onclick="switchTab('settings')">Налаштування</button>
        <button class="side-btn ${adminState.tab === "json" ? "active" : ""}" onclick="switchTab('json')">JSON</button>
      </aside>

      <main class="admin-main">
        ${renderTabContent(editingProduct)}
      </main>
    </section>
  `;
}

function switchTab(tab) {
  adminState.tab = tab;
  renderAdmin();
}
window.switchTab = switchTab;

function loginAdmin(event) {
  event.preventDefault();
  const pass = document.getElementById("adminPassword").value;
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

function saveData(newData) {
  saveStoreData(newData);
  adminState.data = newData;
  renderAdmin();
}

function renderTabContent(editingProduct) {
  if (adminState.tab === "products") {
    return `
      <section class="panel-card">
        <div class="panel-head">
          <div>
            <h2>${editingProduct ? "Редагувати товар" : "Додати новий товар"}</h2>
            <p class="muted">Заповни форму і товар одразу з’явиться в каталозі</p>
          </div>
        </div>
        ${renderProductForm(editingProduct)}
      </section>

      <section class="panel-card">
        <div class="panel-head">
          <div>
            <h2>Список товарів</h2>
          </div>
        </div>
        <div class="list-wrap">
          ${adminState.data.products.map(p => `
            <div class="list-row">
              <div class="row-info">
                <img src="${p.image}" alt="${escapeHtml(p.name)}" class="thumb">
                <div>
                  <strong>${p.name}</strong>
                  <div class="muted">${p.category} • ${p.brand}</div>
                  <div class="muted">${formatMoney(p.price)} • Залишок: ${p.stock}</div>
                </div>
              </div>
              <div class="row-actions">
                <button class="secondary-btn small-btn" onclick="editProduct('${p.id}')">Редагувати</button>
                <button class="ghost-btn small-btn" onclick="deleteProduct('${p.id}')">Видалити</button>
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
            <h2>Категорії товарів</h2>
            <p class="muted">Додавай і видаляй категорії</p>
          </div>
        </div>
        <form class="simple-form inline" onsubmit="addCategory(event)">
          <input name="categoryName" placeholder="Назва категорії" required />
          <button class="primary-btn" type="submit">Додати категорію</button>
        </form>
        <div class="tag-list">
          ${adminState.data.categories.map(cat => `
            <div class="tag-row">
              <span>${cat}</span>
              <button class="ghost-btn small-btn" onclick="deleteCategory('${cat.replace(/'/g, "\'")}')">Видалити</button>
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
            <p class="muted">Керування списком брендів</p>
          </div>
        </div>
        <form class="simple-form inline" onsubmit="addBrand(event)">
          <input name="brandName" placeholder="Назва бренду" required />
          <button class="primary-btn" type="submit">Додати бренд</button>
        </form>
        <div class="tag-list">
          ${adminState.data.brands.map(brand => `
            <div class="tag-row">
              <span>${brand}</span>
              <button class="ghost-btn small-btn" onclick="deleteBrand('${brand.replace(/'/g, "\'")}')">Видалити</button>
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
            <h2>Налаштування адмінки</h2>
            <p class="muted">Тут можна змінити пароль входу</p>
          </div>
        </div>
        <form class="simple-form" onsubmit="changePassword(event)">
          <input name="newPassword" placeholder="Новий пароль" value="${escapeHtml(adminState.data.adminPassword)}" required />
          <button class="primary-btn" type="submit">Зберегти пароль</button>
        </form>
      </section>
    `;
  }

  return `
    <section class="panel-card">
      <div class="panel-head">
        <div>
          <h2>Повне редагування через JSON</h2>
          <p class="muted">Можна змінити весь магазин одним файлом</p>
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
    id: "",
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
            ${adminState.data.categories.map(cat => `<option value="${escapeHtml(cat)}" ${p.category === cat ? "selected" : ""}>${cat}</option>`).join("")}
          </select>
        </label>
        <label><span>Бренд</span>
          <select name="brand">
            ${adminState.data.brands.map(brand => `<option value="${escapeHtml(brand)}" ${p.brand === brand ? "selected" : ""}>${brand}</option>`).join("")}
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

function saveProduct(event) {
  event.preventDefault();
  const form = new FormData(event.target);

  const product = {
    id: adminState.editingProductId || "p" + Date.now(),
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

  const data = structuredClone(adminState.data);
  const index = data.products.findIndex(p => p.id === product.id);
  if (index >= 0) data.products[index] = product;
  else data.products.unshift(product);

  saveData(data);
  adminState.editingProductId = null;
}
window.saveProduct = saveProduct;

function editProduct(id) {
  adminState.editingProductId = id;
  adminState.tab = "products";
  renderAdmin();
}
window.editProduct = editProduct;

function cancelEdit() {
  adminState.editingProductId = null;
  renderAdmin();
}
window.cancelEdit = cancelEdit;

function deleteProduct(id) {
  const data = structuredClone(adminState.data);
  data.products = data.products.filter(p => p.id !== id);
  saveData(data);
}
window.deleteProduct = deleteProduct;

function addCategory(event) {
  event.preventDefault();
  const categoryName = new FormData(event.target).get("categoryName").toString().trim();
  if (!categoryName) return;
  const data = structuredClone(adminState.data);
  if (!data.categories.includes(categoryName)) data.categories.push(categoryName);
  saveData(data);
}
window.addCategory = addCategory;

function deleteCategory(category) {
  const data = structuredClone(adminState.data);
  data.categories = data.categories.filter(c => c !== category);
  data.products = data.products.map(p => p.category === category ? { ...p, category: data.categories[0] || "Без категорії" } : p);
  if (data.categories.length === 0) data.categories.push("Без категорії");
  saveData(data);
}
window.deleteCategory = deleteCategory;

function addBrand(event) {
  event.preventDefault();
  const brandName = new FormData(event.target).get("brandName").toString().trim();
  if (!brandName) return;
  const data = structuredClone(adminState.data);
  if (!data.brands.includes(brandName)) data.brands.push(brandName);
  saveData(data);
}
window.addBrand = addBrand;

function deleteBrand(brand) {
  const data = structuredClone(adminState.data);
  data.brands = data.brands.filter(b => b !== brand);
  data.products = data.products.map(p => p.brand === brand ? { ...p, brand: data.brands[0] || "Інше" } : p);
  if (data.brands.length === 0) data.brands.push("Інше");
  saveData(data);
}
window.deleteBrand = deleteBrand;

function changePassword(event) {
  event.preventDefault();
  const newPassword = new FormData(event.target).get("newPassword").toString().trim();
  if (!newPassword) return;
  const data = structuredClone(adminState.data);
  data.adminPassword = newPassword;
  saveData(data);
  alert("Пароль змінено");
}
window.changePassword = changePassword;

function saveJson() {
  try {
    const text = document.getElementById("jsonEditor").value;
    const parsed = JSON.parse(text);
    saveData(parsed);
    alert("JSON збережено");
  } catch (e) {
    alert("Помилка в JSON");
  }
}
window.saveJson = saveJson;

function resetStore() {
  localStorage.removeItem(SMARTZONE_STORAGE_KEY);
  adminState.data = getStoreData();
  adminState.editingProductId = null;
  renderAdmin();
}
window.resetStore = resetStore;

window.addEventListener("storage", renderAdmin);
renderAdmin();
