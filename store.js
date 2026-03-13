const SMARTZONE_DEFAULT = {
  adminPassword: "SmartZone2026",
  categories: [
    "Смартфони",
    "Ноутбуки",
    "Планшети",
    "Навушники",
    "Смарт-годинники",
    "Аксесуари",
    "Power Bank",
    "Зарядки"
  ],
  brands: [
    "Apple",
    "Samsung",
    "Xiaomi",
    "Lenovo",
    "Asus",
    "HP"
  ],
  products: [
    {
      id: "p1",
      name: "iPhone 15 Pro",
      category: "Смартфони",
      brand: "Apple",
      price: 54999,
      oldPrice: 58999,
      stock: 8,
      featured: true,
      image: "https://images.unsplash.com/photo-1695048132832-b41495f12eb4?auto=format&fit=crop&w=900&q=80",
      description: "Преміальний смартфон Apple з потужною камерою та титановим корпусом."
    },
    {
      id: "p2",
      name: "Samsung Galaxy S24 Ultra",
      category: "Смартфони",
      brand: "Samsung",
      price: 49999,
      oldPrice: 53999,
      stock: 6,
      featured: true,
      image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=900&q=80",
      description: "Флагман Samsung для фото, роботи та щоденного використання."
    },
    {
      id: "p3",
      name: "MacBook Air 13",
      category: "Ноутбуки",
      brand: "Apple",
      price: 46999,
      oldPrice: 49999,
      stock: 4,
      featured: true,
      image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=80",
      description: "Легкий та швидкий ноутбук для навчання, роботи і подорожей."
    },
    {
      id: "p4",
      name: "Xiaomi Redmi Note 13 Pro",
      category: "Смартфони",
      brand: "Xiaomi",
      price: 15999,
      oldPrice: 18999,
      stock: 12,
      featured: false,
      image: "https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=900&q=80",
      description: "Вигідний смартфон з хорошим екраном та автономністю."
    },
    {
      id: "p5",
      name: "AirPods Pro",
      category: "Навушники",
      brand: "Apple",
      price: 9999,
      oldPrice: 11499,
      stock: 10,
      featured: true,
      image: "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?auto=format&fit=crop&w=900&q=80",
      description: "Бездротові навушники з шумозаглушенням та чудовим звуком."
    },
    {
      id: "p6",
      name: "Xiaomi Power Bank 20000",
      category: "Power Bank",
      brand: "Xiaomi",
      price: 1799,
      oldPrice: 2199,
      stock: 15,
      featured: false,
      image: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=900&q=80",
      description: "Потужний power bank для смартфонів, планшетів та інших гаджетів."
    }
  ]
};

const STORE_KEY = "smartzone-premium-multifile";
const CART_KEY = "smartzone-premium-cart";

function getStoreData() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return structuredClone(SMARTZONE_DEFAULT);
    const parsed = JSON.parse(raw);
    return {
      ...structuredClone(SMARTZONE_DEFAULT),
      ...parsed,
      categories: parsed.categories || structuredClone(SMARTZONE_DEFAULT.categories),
      brands: parsed.brands || structuredClone(SMARTZONE_DEFAULT.brands),
      products: parsed.products || structuredClone(SMARTZONE_DEFAULT.products)
    };
  } catch (e) {
    return structuredClone(SMARTZONE_DEFAULT);
  }
}

function saveStoreData(data) {
  localStorage.setItem(STORE_KEY, JSON.stringify(data));
}

function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || "[]");
  } catch (e) {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function formatMoney(value) {
  return new Intl.NumberFormat("uk-UA").format(Number(value || 0)) + " грн";
}
