import { BOUQUETS } from "./data.js";
import { addToCart } from "./cart.js";

function $(sel) {
  return document.querySelector(sel);
}

function ensureToast() {
  let toast = $("#sbToast");
  if (toast) return toast;

  toast = document.createElement("div");
  toast.id = "sbToast";
  toast.className = "toast";
  toast.innerHTML = `<span id="sbToastText">Added to cart</span> <span class="toast-muted">• View cart when ready</span>`;
  document.body.appendChild(toast);
  return toast;
}

let toastTimer = null;
function showToast(text = "Added to cart") {
  const toast = ensureToast();
  const t = $("#sbToastText");
  if (t) t.textContent = text;

  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 1600);
}

function updateHeaderCartBadge() {
  if (typeof window.__sbUpdateCartBadge === "function") {
    window.__sbUpdateCartBadge();
  }
}

function renderCards(container, bouquets, { enableQuickAdd }) {
  if (!container) return;

  container.innerHTML = bouquets
    .map((b) => {
      const detailUrl = `./bouquet.html?id=${encodeURIComponent(b.id)}`;
      return `
        <article class="card">
          <h3>${b.name}</h3>
          <p class="muted">${b.shortDescription}</p>
          <div class="price">R${b.priceMin}–R${b.priceMax}</div>

          <div style="display:flex; gap:10px; flex-wrap:wrap; margin-top:10px;">
            <a class="btn" href="${detailUrl}">Customise</a>
            ${
              enableQuickAdd
                ? `<button class="btn" type="button" data-quickadd="${b.id}">Add to cart</button>`
                : ""
            }
          </div>
        </article>
      `;
    })
    .join("");

  if (enableQuickAdd) {
    container.querySelectorAll("[data-quickadd]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const id = e.currentTarget.getAttribute("data-quickadd");
        const b = BOUQUETS.find((x) => x.id === id);
        if (!b) return;

        // Quick add uses default first options (safe + fast)
        addToCart({
          id: b.id,
          name: b.name,
          priceMin: b.priceMin,
          priceMax: b.priceMax,
          size: b.sizes?.[0] ?? null,
          color: b.colors?.[0] ?? null,
          addons: [],
          qty: 1,
        });

        updateHeaderCartBadge();
        showToast(`${b.name} added`);
      });
    });
  }
}

// Home featured
const featuredGrid = $("#featuredGrid");
if (featuredGrid) {
  renderCards(featuredGrid, BOUQUETS.slice(0, 3), { enableQuickAdd: true });
}

// Catalog page grid
const catalogGrid =
  $("#catalogGrid") || $("#bouquetsGrid") || $("#allBouquetsGrid") || $("#grid");
if (catalogGrid) {
  renderCards(catalogGrid, BOUQUETS, { enableQuickAdd: true });
}
