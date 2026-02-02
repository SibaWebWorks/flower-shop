const CART_KEY = "sb_cart_v1";

function safeJsonParse(value, fallback) {
  try {
    return JSON.parse(value) ?? fallback;
  } catch {
    return fallback;
  }
}

function readCart() {
  return safeJsonParse(localStorage.getItem(CART_KEY), []);
}

function writeCart(items) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

function normaliseAddons(addons) {
  return (addons || []).slice().map(String).sort();
}

function stableKey(item) {
  // Separate line items for same bouquet with different options
  const addons = normaliseAddons(item.addons).join("|");
  return [item.id, item.size || "", item.color || "", addons].join("::");
}

function normaliseStringOrNull(v) {
  if (v === undefined || v === null) return null;
  const s = String(v).trim();
  return s ? s : null;
}

export function getCart() {
  return readCart();
}

export function clearCart() {
  writeCart([]);
}

export function getCartCount() {
  return readCart().reduce((sum, i) => sum + (Number(i.qty) || 0), 0);
}

export function addToCart(item) {
  const cart = readCart();

  const payload = {
    id: String(item.id),
    name: String(item.name),
    priceMin: Number(item.priceMin) || 0,
    priceMax: Number(item.priceMax) || 0,
    size: item.size ? String(item.size) : null,
    color: item.color ? String(item.color) : null,
    image: item.image ? String(item.image) : null, // ✅ store image (URL or relative)
    addons: normaliseAddons(item.addons),
    qty: Math.max(1, Number(item.qty) || 1),
  };

  const key = stableKey(payload);

  const existing = cart.find((x) => x.key === key);
  if (existing) {
    existing.qty = (Number(existing.qty) || 0) + payload.qty;
    // If we ever add a newer image, keep it
    if (payload.image) existing.image = payload.image;
  } else {
    cart.push({ ...payload, key });
  }

  writeCart(cart);
}

export function updateQty(key, qty) {
  const cart = readCart();
  const n = Math.max(0, Number(qty) || 0);

  const next = cart
    .map((i) => (i.key === key ? { ...i, qty: n } : i))
    .filter((i) => (Number(i.qty) || 0) > 0);

  writeCart(next);
}

export function removeItem(key) {
  const cart = readCart().filter((i) => i.key !== key);
  writeCart(cart);
}

/**
 * Update an existing cart line item by key.
 * IMPORTANT: size/color/addons affect the stable key.
 * So we recompute the key and merge if it collides with another line item.
 */
export function updateItem(key, patch) {
  const cart = readCart();
  const idx = cart.findIndex((x) => x.key === key);
  if (idx === -1) return;

  const current = cart[idx];

  const nextCandidate = {
    ...current,
    ...patch,
  };

  // Ensure clean normalised shapes
  nextCandidate.size = normaliseStringOrNull(nextCandidate.size);
  nextCandidate.color = normaliseStringOrNull(nextCandidate.color);
  nextCandidate.addons = normaliseAddons(nextCandidate.addons);

  // Keep image nullable + trimmed
  nextCandidate.image = normaliseStringOrNull(nextCandidate.image);

  // Recompute key when options change
  const nextKey = stableKey(nextCandidate);

  // If key unchanged, just write updated item
  if (nextKey === current.key) {
    cart[idx] = { ...nextCandidate, key: current.key };
    writeCart(cart);
    return;
  }

  // Key changed -> may collide with an existing line item
  const existingIdx = cart.findIndex((x) => x.key === nextKey);

  if (existingIdx !== -1) {
    const mergedQty =
      (Number(cart[existingIdx].qty) || 0) + (Number(nextCandidate.qty) || 0);

    cart[existingIdx] = {
      ...cart[existingIdx],
      qty: Math.max(1, mergedQty),
      // Prefer the newest image if present
      image: nextCandidate.image || cart[existingIdx].image || null,
    };

    cart.splice(idx, 1);
    writeCart(cart);
    return;
  }

  cart[idx] = { ...nextCandidate, key: nextKey };
  writeCart(cart);
}
