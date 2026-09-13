document.addEventListener("DOMContentLoaded", () => {

  const body = document.body;
  const reducedMotion =
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* CURSOR GRID SPOTLIGHT */
  const cursorGrid =
    document.querySelector("#cursor-grid-light");

  if (
    cursorGrid &&
    window.matchMedia("(pointer: fine)").matches &&
    !reducedMotion
  ) {
    document.addEventListener(
      "pointermove",
      (event) => {
        cursorGrid.style.setProperty("--mouse-x", `${event.clientX}px`);
        cursorGrid.style.setProperty("--mouse-y", `${event.clientY}px`);
        cursorGrid.classList.add("visible");
      },
      { passive: true }
    );

    document.addEventListener(
      "mouseleave",
      () => cursorGrid.classList.remove("visible")
    );
  }

  /* SCROLL PROGRESS */
  const scrollProgress =
    document.querySelector("#scroll-progress");

  function updateScrollProgress() {
    if (!scrollProgress) return;

    const max =
      document.documentElement.scrollHeight -
      window.innerHeight;

    const progress =
      max > 0
        ? Math.min(1, window.scrollY / max)
        : 0;

    scrollProgress.style.transform =
      `scaleX(${progress})`;
  }

  window.addEventListener("scroll", updateScrollProgress, { passive: true });
  window.addEventListener("resize", updateScrollProgress);
  updateScrollProgress();

  /* SCROLL REVEAL */
  const revealSections =
    document.querySelectorAll(".section-reveal");

  if (
    revealSections.length &&
    "IntersectionObserver" in window &&
    !reducedMotion
  ) {
    const observer =
      new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.10 }
      );

    revealSections.forEach(
      (section) => observer.observe(section)
    );
  } else {
    revealSections.forEach(
      (section) => section.classList.add("is-visible")
    );
  }

  /* PLACEHOLDER SOCIAL LINKS */
  document
    .querySelectorAll('[data-placeholder-social="true"]')
    .forEach((link) => {
      link.addEventListener(
        "click",
        (event) => event.preventDefault()
      );
    });

  /* HOME STACK DATA */
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

  const cards =
    document.querySelectorAll(".stack-card");

  const detailPanel =
    document.querySelector("#stack-detail");

  const skillsContainer =
    document.querySelector("#stack-skills");

  const tooltip =
    document.querySelector("#skill-tooltip");

  let currentStack = "acquire";
  let activationTimer = null;

  function createChildrenMarkup(children) {
    if (!children || !children.length) {
      return "";
    }

    return `
      <div class="subskills-collapse">
        <div class="subskills-inner">
          ${children.map((child) => {
            if (typeof child.progress === "number") {
              return `
                <div class="subskill-row has-bar">
                  <div class="subskill-name">
                    <span class="subskill-dot"></span>
                    <span>${child.name}</span>
                  </div>
                  <div class="subskill-bar">
                    <span class="subskill-progress" style="--progress:${child.progress}"></span>
                  </div>
                </div>
              `;
            }

            return `
              <div class="subskill-row no-bar">
                <div class="subskill-name">
                  <span class="subskill-dot"></span>
                  <span>${child.name}</span>
                </div>
              </div>
            `;
          }).join("")}
        </div>
      </div>
    `;
  }

  function renderSkills(skills) {
    if (!skillsContainer) return;

    skillsContainer.innerHTML = "";
    skillsContainer.dataset.count = String(skills.length);

    skills.forEach((skill, index) => {
      const hasChildren =
        Array.isArray(skill.children) &&
        skill.children.length > 0;

      const item =
        document.createElement("div");

      item.className =
        hasChildren
          ? "skill-item has-children"
          : "skill-item";

      const nameMarkup =
        hasChildren
          ? `
            <button type="button" class="skill-name skill-toggle" aria-expanded="false">
              <span class="platform-icon" aria-hidden="true">${skill.iconHTML}</span>
              <span class="skill-label">${skill.name}</span>
              <span class="skill-expand-icon" aria-hidden="true"><i class="fa-solid fa-chevron-down"></i></span>
            </button>
          `
          : `
            <div class="skill-name" tabindex="0">
              <span class="platform-icon" aria-hidden="true">${skill.iconHTML}</span>
              <span class="skill-label">${skill.name}</span>
            </div>
          `;

      item.innerHTML = `
        <div class="skill-row">
          ${nameMarkup}
          <div class="skill-bar" role="progressbar" aria-label="${skill.name}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${skill.progress}">
            <span class="skill-progress" style="--progress:${skill.progress}"></span>
          </div>
        </div>
        ${createChildrenMarkup(skill.children)}
      `;

      skillsContainer.appendChild(item);

      const skillName =
        item.querySelector(".skill-name");

      skillName.dataset.tooltip =
        skill.tooltip;

      const progress =
        item.querySelector(".skill-progress");

      requestAnimationFrame(() => {
        window.setTimeout(() => {
          progress.classList.add("is-visible");
        }, 65 * index);
      });
    });

    bindExpandableSkills();
    bindTooltips();
  }

  function bindExpandableSkills() {
    if (!skillsContainer) return;

    skillsContainer
      .querySelectorAll(".skill-toggle")
      .forEach((toggle) => {
        toggle.addEventListener(
          "click",
          (event) => {
            event.stopPropagation();
            hideTooltip();

            const item =
              toggle.closest(".skill-item");

            const isExpanded =
              item.classList.toggle("expanded");

            toggle.setAttribute(
              "aria-expanded",
              String(isExpanded)
            );

            if (isExpanded) {
              item
                .querySelectorAll(".subskill-progress")
                .forEach((bar, index) => {
                  bar.classList.remove("is-visible");

                  requestAnimationFrame(() => {
                    window.setTimeout(() => {
                      bar.classList.add("is-visible");
                    }, 90 + index * 70);
                  });
                });
            }
          }
        );
      });
  }

  function activateStack(
    stackName,
    instant = false
  ) {
    if (!detailPanel) return;

    const data =
      stackData[stackName];

    if (!data) return;

    if (
      stackName === currentStack &&
      !instant
    ) {
      return;
    }

    currentStack = stackName;

    cards.forEach((card) => {
      const active =
        card.dataset.stack === stackName;

      card.classList.toggle("active", active);
      card.setAttribute("aria-pressed", String(active));
    });

    hideTooltip();
    clearTimeout(activationTimer);

    const update = () => {
      const icon =
        detailPanel.querySelector(".detail-icon");

      const title =
        detailPanel.querySelector("h3");

      const description =
        detailPanel.querySelector(".stack-detail-intro p");

      icon.innerHTML = data.iconHTML;
      title.textContent = data.title;
      description.textContent = data.description;

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

    activationTimer =
      window.setTimeout(update, 130);
  }

  cards.forEach((card) => {
    const stackName =
      card.dataset.stack;

    card.addEventListener(
      "mouseenter",
      () => {
        if (
          window.matchMedia("(hover: hover)").matches
        ) {
          activateStack(stackName);
        }
      }
    );

    card.addEventListener(
      "click",
      () => activateStack(stackName)
    );

    card.addEventListener(
      "focus",
      () => activateStack(stackName)
    );
  });

  /* TOOLTIP */
  function bindTooltips() {
    if (!skillsContainer || !tooltip) return;

    skillsContainer
      .querySelectorAll(".skill-name")
      .forEach((name) => {
        name.addEventListener(
          "mouseenter",
          (event) => {
            if (
              !window.matchMedia("(hover: hover)").matches
            ) {
              return;
            }

            showTooltip(
              name,
              event.clientX,
              event.clientY
            );
          }
        );

        name.addEventListener(
          "mousemove",
          (event) => {
            if (
              tooltip.classList.contains("visible")
            ) {
              positionTooltip(
                event.clientX,
                event.clientY
              );
            }
          }
        );

        name.addEventListener(
          "mouseleave",
          hideTooltip
        );

        name.addEventListener(
          "focus",
          () => {
            if (
              !window.matchMedia("(hover: hover)").matches
            ) {
              return;
            }

            const rect =
              name.getBoundingClientRect();

            showTooltip(
              name,
              rect.right,
              rect.top + rect.height / 2
            );
          }
        );

        name.addEventListener(
          "blur",
          hideTooltip
        );
      });
  }

  function showTooltip(
    element,
    x,
    y
  ) {
    if (!tooltip) return;

    const text =
      element.dataset.tooltip;

    if (!text) return;

    tooltip.textContent = text;
    tooltip.classList.add("visible");
    positionTooltip(x, y);
  }

  function positionTooltip(
    pointerX,
    pointerY
  ) {
    if (!tooltip) return;

    const gap = 18;
    const width = tooltip.offsetWidth;
    const height = tooltip.offsetHeight;

    let x =
      pointerX + gap;

    let y =
      pointerY + gap;

    if (
      x + width >
      window.innerWidth - 18
    ) {
      x =
        pointerX -
        width -
        gap;
    }

    if (
      y + height >
      window.innerHeight - 18
    ) {
      y =
        pointerY -
        height -
        gap;
    }

    tooltip.style.left =
      `${Math.max(18, x)}px`;

    tooltip.style.top =
      `${Math.max(18, y)}px`;
  }

  function hideTooltip() {
    if (!tooltip) return;
    tooltip.classList.remove("visible");
  }

  window.addEventListener(
    "scroll",
    hideTooltip,
    { passive: true }
  );

  window.addEventListener(
    "resize",
    hideTooltip
  );

  /* PORTRAIT TILT */
  const tiltZone =
    document.querySelector("[data-tilt-zone]");

  const tiltCard =
    document.querySelector("[data-tilt-card]");

  if (
    tiltZone &&
    tiltCard &&
    !reducedMotion
  ) {
    document.addEventListener(
      "pointermove",
      (event) => {
        if (window.innerWidth < 900) {
          return;
        }

        const bounds =
          tiltZone.getBoundingClientRect();

        const outside =
          event.clientX < bounds.left - 120 ||
          event.clientX > bounds.right + 120 ||
          event.clientY < bounds.top - 120 ||
          event.clientY > bounds.bottom + 120;

        if (outside) {
          tiltCard.style.transform = "";
          return;
        }

        const x =
          (event.clientX - bounds.left) /
          bounds.width -
          0.5;

        const y =
          (event.clientY - bounds.top) /
          bounds.height -
          0.5;

        tiltCard.style.transform =
          `translate3d(${x * 8}px, ${y * 8}px, 0)
           rotateX(${-y * 4.5}deg)
           rotateY(${x * 4.5}deg)`;
      },
      { passive: true }
    );
  }

  /* CERTIFICATION ACCORDION */
  const certificationItems =
    document.querySelectorAll(".certification-item");

  certificationItems.forEach((item) => {
    item.addEventListener(
      "toggle",
      () => {
        if (!item.open) return;

        certificationItems.forEach(
          (otherItem) => {
            if (
              otherItem !== item &&
              otherItem.open
            ) {
              otherItem.open = false;
            }
          }
        );
      }
    );
  });

  /* HOME / PROFILE ACTIVE NAV */
  if (
    body.dataset.page === "home"
  ) {
    const homeLink =
      document.querySelector('[data-section-link="home"]');

    const profileLink =
      document.querySelector('[data-section-link="profile"]');

    const profileSection =
      document.querySelector("#profile");

    if (
      homeLink &&
      profileLink &&
      profileSection &&
      "IntersectionObserver" in window
    ) {
      const navObserver =
        new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                profileLink.classList.add("active");
                homeLink.classList.remove("active");
              } else {
                profileLink.classList.remove("active");
                homeLink.classList.add("active");
              }
            });
          },
          { threshold: 0.28 }
        );

      navObserver.observe(profileSection);
    }
  }

  /* INITIAL HOME STACK */
  if (
    cards.length &&
    detailPanel &&
    skillsContainer
  ) {
    cards.forEach((card) => {
      card.setAttribute(
        "aria-pressed",
        card.dataset.stack === currentStack
          ? "true"
          : "false"
      );
    });

    activateStack("acquire", true);
  }

  document.addEventListener(
    "keydown",
    (event) => {
      if (event.key === "Escape") {
        hideTooltip();
      }
    }
  );
});


