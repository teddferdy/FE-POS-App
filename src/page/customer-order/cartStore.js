const CART_KEY = "kk_cart";

export const loadCart = () => {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || "[]");
  } catch {
    return [];
  }
};

export const saveCart = (cart) => {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
};

export const addItem = (item) => {
  const cart = loadCart();
  const idx = cart.findIndex(
    (i) => i.productId === item.productId && i.variantLabel === item.variantLabel
  );
  if (idx >= 0) {
    cart[idx].quantity += item.quantity || 1;
  } else {
    cart.push({ ...item, quantity: item.quantity || 1 });
  }
  saveCart(cart);
  return cart;
};

export const updateQty = (productId, variantLabel, delta) => {
  const cart = loadCart()
    .map((i) =>
      i.productId === productId && i.variantLabel === variantLabel
        ? { ...i, quantity: Math.max(1, i.quantity + delta) }
        : i
    )
    .filter((i) => i.quantity > 0);
  saveCart(cart);
  return cart;
};

export const removeItem = (productId, variantLabel) => {
  const cart = loadCart().filter(
    (i) => !(i.productId === productId && i.variantLabel === variantLabel)
  );
  saveCart(cart);
  return cart;
};

export const clearCart = () => {
  localStorage.removeItem(CART_KEY);
};
