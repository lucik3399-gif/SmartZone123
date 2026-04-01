document.getElementById('adminLoginForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const username = document.getElementById('adminUsername').value.trim();
  const password = document.getElementById('adminPassword').value.trim();
  const creds = getAdminCredentials();
  if (username === creds.username && password === creds.password) {
    setAdminSession({ loggedIn: true, username });
    showToast('Успішний вхід', 'Переходимо в адмінку...');
    setTimeout(() => { window.location.href = 'admin.html'; }, 700);
  } else {
    showToast('Помилка входу', 'Невірний логін або пароль.');
  }
});
