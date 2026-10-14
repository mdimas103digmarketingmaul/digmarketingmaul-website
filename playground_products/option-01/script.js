/* =========================================================
   DIGMARKETINGMAUL — PRODUCTS · VISUAL OPTION 01
   Vanilla JS, no dependencies.

   Keeps production behaviour:
   - Light / Dark (localStorage: maulSiteTheme, maulProductsTheme)
   - ID / EN copy (localStorage: maulCommerceLanguage)
   - International mode (localStorage: maulProductsInternational,
     maulCourseInternational) → EN copy, USD prices, PayPal cue,
     WhatsApp CTA for the 3 International-active products only.
   Adds:
   - product map readout + jump-to-product highlight
   - animated market switch (price roll + sweep line)
   - pointer spotlight on available products
========================================================= */

(function () {
  "use strict";

  var root = document.documentElement;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var finePointer = window.matchMedia("(pointer: fine)");

  var INTERNATIONAL_ACTIVE = new Set([
    "website-course",
    "website-development",
    "digital-marketing-ebooks"
  ]);
  var WA_NUMBER = "6281296069566";

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) { /* storage blocked */ } }
  };

  function motionOK() { return !reduceMotion.matches; }

  /* ---------- elements ---------- */
  var langBlocks = $$("[data-copy-lang]");
  var langBtns = $$(".seg-btn[data-lang]");
  var themeBtns = $$(".seg-btn[data-theme]");
  var intlSwitch = $(".intl");
  var priceEls = $$(".js-price");
  var ctas = $$(".js-cta");
  var announcer = $("#state-announcer");
  var map = $("[data-constellation]");
  var readout = $(".readout");
  var nodes = map ? $$(".node", map) : [];
  var spokes = map ? $$(".spoke", map) : [];

  var regularLanguage = store.get("maulCommerceLanguage") === "en" ? "en" : "id";
  var shownTarget = "p-website-course";

  priceEls.forEach(function (el) { el.dataset.value = el.textContent.trim(); });

  /* ---------- language ---------- */
  function setLanguage(lang) {
    var selected = lang === "en" ? "en" : "id";
    root.lang = selected;
    langBlocks.forEach(function (el) { el.hidden = el.dataset.copyLang !== selected; });
    langBtns.forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.lang === selected)); });
    renderReadout(shownTarget, false);
  }

  /* ---------- theme ---------- */
  var themeTimer = null;
  function applyTheme(theme, persist) {
    var selected = theme === "light" ? "light" : "dark";
    if (persist && motionOK()) {
      root.classList.add("is-theming");
      clearTimeout(themeTimer);
      themeTimer = setTimeout(function () { root.classList.remove("is-theming"); }, 450);
    }
    root.dataset.productsTheme = selected;
    themeBtns.forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.theme === selected)); });
    var meta = $('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", selected === "light" ? "#f6f7f9" : "#07111f");
    if (persist) {
      store.set("maulSiteTheme", selected);
      store.set("maulProductsTheme", selected);
    }
  }

  /* ---------- product helpers ---------- */
  function cardOf(el) { return el.closest("[data-product-id]"); }

  function productName(card) {
    var title = card && card.querySelector("h3 span:not([hidden])");
    return title ? title.textContent.replace(/\s+/g, " ").trim() : "a product";
  }

  function waUrl(card) {
    var msg = "Hi Maul, I am interested in " + productName(card) +
      " (International). Could you help me with the purchase/payment process?";
    return "https://wa.me/" + WA_NUMBER + "?text=" + encodeURIComponent(msg);
  }

  /* ---------- prices (with roll) ---------- */
  function updatePrices(active, animate) {
    var vh = window.innerHeight || 800;
    priceEls.forEach(function (el) {
      var next = active ? el.dataset.priceUsd : el.dataset.priceId;
      var prev = el.dataset.value || el.textContent.trim();
      if (prev === next) return;
      el.dataset.value = next;
      clearTimeout(el._rollTimer);

      var rect = el.getBoundingClientRect();
      var onScreen = rect.bottom > 0 && rect.top < vh;
      if (!animate || !onScreen) { el.textContent = next; return; }

      var delay = Math.round(Math.min(Math.max(rect.top / vh, 0), 1) * 640);
      var roll = document.createElement("span");
      roll.className = "roll";
      roll.style.setProperty("--d", delay + "ms");
      var oldEl = document.createElement("span");
      oldEl.className = "roll-old";
      oldEl.setAttribute("aria-hidden", "true");
      oldEl.textContent = prev;
      var newEl = document.createElement("span");
      newEl.className = "roll-new";
      newEl.textContent = next;
      roll.appendChild(oldEl);
      roll.appendChild(newEl);
      el.textContent = "";
      el.appendChild(roll);
      el._rollTimer = setTimeout(function () { el.textContent = next; }, delay + 620);
    });
  }

  /* ---------- International mode ---------- */
  var sweep = null;
  var switchTimer = null;

  function playSwitchMoment() {
    if (!motionOK()) return;
    if (!sweep) {
      sweep = document.createElement("div");
      sweep.className = "market-sweep";
      sweep.setAttribute("aria-hidden", "true");
      document.body.appendChild(sweep);
    }
    var vh = window.innerHeight || 800;
    $$(".feature, .idx-row, .market").forEach(function (el) {
      var top = el.getBoundingClientRect().top;
      var d = Math.round(Math.min(Math.max(top / vh, 0), 1) * 640);
      el.style.setProperty("--d", d + "ms");
    });
    sweep.classList.remove("is-on");
    void sweep.offsetWidth;
    sweep.classList.add("is-on");
    root.classList.add("is-switching");
    clearTimeout(switchTimer);
    switchTimer = setTimeout(function () { root.classList.remove("is-switching"); }, 1300);
  }

  function applyInternational(active, opts) {
    opts = opts || {};
    var animate = !!opts.animate && motionOK();
    var idBtn = langBtns.filter(function (b) { return b.dataset.lang === "id"; })[0];

    root.dataset.international = active ? "true" : "false";
    if (intlSwitch) intlSwitch.setAttribute("aria-checked", String(active));

    if (active) {
      if (!opts.init) regularLanguage = root.lang === "en" ? "en" : "id";
      setLanguage("en");
      if (idBtn) {
        idBtn.disabled = true;
        idBtn.title = "Indonesian copy is not available in International mode";
      }
    } else {
      if (idBtn) { idBtn.disabled = false; idBtn.removeAttribute("title"); }
      setLanguage(regularLanguage);
    }

    if (animate) playSwitchMoment();
    updatePrices(active, animate);

    ctas.forEach(function (cta) {
      var card = cardOf(cta);
      if (active && card && INTERNATIONAL_ACTIVE.has(card.dataset.productId)) {
        cta.setAttribute("href", waUrl(card));
        cta.setAttribute("target", "_blank");
        cta.setAttribute("rel", "noopener noreferrer");
      } else {
        cta.setAttribute("href", cta.dataset.detailUrl);
        cta.removeAttribute("target");
        cta.removeAttribute("rel");
      }
    });

    renderReadout(shownTarget, false);

    if (opts.persist) {
      store.set("maulProductsInternational", String(active));
      store.set("maulCourseInternational", String(active));
      if (active) store.set("maulCommerceLanguage", "en");
    }

    if (opts.announce && announcer) {
      announcer.textContent = active
        ? "International mode on. Prices in USD; available products use WhatsApp and PayPal."
        : (root.lang === "id" ? "Mode International nonaktif. Harga dalam Rupiah." : "International mode off. Prices in IDR.");
    }
  }

  /* ---------- product map ---------- */
  function visibleText(sel, ctx) {
    var el = (ctx || document).querySelector(sel);
    return el ? el.textContent.replace(/\s+/g, " ").trim() : "";
  }

  function renderReadout(targetId, swap) {
    if (!readout || !targetId) return;
    var card = document.getElementById(targetId);
    var node = nodes.filter(function (n) { return n.dataset.target === targetId; })[0];
    if (!card || !node) return;

    var live = card.dataset.available === "true";
    var price = card.querySelector(".price");
    readout.classList.toggle("is-live", live);
    $(".ro-id", readout).textContent = visibleText(".pid", card);
    $(".ro-title", readout).textContent = productName(card);
    $(".ro-ring", readout).textContent = visibleText(".ring-label-" + node.dataset.ring + " span:not([hidden])", map);
    $(".ro-status", readout).textContent = visibleText(
      (live ? ".jump--live" : ".jump--soon") + " span[data-copy-lang]:not([hidden])"
    );
    $(".ro-price", readout).textContent = price ? (price.dataset.value || price.textContent.trim()) : "";

    if (swap && motionOK()) {
      readout.classList.remove("is-swap");
      void readout.offsetWidth;
      readout.classList.add("is-swap");
    }
  }

  function setHot(targetId) {
    if (!map) return;
    map.classList.toggle("has-hot", !!targetId);
    nodes.forEach(function (n) { n.classList.toggle("is-hot", n.dataset.target === targetId); });
    spokes.forEach(function (s) { s.classList.toggle("is-hot", s.dataset.for === targetId); });
    if (targetId && targetId !== shownTarget) {
      shownTarget = targetId;
      renderReadout(targetId, true);
    }
  }

  function flashTarget(targetId) {
    var el = document.getElementById(targetId);
    if (!el) return;
    el.classList.remove("is-target");
    void el.offsetWidth;
    el.classList.add("is-target");
    clearTimeout(el._flashTimer);
    el._flashTimer = setTimeout(function () { el.classList.remove("is-target"); }, 2000);
  }

  nodes.forEach(function (node) {
    var id = node.dataset.target;
    node.addEventListener("pointerenter", function () { setHot(id); });
    node.addEventListener("pointerleave", function () { setHot(null); });
    node.addEventListener("focus", function () { setHot(id); });
    node.addEventListener("blur", function () { setHot(null); });
    node.addEventListener("click", function () { flashTarget(id); });
  });

  /* ---------- controls ---------- */
  langBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var lang = btn.dataset.lang;
      if (root.dataset.international === "true" && lang === "id") return;
      regularLanguage = lang === "en" ? "en" : "id";
      setLanguage(regularLanguage);
      store.set("maulCommerceLanguage", regularLanguage);
    });
  });

  themeBtns.forEach(function (btn) {
    btn.addEventListener("click", function () { applyTheme(btn.dataset.theme, true); });
  });

  if (intlSwitch) {
    intlSwitch.addEventListener("click", function () {
      applyInternational(root.dataset.international !== "true", { animate: true, persist: true, announce: true });
    });
  }

  /* ---------- spotlight on available products ---------- */
  if (finePointer.matches) {
    $$(".feature").forEach(function (cell) {
      cell.addEventListener("pointermove", function (e) {
        var r = cell.getBoundingClientRect();
        cell.style.setProperty("--mx", (e.clientX - r.left) + "px");
        cell.style.setProperty("--my", (e.clientY - r.top) + "px");
      }, { passive: true });
    });
  }

  /* ---------- flagship mock: zero → live, once ---------- */
  var mock = $(".mock");
  if (mock) {
    if (!motionOK() || !("IntersectionObserver" in window)) {
      mock.classList.add("is-in");
    } else {
      var mo = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) { mock.classList.add("is-in"); mo.disconnect(); }
        });
      }, { threshold: 0.45 });
      mo.observe(mock);
    }
  }

  /* ---------- cursor grid light (brand) ---------- */
  var gridLight = $("#cursor-grid-light");
  if (gridLight && finePointer.matches && motionOK()) {
    document.addEventListener("pointermove", function (e) {
      gridLight.style.setProperty("--mouse-x", e.clientX + "px");
      gridLight.style.setProperty("--mouse-y", e.clientY + "px");
      gridLight.classList.add("is-visible");
    }, { passive: true });
    document.addEventListener("mouseleave", function () { gridLight.classList.remove("is-visible"); });
  }

  /* ---------- scroll: progress bar + header edge ---------- */
  var progress = $("#scroll-progress");
  var header = $("#site-header");
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var p = max > 0 ? Math.min(1, window.scrollY / max) : 0;
      if (progress) progress.style.transform = "scaleX(" + p + ")";
      if (header) header.classList.toggle("is-scrolled", window.scrollY > 8);
      ticking = false;
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);

  /* ---------- placeholder social links ---------- */
  $$('[data-placeholder-social="true"]').forEach(function (a) {
    a.addEventListener("click", function (e) { e.preventDefault(); });
  });

  /* ---------- init ---------- */
  applyTheme(root.dataset.productsTheme, false);
  setLanguage(regularLanguage);
  applyInternational(root.dataset.international === "true", { init: true });
  onScroll();

  if (location.hash && /^#p-/.test(location.hash)) {
    flashTarget(location.hash.slice(1));
  }
})();
