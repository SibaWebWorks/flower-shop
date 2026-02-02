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

    // 2) try slug-based guess (legacy: used when imageBase points to local folder)
    // NOTE: We are using URLs now, so imageBase is intentionally blank.
    if (selected && bouquet.imageBase) {
        const slug = slugifyColor(selected);
        if (slug) return `${bouquet.imageBase}/${slug}.svg`;
    }

    // 3) default
    return bouquet.defaultImage || bouquet.image || "";
}

/**
 * Pexels image URLs (used everywhere now).
 * Keep them centralized so swapping later is easy.
 */
const PEXELS = {
    blushPink: "https://images.pexels.com/photos/931163/pexels-photo-931163.jpeg?cs=srgb&dl=pexels-secret-garden-333350-931163.jpg&fm=jpg",
    softWhite: "https://images.pexels.com/photos/2879830/pexels-photo-2879830.jpeg?cs=srgb&dl=pexels-secret-garden-333350-2879830.jpg&fm=jpg",

    redRoses: "https://images.pexels.com/photos/931158/pexels-photo-931158.jpeg?cs=srgb&dl=pexels-secret-garden-333350-931158.jpg&fm=jpg",
    deepRed: "https://images.pexels.com/photos/931179/pexels-photo-931179.jpeg?cs=srgb&dl=pexels-secret-garden-333350-931179.jpg&fm=jpg",

    pastelWrap: "https://images.pexels.com/photos/2879827/pexels-photo-2879827.jpeg?cs=srgb&dl=pexels-secret-garden-333350-2879827.jpg&fm=jpg",
    mixedPastel: "https://images.pexels.com/photos/7666495/pexels-photo-7666495.jpeg?cs=srgb&dl=pexels-tara-winstead-7666495.jpg&fm=jpg",

    sunshineYellow: "https://images.pexels.com/photos/2879827/pexels-photo-2879827.jpeg?cs=srgb&dl=pexels-secret-garden-333350-2879827.jpg&fm=jpg",
    warmOrange: "https://images.pexels.com/photos/931163/pexels-photo-931163.jpeg?cs=srgb&dl=pexels-secret-garden-333350-931163.jpg&fm=jpg",
    brightMixed: "https://images.pexels.com/photos/931158/pexels-photo-931158.jpeg?cs=srgb&dl=pexels-secret-garden-333350-931158.jpg&fm=jpg",

    whiteLilies: "https://images.pexels.com/photos/2879830/pexels-photo-2879830.jpeg?cs=srgb&dl=pexels-secret-garden-333350-2879830.jpg&fm=jpg",
};

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
        image: PEXELS.blushPink,

        // New image system (now URLs)
        imageBase: "",
        defaultImage: PEXELS.blushPink,
        colorImages: {
            "Blush Pink": PEXELS.blushPink,
            White: PEXELS.softWhite,
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

        image: PEXELS.redRoses,

        imageBase: "",
        defaultImage: PEXELS.redRoses,
        colorImages: {
            Red: PEXELS.deepRed,
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

        image: PEXELS.pastelWrap,

        imageBase: "",
        defaultImage: PEXELS.pastelWrap,
        colorImages: {
            Pastel: PEXELS.pastelWrap,
            Mixed: PEXELS.mixedPastel,
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

        image: PEXELS.sunshineYellow,

        imageBase: "",
        defaultImage: PEXELS.sunshineYellow,
        colorImages: {
            Yellow: PEXELS.sunshineYellow,
            Orange: PEXELS.warmOrange,
            Mixed: PEXELS.brightMixed,
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

        image: PEXELS.whiteLilies,

        imageBase: "",
        defaultImage: PEXELS.whiteLilies,
        colorImages: {
            White: PEXELS.whiteLilies,
        },

        featured: false,
    },
];
