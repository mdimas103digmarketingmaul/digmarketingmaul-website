
(function () {
  const THEME_KEY = "maulCommerceDarkMode";
  const LANG_KEY = "maulCommerceLanguage";

  let theme = "light";
  let language = "id";

  try {
    const savedDark = localStorage.getItem(THEME_KEY) === "true";
    const savedLanguage = localStorage.getItem(LANG_KEY);

    theme = savedDark ? "dark" : "light";
    language = savedLanguage === "en" ? "en" : "id";
  } catch (error) {}

  document.documentElement.dataset.theme = theme;
  document.documentElement.dataset.language = language;
  document.documentElement.lang = language;
  document.documentElement.classList.add("js");
})();
