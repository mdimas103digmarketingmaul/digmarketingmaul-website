/* =========================================================
   DIGMARKETINGMAUL — HOME · VISUAL OPTION 01 "STACK DIAL"
   Vanilla JS, no dependencies.
========================================================= */

(() => {
  "use strict";

  const doc = document.documentElement;
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const mqReduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const mqFine = window.matchMedia("(hover: hover) and (pointer: fine)");
  const reduced = () => mqReduced.matches;
  const finePointer = () => mqFine.matches;

  /* -------------------------------------------------------
     STACK DATA (content identical to production)
  ------------------------------------------------------- */
  const stackData = {
    creative: {
      title: "Creative & Brand",
      icon: "fa-solid fa-pen-ruler",
      description: "Brand Guidelines & Creative Production.",
      skills: [
        { name: "Graphic Design", icon: "fa-solid fa-pen-nib", progress: 90,
          tooltip: "Graphic Design — I create visual assets for digital campaigns, social content, and brand communication across multiple formats.",
          children: [{ name: "Adobe Photoshop", progress: 90 }, { name: "Adobe Illustrator", progress: 90 }, { name: "Canva", progress: 82 }] },
        { name: "Social Content", icon: "fa-solid fa-hashtag", progress: 85,
          tooltip: "Social Content — I work across content ideation, planning, production, and execution for digital and social platforms, connecting creative ideas with campaign objectives." },
        { name: "Brand Identity & Guidelines", icon: "fa-solid fa-fingerprint", progress: 82,
          tooltip: "Brand Identity & Guidelines — I develop and maintain brand identity, visual consistency, and guidelines that translate business objectives into clear and cohesive brand experiences." },
        { name: "Creative Project Management", icon: "fa-solid fa-diagram-project", progress: 82,
          tooltip: "Creative Project Management — I coordinate creative workflows from briefing and concept development through production, stakeholder alignment, and campaign implementation." },
        { name: "Video Editing", icon: "fa-solid fa-video", progress: 78,
          tooltip: "Video Editing — I edit digital video content for campaigns and social platforms.",
          children: [{ name: "Adobe Premiere Pro", progress: 78 }, { name: "CapCut", progress: 72 }] }
      ]
    },
    acquire: {
      title: "Acquire",
      icon: "fa-solid fa-chart-column",
      description: "Digital ads, acquisition, and growth channels.",
      skills: [
        { name: "Meta Ads", icon: "fa-brands fa-meta", progress: 92,
          tooltip: "Meta Ads — I work extensively with app conversion campaigns, covering both Android and iOS acquisition, with a strong focus on in-app event optimization, attribution, and conversion-focused delivery.",
          children: [{ name: "Android Campaign" }, { name: "iOS Campaign" }] },
        { name: "Google Ads", icon: "fa-brands fa-google", progress: 92,
          tooltip: "Google Ads — I work across app acquisition and conversion-focused campaigns, using App Campaigns, Performance Max, and Search to connect paid traffic with measurable app outcomes and deeper conversion events.",
          children: [{ name: "App Campaign" }, { name: "Performance Max Campaign" }, { name: "Google Search Campaign" }] },
        { name: "TikTok Ads", icon: "fa-brands fa-tiktok", progress: 75,
          tooltip: "TikTok Ads — I have hands-on experience running TikTok Ads, although it currently plays a more selective role in my acquisition mix with a smaller budget allocation compared with Meta and Google." },
        { name: "LinkedIn Ads", icon: "fa-brands fa-linkedin-in", progress: 75,
          tooltip: "LinkedIn Ads — I use LinkedIn Ads selectively for targeted acquisition. In my current setup, web-to-app measurement and app-conversion optimization are less central than on Meta and Google, so it currently plays a more specialized role in the overall acquisition mix." }
      ]
    },
    measurement: {
      title: "Measurement",
      icon: "fa-solid fa-chart-pie",
      description: "Tracking, analytics, and attribution.",
      skills: [
        { name: "Mobile Measurement Partner (MMP)", icon: "fa-solid fa-mobile-screen-button", progress: 86,
          tooltip: "Mobile Measurement Partner (MMP) — I use Adjust as my primary MMP for mobile app conversion tracking, attribution, and in-app event measurement, particularly across acquisition journeys for Hijra Bank." },
        { name: "Google Analytics 4", icon: "fa-solid fa-chart-line", progress: 80,
          tooltip: "Google Analytics 4 — I use GA4 to understand acquisition, website behavior, event activity, and conversion journeys." },
        { name: "Google Tag Manager", icon: "fa-solid fa-tags", progress: 78,
          tooltip: "Google Tag Manager — I use GTM to structure and deploy website analytics and marketing tracking implementations." },
        { name: "SKAN", icon: "fa-brands fa-apple", progress: 72,
          tooltip: "SKAN — I work with SKAdNetwork for privacy-aware iOS acquisition measurement and mobile attribution." }
      ]
    },
    build: {
      title: "Build",
      icon: "fa-solid fa-layer-group",
      description: "Website, Blog, SEO & Content.",
      skills: [
        { name: "Website", icon: "fa-solid fa-code", progress: 76,
          tooltip: "Website — I build and manage practical websites that support marketing, communication, experimentation, and digital initiatives." },
        { name: "Landing Page", icon: "fa-regular fa-window-maximize", progress: 76,
          tooltip: "Landing Page — I design landing pages around clear messaging, user journeys, conversion goals, and measurement." },
        { name: "Blog & Content", icon: "fa-regular fa-file-lines", progress: 78,
          tooltip: "Blog & Content — I create and manage digital content from topic development and writing through publishing, structuring content around audience needs, search intent, and communication objectives." },
        { name: "SEO", icon: "fa-solid fa-magnifying-glass-chart", progress: 70,
          tooltip: "SEO — I create and publish search-focused content, then use Google Search Console and GA4 to research search behavior, monitor organic performance, and continuously improve blog content based on data." },
        { name: "Digital Product", icon: "fa-solid fa-cube", progress: 65,
          tooltip: "Digital Product — I explore and build useful digital resources, systems, templates, and product concepts around digital marketing." }
      ]
    },
    optimize: {
      title: "Optimize",
      icon: "fa-solid fa-bullseye",
      description: "Experiment and improve performance.",
      skills: [
        { name: "Creative Testing", icon: "fa-solid fa-flask", progress: 82,
          tooltip: "Creative Testing — I test creative variations, messaging, formats, and campaign approaches to identify what drives stronger engagement and conversion performance." },
        { name: "Funnel Optimization", icon: "fa-solid fa-filter", progress: 82,
          tooltip: "Funnel Optimization — I analyze user progression across the funnel to identify friction and improve conversion quality." },
        { name: "Campaign Optimization", icon: "fa-solid fa-sliders", progress: 82,
          tooltip: "Campaign Optimization — I continuously improve campaign structure, bidding, audience, budget allocation, and efficiency." },
        { name: "Performance Analysis", icon: "fa-solid fa-chart-simple", progress: 82,
          tooltip: "Performance Analysis — I use campaign and conversion data to understand what happened, why it happened, and what should be tested next." }
      ]
    }
  };

  const order = ["creative", "acquire", "measurement", "build", "optimize"];

  const escapeHTML = (str) =>
    String(str).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* The production tooltip starts with "Name — ". The name is already the row label, so show the sentence only. */
  const describe = (skill) => skill.tooltip.replace(/^[^—]+—\s*/, "");

  /* -------------------------------------------------------
     ELEMENTS
  ------------------------------------------------------- */
  const header = $("#site-header");
  const progressBar = $("#scroll-progress");
  const spot = $("#atmo-spot");
  const atmo = $(".atmo");
  const hero = $("#home");
  const heroVisual = $("#hero-visual");
  const dial = $("#dial");
  const aperture = $("#aperture");
  const nodes = $$(".dial-node");
  const tabsWrap = $("#stack-tabs");
  const tabs = $$(".stack-tab");
  const indicator = $("#tab-indicator");
  const panel = $("#stack-panel");
  const panelInner = $("#panel-inner");
  const panelIcon = $("#panel-icon");
  const panelTitle = $("#panel-title");
  const panelDesc = $("#panel-desc");
  const skillList = $("#skill-list");
  const consoleEl = $(".console");
  const profile = $("#profile");
  const homeLink = $('[data-section-link="home"]');
  const profileLink = $('[data-section-link="profile"]');
  const menuToggle = $("#menu-toggle");
  const nav = $("#primary-nav");

  let currentStack = "acquire";
  let stackSeen = false;
  let swapTimer = null;

  /* -------------------------------------------------------
     STACK CONSOLE
  ------------------------------------------------------- */
  function skillMarkup(skill, index, stackKey) {
    const id = `skill-${stackKey}-${index}`;
    const children = Array.isArray(skill.children) ? skill.children : [];
    const withBars = children.some((c) => typeof c.progress === "number");

    let childrenHTML = "";
    if (children.length) {
      childrenHTML = withBars
        ? `<ul class="subskills">${children.map((c) => `
            <li class="subskill">
              <span class="subskill-name">${escapeHTML(c.name)}</span>
              <span class="subskill-bar" role="progressbar" aria-label="${escapeHTML(c.name)}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${c.progress}"><span class="subskill-fill" style="--p:${c.progress}"></span></span>
            </li>`).join("")}</ul>`
        : `<ul class="subskills is-chips">${children.map((c) => `<li class="subskill-chip">${escapeHTML(c.name)}</li>`).join("")}</ul>`;
    }

    return `
      <div class="skill" data-index="${index}">
        <button class="skill-head" type="button" aria-expanded="false" aria-controls="${id}">
          <span class="skill-icon" aria-hidden="true"><i class="${skill.icon}"></i></span>
          <span class="skill-name">${escapeHTML(skill.name)}</span>
          <span class="skill-bar" role="progressbar" aria-label="${escapeHTML(skill.name)}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${skill.progress}"><span class="skill-fill" style="--p:${skill.progress}"></span></span>
          <span class="skill-toggle" aria-hidden="true"></span>
        </button>
        <div class="skill-body" id="${id}" aria-hidden="true">
          <div class="skill-body-inner">
            <div class="skill-body-content">
              <p class="skill-desc">${escapeHTML(describe(skill))}</p>
              ${childrenHTML}
            </div>
          </div>
        </div>
      </div>`;
  }

  function animateBars() {
    const fills = $$(".skill-fill", skillList);
    fills.forEach((fill, i) => {
      fill.classList.remove("is-visible");
      if (reduced()) { fill.classList.add("is-visible"); return; }
      window.setTimeout(() => fill.classList.add("is-visible"), 120 + i * 70);
    });
  }

  function renderStack(key) {
    const data = stackData[key];
    panelIcon.innerHTML = `<i class="${data.icon}"></i>`;
    panelTitle.textContent = data.title;
    panelDesc.textContent = data.description;
    skillList.innerHTML = data.skills.map((s, i) => skillMarkup(s, i, key)).join("");
    panel.setAttribute("aria-labelledby", `tab-${key}`);
    if (stackSeen) {
      // Two frames so the scaleX(0) state is painted before animating.
      requestAnimationFrame(() => requestAnimationFrame(animateBars));
    }
  }

  function moveIndicator() {
    const active = tabs.find((t) => t.dataset.stack === currentStack);
    if (!active || !indicator) return;
    const horizontal = getComputedStyle(tabsWrap).flexDirection === "row";
    if (horizontal) {
      indicator.style.height = "";
      indicator.style.width = `${active.offsetWidth}px`;
      indicator.style.transform = `translateX(${active.offsetLeft}px)`;
    } else {
      indicator.style.width = "";
      indicator.style.height = `${active.offsetHeight}px`;
      indicator.style.transform = `translateY(${active.offsetTop}px)`;
    }
  }

  function activateStack(key, { instant = false, focusTab = false } = {}) {
    if (!stackData[key]) return;
    const changed = key !== currentStack;
    currentStack = key;

    tabs.forEach((tab) => {
      const on = tab.dataset.stack === key;
      tab.classList.toggle("is-active", on);
      tab.setAttribute("aria-selected", String(on));
      tab.tabIndex = on ? 0 : -1;
      if (on && focusTab) tab.focus();
      if (on && getComputedStyle(tabsWrap).flexDirection === "row") {
        const left = tab.offsetLeft - 16;
        tabsWrap.scrollTo({ left, behavior: reduced() ? "auto" : "smooth" });
      }
    });

    moveIndicator();
    pointDial(key);

    if (!changed && !instant) return;

    window.clearTimeout(swapTimer);
    if (instant || reduced()) {
      renderStack(key);
      return;
    }
    panelInner.classList.add("is-swapping");
    swapTimer = window.setTimeout(() => {
      renderStack(key);
      requestAnimationFrame(() => panelInner.classList.remove("is-swapping"));
    }, 180);
  }

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => activateStack(tab.dataset.stack));
  });

  tabsWrap.addEventListener("keydown", (e) => {
    const idx = order.indexOf(currentStack);
    let next = null;
    if (e.key === "ArrowDown" || e.key === "ArrowRight") next = order[(idx + 1) % order.length];
    else if (e.key === "ArrowUp" || e.key === "ArrowLeft") next = order[(idx - 1 + order.length) % order.length];
    else if (e.key === "Home") next = order[0];
    else if (e.key === "End") next = order[order.length - 1];
    if (next) {
      e.preventDefault();
      activateStack(next, { focusTab: true });
    }
  });

  // Skill accordion (one open at a time)
  skillList.addEventListener("click", (e) => {
    const head = e.target.closest(".skill-head");
    if (!head) return;
    const item = head.closest(".skill");
    const willOpen = !item.classList.contains("is-open");

    $$(".skill.is-open", skillList).forEach((other) => {
      if (other === item) return;
      other.classList.remove("is-open");
      $(".skill-head", other).setAttribute("aria-expanded", "false");
      $(".skill-body", other).setAttribute("aria-hidden", "true");
    });

    item.classList.toggle("is-open", willOpen);
    head.setAttribute("aria-expanded", String(willOpen));
    $(".skill-body", item).setAttribute("aria-hidden", String(!willOpen));
  });

  /* -------------------------------------------------------
     STACK DIAL (hero)
  ------------------------------------------------------- */
  function pointDial(key) {
    if (!dial) return;
    const node = nodes.find((n) => n.dataset.stack === key);
    if (!node) return;
    dial.style.setProperty("--a", `${node.dataset.angle}deg`);
    nodes.forEach((n) => n.classList.toggle("is-active", n === node));
  }

  function ping(node) {
    if (reduced()) return;
    node.classList.remove("is-pinging");
    void node.offsetWidth;
    node.classList.add("is-pinging");
  }

  nodes.forEach((node) => {
    const key = node.dataset.stack;
    const label = $(".node-label", node);
    node.setAttribute("aria-label", `${label ? label.textContent : key} — view in Digital Marketing Stack`);

    const preview = () => { pointDial(key); ping(node); };
    node.addEventListener("pointerenter", () => { if (finePointer()) preview(); });
    node.addEventListener("focus", preview);
    node.addEventListener("pointerleave", () => { if (finePointer()) pointDial(currentStack); });
    node.addEventListener("blur", () => pointDial(currentStack));

    node.addEventListener("click", () => {
      // Default anchor behaviour scrolls to #stack; select the category on the way.
      activateStack(key);
    });
  });

  /* Colour lens over the monochrome portrait */
  if (aperture) {
    const setLens = (e) => {
      const r = aperture.getBoundingClientRect();
      aperture.style.setProperty("--lx", `${e.clientX - r.left}px`);
      aperture.style.setProperty("--ly", `${e.clientY - r.top}px`);
    };
    aperture.addEventListener("pointerenter", (e) => {
      if (!finePointer()) return;
      aperture.style.setProperty("--lens", `${Math.round(aperture.offsetWidth * 0.34)}px`);
      setLens(e);
      aperture.classList.add("is-lensing");
    });
    aperture.addEventListener("pointermove", (e) => { if (finePointer()) setLens(e); }, { passive: true });
    aperture.addEventListener("pointerleave", () => aperture.classList.remove("is-lensing"));
  }

  /* -------------------------------------------------------
     POINTER: grid spotlight + dial parallax (rAF batched)
  ------------------------------------------------------- */
  let pointer = null;
  let pointerQueued = false;

  function applyPointer() {
    pointerQueued = false;
    if (!pointer) return;
    const { x, y } = pointer;

    if (spot) {
      spot.style.setProperty("--mx", `${x}px`);
      spot.style.setProperty("--my", `${y}px`);
      spot.classList.add("is-visible");
    }

    if (dial && !hero.classList.contains("is-offscreen")) {
      const r = dial.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const clamp = (v) => Math.max(-1, Math.min(1, v));
      const px = clamp((x - cx) / (window.innerWidth * 0.5));
      const py = clamp((y - cy) / (window.innerHeight * 0.5));
      dial.style.setProperty("--px", px.toFixed(3));
      dial.style.setProperty("--py", py.toFixed(3));
    }
  }

  document.addEventListener("pointermove", (e) => {
    if (!finePointer() || reduced()) return;
    pointer = { x: e.clientX, y: e.clientY };
    if (!pointerQueued) {
      pointerQueued = true;
      requestAnimationFrame(applyPointer);
    }
  }, { passive: true });

  document.documentElement.addEventListener("mouseleave", () => {
    if (spot) spot.classList.remove("is-visible");
    if (dial) { dial.style.setProperty("--px", "0"); dial.style.setProperty("--py", "0"); }
  });

  /* -------------------------------------------------------
     SCROLL: progress, header, grid depth, hero hand-off, nav
  ------------------------------------------------------- */
  let scrollQueued = false;

  function applyScroll() {
    scrollQueued = false;
    const y = window.scrollY;
    const max = doc.scrollHeight - window.innerHeight;
    const p = max > 0 ? Math.min(1, y / max) : 0;

    if (progressBar) progressBar.style.transform = `scaleX(${p})`;
    if (header) header.classList.toggle("is-scrolled", y > 8);

    if (!reduced()) {
      if (atmo) atmo.style.setProperty("--grid-shift", ((y * 0.08) % 288).toFixed(1));

      // Dial drifts up slower and dims as the Stack section takes over (desktop two-column only).
      if (heroVisual && window.innerWidth > 1000) {
        const h = hero.offsetHeight || 1;
        const t = Math.min(1, Math.max(0, y / h));
        heroVisual.style.transform = t > 0 ? `translate3d(0, ${(y * 0.18).toFixed(1)}px, 0) scale(${(1 - t * 0.06).toFixed(3)})` : "";
        heroVisual.style.opacity = t > 0 ? String((1 - t * 0.85).toFixed(3)) : "";
      } else if (heroVisual) {
        heroVisual.style.transform = "";
        heroVisual.style.opacity = "";
      }
    }

    if (homeLink && profileLink && profile) {
      const inProfile = profile.getBoundingClientRect().top < window.innerHeight * 0.45;
      homeLink.classList.toggle("is-active", !inProfile);
      profileLink.classList.toggle("is-active", inProfile);
    }
  }

  const queueScroll = () => {
    if (!scrollQueued) {
      scrollQueued = true;
      requestAnimationFrame(applyScroll);
    }
  };

  window.addEventListener("scroll", queueScroll, { passive: true });
  window.addEventListener("resize", () => { queueScroll(); moveIndicator(); });
  applyScroll();

  /* -------------------------------------------------------
     OBSERVERS: reveal + pause hero motion off-screen
  ------------------------------------------------------- */
  const revealTargets = [...$$("[data-reveal]"), ...$$(".stack, .profile")];

  const onReveal = (el) => {
    el.classList.add("is-in");
    if (el === consoleEl && !stackSeen) {
      stackSeen = true;
      animateBars();
    }
  };

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          onReveal(entry.target);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    revealTargets.forEach((el) => io.observe(el));

    if (hero) {
      const heroIO = new IntersectionObserver(([entry]) => {
        hero.classList.toggle("is-offscreen", !entry.isIntersecting);
      }, { threshold: 0 });
      heroIO.observe(hero);
    }
  } else {
    revealTargets.forEach(onReveal);
  }

  /* -------------------------------------------------------
     MOBILE MENU
  ------------------------------------------------------- */
  function setMenu(open) {
    if (!menuToggle || !nav) return;
    menuToggle.setAttribute("aria-expanded", String(open));
    $(".menu-toggle-label", menuToggle).textContent = open ? "Close" : "Menu";
    nav.classList.toggle("is-open", open);
  }

  if (menuToggle && nav) {
    menuToggle.addEventListener("click", () => setMenu(menuToggle.getAttribute("aria-expanded") !== "true"));
    $$(".nav-link", nav).forEach((link) => link.addEventListener("click", () => setMenu(false)));
    document.addEventListener("click", (e) => {
      if (nav.classList.contains("is-open") && !e.target.closest("#site-header")) setMenu(false);
    });
    window.matchMedia("(min-width: 861px)").addEventListener("change", (e) => { if (e.matches) setMenu(false); });
  }

  /* -------------------------------------------------------
     MISC
  ------------------------------------------------------- */
  $$('[data-placeholder-social="true"]').forEach((link) =>
    link.addEventListener("click", (e) => e.preventDefault())
  );

  // Certifications: one open at a time
  const certs = $$(".cert");
  certs.forEach((item) => {
    item.addEventListener("toggle", () => {
      if (!item.open) return;
      certs.forEach((other) => { if (other !== item && other.open) other.open = false; });
    });
  });

  // Certificate images are served from production; show a clear note if one cannot load.
  $$(".cert-frame img").forEach((img) => {
    const markMissing = () => {
      const frame = img.closest(".cert-frame");
      if (!frame || frame.classList.contains("is-missing")) return;
      frame.classList.add("is-missing");
      frame.insertAdjacentHTML("beforeend", "<span>Certificate image could not be loaded.</span>");
    };
    img.addEventListener("error", markMissing);
    if (img.complete && img.naturalWidth === 0 && img.currentSrc) markMissing();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (nav && nav.classList.contains("is-open")) {
        setMenu(false);
        menuToggle.focus();
      }
    }
  });

  /* -------------------------------------------------------
     INIT
  ------------------------------------------------------- */
  activateStack("acquire", { instant: true });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(moveIndicator);
  window.addEventListener("load", moveIndicator);
})();
