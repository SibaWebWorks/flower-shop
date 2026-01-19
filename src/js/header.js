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

// Initial
updateCartBadge();

// Keep in sync if cart updates in another tab
window.addEventListener("storage", (e) => {
  if (e.key === "sb_cart_v1") updateCartBadge();
});

// Optional: allow other scripts to trigger refresh
window.__sbUpdateCartBadge = updateCartBadge;
