// F7 product fulfillment strategy (BE product.inventoryMode):
//   stocked        finished-good stock is deducted (default)
//   make_to_order  the recipe (BOM) ingredients are deducted instead
//   hybrid         both are deducted
export const INVENTORY_MODES = ["stocked", "make_to_order", "hybrid"];

// Whether the product's OWN finished-good stock limits selling. A
// make_to_order product is limited by its recipe's ingredients instead (the
// backend refuses the sale with 409 INGREDIENT_STOCK_CONFLICT), so its product
// stock — usually 0 — must never mark it out of stock.
export const usesProductStock = (product) =>
  (product?.inventoryMode || "stocked") !== "make_to_order";
