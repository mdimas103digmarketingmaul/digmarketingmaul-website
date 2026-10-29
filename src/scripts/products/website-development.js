/* =========================================================
   WEBSITE DEVELOPMENT — product page · “Hanging Proofs”
   Vanilla JS, no dependencies. The showreel scene runs on showreel.js.

   1. Language + International (same storage keys as production)
   2. Header: scroll progress
   3. Reveal, cursor + magnetic
   4. Hanging sheets (drag / wheel / keys, pendulum physics, previews)
   5. Spotlight tiles, process line
   6. Brief form → prefilled WhatsApp (+ live chat preview)
   7. QRIS popover
========================================================= */
(function () {
  "use strict";

  const root = document.documentElement;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const motionOK = !reduceMotion;

  const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const lang = () => (root.dataset.language === "en" ? "en" : "id");

  /* =========================================================
     1. LANGUAGE + INTERNATIONAL — keys match production
  ========================================================= */
  const LANG_KEY = "maulCommerceLanguage";
  const INTL_KEY = "maulProductsInternational";
  const WA_NUMBER = "6281296069566";
  const INTL_WA = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent("Hello Maul, I am interested in Website Development and would like to continue with the international purchase and payment process.")}`;

  const langSelect = $("[data-maul-language-select]");
  const intlToggle = $("[data-product-international-toggle]");
  const onLanguage = []; // things that re-render on a language switch
  let regularLanguage = lang();

  const store = (k, v) => {
    try {
      localStorage.setItem(k, v);
    } catch (_) {}
  };

  function setLanguage(next, persist) {
    root.dataset.language = next;
    root.lang = next;
    langSelect.value = next;
    if (persist) store(LANG_KEY, next);
    onLanguage.forEach((fn) => fn());
  }

  function setInternational(active, persist) {
    root.dataset.international = String(active);
    intlToggle.setAttribute("aria-pressed", String(active));
    langSelect.querySelector('option[value="id"]').disabled = active;
    if (active) {
      regularLanguage = lang();
      setLanguage("en", false);
    } else {
      setLanguage(regularLanguage, false);
    }
    $$("[data-price-id][data-price-usd]").forEach((el) => (el.textContent = active ? el.dataset.priceUsd : el.dataset.priceId));
    $$("[data-international-cta]").forEach((cta) => {
      if (!cta.dataset.localHref) cta.dataset.localHref = cta.getAttribute("href");
      cta.setAttribute("href", active ? INTL_WA : cta.dataset.localHref);
      if (active) {
        cta.target = "_blank";
        cta.rel = "noopener noreferrer";
      } else {
        cta.removeAttribute("target");
        cta.removeAttribute("rel");
      }
    });
    if (persist) store(INTL_KEY, String(active));
  }

  langSelect.addEventListener("change", () => {
    if (root.dataset.international === "true" && langSelect.value === "id") langSelect.value = "en";
    regularLanguage = langSelect.value;
    setLanguage(langSelect.value, true);
  });
  intlToggle.addEventListener("click", () => setInternational(root.dataset.international !== "true", true));

  /* =========================================================
     3. REVEAL + CURSOR + MAGNETIC
  ========================================================= */
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("is-in");
          io.unobserve(e.target);
        }
      }),
      { rootMargin: "0px 0px -12% 0px" }
    );
    $$(".reveal, [data-reveal-title]").forEach((el) => io.observe(el));
  } else {
    $$(".reveal, [data-reveal-title]").forEach((el) => el.classList.add("is-in"));
  }

  const ring = $(".cursor-ring");
  const label = $(".cursor-label");
  const cursorText = (t) => (t === "Drag" && lang() === "id" ? "Geser" : t);

  if (finePointer && motionOK) {
    const dot = $(".cursor-dot");
    let mx = innerWidth / 2;
    let my = innerHeight / 2;
    let rx = mx;
    let ry = my;
    let running = false;
    root.classList.add("has-cursor");

    const follow = () => {
      rx = lerp(rx, mx, 0.2);
      ry = lerp(ry, my, 0.2);
      ring.style.transform = `translate3d(${rx.toFixed(1)}px,${ry.toFixed(1)}px,0)`;
      if (Math.abs(mx - rx) > 0.1 || Math.abs(my - ry) > 0.1) requestAnimationFrame(follow);
      else running = false;
    };

    addEventListener(
      "pointermove",
      (e) => {
        if (e.pointerType !== "mouse") return;
        mx = e.clientX;
        my = e.clientY;
        dot.style.transform = `translate3d(${mx}px,${my}px,0)`;
        root.classList.add("cursor-visible");
        if (!running) {
          running = true;
          requestAnimationFrame(follow);
        }
      },
      { passive: true }
    );
    root.addEventListener("mouseleave", () => root.classList.remove("cursor-visible"));

    document.addEventListener("pointerover", (e) => {
      const t = e.target.closest("[data-cursor], a, button, summary, label, select");
      const text = t && t.dataset.cursor;
      ring.classList.toggle("has-label", Boolean(text));
      ring.classList.toggle("is-link", Boolean(t) && !text);
      if (text) label.textContent = cursorText(text);
    });

    $$("[data-magnetic]").forEach((el) => {
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        el.style.translate = `${((e.clientX - r.left - r.width / 2) * 0.25).toFixed(1)}px ${((e.clientY - r.top - r.height / 2) * 0.3).toFixed(1)}px`;
      });
      el.addEventListener("pointerleave", () => (el.style.translate = ""));
    });
  }

  /* =========================================================
     4. HANGING SHEETS
     The track slides along the rail; each sheet is a pendulum hung from
     the rail, pushed by the track's velocity (springy, slightly under-
     damped, own stiffness per sheet → a travelling wave). The sheet only
     drags; its ↗ button is the only link. Only the centred sheet loads
     its live site (max 2 at a time).
  ========================================================= */
  (function hangingSheets() {
    const hang = $("[data-hang]");
    if (!hang) return;
    const viewport = $("[data-hang-viewport]", hang);
    const track = $("[data-hang-track]", hang);
    const sheets = $$(".sheet", track);
    const swings = sheets.map((s) => $(".sheet-swing", s));
    const prevBtn = $("[data-hang-prev]");
    const nextBtn = $("[data-hang-next]");
    const counter = $("[data-hang-current]");
    const bar = $("[data-hang-bar]");
    $("[data-hang-total]").textContent = String(sheets.length).padStart(2, "0");

    let step = 0;
    let minX = 0;
    let x = 0;
    let v = 0; // px/s
    let target = 0; // snap target (px); null while free
    let index = 0;
    let dragging = false;
    let inView = false;
    let raf = 0;
    let lastT = 0;
    let settledAt = 0;
    let hovered = -1; // the sheet under the pointer holds still, so its ↗ button is easy to hit
    const pend = sheets.map((_, i) => ({ a: motionOK ? -9 + i * 3 : 0, w: 0, k: 70 + (i % 3) * 14 })); // they arrive swinging

    function measure() {
      const sheetW = sheets[0].getBoundingClientRect().width;
      const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      step = sheetW + gap;
      // Hero column: active sheet sits on the left, the next ones peek in from the right edge.
      // Phones: the active sheet is centred.
      const vw = viewport.clientWidth;
      const padL = innerWidth > 900 ? 18 : Math.max(0, (vw - sheetW) / 2);
      track.style.paddingLeft = `${padL}px`;
      track.style.paddingRight = `${Math.max(0, vw - sheetW - padL)}px`;
      minX = -(sheets.length - 1) * step;
      $$(".sheet-screen", track).forEach((s) => s.style.setProperty("--s", (s.clientWidth / 1440).toFixed(4)));
      x = target = -index * step;
    }

    const nearest = (pos) => clamp(Math.round(-pos / step), 0, sheets.length - 1);

    function go(i) {
      index = clamp(Math.round(i), 0, sheets.length - 1);
      target = -index * step;
      if (!motionOK) x = target;
      wake();
    }

    function updateUi() {
      const i = nearest(x);
      counter.textContent = String(i + 1).padStart(2, "0");
      bar.style.setProperty("--p", ((i + 1) / sheets.length).toFixed(3));
      prevBtn.disabled = i === 0;
      nextBtn.disabled = i === sheets.length - 1;
    }

    function manageLive(now) {
      if (dragging || target === null || Math.abs(target - x) > 1 || !inView) {
        settledAt = 0;
        return;
      }
      if (!settledAt) settledAt = now;
      if (now - settledAt < 650) return;
      const i = nearest(x);
      sheets.forEach((s, j) => {
        const frame = $("iframe", s);
        if (!frame) return;
        if (j === i && !frame.getAttribute("src")) {
          frame.addEventListener("load", () => s.classList.add("is-live"), { once: true });
          frame.setAttribute("src", frame.dataset.src);
        } else if (Math.abs(j - i) > 1 && frame.getAttribute("src")) {
          frame.removeAttribute("src");
          s.classList.remove("is-live");
        }
      });
    }

    function tick(now) {
      raf = 0;
      const dt = lastT ? Math.min(0.05, (now - lastT) / 1000) : 1 / 60;
      lastT = now;

      if (!dragging && target !== null) {
        if (motionOK) {
          const k = 120;
          const c = 2 * Math.sqrt(k) * 0.92;
          v += (k * (target - x) - c * v) * dt;
          x += v * dt;
          if (Math.abs(target - x) < 0.4 && Math.abs(v) < 6) {
            x = target;
            v = 0;
          }
        } else {
          x = target;
          v = 0;
        }
      }

      track.style.transform = `translate3d(${x.toFixed(2)}px,0,0)`;

      let moving = Math.abs(v) > 1;
      const t = now / 1000;
      sheets.forEach((s, i) => {
        const p = pend[i];
        if (motionOK) {
          const push = clamp(-v * 0.0075, -15, 15);
          const idle = i === hovered ? 0 : Math.sin(t * 1.05 + i * 1.9) * 0.45;
          p.w += (p.k * (push + idle - p.a) - 5.5 * p.w) * dt;
          p.a += p.w * dt;
          if (Math.abs(p.w) > 0.05) moving = true;
        }
        const focus = 1 - clamp(Math.abs(x + i * step) / step);
        swings[i].style.rotate = `${p.a.toFixed(2)}deg`;
        swings[i].style.scale = (0.86 + 0.14 * focus).toFixed(4);
        s.style.setProperty("--focus", focus.toFixed(3));
      });

      updateUi();
      manageLive(now);
      if (inView && (motionOK || moving || dragging || target !== x)) raf = requestAnimationFrame(tick);
      else lastT = 0;
    }

    function wake() {
      if (!raf) raf = requestAnimationFrame(tick);
    }

    /* Drag — pointer capture only once it is really a drag, so the ↗ button still clicks */
    let startX = 0;
    let startPos = 0;
    let lastX = 0;
    let lastMoveT = 0;
    let moved = 0;
    let pointerId = null;

    viewport.addEventListener("pointerover", (e) => {
      const s = e.target.closest(".sheet");
      hovered = s ? sheets.indexOf(s) : -1;
    });
    viewport.addEventListener("pointerleave", () => (hovered = -1));

    viewport.addEventListener("pointerdown", (e) => {
      if (e.button !== 0) return;
      pointerId = e.pointerId;
      startX = lastX = e.clientX;
      startPos = x;
      lastMoveT = e.timeStamp;
      moved = 0;
    });

    viewport.addEventListener("pointermove", (e) => {
      if (e.pointerId !== pointerId) return;
      const dx = e.clientX - startX;
      moved = Math.max(moved, Math.abs(dx));
      if (!dragging && moved > 6) {
        dragging = true;
        target = null;
        viewport.setPointerCapture(pointerId);
        viewport.classList.add("is-dragging");
      }
      if (!dragging) return;
      let nx = startPos + dx;
      if (nx > 0) nx *= 0.35;
      if (nx < minX) nx = minX + (nx - minX) * 0.35;
      const dtm = (e.timeStamp - lastMoveT) / 1000;
      if (dtm > 0) v = lerp(v, (e.clientX - lastX) / dtm, 0.35);
      lastX = e.clientX;
      lastMoveT = e.timeStamp;
      x = nx;
      wake();
    });

    const release = (e) => {
      if (e.pointerId !== pointerId) return;
      pointerId = null;
      if (!dragging) return;
      dragging = false;
      viewport.classList.remove("is-dragging");
      if (e.timeStamp - lastMoveT > 80) v = 0;
      go(nearest(x + v * 0.22));
    };
    viewport.addEventListener("pointerup", release);
    viewport.addEventListener("pointercancel", release);

    // A drag that ends on the ↗ button must not open the site
    track.addEventListener(
      "click",
      (e) => {
        if (moved > 6) {
          e.preventDefault();
          e.stopPropagation();
        }
      },
      true
    );

    let wheelTimer = 0;
    viewport.addEventListener(
      "wheel",
      (e) => {
        const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.shiftKey ? e.deltaY : 0;
        if (!d) return;
        e.preventDefault();
        target = null;
        x = clamp(x - d, minX - 60, 60);
        v = lerp(v, -d * 40, 0.3);
        wake();
        clearTimeout(wheelTimer);
        wheelTimer = setTimeout(() => go(nearest(x)), 140);
      },
      { passive: false }
    );

    prevBtn.addEventListener("click", () => go(nearest(x) - 1));
    nextBtn.addEventListener("click", () => go(nearest(x) + 1));
    viewport.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        go(nearest(x) + 1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        go(nearest(x) - 1);
      }
    });
    sheets.forEach((s, i) => $(".sheet-go", s).addEventListener("focus", () => go(i)));

    new IntersectionObserver((entries) => {
      inView = entries[0].isIntersecting;
      if (inView) wake();
    }).observe(hang);

    let resizeTimer = 0;
    addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        measure();
        wake();
      }, 120);
    });

    measure();
    updateUi();
    wake();
  })();

  /* =========================================================
     5. SPOTLIGHT TILES, PROCESS LINE, HEADER PROGRESS
  ========================================================= */
  if (finePointer) {
    $$("[data-spot]").forEach((el) => {
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        el.style.setProperty("--mx", `${(e.clientX - r.left).toFixed(0)}px`);
        el.style.setProperty("--my", `${(e.clientY - r.top).toFixed(0)}px`);
      });
    });
  }

  const progressBar = $("[data-scroll-progress]");
  const process = $("[data-process]");
  const steps = $$(".step", process);
  let ticking = false;

  function onScroll() {
    ticking = false;
    const vh = innerHeight;
    const max = document.documentElement.scrollHeight - vh;
    progressBar.style.setProperty("--progress", (max > 0 ? scrollY / max : 0).toFixed(4));

    const pr = process.getBoundingClientRect();
    const pp = motionOK ? clamp((vh * 0.85 - pr.top) / (vh * 0.6)) : 1;
    process.style.setProperty("--pp", pp.toFixed(3));
    steps.forEach((s, i) => s.classList.toggle("is-on", pp >= (i + 0.3) / steps.length));
  }

  addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(onScroll);
      }
    },
    { passive: true }
  );
  addEventListener("resize", onScroll);
  onScroll();

  /* =========================================================
     6. BRIEF FORM → WHATSAPP
     Nothing is stored or sent anywhere: the message is composed
     here and opened in WhatsApp for the visitor to send.
  ========================================================= */
  (function briefForm() {
    const form = $("[data-brief]");
    if (!form) return;
    const chat = $("[data-chat-text]");
    const handle = $('[name="handle"]', form);
    const socials = $$('[name="social"]', form);
    const none = $("[data-none]", form);

    const T = {
      id: {
        hello: "Halo Maul",
        me: (name, brand) => `, saya ${name}${brand ? ` dari ${brand}` : ""}.`,
        intro: "Saya ingin diskusi website.",
        need: "Kebutuhan",
        social: "Sosial media",
        ref: "Referensi",
        when: "Target live",
        note: "Ide",
        idle: "Halo Maul, saya ingin diskusi website.",
      },
      en: {
        hello: "Hi Maul",
        me: (name, brand) => `, I'm ${name}${brand ? ` from ${brand}` : ""}.`,
        intro: "I'd like to discuss a website.",
        need: "I need",
        social: "Social media",
        ref: "Reference",
        when: "Go-live target",
        note: "Idea",
        idle: "Hi Maul, I'd like to discuss a website.",
      },
    };

    const pick = (el) => (el ? el.dataset[lang()] || el.value : "");

    function compose() {
      const t = T[lang()];
      const d = new FormData(form);
      const name = (d.get("name") || "").trim();
      const brand = (d.get("brand") || "").trim();
      const need = pick($('[name="need"]:checked', form));
      const picked = socials.filter((s) => s.checked && s !== none).map(pick);
      const h = (d.get("handle") || "").trim();
      const social = none.checked ? pick(none) : picked.length ? picked.join(", ") + (h ? ` — ${h}` : "") : "";
      const ref = (d.get("ref") || "").trim();
      const when = pick($('[name="when"] option:checked', form).value ? $('[name="when"] option:checked', form) : null);
      const note = (d.get("note") || "").trim();

      if (!name && !brand && !need && !social && !ref && !when && !note) return t.idle;
      const lines = [`${t.hello}${name ? t.me(name, brand) : "."} ${t.intro}`, ""];
      if (need) lines.push(`• ${t.need}: ${need}`);
      if (social) lines.push(`• ${t.social}: ${social}`);
      if (ref) lines.push(`• ${t.ref}: ${ref}`);
      if (when) lines.push(`• ${t.when}: ${when}`);
      if (note) lines.push(`• ${t.note}: ${note}`);
      return lines.join("\n").trim();
    }

    function render() {
      chat.textContent = compose();
    }

    function localise() {
      $$("[data-ph-id]", form).forEach((el) => (el.placeholder = el.dataset[lang() === "en" ? "phEn" : "phId"]));
      $$("option[data-id]", form).forEach((o) => (o.textContent = o.dataset[lang()]));
      render();
    }

    // “Not yet” is exclusive; any platform reveals the account field
    socials.forEach((s) =>
      s.addEventListener("change", () => {
        if (s === none && none.checked) socials.forEach((o) => o !== none && (o.checked = false));
        if (s !== none && s.checked) none.checked = false;
        handle.hidden = !socials.some((o) => o.checked && o !== none);
        render();
      })
    );

    form.addEventListener("input", (e) => {
      const f = e.target.closest(".field");
      if (f) f.classList.remove("is-invalid");
      render();
    });
    form.addEventListener("change", render);

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const nameField = $('[data-field="name"]', form);
      const needField = $('[data-field="need"]', form);
      const okName = Boolean($('[name="name"]', form).value.trim());
      const okNeed = Boolean($('[name="need"]:checked', form));
      nameField.classList.toggle("is-invalid", !okName);
      needField.classList.toggle("is-invalid", !okNeed);
      if (!okName || !okNeed) {
        (okName ? $('[name="need"]', form) : $('[name="name"]', form)).focus();
        return;
      }
      window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(compose())}`, "_blank", "noopener");
    });

    onLanguage.push(localise);
    localise();
  })();

  /* =========================================================
     7. QRIS — hover / focus shows it (CSS); tap toggles it on touch
  ========================================================= */
  (function qris() {
    const item = $(".qris");
    if (!item) return;
    const btn = $("[data-qris]", item);
    const pop = $("[data-qris-pop]", item);
    const header = $("[data-header]");
    // Open towards the side with more room (the sticky header counts as taken space)
    const place = () => {
      const r = btn.getBoundingClientRect();
      const top = header.offsetHeight + 8;
      const h = pop.offsetHeight;
      const above = r.top - top;
      const below = innerHeight - r.bottom;
      const down = above < h + 16 && below > above;
      item.classList.toggle("qris--below", down);
      // If neither side fits, slide it so the whole code stays on screen
      const y = down ? r.bottom + 16 : r.top - 16 - h;
      const shift = clamp(y, top, innerHeight - h - 8) - y;
      pop.style.setProperty("--qris-shift", `${shift.toFixed(0)}px`);
      item.classList.toggle("qris--shifted", Math.abs(shift) > 2);
    };
    item.addEventListener("pointerenter", place);
    item.addEventListener("focusin", place);
    const set = (open) => {
      if (open) place();
      item.classList.toggle("is-open", open);
      btn.setAttribute("aria-expanded", String(open));
    };
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      set(!item.classList.contains("is-open"));
    });
    document.addEventListener("click", (e) => {
      if (!item.contains(e.target)) set(false);
    });
    addEventListener("keydown", (e) => {
      if (e.key === "Escape") set(false);
    });
    $(".qris-confirm", item).addEventListener("click", () => set(false));
  })();

  setInternational(root.dataset.international === "true", false);
  setLanguage(lang(), false);
})();
