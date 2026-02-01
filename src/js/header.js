// src/js/header.js
import { getCartCount } from "./cart.js";

const CART_KEY = "sb_cart_v1";
const DESKTOP_MIN_WIDTH = 900;

function $(sel, root = document) {
  return root.querySelector(sel);
}

function $all(sel, root = document) {
  return Array.from(root.querySelectorAll(sel));
}

function normalizePathFile() {
  const file = (window.location.pathname.split("/").pop() || "").trim();
  return file || "index.html";
}

/* ------------------------------
   Active nav
   - works with: <nav id="primaryNav" class="menu">...</nav>
-------------------------------- */
function setActiveNav() {
  const nav = $("#primaryNav");
  if (!nav) return;

  const currentFile = normalizePathFile();

  $all("a", nav).forEach((a) => {
    a.classList.remove("active");
    a.removeAttribute("aria-current");

    const href = (a.getAttribute("href") || "").trim();
    if (!href) return;

    const cleaned = href.replace(/^\.\//, "");
    const pathPart = cleaned.split("#")[0];
    const filePart = pathPart.split("?")[0];

    // Hash links: only mark active on index.html
    if (cleaned.includes("#")) {
      if (currentFile === "index.html" && (filePart === "" || filePart === "index.html")) {
        a.classList.add("active");
        a.setAttribute("aria-current", "page");
      }
      return;
    }

    if (filePart === currentFile) {
      a.classList.add("active");
      a.setAttribute("aria-current", "page");
    }
  });
}

/* ------------------------------
   Footer year
-------------------------------- */
function setYear() {
  const y = $("#y");
  if (y) y.textContent = String(new Date().getFullYear());
}

/* ------------------------------
   Cart badge (optional)
   - Only runs if #cartCount exists in your header markup
-------------------------------- */
function updateCartBadge() {
  const el = $("#cartCount");
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
   Mobile menu (NEZHNOST)
   - toggles .is-open on #primaryNav
-------------------------------- */
function isDesktop() {
  return window.matchMedia(`(min-width: ${DESKTOP_MIN_WIDTH}px)`).matches;
}

function setupMobileMenu() {
  const btn = $(".menu-toggle");      // NEZHNOST button
  const nav = $("#primaryNav");       // NEZHNOST nav
  if (!btn || !nav) return;

  function setOpen(open) {
    nav.classList.toggle("is-open", open);
    btn.setAttribute("aria-expanded", open ? "true" : "false");
    btn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }

  // Initial: closed
  setOpen(false);

  btn.addEventListener("click", (e) => {
    e.preventDefault();
    const open = nav.classList.contains("is-open");
    setOpen(!open);
  });

  // Close menu when clicking a nav link (mobile only)
  $all("a", nav).forEach((a) => {
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

  // Close on click outside
  document.addEventListener("click", (e) => {
    if (!nav.classList.contains("is-open")) return;
    const t = e.target;
    if (btn.contains(t) || nav.contains(t)) return;
    setOpen(false);
  });
}

function refreshHeader() {
  setYear();
  setActiveNav();
  updateCartBadge();
}

// Boot
refreshHeader();
setupMobileMenu();

// Keep in sync if cart updates in another tab
window.addEventListener("storage", (e) => {
  if (e.key === CART_KEY) refreshHeader();
});

// Allow other scripts to trigger refresh
window.__sbUpdateCartBadge = updateCartBadge;
window.__sbRefreshHeader = refreshHeader;
