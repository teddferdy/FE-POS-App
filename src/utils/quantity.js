// Stock quantities are DECIMAL columns (e.g. ingredient.stock is
// DECIMAL(10,4)), which the API returns as strings such as "400.0000".
// Shown raw, an Indonesian reader sees "400.0000" as four hundred thousand,
// and a digit-only input filter turns it into 4000000. Always read a
// quantity as a number and print it in id-ID notation.
export const toQuantity = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

export const formatQuantity = (value) =>
  toQuantity(value).toLocaleString("id-ID", { maximumFractionDigits: 4 });
