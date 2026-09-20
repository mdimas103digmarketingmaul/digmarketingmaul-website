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

    // The original portfolio pages are dark by default.
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
      html[data-site-theme="light"]{color-scheme:light;
        --navy:#111827!important;--deep-navy:#f7f8fb!important;--dark-navy:#f7f8fb!important;
        --white:#111827!important;--slate:#667085!important;--light-slate:#475467!important;
        --lightest-slate:#344054!important;--card-bg:#fff!important;--border-color:#e4e7ec!important;
      }
      html[data-site-theme="light"] body{background:#f7f8fb!important;color:#111827!important}
      html[data-site-theme="light"] .site-header,
      html[data-site-theme="light"] header.site-header{background:rgba(255,255,255,.9)!important;border-color:#e4e7ec!important}
      html[data-site-theme="light"] .nav-link,
      html[data-site-theme="light"] .email-rail-link,
      html[data-site-theme="light"] .social-link{color:#475467!important}
      html[data-site-theme="light"] .hero-title-gradient,
      html[data-site-theme="light"] .subpage-title,
      html[data-site-theme="light"] h1,
      html[data-site-theme="light"] h2,
      html[data-site-theme="light"] h3{color:#111827}
      html[data-site-theme="light"] .topic-card,
      html[data-site-theme="light"] .framework-card,
      html[data-site-theme="light"] .article-card,
      html[data-site-theme="light"] .blog-card,
      html[data-site-theme="light"] .profile-card,
      html[data-site-theme="light"] .content-card,
      html[data-site-theme="light"] .project-card,
      html[data-site-theme="light"] [class*="glass-card"]{
        background:#fff!important;border-color:#e4e7ec!important;color:#111827!important;
        box-shadow:0 12px 38px rgba(15,23,42,.06)!important
      }
      html[data-site-theme="light"] p,
      html[data-site-theme="light"] .subpage-intro,
      html[data-site-theme="light"] [class*="description"]{color:#667085}
      html[data-site-theme="light"] .grid-layer{opacity:.18}
      html[data-site-theme="light"] .grain-layer{opacity:.08}
      html[data-site-theme="light"] .aurora-layer{opacity:.28}
      html[data-site-theme="light"] footer{color:#667085;border-color:#e4e7ec!important}
      html[data-site-theme="light"] .maul-site-theme-toggle{background:rgba(243,245,248,.92);border-color:#e4e7ec}
      html[data-site-theme="dark"]{color-scheme:dark}
      html[data-site-theme="dark"] .maul-site-theme-toggle button[aria-pressed="true"]{background:#172033;color:#f8fafc}
      @media(max-width:760px){
        .maul-site-theme-toggle{position:static;margin-left:auto;margin-bottom:18px;width:max-content}
        .maul-site-theme-anchor{display:block!important}
      }
    `;
    document.head.appendChild(style);
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
  createToggle();
  applyTheme(inferInitialTheme(), false);
})();
