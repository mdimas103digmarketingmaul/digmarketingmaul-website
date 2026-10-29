(function () {
  // The page's own default lives on <html data-language> (/products/ = en, product pages = id);
  // a language the visitor picked before always wins.
  var root = document.documentElement;
  root.classList.add("js");
  try {
    var saved = localStorage.getItem("maulCommerceLanguage");
    if (saved === "en" || saved === "id") root.dataset.language = saved;
    if (localStorage.getItem("maulProductsInternational") === "true") {
      root.dataset.international = "true";
      root.dataset.language = "en";
    }
  } catch (e) {}
  root.lang = root.dataset.language;
})();
