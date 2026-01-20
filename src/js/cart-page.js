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

function renderEmpty() {
  if (!cartList) return;

  cartList.innerHTML = `
    <div class="card">
      <h3 class="m-0" style="margin-bottom:6px;">Your cart is empty</h3>
      <p class="muted" style="margin:0 0 10px;">
        Browse bouquets and add as many as you like, then send one WhatsApp order from here.
      </p>
      <a class="btn btn-primary" href="./bouquets.html">Browse bouquets</a>
    </div>
  `;

  const summary = document.querySelector("#cartEstimate");
  if (summary) summary.textContent = "—";
  setCheckoutEnabled(false);
}

function render() {
  const cart = getCart();
  if (!cartList) return;

  if (!cart.length) {
    renderEmpty();
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
            <label class="addon-row">
              <input type="checkbox" data-addon="${a}" data-key="${i.key}" ${checked} />
              ${a}
            </label>
          `;
        })
        .join("");

      const lineMin = (i.priceMin || 0) * (i.qty || 1);
      const lineMax = (i.priceMax || 0) * (i.qty || 1);

      return `
        <div class="card cart-item" data-key="${i.key}">
          <div class="cart-item-top">
            <div class="cart-item-meta">
              <h3 class="m-0">${i.name}</h3>
              <p class="muted m-0">
                Est. ${money(i.priceMin)}–${money(i.priceMax)} each
              </p>
            </div>

            <button class="btn btn-secondary btn-sm removeBtn" data-key="${i.key}" type="button">
              Remove
            </button>
          </div>

          <div class="cart-controls">
            <div class="field">
              <div class="field-label muted">Size</div>
              <select class="selectInput" data-field="size" data-key="${i.key}">
                ${sizeOptions || `<option value="">N/A</option>`}
              </select>
            </div>

            <div class="field">
              <div class="field-label muted">Color</div>
              <select class="selectInput" data-field="color" data-key="${i.key}">
                ${colorOptions || `<option value="">N/A</option>`}
              </select>
            </div>

            <div class="field">
              <div class="field-label muted">Add-ons</div>
              <div class="addon-list">
                ${addonOptions || `<div class="muted">No add-ons available.</div>`}
              </div>
            </div>

            <div class="cart-qty">
              <span class="muted">Qty</span>

              <button class="btn btn-secondary btn-sm qtyBtn" data-delta="-1" data-key="${i.key}" type="button">
                −
              </button>

              <span class="qtyValue" aria-label="Quantity">
                ${i.qty || 1}
              </span>

              <button class="btn btn-secondary btn-sm qtyBtn" data-delta="1" data-key="${i.key}" type="button">
                +
              </button>

              <span class="cart-line-total">
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
  if (summary) summary.textContent = `${money(est.min)}–${money(est.max)}`;

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

  const lines = ["Hi, I’d like to place an order.", " ", "Items:"];

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
