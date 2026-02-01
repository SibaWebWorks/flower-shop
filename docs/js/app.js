import { SHOP, BOUQUETS, getBouquetImage } from "./data.js";
import { addToCart } from "./cart.js";

function $(sel) {
  return document.querySelector(sel);
}

/* ------------------------------
   Image src resolver
   - supports absolute URLs (https://...)
   - keeps relative paths working (assets/...)
-------------------------------- */
function resolveImgSrc(src) {
  const s = String(src || "").trim();
  if (!s) return "";
  if (/^(https?:)?\/\//i.test(s)) return s;      // https:// OR //cdn...
  if (/^data:/i.test(s)) return s;               // data URLs
  return `./${s.replace(/^\.\//, "")}`;          // local relative
}

/* ------------------------------
   Toast (shared: home + catalog)
-------------------------------- */

function ensureToast() {
  let toast = $("#sbToast");
  if (toast) return toast;

  toast = document.createElement("div");
  toast.id = "sbToast";
  toast.className = "toast";
  toast.innerHTML = `
    <span id="sbToastText">Done</span>
    <span class="toast-muted">• View cart when ready</span>
  `;
  document.body.appendChild(toast);
  return toast;
}

let toastTimer = null;
function showToast(text = "Done") {
  const toast = ensureToast();
  const t = $("#sbToastText");
  if (t) t.textContent = text;

  toast.classList.add("show");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("show"), 1700);
}

function updateHeaderCartBadge() {
  if (typeof window.__sbUpdateCartBadge === "function") {
    window.__sbUpdateCartBadge();
  }
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

  // populate on boot (fast + simple)
  renderDeliveryAreas(list);

  btn.addEventListener("click", () => openModal(modal));

  // close on backdrop / close buttons
  modal.querySelectorAll("[data-modal-close]").forEach((el) => {
    el.addEventListener("click", () => closeModal(modal));
  });

  // close on ESC
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

/* ------------------------------
   Card rendering
-------------------------------- */

function renderCards(container, bouquets, { enableQuickAdd } = {}) {
  if (!container) return;

  container.innerHTML = bouquets
    .map((b) => {
      const detailUrl = `./bouquet.html?id=${encodeURIComponent(b.id)}`;

      // config-driven: use the same image selection logic as the bouquet detail page
      const preferredColor = b?.colors?.[0] ?? "";
      const rawImg = getBouquetImage(b, preferredColor) || b.defaultImage || b.image || "";
      const imgSrc = resolveImgSrc(rawImg);

      const imgHtml = imgSrc
        ? `<img class="catalog-img" src="${imgSrc}" alt="${b.name}" loading="lazy"
              onerror="this.style.display='none'; this.closest('.catalog-media')?.classList.add('no-img');" />`
        : "";

      return `
        <article class="card catalog-card">
          <div class="catalog-media ${imgSrc ? "" : "no-img"}">
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

      // Quick add uses first options (fast path)
      const size = b.sizes?.[0] ?? null;
      const color = b.colors?.[0] ?? null;

      // If something is missing, fall back to customise page (no broken cart items)
      if (!size || !color) {
        window.location.href = `./bouquet.html?id=${encodeURIComponent(b.id)}`;
        return;
      }

      addToCart({
        id: b.id,
        name: b.name,
        priceMin: b.priceMin,
        priceMax: b.priceMax,
        size,
        color,
        addons: [],
        qty: 1,
      });

      updateHeaderCartBadge();
      showToast(`${b.name} added`);
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
const resultsMeta = $("#resultsMeta");

function hydrateCategoryOptions() {
  if (!categorySelect) return;

  const cats = uniq(BOUQUETS.map((b) => b.category)).sort((a, b) =>
    a.localeCompare(b)
  );

  // keep first option already in HTML
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

  // Filter: category
  if (cat) list = list.filter((b) => (b.category || "").trim() === cat);

  // Filter: search
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

  // Sort
  if (sort === "featured") {
    list.sort((a, b) => Number(!!b.featured) - Number(!!a.featured));
  } else if (sort === "price-asc") {
    list.sort((a, b) => midPrice(a) - midPrice(b));
  } else if (sort === "price-desc") {
    list.sort((a, b) => midPrice(b) - midPrice(a));
  } else if (sort === "name-asc") {
    list.sort((a, b) => String(a.name).localeCompare(String(b.name)));
  }

  renderCards(catalogGrid, list, { enableQuickAdd: true });

  if (resultsMeta) {
    const total = BOUQUETS.length;
    resultsMeta.textContent = `${list.length} of ${total} bouquets`;
  }
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
