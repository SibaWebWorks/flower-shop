import { getCartCount } from "./cart.js";

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

function setActiveNav() {
  const currentFile =
    window.location.pathname.split("/").pop() || "index.html";

  document.querySelectorAll("nav.nav a").forEach((a) => {
    a.classList.remove("active");

    const rawHref = a.getAttribute("href") || "";
    if (!rawHref) return;

    // If link is an in-page anchor on index.html
    if (rawHref.startsWith("./index.html#") || rawHref.startsWith("index.html#")) {
      if (currentFile === "index.html") a.classList.add("active");
      return;
    }

    // Compare file names (strip ./ and query/hash)
    const hrefFile = rawHref
      .replace(/^\.\//, "")
      .split("?")[0]
      .split("#")[0];

    if (hrefFile === currentFile) {
      a.classList.add("active");
    }
  });
}

// Initial
updateCartBadge();
setActiveNav();

// Keep in sync if cart updates in another tab
window.addEventListener("storage", (e) => {
  if (e.key === "sb_cart_v1") updateCartBadge();
});

// Optional: allow other scripts to trigger refresh
window.__sbUpdateCartBadge = updateCartBadge;
