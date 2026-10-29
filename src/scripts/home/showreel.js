/* =========================================================
   HOMEPAGE SECTION 02 — “Build a website with digmarketingmaul.”
   Vanilla JS, no dependencies. Styles: src/styles/home/showreel.css.
   Custom cursor + magnetic CTA are handled by home.js ([data-cursor], [data-magnetic]).

   A self-playing scene (like a video, 21 s loop). Scroll never drives it:
   it plays while the section is on screen and pauses when it leaves.

   Time (s) → story progress p (0..1) of sample 1 through a warp table with holds.
     01 Design it             0.0–5.5   fragments over the wireframe land, red-edge wipe,
                                        exploded layers
     02 Fit every screen      5.5–8.7   one frame: 1366 → 820 → 390 px, real reflow
     03 Launch it             8.7–11.8  laptop + tablet + phone; portrait scales after the tap
     04 Make it scroll-worthy 11.8–21.0 sample 2 (bakery product page) in a browser + phone

   render(p, e) is a pure function of story progress p and explode e.
   The 3D camera (per-act pose + pointer tilt) is written every frame.

   Fallbacks
   - prefers-reduced-motion: starts paused on the final frame; the bars switch
     frames; playback only if the visitor presses play.
   - Coarse pointer: no tilt / specular.
========================================================= */
(function () {
  "use strict";

  const section = document.querySelector(".build");
  if (!section) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const motionOK = !reduceMotion;

  const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const seg = (p, a, b) => clamp((p - a) / (b - a));
  const f2 = (n) => n.toFixed(2);

  /* Cubic-bezier easing (bisection: robust for steep curves). */
  function bezier(x1, y1, x2, y2) {
    const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
    const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
    const sx = (t) => ((ax * t + bx) * t + cx) * t;
    const sy = (t) => ((ay * t + by) * t + cy) * t;
    return (x) => {
      if (x <= 0) return 0;
      if (x >= 1) return 1;
      let lo = 0, hi = 1, t = x;
      for (let i = 0; i < 22; i++) {
        const v = sx(t);
        if (Math.abs(v - x) < 1e-5) break;
        if (v < x) lo = t;
        else hi = t;
        t = (lo + hi) / 2;
      }
      return sy(t);
    };
  }

  /* Same curve vocabulary as the video-production motion system (shared/motion/curves.ts). */
  const E = {
    out: bezier(0.22, 1, 0.36, 1), //       calm reveal that settles
    expo: bezier(0.16, 1, 0.3, 1), //       a hit, then glide
    transform: bezier(0.72, 0, 0.12, 1), // layout morphs: fast in, long controlled settle
    inOut: bezier(0.65, 0, 0.35, 1), //     between two resting states
  };

  /* Style writes go through a tiny cache so unchanged values never touch the DOM. */
  function set(el, prop, val) {
    const c = el.__c || (el.__c = {});
    if (c[prop] === val) return;
    c[prop] = val;
    if (prop.charCodeAt(0) === 45) el.style.setProperty(prop, val);
    else el.style[prop] = val;
  }


  /* =========================================================
     TIMELINE
  ========================================================= */
  const DURATION = 21;

  // [seconds, p] — flat stretches are holds (the frame breathes before the next beat).
  // Starts at p 0.375: the whole set of design fragments is already floating over the wireframe.
  const WARP = [
    [0, 0.375], [3.0, 0.535], [3.3, 0.54], [5.5, 0.545], //    Design (+ explode while p holds)
    [6.8, 0.67], [7.2, 0.7], [8.2, 0.8], [8.7, 0.84], //       Fit every screen
    [10.0, 0.95], [10.8, 1], [DURATION, 1], //                 Launch
  ];
  const EXPLODE = { open: [3.3, 4.0], close: [4.7, 5.5] };
  const SWAP = [11.8, 12.8]; //   sample 1 leaves, sample 2 arrives
  const MR_START = 13.0; //       local clock of sample 2 (the hero holds a beat first)
  const CHAPTERS = [[0, 5.5], [5.5, 8.7], [8.7, 11.8], [11.8, DURATION]];
  // Frame shown for each chapter while paused (and under reduced motion)
  const CHAPTER_FRAME = [4.3, 7.6, 11.2, 20.2];

  function progressAt(t) {
    for (let i = 1; i < WARP.length; i++) {
      const [t1, p1] = WARP[i];
      if (t <= t1) {
        const [t0, p0] = WARP[i - 1];
        return lerp(p0, p1, seg(t, t0, t1));
      }
    }
    return 1;
  }

  const explodeAt = (t) => E.inOut(seg(t, ...EXPLODE.open)) * (1 - E.inOut(seg(t, ...EXPLODE.close)));
  const seamAt = (t) => Math.min(seg(t, 0, 0.35), 1 - seg(t, DURATION - 0.45, DURATION));

  /* =========================================================
     DOM
  ========================================================= */
  const $ = (sel, ctx = section) => ctx.querySelector(sel);
  const $$ = (sel, ctx = section) => Array.from(ctx.querySelectorAll(sel));

  const frame = $(".build-frame");
  const scene = $(".build-scene");
  const box = $(".scene-box");
  const cam = $(".stage-cam");
  const device = $(".device--main");
  const screen = $(".device-screen", device);
  const viewport = $(".site-viewport", device);
  const wireLayer = $(".layer--wire", device);
  const finalLayer = $(".layer--final", device);
  const scrolls = $$(".site-scroll", device);
  const site = $(".cfp", finalLayer);
  const urlText = $(".chrome-url-text", device);
  const wipeEdge = $(".wipe-edge", device);
  const glass = $(".device-glass", device);
  const explode = $(".explode", device);
  const planes = $$(".plane", explode);
  const groupCfp = $(".scene-group--cfp");
  const groupMr = $(".scene-group--mr");
  const mrDesk = $(".device--mr-desk");
  const mrPhone = $(".device--mr-phone");
  const readout = $(".readout");
  const readoutPx = $(".readout-px");
  const pxCursor = $(".px-cursor");
  const sparks = $(".sparks");
  const laptop = $(".device--laptop");
  const tablet = $(".device--tablet");
  const bars = $$(".bar");
  const caps = $$(".cap");
  const timeEl = $(".build-time");
  const playBtn = $(".build-play");

  // Story order = top-to-bottom landing order, so each lands just after the wipe has revealed its slot.
  const frags = ["palette", "badge", "type", "portrait", "button"].map((k) => $(`.frag--${k}`));
  frags.forEach((el) => el.style.setProperty("--depth", el.dataset.depth || 1));

  /* Wireframe skin = same markup, same layout → the wipe lines up exactly. */
  const wire = site.cloneNode(true);
  wire.classList.add("is-wire");
  scrolls[0].appendChild(wire);

  /* Launch devices render the real site at their own viewport width. */
  [laptop, tablet].forEach((ghost) => {
    const vp = $(".site-viewport", ghost);
    vp.style.width = `${ghost.dataset.vw}px`;
    vp.appendChild(site.cloneNode(true));
  });

  /* Exploded layers: nav + hero only, one visual layer per plane (CSS: .cfp[data-plane]). */
  planes.forEach((plane) => {
    const c = site.cloneNode(true);
    $$("section:not(.cfp-hero)", c).forEach((n) => n.remove());
    c.dataset.plane = plane.dataset.plane;
    $(".site-viewport", plane).appendChild(c);
  });

  /* Sample 2: the bakery page is written once (browser); the phone gets a clone at 390 px. */
  $(".site-viewport", mrPhone).appendChild($(".mr", mrDesk).cloneNode(true));
  $$(".site-viewport--mr").forEach((vp) => (vp.style.width = `${vp.dataset.vw}px`));

  const sitePortrait = $('[data-t="portrait"]', site);
  const siteHero = $('[data-t="hero"]', site);

  // Real elements each fragment hands over to (palette pours into the hero; nothing to hide).
  const fragTargets = frags.map((f, k) => (k === 0 ? null : $(`[data-t="${f.dataset.target}"]`, site)));

  /* 8-bit cursor, drawn from a map so it stays editable. X = outline, W = fill. */
  const PX_CURSOR = [
    "X...........", "XX..........", "XWX.........", "XWWX........", "XWWWX.......",
    "XWWWWX......", "XWWWWWX.....", "XWWWWWWX....", "XWWWWWWWX...", "XWWWWWWWWX..",
    "XWWWWWWWWWX.", "XWWWWWWXXXXX", "XWWWXWWX....", "XWWX.XWWX...", "XWX..XWWX...",
    "XX....XWWX..", "X.....XWWX..", ".......XWWX.", "........XX..",
  ];
  (function drawCursor() {
    let dark = "";
    let light = "";
    PX_CURSOR.forEach((row, y) => {
      [...row].forEach((c, x) => {
        if (c === "X") dark += `M${x} ${y}h1v1h-1z`;
        if (c === "W") light += `M${x} ${y}h1v1h-1z`;
      });
    });
    pxCursor.innerHTML = `<path fill="#07111f" d="${dark}"/><path fill="#f4f6fa" d="${light}"/>`;
  })();

  /* =========================================================
     GEOMETRY (scene-box px) — recomputed on resize
  ========================================================= */
  const VW = { desktop: 1366, tablet: 820, mobile: 390 };
  const bandOf = (vw) => (vw > 1024 ? 2 : vw > 640 ? 1 : 0);
  const MOBILE_SCROLL = 560;

  let W = 0, H = 0, u = 1, narrow = false;
  let S = {}; //        device specs
  let T = {}; //        sample-site targets on the desktop frame (box px)
  let mobileBtn = { x: 0, y: 0 };
  let fragStart = [], fragSize = [], fragAnchor = [];

  const screenOf = (sp) => ({ x: sp.x + sp.bz, y: sp.y + sp.ch, w: sp.w - sp.bz * 2, h: sp.h - sp.ch - sp.bz });

  function mixSpec(a, b, t) {
    const o = {};
    for (const k in a) o[k] = lerp(a[k], b[k], t);
    return o;
  }

  function computeSpecs() {
    const dw = Math.min(W * 0.94, H * 0.78 * 1.6);
    const dh = dw / 1.6;
    const desk = { x: (W - dw) / 2, y: (H - dh) / 2, w: dw, h: dh, r: clamp(dw * 0.016, 8, 14), bz: 0, ch: clamp(dw * 0.045, 18, 34), browser: 1, island: 0, vw: VW.desktop };

    const th = Math.min(H * 0.86, (W * 0.9) / 0.75);
    const tw = th * 0.75;
    const tab = { x: (W - tw) / 2, y: (H - th) / 2, w: tw, h: th, r: tw * 0.06, bz: tw * 0.03, ch: tw * 0.03, browser: 0, island: 0, vw: VW.tablet };

    const ph = Math.min(H * 0.86, W * 0.6 * 2.05);
    const pw = ph / 2.05;
    const phone = { x: (W - pw) / 2, y: (H - ph) / 2, w: pw, h: ph, r: pw * 0.16, bz: pw * 0.035, ch: pw * 0.11, browser: 0, island: 1, vw: VW.mobile };

    // Launch composition: laptop back-left, tablet back-right, phone in front.
    const lph = ph * (narrow ? 0.82 : 0.92);
    const lpw = lph / 2.05;
    const phoneL = { ...phone, w: lpw, h: lph, r: lpw * 0.16, bz: lpw * 0.035, ch: lpw * 0.11, x: W * 0.52 - lpw / 2, y: H * 0.54 - lph / 2 };

    const lw = Math.min(W * (narrow ? 0.62 : 0.6), H * 0.6 * 1.6);
    const lh = lw / 1.6;
    const lap = { x: W * 0.3 - lw / 2, y: H * 0.42 - lh / 2, w: lw, h: lh, r: lw * 0.025, bz: lw * 0.022, ch: lw * 0.03, browser: 0, island: 0, vw: VW.desktop };

    const gh = Math.min(H * 0.68, (W * (narrow ? 0.44 : 0.5)) / 0.75);
    const gw = gh * 0.75;
    const tabL = { x: W * 0.76 - gw / 2, y: H * 0.5 - gh / 2, w: gw, h: gh, r: gw * 0.06, bz: gw * 0.03, ch: gw * 0.03, browser: 0, island: 0, vw: VW.tablet };

    // Sample 2: big browser left, phone in front on the right
    const mw = Math.min(W * (narrow ? 0.9 : 0.78), H * 0.84 * 1.6);
    const mh = mw / 1.6;
    const mrD = { x: W * (narrow ? 0.46 : 0.44) - mw / 2, y: H * (narrow ? 0.4 : 0.47) - mh / 2, w: mw, h: mh, r: clamp(mw * 0.016, 8, 14), bz: 0, ch: clamp(mw * 0.045, 16, 34), browser: 1, island: 0, vw: VW.desktop };
    const mph = H * (narrow ? 0.6 : 0.84);
    const mpw = mph / 2.05;
    const mrP = { x: Math.min(W * (narrow ? 0.72 : 0.84) - mpw / 2, W - mpw), y: H * (narrow ? 0.62 : 0.55) - mph / 2, w: mpw, h: mph, r: mpw * 0.16, bz: mpw * 0.035, ch: mpw * 0.11, browser: 0, island: 1, vw: VW.mobile };

    return { desk, tab, phone, phoneL, lap, tabL, mrD, mrP };
  }

  /* Offset of an element inside the sample site, in site px (independent of scale and camera). */
  function offsetIn(el, stop) {
    let x = 0, y = 0, n = el;
    while (n && n !== stop) {
      x += n.offsetLeft;
      y += n.offsetTop;
      n = n.offsetParent;
    }
    return { x, y, w: el.offsetWidth, h: el.offsetHeight };
  }

  /* Lays the site out at a given viewport width, runs fn, restores. Measure-time only. */
  function atWidth(vw, fn) {
    const prev = viewport.style.width;
    viewport.style.width = `${vw}px`;
    const out = fn();
    viewport.style.width = prev;
    return out;
  }

  function applyDevice(el, sp) {
    set(el, "width", `${f2(sp.w)}px`);
    set(el, "height", `${f2(sp.h)}px`);
    set(el, "translate", `${f2(sp.x)}px ${f2(sp.y)}px`);
    set(el, "--r", f2(sp.r));
    set(el, "--bz", f2(sp.bz));
    set(el, "--ch", f2(sp.ch));
    set(el, "--browser", f2(sp.browser));
    set(el, "--island", f2(sp.island));
  }

  function applyViewport(vp, sp, vw) {
    const sc = screenOf(sp);
    const s = sc.w / vw;
    set(vp, "height", `${f2(sc.h / s)}px`);
    set(vp, "transform", `scale(${s.toFixed(4)})`);
    return { s, sc };
  }

  function measure() {
    const fw = frame.clientWidth;
    const fh = frame.clientHeight;
    if (!fw || !fh) return;
    // Scene box: right of centre on desktop (the title owns the bottom-left), full width on phones.
    const mobile = fw < 768;
    const bx = mobile ? { x: 0, y: fh * 0.15, w: fw, h: fh * 0.55 } : { x: fw * 0.2, y: fh * 0.15, w: fw * 0.74, h: fh * 0.62 };
    Object.assign(box.style, { left: `${bx.x}px`, top: `${bx.y}px`, width: `${bx.w}px`, height: `${bx.h}px` });
    frame.style.setProperty("--bx", `${(((bx.x + bx.w / 2) / fw) * 100).toFixed(1)}%`);
    frame.style.setProperty("--by", `${(((bx.y + bx.h / 2) / fh) * 100).toFixed(1)}%`);

    W = bx.w;
    H = bx.h;
    narrow = W < 560;
    u = clamp(Math.min(W / 820, H / 620), 0.6, 1.05);
    cam.style.setProperty("--u", u.toFixed(3));

    S = computeSpecs();

    // Targets on the desktop frame
    const deskScreen = screenOf(S.desk);
    const sD = deskScreen.w / VW.desktop;
    const offs = atWidth(VW.desktop, () => {
      const o = {};
      $$("[data-t]", site).forEach((el) => (o[el.dataset.t] = offsetIn(el, scrolls[1])));
      return o;
    });
    T = {};
    for (const k in offs) {
      const o = offs[k];
      T[k] = { x: deskScreen.x + o.x * sD, y: deskScreen.y + o.y * sD, w: o.w * sD, h: o.h * sD };
    }

    // Mobile layout on the launch phone: CTA (cursor tap) + portrait (pop-out)
    const lpScreen = screenOf(S.phoneL);
    const sL = lpScreen.w / VW.mobile;
    const [ob, op, oh] = atWidth(VW.mobile, () => [$('[data-t="btn"]', site), sitePortrait, siteHero].map((el) => offsetIn(el, scrolls[1])));
    mobileBtn = { x: lpScreen.x + (ob.x + ob.w * 0.62) * sL, y: lpScreen.y + (ob.y + ob.h * 0.5) * sL };

    // Portrait scale after the CTA tap, bounded: the image top must stay ≥ 28 site px under the nav line.
    const room = Math.max(0, op.y - oh.y - 28);
    const lift = Math.min(op.h * 0.06, room * 0.3);
    device.style.setProperty("--po-y", `${f2(lift)}px`);
    device.style.setProperty("--po-k", clamp((room - lift) / op.h, 0, 0.42).toFixed(3));

    // Launch devices: size once, translate per frame
    [[laptop, S.lap], [tablet, S.tabL], [mrDesk, S.mrD], [mrPhone, S.mrP]].forEach(([el, sp]) => {
      applyDevice(el, sp);
      const vp = $(".site-viewport", el);
      const { s } = applyViewport(vp, sp, sp.vw);
      vp.style.setProperty("--vh", `${f2(screenOf(sp).h / s)}px`);
    });

    // Exploded planes cover the desktop screen
    planes.forEach((plane) => applyViewport($(".site-viewport", plane), S.desk, VW.desktop));

    layoutFrags();
  }

  function layoutFrags() {
    const D = S.desk;
    fragSize = frags.map((f) => ({ w: f.offsetWidth, h: f.offsetHeight }));
    // The [data-anchor] child is what lands on the target (e.g. the specimen word, not the whole card).
    fragAnchor = frags.map((f) => {
      const a = f.querySelector("[data-anchor]");
      return a ? offsetIn(a, f) : { x: 0, y: 0, w: f.offsetWidth, h: f.offsetHeight };
    });
    const raw = [
      [D.x - W * 0.04, D.y + D.h * 0.56], //                   palette — left, low
      [D.x + D.w * 0.74, D.y + D.h * 0.5], //                  badge — right
      [D.x + D.w * 0.03, D.y - fragSize[2].h * 0.35], //       type — top left
      [D.x + D.w * 0.68, D.y - D.h * 0.1], //                  portrait — top right
      [D.x + D.w * 0.3, D.y + D.h - fragSize[4].h * 0.35], //  button — bottom
    ];
    fragStart = raw.map(([x, y], k) => ({
      x: clamp(x, -W * 0.04, W - fragSize[k].w),
      y: clamp(y, -H * 0.06, H - fragSize[k].h),
    }));
  }

  /* =========================================================
     BREAKPOINT REFLOW — width changes continuously; at a band crossing
     the reflowed blocks FLIP from where they were (WAAPI, transform only).
  ========================================================= */
  const flipEls = $$("[data-flip]", site);
  let band = 2;
  let siteScale = 1;
  let snapTimer = 0;

  function setSiteWidth(vw, animate) {
    const nb = bandOf(vw);
    if (nb === band || !animate) {
      set(viewport, "width", `${f2(vw)}px`);
      band = nb;
      return false;
    }
    const before = flipEls.map((el) => el.getBoundingClientRect());
    set(viewport, "width", `${f2(vw)}px`);
    flipEls.forEach((el, i) => {
      const b = before[i];
      const a = el.getBoundingClientRect();
      if (!b.width || !a.width) return;
      const dx = (b.left - a.left) / siteScale;
      const dy = (b.top - a.top) / siteScale;
      if (Math.abs(dx) + Math.abs(dy) < 2) return;
      el.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: "translate(0, 0)" }], {
        duration: 720,
        easing: "cubic-bezier(0.16, 1, 0.3, 1)",
      });
    });
    band = nb;
    return true;
  }

  /* Pixel sparks (stepped motion = 8-bit feel). */
  function burst(x, y, colors) {
    if (!motionOK) return;
    const n = 9;
    for (let i = 0; i < n; i++) {
      const s = document.createElement("i");
      s.className = "spark";
      s.style.setProperty("--c", colors[i % colors.length]);
      const a = (i / n) * Math.PI * 2 + 0.3;
      const d = (28 + (i % 3) * 12) * u;
      sparks.appendChild(s);
      s.animate(
        [
          { translate: `${x}px ${y}px`, opacity: 1 },
          { translate: `${x + Math.cos(a) * d}px ${y + Math.sin(a) * d}px`, opacity: 0 },
        ],
        { duration: 560, easing: "steps(7, end)" }
      ).onfinish = () => s.remove();
    }
  }

  /* =========================================================
     RENDER — the story at progress p, explode e
  ========================================================= */
  const FRAG_ROT = [-5, 4, -3, 4, 2];
  let lastP = -1;
  let animateFlip = false;

  function placeAt(el, x, y) {
    set(el, "translate", `${f2(x)}px ${f2(y)}px`);
  }

  function show(el, o) {
    set(el, "opacity", o.toFixed(3));
    set(el, "visibility", o > 0.001 ? "visible" : "hidden");
  }

  function render(p, e, swap) {
    if (!W) return;
    const forward = p > lastP;

    /* ---- Device spec along the story ---- */
    let sp;
    if (p < 0.56) sp = S.desk;
    else if (p < 0.7) sp = mixSpec(S.desk, S.tab, E.transform(seg(p, 0.56, 0.66)));
    else if (p < 0.845) sp = mixSpec(S.tab, S.phone, E.transform(seg(p, 0.7, 0.79)));
    else sp = mixSpec(S.phone, S.phoneL, E.inOut(seg(p, 0.845, 0.92)));

    applyDevice(device, sp);
    const crossed = setSiteWidth(sp.vw, animateFlip && lastP >= 0);
    const { s, sc } = applyViewport(viewport, sp, sp.vw);
    siteScale = s;
    set(screen, "--s", s.toFixed(4));

    set(device, "--solid", E.out(seg(p, 0.13, 0.2)).toFixed(3));
    show(device, E.out(seg(p, 0.06, 0.13)));

    // Page scroll inside the phone: show the stacked mobile content, then back to top for launch
    const pageY = E.inOut(seg(p, 0.795, 0.835)) * (1 - E.inOut(seg(p, 0.855, 0.91))) * MOBILE_SCROLL;
    scrolls.forEach((el) => set(el, "translate", `0 ${f2(-pageY)}px`));

    /* ---- WIRE ---- */
    set(wireLayer, "display", p > 0.15 && p < 0.56 ? "" : "none");
    set(wireLayer, "--wire", seg(p, 0.19, 0.335).toFixed(4));
    set(screen, "--grid", (E.out(seg(p, 0.18, 0.24)) * (1 - E.out(seg(p, 0.44, 0.5)))).toFixed(3));

    /* ---- DESIGN · fragments + wipe ---- */
    const wipe = E.inOut(seg(p, 0.42, 0.52));
    set(finalLayer, "--wipe", wipe.toFixed(4));
    set(wipeEdge, "translate", `0 ${f2(wipe * sc.h)}px`);
    set(wipeEdge, "opacity", wipe > 0 && wipe < 1 ? "1" : "0");

    let btnFrag = null;
    frags.forEach((frag, k) => {
      const enter = E.expo(seg(p, 0.335 + k * 0.012, 0.385 + k * 0.012));
      const fly = E.transform(seg(p, 0.405 + k * 0.015, 0.475 + k * 0.015));
      const from = fragStart[k];
      const size = fragSize[k];
      const a = fragAnchor[k];
      const t = T[frag.dataset.target];
      if (!from || !t || !a) return;
      // Palette pours into the hero; everything else lands its anchor exactly on the slot.
      const end = k === 0 ? 0.42 : t.w / a.w;
      const scale = lerp(lerp(0.85, 1, enter), end, fly);
      const tx = k === 0 ? t.x + t.w / 2 - (size.w * end) / 2 : t.x - a.x * end;
      const ty = k === 0 ? t.y + t.h * 0.4 : t.y + t.h / 2 - (a.y + a.h / 2) * end;
      const dir = Math.atan2(from.y + size.h / 2 - H / 2, from.x + size.w / 2 - W / 2);
      const x = lerp(from.x + Math.cos(dir) * 70 * u * (1 - enter), tx, fly);
      const y = lerp(from.y + Math.sin(dir) * 70 * u * (1 - enter), ty, fly) - Math.sin(Math.PI * fly) * H * 0.07;
      placeAt(frag, x, y);
      set(frag, "scale", scale.toFixed(4));
      set(frag, "rotate", `${f2(FRAG_ROT[k] * (1 - fly) * (0.6 + 0.4 * enter))}deg`);
      set(frag, "--amp", (1 - fly).toFixed(3));
      set(frag, "--chrome", (1 - seg(fly, 0, 0.35)).toFixed(3));
      // Handoff: the fragment lands, the real element fades in underneath, the fragment fades out.
      show(frag, enter * (1 - seg(fly, 0.82, 1)));
      const target = fragTargets[k];
      if (target) set(target, "opacity", seg(fly, 0.78, 0.98).toFixed(3));
      if (k === 4) btnFrag = { x, y, w: size.w * scale, h: size.h * scale };
    });

    /* ---- DESIGN · exploded layers (planes replace the screen while e > 0) ---- */
    const exploding = e > 0.001;
    set(explode, "visibility", exploding ? "visible" : "hidden");
    set(viewport, "visibility", exploding ? "hidden" : "visible");
    set(explode, "--e", e.toFixed(3));
    set(explode, "--gap", f2(e * 92 * u));

    /* ---- FIT · width readout + resize handle ---- */
    show(readout, seg(p, 0.545, 0.575) * (1 - seg(p, 0.85, 0.88)));
    placeAt(readout, sp.x, sp.y - 34 * u);
    set(readout, "width", `${f2(sp.w)}px`);
    const px = String(Math.round(sp.vw));
    if (readoutPx.textContent !== px) readoutPx.textContent = px;
    set(device, "--handle", (seg(p, 0.55, 0.57) * (1 - seg(p, 0.83, 0.85))).toFixed(3));

    // Sheen sweeps the glass on each morph
    const sweep = [seg(p, 0.56, 0.64), seg(p, 0.7, 0.78), seg(p, 0.86, 0.93)].find((v) => v > 0 && v < 1);
    set(glass, "--sheen", (sweep || 0).toFixed(3));
    set(glass, "--sheen-o", sweep ? Math.sin(Math.PI * sweep).toFixed(3) : "0");

    if (crossed) {
      readout.classList.add("is-snap");
      window.clearTimeout(snapTimer);
      snapTimer = window.setTimeout(() => readout.classList.remove("is-snap"), 650);
      if (forward) burst(sp.x + sp.w / 2, sp.y - 34 * u + 14 * u, ["#ff304f", "#f4f6fa", "#f7c21b"]);
    }

    /* ---- LAUNCH ---- */
    const lapIn = E.expo(seg(p, 0.86, 0.94));
    const tabIn = E.expo(seg(p, 0.875, 0.955));
    placeAt(laptop, S.lap.x - (1 - lapIn) * W * 0.14, S.lap.y + (1 - lapIn) * 24);
    placeAt(tablet, S.tabL.x + (1 - tabIn) * W * 0.14, S.tabL.y + (1 - tabIn) * 24);
    show(laptop, lapIn);
    show(tablet, tabIn);
    const tag = E.out(seg(p, 0.93, 0.98)).toFixed(3);
    [device, laptop, tablet].forEach((el) => set(el, "--tag", tag));

    /* ---- Colour per act: blueprint blue → client sun → brand red ---- */
    const gBlue = seg(p, 0.04, 0.2) * (1 - seg(p, 0.38, 0.5));
    set(frame, "--g-blue", gBlue.toFixed(3));
    // Sample 2 warms the whole canvas (bag-yellow / kopi)
    set(frame, "--g-sun", Math.max(seg(p, 0.38, 0.5) * (1 - seg(p, 0.62, 0.78)), e * 0.8, swap * 0.95).toFixed(3));
    set(frame, "--g-red", ((0.45 + 0.55 * seg(p, 0.55, 0.7)) * (1 - swap * 0.6)).toFixed(3));
    set(frame, "--dots", (0.45 + 0.45 * gBlue).toFixed(3));

    renderCursor(p, e, sp, btnFrag, forward);

    lastP = p;
  }

  /* =========================================================
     SAMPLE 2 — bakery product page, both devices driven by one set of vars
     (same choreography as the live site's scroll scene, on a clock)
  ========================================================= */
  const pull = bezier(0.2, 1.25, 0.35, 1); // the live site's spring for the dough halves

  function renderMr(time, swap) {
    show(groupCfp, 1 - swap);
    set(groupCfp, "transform", `translate3d(0, ${f2(swap * H * 0.14)}px, ${f2(-swap * 260)}px)`);
    show(groupMr, swap);
    set(groupMr, "transform", `translate3d(${f2((1 - swap) * W * 0.22)}px, 0, ${f2(-(1 - swap) * 320)}px)`);
    section.classList.toggle("is-mr", swap > 0.98);
    if (swap <= 0) return;

    const m = time - MR_START;
    const v = {
      "--intro": E.inOut(seg(m, 0.3, 1.1)),
      "--dark": E.inOut(seg(m, 0.5, 1.9)),
      "--lift": E.inOut(seg(m, 0.3, 2.1)),
      "--crack": seg(m, 1.3, 1.55),
      "--split": E.inOut(seg(m, 1.4, 2.9)),
      "--pg": E.inOut(seg(m, 4.1, 4.9)),
      "--oo": 1 - E.inOut(seg(m, 5.4, 5.66)),
      "--tv": E.inOut(seg(m, 5.4, 6.0)),
      "--to": pull(seg(m, 5.66, 6.5)),
      "--fo": 1 - seg(m, 5.4, 5.6),
      "--ft": seg(m, 5.7, 6.4),
      "--pull": E.inOut(seg(m, 6.6, 7.2)),
    };
    for (let i = 0; i < 4; i++) v[`--w${i + 1}`] = E.inOut(seg(m, 2.2 + i * 0.32, 2.75 + i * 0.32));
    for (const k in v) set(groupMr, k, v[k].toFixed(4));
  }

  function path(pts, t) {
    const n = pts.length - 1;
    const f = clamp(t) * n;
    const i = Math.min(n - 1, Math.floor(f));
    const k = E.inOut(f - i);
    return { x: lerp(pts[i].x, pts[i + 1].x, k), y: lerp(pts[i].y, pts[i + 1].y, k) };
  }

  const center = (r, fx = 0.5, fy = 0.5) => ({ x: r.x + r.w * fx, y: r.y + r.h * fy });
  let clicked = false;
  let cursorAway = 0;

  /* Pixel cursor: draws the wireframe, drags a component, drags the breakpoint, taps the CTA */
  function renderCursor(p, e, sp, btnFrag, forward) {
    const away = cursorAway;
    const D = S.desk;
    const handle = { x: sp.x + sp.w + 2 * u, y: sp.y + sp.h * 0.5 + 6 * u };
    let pos;
    let scale = 1;

    if (p < 0.335) {
      pos = path([
        { x: D.x + D.w * 1.02, y: D.y + D.h * 0.9 },
        center(T["nav-cta"] || D),
        center(T.giant || D, 0.25, 0.5),
        center(T.portrait || D, 0.5, 0.4),
        center(T.btn || D, 0.6, 0.6),
      ], seg(p, 0.19, 0.335));
    } else if (p < 0.465 || !btnFrag) {
      const s0 = fragStart[4];
      const grab = { x: s0.x + fragSize[4].w * 0.72, y: s0.y + fragSize[4].h * 0.7 };
      pos = path([center(T.btn || D, 0.6, 0.6), grab], seg(p, 0.34, 0.4));
    } else if (p < 0.535) {
      pos = { x: btnFrag.x + btnFrag.w * 0.72, y: btnFrag.y + btnFrag.h * 0.7 };
    } else if (p < 0.84) {
      const from = center(T.btn || D, 0.72, 0.7);
      pos = p < 0.56 ? path([from, handle], seg(p, 0.535, 0.56)) : handle;
    } else {
      pos = path([handle, mobileBtn], seg(p, 0.86, 0.93));
      scale = 1 - Math.sin(Math.PI * seg(p, 0.935, 0.965)) * 0.18;
      if (p >= 0.95 && !clicked && forward) burst(mobileBtn.x, mobileBtn.y, ["#f7c21b", "#ff304f", "#f4f6fa"]);
      clicked = p >= 0.95;
    }
    if (p < 0.84) clicked = false;

    placeAt(pxCursor, pos.x, pos.y);
    set(pxCursor, "scale", scale.toFixed(3));
    show(pxCursor, (1 - e) * (1 - away));
  }

  /* =========================================================
     CAMERA — per-act pose + explode + pointer tilt (written every frame)
  ========================================================= */
  // p, rotateX, rotateY, rotateZ, scale
  const CAM = [
    [0, 26, 0, -8, 0.9],
    [0.15, 22, 0, -6, 0.93],
    [0.2, 36, 0, -14, 0.9], //   wireframe on the "blueprint table"
    [0.33, 36, 0, -14, 0.9],
    [0.42, 14, 0, -4, 0.97],
    [0.52, 0, 0, 0, 1],
    [0.84, 0, 0, 0, 1],
    [0.92, 8, -16, 0, 0.98], //  launch: turn to show depth between devices
    [1, 6, -10, 0, 1],
  ];

  function cameraAt(p, e) {
    let i = 1;
    while (i < CAM.length - 1 && p > CAM[i][0]) i++;
    const a = CAM[i - 1];
    const b = CAM[i];
    const k = E.inOut(seg(p, a[0], b[0]));
    let rx = lerp(a[1], b[1], k);
    let ry = lerp(a[2], b[2], k);
    let rz = lerp(a[3], b[3], k);
    let sc = lerp(a[4], b[4], k);
    // Sway with each morph so the resize feels physical
    ry += 7 * Math.sin(Math.PI * seg(p, 0.56, 0.66)) - 7 * Math.sin(Math.PI * seg(p, 0.7, 0.79));
    // Exploded view: tip the stack over so the layers read
    rx += 44 * e;
    rz -= 26 * e;
    sc *= 1 - 0.12 * e;
    return { rx, ry, rz, sc };
  }

  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };

  function renderCamera(p, e, swap, time) {
    const c = cameraAt(p, e);
    // Sample 2: a slow orbit while the page plays; a little whip during the hand-off
    const drift = Math.sin(((time - SWAP[0]) / (DURATION - SWAP[0])) * Math.PI);
    const whip = Math.sin(Math.PI * swap);
    const rx = lerp(c.rx, 5 + 3 * drift, swap) + 6 * whip - pointer.y * 7;
    const ry = lerp(c.ry, -6 - 8 * drift, swap) - 14 * whip + pointer.x * 10;
    const rz = lerp(c.rz, 0, swap);
    const sc = lerp(c.sc, 1, swap) - 0.06 * whip;
    set(cam, "transform", `rotateX(${f2(rx)}deg) rotateY(${f2(ry)}deg) rotateZ(${f2(rz)}deg) scale(${sc.toFixed(4)})`);
  }

  /* =========================================================
     PLAYER — time, HUD, loop, in-view, pause
  ========================================================= */
  let t = motionOK ? 0 : CHAPTER_FRAME[CHAPTER_FRAME.length - 1];
  let inView = false;
  let paused = !motionOK; // reduced motion: start paused, the visitor may press play
  let raf = 0;
  let lastNow = 0;
  let lastChapter = -1;

  function renderHud() {
    let ch = CHAPTERS.findIndex(([a, b]) => t >= a && t < b);
    if (ch < 0) ch = CHAPTERS.length - 1;
    bars.forEach((bar, i) => {
      bar.classList.toggle("is-active", i === ch);
      set(bar, "--fill", (i < ch ? 1 : i > ch ? 0 : seg(t, ...CHAPTERS[i])).toFixed(3));
    });
    if (ch !== lastChapter) {
      caps.forEach((c, i) => {
        c.classList.toggle("is-on", i === ch);
        c.classList.toggle("is-out", i === lastChapter);
      });
      lastChapter = ch;
    }
    const sec = `00:${String(Math.floor(t)).padStart(2, "0")}`;
    if (timeEl.textContent !== sec) timeEl.textContent = sec;
  }

  function draw() {
    const p = progressAt(t);
    const e = explodeAt(t);
    const swap = E.inOut(seg(t, ...SWAP));
    set(scene, "--seam", (motionOK && !paused ? seamAt(t) : 1).toFixed(3));
    cursorAway = seg(t, SWAP[0] - 0.4, SWAP[0]);
    render(p, e, swap);
    renderMr(t, swap);
    section.classList.toggle("is-launch", p > 0.9 && swap < 0.5);
    set(device, "--po", E.expo(seg(p, 0.955, 0.995)).toFixed(3)); // portrait scale after the CTA tap
    renderCamera(p, e, swap, t);
    renderHud();
  }

  function tick(now) {
    raf = 0;
    const dt = lastNow ? Math.min(0.05, (now - lastNow) / 1000) : 0;
    lastNow = now;
    if (!paused) {
      t += dt;
      if (t >= DURATION) {
        t -= DURATION;
        lastP = -1;
      }
    }
    pointer.x += (pointer.tx - pointer.x) * 0.08;
    pointer.y += (pointer.ty - pointer.y) * 0.08;
    animateFlip = !paused && motionOK;
    draw();
    const settled = Math.abs(pointer.tx - pointer.x) + Math.abs(pointer.ty - pointer.y) < 0.001;
    if (inView && (!paused || !settled)) raf = requestAnimationFrame(tick);
    else lastNow = 0;
  }

  function wake() {
    if (!raf && inView) raf = requestAnimationFrame(tick);
  }

  function setPaused(v) {
    paused = v;
    section.classList.toggle("is-paused", v);
    playBtn.setAttribute("aria-pressed", String(v));
    playBtn.setAttribute("aria-label", v ? "Play animation" : "Pause animation");
    wake();
  }

  function seek(time) {
    t = clamp(time, 0, DURATION - 0.001);
    lastP = -1;
    animateFlip = false;
    draw();
    wake();
  }

  bars.forEach((bar, i) => bar.addEventListener("click", () => seek(paused ? CHAPTER_FRAME[i] : CHAPTERS[i][0] + 0.001)));
  playBtn.addEventListener("click", () => setPaused(!paused));

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(
      (entries) => {
        inView = entries[0].isIntersecting;
        section.classList.toggle("is-inview", inView);
        wake();
      },
      { threshold: 0.15 }
    ).observe(section);
  } else {
    inView = true;
    section.classList.add("is-inview");
  }

  document.addEventListener("visibilitychange", () => {
    lastNow = 0;
    if (!document.hidden) wake();
  });

  function relayout() {
    measure();
    lastP = -1;
    animateFlip = false;
    draw();
  }

  setPaused(paused);
  relayout();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(relayout);
  window.addEventListener("load", () => {
    relayout();
    // Decode the images of scenes that appear later in the loop, so their first frame doesn't hitch.
    const warm = () => $$("img", section).forEach((img) => img.decode && img.decode().catch(() => {}));
    if ("requestIdleCallback" in window) window.requestIdleCallback(warm);
    else window.setTimeout(warm, 800);
  }, { once: true });

  let resizeTimer = 0;
  window.addEventListener("resize", () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(relayout, 140);
  });

  /* =========================================================
     POINTER — camera tilt, depth parallax, glass specular (fine pointer + motion)
  ========================================================= */
  if (finePointer && motionOK) {
    frame.addEventListener("pointermove", (ev) => {
      const r = frame.getBoundingClientRect();
      const nx = (ev.clientX - r.left) / r.width - 0.5;
      const ny = (ev.clientY - r.top) / r.height - 0.5;
      pointer.tx = nx;
      pointer.ty = ny;
      frame.style.setProperty("--px", (nx * 2).toFixed(3));
      frame.style.setProperty("--py", (ny * 2).toFixed(3));
      frame.style.setProperty("--gx", `${((nx + 0.5) * 100).toFixed(1)}%`);
      frame.style.setProperty("--gy", `${((ny + 0.5) * 100).toFixed(1)}%`);
      wake();
    });
    frame.addEventListener("pointerleave", () => {
      pointer.tx = 0;
      pointer.ty = 0;
      wake();
    });
  }
})();
