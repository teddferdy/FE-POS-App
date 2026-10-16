import { toast } from "sonner";

// BA gap 028 (DR-18): a settlement is never refused for stock. When the
// outlet could not cover it, the server still records the payment and
// returns stockShortages; the cashier is told so the stock can be checked.
export const describeStockShortages = (shortages) =>
  (Array.isArray(shortages) ? shortages : []).map((s) => `${s.name} (−${s.shortfall})`).join(", ");

export const warnStockShortages = (shortages, t) => {
  const items = describeStockShortages(shortages);
  if (!items) return false;
  toast.warning(t("page.cashier.stockShortage.title"), {
    description: t("page.cashier.stockShortage.desc", { items }),
    duration: 10000
  });
  return true;
};
