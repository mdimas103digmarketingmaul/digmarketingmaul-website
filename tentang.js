const LANGUAGE_STORAGE_KEY =
  "digmarketingmaul_language";

const THEME_STORAGE_KEY =
  "digmarketingmaul_theme";

const AVAILABLE_THEMES =
  new Set([
    "light",
    "dark"
  ]);


/*
  Kamus terjemahan halaman Tentang Saya
*/

const translations = {
  id: {
    pageTitle:
      "Tentang Saya | Dig Marketing Maul",

    metaDescription:
      "Tentang Maul dan perjalanan belajar web development serta digital marketing.",

    languageSwitcherLabel:
      "Pilihan bahasa",

    navHome:
      "Beranda",

    navAbout:
      "Tentang Saya",

    heading:
      "Tentang Saya",

    introduction:
      "Halo, saya Maul. Saya merupakan seorang digital marketer yang sedang mempelajari web development.",

    learningJourney:
      "Saya ingin memahami proses pembuatan website mulai dari HTML, CSS, JavaScript, deployment, tracking, hingga pengelolaan data digital marketing.",

    goal:
      "Tujuan saya adalah dapat membuat dan mengelola website secara mandiri serta mengintegrasikannya dengan kebutuhan digital marketing klien.",

    backHome:
      "Kembali ke Beranda",

    darkLabel:
      "Gelap",

    lightLabel:
      "Terang",

    switchToDark:
      "Aktifkan mode gelap",

    switchToLight:
      "Aktifkan mode terang"
  },

  en: {
    pageTitle:
      "About Me | Dig Marketing Maul",

    metaDescription:
      "Learn about Maul and his journey in web development and digital marketing.",

    languageSwitcherLabel:
      "Language selection",

    navHome:
      "Home",

    navAbout:
      "About Me",

    heading:
      "About Me",

    introduction:
      "Hi, I'm Maul. I'm a digital marketer currently learning web development.",

    learningJourney:
      "I want to understand the website development process, from HTML, CSS, JavaScript, and deployment to tracking and digital marketing data management.",

    goal:
      "My goal is to build and manage websites independently and integrate them with clients' digital marketing needs.",

    backHome:
      "Back to Home",

    darkLabel:
      "Dark",

    lightLabel:
      "Light",

    switchToDark:
      "Enable dark mode",

    switchToLight:
      "Enable light mode"
  }
};


document.addEventListener(
  "DOMContentLoaded",
  function () {
    setupLanguageSwitcher();
    setupThemeToggle();
  }
);


/*
  Menyiapkan pilihan bahasa
*/

function setupLanguageSwitcher() {
  const languageButtons =
    document.querySelectorAll(
      "[data-language]"
    );

  if (languageButtons.length === 0) {
    return;
  }

  const savedLanguage =
    getStoredLanguage();

  const initialLanguage =
    translations[savedLanguage]
      ? savedLanguage
      : "id";

  applyLanguage(initialLanguage);

  languageButtons.forEach(
    function (button) {
      button.addEventListener(
        "click",
        function () {
          const selectedLanguage =
            button.dataset.language;

          if (
            !translations[
              selectedLanguage
            ]
          ) {
            return;
          }

          applyLanguage(
            selectedLanguage
          );

          saveLanguage(
            selectedLanguage
          );
        }
      );
    }
  );
}


/*
  Mengganti bahasa halaman
*/

function applyLanguage(language) {
  const selectedTranslation =
    translations[language];

  if (!selectedTranslation) {
    return;
  }

  document.documentElement.lang =
    language;

  document.title =
    selectedTranslation.pageTitle;

  const metaDescription =
    document.querySelector(
      'meta[name="description"]'
    );

  if (metaDescription) {
    metaDescription.setAttribute(
      "content",
      selectedTranslation
        .metaDescription
    );
  }

  const translatedElements =
    document.querySelectorAll(
      "[data-i18n]"
    );

  translatedElements.forEach(
    function (element) {
      const translationKey =
        element.dataset.i18n;

      const translatedText =
        selectedTranslation[
          translationKey
        ];

      if (translatedText) {
        element.textContent =
          translatedText;
      }
    }
  );

  const languageButtons =
    document.querySelectorAll(
      "[data-language]"
    );

  languageButtons.forEach(
    function (button) {
      const isActive =
        button.dataset.language ===
        language;

      button.classList.toggle(
        "is-active",
        isActive
      );

      button.setAttribute(
        "aria-pressed",
        String(isActive)
      );
    }
  );

  const languageSwitcher =
    document.querySelector(
      ".language-switcher"
    );

  if (languageSwitcher) {
    languageSwitcher.setAttribute(
      "aria-label",
      selectedTranslation
        .languageSwitcherLabel
    );
  }

  updateThemeToggle(
    getCurrentTheme()
  );
}


/*
  Menyimpan bahasa ke localStorage
*/

