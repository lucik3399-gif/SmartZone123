requireAdmin();

const paymentForm = document.getElementById('paymentForm');
const paymentsList = document.getElementById('paymentsList');

function renderPayments(){
  const methods = getPaymentMethods();

  if(!methods.length){
    paymentsList.innerHTML = '<div class="empty">Способів оплати поки немає.</div>';
    return;
  }

  paymentsList.innerHTML = methods.map(method => `
    <div class="admin-item">
      <div style="width:78px;height:78px;border-radius:16px;background:#f8fafc;display:grid;place-items:center;font-size:28px;">💳</div>
      <div>
        <strong>${method.name}</strong>
        <div class="meta" style="margin:6px 0 0;">Код: ${method.id} • Тип: ${method.type === 'online' ? 'онлайн' : 'офлайн'} • ${method.enabled ? 'Увімкнено' : 'Вимкнено'}</div>
        <div class="muted" style="margin-top:6px;">${method.description || 'Опис не вказано'}</div>
        <div class="muted" style="margin-top:6px;">${method.recipient ? 'Отримувач: ' + method.recipient + ' • ' : ''}${method.cardNumber ? 'Картка: ' + method.cardNumber + ' • ' : ''}${method.iban ? 'IBAN: ' + method.iban : ''}</div>
      </div>
      <div style="display:flex; gap:8px; flex-wrap:wrap; justify-content:flex-end;">
        <button class="ghost-btn" onclick="editPayment('${method.id}')">Редагувати</button>
        <button class="danger-btn" onclick="deletePayment('${method.id}')">Видалити</button>
      </div>
    </div>
  `).join('');
}

function editPayment(id){
  const method = getPaymentMethods().find(item => item.id === id);
  if(!method) return;
  paymentForm.name.value = method.name || '';
  paymentForm.id.value = method.id || '';
  paymentForm.type.value = method.type || 'offline';
  paymentForm.description.value = method.description || '';
  paymentForm.recipient.value = method.recipient || '';
  paymentForm.cardNumber.value = method.cardNumber || '';
  paymentForm.iban.value = method.iban || '';
  paymentForm.instructions.value = method.instructions || '';
  paymentForm.enabled.checked = !!method.enabled;
  showToast('Режим редагування', 'Спосіб оплати завантажено у форму.');
}

function deletePayment(id){
  const methods = getPaymentMethods().filter(item => item.id !== id);
  setPaymentMethods(methods);
  renderPayments();
  showToast('Видалено', 'Спосіб оплати видалено.');
}

paymentForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const form = new FormData(paymentForm);
  const method = {
    name: String(form.get('name') || '').trim(),
    id: String(form.get('id') || '').trim().toLowerCase(),
    type: String(form.get('type') || 'offline'),
    description: String(form.get('description') || '').trim(),
    recipient: String(form.get('recipient') || '').trim(),
    cardNumber: String(form.get('cardNumber') || '').trim(),
    iban: String(form.get('iban') || '').trim(),
    instructions: String(form.get('instructions') || '').trim(),
    enabled: !!form.get('enabled')
  };

  if(!method.name || !method.id){
    showToast('Помилка', 'Заповни назву і код способу оплати.');
    return;
  }

  const methods = getPaymentMethods();
  const existingIndex = methods.findIndex(item => item.id === method.id);

  if(existingIndex >= 0){
    methods[existingIndex] = method;
    showToast('Оновлено', 'Спосіб оплати оновлено.');
  } else {
    methods.push(method);
    showToast('Додано', 'Новий спосіб оплати додано.');
  }

  setPaymentMethods(methods);
  paymentForm.reset();
  paymentForm.enabled.checked = true;
  renderPayments();
});

renderPayments();

window.editPayment = editPayment;
window.deletePayment = deletePayment;
