let sequence = 0;
export const newPurchasePaymentKey = () =>
  globalThis?.crypto?.randomUUID?.() ||
  `${Date.now()}-${sequence++}-${Math.random().toString(36).slice(2)}`;
