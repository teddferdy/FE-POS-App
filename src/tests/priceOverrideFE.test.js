import { orderList } from "../state/order-list";

const baseProduct = { id: 1, nameProduct: "Prod A", price: 10000 };
const otherProduct = { id: 2, nameProduct: "Prod B", price: 5000 };

describe("FE price override — order-list priceOverridden semantics", () => {
  beforeEach(() => {
    orderList.setState({ order: [] });
  });

  test("addOrder creates line with priceOverridden false", () => {
    orderList.getState().addOrder(baseProduct);
    const item = orderList.getState().order[0];
    expect(item.price).toBe(10000);
    expect(item.priceOverridden).toBe(false);
  });

  test("updateItemPrice sets priceOverridden true", () => {
    orderList.getState().addOrder(baseProduct);
    const item = orderList.getState().order[0];
    orderList.getState().updateItemPrice(item, 8000);
    const updated = orderList.getState().order[0];
    expect(updated.price).toBe(8000);
    expect(updated.priceOverridden).toBe(true);
    expect(updated.totalPrice).toBe(8000);
  });

  test("explicit override equal to catalog price is still marked as overridden", () => {
    orderList.getState().addOrder(baseProduct);
    const item = orderList.getState().order[0];
    orderList.getState().updateItemPrice(item, 10000);
    const updated = orderList.getState().order[0];
    expect(updated.priceOverridden).toBe(true);
  });

  test("normal line remains priceOverridden false after other line overridden", () => {
    orderList.getState().addOrder(baseProduct);
    orderList.getState().addOrder(otherProduct);
    const first = orderList.getState().order.find((i) => i.id === 1);
    orderList.getState().updateItemPrice(first, 8000);
    const second = orderList.getState().order.find((i) => i.id === 2);
    expect(second.priceOverridden).toBe(false);
  });

  test("re-adding same product after override keeps overridden price", () => {
    orderList.getState().addOrder(baseProduct);
    const item = orderList.getState().order[0];
    orderList.getState().updateItemPrice(item, 8000);
    orderList.getState().addOrder(baseProduct);
    const updated = orderList.getState().order[0];
    expect(updated.count).toBe(2);
    expect(updated.price).toBe(8000);
    expect(updated.priceOverridden).toBe(true);
    expect(updated.totalPrice).toBe(16000);
  });

  test("non-integer override is rejected and does not set priceOverridden", () => {
    orderList.getState().addOrder(baseProduct);
    const item = orderList.getState().order[0];
    orderList.getState().updateItemPrice(item, 8000.5);
    const updated = orderList.getState().order[0];
    expect(updated.price).toBe(10000);
    expect(updated.priceOverridden).toBe(false);
  });
});

describe("FE price override — checkout payload", () => {
  const buildPayloadItems = (items) =>
    items.map((item) => ({
      product: item.product || item.idProduct || item.id,
      quantity: item.count,
      ...(item.priceOverridden ? { priceOverride: item.price } : {}),
      price: item.price,
      basePrice: item.price,
      subtotal: item.totalPrice
    }));

  test("overridden line includes priceOverride, normal line does not", () => {
    orderList.setState({ order: [] });
    orderList.getState().addOrder(baseProduct);
    orderList.getState().addOrder(otherProduct);
    const first = orderList.getState().order.find((i) => i.id === 1);
    orderList.getState().updateItemPrice(first, 8000);
    const payloadItems = buildPayloadItems(orderList.getState().order);
    const overridden = payloadItems.find((i) => i.product === 1);
    const normal = payloadItems.find((i) => i.product === 2);
    expect(overridden.priceOverride).toBe(8000);
    expect(normal.priceOverride).toBeUndefined();
  });

  test("equal-to-catalog override still sends priceOverride", () => {
    orderList.setState({ order: [] });
    orderList.getState().addOrder(baseProduct);
    const item = orderList.getState().order[0];
    orderList.getState().updateItemPrice(item, 10000);
    const payloadItems = buildPayloadItems(orderList.getState().order);
    expect(payloadItems[0].priceOverride).toBe(10000);
  });
});
