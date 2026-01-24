import { SHOP, BOUQUETS, getBouquetImage } from "./data.js";
import { getCart, clearCart, updateQty, removeItem, updateItem } from "./cart.js";

const cartList = document.querySelector("#cartList");
const clearBtn = document.querySelector("#clearCartBtn");
const checkoutBtn = document.querySelector("#checkoutBtn");

/* ------------------------------
   Delivery Date (Cart-level)
-------------------------------- */

const DELIVERY_DATE_KEY = "sb_delivery_date_v1";

const deliveryDateBlock = document.querySelector("#deliveryDateBlock");
const deliveryTodayBtn = document.querySelector("#deliveryTodayBtn");
const deliveryTomorrowBtn = document.querySelector("#deliveryTomorrowBtn");
const deliveryPickBtn = document.querySelector("#deliveryPickBtn");
const deliveryDateValue = document.querySelector("#deliveryDateValue");
const deliveryDateHint = document.querySelector("#deliveryDateHint");
const deliveryDatePicker = document.querySelector("#deliveryDatePicker");
const deliveryDateInput = document.querySelector("#deliveryDateInput");

function setDeliveryDateVisible(visible) {
  if (!deliveryDateBlock) return;
  deliveryDateBlock.style.display = visible ? "block" : "none";
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

// Returns YYYY-MM-DD (local)
function toISODateLocal(d) {
  const year = d.getFullYear();
  const month = pad2(d.getMonth() + 1);
  const day = pad2(d.getDate());
  return `${year}-${month}-${day}`;
}

function formatNiceDate(iso) {
  // iso is YYYY-MM-DD
  const parts = String(iso || "").split("-");
  if (parts.length !== 3) return iso;

  const [y, m, d] = parts.map((x) => Number(x));
  if (!y || !m || !d) return iso;

  const date = new Date(y, m - 1, d);
  try {
    return date.toLocaleDateString(undefined, {
      weekday: "short",
      day: "2-digit",
      month: "short",
    });
  } catch {
    return iso;
  }
}

function readDeliveryDate() {
  const raw = localStorage.getItem(DELIVERY_DATE_KEY);
  return raw ? String(raw) : "";
}

function writeDeliveryDate(isoDate) {
  if (!isoDate) {
    localStorage.removeItem(DELIVERY_DATE_KEY);
    return;
  }
  localStorage.setItem(DELIVERY_DATE_KEY, String(isoDate));
}

function clearDeliveryDate() {
  localStorage.removeItem(DELIVERY_DATE_KEY);
  updateDeliveryUI();
}

function setDeliveryDate(isoDate) {
  const todayIso = toISODateLocal(new Date());

  // Prevent past dates (soft guard)
  if (isoDate && isoDate < todayIso) {
    isoDate = todayIso;
  }

  writeDeliveryDate(isoDate);
  updateDeliveryUI();
}

function setActiveDeliveryButton(which) {
  // which: "today" | "tomorrow" | "pick" | ""
  const map = [
    [deliveryTodayBtn, which === "today"],
    [deliveryTomorrowBtn, which === "tomorrow"],
    [deliveryPickBtn, which === "pick"],
  ];

  map.forEach(([btn, active]) => {
    if (!btn) return;
    btn.classList.toggle("is-active", !!active);
  });
}

function updateDeliveryUI() {
  const selected = readDeliveryDate();

  const today = new Date();
  const todayIso = toISODateLocal(today);
  const tomorrowIso = toISODateLocal(
    new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
  );

  // Configure date input constraints
  if (deliveryDateInput) {
    deliveryDateInput.min = todayIso;
    deliveryDateInput.value = selected || "";
  }

  if (!deliveryDateValue) return;

  if (!selected) {
    deliveryDateValue.textContent = "Not selected";
    if (deliveryDateHint) deliveryDateHint.textContent = "Choose a day for delivery.";
    setActiveDeliveryButton("");
    if (deliveryDatePicker) deliveryDatePicker.style.display = "none";
    return;
  }

  deliveryDateValue.textContent = formatNiceDate(selected);

  if (selected === todayIso) setActiveDeliveryButton("today");
  else if (selected === tomorrowIso) setActiveDeliveryButton("tomorrow");
  else setActiveDeliveryButton("pick");

  if (deliveryDateHint) deliveryDateHint.textContent = "You can change this anytime.";
}

function wireDeliveryDate() {
  if (deliveryTodayBtn) {
    deliveryTodayBtn.addEventListener("click", () => {
      setDeliveryDate(toISODateLocal(new Date()));
      if (deliveryDatePicker) deliveryDatePicker.style.display = "none";
      showToast("Delivery date", "Today selected");
    });
  }

  if (deliveryTomorrowBtn) {
    deliveryTomorrowBtn.addEventListener("click", () => {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      setDeliveryDate(toISODateLocal(d));
      if (deliveryDatePicker) deliveryDatePicker.style.display = "none";
      showToast("Delivery date", "Tomorrow selected");
    });
  }

  if (deliveryPickBtn) {
    deliveryPickBtn.addEventListener("click", () => {
      if (!deliveryDatePicker || !deliveryDateInput) return;

      const isOpen = deliveryDatePicker.style.display !== "none";
      deliveryDatePicker.style.display = isOpen ? "none" : "block";

      if (!isOpen) deliveryDateInput.focus();

      setActiveDeliveryButton("pick");
    });
  }

  if (deliveryDateInput) {
    deliveryDateInput.addEventListener("change", (e) => {
      const iso = e.currentTarget.value;
      if (!iso) return;
      setDeliveryDate(iso);
      if (deliveryDatePicker) deliveryDatePicker.style.display = "none";
      showToast("Delivery date", formatNiceDate(iso));
    });
  }

  updateDeliveryUI();
}

/* ------------------------------
   Money + totals
-------------------------------- */

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

/* ------------------------------
   Toast UX
-------------------------------- */

let toastTimer = null;

function ensureToast() {
  let toast = document.querySelector("#sbToast");
  if (toast) return toast;

  toast = document.createElement("div");
  toast.id = "sbToast";
  toast.className = "toast";
  toast.setAttribute("role", "status");
  toast.setAttribute("aria-live", "polite");
  toast.innerHTML = `
    <span id="sbToastTitle">Done</span>
    <span class="toast-muted" id="sbToastMeta"></span>
  `;
  document.body.appendChild(toast);
  return toast;
}

function showToast(title = "Done", meta = "") {
  const toast = ensureToast();
  const titleEl = toast.querySelector("#sbToastTitle");
  const metaEl = toast.querySelector("#sbToastMeta");

  if (titleEl) titleEl.textContent = title;
  if (metaEl) metaEl.textContent = meta;

  toast.classList.add("show");
  if (toastTimer) window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("show"), 2200);
}

