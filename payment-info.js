const paymentLookupForm = document.getElementById('paymentLookupForm');
const paymentInfoResult = document.getElementById('paymentInfoResult');

function paymentStatusLabel(status){
  const map = {
    unpaid: 'Не оплачено',
    pending: 'Очікує оплату',
    paid: 'Оплачено'
  };
  return map[status] || 'Не вказано';
}

function paymentStatusClass(status){
  if(status === 'paid') return 'status-done';
  if(status === 'pending') return 'status-processing';
  return 'status-new';
}

function markOrderPaid(id){
  const orders = getOrders();
  const order = orders.find(item => item.id === id);
  if(!order) return;
  order.paymentStatus = 'paid';
  setOrders(orders);
  renderPaymentInfo(order);
  showToast('Дякуємо', 'Позначили замовлення як оплачене.');
}

function renderPaymentInfo(order){
  paymentInfoResult.innerHTML = `
    <div class="order-card">
      <div class="order-top">
        <div>
          <strong style="font-size:20px;">${order.id}</strong>
          <div class="meta" style="margin-top:8px;">Оплата: ${order.paymentMethodName || order.paymentMethod || 'Не вказано'}</div>
        </div>
        <div class="status-badge ${paymentStatusClass(order.paymentStatus)}">${paymentStatusLabel(order.paymentStatus)}</div>
      </div>

      <div class="panel" style="margin-top:10px;">
        <strong>Інструкція</strong>
        <p class="muted" style="margin-top:8px;">${order.paymentInstructions || 'Інструкція не задана.'}</p>
        ${order.paymentRecipient ? `<p class="muted">Отримувач: ${order.paymentRecipient}</p>` : ''}
        ${order.paymentCardNumber ? `<p class="muted">Картка: ${order.paymentCardNumber}</p>` : ''}
        ${order.paymentIban ? `<p class="muted">IBAN: ${order.paymentIban}</p>` : ''}
        <p class="muted">Сума до оплати: ${formatPrice(order.total || 0)}</p>
      </div>

      <div style="margin-top:14px; display:flex; gap:10px; flex-wrap:wrap;">
        <button class="main-btn" onclick="markOrderPaid('${order.id}')">Я оплатив</button>
        <a class="soft-btn" href="account.html">Перейти в кабінет</a>
      </div>
    </div>
  `;
}

paymentLookupForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const form = new FormData(paymentLookupForm);
  const orderId = String(form.get('orderId') || '').trim();
  const phone = normalizePhone(form.get('phone') || '');
  const order = getOrders().find(item => item.id === orderId && normalizePhone(item.customer.phone) === phone);

  if(!order){
    paymentInfoResult.innerHTML = '<div class="empty">Замовлення не знайдено. Перевір номер і телефон.</div>';
    showToast('Не знайдено', 'Дані не співпали.');
    return;
  }

  renderPaymentInfo(order);
});

window.markOrderPaid = markOrderPaid;
