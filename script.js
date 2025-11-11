// وظائف بسيطة: سنة تلقائية، تمرير سلس، وتبديل وضع النهار/الليل
document.getElementById('year').textContent = new Date().getFullYear();

// تمرير سلس
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', (e) => {
    const id = a.getAttribute('href');
    const el = document.querySelector(id);
    if (el) { e.preventDefault(); el.scrollIntoView({behavior: 'smooth'}); }
  });
});

// الوضع الداكن/الفاتح
const root = document.documentElement;
const themeToggle = document.getElementById('themeToggle');
const saved = localStorage.getItem('theme');
if (saved === 'light') root.classList.add('light');
themeToggle?.addEventListener('click', () => {
  root.classList.toggle('light');
  localStorage.setItem('theme', root.classList.contains('light') ? 'light' : 'dark');
});
