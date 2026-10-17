/*
  Products page — production · "Balanced catalog" (promoted from playground_products/option-03)
  Only adds the category filter. Language, theme, International mode,
  card links and payment status keep running from the production inline
  scripts in index.html.
*/
(function () {
  "use strict";

  const chips = Array.prototype.slice.call(document.querySelectorAll(".o3-chip[data-filter]"));
  const cards = Array.prototype.slice.call(document.querySelectorAll(".commerce-product-card[data-cat]"));
  if (!chips.length || !cards.length) return;

  function applyFilter(filter) {
    cards.forEach(function (card) {
      card.hidden = !(filter === "all" || card.dataset.cat === filter);
    });
    chips.forEach(function (chip) {
      const on = chip.dataset.filter === filter;
      chip.classList.toggle("is-active", on);
      chip.setAttribute("aria-pressed", String(on));
    });
  }

  chips.forEach(function (chip) {
    chip.addEventListener("click", function () { applyFilter(chip.dataset.filter); });
  });
})();
