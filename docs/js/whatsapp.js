// src/js/whatsapp.js
import { SHOP } from "./data.js";

/* ------------------------------
   Small utilities
-------------------------------- */

function formatNiceDate(iso) {
    const parts = String(iso || "").split("-");
    if (parts.length !== 3) return String(iso || "");

    const [y, m, d] = parts.map((x) => Number(x));
    if (!y || !m || !d) return String(iso || "");

    const date = new Date(y, m - 1, d);
    try {
        return date.toLocaleDateString(undefined, {
            weekday: "short",
            day: "2-digit",
            month: "short",
        });
    } catch {
        return String(iso || "");
    }
}

function money(n) {
    return `R${Number(n).toFixed(0)}`;
}

function normaliseStr(v) {
    const s = String(v ?? "").trim();
    return s ? s : "";
}

/* ------------------------------
   WhatsApp open
-------------------------------- */

export function openWhatsAppMessage(message) {
    const text = normaliseStr(message);
    if (!text) return;

    const number = normaliseStr(SHOP?.whatsappNumber);
    if (!number) return;

    const url = `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
}

/* ------------------------------
   Cart order (single source of truth)
-------------------------------- */

export function buildCartWhatsAppMessage({ cart, estimate, deliveryDate, deliveryArea }) {
    const items = Array.isArray(cart) ? cart : [];
    if (!items.length) return null;

    const estMin = estimate?.min ?? 0;
    const estMax = estimate?.max ?? 0;

    const lines = ["Hi, I’d like to place an order.", " "];

    const dd = normaliseStr(deliveryDate);
    if (dd) {
        lines.push(`Delivery date: ${formatNiceDate(dd)} (${dd})`);
        lines.push(" ");
    }

    const area = normaliseStr(deliveryArea);
    if (area) {
        lines.push(`Delivery area: ${area}`);
        lines.push(" ");
    }

    lines.push("Items:");

    items.forEach((i, idx) => {
        const qty = Number(i?.qty) || 1;

        lines.push(`${idx + 1}) ${i?.name} (Qty: ${qty})`);
        if (i?.size) lines.push(`   - Size: ${i.size}`);
        if (i?.color) lines.push(`   - Color: ${i.color}`);
        if (Array.isArray(i?.addons) && i.addons.length) {
            lines.push(`   - Add-ons: ${i.addons.join(", ")}`);
        }
        lines.push(`   - Est. price: ${money(i?.priceMin)}–${money(i?.priceMax)} each`);
        lines.push(" ");
    });

    lines.push(`Estimated bouquet total: ${money(estMin)}–${money(estMax)}`);
    lines.push("Please confirm availability, delivery options, delivery fee, and final total.");
    lines.push("Thank you.");

    const msg = lines.join("\n").trim();
    return msg ? msg : null;
}

export function openWhatsAppCart({ cart, estimate, deliveryDate, deliveryArea }) {
    const msg = buildCartWhatsAppMessage({ cart, estimate, deliveryDate, deliveryArea });
    if (!msg) return;
    openWhatsAppMessage(msg);
}
