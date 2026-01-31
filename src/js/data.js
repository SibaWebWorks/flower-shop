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
 * Central place for ALL external image URLs.
 * Later, when you add your own images, you only change URLs here.
 */
export const IMAGES = {
    home: {
        hero: "https://images.pexels.com/photos/2879830/pexels-photo-2879830.jpeg?cs=srgb&dl=pexels-secret-garden-333350-2879830.jpg&fm=jpg",
        banners: [
            "https://images.pexels.com/photos/2879827/pexels-photo-2879827.jpeg?cs=srgb&dl=pexels-secret-garden-333350-2879827.jpg&fm=jpg",
            "https://images.pexels.com/photos/931179/pexels-photo-931179.jpeg?cs=srgb&dl=pexels-secret-garden-333350-931179.jpg&fm=jpg",
            "https://images.pexels.com/photos/7666495/pexels-photo-7666495.jpeg?cs=srgb&dl=pexels-tara-winstead-7666495.jpg&fm=jpg",
        ],
    },

    bouquets: {
        "blush-roses-mini": {
            default:
                "https://images.pexels.com/photos/931163/pexels-photo-931163.jpeg?cs=srgb&dl=pexels-secret-garden-333350-931163.jpg&fm=jpg",
            blush:
                "https://images.pexels.com/photos/931163/pexels-photo-931163.jpeg?cs=srgb&dl=pexels-secret-garden-333350-931163.jpg&fm=jpg",
            white:
                "https://images.pexels.com/photos/931163/pexels-photo-931163.jpeg?cs=srgb&dl=pexels-secret-garden-333350-931163.jpg&fm=jpg",
        },

        "red-roses-classic": {
            default:
                "https://images.pexels.com/photos/931158/pexels-photo-931158.jpeg?cs=srgb&dl=pexels-secret-garden-333350-931158.jpg&fm=jpg",
            red:
                "https://images.pexels.com/photos/931158/pexels-photo-931158.jpeg?cs=srgb&dl=pexels-secret-garden-333350-931158.jpg&fm=jpg",
        },

        "pastel-mix-wrap": {
            default:
                "https://images.pexels.com/photos/2879827/pexels-photo-2879827.jpeg?cs=srgb&dl=pexels-secret-garden-333350-2879827.jpg&fm=jpg",
            pastel:
                "https://images.pexels.com/photos/2879827/pexels-photo-2879827.jpeg?cs=srgb&dl=pexels-secret-garden-333350-2879827.jpg&fm=jpg",
            mixed:
                "https://images.pexels.com/photos/2879827/pexels-photo-2879827.jpeg?cs=srgb&dl=pexels-secret-garden-333350-2879827.jpg&fm=jpg",
        },

        "sunshine-gerberas": {
            default:
                "https://images.pexels.com/photos/931179/pexels-photo-931179.jpeg?cs=srgb&dl=pexels-secret-garden-333350-931179.jpg&fm=jpg",
            yellow:
                "https://images.pexels.com/photos/931179/pexels-photo-931179.jpeg?cs=srgb&dl=pexels-secret-garden-333350-931179.jpg&fm=jpg",
            orange:
                "https://images.pexels.com/photos/931179/pexels-photo-931179.jpeg?cs=srgb&dl=pexels-secret-garden-333350-931179.jpg&fm=jpg",
            mixed:
                "https://images.pexels.com/photos/931179/pexels-photo-931179.jpeg?cs=srgb&dl=pexels-secret-garden-333350-931179.jpg&fm=jpg",
        },

        "white-lilies-elegance": {
            default:
                "https://images.pexels.com/photos/7666495/pexels-photo-7666495.jpeg?cs=srgb&dl=pexels-tara-winstead-7666495.jpg&fm=jpg",
            white:
                "https://images.pexels.com/photos/7666495/pexels-photo-7666495.jpeg?cs=srgb&dl=pexels-tara-winstead-7666495.jpg&fm=jpg",
        },
    },
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

    // 2) try slug-based guess (ONLY for non-URL bases)
    if (selected && bouquet.imageBase && !/^https?:\/\//i.test(bouquet.imageBase)) {
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

        // Legacy (keep for compatibility) — now URL-based
        image: IMAGES.bouquets["blush-roses-mini"].default,

        // New image system — now URL-based
        imageBase: "", // keep key, but no local folder
        defaultImage: IMAGES.bouquets["blush-roses-mini"].default,
        colorImages: {
            "Blush Pink": IMAGES.bouquets["blush-roses-mini"].blush,
            White: IMAGES.bouquets["blush-roses-mini"].white,
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

        image: IMAGES.bouquets["red-roses-classic"].default,

        imageBase: "",
        defaultImage: IMAGES.bouquets["red-roses-classic"].default,
        colorImages: {
            Red: IMAGES.bouquets["red-roses-classic"].red,
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

        image: IMAGES.bouquets["pastel-mix-wrap"].default,

        imageBase: "",
        defaultImage: IMAGES.bouquets["pastel-mix-wrap"].default,
        colorImages: {
            Pastel: IMAGES.bouquets["pastel-mix-wrap"].pastel,
            Mixed: IMAGES.bouquets["pastel-mix-wrap"].mixed,
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

        image: IMAGES.bouquets["sunshine-gerberas"].default,

        imageBase: "",
        defaultImage: IMAGES.bouquets["sunshine-gerberas"].default,
        colorImages: {
            Yellow: IMAGES.bouquets["sunshine-gerberas"].yellow,
            Orange: IMAGES.bouquets["sunshine-gerberas"].orange,
            Mixed: IMAGES.bouquets["sunshine-gerberas"].mixed,
        },

        featured: false,
    },
    {
        id: "white-lilies-elegance",
        name: "White Lilies Elegance",
        category: "Lilies",
        shortDescription:
            "Elegant lilies with soft greenery (buds may open over time).",
        priceMin: 450,
        priceMax: 750,
        sizes: ["Standard", "Large"],
        colors: ["White"],
        occasions: ["Thank You", "Housewarming", "Sympathy"],
        addons: ["Card Note", "Vase", "Fairy Lights"],
        leadTimeHours: 24,

        image: IMAGES.bouquets["white-lilies-elegance"].default,

        imageBase: "",
        defaultImage: IMAGES.bouquets["white-lilies-elegance"].default,
        colorImages: {
            White: IMAGES.bouquets["white-lilies-elegance"].white,
        },

        featured: false,
    },
];
