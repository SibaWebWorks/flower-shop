// src/js/state.js
import { BOUQUETS, getBouquetImage } from "./data.js";
import { addToCart, getCartCount } from "./cart.js";

/* ------------------------------
   Helpers
-------------------------------- */

function getBouquetId() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

function getSelectValue(id) {
  const el = document.querySelector(`#${id}`);
  if (!el) return null;
  const v = (el.value || "").trim();
  return v ? v : null;
}

function updateHeaderCartBadge() {
  if (typeof window.__sbUpdateCartBadge === "function") {
    window.__sbUpdateCartBadge();
  }
}

function resolveBouquetImage(bouquet, color) {
  if (!bouquet) return "";
  return (
    getBouquetImage(bouquet, color) ||
    bouquet.defaultImage ||
    bouquet.image ||
    ""
  );
}

/* ------------------------------
   Mini cart bar
-------------------------------- */

function updateMiniCartBar() {
  const bar = document.querySelector("#miniCartBar");
  if (!bar) return;

  const count = getCartCount();

  const countEl = bar.querySelector("#miniCartCount");
  if (countEl) countEl.textContent = String(count || 0);

  const title = bar.querySelector(".sticky-title");
  if (title) {
    title.textContent = `${count || 0} item${count === 1 ? "" : "s"} in cart`;
  }

  bar.style.display = count > 0 ? "block" : "none";
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
    <span id="sbToastTitle">Added to cart</span>
    <span class="toast-muted" id="sbToastMeta"></span>
  `;
  document.body.appendChild(toast);
  return toast;
}

function showToast(title = "Added to cart", meta = "") {
  const toast = ensureToast();
  const titleEl = toast.querySelector("#sbToastTitle");
  const metaEl = toast.querySelector("#sbToastMeta");

  if (titleEl) titleEl.textContent = title;
  if (metaEl) metaEl.textContent = meta;

  toast.classList.add("show");

  if (toastTimer) window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    toast.classList.remove("show");
  }, 2200);
}

/* ------------------------------
   Image (swap on colour change)
-------------------------------- */

function updateBouquetImage(bouquet) {
  const img = document.querySelector("#bouquetImg");
  if (!img || !bouquet) return;

  const color = getSelectValue("colorSelect");
  const src = resolveBouquetImage(bouquet, color);

  if (src && img.getAttribute("src") !== src) img.setAttribute("src", src);

  const chosen = color ? ` (${color})` : "";
  img.setAttribute("alt", `${bouquet.name}${chosen}`);
}

function wireImageSwap(bouquet) {
  updateBouquetImage(bouquet);
  const color = document.querySelector("#colorSelect");
  if (color) color.addEventListener("change", () => updateBouquetImage(bouquet));
}

/* ------------------------------
   Add-ons dropdown + chips (multi-select)
-------------------------------- */

const selectedAddons = new Set();

function resetSelectedAddons() {
  selectedAddons.clear();
}

function getSelectedAddons() {
  return Array.from(selectedAddons);
}

function renderAddonChips() {
  const wrap = document.querySelector("#addonsChips");
  if (!wrap) return;

  if (selectedAddons.size === 0) {
    wrap.innerHTML = `<p class="muted" style="margin:0;">No add-ons selected.</p>`;
    return;
  }

  wrap.innerHTML = Array.from(selectedAddons)
    .map(
      (a) => `
      <span class="chip">
        <span class="chip-text">${a}</span>
        <button class="chip-x" type="button" aria-label="Remove ${a}" data-addon="${a}">×</button>
      </span>
    `
    )
    .join("");

  wrap.querySelectorAll(".chip-x").forEach((btn) => {
    btn.addEventListener("click", () => {
      const val = btn.getAttribute("data-addon");
      if (!val) return;
      selectedAddons.delete(val);
      syncAddonDropdownOptions();
      renderAddonChips();
    });
  });
}

function syncAddonDropdownOptions() {
  const select = document.querySelector("#addonsSelect");
  if (!select) return;

  Array.from(select.options).forEach((opt) => {
    if (!opt.value) return; // placeholder
    opt.hidden = selectedAddons.has(opt.value);
  });

  select.value = "";
}

function wireAddonsDropdown() {
  const select = document.querySelector("#addonsSelect");
  if (!select) return;

  select.addEventListener("change", () => {
    const val = getSelectValue("addonsSelect");
    if (!val) return;

    selectedAddons.add(val);
    syncAddonDropdownOptions();
    renderAddonChips();
  });

  syncAddonDropdownOptions();
  renderAddonChips();
}

/* ------------------------------
   Render helpers
-------------------------------- */

function renderSelect({ id, label, placeholder, options = [] }) {
  const list = Array.isArray(options) ? options : [];
  const opts = list.map((opt) => `<option value="${opt}">${opt}</option>`).join("");

  return `
    <div class="field">
      <label class="muted field-label" for="${id}">${label}</label>
      <select id="${id}">
        <option value="">${placeholder || "Select an option"}</option>
        ${opts}
      </select>
    </div>
  `;
}

function renderNotFound(container) {
  container.innerHTML = `
    <div class="card stack">
      <div class="stack">
        <h3 class="m-0">Bouquet not found</h3>
        <p class="muted m-0">
          The bouquet link may be incorrect. Please go back and choose a bouquet again.
        </p>
      </div>
      <div class="row mt-10">
        <a class="btn btn-primary" href="./bouquets.html">Back to bouquets</a>
      </div>
    </div>
  `;
}

function renderBouquet(bouquet) {
  const container = document.querySelector("#bouquetDetail");
  if (!container) return;

  if (!bouquet) {
    renderNotFound(container);
    updateMiniCartBar();
    return;
  }

  // Prevent add-ons leaking between bouquets
  resetSelectedAddons();

  const initialImg = resolveBouquetImage(bouquet, null);

  container.innerHTML = `
    <div class="detail">
      <div class="detail-head">
        <div>
          <h2 class="detail-title">${bouquet.name}</h2>
          <p class="muted detail-sub">${bouquet.shortDescription}</p>
        </div>

        <div class="detail-price">
          <div class="price">R${bouquet.priceMin}–R${bouquet.priceMax}</div>
          <div class="muted">Estimated range</div>
        </div>
      </div>

      <div class="detail-layout">
        <!-- LEFT: Image -->
        <div>
          <div class="card bouquet-preview">
            <div class="bouquet-preview-media">
              <img
                id="bouquetImg"
                class="bouquet-preview-img"
                src="${initialImg}"
                alt="${bouquet.name}"
                loading="eager"
                onerror="this.style.display='none';"
              />
            </div>
          </div>
        </div>

        <!-- RIGHT: Controls -->
        <div class="detail-right">
          <div class="card detail-card">
            <h3 class="detail-h">Customise</h3>
            <p class="muted detail-help">Choose size and colour, then add optional extras.</p>

            ${renderSelect({
    id: "sizeSelect",
    label: "Size",
    placeholder: "Select size",
    options: bouquet.sizes,
  })}

            ${renderSelect({
    id: "colorSelect",
    label: "Colour",
    placeholder: "Select colour",
    options: bouquet.colors,
  })}

            ${renderSelect({
    id: "addonsSelect",
    label: "Add-ons",
    placeholder: "Add an add-on",
    options: bouquet.addons,
  })}

            <div class="addons-chips" id="addonsChips"></div>
          </div>

          <div class="detail-cta card">
            <div>
              <h3 style="margin:0 0 6px;">Ready?</h3>
              <p class="muted" style="margin:0;">
                Select a size and colour, then add to cart.
              </p>
            </div>

            <div class="detail-cta-actions">
              <p id="selectionHint" class="muted hint" style="display:none;"></p>
              <button id="addToCartBtn" class="btn btn-primary" type="button" disabled>
                Add to cart
              </button>
              <a class="btn btn-secondary" href="./bouquets.html">Back to bouquets</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  wireValidation(bouquet);
  wireImageSwap(bouquet);
  wireAddonsDropdown();

  refreshButtonState();
  updateMiniCartBar();
}

