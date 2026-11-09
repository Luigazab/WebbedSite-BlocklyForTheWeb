(function () {
  let preference = 'system';
  try {
    const saved = localStorage.getItem('webbedsite.theme');
    if (['light', 'dark', 'system'].includes(saved)) preference = saved;
  } catch { /* Private browsing can disable storage. */ }
  const dark = preference === 'dark' || (preference === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.classList.toggle('dark', dark);
  document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
})();
