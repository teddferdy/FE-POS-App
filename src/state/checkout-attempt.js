import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// DR-23 §K (BA §35.10) — one counter-sale attempt per store, owned outside
// CheckoutModal so its idempotency key and the exact payload it sent survive
// the modal closing/reopening and a tab reload (same sessionStorage scope as
// the cart in order-list.js; cleared with the tab).
//
// status:
//   draft     — nothing in flight; the key is reused for the next submit
//               (also after a definitive refusal, which wrote nothing)
//   in_flight — a create request is pending; `payload` is frozen
//   unknown   — the request's outcome is unknown (network loss, 5xx, reload
//               mid-flight, or a 409 whose contract does not say whether the
//               sale was written — `reason` "unconfirmed" + `serverMessage`):
//               only the SAME payload may be resent, under the same key —
//               the server replays it if it was recorded
//   conflict  — the server says this key already recorded a sale
//               (409 IDEMPOTENCY_MISMATCH); `existingOrder` identifies it
//               when the server provided it
//   recorded  — the sale was created (201/200 replay) but its receipt has
//               not been shown yet (e.g. the modal closed mid-request);
//               `existingOrder` identifies it
// A resolved attempt (success, recovered order, or an explicit cashier
// decision) is removed, so the next sale mints a new key.

export const ATTEMPT_STATUS = Object.freeze({
  DRAFT: "draft",
  IN_FLIGHT: "in_flight",
  UNKNOWN: "unknown",
  CONFLICT: "conflict",
  RECORDED: "recorded"
});

export const mintIdempotencyKey = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

const storeKey = (store) => String(store ?? "");

// Requests actually running in THIS page (memory only, never persisted). A
// persisted `in_flight` whose key is not here belongs to a page that is gone
// (reload/crash): its outcome is unknown, never "still processing".
const liveRequestKeys = new Set();
export const beginLiveRequest = (key) => liveRequestKeys.add(key);
export const endLiveRequest = (key) => liveRequestKeys.delete(key);
export const isRequestLive = (key) => liveRequestKeys.has(key);

// A tab reload while a request was in flight leaves its outcome unknown.
// Applied in persist's `merge`, which runs synchronously during hydration —
// sessionStorage hydrates inside create(), before `checkoutAttempts` exists,
// so nothing here may reference the store. Key and payload are kept; other
// statuses are untouched.
const normalizeHydratedAttempts = (attempts) => {
  const out = {};
  Object.entries(attempts && typeof attempts === "object" ? attempts : {}).forEach(
    ([k, attempt]) => {
      out[k] =
        attempt?.status === ATTEMPT_STATUS.IN_FLIGHT
          ? { ...attempt, status: ATTEMPT_STATUS.UNKNOWN, reason: "network" }
          : attempt;
    }
  );
  return out;
};

export const checkoutAttempts = create(
  persist(
    (set, get) => ({
      attempts: {},

      // Returns the store's attempt, creating a draft (with a fresh key) only
      // when none exists — an unresolved attempt is never replaced here.
      ensureAttempt: (store) => {
        const k = storeKey(store);
        const existing = get().attempts[k];
        if (existing) return existing;
        const attempt = {
          key: mintIdempotencyKey(),
          status: ATTEMPT_STATUS.DRAFT,
          payload: null,
          existingOrder: null
        };
        set((s) => ({ attempts: { ...s.attempts, [k]: attempt } }));
        return attempt;
      },

      update: (store, patch) =>
        set((s) => {
          const k = storeKey(store);
          if (!s.attempts[k]) return s;
          return { attempts: { ...s.attempts, [k]: { ...s.attempts[k], ...patch } } };
        }),

      // A request is about to be sent: freeze exactly what is sent.
      markInFlight: (store, payload) =>
        get().update(store, {
          status: ATTEMPT_STATUS.IN_FLIGHT,
          payload,
          reason: null,
          serverMessage: null
        }),

      // Outcome unknown: keep the key and the frozen payload. `reason` is
      // "network" (no answer / 5xx) or "unconfirmed" (a 409 that does not
      // establish whether the sale was written; `serverMessage` explains it).
      markUnknown: (store, { reason = "network", serverMessage = null } = {}) =>
        get().update(store, { status: ATTEMPT_STATUS.UNKNOWN, reason, serverMessage }),

      // Definitive refusal: nothing was recorded under this key, so the
      // payload may be rebuilt and resubmitted (the key is kept).
      markRefused: (store) => get().update(store, { status: ATTEMPT_STATUS.DRAFT, payload: null }),

      markConflict: (store, existingOrder) =>
        get().update(store, {
          status: ATTEMPT_STATUS.CONFLICT,
          existingOrder: existingOrder || null
        }),

      markRecorded: (store, existingOrder) =>
        get().update(store, { status: ATTEMPT_STATUS.RECORDED, existingOrder }),

      // Success, recovery or an explicit cashier decision: forget it.
      resolve: (store) =>
        set((s) => {
          const k = storeKey(store);
          if (!s.attempts[k]) return s;
          const next = { ...s.attempts };
          delete next[k];
          return { attempts: next };
        })
    }),
    {
      name: "checkout-attempt",
      storage: createJSONStorage(() => sessionStorage),
      merge: (persisted, current) => ({
        ...current,
        // Empty storage must not wipe an in-memory attempt: when nothing was
        // persisted, keep what this page already holds. Normal hydration
        // (persisted attempts present) still normalizes `in_flight` to
        // `unknown` and leaves other statuses untouched.
        attempts:
          persisted?.attempts == null
            ? current.attempts
            : normalizeHydratedAttempts(persisted.attempts)
      })
    }
  )
);

