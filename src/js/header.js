// src/js/header.js
import { getCartCount } from "./cart.js";

const CART_KEY = "sb_cart_v1";
const DESKTOP_MIN_WIDTH = 980; // match CSS breakpoint

function normalizePathFile() {
  const file = (window.location.pathname.split("/").pop() || "").trim();
  return file || "index.html";
}

function setYear() {
  const y = document.getElementById("y");
  if (y) y.textContent = String(new Date().getFullYear());
}

/* ------------------------------
   Cart badge (NEZHN header)
-------------------------------- */
function updateCartBadge() {
  const el = document.querySelector("#cartCount");
  if (!el) return;

  const count = getCartCount();
  if (!count) {
    el.textContent = "";
    el.style.display = "none";
    return;
  }

  el.textContent = String(count);
  el.style.display = "inline-flex";
}

/* ------------------------------
   Active nav (NEZHN header)
-------------------------------- */
function setActiveNav() {
  const nav = document.getElementById("primaryNav");
  if (!nav) return;

  const currentFile = normalizePathFile();

  nav.querySelectorAll("a").forEach((a) => {
    a.classList.remove("active");
    a.removeAttribute("aria-current");

    const href = (a.getAttribute("href") || "").trim();
    if (!href) return;

    const hrefNoPrefix = href.replace(/^\.\//, "");
    const hrefFile = hrefNoPrefix.split("?")[0].split("#")[0];

    // In-page section links should only highlight on index.html
    if (hrefNoPrefix.includes("#")) {
      const base = hrefFile || "index.html";
      if (base === "index.html" && currentFile === "index.html") {
        a.classList.add("active");
        a.setAttribute("aria-current", "page");
      }
      return;
    }

    if (hrefFile === currentFile) {
      a.classList.add("active");
      a.setAttribute("aria-current", "page");
    }
  });
}

/* ------------------------------
   Mobile menu (NEZHN header)
-------------------------------- */
function isDesktop() {
  return window.matchMedia(`(min-width: ${DESKTOP_MIN_WIDTH}px)`).matches;
}

function setupMobileMenu() {
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.getElementById("primaryNav");
  if (!toggle || !nav) return;

  function setOpen(open) {
    nav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }

  // Initial: closed
  setOpen(false);

  toggle.addEventListener("click", () => {
    const open = nav.classList.contains("is-open");
    setOpen(!open);
  });

  // Close after click on a link (mobile only)
  nav.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => {
      if (!isDesktop()) setOpen(false);
    });
  });

  // Close if switching to desktop
  window.addEventListener("resize", () => {
    if (isDesktop()) setOpen(false);
  });

  // Close on Escape
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setOpen(false);
  });
}

function refreshHeader() {
  setYear();
  updateCartBadge();
  setActiveNav();
}

// Boot
refreshHeader();
setupMobileMenu();

// Keep in sync if cart updates in another tab
window.addEventListener("storage", (e) => {
  if (e.key === CART_KEY) refreshHeader();
});

// Optional: allow other scripts to trigger refresh
window.__sbUpdateCartBadge = updateCartBadge;
window.__sbRefreshHeader = refreshHeader;
