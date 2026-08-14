import React, { useState } from "react";
import PropTypes from "prop-types";
import { X, Printer, RotateCcw, CheckCircle, Users, Plus, Trash2, Store } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery } from "react-query";
import { useCookies } from "react-cookie";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createSplitBill } from "@/services/split-bill";
import { getInvoiceSetting } from "@/services/invoice";
import { getLocationById } from "@/services/location";
import { toast } from "sonner";
import { printReceipt } from "@/utils/thermalPrint";

const DashedSeparator = () => (
  <div className="flex items-center justify-center gap-1 py-1 select-none" aria-hidden="true">
    {Array.from({ length: 16 }).map((_, i) => (
      <span key={i} className="w-1 h-px bg-border/70" />
    ))}
  </div>
);

const ReceiptModal = ({ data, onClose, onNewTransaction }) => {
  const { t } = useTranslation();
  const [cookie] = useCookies();
  const [thermalLoading, setThermalLoading] = useState(false);
  const formatPrice = (value) => {
    if (value == null || isNaN(value)) return "0";
    return Number(value).toLocaleString("id-ID");
  };

  const user = cookie?.user;
  const storeId =
    cookie?.activeStore || user?.store || data?.storeId || data?.location || data?.store || "";

  const { data: invoiceSettings } = useQuery(
    ["invoice-settings", storeId],
    () => getInvoiceSetting(storeId),
    { enabled: !!storeId }
  );
  const settingsData = invoiceSettings?.data || null;

  const { data: storeData } = useQuery(
    ["store-detail", storeId],
    () => getLocationById({ id: storeId }),
    { enabled: !!storeId }
  );
  const locationDetail = storeData?.data || storeData || null;

  const showLogo = settingsData?.showLogo ?? true;
  const showStoreName = settingsData?.showStoreName ?? true;
  const showAddress = settingsData?.showAddress ?? true;
  const showMemberInfo = settingsData?.showMemberInfo ?? true;
  const showSocialMedia = settingsData?.showSocialMedia ?? true;
  const addressFieldsVisible = (() => {
    const raw = settingsData?.addressFieldsVisibility;
    if (!raw) return {};
    try {
      return typeof raw === "string" ? JSON.parse(raw) : raw;
    } catch {
      return {};
    }
  })();

  const storeName =
    locationDetail?.name ||
    locationDetail?.storeName ||
    data?.storeName ||
    data?.outlet ||
    t("page.cashier.receipt.storeFallback");
  const locationAddress =
    locationDetail?.address ||
    locationDetail?.locationAddress ||
    data?.storeAddress ||
    data?.outletAddress ||
    "";
  const locationDetailAddress =
    locationDetail?.detailLocation || locationDetail?.locationDetail || "";
  const cityName = locationDetail?.cityName || locationDetail?.city || "";
  const provinceName = locationDetail?.provinceName || locationDetail?.province || "";
  const postalCodeValue = locationDetail?.postalCode || "";
  const storePhone =
    locationDetail?.phoneNumber || locationDetail?.phone || data?.storePhone || data?.phone || "";
  const storeEmail = locationDetail?.email || data?.storeEmail || data?.email || "";

  const buildStoreAddress = () => {
    const parts = [];
    if (addressFieldsVisible.address !== false && locationAddress) parts.push(locationAddress);
    if (addressFieldsVisible.locationDetail !== false && locationDetailAddress)
      parts.push(locationDetailAddress);
    if (addressFieldsVisible.city !== false && cityName && /^[A-Za-z]/.test(cityName))
      parts.push(cityName);
    if (addressFieldsVisible.province !== false && provinceName && /^[A-Za-z]/.test(provinceName))
      parts.push(provinceName);
    if (addressFieldsVisible.postalCode !== false && postalCodeValue) parts.push(postalCodeValue);
    return parts.join(", ");
  };
  const storeAddress = buildStoreAddress();

  const socialMedia = locationDetail?.socialMedia || data?.socialMedia || [];
  const footerText = settingsData?.footer || data?.footer || t("page.cashier.receipt.thanks");
  const orderNumber =
    data?.orderNumber ||
    data?.invoice ||
    data?.transactionNumber ||
    `#INV-${Date.now().toString().slice(-6)}`;
  const orderId = data?.id || data?._id;
  const transactionDate = data?.createdAt || data?.date || new Date().toISOString();
  const formattedDate = new Date(transactionDate).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
  const cashierName = data?.cashierName || data?.cashier || "-";
  const customerName = data?.customerName || data?.customer?.name || "-";
  const paymentMethod = data?.paymentMethod || data?.payment?.method || "-";
  const items = data?.items || data?.orderItems || [];
  const subtotal = data?.subtotal || data?.amount || data?.total || 0;
  const tax = data?.tax || data?.taxAmount || 0;
  const taxRatePercent = (() => {
    if (data?.taxRate == null) {
      return tax > 0 ? Math.round((tax / Math.max(subtotal || 1, 1)) * 100) : 0;
    }
    const r = Number(data.taxRate);
    return r > 1 ? Math.round(r) : Math.round(r * 100);
  })();
  const discount = data?.discountValue || data?.discount || 0;
  const total = data?.total || data?.grandTotal || 0;
  const cashAmount = data?.cashAmount || data?.payment?.cashAmount || 0;
  const changeAmount = data?.changeAmount || data?.payment?.changeAmount || 0;

  const [showSplit, setShowSplit] = useState(false);
  const [splitCount, setSplitCount] = useState(2);
  // ponytail: simple equal-split default, manual override per person
  const [splitAmounts, setSplitAmounts] = useState(() =>
    Array.from({ length: 2 }, (_, i) => (i === 0 ? Math.ceil(total / 2) : Math.floor(total / 2)))
  );

  const splitMutation = useMutation({
    mutationFn: (payload) => createSplitBill(payload),
    onSuccess: () => {
      toast.success(t("page.cashier.receipt.toast.splitSuccess"));
      setShowSplit(false);
    },
    onError: (err) => {
      toast.error(
        err?.response?.data?.message || err?.message || t("page.cashier.receipt.toast.splitFailed")
      );
    }
  });

  const handleSplitCountChange = (n) => {
    const count = Math.max(2, Math.min(20, Number(n) || 2));
    setSplitCount(count);
    const base = Math.floor(total / count);
    const remainder = total - base * count;
    setSplitAmounts(Array.from({ length: count }, (_, i) => (i === 0 ? base + remainder : base)));
  };

  const handleSplitAmountChange = (idx, val) => {
    const next = [...splitAmounts];
    next[idx] = Number(val) || 0;
    setSplitAmounts(next);
  };

  const handleSplitSubmit = () => {
    const sum = splitAmounts.reduce((s, a) => s + a, 0);
    if (sum !== total) {
      toast.error(
        t("page.cashier.receipt.toast.splitSumError", {
          sum: formatPrice(sum),
          total: formatPrice(total)
        })
      );
      return;
    }
    if (!orderId) {
      toast.error(t("page.cashier.receipt.toast.orderNotFound"));
      return;
    }
    splitMutation.mutate({
      order: orderId,
      items: splitAmounts.map((amount) => ({ amount }))
    });
  };

  const handleThermalPrint = async () => {
    setThermalLoading(true);
    try {
      const receipt = {
        storeName,
        storeAddress,
        storePhone,
        storeEmail,
        logo: settingsData?.logo || "",
        memberName: data?.customerName || data?.customer?.name || "",
        memberTier: data?.customer?.memberTier || data?.customer?.tier || "",
        memberPoints:
          data?.customer?.memberPoints ||
          data?.customer?.totalPoints ||
          data?.customer?.points ||
          0,
        orderNumber,
        cashier: cashierName,
        date: transactionDate,
        items: items.map((i) => ({
          name: i.nameProduct || i.name || "-",
          qty: i.count || i.qty || 0,
          price: i.price || 0,
          total: i.totalPrice || i.price * (i.count || 1) || 0,
          options: i.options || (i.variantName ? [{ name: i.variantName }] : [])
        })),
        subtotal,
        discount,
        tax,
        total,
        paymentMethod,
        cashAmount,
        changeAmount,
        socialMedia,
        footer: footerText,
        showLogo,
        showStoreName,
        showAddress,
        showMemberInfo,
        showSocialMedia,
        socialMediaVisibility: settingsData?.socialMediaVisibility,
        addressFieldsVisibility: addressFieldsVisible
      };
      await printReceipt(receipt, "auto");
      toast.success(t("page.cashier.receipt.toast.printSuccess"));
    } catch (err) {
      if (err.name !== "NotFoundError") {
        toast.error(err?.message || t("page.cashier.receipt.toast.printError"));
      }
    } finally {
      setThermalLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl shadow-2xl border border-border/50 w-[80vw] max-w-none max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border/50 shrink-0">
          <div className="flex items-center gap-2">
            <CheckCircle size={18} className="text-emerald-500" />
            <h2 className="text-base font-bold">{t("page.cashier.receipt.title")}</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-accent transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="bg-muted/20 rounded-xl border border-border/40 overflow-hidden">
            <div className="px-5 pt-5">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Store size={16} className="text-primary" />
                <p className="font-bold uppercase tracking-wide text-sm">{storeName}</p>
              </div>
              {storeAddress && (
                <p className="text-xs text-muted-foreground text-center">{storeAddress}</p>
              )}
              {storePhone && (
                <p className="text-xs text-muted-foreground text-center mt-0.5">{storePhone}</p>
              )}
            </div>

            <DashedSeparator />

            <div className="px-5">
              <div className="flex items-center justify-center gap-2 mb-2">
                <CheckCircle size={16} className="text-emerald-500" />
                <p className="font-semibold text-sm text-emerald-500">
                  {t("page.cashier.receipt.paymentSuccess")}
                </p>
              </div>
              <p className="text-center font-mono font-bold text-base tracking-wide">
                {orderNumber}
              </p>
              <p className="text-center text-xs text-muted-foreground mt-1">{formattedDate}</p>
            </div>

            <DashedSeparator />

            <div className="px-5 space-y-1.5 text-sm">
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">{t("page.cashier.receipt.cashier")}</span>
                <span className="font-medium text-right">{cashierName}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">{t("page.cashier.customer")}</span>
                <span className="font-medium text-right">{customerName}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">
                  {t("page.cashier.receipt.paymentMethod")}
                </span>
                <span className="font-medium text-right capitalize">{paymentMethod}</span>
              </div>
            </div>

            <DashedSeparator />

            <div className="px-5">
              <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
                {t("page.cashier.receipt.item")}
              </p>
              <div className="space-y-2">
                {items.length > 0 ? (
                  items.map((item, idx) => (
                    <div key={idx} className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {item.nameProduct || item.name || "-"}
                        </p>
                        {item.options?.[0]?.name && (
                          <p className="text-xs text-muted-foreground truncate">
                            - {item.options[0].name}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground font-mono">
                          {item.count || item.qty || 0} x Rp {formatPrice(item.price || 0)}
                        </p>
                      </div>
                      <span className="text-sm font-medium shrink-0 font-mono">
                        {formatPrice(item.totalPrice || item.price * (item.count || 1) || 0)}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">-</p>
                )}
              </div>
            </div>

            <DashedSeparator />

            <div className="px-5 pb-5 space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{t("page.cashier.subtotal")}</span>
                <span className="font-mono">Rp {formatPrice(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {t("page.cashier.tax")} ({taxRatePercent}%)
                </span>
                <span className="font-mono">Rp {formatPrice(tax)}</span>
              </div>
              {discount > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-emerald-500">{t("page.cashier.discount")}</span>
                  <span className="text-emerald-500 font-mono">-Rp {formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex items-center justify-between font-bold text-base border-t border-dashed border-border/50 pt-2 mt-2">
                <span>{t("page.cashier.total")}</span>
                <span className="text-primary font-mono">Rp {formatPrice(total)}</span>
              </div>
              {(paymentMethod === "cash" || paymentMethod?.toLowerCase() === "cash") && (
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{t("page.cashier.cashAmount")}</span>
                    <span className="font-mono">Rp {formatPrice(cashAmount)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{t("page.cashier.change")}</span>
                    <span className="font-medium text-emerald-500 font-mono">
                      Rp {formatPrice(changeAmount)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="px-5 pb-5 border-t border-dashed border-border/50 pt-4">
              <div className="flex items-center justify-center gap-1.5">
                {Array.from({ length: 12 }).map((_, i) => (
                  <span key={i} className="w-1 h-px bg-border/60" />
                ))}
                <span className="text-[10px] text-muted-foreground font-mono shrink-0">~</span>
                <span className="text-[10px] text-muted-foreground font-mono shrink-0">~</span>
                <span className="text-[10px] text-muted-foreground font-mono shrink-0">~</span>
                <span className="text-[10px] text-muted-foreground font-mono shrink-0">~</span>
                <span className="text-[10px] text-muted-foreground font-mono shrink-0">~</span>
                {Array.from({ length: 12 }).map((_, i) => (
                  <span key={i} className="w-1 h-px bg-border/60" />
                ))}
              </div>
              <p className="text-center text-xs text-muted-foreground mt-2">{footerText}</p>
              {socialMedia.length > 0 && (
                <div className="flex items-center justify-center gap-3 mt-1.5">
                  {socialMedia.map((sm, idx) => (
                    <span key={idx} className="text-[10px] text-muted-foreground font-mono">
                      {typeof sm === "string"
                        ? sm
                        : `${sm.platform || sm.name || ""}: ${sm.account || sm.username || sm.url || ""}`.trim()}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-border/50 p-4 shrink-0 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="flex-1 h-11 rounded-xl border-border/60"
              onClick={handleThermalPrint}
              loading={thermalLoading}>
              <Printer size={16} />
              {t("page.cashier.receipt.thermal")}
            </Button>
            <Button
              variant="outline"
              className="flex-1 h-11 rounded-xl border-border/60"
              onClick={() => {
                setSplitCount(2);
                const base = Math.floor(total / 2);
                setSplitAmounts([total - base, base]);
                setShowSplit(true);
              }}>
              <Users size={16} />
              {t("page.cashier.receipt.split")}
            </Button>
            <Button
              onClick={onNewTransaction}
              className="flex-1 h-11 rounded-xl relative overflow-hidden group/btn">
              <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary to-primary/90 opacity-90 group-hover/btn:opacity-100 transition-opacity" />
              <span className="relative flex items-center justify-center gap-2">
                <RotateCcw size={16} />
                {t("page.cashier.receipt.newTransaction")}
              </span>
            </Button>
          </div>
        </div>
      </div>

      {showSplit && (
        <div className="fixed inset-0 z-[80] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl shadow-2xl border border-border/50 w-full max-w-sm max-h-[80vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border/50 shrink-0">
              <div className="flex items-center gap-2">
                <Users size={18} className="text-primary" />
                <h3 className="font-bold">{t("page.cashier.receipt.splitTitle")}</h3>
              </div>
              <button
                onClick={() => setShowSplit(false)}
                className="p-1 rounded-lg hover:bg-accent">
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{t("page.cashier.receipt.splitPeople")}</span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-8 h-8 p-0"
                    onClick={() => handleSplitCountChange(splitCount - 1)}>
                    <Plus size={14} className="rotate-45" />
                  </Button>
                  <span className="w-8 text-center font-bold">{splitCount}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-8 h-8 p-0"
                    onClick={() => handleSplitCountChange(splitCount + 1)}>
                    <Plus size={14} />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                {splitAmounts.map((amount, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-6 shrink-0">#{idx + 1}</span>
                    <Input
                      type="number"
                      value={amount}
                      onChange={(e) => handleSplitAmountChange(idx, e.target.value)}
                      className="flex-1"
                    />
                    {splitCount > 2 && (
                      <button
                        onClick={() => {
                          const next = splitAmounts.filter((_, i) => i !== idx);
                          setSplitAmounts(next);
                          setSplitCount(next.length);
                        }}
                        className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-destructive">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between text-sm font-medium pt-2 border-t border-border">
                <span>{t("page.cashier.total")}</span>
                <span
                  className={
                    splitAmounts.reduce((s, a) => s + a, 0) === total
                      ? "text-primary"
                      : "text-destructive"
                  }>
                  Rp {formatPrice(splitAmounts.reduce((s, a) => s + a, 0))}
                  {splitAmounts.reduce((s, a) => s + a, 0) !== total && (
                    <span className="text-xs ml-1">
                      ({t("page.cashier.receipt.splitMustEqual", { total: formatPrice(total) })})
                    </span>
                  )}
                </span>
              </div>
            </div>

            <div className="border-t border-border/50 p-4 shrink-0 flex items-center gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowSplit(false)}>
                {t("common.cancel")}
              </Button>
              <Button
                className="flex-1"
                onClick={handleSplitSubmit}
                loading={splitMutation.isLoading}
                disabled={splitAmounts.reduce((s, a) => s + a, 0) !== total}>
                {t("common.save")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

ReceiptModal.propTypes = {
  data: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    _id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    orderNumber: PropTypes.string,
    invoice: PropTypes.string,
    transactionNumber: PropTypes.string,
    createdAt: PropTypes.string,
    date: PropTypes.string,
    cashierName: PropTypes.string,
    cashier: PropTypes.string,
    customerName: PropTypes.string,
    customer: PropTypes.shape({ name: PropTypes.string }),
    paymentMethod: PropTypes.string,
    payment: PropTypes.shape({
      method: PropTypes.string,
      cashAmount: PropTypes.number,
      changeAmount: PropTypes.number
    }),
    items: PropTypes.array,
    orderItems: PropTypes.array,
    subtotal: PropTypes.number,
    amount: PropTypes.number,
    total: PropTypes.number,
    tax: PropTypes.number,
    taxAmount: PropTypes.number,
    discountValue: PropTypes.number,
    discount: PropTypes.number,
    grandTotal: PropTypes.number,
    cashAmount: PropTypes.number,
    changeAmount: PropTypes.number,
    storeName: PropTypes.string,
    storeAddress: PropTypes.string,
    storePhone: PropTypes.string,
    socialMedia: PropTypes.array
  }),
  onClose: PropTypes.func,
  onNewTransaction: PropTypes.func
};

export default ReceiptModal;
