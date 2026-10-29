/* =========================================================
   PRODUCTS — /products/
   Vanilla JS, no dependencies. Language, International, cursor,
   brief form and QRIS behave exactly like the Website Development page.

   1. Language + International (same storage keys as production)
   2. Reveal, cursor + magnetic, spotlight, header progress
   3. Hero stack — five disciplines shuffling to the front
   4. Creative rows — prefilled WhatsApp + pointer-following preview
   5. Brief form → prefilled WhatsApp (+ live chat preview)
   6. QRIS popover
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
  const intl = () => root.dataset.international === "true";

  /* =========================================================
     1. LANGUAGE + INTERNATIONAL — keys match production
  ========================================================= */
  const LANG_KEY = "maulCommerceLanguage";
  const INTL_KEY = "maulProductsInternational";
  const WA_NUMBER = "6281296069566";
  const wa = (text) => `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;

  const langSelect = $("[data-maul-language-select]");
  const intlToggle = $("[data-product-international-toggle]");
  const onLanguage = []; // things that re-render on a language / international switch
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
    $$("[data-price-id][data-price-usd]").forEach((el) => (el.textContent = active ? el.dataset.priceUsd : el.dataset.priceId));
    if (active) {
      regularLanguage = lang();
      setLanguage("en", false);
    } else {
      setLanguage(regularLanguage, false);
    }
    if (persist) store(INTL_KEY, String(active));
  }

  langSelect.addEventListener("change", () => {
    if (intl() && langSelect.value === "id") langSelect.value = "en";
    regularLanguage = langSelect.value;
    setLanguage(langSelect.value, true);
  });
  intlToggle.addEventListener("click", () => setInternational(!intl(), true));

  /* =========================================================
     2. REVEAL + CURSOR + MAGNETIC + SPOTLIGHT + HEADER PROGRESS
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
  const cursorText = (t) => (lang() === "id" && t === "View" ? "Lihat" : t);

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

    $$("[data-spot]").forEach((el) => {
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        el.style.setProperty("--mx", `${(e.clientX - r.left).toFixed(0)}px`);
        el.style.setProperty("--my", `${(e.clientY - r.top).toFixed(0)}px`);
      });
    });
  }

  const progressBar = $("[data-scroll-progress]");
  let ticking = false;
  const onScroll = () => {
    ticking = false;
    const max = document.documentElement.scrollHeight - innerHeight;
    progressBar.style.setProperty("--progress", (max > 0 ? scrollY / max : 0).toFixed(4));
  };
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
  onScroll();

  /* =========================================================
     3. HERO STACK
     Every DWELL ms the front card flicks off to the left and rejoins
     at the back. Tabs jump to a discipline; hovering the stack or the
     tabs pauses the clock (the tab's fill bar pauses with it). The
     clock also stops while the hero is off screen or the tab is hidden.
  ========================================================= */
  (function heroStack() {
    const stack = $("[data-stack]");
    const tabsWrap = $("[data-stack-tabs]");
    if (!stack || !tabsWrap) return;
    const cards = $$(".stack-card", stack);
    const tabs = $$("button", tabsWrap);
    const n = cards.length;
    const DWELL = 2800;
    let active = 0;
    let elapsed = 0;
    let last = 0;
    let hovering = false;
    let visible = true;
    let leaving = 0;

    tabsWrap.style.setProperty("--dur", `${DWELL}ms`);

    function layout() {
      cards.forEach((c, i) => {
        const pos = (i - active + n) % n;
        c.dataset.pos = String(pos);
        c.style.setProperty("--pos", String(pos));
      });
      tabs.forEach((t, i) => {
        t.setAttribute("aria-selected", String(i === active));
        t.tabIndex = i === active ? 0 : -1;
      });
    }

    function go(next, flick) {
      next = (next + n) % n;
      if (next === active) return;
      const front = cards[active];
      elapsed = 0;
      if (flick && motionOK) {
        // the old front leaves first, then the deck closes up behind it
        front.classList.add("is-leaving");
        clearTimeout(leaving);
        active = next;
        tabs.forEach((t, i) => t.setAttribute("aria-selected", String(i === active)));
        leaving = setTimeout(() => {
          front.classList.remove("is-leaving");
          layout();
        }, 420);
      } else {
        cards.forEach((c) => c.classList.remove("is-leaving"));
        active = next;
        layout();
      }
    }

    const paused = () => hovering || !visible || document.hidden;
    const syncPause = () => tabsWrap.classList.toggle("is-paused", paused());

    function tick(now) {
      const dt = last ? Math.min(now - last, 100) : 0;
      last = now;
      if (!paused()) {
        elapsed += dt;
        if (elapsed >= DWELL) go(active + 1, true);
      }
      requestAnimationFrame(tick);
    }

    tabs.forEach((t, i) =>
      t.addEventListener("click", () => {
        go(i, false);
        // restart the fill bar on the chosen tab
        t.setAttribute("aria-selected", "false");
        void t.offsetWidth;
        t.setAttribute("aria-selected", "true");
      })
    );
    tabsWrap.addEventListener("keydown", (e) => {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      e.preventDefault();
      go(active + (e.key === "ArrowRight" ? 1 : -1), false);
      tabs[active].focus();
    });

    [stack, tabsWrap].forEach((el) => {
      el.addEventListener("pointerenter", () => {
        hovering = true;
        syncPause();
      });
      el.addEventListener("pointerleave", () => {
        hovering = false;
        syncPause();
      });
    });
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(([e]) => {
        visible = e.isIntersecting;
        syncPause();
      }).observe(stack);
    }
    document.addEventListener("visibilitychange", syncPause);

    layout();
    if (motionOK) requestAnimationFrame(tick);
    else tabsWrap.classList.add("is-paused");
  })();

  /* =========================================================
     4. CREATIVE ROWS
     Each row opens WhatsApp with a message naming the service, in the
     current language. On a fine pointer a small preview card trails
     the cursor and swaps its visual per row.
  ========================================================= */
  (function creative() {
    const rows = $$(".svc[data-svc]");
    if (!rows.length) return;

    const message = (svc) =>
      intl()
        ? `Hello Maul, I am interested in ${svc} and would like to continue with the international purchase and payment process.`
        : lang() === "en"
          ? `Hi Maul, I'm interested in ${svc}. Can we talk through what I need?`
          : `Halo Maul, saya tertarik dengan ${svc}. Boleh diskusi kebutuhannya?`;

    const relink = () => rows.forEach((a) => (a.href = wa(message(a.dataset.svc))));
    onLanguage.push(relink);
    relink();

    const preview = $("[data-svc-preview]");
    if (!preview || !finePointer || !motionOK) return;

    let px = 0;
    let py = 0;
    let tx = 0;
    let ty = 0;
    let on = false;
    let raf = 0;

    const move = () => {
      px = lerp(px, tx, 0.18);
      py = lerp(py, ty, 0.18);
      preview.style.transform = `translate3d(${px.toFixed(1)}px,${py.toFixed(1)}px,0)`;
      raf = on || Math.abs(tx - px) > 0.5 || Math.abs(ty - py) > 0.5 ? requestAnimationFrame(move) : 0;
    };
    // sits up-right of the cursor, flipped left near the viewport edge
    const target = (e) => {
      const w = preview.offsetWidth;
      const h = preview.offsetHeight;
      tx = e.clientX + 28 + w > innerWidth - 12 ? e.clientX - w - 28 : e.clientX + 28;
      ty = clamp(e.clientY - h - 18, 12, innerHeight - h - 12);
    };

    rows.forEach((a) => {
      a.addEventListener("pointerenter", (e) => {
        if (e.pointerType !== "mouse") return;
        const group = a.closest(".svc-group");
        preview.dataset.show = a.dataset.viz;
        preview.style.setProperty("--pg", group ? getComputedStyle(group).getPropertyValue("--g") : "");
        target(e);
        if (!on) {
          px = tx;
          py = ty;
        }
        on = true;
        preview.classList.add("is-on");
        if (!raf) raf = requestAnimationFrame(move);
      });
      a.addEventListener("pointermove", target);
      a.addEventListener("pointerleave", () => {
        on = false;
        preview.classList.remove("is-on");
      });
    });
    addEventListener("scroll", () => {
      on = false;
      preview.classList.remove("is-on");
    }, { passive: true });
  })();

  /* =========================================================
     5. BRIEF FORM → WHATSAPP
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
        intro: "Saya ingin diskusi project.",
        need: "Kebutuhan",
        social: "Sosial media",
        ref: "Referensi",
        when: "Target selesai",
        note: "Ide",
        idle: "Halo Maul, saya ingin diskusi project.",
      },
      en: {
        hello: "Hi Maul",
        me: (name, brand) => `, I'm ${name}${brand ? ` from ${brand}` : ""}.`,
        intro: "I'd like to discuss a project.",
        need: "I need",
        social: "Social media",
        ref: "Reference",
        when: "Deadline",
        note: "Idea",
        idle: "Hi Maul, I'd like to discuss a project.",
      },
    };

    const pick = (el) => (el ? el.dataset[lang()] || el.value : "");

    function compose() {
      const t = T[lang()];
      const d = new FormData(form);
      const name = (d.get("name") || "").trim();
      const brand = (d.get("brand") || "").trim();
      const need = $$('[name="need"]:checked', form).map(pick).join(", ");
      const picked = socials.filter((s) => s.checked && s !== none).map(pick);
      const h = (d.get("handle") || "").trim();
      const social = none.checked ? pick(none) : picked.length ? picked.join(", ") + (h ? ` — ${h}` : "") : "";
      const ref = (d.get("ref") || "").trim();
      const whenOpt = $('[name="when"] option:checked', form);
      const when = whenOpt && whenOpt.value ? pick(whenOpt) : "";
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

    const render = () => (chat.textContent = compose());

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
      window.open(wa(compose()), "_blank", "noopener");
    });

    onLanguage.push(localise);
    localise();
  })();

  /* =========================================================
     6. QRIS — hover / focus shows it (CSS); tap toggles it on touch
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

  setInternational(intl(), false);
})();
