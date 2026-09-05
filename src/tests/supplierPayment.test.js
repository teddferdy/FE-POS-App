import { getPayablePurchaseOrders } from "../utils/supplierPayment";

describe("getPayablePurchaseOrders", () => {
  test("returns only purchase orders with an outstanding balance", () => {
    const orders = [
      { id: 1, orderNumber: "PO-1", finalAmount: "100000", payments: [{ amount: "50000" }] },
      { id: 2, orderNumber: "PO-2", finalAmount: "100000", payments: [{ amount: "100000" }] },
      { id: 3, orderNumber: "PO-3", finalAmount: "50000", payments: [] }
    ];

    const payable = getPayablePurchaseOrders(orders);

    expect(payable.map((p) => p.id)).toEqual([1, 3]);
  });

  test("computes outstanding as finalAmount minus summed payments", () => {
    const orders = [
      {
        id: 7,
        orderNumber: "PO-7",
        finalAmount: "200000",
        payments: [{ amount: "40000" }, { amount: "10000" }, { amount: "50000" }]
      }
    ];

    const [po] = getPayablePurchaseOrders(orders);

    expect(po.amountPaid).toBe(100000);
    expect(po.outstanding).toBe(100000);
  });

  test("treats missing finalAmount or payments defensively", () => {
    const orders = [{ id: 9, orderNumber: "PO-9" }];

    expect(() => getPayablePurchaseOrders(orders)).not.toThrow();
    expect(getPayablePurchaseOrders(orders)).toEqual([]);
  });

  test("returns empty array for empty input", () => {
    expect(getPayablePurchaseOrders([])).toEqual([]);
    expect(getPayablePurchaseOrders(undefined)).toEqual([]);
  });
});
