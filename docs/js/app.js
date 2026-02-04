// src/js/app.js
import { SHOP, BOUQUETS, getBouquetImage } from "./data.js";
import { addToCart } from "./cart.js";
import { resolveImgSrc, showToast, updateHeaderCartBadge } from "./ui.js";

function $(sel) {
  return document.querySelector(sel);
}

/* ------------------------------
   Home: Delivery areas modal
-------------------------------- */

function renderDeliveryAreas(listEl) {
  if (!listEl) return;

  const areas = Array.isArray(SHOP?.areas) ? SHOP.areas : [];

  if (!areas.length) {
    listEl.innerHTML = `<p class="muted m-0">Delivery areas will be confirmed on WhatsApp.</p>`;
    return;
  }

  listEl.innerHTML = areas
    .map(
      (a) => `
        <div class="delivery-area-chip">
          ${String(a)}
        </div>
      `
    )
    .join("");
}

function openModal(modal) {
  if (!modal) return;
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.documentElement.classList.add("modal-open");
}

function closeModal(modal) {
  if (!modal) return;
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  document.documentElement.classList.remove("modal-open");
}

function wireDeliveryAreasModal() {
  const btn = $("#deliveryAreasBtn");
  const modal = $("#deliveryAreasModal");
  const list = $("#deliveryAreasList");

  if (!btn || !modal || !list) return;

  renderDeliveryAreas(list);

  btn.addEventListener("click", () => openModal(modal));

  modal.querySelectorAll("[data-modal-close]").forEach((el) => {
    el.addEventListener("click", () => closeModal(modal));
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("is-open")) {
      closeModal(modal);
    }
  });
}

wireDeliveryAreasModal();

/* ------------------------------
   Helpers
-------------------------------- */

function safeLower(v) {
  return String(v || "").toLowerCase().trim();
}

function uniq(arr) {
  return Array.from(new Set(arr.filter(Boolean)));
}

function midPrice(b) {
  const a = Number(b?.priceMin ?? 0);
  const c = Number(b?.priceMax ?? 0);
  if (!a && !c) return 0;
  if (!c) return a;
  if (!a) return c;
  return (a + c) / 2;
}

function safeFirst(arr) {
  return Array.isArray(arr) && arr.length ? arr[0] : null;
}

function setResultsMeta({ shown, total }) {
  const resultsMeta = $("#resultsMeta");
  if (!resultsMeta) return;

  if (total === 0) {
    resultsMeta.textContent = "No bouquets available.";
    return;
  }

  resultsMeta.textContent = `Showing ${shown} of ${total} bouquet${total === 1 ? "" : "s"}`;
}

/* ------------------------------
   Empty states
-------------------------------- */

function renderNoResults(container) {
  if (!container) return;

  container.innerHTML = `
    <div class="card stack">
      <div class="stack">
        <h3 class="m-0">No results</h3>
        <p class="muted m-0">
          Try a different search term, reset filters, or browse all bouquets.
        </p>
      </div>
      <div class="row mt-10">
        <button class="btn btn-secondary" id="noResultsResetBtn" type="button">Reset filters</button>
      </div>
    </div>
  `;

  const btn = $("#noResultsResetBtn");
  btn?.addEventListener("click", () => {
    const searchInput = $("#searchInput");
    const categorySelect = $("#categorySelect");
    const sortSelect = $("#sortSelect");

    if (searchInput) searchInput.value = "";
    if (categorySelect) categorySelect.value = "";
    if (sortSelect) sortSelect.value = "featured";

    applyFiltersAndSort();
  });
}

/* ------------------------------
   Card rendering
-------------------------------- */

function renderCards(container, bouquets, { enableQuickAdd } = {}) {
  if (!container) return;

  if (!Array.isArray(bouquets) || bouquets.length === 0) {
    renderNoResults(container);
    setResultsMeta({ shown: 0, total: BOUQUETS.length });
    return;
  }

  container.innerHTML = bouquets
    .map((b) => {
      const detailUrl = `./bouquet.html?id=${encodeURIComponent(b.id)}`;

      const imgRaw = getBouquetImage(b, null) || b.defaultImage || b.image || "";
      const src = resolveImgSrc(imgRaw);

      const imgHtml = src
        ? `<img class="catalog-img" src="${src}" alt="${b.name}" loading="lazy"
              onerror="this.style.display='none'; this.closest('.catalog-media')?.classList.add('no-img');" />`
        : "";

      return `
        <article class="card catalog-card">
          <div class="catalog-media ${src ? "" : "no-img"}">
            ${imgHtml}
          </div>

          <div class="catalog-body">
            <div class="catalog-top">
              <h3 class="m-0">${b.name}</h3>
              <div class="price">R${b.priceMin}–R${b.priceMax}</div>
            </div>

            <p class="muted catalog-desc">${b.shortDescription}</p>

            <div class="catalog-actions-row">
              <a class="btn btn-secondary" href="${detailUrl}">Customise</a>
              ${enableQuickAdd
          ? `<button class="btn btn-primary" type="button" data-quickadd="${b.id}">
                      Add to cart
                    </button>`
          : ""
        }
            </div>
          </div>
        </article>
      `;
    })
    .join("");

  if (enableQuickAdd) wireQuickAdd(container);
}

