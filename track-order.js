const trackForm = document.getElementById('trackForm');
const trackResult = document.getElementById('trackResult');

trackForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const form = new FormData(trackForm);
  const orderId = String(form.get('orderId') || '').trim();
  const phone = normalizePhone(form.get('phone') || '');

  const order = getOrders().find(o => o.id === orderId && normalizePhone(o.customer.phone) === phone);

  if (!order) {
    trackResult.innerHTML = '<div class="empty">Замовлення не знайдено. Перевір номер і телефон.</div>';
    showToast('Не знайдено', 'Дані не співпали.');
    return;
  }

  trackResult.innerHTML = `
    <div class="order-card glass">
      <div class="order-top">
        <div>
          <strong style="font-size:20px;">${order.id}</strong>
          <div class="meta" style="margin-top:8px;">${new Date(order.createdAt).toLocaleString('uk-UA')}</div>
        </div>
        <div class="status-badge ${statusClass(order.status)}">${statusLabel(order.status)}</div>
      </div>
      <div class="order-grid">
        <div class="panel glass">
          <strong>Клієнт</strong>
          <p style="margin-top:8px;">${order.customer.name || '—'}</p>
          <p>${order.customer.phone || '—'}</p>
          <p>${order.customer.city || '—'}</p>
        </div>
        <div class="panel glass">
          <strong>Підсумок</strong>
          <p style="margin-top:8px;">Тип: ${order.type === 'cart' ? 'Кошик' : 'Швидка заявка'}</p>
          <p>Сума: ${formatPrice(order.total || 0)}</p>
          <p>Коментар: ${order.customer.comment || 'Немає'}</p>
        </div>
      </div>
      ${order.items && order.items.length ? `
        <div class="order-items">
          <strong>Товари</strong>
          ${order.items.map(item => `<div class="meta">${item.title} • ${item.qty} шт • ${formatPrice(item.total)}</div>`).join('')}
        </div>
      ` : ''}
    </div>
  `;
  showToast('Готово', 'Замовлення знайдено.');
});
