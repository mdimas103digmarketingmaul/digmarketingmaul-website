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

});
/* MOBILE MENU (pages whose header has .has-menu) */
document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.querySelector(".site-header.has-menu .menu-toggle");
  const menu = document.getElementById("mobile-menu");

  if (!menuToggle || !menu) return;

  const menuLabel = menuToggle.querySelector(".menu-toggle-label");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function onMenuKey(event) {
    if (event.key === "Escape") {
      closeMenu();
      return;
    }

    if (event.key !== "Tab") return;

    /* keep focus inside the toggle + menu links */
    const focusables = [menuToggle, ...menu.querySelectorAll("a")];
    const index = focusables.indexOf(document.activeElement);
    const next = event.shiftKey ? index - 1 : index + 1;

    if (next < 0 || next >= focusables.length) {
      event.preventDefault();
      focusables[(next + focusables.length) % focusables.length].focus();
    }
  }

  function openMenu() {
    menu.hidden = false;
    void menu.offsetHeight; /* commit display before animating clip-path */
    menu.classList.add("is-open");
    menuToggle.setAttribute("aria-expanded", "true");
    menuLabel.textContent = "Close";
    document.body.style.overflow = "hidden";
    menu.querySelector("a").focus();
    document.addEventListener("keydown", onMenuKey);
  }

  function closeMenu(returnFocus = true) {
    menu.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuLabel.textContent = "Menu";
    document.body.style.overflow = "";
    document.removeEventListener("keydown", onMenuKey);

    window.setTimeout(() => {
      if (!menu.classList.contains("is-open")) menu.hidden = true;
    }, reducedMotion ? 0 : 700);

    if (returnFocus) menuToggle.focus();
  }

  menuToggle.addEventListener("click", () => {
    if (menuToggle.getAttribute("aria-expanded") === "true") closeMenu();
    else openMenu();
  });

  menu.addEventListener("click", (event) => {
    if (event.target.closest("a")) closeMenu(false);
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 820 && menuToggle.getAttribute("aria-expanded") === "true") {
      closeMenu(false);
    }
  });
});

/* SOCIAL RAILS — hide while the footer is visible so they never sit on top of it */
document.addEventListener("DOMContentLoaded", () => {
  const footer = document.querySelector(".brand-footer");

  if (!footer || !document.querySelector(".social-rail") || !("IntersectionObserver" in window)) return;

  new IntersectionObserver((entries) => {
    document.body.classList.toggle("footer-in-view", entries[0].isIntersecting);
  }).observe(footer);
});