/* =========================================================
   BILINGUAL FRAMEWORK ARTICLE
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const languageButtons =
    document.querySelectorAll(".language-btn[data-language]");

  const languageBlocks =
    document.querySelectorAll("[data-copy-lang]");

  if (!languageButtons.length || !languageBlocks.length) {
    return;
  }

  function setArticleLanguage(language) {
    const selected =
      language === "en"
        ? "en"
        : "id";

    document.documentElement.lang =
      selected;

    languageBlocks.forEach((block) => {
      block.hidden =
        block.dataset.copyLang !== selected;
    });

    languageButtons.forEach((button) => {
      const active =
        button.dataset.language === selected;

      button.classList.toggle(
        "active",
        active
      );

      button.setAttribute(
        "aria-pressed",
        String(active)
      );
    });
  }

  languageButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setArticleLanguage(
        button.dataset.language
      );
    });
  });

  /* Indonesian is intentionally the default language. */
  setArticleLanguage("id");
});


/* =========================================================
   FRAMEWORK ARTICLE — LIGHT / DARK MODE
   First visit: Light
   Later visits: remember the user's last manual choice.
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const themeButtons =
    document.querySelectorAll(".theme-btn[data-theme]");

  if (!themeButtons.length) {
    return;
  }

  const root =
    document.documentElement;

  function applyArticleTheme(theme, persist = true) {
    const selected =
      theme === "dark"
        ? "dark"
        : "light";

    root.dataset.articleTheme =
      selected;

    themeButtons.forEach((button) => {
      const active =
        button.dataset.theme === selected;

      button.classList.toggle(
        "active",
        active
      );

      button.setAttribute(
        "aria-pressed",
        String(active)
      );
    });

    if (persist) {
      try {
        localStorage.setItem(
          "maulArticleTheme",
          selected
        );
      } catch (error) {
        /* Local storage may be unavailable in some privacy modes. */
      }
    }
  }

  const initialTheme =
    root.dataset.articleTheme === "dark"
      ? "dark"
      : "light";

  applyArticleTheme(
    initialTheme,
    false
  );

  themeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      applyArticleTheme(
        button.dataset.theme,
        true
      );
    });
  });
});


/* =========================================================
   PRODUCTS / SERVICES — LIGHT / DARK MODE
   First visit: Dark (keeps the main site visual identity).
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const themeButtons =
    document.querySelectorAll(".product-theme-btn[data-products-theme]");

  if (!themeButtons.length) {
    return;
  }

  const root = document.documentElement;
  const themeMeta = document.querySelector('meta[name="theme-color"]');

  function applyProductsTheme(theme, persist = true) {
    const selected = theme === "light" ? "light" : "dark";

    root.dataset.productsTheme = selected;

    themeButtons.forEach((button) => {
      const active = button.dataset.productsTheme === selected;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });

    if (themeMeta) {
      themeMeta.setAttribute(
        "content",
        selected === "light" ? "#f6f7f9" : "#07111f"
      );
    }

    if (persist) {
      try {
        localStorage.setItem("maulProductsTheme", selected);
      } catch (error) {
        /* Local storage may be unavailable in some privacy modes. */
      }
    }
  }

  const initialTheme =
    root.dataset.productsTheme === "light" ? "light" : "dark";

  applyProductsTheme(initialTheme, false);

  themeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      applyProductsTheme(button.dataset.productsTheme, true);
    });
  });
});
