import { SHOP, BOUQUETS } from "./data.js";
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
      `,
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
      `,
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
      `,
        )
        .join("<br>")}
    </div>
  `;

  /* ------------------------------
     Step 9: Delivery + Sticky bar
  -------------------------------- */
  addDeliveryInfo();
  addStickyOrderBar(bouquet);
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
    document.querySelectorAll('input[type="checkbox"]:checked'),
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
      addons: getSelectedAddons(),
    };

    openWhatsAppOrder(order);
  };

  container.appendChild(btn);
}

/* ------------------------------
   Step 9 additions
-------------------------------- */

function addDeliveryInfo() {
  const container = document.querySelector("#bouquetDetail");

  const areasPreview = SHOP.areas.slice(0, 6).join(", ");
  const moreCount = Math.max(0, SHOP.areas.length - 6);

  const html = `
    <div class="section">
      <h3>Delivery</h3>
      <p class="muted">
        Areas: ${areasPreview}${moreCount ? ` +${moreCount} more` : ""}
      </p>
      <ul>
        ${SHOP.deliveryNotes.map((n) => `<li>${n}</li>`).join("")}
      </ul>
    </div>
  `;

  container.insertAdjacentHTML("beforeend", html);
}

function addStickyOrderBar(bouquet) {
  const container = document.querySelector("#bouquetDetail");

  const bar = document.createElement("div");
  bar.className = "sticky-bar";
  bar.innerHTML = `
    <div class="sticky-bar-inner">
      <div class="sticky-title">Ready to order?</div>
      <button class="btn" id="stickyOrderBtn">Order on WhatsApp</button>
    </div>
  `;

  container.appendChild(bar);

  const btn = bar.querySelector("#stickyOrderBtn");
  btn.onclick = () => {
    const order = {
      name: bouquet.name,
      priceMin: bouquet.priceMin,
      priceMax: bouquet.priceMax,
      size: getSelectedValue("size"),
      color: getSelectedValue("color"),
      addons: getSelectedAddons(),
    };

    openWhatsAppOrder(order);
  };
}

/* ------------------------------
   Bootstrapping
-------------------------------- */

const bouquetId = getBouquetId();
const bouquet = BOUQUETS.find((b) => b.id === bouquetId);

renderBouquet(bouquet);
