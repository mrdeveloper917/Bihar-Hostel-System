document.addEventListener('DOMContentLoaded', function () {
  const flash = document.getElementById('flash-message');
  if (flash) {
    const type = flash.dataset.type || 'success';
    const text = flash.dataset.text || '';
    Swal.fire({ icon: type === 'error' ? 'error' : 'success', title: text, timer: 2500, showConfirmButton: false });
  }
});

/* Theme toggle */
(function(){
  const btn = document.getElementById('theme-toggle');
  if (!btn) return;
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const saved = localStorage.getItem('theme');
  const initialDark = saved ? saved === 'dark' : prefersDark;
  if (initialDark) document.documentElement.setAttribute('data-theme','dark');
  btn.textContent = initialDark ? 'Light' : 'Dark';
  btn.addEventListener('click', ()=>{
    const cur = document.documentElement.getAttribute('data-theme');
    if (cur === 'dark') {
      document.documentElement.removeAttribute('data-theme');
      btn.textContent = 'Dark';
      localStorage.setItem('theme','light');
    } else {
      document.documentElement.setAttribute('data-theme','dark');
      btn.textContent = 'Light';
      localStorage.setItem('theme','dark');
    }
  });
})();
