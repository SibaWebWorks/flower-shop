// src/js/header.js
import { getCartCount } from "./cart.js";

const CART_KEY = "sb_cart_v1";
const DESKTOP_MIN_WIDTH = 900;

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

function normalizePathFile(pathname = window.location.pathname) {
  const file = (String(pathname).split("/").pop() || "").trim();
  return file || "index.html";
}

function hrefToFile(href) {
  const raw = String(href || "").trim();
  if (!raw) return "";

  // strip query/hash
  const clean = raw.split("?")[0].split("#")[0];

  // remove leading ./ and leading /
  const noPrefix = clean.replace(/^\.\//, "").replace(/^\//, "");

  // if the href is a full path, keep only the filename
  return normalizePathFile(noPrefix);
}

function setActiveNav() {
  const currentFile = normalizePathFile();

  document.querySelectorAll("nav.nav a").forEach((a) => {
    a.classList.remove("active");
    a.removeAttribute("aria-current");

    const href = a.getAttribute("href");
    if (!href) return;

    // Special case: index.html#section should only highlight on index.html
    const hrefRaw = String(href).trim().replace(/^\.\//, "");
    if (hrefRaw.startsWith("index.html#")) {
      if (currentFile === "index.html") {
        a.classList.add("active");
        a.setAttribute("aria-current", "page");
      }
      return;
    }

    const hrefFile = hrefToFile(href);
    if (hrefFile && hrefFile === currentFile) {
      a.classList.add("active");
      a.setAttribute("aria-current", "page");
    }
  });
}

/* ------------------------------
   Mobile menu (dropdown)
-------------------------------- */

function isDesktop() {
  return window.matchMedia(`(min-width: ${DESKTOP_MIN_WIDTH}px)`).matches;
}

function setupMobileMenu() {
  const header = document.querySelector(".site-head");
  const btn = document.querySelector("#menuBtn");
  const nav = document.querySelector("#primaryNav");

  if (!header || !btn || !nav) return;

  function setOpen(open) {
    header.classList.toggle("nav-open", open);
    btn.setAttribute("aria-expanded", open ? "true" : "false");
    btn.setAttribute("aria-label", open ? "Close menu" : "Open menu");

    const icon = btn.querySelector("i");
    if (icon) {
      icon.classList.toggle("fa-bars", !open);
      icon.classList.toggle("fa-xmark", open);
    }
  }

  // Initial: closed
  setOpen(false);

  btn.addEventListener("click", () => {
    const openNow = header.classList.contains("nav-open");
    setOpen(!openNow);
  });

  // Close menu when clicking a nav link (mobile only)
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
  updateCartBadge();
  setActiveNav();
}

/* ------------------------------
   Boot
-------------------------------- */

// Normal initial load
refreshHeader();
setupMobileMenu();

// Fix badge/nav when coming back via bfcache (Safari/Chrome mobile)
window.addEventListener("pageshow", () => {
  refreshHeader();
});

// Keep in sync if cart updates in another tab
window.addEventListener("storage", (e) => {
  if (!e) return;
  if (e.key !== CART_KEY) return;
  refreshHeader();
});

// Allow other scripts to trigger refresh
window.__sbUpdateCartBadge = updateCartBadge;
window.__sbRefreshHeader = refreshHeader;
