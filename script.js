// =========================================================
// Navigation Elements
// =========================================================

const mobileMenuButton = document.getElementById("mobileMenuButton");
const mainNav = document.getElementById("mainNav");
const dropdowns = document.querySelectorAll(".nav-dropdown");


// =========================================================
// Mobile Navigation
// =========================================================

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


// =========================================================
// Close Dropdowns
// =========================================================

function closeDropdowns() {
  dropdowns.forEach((dropdown) => {
    dropdown.classList.remove("is-open");

    dropdown
      .querySelector(".dropdown-trigger")
      .setAttribute("aria-expanded", "false");
  });
}

document.addEventListener("click", closeDropdowns);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeDropdowns();

    mainNav.classList.remove("is-open");
    mobileMenuButton.setAttribute("aria-expanded", "false");
  }
});


// =========================================================
// Close Mobile Navigation After Clicking a Link
// =========================================================

const navLinks = mainNav.querySelectorAll("a");

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    mainNav.classList.remove("is-open");
    mobileMenuButton.setAttribute("aria-expanded", "false");

    closeDropdowns();
  });
});


// =========================================================
// Reset Mobile State When Returning to Desktop
// =========================================================

window.addEventListener("resize", () => {
  if (window.innerWidth > 900) {
    mainNav.classList.remove("is-open");
    mobileMenuButton.setAttribute("aria-expanded", "false");

    closeDropdowns();
  }
});


// =========================================================
// Prevent Placeholder Links (#) From Jumping to Page Top
// =========================================================

document.querySelectorAll('a[href="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
  });
});
