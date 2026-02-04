// src/js/ui.js

/* ------------------------------
   Image src normaliser
-------------------------------- */

/**
 * Normalize image source so it works for:
 * - absolute URLs (https://...)
 * - relative paths (assets/...)
 * - already-prefixed paths (./assets/...)
 */
export function resolveImgSrc(input) {
    const raw = String(input || "").trim();
    if (!raw) return "";
    if (/^https?:\/\//i.test(raw)) return raw;

    const noPrefix = raw.replace(/^\.\//, "");
    return `./${noPrefix}`;
}

/* ------------------------------
   Header badge refresh
-------------------------------- */

export function updateHeaderCartBadge() {
    if (typeof window.__sbUpdateCartBadge === "function") {
        window.__sbUpdateCartBadge();
    }
}

/* ------------------------------
   Toast (shared, flexible)
-------------------------------- */

let toastTimer = null;

function ensureToast() {
    let toast = document.querySelector("#sbToast");
    if (toast) return toast;

    toast = document.createElement("div");
    toast.id = "sbToast";
    toast.className = "toast";
    toast.setAttribute("role", "status");
    toast.setAttribute("aria-live", "polite");

    toast.innerHTML = `
    <span id="sbToastTitle">Done</span>
    <span class="toast-muted" id="sbToastMeta"></span>
  `;

    document.body.appendChild(toast);
    return toast;
}

/**
 * showToast("Removed", "Blush Roses")  -> title + meta
 * showToast("Added to cart")          -> title only
 */
export function showToast(title = "Done", meta = "") {
    const toast = ensureToast();

    const titleEl = toast.querySelector("#sbToastTitle");
    const metaEl = toast.querySelector("#sbToastMeta");

    if (titleEl) titleEl.textContent = String(title || "Done");
    if (metaEl) metaEl.textContent = String(meta || "");

    toast.classList.add("show");

    if (toastTimer) window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("show"), 2200);
}
