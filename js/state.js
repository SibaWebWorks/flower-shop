import { BOUQUETS } from "./data.js";

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
      ${bouquet.sizes.map(s => `
        <label>
          <input type="radio" name="size" value="${s}">
          ${s}
        </label>
      `).join("<br>")}
    </div>

    <div class="section">
      <h3>Color</h3>
      ${bouquet.colors.map(c => `
        <label>
          <input type="radio" name="color" value="${c}">
          ${c}
        </label>
      `).join("<br>")}
    </div>

    <div class="section">
      <h3>Add-ons</h3>
      ${bouquet.addons.map(a => `
        <label>
          <input type="checkbox" value="${a}">
          ${a}
        </label>
      `).join("<br>")}
    </div>
  `;
}

const bouquetId = getBouquetId();
const bouquet = BOUQUETS.find(b => b.id === bouquetId);

renderBouquet(bouquet);