/* ------------------------------
   Empty
-------------------------------- */

function renderEmpty() {
  if (!cartList) return;

  setDeliveryDateVisible(false);

  cartList.classList.add("cart-list");
  cartList.innerHTML = `
    <div class="card stack">
      <div class="stack">
        <h3 class="m-0">Your cart is empty</h3>
        <p class="muted m-0">
          Browse bouquets and add as many as you like, then send one WhatsApp order from here.
        </p>
      </div>
      <div class="row mt-10">
        <a class="btn btn-primary" href="./bouquets.html">Browse bouquets</a>
      </div>
    </div>
  `;

  const summary = document.querySelector("#cartEstimate");
  if (summary) summary.textContent = "—";
  setCheckoutEnabled(false);
}

/* ------------------------------
   Render
-------------------------------- */

function resolveItemImage(item, bouquet) {
  if (item?.image) return item.image;
  if (bouquet) return getBouquetImage(bouquet, item?.color || null);
  return "";
}

function render() {
  const cart = getCart();
  if (!cartList) return;

  cartList.classList.add("cart-list");

  if (!cart.length) {
    renderEmpty();
    return;
  }

  setDeliveryDateVisible(true);
  updateDeliveryUI();
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
              <span>${a}</span>
            </label>
          `;
        })
        .join("");

      const lineMin = (i.priceMin || 0) * (i.qty || 1);
      const lineMax = (i.priceMax || 0) * (i.qty || 1);

      const imgSrc = resolveItemImage(i, b);
      const imgAlt = `${i.name}${i.color ? ` (${i.color})` : ""}`;

      return `
        <div class="card">
          <div class="cart-item">
            <div class="cart-item-top">
              <div class="cart-item-meta">
                <div class="cart-item-head">
                  ${imgSrc
          ? `<img class="cart-thumb" src="./${String(imgSrc).replace(/^\.\//, "")}" alt="${imgAlt}" loading="lazy"
                           onerror="this.style.display='none';" />`
          : ""
        }

                  <div class="cart-item-titleblock">
                    <h3 class="m-0">${i.name}</h3>
                    <p class="muted m-0">Est. ${money(i.priceMin)}–${money(i.priceMax)} each</p>
                  </div>
                </div>
              </div>

              <button class="btn btn-danger removeBtn" data-key="${i.key}" type="button">Remove</button>
            </div>

            <div class="cart-controls">
              <div class="field">
                <label class="muted field-label">Size</label>
                <select class="selectInput" data-field="size" data-key="${i.key}">
                  ${sizeOptions || `<option value="">N/A</option>`}
                </select>
              </div>

              <div class="field">
                <label class="muted field-label">Color</label>
                <select class="selectInput" data-field="color" data-key="${i.key}">
                  ${colorOptions || `<option value="">N/A</option>`}
                </select>
              </div>

              <div class="field">
                <label class="muted field-label">Add-ons</label>
                <div class="addon-list">
                  ${addonOptions || `<div class="muted">No add-ons available.</div>`}
                </div>
              </div>

              <div class="cart-qty">
                <span class="muted">Qty</span>
                <button class="btn btn-sm qtyBtn" data-delta="-1" data-key="${i.key}" type="button">−</button>
                <span class="cart-qty-value">${i.qty || 1}</span>
                <button class="btn btn-sm qtyBtn" data-delta="1" data-key="${i.key}" type="button">+</button>

                <span class="cart-line-total">
                  Line est: <strong>${money(lineMin)}–${money(lineMax)}</strong>
                </span>
              </div>
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

/* ------------------------------
   Wire
-------------------------------- */

function wire() {
  document.querySelectorAll(".removeBtn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const key = e.currentTarget.dataset.key;

      const cart = getCart();
      const item = cart.find((x) => x.key === key);
      const label = item?.name || "Item";

      removeItem(key);

      // If cart becomes empty, clear delivery date too (clean UX)
      if (!getCart().length) clearDeliveryDate();

      updateHeaderCartBadge();
      render();

      showToast("Removed", label);
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

      if (field === "color") {
        const cart = getCart();
        const item = cart.find((x) => x.key === key);
        const bouquet = BOUQUETS.find((b) => b.id === item?.id);

        const image = bouquet ? getBouquetImage(bouquet, value) : item?.image;

        updateItem(key, { color: value, image });
      } else {
        updateItem(key, { [field]: value });
      }

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

/* ------------------------------
   WhatsApp message
-------------------------------- */

function buildWhatsAppMessage() {
  const cart = getCart();
  if (!cart.length) return null;

  const est = getEstimate(cart);
  const deliveryDate = readDeliveryDate();

  const lines = ["Hi, I’d like to place an order.", " "];

  if (deliveryDate) {
    lines.push(`Delivery date: ${formatNiceDate(deliveryDate)} (${deliveryDate})`);
    lines.push(" ");
  }

  lines.push("Items:");

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

/* ------------------------------
   Buttons
-------------------------------- */

clearBtn?.addEventListener("click", () => {
  const countBefore = getCart().length;

  clearCart();
  clearDeliveryDate();

  updateHeaderCartBadge();
  render();

  if (countBefore > 0) showToast("Cart cleared", "Your cart is now empty");
});

checkoutBtn?.addEventListener("click", () => {
  const msg = buildWhatsAppMessage();
  if (!msg) return;
  const url = `https://wa.me/${SHOP.whatsappNumber}?text=${encodeURIComponent(msg)}`;
  window.open(url, "_blank");
});

/* ------------------------------
   Boot
-------------------------------- */

wireDeliveryDate();
render();
