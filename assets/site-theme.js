(function () {
  "use strict";

  const STORAGE_KEY = "maulSiteTheme";
  const root = document.documentElement;

  function storedTheme() {
    try {
      const value = localStorage.getItem(STORAGE_KEY);
      if (value === "light" || value === "dark") return value;
    } catch (error) {}
    return null;
  }

  function inferInitialTheme() {
    const saved = storedTheme();
    if (saved) return saved;

    const declared = root.dataset.theme || root.dataset.productsTheme || root.dataset.siteTheme;
    if (declared === "light" || declared === "dark") return declared;

    return "dark";
  }

  function installStyles() {
    if (document.getElementById("maul-site-theme-styles")) return;

    const style = document.createElement("style");
    style.id = "maul-site-theme-styles";
    style.textContent = `
      .maul-site-theme-anchor{position:relative!important}
      .maul-site-theme-toggle{
        position:absolute;right:0;top:0;z-index:12;
        display:inline-flex;align-items:center;gap:3px;padding:3px;
        border:1px solid rgba(148,163,184,.22);border-radius:999px;
        background:rgba(15,23,42,.7);backdrop-filter:blur(12px);
        -webkit-backdrop-filter:blur(12px);box-shadow:0 8px 24px rgba(0,0,0,.12)
      }
      .maul-site-theme-toggle button{
        border:0;background:transparent;color:#94a3b8;cursor:pointer;
        min-height:32px;padding:6px 10px;border-radius:999px;
        font:700 12px/1 Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif
      }
      .maul-site-theme-toggle button[aria-pressed="true"]{
        background:#fff;color:#111827;box-shadow:0 1px 5px rgba(15,23,42,.14)
      }

      html[data-site-theme="light"]{
        color-scheme:light;
        --navy:#111827!important;
        --deep-navy:#f7f8fb!important;
        --dark-navy:#f7f8fb!important;
        --white:#111827!important;
        --slate:#667085!important;
        --light-slate:#475467!important;
        --lightest-slate:#344054!important;
        --card-bg:#ffffff!important;
        --border-color:#e4e7ec!important;
      }
      html[data-site-theme="light"] body{
        color:#111827!important;
        background:
          linear-gradient(rgba(148,163,184,.16) 1px, transparent 1px),
          linear-gradient(90deg, rgba(148,163,184,.16) 1px, transparent 1px),
          radial-gradient(circle at 88% 8%,rgba(255,49,88,.08),transparent 26%),
          radial-gradient(circle at 12% 40%,rgba(59,130,246,.05),transparent 30%),
          #f7f8fb!important;
        background-size:72px 72px,72px 72px,auto,auto,auto!important;
      }
      html[data-site-theme="light"] main,
      html[data-site-theme="light"] section{background-color:transparent}
      html[data-site-theme="light"] .site-header,
      html[data-site-theme="light"] header.site-header{
        background:rgba(255,255,255,.9)!important;
        border-color:#e4e7ec!important;
        box-shadow:0 1px 0 rgba(15,23,42,.025)
      }
      html[data-site-theme="light"] .nav-link,
      html[data-site-theme="light"] .email-rail-link,
      html[data-site-theme="light"] .social-link{color:#475467!important}
      html[data-site-theme="light"] .nav-link:hover,
      html[data-site-theme="light"] .email-rail-link:hover,
      html[data-site-theme="light"] .social-link:hover{color:#ff3158!important}

      html[data-site-theme="light"] .hero-title-gradient,
      html[data-site-theme="light"] .subpage-title,
      html[data-site-theme="light"] main h1,
      html[data-site-theme="light"] main h2,
      html[data-site-theme="light"] main h3,
      html[data-site-theme="light"] main h4,
      html[data-site-theme="light"] main h5{color:#111827!important}

      html[data-site-theme="light"] main p,
      html[data-site-theme="light"] main li,
      html[data-site-theme="light"] main small,
      html[data-site-theme="light"] .subpage-intro,
      html[data-site-theme="light"] [class*="description"],
      html[data-site-theme="light"] .hero-location,
      html[data-site-theme="light"] .based-in,
      html[data-site-theme="light"] [class*="based-in"]{
        color:#475467!important;
      }

      html[data-site-theme="light"] .topic-card,
      html[data-site-theme="light"] .framework-card,
      html[data-site-theme="light"] .article-card,
      html[data-site-theme="light"] .blog-card,
      html[data-site-theme="light"] .profile-card,
      html[data-site-theme="light"] .content-card,
      html[data-site-theme="light"] .project-card,
      html[data-site-theme="light"] .stack-card,
      html[data-site-theme="light"] .capability-card,
      html[data-site-theme="light"] .skill-card,
      html[data-site-theme="light"] .certification-card,
      html[data-site-theme="light"] .credential-card,
      html[data-site-theme="light"] .framework-step,
      html[data-site-theme="light"] .process-step,
      html[data-site-theme="light"] .workflow-step,
      html[data-site-theme="light"] .workflow-item,
      html[data-site-theme="light"] .framework-node,
      html[data-site-theme="light"] .process-node,
      html[data-site-theme="light"] .system-card,
      html[data-site-theme="light"] .system-step,
      html[data-site-theme="light"] .phase-card,
      html[data-site-theme="light"] .automation-card,
      html[data-site-theme="light"] .maul-light-surface,
      html[data-site-theme="light"] [class*="glass-card"]{
        background:#fff!important;
        border-color:#e4e7ec!important;
        color:#111827!important;
        box-shadow:0 12px 38px rgba(15,23,42,.055)!important;
      }

      html[data-site-theme="light"] .maul-light-surface-strong{
        background:linear-gradient(135deg, rgba(255,255,255,.97), rgba(244,247,251,.95))!important;
        border:1px solid #e4e7ec!important;
        color:#111827!important;
        box-shadow:0 16px 44px rgba(15,23,42,.08)!important;
      }
      html[data-site-theme="light"] .maul-light-surface-strong h2,
      html[data-site-theme="light"] .maul-light-surface-strong h3,
      html[data-site-theme="light"] .maul-light-surface-strong h4,
      html[data-site-theme="light"] .maul-light-surface-strong strong,
      html[data-site-theme="light"] .maul-light-surface-strong .title{color:#111827!important}
      html[data-site-theme="light"] .maul-light-surface-strong p,
      html[data-site-theme="light"] .maul-light-surface-strong li,
      html[data-site-theme="light"] .maul-light-surface-strong span,
      html[data-site-theme="light"] .maul-light-surface-strong small{color:#475467!important}

      html[data-site-theme="light"] .step,
      html[data-site-theme="light"] .workflow-node,
      html[data-site-theme="light"] .workflow-stage,
      html[data-site-theme="light"] .process-item,
      html[data-site-theme="light"] .framework-item,
      html[data-site-theme="light"] .phase,
      html[data-site-theme="light"] .pill,
      html[data-site-theme="light"] .tag,
      html[data-site-theme="light"] .chip,
      html[data-site-theme="light"] .maul-light-sub-surface{
        background:#f8fafc!important;
        border-color:#dfe4ea!important;
        color:#344054!important;
      }

      html[data-site-theme="light"] .maul-light-pill,
      html[data-site-theme="light"] .maul-light-pill a,
      html[data-site-theme="light"] a.maul-light-pill,
      html[data-site-theme="light"] button.maul-light-pill{
        background:#eef2f6!important;
        border:1px solid #d7dde5!important;
        color:#344054!important;
        box-shadow:none!important;
      }
      html[data-site-theme="light"] .maul-light-pill:hover,
      html[data-site-theme="light"] .maul-light-pill:hover a,
      html[data-site-theme="light"] a.maul-light-pill:hover,
      html[data-site-theme="light"] button.maul-light-pill:hover{
        background:#fff1f4!important;
        border-color:#ffc2ce!important;
        color:#ff3158!important;
      }

      html[data-site-theme="light"] .maul-light-location-badge{
        background:linear-gradient(135deg, rgba(15,23,42,.92), rgba(51,65,85,.92))!important;
        border:1px solid rgba(255,255,255,.08)!important;
        box-shadow:0 14px 30px rgba(15,23,42,.18)!important;
      }
      html[data-site-theme="light"] .maul-light-location-badge,
      html[data-site-theme="light"] .maul-light-location-badge *,
      html[data-site-theme="light"] .maul-light-location-badge p,
      html[data-site-theme="light"] .maul-light-location-badge span,
      html[data-site-theme="light"] .maul-light-location-badge small{
        color:#ffffff!important;
        opacity:1!important;
      }
      html[data-site-theme="light"] .maul-light-location-badge [class*="meta"],
      html[data-site-theme="light"] .maul-light-location-badge [class*="label"]{
        color:#cbd5e1!important;
      }

      html[data-site-theme="light"] .maul-light-cert-row{
        background:transparent!important;
        border:0!important;
        border-radius:0!important;
        box-shadow:none!important;
        border-top:1px solid #e7ebf1!important;
      }
      html[data-site-theme="light"] .maul-light-cert-link,
      html[data-site-theme="light"] .maul-light-cert-row .maul-light-cert-link,
      html[data-site-theme="light"] .maul-light-cert-row a,
      html[data-site-theme="light"] .maul-light-cert-row span,
      html[data-site-theme="light"] .maul-light-cert-row strong{
        color:#111827!important;
      }
      html[data-site-theme="light"] .maul-light-cert-row:hover .maul-light-cert-link,
      html[data-site-theme="light"] .maul-light-cert-row:hover a,
      html[data-site-theme="light"] .maul-light-cert-row:hover span,
      html[data-site-theme="light"] .maul-light-cert-row:hover strong,
      html[data-site-theme="light"] .maul-light-cert-link:hover{
        color:#ff3158!important;
      }

      html[data-site-theme="light"] main a:not(.btn):not(.button):not([class*="nav"]):not([class*="social"]){
        color:#344054!important;
      }
      html[data-site-theme="light"] main a:not(.btn):not(.button):not([class*="nav"]):not([class*="social"]):hover{
        color:#ff3158!important;
      }
      html[data-site-theme="light"] .certification-card a,
      html[data-site-theme="light"] .credential-card a,
      html[data-site-theme="light"] [class*="certification"] a,
      html[data-site-theme="light"] [class*="credential"] a,
      html[data-site-theme="light"] .maul-light-readable{
        color:#344054!important;
      }
      html[data-site-theme="light"] .certification-card a:hover,
      html[data-site-theme="light"] .credential-card a:hover,
      html[data-site-theme="light"] [class*="certification"] a:hover,
      html[data-site-theme="light"] [class*="credential"] a:hover{
        color:#ff3158!important;
      }

      html[data-site-theme="light"] [class*="muted"],
      html[data-site-theme="light"] [class*="caption"],
      html[data-site-theme="light"] [class*="meta"]{color:#667085!important}
      html[data-site-theme="light"] [class*="border"],
      html[data-site-theme="light"] hr{border-color:#e4e7ec!important}

      html[data-site-theme="light"] .grid-layer{opacity:.34!important}
      html[data-site-theme="light"] .grain-layer{opacity:.05!important}
      html[data-site-theme="light"] .aurora-layer{opacity:.34!important}
      html[data-site-theme="light"] .cursor-grid-light{opacity:.34}
      html[data-site-theme="light"] footer{color:#667085!important;border-color:#e4e7ec!important}
      html[data-site-theme="light"] .maul-site-theme-toggle{
        background:rgba(243,245,248,.94);border-color:#e4e7ec
      }

      html[data-site-theme="dark"]{color-scheme:dark}
      html[data-site-theme="dark"] .maul-site-theme-toggle button[aria-pressed="true"]{
        background:#172033;color:#f8fafc
      }

      @media(max-width:760px){
        .maul-site-theme-toggle{position:static;margin-left:auto;margin-bottom:18px;width:max-content}
        .maul-site-theme-anchor{display:block!important}
      }
    `;
    document.head.appendChild(style);
  }

  function normalizeText(value) {
    return String(value || "").replace(/\s+/g, " ").trim().toLowerCase();
  }

  function decorateKnownSurfaces() {
    const surfaceKeywords = [
      "creative & brand",
      "acquire",
      "digital ads, acquisition, and growth channel",
      "measurement",
      "build",
      "optimize",
      "read framework",
      "automation system",
      "brief",
      "produce",
      "iterate",
      "workflow",
      "idea",
      "planning",
      "launch system"
    ];

    const strongSurfaceKeywords = [
      "creative & brand",
      "brand guidelines & creative production.",
      "digital marketing stack",
      "graphic design",
      "social content",
      "brand identity & guidelines",
      "creative project management",
      "video editing"
    ];

    const pillKeywords = [
      "read framework",
      "automation system",
      "workflow",
      "brief",
      "produce",
      "launch",
      "test",
      "analyze",
      "iterate",
      "idea",
      "planning",
      "build",
      "measurement",
      "testing",
      "launch system"
    ];

    const candidates = Array.from(
      document.querySelectorAll("main h1, main h2, main h3, main h4, main h5, main p, main strong, main span, main a, main button, main .title, main .label, main [class*='title']")
    );

    candidates.forEach((node) => {
      const text = normalizeText(node.textContent);
      if (!text) return;

      const surface = node.closest(
        "article, li, [class*='card'], [class*='box'], [class*='step'], [class*='item'], [class*='node'], [class*='tile'], [class*='phase'], [class*='workflow'], [class*='panel']"
      );

      if (surfaceKeywords.some((keyword) => text === keyword || text.includes(keyword))) {
        if (surface && surface !== document.body && surface !== document.documentElement) {
          surface.classList.add("maul-light-surface");
        }
      }

      if (strongSurfaceKeywords.some((keyword) => text === keyword || text.includes(keyword))) {
        if (surface && surface !== document.body && surface !== document.documentElement) {
          surface.classList.add("maul-light-surface", "maul-light-surface-strong");
        }
      }

      if (pillKeywords.some((keyword) => text === keyword)) {
        const pill = node.closest("a, button, [role='button'], [class*='chip'], [class*='pill'], [class*='tag'], [class*='badge']");
        if (pill) {
          pill.classList.add("maul-light-pill");
        } else {
          node.classList.add("maul-light-pill");
          if (node.parentElement) node.parentElement.classList.add("maul-light-pill");
        }
      }

      if (text.includes("meta blueprint badges obtained as part of the process")) {
        node.classList.add("maul-light-cert-link", "maul-light-readable");
        const row = node.closest("article, li, [class*='card'], [class*='item'], [class*='row']");
        if (row) row.classList.add("maul-light-cert-row");
      }

      if (text.includes("based in indonesia") || text === "based in indonesia, bekasi" || text.includes("indonesia, bekasi")) {
        node.classList.add("maul-light-readable");
        if (node.parentElement) node.parentElement.classList.add("maul-light-location-badge");
        if (node.parentElement && node.parentElement.parentElement) {
          node.parentElement.parentElement.classList.add("maul-light-location-badge");
        }
      }
    });
  }

  function updateButtons(theme) {
    document.querySelectorAll("[data-site-theme-choice]").forEach((button) => {
      const active = button.dataset.siteThemeChoice === theme;
      button.setAttribute("aria-pressed", String(active));
    });
  }

  function applyTheme(theme, persist) {
    const next = theme === "light" ? "light" : "dark";
    root.dataset.siteTheme = next;
    updateButtons(next);

    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", next === "light" ? "#f7f8fb" : "#07111f");

    if (persist !== false) {
      try { localStorage.setItem(STORAGE_KEY, next); } catch (error) {}
    }
  }

  function createToggle() {
    if (document.querySelector("[data-site-theme-toggle]")) return;

    const control = document.createElement("div");
    control.className = "maul-site-theme-toggle";
    control.dataset.siteThemeToggle = "true";
    control.setAttribute("role", "group");
    control.setAttribute("aria-label", "Appearance");
    control.innerHTML = `
      <button type="button" data-site-theme-choice="light" aria-pressed="false" title="Light mode">☀ Light</button>
      <button type="button" data-site-theme-choice="dark" aria-pressed="false" title="Dark mode">◐ Dark</button>`;

    control.addEventListener("click", (event) => {
      const button = event.target.closest("[data-site-theme-choice]");
      if (!button) return;
      applyTheme(button.dataset.siteThemeChoice, true);
    });

    const anchor = document.querySelector(
      ".subpage-hero-inner, .hero-inner, .hero-content, main > section:first-of-type, main"
    );

    if (anchor) {
      anchor.classList.add("maul-site-theme-anchor");
      anchor.appendChild(control);
    } else {
      document.body.insertAdjacentElement("afterbegin", control);
    }
  }

  installStyles();
  decorateKnownSurfaces();
  createToggle();
  applyTheme(inferInitialTheme(), false);
})();
