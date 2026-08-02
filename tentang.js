const LANGUAGE_STORAGE_KEY =
  "digmarketingmaul_language";


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
      "Kembali ke Beranda"
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
      "Back to Home"
  }
};


document.addEventListener(
  "DOMContentLoaded",
  function () {
    setupLanguageSwitcher();
  }
);


/*
  Menyiapkan tombol ID dan EN
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
            !translations[selectedLanguage]
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
  Mengganti seluruh teks halaman
*/

function applyLanguage(language) {
  const selectedTranslation =
    translations[language];

  if (!selectedTranslation) {
    return;
  }


  /*
    Mengubah atribut bahasa dokumen
  */

  document.documentElement.lang =
    language;


  /*
    Mengubah judul tab browser
  */

  document.title =
    selectedTranslation.pageTitle;


  /*
    Mengubah meta description
  */

  const metaDescription =
    document.querySelector(
      'meta[name="description"]'
    );

  if (metaDescription) {
    metaDescription.setAttribute(
      "content",
      selectedTranslation.metaDescription
    );
  }


  /*
    Mengubah semua elemen
    yang memiliki data-i18n
  */

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


  /*
    Memperbarui tampilan tombol aktif
  */

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


  /*
    Memperbarui label aksesibilitas
  */

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
