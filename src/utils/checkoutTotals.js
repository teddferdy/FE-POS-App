// Phase 31 Batch 2 (F-1): display-only mirror of BE canonical totals in
// BE-POS-App api/controller/order.js calculateOrderTotals — discount
// clamped to subtotal, tax rounded on the post-discount base, total floored
// at zero. BE remains authoritative for every persisted financial value;
// this helper only keeps cashier-facing tax/total display consistent with
// what the server will charge.
//
// taxRate is a fraction (e.g. 0.11), matching CheckoutModal's propTaxRate.
export function calculateCheckoutTotals({
  subtotal = 0,
  discount = 0,
  taxRate = 0,
  useTax = true
} = {}) {
  const base = Math.max(0, Number(subtotal) || 0);
  const discountAmount = Math.min(Math.max(0, Math.round(Number(discount) || 0)), base);
  const afterDiscount = base - discountAmount;
  const taxAmount = useTax ? Math.round(afterDiscount * (Number(taxRate) || 0)) : 0;
  const total = Math.max(0, afterDiscount + taxAmount);
  return { subtotal: base, discountAmount, afterDiscount, taxAmount, total };
}
