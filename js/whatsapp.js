import { SHOP } from "./data.js";

export function openWhatsAppOrder(order) {
    const sections = [
        "Hi, I’d like to place an order.",
        " ",

        "Bouquet details:",
        `Name: ${order.name}`,
        `Price range: R${order.priceMin}–R${order.priceMax}`,
        order.size ? `Size: ${order.size}` : null,
        order.color ? `Color: ${order.color}` : null,
        order.addons.length ? `Add-ons: ${order.addons.join(", ")}` : null,
        " ",

        "Please let me know availability and delivery options.",
        "Thank you."
    ].filter(Boolean);

    // IMPORTANT: join with DOUBLE newlines
    const message = sections.join("\n");

    const url = `https://wa.me/${SHOP.whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
}
