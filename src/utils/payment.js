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
