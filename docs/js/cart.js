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
    addons: normaliseAddons(item.addons),
    qty: Math.max(1, Number(item.qty) || 1),
  };

  const key = stableKey(payload);

  const existing = cart.find((x) => x.key === key);
  if (existing) {
    existing.qty = (Number(existing.qty) || 0) + payload.qty;
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
