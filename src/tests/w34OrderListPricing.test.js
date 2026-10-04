import { orderList } from "../state/order-list";
import { normalizeCatalogProduct } from "../utils/catalogPrice";

// W3-4: cart lines carry the authoritative price, bundles, and separate
// option/modifier selections; server prices are only applied explicitly.

describe("W3-4 order-list cart pricing", () => {
  beforeEach(() => {
    orderList.getState().resetOrder();
  });

  test("a cart line uses the catalog effectivePrice, not the base price", () => {
    orderList
      .getState()
      .addOrder(
        normalizeCatalogProduct({ id: 1, nameProduct: "Kopi", price: 10000, effectivePrice: 12000 })
      );
    const [line] = orderList.getState().order;
    expect(line.price).toBe(12000);
    expect(line.totalPrice).toBe(12000);
    expect(line.priceAuthoritative).toBe(true);
    expect(line.priceOverridden).toBe(false);
  });

  test("re-adding the same product still totals by the effective price", () => {
    const product = normalizeCatalogProduct({
      id: 1,
      nameProduct: "Kopi",
      price: 10000,
      effectivePrice: 12000
    });
    orderList.getState().addOrder(product);
    orderList.getState().addOrder(product);
    const [line] = orderList.getState().order;
    expect(line.count).toBe(2);
    expect(line.totalPrice).toBe(24000);
  });

  test("a bundle keeps isBundle/bundleId and never merges with a product sharing its id", () => {
    orderList.getState().addOrder(
      normalizeCatalogProduct({
        id: 7,
        nameProduct: "Produk 7",
        price: 5000,
        effectivePrice: 5000
      })
    );
    orderList.getState().addOrder({
      id: 7,
      bundleId: 7,
      nameProduct: "Paket 7",
      price: 50000,
      isBundle: true,
      priceAuthoritative: true
    });
    const lines = orderList.getState().order;
    expect(lines).toHaveLength(2);
    const bundle = lines.find((l) => l.isBundle);
    expect(bundle).toMatchObject({ bundleId: 7, cartKey: "bundle:7", price: 50000 });
  });

  test("selected options and modifiers are stored separately and distinguish lines", () => {
    const base = normalizeCatalogProduct({
      id: 1,
      nameProduct: "Kopi",
      price: 10000,
      effectivePrice: 10000
    });
    orderList.getState().addOrder({
      ...base,
      variantName: "Size - Large",
      price: 12000,
      selectedOptions: [{ name: "Size - Large" }],
      selectedModifiers: []
    });
    orderList.getState().addOrder({
      ...base,
      variantName: "Size - Large + Extra Shot",
      price: 15000,
      selectedOptions: [{ name: "Size - Large" }],
      selectedModifiers: [{ name: "Extra Shot" }]
    });
    const lines = orderList.getState().order;
    expect(lines).toHaveLength(2);
    expect(lines[0].selectedOptions).toEqual([{ name: "Size - Large" }]);
    expect(lines[0]).not.toHaveProperty("selectedModifiers");
    expect(lines[1].selectedModifiers).toEqual([{ name: "Extra Shot" }]);
    // The single-choice key format is unchanged from before W3-4.
    expect(lines[0].cartKey).toBe("1_Size - Large");
  });

  test("a plain product keeps its existing cart key format", () => {
    orderList
      .getState()
      .addOrder(
        normalizeCatalogProduct({ id: 5, nameProduct: "Air", price: 3000, effectivePrice: 3000 })
      );
    expect(orderList.getState().order[0].cartKey).toBe("5_");
  });

  test("applyServerPrices updates only the listed lines, as catalog (not override) prices", () => {
    const kopi = normalizeCatalogProduct({
      id: 1,
      nameProduct: "Kopi",
      price: 10000,
      effectivePrice: 12000
    });
    const teh = normalizeCatalogProduct({
      id: 2,
      nameProduct: "Teh",
      price: 8000,
      effectivePrice: 8000
    });
    orderList.getState().addOrder(kopi);
    orderList.getState().addOrder(kopi);
    orderList.getState().addOrder(teh);
    const tehBefore = orderList.getState().order[1];

    orderList.getState().applyServerPrices([{ cartKey: "1_", price: 13000 }]);

    const [kopiLine, tehLine] = orderList.getState().order;
    expect(kopiLine).toMatchObject({
      price: 13000,
      totalPrice: 26000,
      count: 2,
      priceOverridden: false,
      priceAuthoritative: true
    });
    expect(tehLine).toBe(tehBefore);
  });

  test("applyServerPrices ignores invalid prices and leaves the cart untouched", () => {
    orderList
      .getState()
      .addOrder(
        normalizeCatalogProduct({ id: 1, nameProduct: "Kopi", price: 10000, effectivePrice: 12000 })
      );
    const before = orderList.getState().order;
    orderList.getState().applyServerPrices([
      { cartKey: "1_", price: -5 },
      { cartKey: "1_", price: "x" }
    ]);
    expect(orderList.getState().order).toBe(before);
  });
});
