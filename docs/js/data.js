// src/js/data.js

export const SHOP = {
    name: "Sister Blooms",
    whatsappNumber: "27781234567", // SA format: country code + number, no + or spaces
    currency: "ZAR",
    city: "Cape Town",
    areas: [
        "CBD",
        "Woodstock",
        "Salt River",
        "Observatory",
        "Green Point",
        "Sea Point",
        "Gardens",
        "Oranjezicht",
        "Tamboerskloof",
        "Rondebosch",
        "Claremont",
        "Newlands",
        "Kenilworth",
        "Wynberg",
        "Bellville (limited slots)",
        "Durbanville (limited slots)",
    ],
    deliveryNotes: [
        "Same-day delivery for CBD/Atlantic Seaboard if ordered before 12:00.",
        "Other areas: 24-hour notice recommended.",
        "Delivery fee depends on distance (confirmed on WhatsApp).",
    ],
};

/**
 * Turn a display color into a filename-safe slug.
 * "Blush Pink" -> "blush-pink"
 * "Valentine’s Red" -> "valentines-red"
 */
export function slugifyColor(value) {
    return String(value || "")
        .trim()
        .toLowerCase()
        .replace(/[’']/g, "") // remove apostrophes
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
}

/**
 * Return the best image for a bouquet based on selected color.
 * - If bouquet.colorImages has a match, use it
 * - Else fall back to bouquet.defaultImage
 * - Else fall back to legacy bouquet.image
 */
export function getBouquetImage(bouquet, color) {
    if (!bouquet) return "";

    const selected = (color || "").trim();

    // 1) explicit mapping (best)
    if (selected && bouquet.colorImages && bouquet.colorImages[selected]) {
        return bouquet.colorImages[selected];
    }

    // 2) try slug-based guess (useful if you keep folders consistent)
    if (selected && bouquet.imageBase) {
        const slug = slugifyColor(selected);
        if (slug) return `${bouquet.imageBase}/${slug}.svg`;
    }

    // 3) default
    return bouquet.defaultImage || bouquet.image || "";
}

export const BOUQUETS = [
    {
        id: "blush-roses-mini",
        name: "Blush Roses (Mini)",
        category: "Roses",
        shortDescription: "Soft pink roses with baby’s breath and wrap.",
        priceMin: 299,
        priceMax: 399,
        sizes: ["Mini", "Standard"],
        colors: ["Blush Pink", "White"],
        occasions: ["Birthday", "Anniversary", "Just Because"],
        addons: ["Chocolates", "Card Note", "Fairy Lights"],
        leadTimeHours: 6,

        // Legacy (keep for compatibility)
        image: "assets/images/bouquets/blush-roses/default.svg",

        // New image system
        imageBase: "assets/images/bouquets/blush-roses",
        defaultImage: "assets/images/bouquets/blush-roses/default.svg",
        colorImages: {
            "Blush Pink": "assets/images/bouquets/blush-roses/blush-pink.svg",
            White: "assets/images/bouquets/blush-roses/white.svg",
        },

        featured: true,
    },
    {
        id: "red-roses-classic",
        name: "Classic Red Roses",
        category: "Roses",
        shortDescription: "Romantic red roses with premium wrap.",
        priceMin: 499,
        priceMax: 899,
        sizes: ["6 Roses", "12 Roses", "18 Roses"],
        colors: ["Red"],
        occasions: ["Anniversary", "Valentine’s", "Date Night"],
        addons: ["Chocolates", "Card Note", "Balloon"],
        leadTimeHours: 12,

        image: "assets/images/bouquets/red-roses/default.svg",

        imageBase: "assets/images/bouquets/red-roses",
        defaultImage: "assets/images/bouquets/red-roses/default.svg",
        colorImages: {
            Red: "assets/images/bouquets/red-roses/red.svg",
        },

        featured: true,
    },
    {
        id: "pastel-mix-wrap",
        name: "Pastel Mix Wrap",
        category: "Mixed",
        shortDescription: "Seasonal pastel flowers, styled wrap (varies by stock).",
        priceMin: 350,
        priceMax: 650,
        sizes: ["Standard", "Large"],
        colors: ["Pastel", "Mixed"],
        occasions: ["Birthday", "Congrats", "Mother’s Day"],
        addons: ["Card Note", "Chocolates", "Balloon"],
        leadTimeHours: 12,

        image: "assets/images/bouquets/pastel-mix/default.svg",

        imageBase: "assets/images/bouquets/pastel-mix",
        defaultImage: "assets/images/bouquets/pastel-mix/default.svg",
        colorImages: {
            Pastel: "assets/images/bouquets/pastel-mix/pastel.svg",
            Mixed: "assets/images/bouquets/pastel-mix/mixed.svg",
        },

        featured: true,
    },
    {
        id: "sunshine-gerberas",
        name: "Sunshine Gerberas",
        category: "Mixed",
        shortDescription: "Bright gerberas, greenery, and wrap.",
        priceMin: 279,
        priceMax: 449,
        sizes: ["Mini", "Standard"],
        colors: ["Yellow", "Orange", "Mixed"],
        occasions: ["Get Well", "Congrats", "Just Because"],
        addons: ["Card Note", "Vase"],
        leadTimeHours: 8,

        image: "assets/images/bouquets/sunshine-gerberas/default.svg",

        imageBase: "assets/images/bouquets/sunshine-gerberas",
        defaultImage: "assets/images/bouquets/sunshine-gerberas/default.svg",
        colorImages: {
            Yellow: "assets/images/bouquets/sunshine-gerberas/yellow.svg",
            Orange: "assets/images/bouquets/sunshine-gerberas/orange.svg",
            Mixed: "assets/images/bouquets/sunshine-gerberas/mixed.svg",
        },

        featured: false,
    },
    {
        id: "white-lilies-elegance",
        name: "White Lilies Elegance",
        category: "Lilies",
        shortDescription: "Elegant lilies with soft greenery (buds may open over time).",
        priceMin: 450,
        priceMax: 750,
        sizes: ["Standard", "Large"],
        colors: ["White"],
        occasions: ["Thank You", "Housewarming", "Sympathy"],
        addons: ["Card Note", "Vase", "Fairy Lights"],
        leadTimeHours: 24,

        image: "assets/images/bouquets/white-lilies/default.svg",

        imageBase: "assets/images/bouquets/white-lilies",
        defaultImage: "assets/images/bouquets/white-lilies/default.svg",
        colorImages: {
            White: "assets/images/bouquets/white-lilies/white.svg",
        },

        featured: false,
    },
];