// 409 IDEMPOTENCY_MISMATCH `existingOrder` (BE docs/order-create-client-
// contract.md §2): { id, orderNumber, totalPrice, paymentStatus }. Only an
// order with an id is usable for recovery.
export const parseExistingOrder = (value) => {
  if (!value || typeof value !== "object") return null;
  const id = value.id;
  const validId =
    (typeof id === "number" && Number.isInteger(id) && id > 0) ||
    (typeof id === "string" && id.trim() !== "");
  if (!validId) return null;
  const total = Number(value.totalPrice);
  return {
    id,
    orderNumber: typeof value.orderNumber === "string" ? value.orderNumber : null,
    totalPrice: Number.isFinite(total) ? total : null,
    paymentStatus: typeof value.paymentStatus === "string" ? value.paymentStatus : null
  };
};

// Classifies a failed POST /order/create for the attempt lifecycle.
//   unknown     — the server may have recorded the sale (no response, 5xx)
//   conflict    — 409 IDEMPOTENCY_MISMATCH: the key already recorded a sale
//   refused     — definitively not recorded under this key (the server's
//                 key lookup precedes pricing/validation of the sale; schema
//                 validation of an identical payload is deterministic)
//   unconfirmed — a 409 whose code is absent or not in the table below: it
//                 neither proves a recorded sale nor guarantees no write
//                 (the deployed BE answers a key mismatch with a code-less
//                 409; some BOM refusals are code-less too). The attempt
//                 stays open, shown neutrally with the server's message.
//   auth        — 401/403: says nothing about an earlier attempt
// Codes, never message text, decide.
//
// 409 codes whose contract (BE docs/order-create-client-contract.md §3–§4)
// guarantees the sale was refused before anything was written:
const DEFINITIVE_409_CODES = Object.freeze([
  "PRICE_CHANGED",
  "TOTAL_CHANGED",
  "REGISTER_STATE_CHANGED",
  "INGREDIENT_STOCK_CONFLICT",
  // BA 004 (DR-23 §D): checked inside the sale's transaction before the
  // payment row; the refusal rolls the whole order back.
  "DUPLICATE_REFERENCE"
]);
const MAX_SERVER_MESSAGE = 200;
const serverMessageOf = (data) => {
  const text = [data?.error, data?.message].find((v) => typeof v === "string" && v.trim());
  return text ? text.trim().slice(0, MAX_SERVER_MESSAGE) : null;
};
export const classifyCreateError = (err) => {
  const response = err?.response;
  if (!response) return { kind: "unknown" };
  const { status } = response;
  const data = response.data || {};
  if (status >= 500) return { kind: "unknown" };
  if (status === 401 || status === 403) return { kind: "auth" };
  if (status === 409) {
    if (data.code === "IDEMPOTENCY_MISMATCH") {
      return { kind: "conflict", existingOrder: parseExistingOrder(data.existingOrder) };
    }
    if (DEFINITIVE_409_CODES.includes(data.code)) return { kind: "refused", code: data.code };
    return {
      kind: "unconfirmed",
      code: typeof data.code === "string" ? data.code : null,
      serverMessage: serverMessageOf(data)
    };
  }
  return { kind: "refused", code: data.code || null };
};
