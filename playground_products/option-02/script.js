/* No shared scripts, checkout SDKs, or backend calls. */
(() => {
  'use strict';
  const root = document.documentElement;
  const toggle = document.querySelector('#international-toggle');
  const languageSelect = document.querySelector('#language-select');
  const themeSelect = document.querySelector('#theme-select');
  const announcement = document.querySelector('#mode-announcement');
  const notice = document.querySelector('#international-notice');
  const copies = [...document.querySelectorAll('[data-copy-lang]')];
  const priceElements = [...document.querySelectorAll('[data-price-id][data-price-usd]')];
  const ctas = [...document.querySelectorAll('[data-product-cta]')];
  const unavailable = [...document.querySelectorAll('[data-unavailable]')];
  const activeInternationalIds = new Set(['website-course', 'website-development', 'digital-marketing-ebooks']);
  const preferenceKeys = { theme: 'maulOption02Theme', language: 'maulOption02Language', international: 'maulOption02International' };
  function read(key) { try { return localStorage.getItem(key); } catch (_) { return null; } }
  function save(key, value) { try { localStorage.setItem(key, value); } catch (_) { /* In-memory controls still work. */ } }
  const savedInternational = read(preferenceKeys.international);
  let international = savedInternational !== null ? savedInternational === 'true' :
    read('maulProductsInternational') === 'true' || read('maulCourseInternational') === 'true';
  let regularLanguage = (read(preferenceKeys.language) || read('maulCommerceLanguage')) === 'en' ? 'en' : 'id';
  let currentLanguage = regularLanguage;

  // Keep the original destination in memory; leaving International restores it exactly.
  const destinations = new Map(ctas.map(cta => [cta, cta.getAttribute('href')]));
  function whatsappUrl(card) {
    const name = card.dataset.productNameEn;
    const message = `Hi Maul, I am interested in ${name} (International). Could you help me with the purchase/payment process?`;
    return 'https://wa.me/6281296069566?text=' + encodeURIComponent(message);
  }
  function applyTheme(theme, persist = true) {
    const selected = theme === 'light' ? 'light' : 'dark';
    root.dataset.productsTheme = selected;
    themeSelect.value = selected;
    document.querySelector('meta[name="theme-color"]').setAttribute('content', selected === 'light' ? '#f6f7f9' : '#07111f');
    if (persist) save(preferenceKeys.theme, selected);
  }
  function render(announce = false) {
    currentLanguage = international ? 'en' : regularLanguage;
    root.lang = currentLanguage;
    root.dataset.international = String(international);
    toggle.setAttribute('aria-pressed', String(international));
    languageSelect.value = currentLanguage;
    languageSelect.querySelector('option[value="id"]').disabled = international;
    notice.hidden = !international;
    copies.forEach(el => { el.hidden = el.dataset.copyLang !== currentLanguage; });
    priceElements.forEach(el => { el.textContent = international ? el.dataset.priceUsd : el.dataset.priceId; });
    ctas.forEach(cta => {
      const card = cta.closest('[data-product-id]');
      const label = cta.querySelector('.cta-label');
      const active = activeInternationalIds.has(card.dataset.productId);
      cta.classList.toggle('is-international', international && active);
      // This guard ensures any future non-allowlisted CTA cannot become internationally purchasable.
      if (international && !active) {
        cta.removeAttribute('href');
        cta.setAttribute('aria-disabled', 'true');
        cta.setAttribute('tabindex', '-1');
        label.textContent = 'Not available internationally';
      } else {
        cta.removeAttribute('aria-disabled');
        cta.removeAttribute('tabindex');
        cta.href = international ? whatsappUrl(card) : destinations.get(cta);
        label.textContent = international ? 'Contact via WhatsApp' : currentLanguage === 'id' ? label.dataset.ctaId : label.dataset.ctaEn;
        if (international) { cta.target = '_blank'; cta.rel = 'noopener noreferrer'; }
        else { cta.removeAttribute('target'); cta.removeAttribute('rel'); }
      }
      const paypal = card.querySelector('[data-paypal]');
      const localPayment = card.querySelector('[data-local-payment]');
      if (paypal) paypal.hidden = !(international && active);
      if (localPayment) localPayment.hidden = international;
    });
    unavailable.forEach(button => {
      button.disabled = true;
      button.querySelector('[data-disabled-label]').textContent = international ? 'Not available internationally' :
        currentLanguage === 'id' ? 'Checkout segera tersedia' : 'Checkout coming soon';
    });
    if (announce) announcement.textContent = international ?
      'International mode on. English and USD. Three products support WhatsApp enquiries; eBooks is a live test. Other products are unavailable internationally.' :
      currentLanguage === 'id' ? 'Mode domestik. Bahasa Indonesia dan harga Rupiah.' : 'Domestic mode. English and Indonesian Rupiah prices.';
  }
  languageSelect.addEventListener('change', () => {
    if (!international) {
      regularLanguage = languageSelect.value === 'en' ? 'en' : 'id';
      save(preferenceKeys.language, regularLanguage);
    }
    render(true);
  });
  themeSelect.addEventListener('change', () => applyTheme(themeSelect.value));
  toggle.addEventListener('click', () => {
    international = !international;
    save(preferenceKeys.international, String(international));
    render(true);
  });
  applyTheme(root.dataset.productsTheme, false);
  render();
  [toggle, languageSelect, themeSelect].forEach(control => { control.disabled = false; });

  // One frame per scroll tick. No layout reads on pointer movement or perpetual animation loops.
  const progress = document.querySelector('.reading-progress');
  let scrollFrame = 0;
  const updateProgress = () => {
    scrollFrame = 0;
    const total = root.scrollHeight - window.innerHeight;
    const fraction = total > 0 ? Math.min(1, Math.max(0, window.scrollY / total)) : 0;
    progress.style.transform = `scaleX(${fraction})`;
  };
  const queueProgress = () => { if (!scrollFrame) scrollFrame = requestAnimationFrame(updateProgress); };
  window.addEventListener('scroll', queueProgress, { passive: true });
  window.addEventListener('resize', queueProgress, { passive: true });
  updateProgress();

  // Small, local depth response. Always off for touch and reduced motion.
  const art = document.querySelector('[data-depth]');
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const pointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  let bounds = null;
  let pointerFrame = 0;
  let point = null;
  const resetDepth = () => {
    if (pointerFrame) cancelAnimationFrame(pointerFrame);
    pointerFrame = 0;
    point = null;
    art.style.removeProperty('--tilt-x');
    art.style.removeProperty('--tilt-y');
    art.style.removeProperty('--spot-x');
    art.style.removeProperty('--spot-y');
  };
  art.addEventListener('pointerenter', () => { bounds = art.getBoundingClientRect(); });
  art.addEventListener('pointermove', event => {
    if (motion.matches || !pointer.matches || !bounds) return;
    point = { x: (event.clientX - bounds.left) / bounds.width, y: (event.clientY - bounds.top) / bounds.height };
    if (pointerFrame) return;
    pointerFrame = requestAnimationFrame(() => {
      pointerFrame = 0;
      if (!point) return;
      art.style.setProperty('--tilt-x', `${(0.5 - point.y) * 5}deg`);
      art.style.setProperty('--tilt-y', `${(point.x - 0.5) * 7}deg`);
      art.style.setProperty('--spot-x', `${point.x * 100}%`);
      art.style.setProperty('--spot-y', `${point.y * 100}%`);
    });
  }, { passive: true });
  art.addEventListener('pointerleave', resetDepth);
  window.addEventListener('scroll', () => { bounds = null; resetDepth(); }, { passive: true });
  window.addEventListener('resize', () => { bounds = null; resetDepth(); }, { passive: true });
  motion.addEventListener('change', resetDepth);
  pointer.addEventListener('change', resetDepth);
})();
