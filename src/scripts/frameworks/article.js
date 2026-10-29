/* =========================================================
   BILINGUAL FRAMEWORK ARTICLE
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const languageButtons =
    document.querySelectorAll(".language-btn[data-language]");

  const languageBlocks =
    document.querySelectorAll("[data-copy-lang]");

  if (!languageButtons.length || !languageBlocks.length) {
    return;
  }

  function setArticleLanguage(language) {
    const selected =
      language === "en"
        ? "en"
        : "id";

    document.documentElement.lang =
      selected;

    languageBlocks.forEach((block) => {
      block.hidden =
        block.dataset.copyLang !== selected;
    });

    languageButtons.forEach((button) => {
      const active =
        button.dataset.language === selected;

      button.classList.toggle(
        "active",
        active
      );

      button.setAttribute(
        "aria-pressed",
        String(active)
      );
    });
  }

  languageButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setArticleLanguage(
        button.dataset.language
      );
    });
  });

  /* Indonesian is intentionally the default language. */
  setArticleLanguage("id");
});


/* =========================================================
   FRAMEWORK ARTICLE — LIGHT / DARK MODE
   First visit: Light
   Later visits: remember the user's last manual choice.
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const themeButtons =
    document.querySelectorAll(".theme-btn[data-theme]");

  if (!themeButtons.length) {
    return;
  }

  const root =
    document.documentElement;

  function applyArticleTheme(theme, persist = true) {
    const selected =
      theme === "dark"
        ? "dark"
        : "light";

    root.dataset.articleTheme =
      selected;

    themeButtons.forEach((button) => {
      const active =
        button.dataset.theme === selected;

      button.classList.toggle(
        "active",
        active
      );

      button.setAttribute(
        "aria-pressed",
        String(active)
      );
    });

    if (persist) {
      try {
        localStorage.setItem(
          "maulArticleTheme",
          selected
        );
      } catch (error) {
        /* Local storage may be unavailable in some privacy modes. */
      }
    }
  }

  const initialTheme =
    root.dataset.articleTheme === "dark"
      ? "dark"
      : "light";

  applyArticleTheme(
    initialTheme,
    false
  );

  themeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      applyArticleTheme(
        button.dataset.theme,
        true
      );
    });
  });
});
