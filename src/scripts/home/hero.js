/* =========================================================
   HERO — "Everything connects."
   The meadow video loops on its own. On top, one canvas draws the code effects:
   - always: twinkling stars, laptop glow, fingertip glow
   - with scroll (stage pinned): light leaves the laptop and gathers at the fingertip,
     a beam shoots into the sky, a shockwave opens a nebula, eight decorative points
     light up and link into a network, a pulse runs Creative → Growth, closing line.
   Scroll sets a target "story time" s; s eases toward it, so wheel steps stay smooth
   and scrolling back plays it in reverse. Ambient motion runs on the clock.
   Storyboard + source: content/hero-cosmic/ (motion/motion.js is the original timeline).
========================================================= */
(() => {
  const hero = document.querySelector(".hero");
  if (!hero) return;
  const stage = hero.querySelector(".hero-stage");
  const video = hero.querySelector(".hero-video");
  const poster = hero.querySelector(".hero-poster");
  const canvas = hero.querySelector(".hero-fx");
  const copy = hero.querySelector(".hero-copy");
  const foot = hero.querySelector(".hero-foot");
  const closingWords = Array.from(hero.querySelectorAll(".hc-w"));
  const ctx = canvas.getContext("2d");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- helpers ---------- */
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const seg = (t, a, b) => clamp((t - a) / (b - a));
  const lerp = (a, b, k) => a + (b - a) * k;
  const eOutExpo = (x) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x));
  const eOutCubic = (x) => 1 - Math.pow(1 - x, 3);
  const eInOut = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
  const rng = (seed) => () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const cubic = (p0, p1, p2, p3, u) => {
    const v = 1 - u;
    return [0, 1].map((k) => v * v * v * p0[k] + 3 * v * v * u * p1[k] + 3 * v * u * u * p2[k] + u * u * u * p3[k]);
  };
  const quad = (p0, c, p1, u) => {
    const v = 1 - u;
    return [0, 1].map((k) => v * v * p0[k] + 2 * v * u * c[k] + u * u * p1[k]);
  };

  /* sampled path with arc-length lookup */
  function makePath(fn, n = 48) {
    const pts = [];
    const len = [0];
    for (let i = 0; i <= n; i++) pts.push(fn(i / n));
    for (let i = 1; i <= n; i++) len.push(len[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    return { pts, len, total: len[n] || 1 };
  }
  function pointAt(p, u) {
    const d = clamp(u) * p.total;
    let i = 1;
    while (i < p.len.length - 1 && p.len[i] < d) i++;
    const k = (d - p.len[i - 1]) / (p.len[i] - p.len[i - 1] || 1);
    return [lerp(p.pts[i - 1][0], p.pts[i][0], k), lerp(p.pts[i - 1][1], p.pts[i][1], k)];
  }
  function trace(p, u0, u1) {
    if (u1 <= u0) return false;
    const a = pointAt(p, u0);
    const b = pointAt(p, u1);
    const d0 = u0 * p.total;
    const d1 = u1 * p.total;
    ctx.beginPath();
    ctx.moveTo(a[0], a[1]);
    for (let i = 1; i < p.pts.length; i++) if (p.len[i] > d0 && p.len[i] < d1) ctx.lineTo(p.pts[i][0], p.pts[i][1]);
    ctx.lineTo(b[0], b[1]);
    return true;
  }
  const bent = (a, b, bend) => {
    const l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    const c = [(a[0] + b[0]) / 2 - ((b[1] - a[1]) / l) * l * bend, (a[1] + b[1]) / 2 + ((b[0] - a[0]) / l) * l * bend];
    return makePath((u) => quad(a, c, b, u), 40);
  };

  /* glow sprites, tinted once */
  function sprite(r, g, b) {
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const x = c.getContext("2d");
    const gr = x.createRadialGradient(64, 64, 0, 64, 64, 64);
    gr.addColorStop(0, `rgba(${r},${g},${b},1)`);
    gr.addColorStop(0.18, `rgba(${r},${g},${b},.55)`);
    gr.addColorStop(0.45, `rgba(${r},${g},${b},.16)`);
    gr.addColorStop(1, `rgba(${r},${g},${b},0)`);
    x.fillStyle = gr;
    x.fillRect(0, 0, 128, 128);
    return c;
  }
  const SP = { red: sprite(255, 48, 79), pink: sprite(255, 120, 150), white: sprite(255, 236, 242), violet: sprite(150, 70, 210), blue: sprite(70, 100, 220), magenta: sprite(214, 40, 140) };
  function glow(s, x, y, r, a, c = ctx) {
    if (a <= 0.003 || r <= 0) return;
    c.globalAlpha = Math.min(1, a);
    c.drawImage(s, x - r, y - r, r * 2, r * 2);
    c.globalAlpha = 1;
  }

  /* ---------- scene geometry ----------
     Image coords = content/hero-cosmic/keyframes/k1-locked.png (2688×1520). The video is that
     frame cropped 4 px top and bottom and scaled to 1920×1080; the phone video is a 760-wide
     crop starting at x = 860 (content/hero-cosmic/web-assets.mjs). */
  const K = 1920 / 2688;
  const CROP_Y = 4;
  const SRC = { full: { w: 1920, h: 1080, x0: 0, focus: 1150 }, mobile: { w: 760, h: 1080, x0: 860, focus: 1225 } };
  const FINGER = [1500, 1135];
  const SCREEN = [1462, 1170];
  const HORIZON_Y = 860;
  const FIGURE = [1650, 820, 2160, 1300]; /* no extra stars drawn over the figure */

  const NAMES = ["Creative", "Content", "Motion", "Website", "Ads", "Automation", "Analytics", "Growth"];
  /* [x, y] as fractions of the stage, [label dx, dy] in ui px, label align */
  const LAYOUTS = {
    wide: {
      spark: [0.502, 0.49],
      nodes: [[0.123, 0.311, 0, 34, "c"], [0.26, 0.198, 0, -34, "c"], [0.309, 0.423, 0, 34, "c"], [0.461, 0.284, 0, 36, "c"], [0.595, 0.15, 0, -34, "c"], [0.658, 0.397, 0, 36, "c"], [0.785, 0.297, 22, 22, "l"], [0.9, 0.158, 0, -34, "c"]],
      cross: [[0, 2], [1, 3], [2, 5], [3, 6], [4, 6], [3, 5], [5, 7]],
    },
    tall: {
      spark: [0.4, 0.58],
      nodes: [[0.16, 0.55, 14, 0, "l"], [0.66, 0.5, -14, 0, "r"], [0.3, 0.45, 14, 0, "l"], [0.82, 0.4, -14, 0, "r"], [0.2, 0.35, 14, 0, "l"], [0.66, 0.3, -14, 0, "r"], [0.28, 0.255, 14, 0, "l"], [0.8, 0.21, -14, 0, "r"]],
      cross: [[0, 2], [1, 3], [3, 5], [4, 6]],
    },
  };

  /* story timeline, in story-seconds (same beats as content/hero-cosmic/motion/motion.js) */
  const S_REST = 2.0;
  const S_END = 13.9;
  const T = {
    copyOut: [2.3, 3.4], particles: [2.2, 3.9], filament: [2.5, 3.9], touch: 3.95,
    beam: [4.05, 5.0], spark: 5.0, shock: [5.0, 7.4], nebula: [5.2, 7.8], link0: [5.5, 6.2],
    edgeDur: 0.45, edgeGap: 0.05, cross: 9.75, crossGap: 0.14, crossDur: 0.6, packets: 10.2,
    pulse: [11.0, 12.6], closing: 12.4,
  };
  const ACT = [T.link0[1]];
  for (let i = 1; i < NAMES.length; i++) ACT.push(ACT[i - 1] + T.edgeGap + T.edgeDur);

  /* ---------- layout (rebuilt on resize) ---------- */
  let W = 0;
  let H = 0;
  let dpr = 1;
  let G = null;

  function useMobileSource() {
    const cur = video.currentSrc || "";
    return cur ? cur.includes("mobile") : window.innerWidth < 768;
  }

  function layout() {
    const r = stage.getBoundingClientRect();
    W = r.width;
    H = r.height;
    if (!W || !H) return;
    dpr = Math.min(window.devicePixelRatio || 1, W < 768 ? 1.5 : 2);
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);

    const place = (src) => {
      const c = Math.max(W / src.w, H / src.h);
      const ox = clamp(W / 2 - (src.focus - src.x0) * c, W - src.w * c, 0);
      const oy = (H - src.h * c) / 2;
      return { c, ox, oy, src };
    };
    const vid = place(useMobileSource() ? SRC.mobile : SRC.full);
    const pst = place(window.innerWidth < 768 ? SRC.mobile : SRC.full);
    video.style.objectPosition = `${vid.ox.toFixed(1)}px ${vid.oy.toFixed(1)}px`;
    poster.style.objectPosition = `${pst.ox.toFixed(1)}px ${pst.oy.toFixed(1)}px`;

    const { c, ox, oy, src } = vid;
    const map = (p) => [ox + (p[0] * K - src.x0) * c, oy + (p[1] - CROP_Y) * K * c];
    const u = K * c; /* image px → screen px */
    const L = W / H < 0.85 ? LAYOUTS.tall : LAYOUTS.wide;
    const tall = L === LAYOUTS.tall;
    const ui = tall ? clamp(W / 430, 0.78, 1.1) : clamp(W / 1920, 0.62, 1.15);
    const minY = 150 * Math.min(1, ui + 0.2);
    const nodes = L.nodes.map(([x, y, dx, dy, al], i) => ({ name: NAMES[i], x: x * W, y: Math.max(y * H, minY), dx: dx * ui, dy: dy * ui, al }));
    const P = nodes.map((n) => [n.x, n.y]);
    const spark = [L.spark[0] * W, L.spark[1] * H];
    const finger = map(FINGER);
    const screen = map(SCREEN);
    const horizon = map([0, HORIZON_Y])[1];
    const fig = [map([FIGURE[0], FIGURE[1]]), map([FIGURE[2], FIGURE[3]])];

    const chain = P.slice(0, -1).map((p, i) => bent(p, P[i + 1], i % 2 ? 0.1 : -0.1));
    const chainAll = makePath((t) => {
      const f = t * chain.length;
      const i = Math.min(chain.length - 1, Math.floor(f));
      return pointAt(chain[i], f - i);
    }, chain.length * 30);

    const R = rng(20261114);
    const stars = [];
    const want = clamp((W * H) / 8500, 70, 260);
    for (let n = 0; stars.length < want && n < 4000; n++) {
      const x = R() * W;
      const y = R() * Math.max(80, horizon - 12);
      if (x > fig[0][0] && x < fig[1][0] && y > fig[0][1]) continue;
      stars.push({ x, y, s: (0.8 + R() * 1.4) * Math.max(0.8, ui), a: 0.25 + R() * 0.55, f: 0.6 + R() * 1.8, p: R() * 6.28 });
    }

    const nParts = tall ? 50 : 80;
    const parts = Array.from({ length: nParts }, (_, i) => {
      const s0 = [1432 + R() * 58, 1128 + R() * 86];
      const c1 = [s0[0] - 60 + R() * 50, s0[1] - 140 - R() * 100];
      const c2 = [FINGER[0] + 40 + R() * 80, FINGER[1] - 110 - R() * 80];
      const end = [FINGER[0] + (R() - 0.5) * 10, FINGER[1] + (R() - 0.5) * 10];
      const pts = [s0, c1, c2, end].map(map);
      return {
        t0: T.particles[0] + (T.particles[1] - T.particles[0] - 0.9) * (i / nParts) + R() * 0.15,
        dur: 0.85 + R() * 0.5,
        path: makePath((t) => cubic(pts[0], pts[1], pts[2], pts[3], t), 30),
        wob: (6 + R() * 14) * u,
        ph: R() * 6.28,
      };
    });

    /* nebula band along the chain, pre-baked at half resolution */
    const neb = document.createElement("canvas");
    neb.width = Math.max(1, Math.round(W / 2));
    neb.height = Math.max(1, Math.round(H / 2));
    const nx = neb.getContext("2d");
    nx.globalCompositeOperation = "lighter";
    nx.scale(0.5, 0.5);
    const pal = [[SP.red, 0.4], [SP.magenta, 0.25], [SP.violet, 0.2], [SP.blue, 0.15]];
    const pick = () => {
      let q = R();
      for (const [s, w] of pal) if ((q -= w) <= 0) return s;
      return SP.red;
    };
    const spread = (tall ? 0.09 : 0.12) * H;
    for (let i = 0; i < 110; i++) {
      const p = pointAt(chainAll, R());
      glow(pick(), p[0] + (R() - 0.5) * 0.05 * W, p[1] + (R() + R() + R() - 1.5) * spread, (0.05 + R() * 0.13) * Math.max(W, H), 0.05 + R() * 0.08, nx);
    }
    for (let i = 0; i < 900; i++) {
      const p = pointAt(chainAll, R());
      nx.globalAlpha = 0.15 + R() * 0.6;
      nx.fillStyle = R() > 0.7 ? "#ffb3c2" : "#ffffff";
      const s = 0.8 + R() * 1.6;
      nx.fillRect(p[0] + (R() - 0.5) * 0.05 * W, p[1] + (R() + R() + R() - 1.5) * spread * 1.15, s, s);
    }
    nx.globalAlpha = 1;

    G = {
      u, ui, tall, nodes, spark, finger, screen, stars, parts, neb,
      link0: bent(spark, P[0], 0.1),
      chain, chainAll,
      cross: L.cross.map(([a, b], k) => bent(P[a], P[b], k % 2 ? 0.08 : -0.08)),
      filament: makePath((t) => cubic(screen, map([1430, 1060]), map([1530, 1040]), finger, t)),
      beam: makePath((t) => quad(finger, map([1560, 890]), spark, t)),
      burst: Array.from({ length: 48 }, () => ({ a: R() * Math.PI * 2, v: (300 + R() * 650) * ui, s: 1 + R() * 2.2 })),
      font: `500 ${Math.round((tall ? 10.5 : 17) * (tall ? ui : Math.max(0.8, ui)))}px "JetBrains Mono", monospace`,
    };
  }

  /* ---------- drawing ---------- */
  function strokeGlow(p, u0, u1, core, coreW, glowA, glowW) {
    if (!trace(p, u0, u1)) return;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = `rgba(255,48,79,${glowA})`;
    ctx.lineWidth = glowW;
    ctx.stroke();
    ctx.strokeStyle = core;
    ctx.lineWidth = coreW;
    ctx.stroke();
  }

  const pointer = { x: -9999, y: -9999 };

  function draw(s, clock) {
    if (!G) return;
    const { u, ui, nodes, spark, finger, screen } = G;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalCompositeOperation = "source-over";
    ctx.clearRect(0, 0, W, H);

    /* nebula, revealed by the shockwave */
    const shock = seg(s, T.shock[0], T.shock[1]);
    const shockR = Math.hypot(W, H) * eOutCubic(shock);
    const nebA = eOutCubic(seg(s, T.nebula[0], T.nebula[1]));
    if (nebA > 0) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(spark[0], spark[1], Math.max(1, shockR), 0, Math.PI * 2);
      ctx.clip();
      ctx.globalAlpha = 0.95 * nebA;
      ctx.drawImage(G.neb, Math.sin(clock * 0.12) * 14, Math.cos(clock * 0.09) * 6, W, H);
      ctx.restore();
      ctx.globalAlpha = 1;
    }

    ctx.globalCompositeOperation = "lighter";

    /* twinkling stars; brighter once the network is alive and where the shockwave passes */
    const net = seg(s, 6, 10);
    ctx.fillStyle = "#fff";
    for (const st of G.stars) {
      let a = st.a * (0.55 + 0.45 * Math.sin(clock * st.f * 2 + st.p)) * (0.75 + 0.45 * net);
      if (shock > 0 && shock < 1) a += Math.max(0, 1 - Math.abs(Math.hypot(st.x - spark[0], st.y - spark[1]) - shockR) / (70 * ui)) * (1 - shock) * 1.4;
      if (a <= 0.01) continue;
      ctx.globalAlpha = Math.min(1, a);
      ctx.fillRect(st.x - st.s / 2, st.y - st.s / 2, st.s, st.s);
      if (a > 0.72) glow(SP.white, st.x, st.y, st.s * 5, (a - 0.72) * 0.8);
    }
    ctx.globalAlpha = 1;

    if (shock > 0 && shock < 1) {
      ctx.beginPath();
      ctx.arc(spark[0], spark[1], shockR, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255,48,79,${0.1 * (1 - shock)})`;
      ctx.lineWidth = 18 * ui;
      ctx.stroke();
      ctx.strokeStyle = `rgba(255,170,190,${0.45 * (1 - shock)})`;
      ctx.lineWidth = 1.8 * ui;
      ctx.stroke();
    }

    /* an occasional shooting star while the network is alive */
    if (s > 6.5) {
      const cyc = clock % 7.5;
      const k = Math.floor(clock / 7.5);
      const q = seg(cyc, 0, 0.7);
      if (q > 0 && q < 1) {
        const x0 = W * (0.55 + ((k * 0.37) % 0.4));
        const y0 = H * (0.05 + ((k * 0.23) % 0.15));
        const hx = x0 - 0.33 * W * q;
        const hy = y0 + 0.2 * H * q;
        const a = Math.sin(Math.PI * q);
        const tail = 180 * ui;
        const g = ctx.createLinearGradient(hx, hy, hx + tail, hy - tail * 0.42);
        g.addColorStop(0, `rgba(255,255,255,${0.85 * a})`);
        g.addColorStop(1, "rgba(255,255,255,0)");
        ctx.strokeStyle = g;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(hx, hy);
        ctx.lineTo(hx + tail, hy - tail * 0.42);
        ctx.stroke();
      }
    }

    /* network */
    const fadeLink0 = 1 - 0.65 * seg(s, 10, 11.5);
    strokeGlow(G.link0, 0, eInOut(seg(s, T.link0[0], T.link0[1])), `rgba(255,150,170,${0.75 * fadeLink0})`, 1.1 * ui, 0.1 * fadeLink0, 5 * ui);
    G.chain.forEach((p, i) => {
      const a = ACT[i] + T.edgeGap;
      strokeGlow(p, 0, eInOut(seg(s, a, a + T.edgeDur)), "rgba(255,150,170,.85)", 1.4 * ui, 0.12, 6 * ui);
    });
    G.cross.forEach((p, k) => {
      const a = T.cross + k * T.crossGap;
      strokeGlow(p, 0, eInOut(seg(s, a, a + T.crossDur)), "rgba(255,170,190,.42)", 0.9 * ui, 0.05, 4 * ui);
    });

    const pk = seg(s, T.packets, T.packets + 0.8);
    if (pk > 0) {
      [...G.chain, ...G.cross].forEach((p, i) => {
        for (let j = 0; j < 2; j++) {
          const q = (clock * ((150 * ui) / p.total) + j * 0.5 + i * 0.137) % 1;
          const pt = pointAt(p, i % 3 === 0 ? 1 - q : q);
          glow(SP.pink, pt[0], pt[1], 9 * ui, 0.55 * pk);
          glow(SP.white, pt[0], pt[1], 2.4 * ui, 0.9 * pk);
        }
      });
    }

    const pu = seg(s, T.pulse[0], T.pulse[1]);
    let pulseU = -1;
    if (pu > 0 && pu < 1) {
      pulseU = eInOut(pu);
      strokeGlow(G.chainAll, Math.max(0, pulseU - 0.08), pulseU, "rgba(255,235,240,.95)", 2.4 * ui, 0.3, 10 * ui);
      const h = pointAt(G.chainAll, pulseU);
      glow(SP.white, h[0], h[1], 28 * ui, 0.9);
      glow(SP.red, h[0], h[1], 85 * ui, 0.5);
    }

    ctx.textBaseline = "middle";
    ctx.font = G.font;
    nodes.forEach((n, i) => {
      const ta = ACT[i];
      if (s < ta) return;
      const a = eOutCubic(seg(s, ta, ta + 0.5));
      const rp = seg(s, ta, ta + 1.1);
      const breath = 1 + 0.1 * Math.sin(clock * 2.1 + i);
      const flash = pulseU >= 0 ? Math.max(0, 1 - Math.abs(pulseU - i / (nodes.length - 1)) * 14) : 0;
      const growth = i === nodes.length - 1 ? eOutCubic(seg(s, T.pulse[1] - 0.1, T.pulse[1] + 0.8)) : 0;
      const near = Math.max(0, 1 - Math.hypot(pointer.x - n.x, pointer.y - n.y) / (110 * ui));
      if (rp < 1) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, (7 + 56 * eOutExpo(rp)) * ui, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255,150,170,${0.8 * (1 - rp)})`;
        ctx.lineWidth = 1.5 * ui;
        ctx.stroke();
      }
      glow(SP.red, n.x, n.y, (37 + 43 * growth + 20 * near) * ui * breath, (0.55 + 0.4 * flash + 0.3 * growth + 0.3 * near) * a);
      glow(SP.white, n.x, n.y, (10 + 7 * flash + 6 * growth + 5 * near) * ui, a);
      ctx.globalAlpha = a;
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(n.x, n.y, 4 * ui, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;

      const la = eOutCubic(seg(s, ta + 0.15, ta + 0.8));
      if (la > 0) {
        if ("letterSpacing" in ctx) ctx.letterSpacing = `${((G.tall ? 2 : 3) + 7 * (1 - la)).toFixed(1)}px`;
        const num = String(i + 1).padStart(2, "0");
        const label = n.name.toUpperCase();
        const wNum = ctx.measureText(num).width;
        const gap = 9 * ui;
        const wAll = wNum + gap + ctx.measureText(label).width;
        const x0 = n.al === "l" ? n.x + n.dx : n.al === "r" ? n.x + n.dx - wAll : n.x + n.dx - wAll / 2;
        const y0 = n.y + n.dy;
        ctx.fillStyle = `rgba(255,48,79,${la})`;
        ctx.fillText(num, x0, y0);
        ctx.fillStyle = `rgba(244,246,250,${0.92 * la})`;
        ctx.fillText(label, x0 + wNum + gap, y0);
        if ("letterSpacing" in ctx) ctx.letterSpacing = "0px";
      }
    });

    /* beam finger → sky, spark burst */
    const bu = eInOut(seg(s, T.beam[0], T.beam[1]));
    if (bu > 0) {
      const keep = s > T.beam[1] ? lerp(1, 0.22, seg(s, T.beam[1], 7.5)) : 1;
      strokeGlow(G.beam, 0, bu, `rgba(255,190,205,${0.55 * keep})`, 1.2 * ui, 0.1 * keep, 7 * ui);
      if (bu < 1) {
        strokeGlow(G.beam, Math.max(0, bu - 0.3), bu, "rgba(255,240,245,.95)", 2.4 * ui, 0.3, 12 * ui);
        const h = pointAt(G.beam, bu);
        glow(SP.white, h[0], h[1], 26 * ui, 1);
        glow(SP.red, h[0], h[1], 80 * ui, 0.7);
      }
    }
    const sp = seg(s, T.spark, T.spark + 1.3);
    if (sp > 0) {
      glow(SP.red, spark[0], spark[1], 260 * ui * eOutExpo(sp), 0.9 * (1 - sp));
      glow(SP.white, spark[0], spark[1], (65 * (1 - sp) + 12) * ui, 0.95 * (1 - sp) + 0.35);
      glow(SP.red, spark[0], spark[1], 44 * ui, 0.35 * (1 - 0.5 * seg(s, 10, 12)));
      if (sp < 1) {
        for (const b of G.burst) {
          const d = (b.v * (1 - Math.exp(-5.2 * sp))) / 4;
          const x = spark[0] + Math.cos(b.a) * d;
          const y = spark[1] + Math.sin(b.a) * d;
          glow(SP.pink, x, y, 7 * b.s * ui, 0.7 * (1 - sp));
          glow(SP.white, x, y, 1.8 * b.s * ui, 1 - sp);
        }
      }
    }

    /* laptop glow (always alive) */
    const touch = seg(s, T.touch, T.touch + 0.65);
    const lg = 0.24 + 0.06 * Math.sin(clock * 2.3) + 0.22 * seg(s, 2.0, 3.9) + 0.35 * (touch > 0 && touch < 1 ? 1 - touch : 0) - 0.1 * seg(s, 4.6, 6);
    glow(SP.pink, screen[0], screen[1], (180 + 60 * seg(s, 2, 4)) * u, lg);

    /* filament laptop → finger */
    const fu = eInOut(seg(s, T.filament[0], T.filament[1]));
    if (fu > 0) {
      const keep = s > 4 ? (1 - seg(s, 4.3, 5.6)) * (0.85 + 0.15 * Math.sin(clock * 7)) : 1;
      strokeGlow(G.filament, 0, fu, `rgba(255,205,215,${0.85 * keep})`, Math.max(1, 1.4 * u), 0.14 * keep, 8 * u);
    }

    /* particles out of the screen, swirling into the fingertip */
    for (const p of G.parts) {
      const q = seg(s, p.t0, p.t0 + p.dur);
      if (q <= 0 || q >= 1) continue;
      const e = eInOut(q);
      const env = Math.min(1, q * 5) * (q > 0.88 ? (1 - q) / 0.12 : 1);
      for (let k = 4; k >= 0; k--) {
        const uu = Math.max(0, e - k * 0.025);
        const pt = pointAt(p.path, uu);
        const w = Math.sin(uu * Math.PI * 3 + p.ph) * p.wob * (1 - uu);
        const x = pt[0] + w;
        const y = pt[1] + w * 0.4;
        const fade = (1 - k / 5) * env;
        if (k === 0) {
          glow(SP.pink, x, y, 16 * u, 0.5 * fade);
          glow(SP.white, x, y, Math.max(1.6, 3.2 * u), fade);
        } else glow(SP.pink, x, y, 7 * u, 0.35 * fade);
      }
    }

    /* touch flash + fingertip glow */
    if (touch > 0 && touch < 1) {
      glow(SP.white, finger[0], finger[1], (40 + 220 * eOutExpo(touch)) * u, 0.9 * (1 - touch));
      ctx.beginPath();
      ctx.arc(finger[0], finger[1], (12 + 160 * eOutExpo(touch)) * u, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255,190,205,${1 - touch})`;
      ctx.lineWidth = 3 * (1 - touch) + 0.5;
      ctx.stroke();
    }
    const fg = 0.35 + 0.65 * seg(s, 3.3, 3.95);
    const fpulse = 0.8 + 0.2 * Math.sin(clock * 3);
    glow(SP.pink, finger[0], finger[1], 36 * u, 0.5 * fg * fpulse);
    glow(SP.white, finger[0], finger[1], 7 * u, 0.85 * fg * fpulse);

    ctx.globalCompositeOperation = "source-over";
  }

  /* ---------- copy driven by the story ---------- */
  const root = document.documentElement;
  function updateCopy(s) {
    const out = eInOut(seg(s, T.copyOut[0], T.copyOut[1]));
    const gone = out > 0.99 ? "hidden" : "";
    copy.style.opacity = String(1 - out);
    copy.style.transform = out > 0 ? `translate3d(0, ${(-40 * out).toFixed(1)}px, 0)` : "";
    copy.style.visibility = gone;
    foot.style.visibility = gone;
    foot.style.opacity = root.classList.contains("is-ready") ? String(1 - out) : "";
    closingWords.forEach((w, i) => {
      const k = eOutExpo(seg(s, T.closing + i * 0.14, T.closing + i * 0.14 + 1.1));
      w.style.transform = `translate3d(0, ${((1 - k) * 115).toFixed(1)}%, 0)`;
    });
  }

  /* ---------- video ---------- */
  video.addEventListener("playing", () => video.classList.add("is-playing"));
  video.addEventListener("loadedmetadata", () => layout());
  let wasMobile = window.innerWidth < 768;

  /* ---------- reduced motion: one calm frame (stars, laptop + fingertip glow), no story ---------- */
  if (reduce) {
    video.removeAttribute("autoplay");
    video.pause();
    const still = () => {
      layout();
      draw(S_REST, 0);
    };
    still();
    new ResizeObserver(still).observe(stage);
    document.fonts && document.fonts.ready.then(still);
    return;
  }

  /* ---------- running scene ---------- */
  let s = S_REST;
  let target = S_REST;
  let last = performance.now();
  let start = last;
  let running = false;
  let visible = true;

  function readScroll() {
    const r = hero.getBoundingClientRect();
    const span = r.height - H;
    const p = span > 0 ? clamp(-r.top / span) : 0;
    target = S_REST + p * (S_END - S_REST);
  }

  function frame(now) {
    if (!running) return;
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    s += (target - s) * (1 - Math.exp(-dt * 5));
    if (Math.abs(target - s) < 0.0005) s = target;
    draw(s, (now - start) / 1000);
    updateCopy(s);
    requestAnimationFrame(frame);
  }

  function setRunning(on) {
    if (on === running) return;
    running = on;
    if (on) {
      last = performance.now();
      if (video.paused) video.play().catch(() => {});
      requestAnimationFrame(frame);
    } else if (!video.paused) video.pause();
  }

  layout();
  readScroll();
  s = target;
  window.addEventListener("scroll", readScroll, { passive: true });
  new ResizeObserver(() => {
    const mobileNow = window.innerWidth < 768;
    if (mobileNow !== wasMobile) {
      wasMobile = mobileNow;
      video.load(); /* re-pick <source media> */
      video.play().catch(() => {});
    }
    layout();
    readScroll();
  }).observe(stage);
  if (document.fonts) document.fonts.load('500 17px "JetBrains Mono"').catch(() => {});

  stage.addEventListener("pointermove", (e) => {
    const r = stage.getBoundingClientRect();
    pointer.x = e.clientX - r.left;
    pointer.y = e.clientY - r.top;
  });
  stage.addEventListener("pointerleave", () => {
    pointer.x = pointer.y = -9999;
  });

  if ("IntersectionObserver" in window) {
    new IntersectionObserver((entries) => {
      visible = entries[0].isIntersecting;
      setRunning(visible && !document.hidden);
    }).observe(hero);
  }
  document.addEventListener("visibilitychange", () => setRunning(visible && !document.hidden));
  setRunning(true);
})();
