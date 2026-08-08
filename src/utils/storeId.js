export const normalizeStoreId = (value) => {
  if (value === null || value === undefined) return "";
  const s = String(value);
  if (s === "all") return "all";
  return s.replace(/^loc-0*/, "");
};

export const storeIdsEqual = (a, b) => {
  const na = normalizeStoreId(a);
  const nb = normalizeStoreId(b);
  if (na === "" || nb === "") return false;
  return na === nb;
};
