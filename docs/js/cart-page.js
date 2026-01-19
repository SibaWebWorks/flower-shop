import { SHOP } from "./data.js";
import { getCart, clearCart, updateQty, removeItem } from "./cart.js";

const cartList = document.querySelector("#cartList");
const clearBtn = document.querySelector("#clearCartBtn");
const checkoutBtn = document.querySelector("#checkoutBtn");

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatOptions(i) {
  const parts = [];
  if (i.size) parts.push(`Size: ${i.size}`);
  if (i.color) parts.push(`Color: ${i.color}`);
  if (i.addons?.length) parts.push(`Add-ons: ${i.addons.join(", ")}`);
  return parts.length ? parts.join(" | ") : "No custom options";
}

function setCheckoutEnabled(enabled) {
  if (!checkoutBtn) return;
  checkoutBtn.disabled = !enabled;
}

function render() {
  const cart = getCart();

  if (!cartList) return;

  if (!cart.length) {
    cartList.innerHTML = `
      <div class="card">
        <h3 style="margin:0 0 6px;">Your cart is empty</h3>
        <p class="muted" style="margin:0 0 10px;">
          Browse bouquets and add as many as you like, then send one WhatsApp order from here.
        </p>
        <a class="btn" href="./bouquets.html">Browse bouquets</a>
      </div>
    `;
    setCheckoutEnabled(false);
    return;
  }

  setCheckoutEnabled(true);

  cartList.innerHTML = cart
    .map(
      (i) => `
      <div class="card" style="margin-bottom:12px;">
        <h3 style="margin:0 0 6px;">${escapeHtml(i.name)}</h3>
        <p class="muted" style="margin:0 0 10px;">${escapeHtml(formatOptions(i))}</p>
        <p class="price" style="margin:0 0 10px;">R${i.priceMin}–R${i.priceMax} (each)</p>

        <div style="display:flex; gap:10px; align-items:center; flex-wrap:wrap;">
          <label class="muted" style="margin:0;">Qty</label>
          <input
            data-key="${escapeHtml(i.key)}"
            class="qtyInput"
            type="number"
            min="1"
            value="${Number(i.qty) || 1}"
            style="width:90px; padding:10px; border-radius:12px; border:1px solid var(--border); background: var(--surface);"
          />
          <button class="btn removeBtn" data-key="${escapeHtml(i.key)}" type="button">Remove</button>
        </div>
      </div>
    `
    )
    .join("");

  wire();
}

function wire() {
  document.querySelectorAll(".qtyInput").forEach((el) => {
    el.addEventListener("change", (e) => {
      const key = e.target.dataset.key;
      updateQty(key, e.target.value);
      render();
      if (typeof window.__sbUpdateCartBadge === "function") window.__sbUpdateCartBadge();
    });
  });

  document.querySelectorAll(".removeBtn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const key = e.target.dataset.key;
      removeItem(key);
      render();
      if (typeof window.__sbUpdateCartBadge === "function") window.__sbUpdateCartBadge();
    });
  });
}

function buildWhatsAppMessage() {
  const cart = getCart();
  if (!cart.length) return null;

  const lines = ["Hi, I’d like to place an order.", " ", "Items:"];

  cart.forEach((i, idx) => {
    lines.push(`${idx + 1}) ${i.name} (Qty: ${i.qty})`);
    if (i.size) lines.push(`   - Size: ${i.size}`);
    if (i.color) lines.push(`   - Color: ${i.color}`);
    if (i.addons?.length) lines.push(`   - Add-ons: ${i.addons.join(", ")}`);
    lines.push(`   - Est. price: R${i.priceMin}–R${i.priceMax} each`);
    lines.push(" ");
  });

  lines.push("Please confirm availability, delivery options, and final total.");
  lines.push("Thank you.");

  return lines.join("\n");
}

clearBtn?.addEventListener("click", () => {
  clearCart();
  render();
  if (typeof window.__sbUpdateCartBadge === "function") window.__sbUpdateCartBadge();
});

checkoutBtn?.addEventListener("click", () => {
  const msg = buildWhatsAppMessage();
  if (!msg) return;
  const url = `https://wa.me/${SHOP.whatsappNumber}?text=${encodeURIComponent(msg)}`;
  window.open(url, "_blank");
});

render();
