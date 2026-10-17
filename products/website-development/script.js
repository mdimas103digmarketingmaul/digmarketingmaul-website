// Website Development — Production · "Lifecycle Blueprint" (promoted from playground option-01)
// Static, dependency-free. Provides the shared MauldigitalUI theme/language API
// (same contract as production) plus option-specific interactions.
(function () {
  "use strict";

  const THEME_KEY = "maulCommerceDarkMode";
  const LANG_KEY = "maulCommerceLanguage";
  const WA_NUMBER = "6281296069566";
  const root = document.documentElement;

  /* ------------------------------------------------------------------
     WhatsApp prefilled messages, per CTA intent and language
     ------------------------------------------------------------------ */
  const WA_MESSAGES = {
    scope: {
      id: "Halo Maul, saya ingin diskusi kebutuhan Website Development dan scope yang paling sesuai.\n\nJenis bisnis/website: \nKebutuhan utama: \nTarget waktu: ",
      en: "Hi Maul, I'd like to discuss a Website Development project and the right scope for it.\n\nBusiness/website type: \nMain needs: \nTimeline: "
    },
    similar: {
      id: "Halo Maul, saya sudah lihat contoh website Hanasari Catering / MammaRoti dan tertarik dibuatkan website serupa untuk bisnis saya.\n\nBisnis saya: ",
      en: "Hi Maul, I saw the Hanasari Catering / MammaRoti websites and I'm interested in something similar for my business.\n\nMy business: "
    },
    integration: {
      id: "Halo Maul, saya ingin diskusi integrasi/fitur tambahan untuk website (misalnya e-commerce, payment, booking, membership, atau third-party service).\n\nKebutuhan: \nWebsite saat ini (jika ada): ",
      en: "Hi Maul, I'd like to discuss an integration or additional feature for a website (e.g. e-commerce, payments, booking, membership, or a third-party service).\n\nRequirement: \nCurrent website (if any): "
    },
    care: {
      id: "Halo Maul, saya ingin tanya tentang Website Care & Maintenance untuk website saya.\n\nWebsite: ",
      en: "Hi Maul, I'd like to ask about Website Care & Maintenance for my website.\n\nWebsite: "
    },
    custom: {
      id: "Halo Maul, kebutuhan website saya cukup spesifik dan saya ingin menyusun scope bersama.\n\nKebutuhan: \nReferensi website (jika ada): ",
      en: "Hi Maul, my website needs are fairly specific and I'd like to put together a scope with you.\n\nRequirements: \nReference website (if any): "
    },
    final: {
      id: "Halo Maul, saya ingin diskusi scope Website Development untuk kebutuhan saya.",
      en: "Hi Maul, I'd like to discuss the Website Development scope for my needs."
    }
  };

  function waUrl(key, language) {
    const entry = WA_MESSAGES[key];
    if (!entry) return null;
    return "https://wa.me/" + WA_NUMBER + "?text=" + encodeURIComponent(entry[language] || entry.id);
  }

  function updateWhatsAppLinks(language) {
    document.querySelectorAll("[data-wa]").forEach(function (link) {
      const url = waUrl(link.dataset.wa, language);
      if (url) link.setAttribute("href", url);
    });
  }

  /* ------------------------------------------------------------------
     Theme + language (same API as production: window.MauldigitalUI)
     ------------------------------------------------------------------ */
  function currentTheme() {
    return root.dataset.theme === "dark" ? "dark" : "light";
  }

  function currentLanguage() {
    return root.dataset.language === "en" ? "en" : "id";
  }

  function applyTheme(theme, persist = true) {
    const next = theme === "dark" ? "dark" : "light";
    root.dataset.theme = next;

    document.querySelectorAll("[data-theme-choice]").forEach(function (button) {
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

    document.querySelectorAll("[data-language-choice]").forEach(function (button) {
      const active = button.dataset.languageChoice === next;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });

    document.querySelectorAll("[data-placeholder-id][data-placeholder-en]").forEach(function (input) {
      input.placeholder = next === "en" ? input.dataset.placeholderEn : input.dataset.placeholderId;
    });

    updateWhatsAppLinks(next);

    document.dispatchEvent(new CustomEvent("commerce-language-change", {
      detail: { language: next }
    }));

    if (persist) {
      try { localStorage.setItem(LANG_KEY, next); } catch (error) {}
    }
  }

  document.querySelectorAll("[data-theme-choice]").forEach(function (button) {
    button.addEventListener("click", function () { applyTheme(button.dataset.themeChoice); });
  });
  document.querySelectorAll("[data-language-choice]").forEach(function (button) {
    button.addEventListener("click", function () { applyLanguage(button.dataset.languageChoice); });
  });

  applyTheme(currentTheme(), false);
  applyLanguage(currentLanguage(), false);

  window.MauldigitalUI = {
    getTheme: currentTheme,
    getLanguage: currentLanguage,
    applyTheme: applyTheme,
    applyLanguage: applyLanguage
  };

  /* ------------------------------------------------------------------
     Option-specific interactions
     ------------------------------------------------------------------ */
  const reduceMotion = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const hasIO = "IntersectionObserver" in window;

  // 1) Scroll reveal
  const reveals = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  if (!hasIO || reduceMotion) {
    reveals.forEach(function (el) { el.classList.add("is-in"); });
  } else {
    const revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    reveals.forEach(function (el) { revealObserver.observe(el); });
  }

  // 2) Hero "website anatomy": cycles through lifecycle layers; pauses on hover/focus
  const anatomy = document.querySelector("[data-anatomy]");
  if (anatomy) {
    const layers = Array.prototype.slice.call(anatomy.querySelectorAll(".layer"));
    const CYCLE = 2600;
    let index = 0;
    let timer = null;
    let paused = false;
    let visible = true;

    anatomy.style.setProperty("--cycle", CYCLE + "ms");

    function setActive(i) {
      index = (i + layers.length) % layers.length;
      layers.forEach(function (layer, j) { layer.classList.toggle("is-active", j === index); });
    }

    function stop() {
      if (timer) { clearInterval(timer); timer = null; }
      anatomy.classList.remove("is-cycling");
    }

    function start() {
      stop();
      if (reduceMotion || paused || !visible || document.hidden) return;
      // Re-trigger the progress bar on the current layer
      void anatomy.offsetWidth;
      anatomy.classList.add("is-cycling");
      timer = setInterval(function () { setActive(index + 1); }, CYCLE);
    }

    layers.forEach(function (layer, i) {
      layer.addEventListener("mouseenter", function () { paused = true; stop(); setActive(i); });
      layer.addEventListener("focusin", function () { paused = true; stop(); setActive(i); });
    });
    anatomy.addEventListener("mouseleave", function () { paused = false; start(); });
    anatomy.addEventListener("focusout", function (event) {
      if (!anatomy.contains(event.relatedTarget)) { paused = false; start(); }
    });
    document.addEventListener("visibilitychange", function () { document.hidden ? stop() : start(); });

    if (hasIO) {
      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
        visible ? start() : stop();
      }, { threshold: 0.2 }).observe(anatomy);
    } else {
      start();
    }
  }

  // 3) Portfolio previews: render the live site at a desktop width, then scale it to fit
  const frames = Array.prototype.slice.call(document.querySelectorAll("[data-frame]"));
  function fitFrame(view) {
    const iframe = view.querySelector("iframe");
    if (!iframe) return;
    const width = view.clientWidth;
    const height = view.clientHeight;
    if (!width || !height) return;
    const base = width < 520 ? 1024 : 1366;
    const scale = width / base;
    iframe.style.width = base + "px";
    iframe.style.height = Math.ceil(height / scale) + "px";
    iframe.style.transform = "scale(" + scale + ")";
  }
  frames.forEach(function (view) {
    const iframe = view.querySelector("iframe");
    if (iframe) iframe.addEventListener("load", function () { view.classList.add("is-loaded"); });
  });
  if ("ResizeObserver" in window) {
    const resizeObserver = new ResizeObserver(function (entries) {
      entries.forEach(function (entry) { fitFrame(entry.target); });
    });
    frames.forEach(function (view) { resizeObserver.observe(view); });
  } else {
    frames.forEach(fitFrame);
    window.addEventListener("resize", function () { frames.forEach(fitFrame); });
  }

  // 4) Lifecycle index scroll-spy (desktop sticky nav)
  const stageLinks = Array.prototype.slice.call(document.querySelectorAll("[data-stage-link]"));
  if (hasIO && stageLinks.length) {
    const stageObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        stageLinks.forEach(function (link) {
          link.classList.toggle("is-current", link.dataset.stageLink === entry.target.id);
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });
    stageLinks.forEach(function (link) {
      const target = document.getElementById(link.dataset.stageLink);
      if (target) stageObserver.observe(target);
    });
  }

  // 5) Mobile action dock: shows once the hero CTAs scroll away, hides at the final CTA
  const dock = document.querySelector("[data-dock]");
  const heroActions = document.querySelector("[data-hero-actions]");
  const finalCard = document.querySelector("[data-final]");
  if (dock && heroActions && hasIO) {
    let heroInView = true;
    let finalInView = false;
    const updateDock = function () {
      dock.classList.toggle("is-visible", !heroInView && !finalInView);
    };
    new IntersectionObserver(function (entries) {
      const entry = entries[0];
      // Treat "scrolled above the hero" (not possible at load) and "in view" the same
      heroInView = entry.isIntersecting || entry.boundingClientRect.top > 0;
      updateDock();
    }).observe(heroActions);
    if (finalCard) {
      new IntersectionObserver(function (entries) {
        finalInView = entries[0].isIntersecting;
        updateDock();
      }, { threshold: 0.15 }).observe(finalCard);
    }
  }
})();
