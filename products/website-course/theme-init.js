(function () {
  let theme = 'light';
  let language = 'id';
  let international = false;
  try {
    const savedTheme = localStorage.getItem('maulSiteTheme') || localStorage.getItem('maulCommerceTheme');
    if (savedTheme === 'dark') theme = 'dark';
    if (localStorage.getItem('maulCommerceLanguage') === 'en') language = 'en';
    international = localStorage.getItem('maulCourseInternational') === 'true';
  } catch (_) { /* Defaults remain available without browser storage. */ }
  document.documentElement.dataset.theme = theme;
  document.documentElement.dataset.language = language;
  document.documentElement.dataset.international = String(international);
})();
