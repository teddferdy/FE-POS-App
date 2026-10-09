import { safeGet } from "@/lib/safe-lookup";

export const isCashPayment = (type) => {
  const t = String(type || "").toLowerCase();
  return (
    t.includes("cash") ||
    t.includes("tunai") ||
    t.includes("debit") ||
    t.includes("credit") ||
    t.includes("other") ||
    t.includes("points")
  );
};

export const getPaymentIconKind = (type) => {
  const t = String(type || "").toLowerCase();
  if (t.includes("cash") || t.includes("tunai") || t.includes("banknote")) return "cash";
  if (
    t.includes("qris") ||
    t.includes("e-wallet") ||
    t.includes("ewallet") ||
    t.includes("wallet") ||
    t.includes("gopay") ||
    t.includes("ovo") ||
    t.includes("dana") ||
    t.includes("shopeepay")
  ) {
    return "ewallet";
  }
  if (t.includes("debit") || t.includes("credit") || t.includes("kartu") || t.includes("card")) {
    return "card";
  }
  return "other";
};

// Display metadata for the canonical payment buckets reported by the API
// (BE api/service/canonicalPayment.js): the seven canonical tenders plus the
// UNRECONCILED reporting bucket for stored tenders that cannot be mapped.
// Codes stay canonical end to end; only the label/color is presentation.
export const PAYMENT_METHOD_META = Object.freeze({
  CASH: { label: "Tunai", color: "#10b981" },
  CARD: { label: "Kartu", color: "#f59e0b" },
  BANK_TRANSFER: { label: "Transfer Bank", color: "#0ea5e9" },
  E_WALLET: { label: "E-Wallet", color: "#6366f1" },
  QRIS: { label: "QRIS", color: "#a855f7" },
  POINTS: { label: "Poin", color: "#ec4899" },
  OTHER: { label: "Lainnya", color: "#94a3b8" },
  UNRECONCILED: { label: "Tidak Terekonsiliasi", color: "#ef4444" }
});

// Unknown (or prototype-like) codes never borrow a real tender's label.
export const paymentMethodMeta = (code) =>
  safeGet(PAYMENT_METHOD_META, code, PAYMENT_METHOD_META.UNRECONCILED);
