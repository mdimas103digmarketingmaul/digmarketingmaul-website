(() => {
  const optionLabel = n => `Option ${String(n).padStart(2,'0')}`;
  const resolveSource = (page, value) => {
    const n = Number(value);
    if (page === 'home' && n === 1) return 'https://digmarketingmaul.com/#home';
    if (page === 'page-02' && n === 1) return './option-01/';
    return `./option-${String(n).padStart(2,'0')}/`;
  };

  const page = document.body.dataset.playgroundPage;
  if (!page) return;

  const left = document.querySelector('[data-compare-left]');
  const right = document.querySelector('[data-compare-right]');
  const leftFrame = document.querySelector('[data-frame-left]');
  const rightFrame = document.querySelector('[data-frame-right]');
  const leftLabel = document.querySelector('[data-label-left]');
  const rightLabel = document.querySelector('[data-label-right]');
  const leftOpen = document.querySelector('[data-open-left]');
  const rightOpen = document.querySelector('[data-open-right]');

  const sync = (select, frame, label, link) => {
    if (!select || !frame) return;
    const source = resolveSource(page, select.value);
    frame.src = source;
    if (label) label.textContent = optionLabel(select.value);
    if (link) link.href = source;
  };

  const refresh = () => {
    sync(left, leftFrame, leftLabel, leftOpen);
    sync(right, rightFrame, rightLabel, rightOpen);
  };

  left?.addEventListener('change', refresh);
  right?.addEventListener('change', refresh);
  refresh();
})();
