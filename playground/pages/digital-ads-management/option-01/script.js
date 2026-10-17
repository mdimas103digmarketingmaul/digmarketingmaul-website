/* Shared preference keys and MauldigitalUI contract are preserved. */
(function () {
  'use strict';
  const root = document.documentElement;
  const form = document.getElementById('brief-form');
  const waBase = 'https://wa.me/6281296069566?text=';
  const intros = {
    id: 'Halo Maul, saya tertarik dengan Digital Ads Management. Saya ingin mendiskusikan kebutuhan pengelolaan, scope, dan fee untuk bisnis saya.',
    en: 'Hello Maul, I am interested in Digital Ads Management. I would like to discuss management needs, scope, and fees for my business.'
  };
  function currentLanguage() { return root.dataset.language === 'en' ? 'en' : 'id'; }
  function currentTheme() { return root.dataset.theme === 'dark' ? 'dark' : 'light'; }
  function save(key, value) { try { localStorage.setItem(key, value); } catch (_) {} }
  function updateBrief() {
    const lang = currentLanguage();
    const labels = lang === 'en'
      ? {business:'Business / product',goal:'Objective',platform:'Platform',budget:'Monthly ad budget',package:'Package of interest',tracking:'Tracking status'}
      : {business:'Bisnis / produk',goal:'Tujuan',platform:'Platform',budget:'Budget iklan / bulan',package:'Paket yang diminati',tracking:'Kondisi tracking'};
    const lines = [intros[lang]];
    for (const [name, label] of Object.entries(labels)) {
      const field = form.elements.namedItem(name);
      if (!field.value.trim()) continue;
      const value = field.tagName === 'SELECT' ? field.selectedOptions[0].textContent : field.value.trim();
      lines.push(label + ': ' + value);
    }
    document.getElementById('brief-cta').href = waBase + encodeURIComponent(lines.join('\n\n'));
  }
  function syncLanguage() {
    const lang = currentLanguage();
    document.querySelectorAll('option[data-id]').forEach(option => { option.textContent = option.dataset[lang]; });
    document.querySelectorAll('[data-placeholder-id]').forEach(input => { input.placeholder = lang === 'en' ? input.dataset.placeholderEn : input.dataset.placeholderId; });
    document.querySelectorAll('[data-whatsapp]').forEach(link => { link.href = waBase + encodeURIComponent(intros[lang]); });
    document.querySelectorAll('[data-maul-language-select]').forEach(select => { select.value = lang; });
    updateBrief();
  }
  function applyLanguage(language, persist = true) {
    const lang = language === 'en' || root.dataset.international === 'true' ? 'en' : 'id';
    root.lang = lang;
    root.dataset.language = lang;
    if (persist) save('maulCommerceLanguage', lang);
    document.dispatchEvent(new CustomEvent('commerce-language-change', {detail:{language:lang}}));
  }
  function applyTheme(theme, persist = true) {
    const next = theme === 'dark' ? 'dark' : 'light';
    root.dataset.theme = next;
    document.querySelector('meta[name="theme-color"]').content = next === 'dark' ? '#0e1622' : '#f5f3ef';
    document.querySelectorAll('[data-maul-theme-select]').forEach(select => { select.value = next; });
    if (persist) { save('maulCommerceTheme', next); save('maulSiteTheme', next); }
  }
  window.MauldigitalUI = {getTheme:currentTheme, getLanguage:currentLanguage, applyTheme, applyLanguage};
  document.addEventListener('commerce-language-change', syncLanguage);
  applyTheme(currentTheme(), false);
  applyLanguage(currentLanguage(), false);
  form.addEventListener('input', updateBrief);
  form.addEventListener('change', updateBrief);
  // Enter in a field must not navigate or send a message.
  form.addEventListener('submit', event => { event.preventDefault(); document.getElementById('brief-cta').focus(); });
  document.querySelectorAll('[data-package]').forEach(link => {
    link.addEventListener('click', () => {
      form.elements.namedItem('package').value = link.dataset.package;
      updateBrief();
    });
  });
  function openLinkedArea(hash) {
    if (!/^#area-0[1-7]$/.test(hash)) return;
    const target = document.getElementById(hash.slice(1));
    if (target) target.open = true;
  }
  document.querySelectorAll('.system-row').forEach(link => link.addEventListener('click', () => openLinkedArea(link.hash)));
  window.addEventListener('hashchange', () => openLinkedArea(location.hash));
  openLinkedArea(location.hash);
  if ('IntersectionObserver' in window) {
    const links = [...document.querySelectorAll('.section-nav a')];
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        links.forEach(link => {
          const active = link.hash === '#' + entry.target.id;
          link.classList.toggle('active', active);
          if (active) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
      });
    }, {rootMargin:'-25% 0px -55% 0px', threshold:0});
    links.forEach(link => { const section = document.getElementById(link.hash.slice(1)); if (section) observer.observe(section); });
  }
})();

