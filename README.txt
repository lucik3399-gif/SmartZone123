SMARTZONE — ГОТОВИЙ СТАТИЧНИЙ САЙТ ДЛЯ GITHUB PAGES

ЩО ВСЕРЕДИНІ
- index.html — магазин для покупців
- admin.html — адмін-панель
- styles.css — дизайн
- app.js — каталог, кошик, замовлення
- admin.js — керування товарами, замовленнями, CSV імпорт

ЯК ЗАПУСТИТИ НА GITHUB PAGES
1. Створи репозиторій SmartZone
2. Завантаж у корінь всі файли з цієї папки
3. У GitHub відкрий Settings > Pages
4. Source: Deploy from a branch
5. Branch: main / root
6. Збережи
7. Через 1-3 хвилини сайт буде доступний за адресою GitHub Pages

ВХІД В АДМІНКУ
- сторінка: admin.html
- стандартний пароль: smartzone2026

ВАЖЛИВО
Це фронтенд-версія для швидкого запуску через GitHub Pages.
Замовлення, товари й кошик зберігаються в localStorage браузера.
Для справжнього бойового магазину потрібно підключити:
- бекенд
- базу даних
- реальну авторизацію
- оплату LiqPay / WayForPay / Fondy
- доставку Nova Poshta API
- серверний захист

CSV ФОРМАТ ДЛЯ ІМПОРТУ
id,name,category,price,image,badge,description
p100,iPhone 14,Смартфони,28999,https://site.com/img.jpg,Хіт,Опис товару
