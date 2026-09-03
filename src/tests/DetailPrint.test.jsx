import "@testing-library/jest-dom";
import {
  getDocumentSpecForGoodsRequest,
  getDocumentSpecForGoodsReceipt,
  getDocumentSpecForPurchaseOrder,
  getDocumentSpecForProductionOrder,
  getDocumentSpecForDelivery
} from "../components/document/documentMappers";

const T = (k) => k;

describe("document mappers", () => {
  test("maps goods-request data to a FormalDocument spec", () => {
    const spec = getDocumentSpecForGoodsRequest(
      {
        requestNumber: "PB-20260902-0001",
        requestedBy: "Andi",
        storeData: { name: "Toko A" },
        items: [{ ingredientName: "Beras", qty: 10, unit: "kg" }]
      },
      T
    );
    expect(spec.number).toBe("PB-20260902-0001");
    expect(spec.rows[0].item).toBe("Beras");
    expect(spec.rows[0].qty).toBe(10);
    expect(spec.rows[0].unit).toBe("kg");
  });

  test("maps goods-receipt items into a spec", () => {
    const spec = getDocumentSpecForGoodsReceipt(
      {
        receiptNumber: "PB-20260902-0001",
        storeData: { name: "Toko A" },
        purchaseOrderData: { orderNumber: "PO-0001" },
        items: [
          { productData: { nameProduct: "Telur" }, qtyReceived: 5, unit: "kg", costPrice: 20000 }
        ]
      },
      T
    );
    expect(spec.title).toBe("document.suratPenerimaanBarang");
    expect(spec.rows[0].item).toBe("Telur");
    expect(spec.rows[0].qty).toBe(5);
    expect(spec.meta.some((m) => m.value === "PO-0001")).toBe(true);
  });

  test("computes purchase-order line totals", () => {
    const spec = getDocumentSpecForPurchaseOrder(
      {
        orderNumber: "PO-20260902-0001",
        items: [{ ingredientData: { name: "Beras" }, quantity: 3, unit: "kg", price: 10000 }]
      },
      T
    );
    expect(spec.rows[0].total).toContain("30.000");
  });

  test("computes production-order totalRequired from plannedQty", () => {
    const spec = getDocumentSpecForProductionOrder(
      {
        productionNo: "SPP-0001",
        plannedQty: 4,
        bomComponents: [{ ingredientName: "Tepung", qty: 2, unit: "kg" }]
      },
      T
    );
    expect(spec.rows[0].totalRequired).toBe(8);
  });

  test("delivery order maps to an info-sheet spec without line rows", () => {
    const spec = getDocumentSpecForDelivery(
      { orderNumber: "DO-0001", customerName: "Budi", deliveryFee: 15000 },
      T
    );
    expect(spec.title).toBe("document.dokumenPengiriman");
    expect(spec.rows).toHaveLength(0);
  });
});
