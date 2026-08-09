// =========================================================
// Mobile Navigation
// =========================================================

const mobileMenuButton = document.getElementById("mobileMenuButton");
const mainNav = document.getElementById("mainNav");

mobileMenuButton.addEventListener("click", () => {
  const isOpen = mainNav.classList.toggle("is-open");

  mobileMenuButton.setAttribute("aria-expanded", String(isOpen));
  mobileMenuButton.setAttribute(
    "aria-label",
    isOpen ? "Close navigation" : "Open navigation"
  );
});

// =========================================================
// Dropdown Navigation
// =========================================================

const dropdowns = document.querySelectorAll(".nav-dropdown");

dropdowns.forEach((dropdown) => {
  const trigger = dropdown.querySelector(".dropdown-trigger");

  trigger.addEventListener("click", (event) => {
    event.stopPropagation();

    const willOpen = !dropdown.classList.contains("is-open");

    dropdowns.forEach((item) => {
      item.classList.remove("is-open");
      item
        .querySelector(".dropdown-trigger")
        .setAttribute("aria-expanded", "false");
    });

    if (willOpen) {
      dropdown.classList.add("is-open");
      trigger.setAttribute("aria-expanded", "true");
    }
  });
});

// Close dropdowns when clicking elsewhere.
document.addEventListener("click", () => {
  dropdowns.forEach((dropdown) => {
    dropdown.classList.remove("is-open");
    dropdown
      .querySelector(".dropdown-trigger")
      .setAttribute("aria-expanded", "false");
  });
});

// =========================================================
// Close mobile navigation after clicking a link
// =========================================================

const navLinks = mainNav.querySelectorAll("a");

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    mainNav.classList.remove("is-open");
    mobileMenuButton.setAttribute("aria-expanded", "false");
  });
});
