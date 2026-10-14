/* Progressive enhancement only. Content and native accordions work without JS. */
(() => {
  'use strict';
  const root = document.documentElement;
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const mobile = window.matchMedia('(max-width: 700px)');
  const tabs = [...document.querySelectorAll('[data-tab]')];
  const panels = [...document.querySelectorAll('.stack-panel')];
  const tablist = document.querySelector('.stack-tabs');
  const menu = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#navigation');
  const stage = document.querySelector('.portrait-stage');
  const progress = document.querySelector('.scroll-progress');

  function selectTab(key, focus = false) {
    if (!tabs.some(tab => tab.dataset.tab === key)) return;
    tabs.forEach(tab => {
      const active = tab.dataset.tab === key;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      if (active && focus) tab.focus({ preventScroll: true });
    });
    panels.forEach(panel => { panel.hidden = panel.id !== `panel-${key}`; });
  }
  tablist.setAttribute('role', 'tablist');
  tabs.forEach((tab, index) => {
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', `panel-${tab.dataset.tab}`);
    const panel = document.getElementById(`panel-${tab.dataset.tab}`);
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', tab.id);
    panel.tabIndex = 0;
    tab.addEventListener('click', () => selectTab(tab.dataset.tab));
    tab.addEventListener('keydown', event => {
      const previous = mobile.matches ? 'ArrowLeft' : 'ArrowUp';
      const next = mobile.matches ? 'ArrowRight' : 'ArrowDown';
      let target = index;
      if (event.key === next) target = (index + 1) % tabs.length;
      else if (event.key === previous) target = (index - 1 + tabs.length) % tabs.length;
      else if (event.key === 'Home') target = 0;
      else if (event.key === 'End') target = tabs.length - 1;
      else return;
      event.preventDefault();
      selectTab(tabs[target].dataset.tab, true);
      if (mobile.matches) tabs[target].scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'instant' });
    });
  });
  selectTab('acquire');
  document.querySelectorAll('[data-select]').forEach(link => {
    link.addEventListener('click', () => selectTab(link.dataset.select));
  });
  function closeMenu(returnFocus = false) {
    menu.setAttribute('aria-expanded', 'false');
    nav.classList.remove('is-open');
    if (returnFocus) menu.focus();
  }
  menu.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
  });
  nav.addEventListener('click', event => {
    if (event.target.closest('a') && mobile.matches) closeMenu(true);
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') closeMenu(true);
  });
  document.addEventListener('click', event => {
    if (!event.target.closest('.header') && menu.getAttribute('aria-expanded') === 'true') closeMenu();
  });
  function adaptLayout() {
    tablist.setAttribute('aria-orientation', mobile.matches ? 'horizontal' : 'vertical');
    if (!mobile.matches) closeMenu();
  }
  mobile.addEventListener('change', adaptLayout);
  adaptLayout();
  root.classList.add('enhanced');

  // Only the portrait moves; its maximum displacement is six pixels.
  let pointerFrame = 0;
  let latestPointer;
  stage.addEventListener('pointermove', event => {
    if (motion.matches || !finePointer.matches) return;
    latestPointer = { x: event.clientX, y: event.clientY };
    if (pointerFrame) return;
    pointerFrame = requestAnimationFrame(() => {
      pointerFrame = 0;
      const rect = stage.getBoundingClientRect();
      const x = Math.max(-6, Math.min(6, (latestPointer.x - rect.left - rect.width / 2) / rect.width * 12));
      const y = Math.max(-6, Math.min(6, (latestPointer.y - rect.top - rect.height / 2) / rect.height * 12));
      stage.style.setProperty('--move-x', `${x}px`);
      stage.style.setProperty('--move-y', `${y}px`);
    });
  }, { passive: true });
  function resetPortrait() {
    cancelAnimationFrame(pointerFrame);
    pointerFrame = 0;
    stage.style.setProperty('--move-x', '0px');
    stage.style.setProperty('--move-y', '0px');
  }
  stage.addEventListener('pointerleave', resetPortrait);
  motion.addEventListener('change', resetPortrait);
  finePointer.addEventListener('change', resetPortrait);
  window.addEventListener('blur', resetPortrait);

  let scrollFrame = 0;
  const profile = document.querySelector('#profile');
  const sectionLinks = [...document.querySelectorAll('[data-section]')];
  function updateScroll() {
    scrollFrame = 0;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0})`;
    const current = profile.getBoundingClientRect().top < window.innerHeight * .5 ? 'profile' : 'home';
    sectionLinks.forEach(link => {
      if (link.dataset.section === current) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }
  function queueScroll() { if (!scrollFrame) scrollFrame = requestAnimationFrame(updateScroll); }
  window.addEventListener('scroll', queueScroll, { passive: true });
  window.addEventListener('resize', queueScroll, { passive: true });
  // Accordions and category switching can change the scrollable document height.
  if ('ResizeObserver' in window) new ResizeObserver(queueScroll).observe(document.body);
  updateScroll();
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        if (!motion.matches) entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: .08 });
    document.querySelectorAll('.reveal').forEach(element => observer.observe(element));
  }
})();
