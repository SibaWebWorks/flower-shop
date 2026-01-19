import { BOUQUETS } from "./data.js";
import { addToCart } from "./cart.js";

function getBouquetId() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

function getSelectedValue(name) {
  const input = document.querySelector(`input[name="${name}"]:checked`);
  return input ? input.value : null;
}

function getSelectedAddons() {
  return Array.from(
    document.querySelectorAll('input[type="checkbox"]:checked')
  ).map((i) => i.value);
}

function updateHeaderCartBadge() {
  if (typeof window.__sbUpdateCartBadge === "function") {
    window.__sbUpdateCartBadge();
  }
}

function renderBouquet(bouquet) {
  const container = document.querySelector("#bouquetDetail");

  if (!bouquet) {
    container.innerHTML = "<p>Sorry, bouquet not found.</p>";
    return;
  }

  container.innerHTML = `
    <h2>${bouquet.name}</h2>
    <p class="muted">${bouquet.shortDescription}</p>
    <p class="price">R${bouquet.priceMin}–R${bouquet.priceMax}</p>

    <div class="section">
      <h3>Size</h3>
      ${bouquet.sizes
        .map(
          (s) => `
        <label>
          <input type="radio" name="size" value="${s}">
          ${s}
        </label>
      `
        )
        .join("<br>")}
    </div>

    <div class="section">
      <h3>Color</h3>
      ${bouquet.colors
        .map(
          (c) => `
        <label>
          <input type="radio" name="color" value="${c}">
          ${c}
        </label>
      `
        )
        .join("<br>")}
    </div>

    <div class="section">
      <h3>Add-ons</h3>
      ${bouquet.addons
        .map(
          (a) => `
        <label>
          <input type="checkbox" value="${a}">
          ${a}
        </label>
      `
        )
        .join("<br>")}
    </div>

    <p id="selectionHint" class="muted" style="margin-top: 12px; display:none;"></p>
  `;

  addAddToCartButton(bouquet);
  wireValidation();
  refreshButtonState();
}

function wireValidation() {
  document.querySelectorAll('input[name="size"], input[name="color"], input[type="checkbox"]').forEach((el) => {
    el.addEventListener("change", refreshButtonState);
  });
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

function addAddToCartButton(bouquet) {
  const container = document.querySelector("#bouquetDetail");

  const btn = document.createElement("button");
  btn.id = "addToCartBtn";
  btn.className = "btn";
  btn.style.marginTop = "16px";
  btn.textContent = "Add to cart";

  btn.addEventListener("click", () => {
    const size = getSelectedValue("size");
    const color = getSelectedValue("color");

    // Guard (should be disabled anyway)
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
    window.location.href = "./cart.html";
  });

  container.appendChild(btn);
}

const bouquetId = getBouquetId();
const bouquet = BOUQUETS.find((b) => b.id === bouquetId);
renderBouquet(bouquet);
