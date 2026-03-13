const SMARTZONE_DEFAULT_DATA = {
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
      description: "Преміальний смартфон Apple з потужною камерою і швидкою роботою."
    },
    {
      id: "p2",
      name: "Samsung Galaxy S24",
      category: "Смартфони",
      brand: "Samsung",
      price: 39999,
      oldPrice: 42999,
      stock: 5,
      featured: true,
      image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=900&q=80",
      description: "Флагманський смартфон Samsung з яскравим дисплеєм."
    },
    {
      id: "p3",
      name: "Lenovo Gaming Laptop",
      category: "Ноутбуки",
      brand: "Lenovo",
      price: 45999,
      oldPrice: 48999,
      stock: 3,
      featured: false,
      image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=80",
      description: "Потужний ноутбук для ігор, роботи та навчання."
    },
    {
      id: "p4",
      name: "AirPods Pro",
      category: "Навушники",
      brand: "Apple",
      price: 9999,
      oldPrice: 11499,
      stock: 12,
      featured: true,
      image: "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?auto=format&fit=crop&w=900&q=80",
      description: "Бездротові навушники з активним шумозаглушенням."
    },
    {
      id: "p5",
      name: "Xiaomi Power Bank 20000",
      category: "Power Bank",
      brand: "Xiaomi",
      price: 1799,
      oldPrice: 2199,
      stock: 14,
      featured: false,
      image: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=900&q=80",
      description: "Місткий power bank для смартфонів, планшетів і гаджетів."
    }
  ]
};

const SMARTZONE_STORAGE_KEY = "smartzone-admin-panel-data";

function getStoreData() {
  try {
    const raw = localStorage.getItem(SMARTZONE_STORAGE_KEY);
    if (!raw) return structuredClone(SMARTZONE_DEFAULT_DATA);
    const parsed = JSON.parse(raw);
    return {
      ...structuredClone(SMARTZONE_DEFAULT_DATA),
      ...parsed,
      categories: parsed.categories || structuredClone(SMARTZONE_DEFAULT_DATA.categories),
      brands: parsed.brands || structuredClone(SMARTZONE_DEFAULT_DATA.brands),
      products: parsed.products || structuredClone(SMARTZONE_DEFAULT_DATA.products)
    };
  } catch (e) {
    return structuredClone(SMARTZONE_DEFAULT_DATA);
  }
}

function saveStoreData(data) {
  localStorage.setItem(SMARTZONE_STORAGE_KEY, JSON.stringify(data));
}

function formatMoney(value) {
  return new Intl.NumberFormat("uk-UA").format(Number(value || 0)) + " грн";
}
