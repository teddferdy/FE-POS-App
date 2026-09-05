import { invalidatePurchasePaymentCaches } from "../utils/purchasePaymentCache";

describe("invalidatePurchasePaymentCaches", () => {
  test("invalidates both purchase-payments and purchase-orders query keys", () => {
    const queryClient = { invalidateQueries: jest.fn() };
    invalidatePurchasePaymentCaches(queryClient);
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith(["purchase-payments"]);
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith(["purchase-orders"]);
  });

  test("tolerates a missing queryClient", () => {
    expect(() => invalidatePurchasePaymentCaches(undefined)).not.toThrow();
  });
});
