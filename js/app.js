import { BOUQUETS } from "./data.js";
import { addToCart, getCartCount } from "./cart.js";

function $(sel) {
  return document.querySelector(sel);
}

function renderGrid(container, bouquets, mode) {
  if (!container) return;

  container.innerHTML = bouquets
    .map((b) => {
      const detailUrl = `./bouquet.html?id=${encodeURIComponent(b.id)}`;

      return `
        <div class="card">
          <h3>${b.name}</h3>
          <p class="muted">${b.shortDescription}</p>
          <p class="price">R${b.priceMin}–R${b.priceMax}</p>

          <div style="display:flex; gap:10px; flex-wrap:wrap; margin-top:10px;">
            <a class="btn" href="${detailUrl}">Customise</a>
            <button class="btn" data-quickadd="${b.id}" type="button">Add to cart</button>
          </div>
        </div>
      `;
    })
    .join("");

  container.querySelectorAll("[data-quickadd]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = e.currentTarget.getAttribute("data-quickadd");
      const b = BOUQUETS.find((x) => x.id === id);
      if (!b) return;

      // Default (first options) for quick add
      addToCart({
        id: b.id,
        name: b.name,
        priceMin: b.priceMin,
        priceMax: b.priceMax,
        size: b.sizes?.[0] ?? null,
        color: b.colors?.[0] ?? null,
        addons: [],
        qty: 1
      });

      window.location.href = "./cart.html";
    });
  });
}

// Home featured
const featuredGrid = $("#featuredGrid");
if (featuredGrid) {
  renderGrid(featuredGrid, BOUQUETS.slice(0, 3), "featured");
}

// Bouquets page grid (preferred id)
const bouquetsGrid = $("#bouquetsGrid") || $("#allBouquetsGrid") || $("#grid") || $("#featuredGrid");
if (bouquetsGrid && bouquetsGrid !== featuredGrid) {
  renderGrid(bouquetsGrid, BOUQUETS, "catalog");
}

// Optional: show cart count if you add an element later
const cartCountEl = $("#cartCount");
if (cartCountEl) {
  cartCountEl.textContent = String(getCartCount());
}