function wireQuickAdd(container) {
  container.querySelectorAll("[data-quickadd]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = e.currentTarget.getAttribute("data-quickadd");
      const b = BOUQUETS.find((x) => x.id === id);
      if (!b) return;

      const size = safeFirst(b.sizes);
      const color = safeFirst(b.colors);

      if (!size || !color) {
        window.location.href = `./bouquet.html?id=${encodeURIComponent(b.id)}`;
        return;
      }

      const image = getBouquetImage(b, color) || b.defaultImage || b.image || "";

      addToCart({
        id: b.id,
        name: b.name,
        priceMin: b.priceMin,
        priceMax: b.priceMax,
        size,
        color,
        image,
        addons: [],
        qty: 1,
      });

      updateHeaderCartBadge();
      showToast("Added to cart", b.name);
    });
  });
}

/* ------------------------------
   Home featured (if present)
-------------------------------- */

const featuredGrid = $("#featuredGrid");
if (featuredGrid) {
  const featured = BOUQUETS.filter((b) => b.featured);
  renderCards(featuredGrid, (featured.length ? featured : BOUQUETS).slice(0, 3), {
    enableQuickAdd: true,
  });
}

/* ------------------------------
   Catalog page: Search / Filter / Sort
-------------------------------- */

const catalogGrid = $("#catalogGrid");
const searchInput = $("#searchInput");
const categorySelect = $("#categorySelect");
const sortSelect = $("#sortSelect");
const resetBtn = $("#resetFiltersBtn");

function hydrateCategoryOptions() {
  if (!categorySelect) return;

  const cats = uniq(BOUQUETS.map((b) => b.category)).sort((a, b) => a.localeCompare(b));

  cats.forEach((c) => {
    const opt = document.createElement("option");
    opt.value = c;
    opt.textContent = c;
    categorySelect.appendChild(opt);
  });
}

function applyFiltersAndSort() {
  if (!catalogGrid) return;

  const q = safeLower(searchInput?.value);
  const cat = (categorySelect?.value || "").trim();
  const sort = (sortSelect?.value || "featured").trim();

  let list = [...BOUQUETS];

  if (cat) list = list.filter((b) => (b.category || "").trim() === cat);

  if (q) {
    list = list.filter((b) => {
      const hay = [
        b.name,
        b.shortDescription,
        b.category,
        ...(b.colors || []),
        ...(b.sizes || []),
        ...(b.occasions || []),
      ]
        .map(safeLower)
        .join(" ");
      return hay.includes(q);
    });
  }

  if (sort === "featured") {
    list.sort((a, b) => {
      const feat = Number(!!b.featured) - Number(!!a.featured);
      if (feat !== 0) return feat;
      return String(a.name).localeCompare(String(b.name));
    });
  } else if (sort === "price-asc") {
    list.sort((a, b) => midPrice(a) - midPrice(b));
  } else if (sort === "price-desc") {
    list.sort((a, b) => midPrice(b) - midPrice(a));
  } else if (sort === "name-asc") {
    list.sort((a, b) => String(a.name).localeCompare(String(b.name)));
  }

  renderCards(catalogGrid, list, { enableQuickAdd: true });
  setResultsMeta({ shown: list.length, total: BOUQUETS.length });
}

function wireCatalogControls() {
  if (!catalogGrid) return;

  hydrateCategoryOptions();
  applyFiltersAndSort();

  searchInput?.addEventListener("input", applyFiltersAndSort);
  categorySelect?.addEventListener("change", applyFiltersAndSort);
  sortSelect?.addEventListener("change", applyFiltersAndSort);

  resetBtn?.addEventListener("click", () => {
    if (searchInput) searchInput.value = "";
    if (categorySelect) categorySelect.value = "";
    if (sortSelect) sortSelect.value = "featured";
    applyFiltersAndSort();
  });
}

wireCatalogControls();
