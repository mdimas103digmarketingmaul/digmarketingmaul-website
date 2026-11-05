/* =========================================================
   GRAPHIC DESIGN — product page · “Hanging Samples”
   Vanilla JS, no dependencies. Same interaction language as the
   Website Development and Video Editing & Motion pages; the hanging
   sheets here carry HTML/CSS sample applications (no images).

   1. Language + International (same storage keys as production)
   2. Reveal, cursor + magnetic
   3. Hanging samples (drag / wheel / keys, pendulum physics)
      + category index (a click moves the rail to that category)
   4. One look, every medium (sample brand switcher)
   5. Spotlight tiles, process line, header progress
   6. Brief form → prefilled WhatsApp (+ live chat preview)
   7. QRIS popover
   8. Newsletter sheets → full-length email viewer
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

  const langSelect = $("[data-maul-language-select]");
  const intlToggle = $("[data-product-international-toggle]");
  const onLanguage = [];
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
    if (persist) store(INTL_KEY, String(active));
  }

  langSelect.addEventListener("change", () => {
    if (root.dataset.international === "true" && langSelect.value === "id") langSelect.value = "en";
    regularLanguage = langSelect.value;
    setLanguage(langSelect.value, true);
  });
  intlToggle.addEventListener("click", () => setInternational(root.dataset.international !== "true", true));

  /* =========================================================
     2. REVEAL + CURSOR + MAGNETIC
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
  const CURSOR_ID = { Drag: "Geser", View: "Lihat" };
  const cursorText = (t) => (lang() === "id" && CURSOR_ID[t]) || t;

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
     3. OVERVIEW WALL + HANGING SHEETS
     The hero opens on the wall (data-view="wall"): every image, small,
     in drifting columns (CSS). A tile, a category or → switches to the
     rail (data-view="rail") already standing on that sheet; the ▦ button
     goes back. Both live in the same grid cell, so the rail keeps its
     size while hidden.
     The rail: same physics as the other product pages: the track slides
     along the rail, each sheet is a pendulum pushed by the track's
     velocity. Sheets differ in height but share a width.
  ========================================================= */
  (function hangingSamples() {
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
    const cats = $$("[data-cat-go]");
    const hero = hang.closest("[data-view]");
    const wall = $("[data-wall]");
    const wallBtn = $("[data-view-wall]");
    let railOn = !hero || hero.dataset.view !== "wall";
    let litCat = null;
    $("[data-hang-total]").textContent = String(sheets.length).padStart(2, "0");

    let step = 0;
    let minX = 0;
    let x = 0;
    let v = 0;
    let target = 0;
    let index = 0;
    let dragging = false;
    let inView = false;
    let raf = 0;
    let lastT = 0;
    let hovered = -1;
    const pend = sheets.map((_, i) => ({ a: motionOK ? -9 + i * 3 : 0, w: 0, k: 70 + (i % 3) * 14 }));

    function measure() {
      const sheetW = sheets[0].getBoundingClientRect().width;
      const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      step = sheetW + gap;
      const vw = viewport.clientWidth;
      const padL = innerWidth > 900 ? 18 : Math.max(0, (vw - sheetW) / 2);
      track.style.paddingLeft = `${padL}px`;
      track.style.paddingRight = `${Math.max(0, vw - sheetW - padL)}px`;
      minX = -(sheets.length - 1) * step;
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
      const cat = railOn ? sheets[i].dataset.cat || null : null;
      if (cat !== litCat) {
        litCat = cat;
        cats.forEach((b) => {
          const on = b.dataset.catGo === cat;
          b.classList.toggle("is-active", on);
          if (on) b.setAttribute("aria-current", "true");
          else b.removeAttribute("aria-current");
        });
      }
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
      if (inView && railOn && (motionOK || moving || dragging || target !== x)) raf = requestAnimationFrame(tick);
      else lastT = 0;
    }

    function wake() {
      if (!raf) raf = requestAnimationFrame(tick);
    }

    /* Drag — pointer capture only once it is really a drag, so the link still clicks */
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

    // A drag that ends on the link must not follow it
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

    /* Wall ↔ rail */
    function setView(view) {
      if (!hero) return;
      railOn = view === "rail";
      hero.dataset.view = view;
      if (wall) wall.classList.toggle("is-off", railOn);
      if (railOn) {
        // the sheets arrive with a small swing
        if (motionOK) pend.forEach((p, i) => (p.w += 26 + (i % 3) * 8));
        wake();
      }
      updateUi();
    }

    // Land on sheet i: straight there when coming from the wall, sliding when already on the rail
    function enter(i) {
      const fromWall = !railOn;
      go(i);
      if (!fromWall) return;
      x = target;
      v = 0;
      setView("rail");
      if (wall && wall.contains(document.activeElement)) viewport.focus({ preventScroll: true });
    }

    $$("[data-wall-go]").forEach((tile) =>
      tile.addEventListener("click", () => {
        const i = sheets.findIndex((s) => s.dataset.key === tile.dataset.wallGo);
        if (i >= 0) enter(i);
      })
    );
    if (wallBtn) {
      wallBtn.addEventListener("click", () => {
        setView("wall");
        const first = wall && $(".wall-tile", wall);
        if (first) first.focus({ preventScroll: true });
      });
    }

    prevBtn.addEventListener("click", () => go(nearest(x) - 1));
    nextBtn.addEventListener("click", () => (railOn ? go(nearest(x) + 1) : enter(0)));
    viewport.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        go(nearest(x) + 1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        go(nearest(x) - 1);
      }
    });
    // Category index → first sheet of that category (no work there yet → the open slot,
    // “your design is next”). On narrow screens the rail sits below the index, so bring
    // it into view when it isn't.
    cats.forEach((b) =>
      b.addEventListener("click", () => {
        const i = sheets.findIndex((s) => s.dataset.cat === b.dataset.catGo);
        enter(i < 0 ? sheets.length - 1 : i);
        if (innerWidth <= 900) {
          const r = viewport.getBoundingClientRect();
          if (r.top < 0 || r.bottom > innerHeight) {
            viewport.scrollIntoView({ behavior: motionOK ? "smooth" : "auto", block: "center" });
          }
        }
      })
    );

    // The open slot's link is the only focusable thing on the rail
    sheets.forEach((s, i) => {
      const link = $(".sheet-go", s);
      if (link) link.addEventListener("focus", () => go(i));
    });

    new IntersectionObserver((entries) => {
      inView = entries[0].isIntersecting;
      if (inView) wake();
      // the wall drifts only while on screen
      if (wall) wall.classList.toggle("is-away", !inView);
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
     4. ONE LOOK, EVERY MEDIUM
     The stage's data-look switches colours, type and mark (CSS);
     the sample copy below switches with it. Cycles on its own while
     on screen until the visitor picks a brand (never with reduced motion).
  ========================================================= */
  (function looks() {
    const section = $("[data-system]");
    if (!section) return;
    const stage = $("[data-sys-stage]", section);
    const buttons = $$("[data-look]", section).filter((b) => b.tagName === "BUTTON");
    const LOOKS = {
      teduh: { name: "teduh", post: "Es Kopi Aren.", poster: "Slow<br>Sunday.", slide: "Our story.", tag: "Kopi pelan-pelan." },
      lari: { name: "LARI", post: "New drop.", poster: "Night<br>run.", slide: "The plan.", tag: "Run your city." },
      arunika: { name: "Arunika", post: "Fresh bouquet.", poster: "Flowers<br>for you.", slide: "Our studio.", tag: "Studio bunga & dekor." },
    };
    const order = Object.keys(LOOKS);
    let current = stage.dataset.look;
    let timer = 0;
    let swapTimer = 0;
    let picked = false;
    let inView = false;

    function apply(name) {
      if (name === current) return;
      current = name;
      buttons.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.look === name)));
      const write = () => {
        const look = LOOKS[name];
        stage.dataset.look = name;
        $$("[data-sys]", stage).forEach((el) => {
          const value = look[el.dataset.sys];
          if (value.includes("<br>")) el.innerHTML = value;
          else el.textContent = value;
        });
        stage.classList.remove("is-swapping");
      };
      clearTimeout(swapTimer);
      if (motionOK) {
        stage.classList.add("is-swapping");
        swapTimer = setTimeout(write, 220);
      } else {
        write();
      }
    }

    function schedule() {
      clearTimeout(timer);
      if (picked || !motionOK || !inView || document.hidden) return;
      timer = setTimeout(() => {
        apply(order[(order.indexOf(current) + 1) % order.length]);
        schedule();
      }, 3600);
    }

    buttons.forEach((b) =>
      b.addEventListener("click", () => {
        picked = true;
        clearTimeout(timer);
        apply(b.dataset.look);
      })
    );

    new IntersectionObserver((entries) => {
      inView = entries[0].isIntersecting;
      schedule();
    }, { threshold: 0.35 }).observe(stage);
    document.addEventListener("visibilitychange", schedule);
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
  const steps = process ? $$(".step", process) : [];
  let ticking = false;

  function onScroll() {
    ticking = false;
    const vh = innerHeight;
    const max = document.documentElement.scrollHeight - vh;
    progressBar.style.setProperty("--progress", (max > 0 ? scrollY / max : 0).toFixed(4));
    if (!process) return;
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

    const T = {
      id: {
        hello: "Halo Maul",
        me: (name, brand) => `, saya ${name}${brand ? ` dari ${brand}` : ""}.`,
        intro: "Saya ingin diskusi graphic design.",
        need: "Kebutuhan",
        use: "Untuk",
        count: "Jumlah desain",
        when: "Target selesai",
        ref: "Referensi",
        note: "Catatan",
        idle: "Halo Maul, saya ingin diskusi graphic design.",
      },
      en: {
        hello: "Hi Maul",
        me: (name, brand) => `, I'm ${name}${brand ? ` from ${brand}` : ""}.`,
        intro: "I'd like to discuss graphic design.",
        need: "I need",
        use: "For",
        count: "Number of designs",
        when: "Deadline",
        ref: "Reference",
        note: "Notes",
        idle: "Hi Maul, I'd like to discuss graphic design.",
      },
    };

    const pick = (el) => (el ? el.dataset[lang()] || el.value : "");
    const picked = (name) => $$(`[name="${name}"]:checked`, form).map(pick).join(", ");
    const chosen = (name) => {
      const o = $(`[name="${name}"] option:checked`, form);
      return o && o.value ? pick(o) : "";
    };

    function compose() {
      const t = T[lang()];
      const d = new FormData(form);
      const name = (d.get("name") || "").trim();
      const brand = (d.get("brand") || "").trim();
      const need = picked("need");
      const use = picked("use");
      const count = chosen("count");
      const when = chosen("when");
      const ref = (d.get("ref") || "").trim();
      const note = (d.get("note") || "").trim();

      if (!name && !brand && !need && !use && !count && !when && !ref && !note) return t.idle;
      const lines = [`${t.hello}${name ? t.me(name, brand) : "."} ${t.intro}`, ""];
      if (need) lines.push(`• ${t.need}: ${need}`);
      if (use) lines.push(`• ${t.use}: ${use}`);
      if (count) lines.push(`• ${t.count}: ${count}`);
      if (when) lines.push(`• ${t.when}: ${when}`);
      if (ref) lines.push(`• ${t.ref}: ${ref}`);
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
    const place = () => {
      const r = btn.getBoundingClientRect();
      const top = header.offsetHeight + 8;
      const h = pop.offsetHeight;
      const above = r.top - top;
      const below = innerHeight - r.bottom;
      const down = above < h + 16 && below > above;
      item.classList.toggle("qris--below", down);
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

  /* =========================================================
     8. CLIENT WORK → WORK VIEWER
     Real work hangs on the rail like the samples (a newsletter shows the
     top of the email and scrolls on hover). A click on the sheet or its ↗
     opens every image of that work in a <dialog>, top to bottom, with ←/→
     between the works of the same category. A drag never opens it: the
     rail's capture handler swallows the click that ends a drag.
  ========================================================= */
  (function workViewer() {
    const viewer = $("[data-work-viewer]");
    const buttons = $$(".sheet-go[data-work-go]");
    if (!viewer || !buttons.length) return;

    const stack = $("[data-mv-stack]", viewer);
    const scroller = $("[data-mv-scroll]", viewer);
    const subject = $("[data-mv-subject]", viewer);
    const client = $("[data-mv-client]", viewer);
    const current = $("[data-mv-current]", viewer);
    const total = $("[data-mv-total]", viewer);
    const prev = $("[data-mv-prev]", viewer);
    const next = $("[data-mv-next]", viewer);
    const catOf = (btn) => btn.closest("[data-cat]").dataset.cat;
    const imagesOf = (btn) => JSON.parse(btn.dataset.images);
    let list = [];
    let index = 0;
    let opener = null;

    const preload = (btn) => {
      if (btn) new Image().src = imagesOf(btn)[0].src;
    };

    function show(i) {
      index = clamp(i, 0, list.length - 1);
      const btn = list[index];
      const d = btn.dataset;
      const images = imagesOf(btn);
      stack.replaceChildren(...images.map((im, k) => {
        const el = document.createElement("img");
        el.className = "mv-img";
        el.width = im.w;
        el.height = im.h;
        el.alt = im.alt;
        el.decoding = "async";
        if (k > 0) el.loading = "lazy";
        el.src = im.src;
        return el;
      }));
      viewer.classList.toggle("is-wide", images[0].w > images[0].h);
      subject.textContent = (lang() === "en" ? d.titleEn : d.titleId) || d.titleEn;
      client.textContent = d.client;
      current.textContent = String(index + 1);
      total.textContent = String(list.length);
      prev.disabled = index === 0;
      next.disabled = index === list.length - 1;
      scroller.scrollTop = 0;
      preload(list[index + 1]);
    }

    function openViewer(btn) {
      list = buttons.filter((b) => catOf(b) === catOf(btn));
      opener = btn;
      show(list.indexOf(btn));
      root.classList.add("mv-lock");
      viewer.showModal();
      scroller.focus({ preventScroll: true });
    }

    buttons.forEach((btn) => {
      btn.closest("[data-work-sheet]").addEventListener("click", () => openViewer(btn));
    });

    prev.addEventListener("click", () => show(index - 1));
    next.addEventListener("click", () => show(index + 1));
    $("[data-mv-close]", viewer).addEventListener("click", () => viewer.close());
    // a click on the backdrop (the dialog box itself, outside its content) closes it
    viewer.addEventListener("click", (e) => {
      if (e.target === viewer) viewer.close();
    });
    viewer.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight" && index < list.length - 1) {
        e.preventDefault();
        show(index + 1);
      } else if (e.key === "ArrowLeft" && index > 0) {
        e.preventDefault();
        show(index - 1);
      }
    });
    viewer.addEventListener("close", () => {
      root.classList.remove("mv-lock");
      if (opener) opener.focus({ preventScroll: true });
    });
  })();

  setInternational(root.dataset.international === "true", false);
  setLanguage(lang(), false);
})();
