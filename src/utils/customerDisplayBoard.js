export const CART_MIRROR_KEY = "customer-display-cart";
export const DISPLAY_EVENT_KEY = "customer-display-event";

export const DISPLAY_EVENT_TYPES = {
  TRANSACTION_SUCCESS: "transaction-success",
  QRIS_PAYMENT_REQUEST: "qris-payment-request"
};

export const EMPTY_CART_MIRROR = {
  totalItems: 0,
  subtotal: 0,
  taxRate: 0,
  taxAmount: 0,
  total: 0,
  items: [],
  updatedAt: Date.now()
};

export const dispatchDisplayEvent = (payload) => {
  try {
    localStorage.setItem(
      DISPLAY_EVENT_KEY,
      JSON.stringify({
        ...payload,
        eventId: `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`,
        dispatchedAt: Date.now()
      })
    );
  } catch {
    // localStorage unavailable; silently ignore
  }
};

export const readDisplayEvent = () => {
  try {
    const raw = localStorage.getItem(DISPLAY_EVENT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && parsed.eventId ? parsed : null;
  } catch {
    return null;
  }
};

export const clearDisplayEvent = () => {
  try {
    localStorage.removeItem(DISPLAY_EVENT_KEY);
  } catch {
    // localStorage unavailable; silently ignore
  }
};
