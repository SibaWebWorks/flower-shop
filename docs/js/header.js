import { getCartCount } from "./cart.js";

const CART_KEY = "sb_cart_v1";

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

function normalizePathFile() {
  const file = (window.location.pathname.split("/").pop() || "").trim();
  return file || "index.html";
}

function setActiveNav() {
  const currentFile = normalizePathFile();

  document.querySelectorAll("nav.nav a").forEach((a) => {
    a.classList.remove("active");

    const href = (a.getAttribute("href") || "").trim();
    if (!href) return;

    // Normalize href: remove leading ./, strip query/hash
    const hrefNoPrefix = href.replace(/^\.\//, "");
    const hrefFile = hrefNoPrefix.split("?")[0].split("#")[0];

    // If link is an in-page section on index.html, only active on index.html
    if (hrefNoPrefix.startsWith("index.html#")) {
      if (currentFile === "index.html") a.classList.add("active");
      return;
    }

    // Normal page match
    if (hrefFile === currentFile) a.classList.add("active");
  });
}

function refreshHeader() {
  updateCartBadge();
  setActiveNav();
}

// Initial
refreshHeader();

// Keep in sync if cart updates in another tab
window.addEventListener("storage", (e) => {
  if (e.key === CART_KEY) refreshHeader();
});

// Optional: allow other scripts to trigger refresh
window.__sbUpdateCartBadge = updateCartBadge;
window.__sbRefreshHeader = refreshHeader;
