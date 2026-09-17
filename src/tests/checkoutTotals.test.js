import { calculateCheckoutTotals } from "../utils/checkoutTotals";

// Phase 31 Batch 2 (F-1): FE checkout display must mirror BE canonical
// semantics in api/controller/order.js calculateOrderTotals — discount
// clamped to subtotal, tax rounded on the post-discount base. BE stays
// authoritative for persisted values; these are display/parity vectors.

describe("calculateCheckoutTotals — BE parity", () => {
  test("no discount, 11% tax", () => {
    expect(
      calculateCheckoutTotals({ subtotal: 100000, discount: 0, taxRate: 0.11, useTax: true })
    ).toEqual({
      subtotal: 100000,
      discountAmount: 0,
      afterDiscount: 100000,
      taxAmount: 11000,
      total: 111000
    });
  });

  test("10% discount is taxed on the post-discount base (not pre-discount)", () => {
    // Old FE showed tax 11000 / total 101000; BE charges tax 9900 / total 99900.
    expect(
      calculateCheckoutTotals({ subtotal: 100000, discount: 10000, taxRate: 0.11, useTax: true })
    ).toEqual({
      subtotal: 100000,
      discountAmount: 10000,
      afterDiscount: 90000,
      taxAmount: 9900,
      total: 99900
    });
  });

  test("percent-float discount is rounded like BE Math.round", () => {
    // 999 * 10% = 99.9 -> 100; base 899; tax 11% = 98.89 -> 99.
    expect(
      calculateCheckoutTotals({ subtotal: 999, discount: 99.9, taxRate: 0.11, useTax: true })
    ).toEqual({
      subtotal: 999,
      discountAmount: 100,
      afterDiscount: 899,
      taxAmount: 99,
      total: 998
    });
  });

  test("nominal discount larger than subtotal is clamped, total floors at 0", () => {
    expect(
      calculateCheckoutTotals({ subtotal: 100000, discount: 150000, taxRate: 0.11, useTax: true })
    ).toEqual({
      subtotal: 100000,
      discountAmount: 100000,
      afterDiscount: 0,
      taxAmount: 0,
      total: 0
    });
  });

  test("useTax false yields zero tax", () => {
    expect(
      calculateCheckoutTotals({ subtotal: 100000, discount: 10000, taxRate: 0.11, useTax: false })
    ).toEqual({
      subtotal: 100000,
      discountAmount: 10000,
      afterDiscount: 90000,
      taxAmount: 0,
      total: 90000
    });
  });

  test("negative discount is treated as zero", () => {
    expect(
      calculateCheckoutTotals({ subtotal: 50000, discount: -2000, taxRate: 0.11, useTax: true })
    ).toEqual({
      subtotal: 50000,
      discountAmount: 0,
      afterDiscount: 50000,
      taxAmount: 5500,
      total: 55500
    });
  });

  test("defaults are safe for missing inputs", () => {
    expect(calculateCheckoutTotals({})).toEqual({
      subtotal: 0,
      discountAmount: 0,
      afterDiscount: 0,
      taxAmount: 0,
      total: 0
    });
  });
});
