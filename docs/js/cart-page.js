import { SHOP } from "./data.js";
import { getCart, clearCart, updateQty, removeItem, updateItem } from "./cart.js";
import { BOUQUETS } from "./data.js";

const cartList = document.querySelector("#cartList");
const clearBtn = document.querySelector("#clearCartBtn");
const checkoutBtn = document.querySelector("#checkoutBtn");

function money(n) {
  return `R${Number(n).toFixed(0)}`;
}

function getEstimate(cart) {
  const min = cart.reduce((s, i) => s + (i.priceMin || 0) * (i.qty || 1), 0);
  const max = cart.reduce((s, i) => s + (i.priceMax || 0) * (i.qty || 1), 0);
  return { min, max };
}

function setCheckoutEnabled(enabled) {
  if (!checkoutBtn) return;
  checkoutBtn.disabled = !enabled;
}

function updateHeaderCartBadge() {
  if (typeof window.__sbUpdateCartBadge === "function") window.__sbUpdateCartBadge();
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
    const summary = document.querySelector("#cartEstimate");
    if (summary) summary.textContent = "—";
    setCheckoutEnabled(false);
    return;
  }

  setCheckoutEnabled(true);

  cartList.innerHTML = cart
    .map((i) => {
      const b = BOUQUETS.find((x) => x.id === i.id);

      const sizeOptions = (b?.sizes || [])
        .map((s) => `<option value="${s}" ${s === i.size ? "selected" : ""}>${s}</option>`)
        .join("");

      const colorOptions = (b?.colors || [])
        .map((c) => `<option value="${c}" ${c === i.color ? "selected" : ""}>${c}</option>`)
        .join("");

      const addonOptions = (b?.addons || [])
        .map((a) => {
          const checked = (i.addons || []).includes(a) ? "checked" : "";
          return `
            <label style="display:block; margin-top:6px;">
              <input type="checkbox" data-addon="${a}" data-key="${i.key}" ${checked} />
              ${a}
            </label>
          `;
        })
        .join("");

      const lineMin = (i.priceMin || 0) * (i.qty || 1);
      const lineMax = (i.priceMax || 0) * (i.qty || 1);

      return `
        <div class="card" style="margin-bottom:12px;">
          <div style="display:flex; align-items:flex-start; justify-content:space-between; gap:12px;">
            <div>
              <h3 style="margin:0 0 6px;">${i.name}</h3>
              <p class="muted" style="margin:0 0 10px;">
                Est. ${money(i.priceMin)}–${money(i.priceMax)} each
              </p>
            </div>
            <button class="btn removeBtn" data-key="${i.key}" type="button">Remove</button>
          </div>

          <div style="display:grid; gap:10px; margin-top:10px;">
            <div style="display:grid; gap:6px;">
              <label class="muted">Size</label>
              <select class="selectInput" data-field="size" data-key="${i.key}">
                ${sizeOptions || `<option value="">N/A</option>`}
              </select>
            </div>

            <div style="display:grid; gap:6px;">
              <label class="muted">Color</label>
              <select class="selectInput" data-field="color" data-key="${i.key}">
                ${colorOptions || `<option value="">N/A</option>`}
              </select>
            </div>

            <div style="display:grid; gap:6px;">
              <label class="muted">Add-ons</label>
              <div>
                ${addonOptions || `<div class="muted">No add-ons available.</div>`}
              </div>
            </div>

            <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
              <span class="muted">Qty</span>
              <button class="btn qtyBtn" data-delta="-1" data-key="${i.key}" type="button">−</button>
              <span style="min-width:26px; text-align:center; font-weight:700;">${i.qty || 1}</span>
              <button class="btn qtyBtn" data-delta="1" data-key="${i.key}" type="button">+</button>

              <span class="muted" style="margin-left:auto;">
                Line est: <strong>${money(lineMin)}–${money(lineMax)}</strong>
              </span>
            </div>
          </div>
        </div>
      `;
    })
    .join("");

  const est = getEstimate(cart);
  const summary = document.querySelector("#cartEstimate");
  if (summary) {
    summary.textContent = `${money(est.min)}–${money(est.max)}`;
  }

  wire();
}

function wire() {
  document.querySelectorAll(".removeBtn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      removeItem(e.currentTarget.dataset.key);
      updateHeaderCartBadge();
      render();
    });
  });

  document.querySelectorAll(".qtyBtn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const key = e.currentTarget.dataset.key;
      const delta = Number(e.currentTarget.dataset.delta);

      const cart = getCart();
      const item = cart.find((x) => x.key === key);
      if (!item) return;

      const next = Math.max(1, (item.qty || 1) + delta);
      updateQty(key, next);
      updateHeaderCartBadge();
      render();
    });
  });

  document.querySelectorAll(".selectInput").forEach((sel) => {
    sel.addEventListener("change", (e) => {
      const key = e.currentTarget.dataset.key;
      const field = e.currentTarget.dataset.field;
      const value = e.currentTarget.value;

      updateItem(key, { [field]: value });
      updateHeaderCartBadge();
      render();
    });
  });

  document.querySelectorAll('input[type="checkbox"][data-addon]').forEach((cb) => {
    cb.addEventListener("change", (e) => {
      const key = e.currentTarget.dataset.key;
      const addon = e.currentTarget.dataset.addon;

      const cart = getCart();
      const item = cart.find((x) => x.key === key);
      if (!item) return;

      const addons = new Set(item.addons || []);
      if (e.currentTarget.checked) addons.add(addon);
      else addons.delete(addon);

      updateItem(key, { addons: Array.from(addons) });
      updateHeaderCartBadge();
      render();
    });
  });
}

function buildWhatsAppMessage() {
  const cart = getCart();
  if (!cart.length) return null;

  const est = getEstimate(cart);

  const lines = [
    "Hi, I’d like to place an order.",
    " ",
    "Items:",
  ];

  cart.forEach((i, idx) => {
    lines.push(`${idx + 1}) ${i.name} (Qty: ${i.qty || 1})`);
    if (i.size) lines.push(`   - Size: ${i.size}`);
    if (i.color) lines.push(`   - Color: ${i.color}`);
    if (i.addons?.length) lines.push(`   - Add-ons: ${i.addons.join(", ")}`);
    lines.push(`   - Est. price: ${money(i.priceMin)}–${money(i.priceMax)} each`);
    lines.push(" ");
  });

  lines.push(`Estimated bouquet total: ${money(est.min)}–${money(est.max)}`);
  lines.push("Please confirm availability, delivery options, delivery fee, and final total.");
  lines.push("Thank you.");

  return lines.join("\n");
}

clearBtn?.addEventListener("click", () => {
  clearCart();
  updateHeaderCartBadge();
  render();
});

checkoutBtn?.addEventListener("click", () => {
  const msg = buildWhatsAppMessage();
  if (!msg) return;
  const url = `https://wa.me/${SHOP.whatsappNumber}?text=${encodeURIComponent(msg)}`;
  window.open(url, "_blank");
});

render();
