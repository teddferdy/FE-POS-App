import { normalizeCatalogProduct, resolveCatalogUnitPrice } from "../utils/catalogPrice";
import { buildOrderItemsPayload, parsePriceChangedError } from "../utils/orderPayload";

// W3-4: catalog effectivePrice (K1) and the /order/create item contract
// (W3-2 expectedPrice + K3 payload integrity).

describe("W3-4 catalog effectivePrice normalization (K1)", () => {
  test("uses effectivePrice as the selling price and marks it authoritative", () => {
    const row = normalizeCatalogProduct({ id: 1, price: 10000, effectivePrice: 12000 });
    expect(row.price).toBe(12000);
    expect(row.priceAuthoritative).toBe(true);
    expect(row.basePrice).toBe(10000);
  });

  test("never falls back to the base price when effectivePrice differs", () => {
    const row = normalizeCatalogProduct({ id: 1, price: 10000, effectivePrice: 8000 });
    expect(row.price).toBe(8000);
    expect(row.price).not.toBe(10000);
  });

  test("an explicit effectivePrice of 0 is preserved (not replaced by the base price)", () => {
    const row = normalizeCatalogProduct({ id: 1, price: 10000, effectivePrice: 0 });
    expect(row.price).toBe(0);
    expect(row.priceAuthoritative).toBe(true);
  });

  test("without effectivePrice the legacy price is display-only, not authoritative", () => {
    expect(resolveCatalogUnitPrice({ price: 10000, effectivePrice: null })).toEqual({
      unitPrice: 10000,
      authoritative: false
    });
    expect(resolveCatalogUnitPrice({ price: 10000 })).toEqual({
      unitPrice: 10000,
      authoritative: false
    });
  });

  test("keeps every other catalog field untouched", () => {
    const source = {
      id: 3,
      price: 5000,
      effectivePrice: 6000,
      stock: 7,
      options: [{ name: "Size" }]
    };
    const row = normalizeCatalogProduct(source);
    expect(row.stock).toBe(7);
    expect(row.options).toBe(source.options);
    expect(source.price).toBe(5000);
  });
});

const productLine = (overrides = {}) => ({
  cartKey: "1_",
  idProduct: 1,
  nameProduct: "Kopi",
  price: 12000,
  count: 2,
  totalPrice: 24000,
  priceAuthoritative: true,
  ...overrides
});

describe("W3-4 /order/create item payload (W3-2 + K3)", () => {
  test("expectedPrice equals the authoritative unit price shown to the cashier", () => {
    const [line] = buildOrderItemsPayload([productLine()]);
    expect(line).toMatchObject({
      product: 1,
      productName: "Kopi",
      quantity: 2,
      expectedPrice: 12000,
      price: 12000,
      subtotal: 24000
    });
    expect(line).not.toHaveProperty("priceOverride");
  });

  test("an explicit authoritative 0 is still sent as expectedPrice 0", () => {
    const [line] = buildOrderItemsPayload([productLine({ price: 0, totalPrice: 0 })]);
    expect(line.expectedPrice).toBe(0);
  });

  test("no expectedPrice is manufactured from a non-authoritative (legacy) price", () => {
    const [line] = buildOrderItemsPayload([productLine({ priceAuthoritative: false })]);
    expect(line).not.toHaveProperty("expectedPrice");
  });

  test("a price override survives as priceOverride and is never also sent as expectedPrice", () => {
    const [line] = buildOrderItemsPayload([
      productLine({ price: 8000, totalPrice: 16000, priceOverridden: true })
    ]);
    expect(line.priceOverride).toBe(8000);
    expect(line).not.toHaveProperty("expectedPrice");
  });

  test("a bundle is sent as bundleId with its bundlePrice — never as a product id or override", () => {
    const [line] = buildOrderItemsPayload([
      {
        cartKey: "bundle:7",
        idProduct: 7,
        nameProduct: "Paket Hemat",
        price: 50000,
        count: 1,
        totalPrice: 50000,
        isBundle: true,
        bundleId: 7,
        priceAuthoritative: true,
        priceOverridden: true
      }
    ]);
    expect(line).toEqual({
      bundleId: 7,
      bundleName: "Paket Hemat",
      quantity: 1,
      price: 50000,
      subtotal: 50000,
      expectedPrice: 50000
    });
    expect(line).not.toHaveProperty("product");
    expect(line).not.toHaveProperty("priceOverride");
  });

  test("options and modifiers are sent as separate arrays", () => {
    const [line] = buildOrderItemsPayload([
      productLine({
        price: 15000,
        variantName: "Size - Large + Extra Shot",
        selectedOptions: [{ name: "Size - Large" }],
        selectedModifiers: [{ name: "Extra Shot" }]
      })
    ]);
    expect(line.options).toEqual([{ name: "Size - Large" }]);
    expect(line.modifiers).toEqual([{ name: "Extra Shot" }]);
    expect(line.expectedPrice).toBe(15000);
  });

  test("legacy lines without stored selections keep the existing variantName option", () => {
    const [line] = buildOrderItemsPayload([
      productLine({ variantName: "Hot", priceAuthoritative: false })
    ]);
    expect(line.options).toEqual([{ name: "Hot" }]);
    expect(line.modifiers).toEqual([]);
  });
});

describe("W3-4 409 PRICE_CHANGED parsing", () => {
  const submitted = [
    productLine({ cartKey: "1_", idProduct: 1, nameProduct: "Kopi" }),
    productLine({ cartKey: "2_", idProduct: 2, nameProduct: "Teh", price: 8000 }),
    {
      cartKey: "bundle:7",
      idProduct: 7,
      nameProduct: "Paket",
      isBundle: true,
      bundleId: 7,
      price: 50000,
      count: 1
    }
  ];
  const conflict = (items) => ({
    response: {
      status: 409,
      data: {
        code: "PRICE_CHANGED",
        message: "One or more item prices changed. Please review the updated prices and resubmit.",
        items
      }
    }
  });

  test("maps every mismatch back to its cart line by request index and identity", () => {
    const parsed = parsePriceChangedError(
      conflict([
        { index: 0, productId: 1, expectedPrice: 12000, currentPrice: 13000 },
        { index: 2, bundleId: 7, expectedPrice: 50000, currentPrice: 55000 }
      ]),
      submitted
    );
    expect(parsed.items).toEqual([
      expect.objectContaining({ index: 0, cartKey: "1_", name: "Kopi", currentPrice: 13000 }),
      expect.objectContaining({ index: 2, cartKey: "bundle:7", name: "Paket", currentPrice: 55000 })
    ]);
  });

  test("an index whose line identity does not match is left unmapped (never misapplied)", () => {
    const parsed = parsePriceChangedError(
      conflict([{ index: 1, productId: 999, expectedPrice: 8000, currentPrice: 9000 }]),
      submitted
    );
    expect(parsed.items[0].cartKey).toBeNull();
  });

  test("other errors are not treated as PRICE_CHANGED", () => {
    expect(parsePriceChangedError(new Error("network"), submitted)).toBeNull();
    expect(
      parsePriceChangedError(
        { response: { status: 409, data: { message: "idempotencyKey already used" } } },
        submitted
      )
    ).toBeNull();
    expect(
      parsePriceChangedError({
        response: { status: 400, data: { code: "PRICE_CHANGED", items: [] } }
      })
    ).toBeNull();
  });
});
