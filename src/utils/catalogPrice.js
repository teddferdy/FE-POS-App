// W3-4 (DR-11, K1): the cashier catalog (GET /product/get-product-by-super-admin)
// exposes `effectivePrice` — the server-authoritative outlet unit price (outlet
// price row for the active store, otherwise base). The FE never computes outlet
// pricing; it only normalizes the catalog row it already received so every
// existing reader of `product.price` (grid tiles, variant/detail modals, cart)
// uses the authoritative value.
//
// `priceAuthoritative` marks a price the server stands behind, which is what
// allows checkout to echo it back as `expectedPrice`. A row without a usable
// `effectivePrice` (e.g. no store resolved) keeps the legacy display price but
// is NOT authoritative, so no expectedPrice is ever manufactured from it.

const toFiniteNumber = (value) => {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

export const resolveCatalogUnitPrice = (product) => {
  const effective = toFiniteNumber(product?.effectivePrice);
  if (effective !== null) {
    // Explicit 0 is a valid outlet price — never replaced by the base price.
    return { unitPrice: effective, authoritative: true };
  }
  return {
    unitPrice: Number(product?.price || product?.sellPrice || 0),
    authoritative: false
  };
};

export const normalizeCatalogProduct = (product) => {
  if (!product) return product;
  const { unitPrice, authoritative } = resolveCatalogUnitPrice(product);
  return {
    ...product,
    // Base catalog price kept for reference only; selling uses `price`.
    basePrice: product.price,
    price: unitPrice,
    priceAuthoritative: authoritative
  };
};
