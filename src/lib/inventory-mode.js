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

// BA finding #2: with per-outlet stock authoritative (DR-14), an initial
// stock with no store assignment ("Semua Toko") has nowhere to live — every
// outlet reads its own product_store_stock row (0 without one), so the outlet
// list shows 0 and the sale is refused while the edit form still shows the
// number. An opening stock therefore requires at least one specific store,
// unless the product does not use its own stock (make_to_order).
export const initialStockNeedsStore = (product, stores) =>
  usesProductStock(product) &&
  (Number(product?.stock) || 0) > 0 &&
  (!Array.isArray(stores) || stores.length === 0);
