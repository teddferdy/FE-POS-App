// P1: helpers for the read-only effective-tax summary (GET /tax-config/effective).
// The backend owns the effective rate and findings; nothing here computes tax.
// These helpers only decide which context to ask about, classify transport
// errors by HTTP status, and label row scope. Pure module — safe to unit-test.

const toStoreId = (value) => {
  if (typeof value === "number") return Number.isInteger(value) && value > 0 ? value : null;
  if (typeof value === "string" && /^\d+$/.test(value)) {
    const n = Number(value);
    return n > 0 ? n : null;
  }
  return null;
};

const isBlank = (value) => value === undefined || value === null || value === "";

// Outlet users evaluate their own outlet. A super admin evaluates the selected
// outlet, or the global scope when nothing is selected. Anything malformed is
// "unresolved": no request is sent rather than guessing a scope.
export const resolveEffectiveTaxScope = ({ isSuperAdmin, storeId }) => {
  const store = toStoreId(storeId);
  if (store) return { kind: "outlet", store };
  if (isSuperAdmin && isBlank(storeId)) return { kind: "global", store: null };
  return { kind: "unresolved", store: null };
};

// An outlet row is evaluated in its own outlet; a global row in the caller's
// current context.
export const scopeForTaxRow = (row, fallbackScope) => {
  const store = toStoreId(row?.store);
  return store ? { kind: "outlet", store } : fallbackScope;
};

// Classification is by backend code first, then HTTP status. The endpoint
// answers missing PPN with 400 + code PPN_MISSING; only that code is
// "missing". Every other 400 (INVALID_STORE, INVALID_CHANNEL, unknown codes,
// or no code) stays a generic rejection — a message alone never infers
// missing so unrelated 400s are never mislabelled.
export const classifyEffectiveTaxError = (err) => {
  const status = err?.response?.status;
  if (err?.response?.data?.code === "PPN_MISSING") return "missing";
  if (status === 401) return "unauthorized";
  if (status === 403) return "forbidden";
  if (status === 404) return "unavailable";
  if (status >= 400 && status < 500) return "rejected";
  return "failed";
};

// Client errors never fix themselves; server/network failures retry once.
export const shouldRetryEffectiveTax = (failureCount, err) =>
  classifyEffectiveTaxError(err) === "failed" && failureCount < 1;

export const taxRowScope = (store) => (isBlank(store) ? "global" : "outlet");

// Guards against rendering a summary for a different context than requested.
export const isResponseForScope = (data, scope, channel) => {
  if (!data || typeof data !== "object") return false;
  const responseStore = isBlank(data.store) ? null : Number(data.store);
  return responseStore === (scope?.store ?? null) && data.channel === channel;
};

// Namespaced under "tax-configs" so the list's existing invalidations
// (delete, Excel upload) refresh the summary as well.
export const effectiveTaxQueryKey = (scope, channel) => [
  "tax-configs",
  "effective",
  scope?.store ?? "global",
  channel
];

// Outlet display name from location metadata or the caller's own outlet.
// Returns null rather than exposing an internal id.
export const outletNameFor = (storeId, { locations, activeStoreId, activeStoreName } = {}) => {
  if (isBlank(storeId)) return null;
  const match = (locations || []).find((l) => String(l?.id ?? l?._id) === String(storeId));
  if (match?.name) return match.name;
  if (!isBlank(activeStoreId) && String(activeStoreId) === String(storeId) && activeStoreName) {
    return activeStoreName;
  }
  return null;
};
