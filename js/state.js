import { BOUQUETS } from "./data.js";
import { openWhatsAppOrder } from "./whatsapp.js";

/* ------------------------------
   Existing logic (Step 7)
-------------------------------- */

function getBouquetId() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
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
  `;

  /* ------------------------------
     Step 8.3: WhatsApp wiring
  -------------------------------- */
  addWhatsAppButton(bouquet);
}

/* ------------------------------
   Step 8.3 helpers
-------------------------------- */

function getSelectedValue(name) {
  const input = document.querySelector(`input[name="${name}"]:checked`);
  return input ? input.value : null;
}

function getSelectedAddons() {
  return Array.from(
    document.querySelectorAll('input[type="checkbox"]:checked')
  ).map((i) => i.value);
}

function addWhatsAppButton(bouquet) {
  const container = document.querySelector("#bouquetDetail");

  const btn = document.createElement("button");
  btn.className = "btn";
  btn.style.marginTop = "16px";
  btn.textContent = "Order on WhatsApp";

  btn.onclick = () => {
    const order = {
      name: bouquet.name,
      priceMin: bouquet.priceMin,
      priceMax: bouquet.priceMax,
      size: getSelectedValue("size"),
      color: getSelectedValue("color"),
      addons: getSelectedAddons()
    };

    openWhatsAppOrder(order);
  };

  container.appendChild(btn);
}

/* ------------------------------
   Bootstrapping
-------------------------------- */

const bouquetId = getBouquetId();
const bouquet = BOUQUETS.find((b) => b.id === bouquetId);

renderBouquet(bouquet);
