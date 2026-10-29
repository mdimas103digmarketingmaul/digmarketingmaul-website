/* =========================================================
   BUILD A WEBSITE SECTION — ARSIP 2026-10-29
   Showreel-only subset of src/scripts/home/home.js @ 10d60d7.
   Kept: helpers, showreel scroll scene (§4), placeholder loop/tilt (§6),
   custom cursor + magnetic (§7). Other sections' logic is omitted;
   the code that remains is copied as-is. Vanilla JS, no dependencies.
========================================================= */
(function () {
  "use strict";

  const root = document.documentElement;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const motionOK = !reduceMotion;

  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
  const lerp = (from, to, t) => from + (to - from) * t;
  const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

  let vw = window.innerWidth;
  let vh = window.innerHeight;

  /* =========================================================
     4. SCROLL SCENE — one passive listener → one rAF.
  ========================================================= */
  const showreel = document.querySelector(".showreel");
  const showreelFrame = document.querySelector(".showreel-frame");
  const showreelMedia = document.querySelector(".showreel-media");

  let ticking = false;

  function onScrollFrame() {
    ticking = false;
    const isMobile = vw < 768;

    /* ---- READ ---- */
    const showreelRect = showreel.getBoundingClientRect();

    /* ---- WRITE ---- */
    if (motionOK) {
      /* SHOWREEL — inset rounded window → full-bleed while the section rises */
      const open = easeInOut(clamp(1 - showreelRect.top / vh));
      const insetY = (1 - open) * (isMobile ? 9 : 13);
      const insetX = (1 - open) * (isMobile ? 4 : 11);
      const radius = (1 - open) * (isMobile ? 22 : 44);
      showreelFrame.style.clipPath = `inset(${insetY.toFixed(2)}% ${insetX.toFixed(2)}% ${insetY.toFixed(2)}% ${insetX.toFixed(2)}% round ${radius.toFixed(1)}px)`;
      showreelMedia.style.transform = `scale(${(1.16 - 0.16 * open).toFixed(4)})`;
      showreel.classList.toggle("is-open", showreelRect.top < vh * 0.04);
    }
  }

  function requestScrollFrame() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(onScrollFrame);
    }
  }

  window.addEventListener("scroll", requestScrollFrame, { passive: true });

  let resizeTimer = 0;
  window.addEventListener("resize", () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      vw = window.innerWidth;
      vh = window.innerHeight;
      requestScrollFrame();
    }, 120);
  });

  if (!motionOK) {
    showreel.classList.add("is-open");
  }

  onScrollFrame();

  /* =========================================================
     6. SHOWREEL PLACEHOLDER — pause loop off-screen, timecode,
        pointer highlight + tilt
  ========================================================= */
  const placeholder = document.querySelector(".showreel-placeholder");

  if (placeholder && "IntersectionObserver" in window) {
    const timecode = placeholder.querySelector(".ph-timecode");
    let timer = 0;
    let seconds = 0;

    new IntersectionObserver((entries) => {
      const visible = entries[0].isIntersecting;
      showreel.classList.toggle("is-visible", visible);
      window.clearInterval(timer);
      if (visible && motionOK) {
        timer = window.setInterval(() => {
          seconds = (seconds + 1) % 60;
          timecode.textContent = `00:00:${String(seconds).padStart(2, "0")}`;
        }, 1000);
      }
    }).observe(showreel);

    if (finePointer && motionOK) {
      const light = placeholder.querySelector(".ph-light");
      const composition = placeholder.querySelector(".ph-composition");
      showreelFrame.addEventListener("pointermove", (event) => {
        const r = showreelFrame.getBoundingClientRect();
        const nx = (event.clientX - r.left) / r.width;
        const ny = (event.clientY - r.top) / r.height;
        light.style.setProperty("--sx", `${(nx * 100).toFixed(1)}%`);
        light.style.setProperty("--sy", `${(ny * 100).toFixed(1)}%`);
        composition.style.setProperty("--tilt-y", `${((nx - 0.5) * 7).toFixed(2)}deg`);
        composition.style.setProperty("--tilt-x", `${((0.5 - ny) * 5).toFixed(2)}deg`);
      });
      showreelFrame.addEventListener("pointerleave", () => {
        composition.style.setProperty("--tilt-x", "0deg");
        composition.style.setProperty("--tilt-y", "0deg");
      });
    }
  }

  /* =========================================================
     7. POINTER EFFECTS (fine pointer + motion allowed)
  ========================================================= */
  if (finePointer && motionOK) {
    /* ---- Custom cursor: dot is exact, ring trails with lerp ---- */
    const ring = document.querySelector(".cursor-ring");
    const dot = document.querySelector(".cursor-dot");
    const label = document.querySelector(".cursor-label");
    let mx = vw / 2;
    let my = vh / 2;
    let rx = mx;
    let ry = my;
    let ringRunning = false;

    root.classList.add("has-cursor");

    const ringLoop = () => {
      rx = lerp(rx, mx, 0.2);
      ry = lerp(ry, my, 0.2);
      ring.style.transform = `translate3d(${rx.toFixed(1)}px,${ry.toFixed(1)}px,0)`;
      if (Math.abs(mx - rx) > 0.1 || Math.abs(my - ry) > 0.1) requestAnimationFrame(ringLoop);
      else ringRunning = false;
    };

    window.addEventListener(
      "pointermove",
      (event) => {
        if (event.pointerType !== "mouse") return;
        mx = event.clientX;
        my = event.clientY;
        dot.style.transform = `translate3d(${mx}px,${my}px,0)`;
        root.classList.add("cursor-visible");
        if (!ringRunning) {
          ringRunning = true;
          requestAnimationFrame(ringLoop);
        }
      },
      { passive: true }
    );

    document.addEventListener("pointerleave", () => root.classList.remove("cursor-visible"));
    document.documentElement.addEventListener("mouseleave", () => root.classList.remove("cursor-visible"));

    /* Cursor states via delegation: [data-cursor] → label, links/buttons → filled ring */
    document.addEventListener("pointerover", (event) => {
      const target = event.target.closest("[data-cursor], a, button, summary");
      const text = target && target.dataset.cursor;
      ring.classList.toggle("has-label", Boolean(text));
      ring.classList.toggle("is-link", Boolean(target) && !text);
      if (text) label.textContent = text;
    });

    /* ---- Magnetic elements ---- */
    document.querySelectorAll("[data-magnetic]").forEach((el) => {
      const strength = 0.32;
      el.addEventListener("pointermove", (event) => {
        const r = el.getBoundingClientRect();
        const dx = event.clientX - (r.left + r.width / 2);
        const dy = event.clientY - (r.top + r.height / 2);
        el.style.translate = `${(dx * strength).toFixed(1)}px ${(dy * strength).toFixed(1)}px`;
      });
      el.addEventListener("pointerleave", () => {
        el.style.translate = "";
      });
    });
  }
})();
