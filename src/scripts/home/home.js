/* =========================================================
   PLAYGROUND HOME 2 — OPTION 01
   Vanilla JS only. One rAF-batched scroll loop, IntersectionObservers
   for reveals, pointer effects only on fine pointers, everything
   motion-related skipped under prefers-reduced-motion.
========================================================= */
(function () {
  "use strict";

  const root = document.documentElement;
  const body = document.body;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const motionOK = !reduceMotion;

  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
  const lerp = (from, to, t) => from + (to - from) * t;
  /* 0 → 1 as `value` travels from `start` to `end` */
  const progress = (value, start, end) => clamp((value - start) / (end - start));
  const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const escapeHTML = (str) => str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  let vw = window.innerWidth;
  let vh = window.innerHeight;

  /* =========================================================
     STACK DATA
     Copied verbatim from production /script.js (`stackData`).
     Keep this in sync with production — it is the source of truth.
  ========================================================= */
  const stackData = {
    creative: {
      title: "Creative & Brand",
      iconHTML: '<i class="fa-solid fa-pen-ruler"></i>',
      description: "Brand Guidelines & Creative Production.",
      skills: [
        {
          name: "Graphic Design",
          iconHTML: '<i class="fa-solid fa-pen-nib"></i>',
          progress: 90,
          tooltip:
            "Graphic Design — I create visual assets for digital campaigns, social content, and brand communication across multiple formats.",
          children: [
            { name: "Adobe Photoshop", progress: 90 },
            { name: "Adobe Illustrator", progress: 90 },
            { name: "Canva", progress: 82 }
          ]
        },
        {
          name: "Social Content",
          iconHTML: '<i class="fa-solid fa-hashtag"></i>',
          progress: 85,
          tooltip:
            "Social Content — I work across content ideation, planning, production, and execution for digital and social platforms, connecting creative ideas with campaign objectives."
        },
        {
          name: "Brand Identity & Guidelines",
          iconHTML: '<i class="fa-solid fa-fingerprint"></i>',
          progress: 82,
          tooltip:
            "Brand Identity & Guidelines — I develop and maintain brand identity, visual consistency, and guidelines that translate business objectives into clear and cohesive brand experiences."
        },
        {
          name: "Creative Project Management",
          iconHTML: '<i class="fa-solid fa-diagram-project"></i>',
          progress: 82,
          tooltip:
            "Creative Project Management — I coordinate creative workflows from briefing and concept development through production, stakeholder alignment, and campaign implementation."
        },
        {
          name: "Video Editing",
          iconHTML: '<i class="fa-solid fa-video"></i>',
          progress: 78,
          tooltip:
            "Video Editing — I edit digital video content for campaigns and social platforms.",
          children: [
            { name: "Adobe Premiere Pro", progress: 78 },
            { name: "CapCut", progress: 72 }
          ]
        }
      ]
    },

    acquire: {
      title: "Acquire",
      iconHTML: '<i class="fa-solid fa-chart-column"></i>',
      description: "Digital ads, acquisition, and growth channels.",
      skills: [
        {
          name: "Meta Ads",
          iconHTML: '<i class="fa-brands fa-meta"></i>',
          progress: 92,
          tooltip:
            "Meta Ads — I work extensively with app conversion campaigns, covering both Android and iOS acquisition, with a strong focus on in-app event optimization, attribution, and conversion-focused delivery.",
          children: [
            { name: "Android Campaign" },
            { name: "iOS Campaign" }
          ]
        },
        {
          name: "Google Ads",
          iconHTML: '<i class="fa-brands fa-google"></i>',
          progress: 92,
          tooltip:
            "Google Ads — I work across app acquisition and conversion-focused campaigns, using App Campaigns, Performance Max, and Search to connect paid traffic with measurable app outcomes and deeper conversion events.",
          children: [
            { name: "App Campaign" },
            { name: "Performance Max Campaign" },
            { name: "Google Search Campaign" }
          ]
        },
        {
          name: "TikTok Ads",
          iconHTML: '<i class="fa-brands fa-tiktok"></i>',
          progress: 75,
          tooltip:
            "TikTok Ads — I have hands-on experience running TikTok Ads, although it currently plays a more selective role in my acquisition mix with a smaller budget allocation compared with Meta and Google."
        },
        {
          name: "LinkedIn Ads",
          iconHTML: '<i class="fa-brands fa-linkedin-in"></i>',
          progress: 75,
          tooltip:
            "LinkedIn Ads — I use LinkedIn Ads selectively for targeted acquisition. In my current setup, web-to-app measurement and app-conversion optimization are less central than on Meta and Google, so it currently plays a more specialized role in the overall acquisition mix."
        }
      ]
    },

    measurement: {
      title: "Measurement",
      iconHTML: '<i class="fa-solid fa-chart-pie"></i>',
      description: "Tracking, analytics, and attribution.",
      skills: [
        {
          name: "Mobile Measurement Partner (MMP)",
          iconHTML: '<i class="fa-solid fa-mobile-screen-button"></i>',
          progress: 86,
          tooltip:
            "Mobile Measurement Partner (MMP) — I use Adjust as my primary MMP for mobile app conversion tracking, attribution, and in-app event measurement, particularly across acquisition journeys for Hijra Bank."
        },
        {
          name: "Google Analytics 4",
          iconHTML: '<i class="fa-solid fa-chart-line"></i>',
          progress: 80,
          tooltip:
            "Google Analytics 4 — I use GA4 to understand acquisition, website behavior, event activity, and conversion journeys."
        },
        {
          name: "Google Tag Manager",
          iconHTML: '<i class="fa-solid fa-tags"></i>',
          progress: 78,
          tooltip:
            "Google Tag Manager — I use GTM to structure and deploy website analytics and marketing tracking implementations."
        },
        {
          name: "SKAN",
          iconHTML: '<i class="fa-brands fa-apple"></i>',
          progress: 72,
          tooltip:
            "SKAN — I work with SKAdNetwork for privacy-aware iOS acquisition measurement and mobile attribution."
        }
      ]
    },

    build: {
      title: "Build",
      iconHTML: '<i class="fa-solid fa-layer-group"></i>',
      description: "Website, Blog, SEO & Content.",
      skills: [
        {
          name: "Website",
          iconHTML: '<i class="fa-solid fa-code"></i>',
          progress: 76,
          tooltip:
            "Website — I build and manage practical websites that support marketing, communication, experimentation, and digital initiatives."
        },
        {
          name: "Landing Page",
          iconHTML: '<i class="fa-regular fa-window-maximize"></i>',
          progress: 76,
          tooltip:
            "Landing Page — I design landing pages around clear messaging, user journeys, conversion goals, and measurement."
        },
        {
          name: "Blog & Content",
          iconHTML: '<i class="fa-regular fa-file-lines"></i>',
          progress: 78,
          tooltip:
            "Blog & Content — I create and manage digital content from topic development and writing through publishing, structuring content around audience needs, search intent, and communication objectives."
        },
        {
          name: "SEO",
          iconHTML: '<i class="fa-solid fa-magnifying-glass-chart"></i>',
          progress: 70,
          tooltip:
            "SEO — I create and publish search-focused content, then use Google Search Console and GA4 to research search behavior, monitor organic performance, and continuously improve blog content based on data."
        },
        {
          name: "Digital Product",
          iconHTML: '<i class="fa-solid fa-cube"></i>',
          progress: 65,
          tooltip:
            "Digital Product — I explore and build useful digital resources, systems, templates, and product concepts around digital marketing."
        }
      ]
    },

    optimize: {
      title: "Optimize",
      iconHTML: '<i class="fa-solid fa-bullseye"></i>',
      description: "Experiment and improve performance.",
      skills: [
        {
          name: "Creative Testing",
          iconHTML: '<i class="fa-solid fa-flask"></i>',
          progress: 82,
          tooltip:
            "Creative Testing — I test creative variations, messaging, formats, and campaign approaches to identify what drives stronger engagement and conversion performance."
        },
        {
          name: "Funnel Optimization",
          iconHTML: '<i class="fa-solid fa-filter"></i>',
          progress: 82,
          tooltip:
            "Funnel Optimization — I analyze user progression across the funnel to identify friction and improve conversion quality."
        },
        {
          name: "Campaign Optimization",
          iconHTML: '<i class="fa-solid fa-sliders"></i>',
          progress: 82,
          tooltip:
            "Campaign Optimization — I continuously improve campaign structure, bidding, audience, budget allocation, and efficiency."
        },
        {
          name: "Performance Analysis",
          iconHTML: '<i class="fa-solid fa-chart-simple"></i>',
          progress: 82,
          tooltip:
            "Performance Analysis — I use campaign and conversion data to understand what happened, why it happened, and what should be tested next."
        }
      ]
    }
  };

  /* =========================================================
     1. STACK — behaviour mirrors production /script.js:
        hover (or click / focus) a card → detail panel swaps,
        skills with children expand, skill names show a tooltip.
  ========================================================= */
  const stackCards = document.querySelectorAll(".stack-card");
  const detailPanel = document.getElementById("stack-detail");
  const skillsContainer = document.getElementById("stack-skills");
  const tooltip = document.getElementById("skill-tooltip");
  const canHover = window.matchMedia("(hover: hover)").matches;

  let currentStack = "acquire";
  let activationTimer = 0;
  let stackInView = false; /* bars only fill once the panel is on screen */

  function createChildrenMarkup(children) {
    if (!children || !children.length) return "";
    return `
      <div class="subskills-collapse">
        <div class="subskills-inner">
          ${children
            .map((child) =>
              typeof child.progress === "number"
                ? `<div class="subskill-row has-bar">
                    <div class="subskill-name"><span class="subskill-dot"></span><span>${escapeHTML(child.name)}</span></div>
                    <div class="subskill-bar" role="progressbar" aria-label="${escapeHTML(child.name)}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${child.progress}">
                      <span class="subskill-progress" style="--progress:${child.progress}"></span>
                    </div>
                  </div>`
                : `<div class="subskill-row no-bar">
                    <div class="subskill-name"><span class="subskill-dot"></span><span>${escapeHTML(child.name)}</span></div>
                  </div>`
            )
            .join("")}
        </div>
      </div>`;
  }

  function fillBars(scope, selector, baseDelay, step) {
    scope.querySelectorAll(selector).forEach((bar, index) => {
      bar.classList.remove("is-visible");
      requestAnimationFrame(() => {
        window.setTimeout(() => bar.classList.add("is-visible"), baseDelay + step * index);
      });
    });
  }

  function renderSkills(skills) {
    skillsContainer.innerHTML = "";
    skillsContainer.dataset.count = String(skills.length);

    skills.forEach((skill) => {
      const hasChildren = Array.isArray(skill.children) && skill.children.length > 0;
      const item = document.createElement("div");
      item.className = hasChildren ? "skill-item has-children" : "skill-item";

      const nameMarkup = hasChildren
        ? `<button type="button" class="skill-name skill-toggle" aria-expanded="false">
            <span class="platform-icon" aria-hidden="true">${skill.iconHTML}</span>
            <span class="skill-label">${escapeHTML(skill.name)}</span>
            <span class="skill-expand-icon" aria-hidden="true"><i class="fa-solid fa-chevron-down"></i></span>
          </button>`
        : `<div class="skill-name" tabindex="0">
            <span class="platform-icon" aria-hidden="true">${skill.iconHTML}</span>
            <span class="skill-label">${escapeHTML(skill.name)}</span>
          </div>`;

      item.innerHTML = `
        <div class="skill-row">
          ${nameMarkup}
          <div class="skill-bar" role="progressbar" aria-label="${escapeHTML(skill.name)}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${skill.progress}">
            <span class="skill-progress" style="--progress:${skill.progress}"></span>
          </div>
        </div>
        ${createChildrenMarkup(skill.children)}`;

      item.querySelector(".skill-name").dataset.tooltip = skill.tooltip;
      skillsContainer.appendChild(item);
    });

    if (stackInView) fillBars(skillsContainer, ".skill-progress", 0, 65);
  }

  function activateStack(stackName, instant = false) {
    const data = stackData[stackName];
    if (!data || (stackName === currentStack && !instant)) return;

    currentStack = stackName;
    stackCards.forEach((card) => {
      const active = card.dataset.stack === stackName;
      card.classList.toggle("active", active);
      card.setAttribute("aria-pressed", String(active));
    });

    hideTooltip();
    window.clearTimeout(activationTimer);

    const update = () => {
      detailPanel.querySelector(".detail-icon").innerHTML = data.iconHTML;
      detailPanel.querySelector("h3").textContent = data.title;
      detailPanel.querySelector(".stack-detail-intro p").textContent = data.description;
      renderSkills(data.skills);
      requestAnimationFrame(() => {
        detailPanel.style.opacity = "1";
        detailPanel.style.transform = "translateY(0)";
      });
    };

    if (instant) {
      update();
      return;
    }

    detailPanel.style.opacity = "0";
    detailPanel.style.transform = "translateY(7px)";
    activationTimer = window.setTimeout(update, 130);
  }

  stackCards.forEach((card) => {
    const stackName = card.dataset.stack;
    card.addEventListener("mouseenter", () => {
      if (canHover) activateStack(stackName);
    });
    card.addEventListener("click", () => activateStack(stackName));
    card.addEventListener("focus", () => activateStack(stackName));
  });

  /* Skills with children expand; on touch, tapping a plain skill toggles its tooltip */
  skillsContainer.addEventListener("click", (event) => {
    const toggle = event.target.closest(".skill-toggle");
    if (toggle) {
      hideTooltip();
      const item = toggle.closest(".skill-item");
      const expanded = item.classList.toggle("expanded");
      toggle.setAttribute("aria-expanded", String(expanded));
      if (expanded) fillBars(item, ".subskill-progress", 90, 70);
      return;
    }

    const name = event.target.closest(".skill-name");
    if (name && !canHover) {
      if (tooltip.classList.contains("visible") && tooltip.dataset.owner === name.dataset.tooltip) {
        hideTooltip();
      } else {
        const rect = name.getBoundingClientRect();
        showTooltip(name, rect.left, rect.bottom);
      }
    }
  });

  /* ---- Tooltip ---- */
  function showTooltip(element, x, y) {
    const text = element.dataset.tooltip;
    if (!text) return;
    tooltip.textContent = text;
    tooltip.dataset.owner = text;
    tooltip.classList.add("visible");
    positionTooltip(x, y);
  }

  function positionTooltip(pointerX, pointerY) {
    const gap = 18;
    const width = tooltip.offsetWidth;
    const height = tooltip.offsetHeight;
    let x = pointerX + gap;
    let y = pointerY + gap;
    if (x + width > window.innerWidth - 18) x = pointerX - width - gap;
    if (y + height > window.innerHeight - 18) y = pointerY - height - gap;
    tooltip.style.left = `${Math.max(18, x)}px`;
    tooltip.style.top = `${Math.max(18, y)}px`;
  }

  function hideTooltip() {
    tooltip.classList.remove("visible");
  }

  if (canHover) {
    skillsContainer.addEventListener("mouseover", (event) => {
      const name = event.target.closest(".skill-name");
      if (name && !name.contains(event.relatedTarget)) showTooltip(name, event.clientX, event.clientY);
    });
    skillsContainer.addEventListener("mousemove", (event) => {
      if (tooltip.classList.contains("visible") && event.target.closest(".skill-name")) {
        positionTooltip(event.clientX, event.clientY);
      }
    });
    skillsContainer.addEventListener("mouseout", (event) => {
      const name = event.target.closest(".skill-name");
      if (name && !name.contains(event.relatedTarget)) hideTooltip();
    });
    skillsContainer.addEventListener("focusin", (event) => {
      const name = event.target.closest(".skill-name");
      if (!name) return;
      const rect = name.getBoundingClientRect();
      showTooltip(name, rect.right, rect.top + rect.height / 2);
    });
    skillsContainer.addEventListener("focusout", hideTooltip);
  }

  window.addEventListener("scroll", hideTooltip, { passive: true });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") hideTooltip();
  });

  stackCards.forEach((card) => card.setAttribute("aria-pressed", String(card.dataset.stack === currentStack)));
  activateStack(currentStack, true);

  /* Fill the bars the first time the panel scrolls into view */
  if ("IntersectionObserver" in window) {
    const stackIO = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        stackInView = true;
        fillBars(skillsContainer, ".skill-progress", 0, 65);
        stackIO.disconnect();
      },
      { threshold: 0.25 }
    );
    stackIO.observe(detailPanel);
  } else {
    stackInView = true;
    fillBars(skillsContainer, ".skill-progress", 0, 65);
  }

  /* =========================================================
     2. INTRO — curtain lifts once fonts are ready (max ~1s)
  ========================================================= */
  const curtain = document.querySelector(".intro-curtain");

  function revealPage() {
    root.classList.add("is-ready");
    window.setTimeout(() => window.dispatchEvent(new Event("scroll")), 0); /* show the floating CTA */
    if (curtain) window.setTimeout(() => curtain.remove(), 1400);
  }

  if (!motionOK) {
    revealPage();
  } else {
    const wait = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));
    const fonts = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    Promise.all([Promise.race([fonts, wait(1000)]), wait(450)]).then(() => requestAnimationFrame(revealPage));
  }

  /* =========================================================
     3. REVEALS — IntersectionObserver, staggered per batch
  ========================================================= */
  const revealEls = document.querySelectorAll("[data-reveal]");

  if (!motionOK || !("IntersectionObserver" in window)) {
    revealEls.forEach((el) => el.classList.add("is-in"));
  } else {
    const revealIO = new IntersectionObserver(
      (entries) => {
        let batch = 0;
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.style.setProperty("--reveal-delay", `${Math.min(batch, 6) * 0.08}s`);
          entry.target.classList.add("is-in");
          revealIO.unobserve(entry.target);
          batch += 1;
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
    );
    revealEls.forEach((el) => revealIO.observe(el));
  }

  /* =========================================================
     4. SCROLL SCENES — one passive listener → one rAF.
     All layout reads happen first, then all writes.
  ========================================================= */
  const header = document.querySelector(".site-header");
  const main = document.querySelector("main");
  const footer = document.querySelector(".site-footer");
  const themedSections = Array.from(main.querySelectorAll("section[data-theme]"));

  const hero = document.querySelector(".hero");
  const heroInner = document.querySelector(".hero-inner");
  const heroLines = Array.from(document.querySelectorAll(".hero-line"));
  const heroLineDrift = [-0.06, 0.09, -0.035, 0.05]; /* fraction of viewport width, per line */

  const showreel = document.querySelector(".showreel");
  const showreelFrame = document.querySelector(".showreel-frame");
  const showreelMedia = document.querySelector(".showreel-media");

  const floatingCta = document.querySelector(".floating-cta");

  const collab = document.querySelector(".collab");
  const collabFill = document.querySelector(".collab-fill");
  const wordmark = document.querySelector(".footer-wordmark");

  let lastScrollY = window.scrollY;
  let scrollVelocity = 0;
  let ticking = false;
  let heroHeight = hero.offsetHeight;

  function onScrollFrame() {
    ticking = false;
    const y = window.scrollY;
    const isMobile = vw < 768;
    scrollVelocity = y - lastScrollY;

    /* ---- READ ---- */
    const showreelRect = showreel.getBoundingClientRect();
    const collabRect = collab.getBoundingClientRect();
    const mainBottom = main.getBoundingClientRect().bottom;
    const footerHeight = footer.offsetHeight;
    const centre = vh / 2;
    const headerLine = 30;
    /* once the footer is uncovering, keep the last section's theme on main */
    let centreTheme = mainBottom < vh / 2 ? themedSections[themedSections.length - 1].dataset.theme : body.dataset.theme;
    let headerSection = null;
    for (const section of themedSections) {
      const r = section.getBoundingClientRect();
      if (r.top <= centre && r.bottom > centre) centreTheme = section.dataset.theme;
      if (r.top <= headerLine && r.bottom > headerLine) headerSection = section;
    }
    const docMax = document.documentElement.scrollHeight - vh;

    /* ---- WRITE ---- */

    /* Theme follows whichever section owns the middle of the screen */
    if (body.dataset.theme !== centreTheme) body.dataset.theme = centreTheme;

    /* Header tone follows what is actually under it */
    let tone = centreTheme;
    if (!headerSection) tone = "footer";
    else if (headerSection === collab) tone = "red";
    if (header.dataset.tone !== tone) header.dataset.tone = tone;

    /* Hide header on scroll down, show on scroll up */
    if (!body.classList.contains("menu-open")) {
      if (scrollVelocity > 4 && y > vh * 0.4) header.classList.add("is-hidden");
      else if (scrollVelocity < -4 || y < vh * 0.4) header.classList.remove("is-hidden");
    }

    header.style.setProperty("--progress", docMax > 0 ? (y / docMax).toFixed(4) : "0");

    /* Floating Collaborate CTA: always there, except while the Collaborate section
       fills the screen or the footer (which has its own Products link) is uncovered */
    const collabOnScreen = collabRect.top < vh * 0.6 && collabRect.bottom > vh * 0.4;
    const footerOpen = mainBottom < vh * 0.55;
    floatingCta.classList.toggle("is-shown", root.classList.contains("is-ready") && !collabOnScreen && !footerOpen);

    if (motionOK) {
      /* HERO — lines drift apart at different velocities, block lifts away */
      if (y < heroHeight * 1.2) {
        const h = clamp(y / heroHeight);
        if (!isMobile) {
          heroLines.forEach((line, i) => {
            line.style.transform = `translate3d(${(heroLineDrift[i] * vw * h).toFixed(1)}px,0,0)`;
          });
        }
        heroInner.style.transform = `translate3d(0,${(h * vh * 0.14).toFixed(1)}px,0) scale(${(1 - h * 0.05).toFixed(4)})`;
        heroInner.style.opacity = (1 - h * 0.75).toFixed(3);
      }

      /* SHOWREEL — inset rounded window → full-bleed while the section rises */
      const open = easeInOut(clamp(1 - showreelRect.top / vh));
      const insetY = (1 - open) * (isMobile ? 9 : 13);
      const insetX = (1 - open) * (isMobile ? 4 : 11);
      const radius = (1 - open) * (isMobile ? 22 : 44);
      showreelFrame.style.clipPath = `inset(${insetY.toFixed(2)}% ${insetX.toFixed(2)}% ${insetY.toFixed(2)}% ${insetX.toFixed(2)}% round ${radius.toFixed(1)}px)`;
      showreelMedia.style.transform = `scale(${(1.16 - 0.16 * open).toFixed(4)})`;
      showreel.classList.toggle("is-open", showreelRect.top < vh * 0.04);

      /* COLLABORATE — red field grows from the centre */
      const c = progress(collabRect.top, vh, vh * 0.1);
      collabFill.style.clipPath = `circle(${(easeInOut(c) * 75).toFixed(2)}% at 50% 50%)`;
      if (c > 0.55) collab.classList.add("is-in");

      /* FOOTER — wordmark rises as the page lifts away */
      const f = progress(mainBottom, vh, vh - footerHeight);
      wordmark.style.setProperty("--wordmark-y", `${((1 - f) * 45).toFixed(1)}%`);
    }

    lastScrollY = y;
  }

  function requestScrollFrame() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(onScrollFrame);
    }
  }

  window.addEventListener("scroll", requestScrollFrame, { passive: true });

  /* Footer curtain only when it fits in the viewport */
  function checkFooter() {
    footer.classList.toggle("is-static", footer.offsetHeight > vh - 20);
  }

  let resizeTimer = 0;
  window.addEventListener("resize", () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      vw = window.innerWidth;
      vh = window.innerHeight;
      heroHeight = hero.offsetHeight;
      if (vw >= 768) heroLines.forEach((line) => (line.style.transform = ""));
      else heroLines.forEach((line) => (line.style.transform = "none"));
      checkFooter();
      if (vw >= 1024 && body.classList.contains("menu-open")) closeMenu(false);
      requestScrollFrame();
    }, 120);
  });

  if (!motionOK) {
    showreel.classList.add("is-open");
    collab.classList.add("is-in");
  }

  checkFooter();
  onScrollFrame();

  /* =========================================================
     5. MARQUEE — continuous drift, boosted + reversed by scroll,
        and draggable: grab it to scrub, release to fling.
        (rAF only runs while the band is on screen)
  ========================================================= */
  const marquee = document.querySelector(".marquee");
  const marqueeTrack = document.querySelector(".marquee-track");

  if (marquee && "IntersectionObserver" in window) {
    const autoSpeed = motionOK ? 0.045 : 0; /* px per ms; no auto drift for reduced motion */
    let onScreen = false;
    let looping = false;
    let x = 0;
    let direction = -1;
    let boost = 0;
    let fling = 0; /* px per frame left over from a drag release */
    let last = 0;
    let dragging = false;
    let dragX = 0;
    let dragVelocity = 0;

    const wrap = () => {
      const half = marqueeTrack.scrollWidth / 2;
      if (x <= -half) x += half;
      if (x > 0) x -= half;
    };

    const step = (now) => {
      if (!onScreen) {
        looping = false;
        return;
      }
      const dt = Math.min(48, now - (last || now));
      last = now;

      if (!dragging) {
        if (motionOK && Math.abs(scrollVelocity) > 0.5) direction = scrollVelocity > 0 ? -1 : 1;
        boost = motionOK ? lerp(boost, Math.min(Math.abs(scrollVelocity) * 0.6, 24), 0.08) : 0;
        x += direction * (autoSpeed * dt + boost * dt * 0.05) + fling;
        fling *= 0.94;
        if (Math.abs(fling) < 0.05) fling = 0;
      }
      scrollVelocity *= 0.9;

      wrap();
      marqueeTrack.style.transform = `translate3d(${x.toFixed(2)}px,0,0)`;
      requestAnimationFrame(step);
    };

    const startLoop = () => {
      if (looping) return;
      looping = true;
      last = 0;
      requestAnimationFrame(step);
    };

    new IntersectionObserver((entries) => {
      onScreen = entries[0].isIntersecting;
      if (onScreen) startLoop();
    }).observe(marquee);

    /* ---- Drag to scrub ---- */
    marquee.addEventListener("pointerdown", (event) => {
      if (event.button !== 0) return;
      dragging = true;
      dragX = event.clientX;
      dragVelocity = 0;
      fling = 0;
      marquee.setPointerCapture(event.pointerId);
      marquee.classList.add("is-dragging");
      startLoop();
    });

    marquee.addEventListener("pointermove", (event) => {
      if (!dragging) return;
      const dx = event.clientX - dragX;
      dragX = event.clientX;
      x += dx;
      dragVelocity = dx;
    });

    const endDrag = () => {
      if (!dragging) return;
      dragging = false;
      marquee.classList.remove("is-dragging");
      fling = clamp(dragVelocity, -60, 60);
      /* keep drifting the way it was thrown */
      if (Math.abs(dragVelocity) > 0.5) direction = dragVelocity > 0 ? 1 : -1;
    };

    marquee.addEventListener("pointerup", endDrag);
    marquee.addEventListener("pointercancel", endDrag);
    marquee.addEventListener("lostpointercapture", endDrag);
  }

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
      const strength = el.classList.contains("nav-link") ? 0.22 : 0.32;
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

    /* ---- Hero: cursor-lit grid, trailing glow, depth parallax ---- */
    const depthEls = Array.from(hero.querySelectorAll("[data-depth]"));
    const glow = { x: vw * 0.7, y: vh * 0.3, tx: vw * 0.7, ty: vh * 0.3 };
    const grid = { x: -400, y: -400, tx: -400, ty: -400 };
    let heroRunning = false;

    const heroLoop = () => {
      glow.x = lerp(glow.x, glow.tx, 0.05);
      glow.y = lerp(glow.y, glow.ty, 0.05);
      grid.x = lerp(grid.x, grid.tx, 0.18);
      grid.y = lerp(grid.y, grid.ty, 0.18);
      hero.style.setProperty("--gx", `${grid.x.toFixed(1)}px`);
      hero.style.setProperty("--gy", `${grid.y.toFixed(1)}px`);
      hero.style.setProperty("--glow-x", `${glow.x.toFixed(1)}px`);
      hero.style.setProperty("--glow-y", `${glow.y.toFixed(1)}px`);

      /* depth parallax only where the intro floats beside the headline (desktop);
         clamped so a stale pointer position after a resize can't push it off */
      const nx = clamp(glow.x / vw) - 0.5;
      const ny = clamp(glow.y / vh) - 0.5;
      depthEls.forEach((el) => {
        const depth = vw >= 1024 ? Number(el.dataset.depth) : 0;
        el.style.translate = `${(nx * depth * 2).toFixed(2)}px ${(ny * depth * 2).toFixed(2)}px`;
      });

      if (Math.abs(glow.tx - glow.x) > 0.5 || Math.abs(glow.ty - glow.y) > 0.5) requestAnimationFrame(heroLoop);
      else heroRunning = false;
    };

    hero.addEventListener("pointermove", (event) => {
      const r = hero.getBoundingClientRect();
      glow.tx = event.clientX;
      glow.ty = event.clientY;
      grid.tx = event.clientX - r.left;
      grid.ty = event.clientY - r.top;
      if (!heroRunning) {
        heroRunning = true;
        requestAnimationFrame(heroLoop);
      }
    });

    hero.addEventListener("pointerleave", () => {
      grid.tx = grid.ty = -400;
    });

    /* ---- Portrait: subtle 3D tilt toward the cursor ---- */
    const aboutVisual = document.querySelector(".about-visual");
    const portraitFrame = document.querySelector(".portrait-frame");
    aboutVisual.addEventListener("pointermove", (event) => {
      const r = aboutVisual.getBoundingClientRect();
      const nx = (event.clientX - r.left) / r.width - 0.5;
      const ny = (event.clientY - r.top) / r.height - 0.5;
      portraitFrame.style.setProperty("--tilt-y", `${(nx * 10).toFixed(2)}deg`);
      portraitFrame.style.setProperty("--tilt-x", `${(-ny * 10).toFixed(2)}deg`);
    });
    aboutVisual.addEventListener("pointerleave", () => {
      portraitFrame.style.setProperty("--tilt-x", "0deg");
      portraitFrame.style.setProperty("--tilt-y", "0deg");
    });

    /* ---- Certifications: floating preview trails the cursor ---- */
    const certList = document.querySelector(".cert-list");
    const preview = document.querySelector(".cert-preview");
    const previewImg = preview.querySelector("img");
    const pos = { x: 0, y: 0, tx: 0, ty: 0 };
    let previewRunning = false;
    let currentCert = null;

    const previewLoop = () => {
      pos.x = lerp(pos.x, pos.tx, 0.16);
      pos.y = lerp(pos.y, pos.ty, 0.16);
      const tilt = clamp((pos.tx - pos.x) * 0.04, -8, 8);
      preview.style.transform = `translate3d(${pos.x.toFixed(1)}px,${pos.y.toFixed(1)}px,0) rotate(${tilt.toFixed(2)}deg)`;
      if (preview.classList.contains("is-visible") || Math.abs(pos.tx - pos.x) > 0.5) requestAnimationFrame(previewLoop);
      else previewRunning = false;
    };

    const syncPreview = () => {
      const show = Boolean(currentCert) && !currentCert.open;
      preview.classList.toggle("is-visible", show);
      if (show && !previewRunning) {
        previewRunning = true;
        requestAnimationFrame(previewLoop);
      }
    };

    certList.addEventListener("pointermove", (event) => {
      const width = preview.offsetWidth || 240;
      const height = preview.offsetHeight || 180;
      const toLeft = event.clientX + width + 40 > vw;
      pos.tx = toLeft ? event.clientX - width - 28 : event.clientX + 28;
      pos.ty = clamp(event.clientY - height / 2, 16, vh - height - 16);
      if (!previewRunning && !preview.classList.contains("is-visible")) {
        pos.x = pos.tx;
        pos.y = pos.ty;
      }
      const cert = event.target.closest(".cert");
      if (cert !== currentCert) {
        currentCert = cert;
        if (cert && previewImg.getAttribute("src") !== cert.dataset.preview) previewImg.src = cert.dataset.preview;
      }
      syncPreview();
    });

    certList.addEventListener("pointerleave", () => {
      currentCert = null;
      syncPreview();
    });

    certList.addEventListener("toggle", syncPreview, true);
    document.querySelectorAll(".cert-row").forEach((row) => (row.dataset.cursor = "View"));
  }

  /* =========================================================
     7b. HERO DRIFT (touch devices) — with no cursor to follow, the lit grid
         and the glow wander slowly on their own while the hero is on screen
  ========================================================= */
  if (!finePointer && motionOK && "IntersectionObserver" in window) {
    let drifting = false;
    let w = hero.offsetWidth;
    let h = hero.offsetHeight;

    const drift = (now) => {
      if (!drifting) return;
      const t = now / 1000;
      /* two slow Lissajous paths: the spotlight leads, the glow trails behind it */
      const gx = w * (0.5 + 0.38 * Math.sin(t * 0.55));
      const gy = h * (0.42 + 0.28 * Math.sin(t * 0.83 + 1));
      const lx = w * (0.5 + 0.32 * Math.sin(t * 0.55 - 0.9));
      const ly = h * (0.45 + 0.22 * Math.sin(t * 0.83 + 0.1));
      hero.style.setProperty("--gx", `${gx.toFixed(1)}px`);
      hero.style.setProperty("--gy", `${gy.toFixed(1)}px`);
      hero.style.setProperty("--glow-x", `${lx.toFixed(1)}px`);
      hero.style.setProperty("--glow-y", `${ly.toFixed(1)}px`);
      requestAnimationFrame(drift);
    };

    new IntersectionObserver((entries) => {
      const entry = entries[0];
      w = entry.boundingClientRect.width;
      h = entry.boundingClientRect.height;
      const wasDrifting = drifting;
      drifting = entry.isIntersecting;
      if (drifting && !wasDrifting) requestAnimationFrame(drift);
    }).observe(hero);
  }

  /* =========================================================
     8. MOBILE MENU
  ========================================================= */
  const menuToggle = document.querySelector(".menu-toggle");
  const menu = document.getElementById("mobile-menu");
  const menuLabel = menuToggle.querySelector(".menu-toggle-label");

  function openMenu() {
    menu.hidden = false;
    void menu.offsetHeight; /* commit display before animating clip-path */
    menu.classList.add("is-open");
    menuToggle.setAttribute("aria-expanded", "true");
    menuLabel.textContent = "Close";
    body.classList.add("menu-open");
    body.style.overflow = "hidden";
    header.classList.remove("is-hidden");
    menu.querySelector("a").focus();
    document.addEventListener("keydown", onMenuKey);
  }

  function closeMenu(returnFocus = true) {
    menu.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuLabel.textContent = "Menu";
    body.classList.remove("menu-open");
    body.style.overflow = "";
    document.removeEventListener("keydown", onMenuKey);
    window.setTimeout(() => {
      if (!menu.classList.contains("is-open")) menu.hidden = true;
    }, motionOK ? 700 : 0);
    if (returnFocus) menuToggle.focus();
  }

  /* Escape closes; Tab stays inside toggle + menu links */
  function onMenuKey(event) {
    if (event.key === "Escape") {
      closeMenu();
      return;
    }
    if (event.key !== "Tab") return;
    const focusables = [menuToggle, ...menu.querySelectorAll("a")];
    const index = focusables.indexOf(document.activeElement);
    const next = event.shiftKey ? index - 1 : index + 1;
    if (next < 0 || next >= focusables.length) {
      event.preventDefault();
      focusables[(next + focusables.length) % focusables.length].focus();
    }
  }

  menuToggle.addEventListener("click", () => {
    if (menuToggle.getAttribute("aria-expanded") === "true") closeMenu();
    else openMenu();
  });

  menu.addEventListener("click", (event) => {
    if (event.target.closest("a")) closeMenu(false);
  });

})();
