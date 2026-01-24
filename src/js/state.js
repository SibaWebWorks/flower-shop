import { BOUQUETS, getBouquetImage } from "./data.js";
import { addToCart, getCartCount } from "./cart.js";

/* ------------------------------
   Helpers
-------------------------------- */

function getBouquetId() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

function getSelectedValue(name) {
  const input = document.querySelector(`input[name="${name}"]:checked`);
  return input ? input.value : null;
}

function getSelectedAddons() {
  return Array.from(document.querySelectorAll('input[type="checkbox"]:checked')).map(
    (i) => i.value
  );
}

function updateHeaderCartBadge() {
  if (typeof window.__sbUpdateCartBadge === "function") {
    window.__sbUpdateCartBadge();
  }
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
   Toast UX (non-blocking feedback)
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

  const color = getSelectedValue("color");
  const src = getBouquetImage(bouquet, color);

  // Avoid pointless DOM churn
  if (img.getAttribute("src") !== src) img.setAttribute("src", src);

  const chosen = color ? ` (${color})` : "";
  img.setAttribute("alt", `${bouquet.name}${chosen}`);
}

function wireImageSwap(bouquet) {
  // initial draw
  updateBouquetImage(bouquet);

  // when colour changes
  document.querySelectorAll('input[name="color"]').forEach((el) => {
    el.addEventListener("change", () => updateBouquetImage(bouquet));
  });
}

/* ------------------------------
   Render helpers
-------------------------------- */

function renderOptionPills({ name, options, type, selectedName }) {
  if (!options?.length) return `<p class="muted">No options available.</p>`;

  const items = options
    .map((opt) => {
      const id = `${name}-${String(opt).toLowerCase().replace(/\s+/g, "-")}`;

      if (type === "radio") {
        return `
          <label class="pill" for="${id}">
            <input id="${id}" type="radio" name="${selectedName}" value="${opt}">
            <span>${opt}</span>
          </label>
        `;
      }

      return `
        <label class="pill" for="${id}">
          <input id="${id}" type="checkbox" value="${opt}">
          <span>${opt}</span>
        </label>
      `;
    })
    .join("");

  return `<div class="pill-grid">${items}</div>`;
}

function renderBouquet(bouquet) {
  const container = document.querySelector("#bouquetDetail");
  if (!container) return;

  if (!bouquet) {
    container.innerHTML = "<p>Sorry, bouquet not found.</p>";
    return;
  }

  const initialImg = getBouquetImage(bouquet, null);

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

      <!-- NEW: image card -->
      <div class="card" style="padding: 14px;">
        <img
          id="bouquetImg"
          src="${initialImg}"
          alt="${bouquet.name}"
          loading="eager"
          style="width: 100%; height: 320px; object-fit: cover; border-radius: 14px; border: 1px solid var(--border); background: #fff;"
        />
        <p class="muted" style="margin: 10px 0 0;">
          Preview updates when you change colour.
        </p>
      </div>

      <div class="detail-grid">
        <div class="card detail-card">
          <h3 class="detail-h">Size</h3>
          <p class="muted detail-help">Choose one option.</p>
          ${renderOptionPills({
    name: "size",
    options: bouquet.sizes,
    type: "radio",
    selectedName: "size",
  })}
        </div>

        <div class="card detail-card">
          <h3 class="detail-h">Colour</h3>
          <p class="muted detail-help">Choose one option.</p>
          ${renderOptionPills({
    name: "color",
    options: bouquet.colors,
    type: "radio",
    selectedName: "color",
  })}
        </div>

        <div class="card detail-card">
          <h3 class="detail-h">Add-ons</h3>
          <p class="muted detail-help">Optional extras.</p>
          ${renderOptionPills({
    name: "addon",
    options: bouquet.addons,
    type: "checkbox",
  })}
        </div>
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
  `;

  wireValidation(bouquet);
  wireImageSwap(bouquet);
  refreshButtonState();
  updateMiniCartBar();
}

/* ------------------------------
   Wiring
-------------------------------- */

function wireValidation(bouquet) {
  document
    .querySelectorAll('input[name="size"], input[name="color"], input[type="checkbox"]')
    .forEach((el) =>
      el.addEventListener("change", () => {
        refreshButtonState();
        updateMiniCartBar();
        // ensure image stays synced if colour changes
        if (el.name === "color") updateBouquetImage(bouquet);
      })
    );

  const btn = document.querySelector("#addToCartBtn");
  if (btn) btn.addEventListener("click", () => onAddToCart(bouquet));
}

function refreshButtonState() {
  const btn = document.querySelector("#addToCartBtn");
  const hint = document.querySelector("#selectionHint");
  if (!btn || !hint) return;

  const size = getSelectedValue("size");
  const color = getSelectedValue("color");

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

  const size = getSelectedValue("size");
  const color = getSelectedValue("color");
  if (!size || !color) {
    refreshButtonState();
    return;
  }

  const image = getBouquetImage(bouquet, color);

  const item = {
    id: bouquet.id,
    name: bouquet.name,
    priceMin: bouquet.priceMin,
    priceMax: bouquet.priceMax,
    size,
    color,
    image, // NEW: store selected image per variant
    addons: getSelectedAddons(),
    qty: 1,
  };

  addToCart(item);
  updateHeaderCartBadge();
  updateMiniCartBar();

  showToast("Added to cart", bouquet.name);

  const viewBtn = document.querySelector("#miniCartViewBtn");
  if (viewBtn) viewBtn.style.display = "inline-flex";
}

/* ------------------------------
   Boot
-------------------------------- */

const bouquetId = getBouquetId();
const bouquet = BOUQUETS.find((b) => b.id === bouquetId);
renderBouquet(bouquet);
