// Digital Ads Management — Option 02 · "Ads System Map"
// Static, dependency-free. Provides the shared MauldigitalUI theme/language API
// (same contract as production) plus option-specific interactions.
(function () {
  "use strict";

  const THEME_KEY = "maulCommerceTheme";
  const GLOBAL_THEME_KEY = "maulSiteTheme";
  const LANG_KEY = "maulCommerceLanguage";
  const WA_NUMBER = "6281296069566";
  const root = document.documentElement;

  /* ------------------------------------------------------------------
     WhatsApp prefilled messages (per CTA intent, per language)
     ------------------------------------------------------------------ */
  const WA_MESSAGES = {
    general: {
      id: "Halo Maul, saya tertarik dengan layanan Digital Ads Management dan ingin diskusi tentang bisnis, platform, budget iklan, kondisi tracking, dan scope pengelolaan yang paling sesuai.",
      en: "Hi Maul, I'm interested in Digital Ads Management and would like to discuss my business, platforms, ad budget, tracking setup, and the right management scope."
    },
    pkg1: {
      id: "Halo Maul, saya ingin tahu lebih lanjut tentang Package 1 · Essential untuk Digital Ads Management.",
      en: "Hi Maul, I'd like to know more about Package 1 · Essential for Digital Ads Management."
    },
    pkg2: {
      id: "Halo Maul, saya ingin tahu lebih lanjut tentang Package 2 · Growth (termasuk Creative Materials Creation) untuk Digital Ads Management.",
      en: "Hi Maul, I'd like to know more about Package 2 · Growth (including Creative Materials Creation) for Digital Ads Management."
    },
    pkg3: {
      id: "Halo Maul, saya ingin tahu lebih lanjut tentang Package 3 · Scale (termasuk Experimentation & A/B Testing) untuk Digital Ads Management.",
      en: "Hi Maul, I'd like to know more about Package 3 · Scale (including Experimentation & A/B Testing) for Digital Ads Management."
    }
  };

  function waUrl(text) {
    return "https://wa.me/" + WA_NUMBER + "?text=" + encodeURIComponent(text);
  }

  function updateWhatsAppLinks(language) {
    document.querySelectorAll("[data-wa]").forEach(function (link) {
      const entry = WA_MESSAGES[link.dataset.wa];
      if (entry) link.setAttribute("href", waUrl(entry[language] || entry.id));
    });
  }

  /* ------------------------------------------------------------------
     Theme + language (same API as production: window.MauldigitalUI)
     ------------------------------------------------------------------ */
  function currentTheme() { return root.dataset.theme === "dark" ? "dark" : "light"; }
  function currentLanguage() { return root.dataset.language === "en" ? "en" : "id"; }

  function applyTheme(theme, persist = true) {
    const next = theme === "dark" ? "dark" : "light";
    root.dataset.theme = next;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", next === "dark" ? "#07111f" : "#f7f8fb");
    if (persist) {
      try { localStorage.setItem(THEME_KEY, next); localStorage.setItem(GLOBAL_THEME_KEY, next); } catch (_) {}
    }
  }

  function applyLanguage(language, persist = true) {
    const next = language === "en" ? "en" : "id";
    root.dataset.language = next;
    root.lang = next;

    document.querySelectorAll("[data-placeholder-id][data-placeholder-en]").forEach(function (input) {
      input.placeholder = next === "en" ? input.dataset.placeholderEn : input.dataset.placeholderId;
    });
    document.querySelectorAll("option[data-id][data-en]").forEach(function (option) {
      option.textContent = next === "en" ? option.dataset.en : option.dataset.id;
    });

    updateWhatsAppLinks(next);
    if (typeof renderBrief === "function") renderBrief();

    document.dispatchEvent(new CustomEvent("commerce-language-change", { detail: { language: next } }));
    if (persist) { try { localStorage.setItem(LANG_KEY, next); } catch (_) {} }
  }

  /* ------------------------------------------------------------------
     Brief builder → WhatsApp message
     ------------------------------------------------------------------ */
  const briefForm = document.querySelector("[data-brief]");
  const briefPreview = document.querySelector("[data-brief-preview]");
  const briefSend = document.querySelector("[data-brief-send]");

  const LABELS = {
    id: {
      intro: "Halo Maul, saya ingin diskusi Digital Ads Management.",
      business: "Bisnis/produk", objective: "Objective", platform: "Platform",
      budget: "Perkiraan budget iklan/bulan", tracking: "Kondisi tracking", scope: "Scope yang diminati",
      empty: "-", outro: "Terima kasih!",
      objectives: { leads: "Leads", sales: "Sales", app: "App install", awareness: "Awareness", unsure: "Belum yakin" },
      scopeUnsure: "Belum yakin, mohon dibantu pilih",
      tracking_: { ready: "Sudah terpasang", partial: "Sebagian", none: "Belum ada", unsure: "Tidak yakin" }
    },
    en: {
      intro: "Hi Maul, I'd like to discuss Digital Ads Management.",
      business: "Business/product", objective: "Objective", platform: "Platform(s)",
      budget: "Approx. monthly ad budget", tracking: "Tracking status", scope: "Scope of interest",
      empty: "-", outro: "Thank you!",
      objectives: { leads: "Leads", sales: "Sales", app: "App install", awareness: "Awareness", unsure: "Not sure yet" },
      scopeUnsure: "Not sure yet, please help me choose",
      tracking_: { ready: "Already set up", partial: "Partially", none: "Not yet", unsure: "Not sure" }
    }
  };

  function renderBrief() {
    if (!briefForm || !briefPreview) return;
    const L = LABELS[currentLanguage()];
    const data = new FormData(briefForm);
    const business = String(data.get("business") || "").trim();
    const objective = data.get("objective");
    const platforms = data.getAll("platform");
    const budget = data.get("budget");
    const tracking = data.get("tracking");
    const scope = data.get("scope");

    const lines = [
      L.intro, "",
      "• " + L.business + ": " + (business || L.empty),
      "• " + L.objective + ": " + (objective ? L.objectives[objective] : L.empty),
      "• " + L.platform + ": " + (platforms.length ? platforms.join(", ") : L.empty),
      "• " + L.budget + ": " + (budget || L.empty),
      "• " + L.tracking + ": " + (tracking ? L.tracking_[tracking] : L.empty),
      "• " + L.scope + ": " + (scope ? (scope === "unsure" ? L.scopeUnsure : scope) : L.empty),
      "", L.outro
    ];
    const text = lines.join("\n");
    briefPreview.textContent = text;
    if (briefSend) briefSend.setAttribute("href", waUrl(text));
  }

  if (briefForm) {
    briefForm.addEventListener("input", renderBrief);
    briefForm.addEventListener("change", renderBrief);
    briefForm.addEventListener("submit", function (event) { event.preventDefault(); });
  }

  // Initialise the shared API
  applyTheme(currentTheme(), false);
  applyLanguage(currentLanguage(), false);
  window.MauldigitalUI = { getTheme: currentTheme, getLanguage: currentLanguage, applyTheme: applyTheme, applyLanguage: applyLanguage };

  /* ------------------------------------------------------------------
     Option-specific interactions
     ------------------------------------------------------------------ */
  const reduceMotion = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const hasIO = "IntersectionObserver" in window;

  // 1) Reveal on scroll
  const reveals = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  if (!hasIO || reduceMotion) {
    reveals.forEach(function (el) { el.classList.add("is-in"); });
  } else {
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add("is-in"); io.unobserve(entry.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.06 });
    reveals.forEach(function (el) { io.observe(el); });
  }

  // 2) Seven-area system map: nodes ⇄ legend, gentle auto-cycle
  const system = document.querySelector("[data-system]");
  if (system) {
    const nodes = Array.prototype.slice.call(system.querySelectorAll("[data-node]"));
    const items = Array.prototype.slice.call(system.querySelectorAll("[data-legend]"));
    let index = 0, timer = null, paused = false, visible = true;

    function setActive(i) {
      index = (i + nodes.length) % nodes.length;
      nodes.forEach(function (n, j) { n.classList.toggle("is-active", j === index); });
      items.forEach(function (n, j) { n.classList.toggle("is-active", j === index); });
    }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }
    function start() {
      stop();
      if (reduceMotion || paused || !visible || document.hidden) return;
      timer = setInterval(function () { setActive(index + 1); }, 2400);
    }
    function hold(i) { paused = true; stop(); setActive(i); }

    nodes.forEach(function (node, i) {
      node.addEventListener("mouseenter", function () { hold(i); });
      node.addEventListener("focus", function () { hold(i); });
      node.addEventListener("click", function () { openArea(i, true); });
    });
    items.forEach(function (item, i) {
      item.addEventListener("mouseenter", function () { hold(i); });
      item.addEventListener("focusin", function () { hold(i); });
      const link = item.querySelector("a");
      if (link) link.addEventListener("click", function (e) { e.preventDefault(); openArea(i, true); });
    });
    system.addEventListener("mouseleave", function () { paused = false; start(); });
    system.addEventListener("focusout", function (e) { if (!system.contains(e.relatedTarget)) { paused = false; start(); } });
    document.addEventListener("visibilitychange", function () { document.hidden ? stop() : start(); });
    if (hasIO) {
      new IntersectionObserver(function (entries) { visible = entries[0].isIntersecting; visible ? start() : stop(); }, { threshold: 0.2 }).observe(system);
    } else { start(); }
  }

  // 3) Ledger: open a specific area / expand-collapse all
  const areas = Array.prototype.slice.call(document.querySelectorAll("details.area"));
  function openArea(i, scroll) {
    const target = areas[i];
    if (!target) return;
    target.open = true;
    if (scroll) {
      target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
      const summary = target.querySelector("summary");
      if (summary) summary.focus({ preventScroll: true });
    }
  }
  const toggleAll = document.querySelector("[data-toggle-all]");
  function syncToggle() {
    if (!toggleAll) return;
    toggleAll.setAttribute("aria-pressed", String(areas.every(function (a) { return a.open; })));
  }
  if (toggleAll) {
    toggleAll.addEventListener("click", function () {
      const expand = toggleAll.getAttribute("aria-pressed") !== "true";
      areas.forEach(function (a) { a.open = expand; });
      syncToggle();
    });
  }
  areas.forEach(function (a) { a.addEventListener("toggle", syncToggle); });
  // Deep links (#area-0X) open the matching row
  function openFromHash() {
    const match = /^#area-0([1-7])$/.exec(location.hash);
    if (match) openArea(Number(match[1]) - 1, false);
  }
  window.addEventListener("hashchange", openFromHash);
  openFromHash();

  // 4) Package matrix: highlight a column on hover / click
  const matrix = document.querySelector("[data-matrix]");
  if (matrix) {
    let locked = null;
    const heads = Array.prototype.slice.call(matrix.querySelectorAll(".mx-pkg"));
    function show(col) { if (col) matrix.dataset.activeCol = col; else delete matrix.dataset.activeCol; }
    matrix.querySelectorAll("[data-col]").forEach(function (el) {
      el.addEventListener("mouseenter", function () { show(el.dataset.col); });
    });
    matrix.addEventListener("mouseleave", function () { show(locked); });
    heads.forEach(function (head) {
      head.addEventListener("click", function () {
        locked = locked === head.dataset.col ? null : head.dataset.col;
        heads.forEach(function (h) { h.setAttribute("aria-pressed", String(h.dataset.col === locked)); });
        show(locked);
      });
    });
  }

  // 5) Header in-page nav: mark current section
  const navLinks = Array.prototype.slice.call(document.querySelectorAll(".page-nav a"));
  if (hasIO && navLinks.length) {
    const spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (link) { link.classList.toggle("is-current", link.getAttribute("href") === "#" + entry.target.id); });
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    navLinks.forEach(function (link) {
      const section = document.querySelector(link.getAttribute("href"));
      if (section) spy.observe(section);
    });
  }

  // 6) Mobile floating CTA: visible after the hero, hidden at the brief builder
  const fab = document.querySelector("[data-fab]");
  const heroSystem = document.querySelector(".hero .actions");
  const finalBlock = document.querySelector("[data-final]");
  if (fab && heroSystem && hasIO) {
    let heroIn = true, finalIn = false;
    const update = function () { fab.classList.toggle("is-visible", !heroIn && !finalIn); };
    new IntersectionObserver(function (e) { heroIn = e[0].isIntersecting || e[0].boundingClientRect.top > 0; update(); }).observe(heroSystem);
    if (finalBlock) new IntersectionObserver(function (e) { finalIn = e[0].isIntersecting; update(); }, { threshold: 0.05 }).observe(finalBlock);
  }
})();
