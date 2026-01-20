import { BOUQUETS } from "./data.js";
import { addToCart, getCartCount } from "./cart.js";

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

function updateMiniCartBar() {
  const bar = document.querySelector("#miniCartBar");
  const countEl = document.querySelector("#miniCartCount");
  if (!bar || !countEl) return;

  const count = getCartCount();
  countEl.textContent = String(count || 0);

  if (count > 0) bar.style.display = "block";
  else bar.style.display = "none";
}

function renderOptionPills({ name, options, type, selectedName }) {
  if (!options?.length) return `<p class="muted">No options available.</p>`;

  // type: "radio" | "checkbox"
  // selectedName only for radio groups
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

  if (!bouquet) {
    container.innerHTML = "<p>Sorry, bouquet not found.</p>";
    return;
  }

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

  wireValidation();
  refreshButtonState();
  updateMiniCartBar();
}

function wireValidation() {
  document
    .querySelectorAll('input[name="size"], input[name="color"], input[type="checkbox"]')
    .forEach((el) => el.addEventListener("change", () => {
      refreshButtonState();
      updateMiniCartBar();
    }));

  const btn = document.querySelector("#addToCartBtn");
  if (btn) {
    btn.addEventListener("click", onAddToCart);
  }
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

function onAddToCart() {
  const bouquetId = getBouquetId();
  const bouquet = BOUQUETS.find((b) => b.id === bouquetId);
  if (!bouquet) return;

  const size = getSelectedValue("size");
  const color = getSelectedValue("color");
  if (!size || !color) {
    refreshButtonState();
    return;
  }

  const item = {
    id: bouquet.id,
    name: bouquet.name,
    priceMin: bouquet.priceMin,
    priceMax: bouquet.priceMax,
    size,
    color,
    addons: getSelectedAddons(),
    qty: 1,
  };

  addToCart(item);
  updateHeaderCartBadge();
  updateMiniCartBar();

  // Smooth UX: keep them here (they can add more variants) OR go to cart
  window.location.href = "./cart.html";
}

const bouquetId = getBouquetId();
const bouquet = BOUQUETS.find((b) => b.id === bouquetId);
renderBouquet(bouquet);