function saveLanguage(language) {
  try {
    localStorage.setItem(
      LANGUAGE_STORAGE_KEY,
      language
    );

  } catch (error) {
    console.warn(
      "Pilihan bahasa tidak dapat disimpan.",
      error
    );
  }
}


/*
  Membaca bahasa dari localStorage
*/

function getStoredLanguage() {
  try {
    return localStorage.getItem(
      LANGUAGE_STORAGE_KEY
    );

  } catch (error) {
    console.warn(
      "Pilihan bahasa tidak dapat dibaca.",
      error
    );

    return null;
  }
}


/*
  Menyiapkan toggle Light dan Dark
*/

function setupThemeToggle() {
  const themeToggle =
    document.getElementById(
      "themeToggle"
    );

  if (!themeToggle) {
    return;
  }

  const initialTheme =
    getInitialTheme();

  applyTheme(initialTheme);

  themeToggle.addEventListener(
    "click",
    function () {
      const currentTheme =
        getCurrentTheme();

      const nextTheme =
        currentTheme === "dark"
          ? "light"
          : "dark";

      applyTheme(nextTheme);
      saveTheme(nextTheme);
    }
  );


  /*
    Mengikuti perubahan tema perangkat
    hanya jika pengguna belum memilih tema sendiri.
  */

  const systemThemeQuery =
    window.matchMedia(
      "(prefers-color-scheme: dark)"
    );

  systemThemeQuery.addEventListener(
    "change",
    function (event) {
      const storedTheme =
        getStoredTheme();

      if (storedTheme) {
        return;
      }

      applyTheme(
        event.matches
          ? "dark"
          : "light"
      );
    }
  );
}


/*
  Menentukan tema awal
*/

function getInitialTheme() {
  const documentTheme =
    document.documentElement
      .dataset.theme;

  if (
    AVAILABLE_THEMES.has(
      documentTheme
    )
  ) {
    return documentTheme;
  }

  const storedTheme =
    getStoredTheme();

  if (
    AVAILABLE_THEMES.has(
      storedTheme
    )
  ) {
    return storedTheme;
  }

  const systemPrefersDark =
    window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

  return systemPrefersDark
    ? "dark"
    : "light";
}


/*
  Mengaktifkan tema
*/

function applyTheme(theme) {
  if (
    !AVAILABLE_THEMES.has(theme)
  ) {
    return;
  }

  document.documentElement
    .dataset.theme = theme;

  updateThemeToggle(theme);
}


/*
  Memperbarui tombol tema
*/

function updateThemeToggle(theme) {
  const themeToggle =
    document.getElementById(
      "themeToggle"
    );

  const themeToggleIcon =
    document.getElementById(
      "themeToggleIcon"
    );

  const themeToggleText =
    document.getElementById(
      "themeToggleText"
    );

  if (
    !themeToggle ||
    !themeToggleIcon ||
    !themeToggleText
  ) {
    return;
  }

  const currentLanguage =
    translations[
      document.documentElement.lang
    ]
      ? document.documentElement.lang
      : "id";

  const selectedTranslation =
    translations[currentLanguage];

  const isDarkMode =
    theme === "dark";

  const actionLabel =
    isDarkMode
      ? selectedTranslation
          .switchToLight
      : selectedTranslation
          .switchToDark;

  const visibleLabel =
    isDarkMode
      ? selectedTranslation
          .lightLabel
      : selectedTranslation
          .darkLabel;

  themeToggle.classList.toggle(
    "is-dark",
    isDarkMode
  );

  themeToggle.setAttribute(
    "aria-pressed",
    String(isDarkMode)
  );

  themeToggle.setAttribute(
    "aria-label",
    actionLabel
  );

  themeToggle.setAttribute(
    "title",
    actionLabel
  );

  themeToggleIcon.textContent =
    isDarkMode
      ? "☀"
      : "☾";

  themeToggleText.textContent =
    visibleLabel;
}


/*
  Mendapatkan tema yang sedang aktif
*/

function getCurrentTheme() {
  const currentTheme =
    document.documentElement
      .dataset.theme;

  return AVAILABLE_THEMES.has(
    currentTheme
  )
    ? currentTheme
    : "light";
}


/*
  Menyimpan tema ke localStorage
*/

function saveTheme(theme) {
  try {
    localStorage.setItem(
      THEME_STORAGE_KEY,
      theme
    );

  } catch (error) {
    console.warn(
      "Pilihan tema tidak dapat disimpan.",
      error
    );
  }
}


/*
  Membaca tema dari localStorage
*/

function getStoredTheme() {
  try {
    const storedTheme =
      localStorage.getItem(
        THEME_STORAGE_KEY
      );

    return AVAILABLE_THEMES.has(
      storedTheme
    )
      ? storedTheme
      : null;

  } catch (error) {
    console.warn(
      "Pilihan tema tidak dapat dibaca.",
      error
    );

    return null;
  }
}
