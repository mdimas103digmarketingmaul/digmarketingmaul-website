
(function () {
  const THEME_KEY = "maulCommerceDarkMode";
  const LANG_KEY = "maulCommerceLanguage";
  const root = document.documentElement;

  function currentTheme() {
    return root.dataset.theme === "dark" ? "dark" : "light";
  }

  function currentLanguage() {
    return root.dataset.language === "en" ? "en" : "id";
  }

  function applyTheme(theme, persist = true) {
    const next = theme === "dark" ? "dark" : "light";
    root.dataset.theme = next;

    document.querySelectorAll("[data-theme-choice]").forEach((button) => {
      const active = button.dataset.themeChoice === next;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });

    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", next === "dark" ? "#07111f" : "#f7f8fb");

    if (persist) {
      try {
        localStorage.setItem(THEME_KEY, String(next === "dark"));
      } catch (error) {}
    }
  }

  function applyLanguage(language, persist = true) {
    const next = language === "en" ? "en" : "id";
    root.dataset.language = next;
    root.lang = next;

    document.querySelectorAll("[data-language-choice]").forEach((button) => {
      const active = button.dataset.languageChoice === next;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });

    document.querySelectorAll("[data-placeholder-id][data-placeholder-en]").forEach((input) => {
      input.placeholder = next === "en" ? input.dataset.placeholderEn : input.dataset.placeholderId;
    });

    document.dispatchEvent(new CustomEvent("commerce-language-change", {
      detail: { language: next }
    }));

    if (persist) {
      try { localStorage.setItem(LANG_KEY, next); } catch (error) {}
    }
  }

  document.querySelectorAll("[data-theme-choice]").forEach((button) => {
    button.addEventListener("click", () => applyTheme(button.dataset.themeChoice));
  });

  document.querySelectorAll("[data-language-choice]").forEach((button) => {
    button.addEventListener("click", () => applyLanguage(button.dataset.languageChoice));
  });

  applyTheme(currentTheme(), false);
  applyLanguage(currentLanguage(), false);

  window.MauldigitalUI = {
    getTheme: currentTheme,
    getLanguage: currentLanguage,
    applyTheme,
    applyLanguage
  };
})();
