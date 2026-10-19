// Three explicit opening-stock states: recorded (known provenance),
// unrecorded (a value exists but its provenance is unverified) and
// uninitialized (never entered; its 0 is unknown, not a verified zero).
// Falls back to the older boolean for cached responses.
export const getIngredientStockState = (item) => {
  if (item?.stockState) return item.stockState;
  if (item?.openingStockRecorded) return "recorded";
  const value = Number(item?.stock ?? item?.closingBalance ?? item?.currentStock ?? 0);
  return value === 0 ? "uninitialized" : "unrecorded";
};
