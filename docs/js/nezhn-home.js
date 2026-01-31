import { BOUQUETS } from "./data.js";
import { addToCart } from "./cart.js";

function pickHomeBouquets() {
  const featured = BOUQUETS.filter((b) => b.featured);
  const list = (featured.length ? featured : BOUQUETS).slice(0, 3);
  return list;
}

function imgSrc(b) {
  if (!b?.image) return "";
  return `./${String(b.image).replace(/^\.\//, "")}`;
}

function renderHomeCards() {
  const el = document.getElementById("nezhnProducts");
  if (!el) return;

  const list = pickHomeBouquets();

  el.innerHTML = list
    .map((b) => {
      const detailUrl = `./bouquet.html?id=${encodeURIComponent(b.id)}`;
      const priceText =
        b.priceMin && b.priceMax ? `from R${b.priceMin}` : `R${b.priceMin || b.priceMax || ""}`;

      return `
        <article class="card">
          <div class="card-media">
            ${b.image ? `<img src="${imgSrc(b)}" alt="${b.name}" loading="lazy" />` : ""}
            <button class="fav" type="button" aria-label="Save">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M12 21s-7-4.35-9.5-8.5C.6 9.1 2.6 6 6 6c1.7 0 3.1.8 4 2 .9-1.2 2.3-2 4-2 3.4 0 5.4 3.1 3.5 6.5C19 16.65 12 21 12 21Z"
                  stroke="currentColor" stroke-width="1.6" />
              </svg>
            </button>
          </div>

          <div class="card-body">
            <h3 class="card-title">${b.name}</h3>
            <p class="card-desc">${b.shortDescription || ""}</p>
            <p class="card-price">${priceText}</p>

            <div class="card-actions">
              <a class="btn" href="${detailUrl}">DETAILS</a>
              <button class="btn primary" type="button" data-order="${b.id}">ORDER</button>
            </div>
          </div>
        </article>
      `;
    })
    .join("");

  el.querySelectorAll("[data-order]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = e.currentTarget.getAttribute("data-order");
      const b = BOUQUETS.find((x) => x.id === id);
      if (!b) return;

      const size = b.sizes?.[0] ?? null;
      const color = b.colors?.[0] ?? null;

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

      const original = btn.textContent;
      btn.textContent = "ADDED";
      window.setTimeout(() => (btn.textContent = original), 1200);
    });
  });
}

function setYear() {
  const y = document.getElementById("y");
  if (y) y.textContent = String(new Date().getFullYear());
}

function setupMobileMenu() {
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.getElementById("primaryNav");
  if (!toggle || !nav) return;

  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });
}

setYear();
setupMobileMenu();
renderHomeCards();
