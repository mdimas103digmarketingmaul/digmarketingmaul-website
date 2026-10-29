
(function(){
  try {
    const international = localStorage.getItem('maulProductsInternational') === 'true' || localStorage.getItem('maulCourseInternational') === 'true';
    document.documentElement.dataset.international = international ? 'true' : 'false';
  } catch (_) {
    document.documentElement.dataset.international = 'false';
  }
})();
