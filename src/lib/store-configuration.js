/**
 * W3 store configuration form helpers (pure, no React).
 *
 * Three explicit stages:
 *   1. toStoreConfigurationFormValues — server projection -> form defaults,
 *      using exactly the types the inputs produce so an untouched field is
 *      never seen as changed.
 *   2. STORE_CONFIGURATION_TRANSFORMS — form value -> outgoing PUT value.
 *   3. buildStoreConfigurationPayload — dirty-only payload: a field is sent
 *      only when its outgoing value differs from its default's outgoing
 *      value. `mainBranch` is never an input: it is derived from `category`
 *      and sent together with it, only when `category` changed.
 */

// React Query keys: ["store-configuration", normalizedId] for a detail and
// ["store-configurations", page, limit] for list pages.
export const STORE_CONFIGURATION_QUERY_KEY = "store-configuration";
export const STORE_CONFIGURATIONS_QUERY_KEY = "store-configurations";

export const STORE_CATEGORIES = Object.freeze(["Main Branch", "Branch", "Warehouse", "Office"]);

export const STORE_CATEGORY_LABEL_KEYS = Object.freeze({
  "Main Branch": "page.location.category.mainBranch",
  Branch: "page.location.category.branch",
  Warehouse: "page.location.category.warehouse",
  Office: "page.location.category.office"
});

// Statuses whose configuration can no longer change (the backend answers a
// PUT on them with 422 STORE_STATUS_IRREVERSIBLE).
export const TERMINAL_STORE_STATUSES = Object.freeze(["closed", "retired", "quarantined"]);

export const isTerminalStoreStatus = (status) => TERMINAL_STORE_STATUSES.includes(status);

export const STORE_CONFIGURATION_FIELDS = Object.freeze([
  "description",
  "timezone",
  "maxActiveParkedCarts",
  "parkedCartTtlMinutes",
  "dailyTarget",
  "category"
]);

// INTEGER (INT4) columns.
export const MAX_INT4 = 2147483647;
// The backend parked-cart runtime caps the TTL at 24 hours.
export const MAX_PARKED_CART_TTL_MINUTES = 1440;

const toNumberOrEmpty = (value) => {
  if (value === null || value === undefined || value === "") return "";
  const n = Number(value);
  return Number.isFinite(n) ? n : "";
};

export const toStoreConfigurationFormValues = (store = {}) => ({
  description: store?.description ?? "",
  timezone: store?.timezone ?? "",
  maxActiveParkedCarts: toNumberOrEmpty(store?.maxActiveParkedCarts),
  parkedCartTtlMinutes: toNumberOrEmpty(store?.parkedCartTtlMinutes),
  dailyTarget: store?.dailyTarget == null ? 0 : toNumberOrEmpty(store.dailyTarget),
  // The server projection already represents a null category as "Main Branch".
  category: store?.category ?? ""
});

const emptyToNull = (value) =>
  value === "" || value === null || value === undefined ? null : value;

export const STORE_CONFIGURATION_TRANSFORMS = Object.freeze({
  description: (value) => {
    const text = typeof value === "string" ? value.trim() : "";
    return text === "" ? null : text;
  },
  timezone: (value) => value,
  maxActiveParkedCarts: (value) => {
    const v = emptyToNull(value);
    return v === null ? null : Math.trunc(Number(v));
  },
  parkedCartTtlMinutes: (value) => {
    const v = emptyToNull(value);
    return v === null ? null : Math.trunc(Number(v));
  },
  dailyTarget: (value) => {
    const v = emptyToNull(value);
    return v === null ? 0 : Math.trunc(Number(v));
  },
  category: (value) => value
});

/**
 * Builds the dirty-only W3 PUT payload. Returns null when nothing changed,
 * so the caller never sends an empty PUT. Neither argument is mutated.
 */
export const buildStoreConfigurationPayload = ({ id, values = {}, defaults = {} }) => {
  const changes = {};
  for (const field of STORE_CONFIGURATION_FIELDS) {
    const transform = STORE_CONFIGURATION_TRANSFORMS[field];
    const next = transform(values[field]);
    if (next !== transform(defaults[field])) changes[field] = next;
  }
  if (Object.keys(changes).length === 0) return null;
  if ("category" in changes) changes.mainBranch = changes.category === "Main Branch";
  return { id, ...changes };
};
