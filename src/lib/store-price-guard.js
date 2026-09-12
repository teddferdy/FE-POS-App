// F9-25: per-store prices are edited in local state and only reach the
// backend through each row's Save button. Comparing every row against the
// last-persisted value lets the edit form refuse to silently discard edits
// when the main product save is submitted instead.
export const getUnsavedStorePriceRows = (storePrices = [], savedStorePriceMap = {}) => {
  return storePrices.filter((sp) => {
    if (sp.storeId == null || sp.storeId === "") return false;
    if (!(sp.storeId in savedStorePriceMap)) return false;
    return String(savedStorePriceMap[sp.storeId]) !== String(sp.price ?? "");
  });
};
