import { newPurchasePaymentKey } from "../utils/paymentIdempotency";

describe("newPurchasePaymentKey", () => {
  test("returns a non-empty string", () => {
    expect(typeof newPurchasePaymentKey()).toBe("string");
    expect(newPurchasePaymentKey().length).toBeGreaterThan(0);
  });

  test("returns a different key on each call", () => {
    const keyA = newPurchasePaymentKey();
    const keyB = newPurchasePaymentKey();
    expect(keyA).not.toBe(keyB);
  });
});
