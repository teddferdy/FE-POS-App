import { orderList } from "../state/order-list";

const baseItem = {
  id: 1,
  cartKey: "1_",
  nameProduct: "Product A",
  price: 10000,
  count: 2,
  totalPrice: 20000
};

describe("order-list store: price override safety (F7-01)", () => {
  beforeEach(() => {
    orderList.setState({ order: [baseItem] });
  });

  test("a valid positive price updates price and recalculates totalPrice for that item's quantity", () => {
    orderList.getState().updateItemPrice(baseItem, 15000);
    const item = orderList.getState().order[0];
    expect(item.price).toBe(15000);
    expect(item.totalPrice).toBe(30000); // 15000 * count(2)
  });

  test("updating price does not change quantity or product identity", () => {
    orderList.getState().updateItemPrice(baseItem, 15000);
    const item = orderList.getState().order[0];
    expect(item.count).toBe(2);
    expect(item.id).toBe(1);
    expect(item.cartKey).toBe("1_");
    expect(item.nameProduct).toBe("Product A");
  });

  test("a non-numeric price is rejected and the cart is left untouched", () => {
    orderList.getState().updateItemPrice(baseItem, "abc");
    const item = orderList.getState().order[0];
    expect(item.price).toBe(10000);
    expect(item.totalPrice).toBe(20000);
  });

  test("a negative price is rejected and the cart is left untouched", () => {
    orderList.getState().updateItemPrice(baseItem, -500);
    const item = orderList.getState().order[0];
    expect(item.price).toBe(10000);
    expect(item.totalPrice).toBe(20000);
  });

  test("an empty-string price is rejected and cannot corrupt cart state with NaN", () => {
    orderList.getState().updateItemPrice(baseItem, "");
    const item = orderList.getState().order[0];
    expect(item.price).toBe(10000);
    expect(Number.isNaN(item.price)).toBe(false);
    expect(Number.isNaN(item.totalPrice)).toBe(false);
  });

  test("a zero price is accepted (free/comped item is a legitimate override)", () => {
    orderList.getState().updateItemPrice(baseItem, 0);
    const item = orderList.getState().order[0];
    expect(item.price).toBe(0);
    expect(item.totalPrice).toBe(0);
  });

  test("Infinity is rejected and cannot corrupt cart state", () => {
    orderList.getState().updateItemPrice(baseItem, Infinity);
    const item = orderList.getState().order[0];
    expect(item.price).toBe(10000);
    expect(item.totalPrice).toBe(20000);
  });

  test("price override on one item does not affect other items in the cart", () => {
    const other = {
      id: 2,
      cartKey: "2_",
      nameProduct: "Product B",
      price: 5000,
      count: 1,
      totalPrice: 5000
    };
    orderList.setState({ order: [baseItem, other] });
    orderList.getState().updateItemPrice(baseItem, 12000);
    const items = orderList.getState().order;
    expect(items.find((i) => i.cartKey === "2_")).toEqual(other);
  });
});

describe("order-list store: regression around price-override change", () => {
  beforeEach(() => {
    orderList.setState({ order: [] });
  });

  test("addOrder adds a new product with the correct initial price and count", () => {
    orderList.getState().addOrder({ id: 9, nameProduct: "New", price: 1000 });
    const items = orderList.getState().order;
    expect(items).toHaveLength(1);
    expect(items[0].count).toBe(1);
    expect(items[0].totalPrice).toBe(1000);
  });

  test("incrementOrder increases count and totalPrice by one unit price", () => {
    orderList.setState({ order: [baseItem] });
    orderList.getState().incrementOrder(baseItem);
    const item = orderList.getState().order[0];
    expect(item.count).toBe(3);
    expect(item.totalPrice).toBe(30000);
  });

  test("decrementOrder decreases count and totalPrice by one unit price", () => {
    orderList.setState({ order: [baseItem] });
    orderList.getState().decrementOrder(baseItem);
    const item = orderList.getState().order[0];
    expect(item.count).toBe(1);
    expect(item.totalPrice).toBe(10000);
  });

  test("handleDeleteOrder removes the item by cartKey", () => {
    orderList.setState({ order: [baseItem] });
    orderList.getState().handleDeleteOrder(baseItem);
    expect(orderList.getState().order).toHaveLength(0);
  });

  test("resetOrder clears the whole cart", () => {
    orderList.setState({ order: [baseItem] });
    orderList.getState().resetOrder();
    expect(orderList.getState().order).toHaveLength(0);
  });
});