/* ------------------------------
   Wiring
-------------------------------- */

function wireValidation(bouquet) {
  const size = document.querySelector("#sizeSelect");
  const color = document.querySelector("#colorSelect");

  const onChange = () => {
    refreshButtonState();
    updateMiniCartBar();
    updateBouquetImage(bouquet);
  };

  size?.addEventListener("change", onChange);
  color?.addEventListener("change", onChange);

  const btn = document.querySelector("#addToCartBtn");
  btn?.addEventListener("click", () => onAddToCart(bouquet));
}

function refreshButtonState() {
  const btn = document.querySelector("#addToCartBtn");
  const hint = document.querySelector("#selectionHint");
  if (!btn || !hint) return;

  const size = getSelectValue("sizeSelect");
  const color = getSelectValue("colorSelect");

  const missing = [];
  if (!size) missing.push("size");
  if (!color) missing.push("colour");

  if (missing.length) {
    btn.disabled = true;
    hint.style.display = "block";
    hint.textContent = `Please choose a ${missing.join(" and ")} to add to cart.`;
  } else {
    btn.disabled = false;
    hint.style.display = "none";
    hint.textContent = "";
  }
}

function onAddToCart(bouquet) {
  if (!bouquet) return;

  const size = getSelectValue("sizeSelect");
  const color = getSelectValue("colorSelect");

  if (!size || !color) {
    refreshButtonState();
    return;
  }

  const image = resolveBouquetImage(bouquet, color);

  addToCart({
    id: bouquet.id,
    name: bouquet.name,
    priceMin: bouquet.priceMin,
    priceMax: bouquet.priceMax,
    size,
    color,
    image,
    addons: getSelectedAddons(),
    qty: 1,
  });

  // Reset add-ons after adding (clean UX)
  resetSelectedAddons();
  syncAddonDropdownOptions();
  renderAddonChips();

  updateHeaderCartBadge();
  updateMiniCartBar();
  showToast("Added to cart", bouquet.name);
}

/* ------------------------------
   Boot
-------------------------------- */

const bouquetId = getBouquetId();
const bouquet = BOUQUETS.find((b) => b.id === bouquetId);

renderBouquet(bouquet);
updateMiniCartBar(); // ensure correct on initial load even if bouquet missing
