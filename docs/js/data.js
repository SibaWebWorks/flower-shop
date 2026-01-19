// js/data.js
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
        "Durbanville (limited slots)"
    ],
    deliveryNotes: [
        "Same-day delivery for CBD/Atlantic Seaboard if ordered before 12:00.",
        "Other areas: 24-hour notice recommended.",
        "Delivery fee depends on distance (confirmed on WhatsApp)."
    ]
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
        image: "assets/images/blush-roses-mini.jpg",
        featured: true
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
        image: "assets/images/red-roses-classic.jpg",
        featured: true
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
        image: "assets/images/pastel-mix-wrap.jpg",
        featured: true
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
        image: "assets/images/sunshine-gerberas.jpg",
        featured: false
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
        image: "assets/images/white-lilies-elegance.jpg",
        featured: false
    }
];
