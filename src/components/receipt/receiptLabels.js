// Translated labels for renderReceiptElement / generateESCPOS — one place,
// so the settings preview and the cashier receipt print the same words.
export const receiptLabels = (t) => ({
  invoiceNumber: t("page.cashier.receipt.invoiceNumber"),
  date: t("page.cashier.receipt.date"),
  cashier: t("page.cashier.receipt.cashier"),
  table: t("page.cashier.receipt.table"),
  paymentMethod: t("page.cashier.receipt.paymentMethod"),
  memberInfo: t("page.invoice.memberInfo"),
  memberName: t("page.invoice.memberName"),
  memberTier: t("page.invoice.memberTier"),
  memberPoints: t("page.invoice.totalPoints"),
  subtotal: t("page.invoice.subtotal"),
  discount: t("page.cashier.discount"),
  tax: t("page.cashier.tax"),
  redeemPoints: (points) => t("page.cashier.receipt.redeemPoints", { points }),
  totalBeforeRedeem: t("page.cashier.receipt.totalBeforeRedeem"),
  total: t("page.invoice.total"),
  cash: t("page.cashier.cashAmount"),
  change: t("page.cashier.change")
});
