import { SHOP, BOUQUETS } from "./data.js";

function formatZarRange(min, max) {
  // simple formatting; we can improve later
  return `R${min}–R${max}`;
}

function renderFeatured() {
  const nameEl = document.querySelector("#shopName");
  if (nameEl) nameEl.textContent = SHOP.name;

  const featured = BOUQUETS.filter(b => b.featured).slice(0, 6);
  const grid = document.querySelector("#featuredGrid");

  if (!grid) return;

  grid.innerHTML = featured
    .map(b => {
      const price = formatZarRange(b.priceMin, b.priceMax);
      return `
        <article class="card">
          <h3>${b.name}</h3>
          <p>${b.shortDescription}</p>
          <div class="price">${price}</div>
          <a class="btn" href="./bouquet.html?id=${encodeURIComponent(b.id)}">Customize</a>
        </article>
      `;
    })
    .join("");
}

renderFeatured();
