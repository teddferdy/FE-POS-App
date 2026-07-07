/* eslint-disable react/prop-types */
import React, { useState } from "react";
import PropTypes from "prop-types";
import {
  X,
  Printer,
  RotateCcw,
  CheckCircle,
  Users,
  Plus,
  Trash2,
  Smartphone,
  Mail
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useMutation } from "react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createSplitBill } from "@/services/split-bill";
import { sendInvoiceWhatsApp, sendInvoiceEmail } from "@/services/invoice";
import { toast } from "sonner";
import { printReceipt, printTestPage } from "@/utils/thermalPrint";

const ReceiptModal = ({ data, onClose, onNewTransaction }) => {
  const { t } = useTranslation();
  const [thermalLoading, setThermalLoading] = useState(false);
  const formatPrice = (value) => {
    if (value == null || isNaN(value)) return "0";
    return Number(value).toLocaleString("id-ID");
  };

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
  const discount = data?.discountValue || data?.discount || 0;
  const total = data?.total || data?.grandTotal || 0;
  const cashAmount = data?.cashAmount || data?.payment?.cashAmount || 0;
  const changeAmount = data?.changeAmount || data?.payment?.changeAmount || 0;

  const [showSplit, setShowSplit] = useState(false);
  const [splitCount, setSplitCount] = useState(2);
  const [waPhone, setWaPhone] = useState(data?.customerPhone || "");
  const [invoiceEmail, setInvoiceEmail] = useState("");
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

  const waMutation = useMutation({
    mutationFn: (payload) => sendInvoiceWhatsApp(payload),
    onSuccess: () => toast.success(t("page.cashier.receipt.toast.waSuccess")),
    onError: (err) =>
      toast.error(
        err?.response?.data?.message || err?.message || t("page.cashier.receipt.toast.waError")
      )
  });

  const emailMutation = useMutation({
    mutationFn: (payload) => sendInvoiceEmail(payload),
    onSuccess: () => toast.success(t("page.cashier.receipt.toast.emailSuccess")),
    onError: (err) =>
      toast.error(
        err?.response?.data?.message || err?.message || t("page.cashier.receipt.toast.emailError")
      )
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
        `Total pembagian (${formatPrice(sum)}) harus sama dengan total (${formatPrice(total)})`
      );
      return;
    }
    if (!orderId) {
      toast.error("ID pesanan tidak ditemukan");
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
        storeName: data?.storeName || data?.outlet || "Toko Anda",
        storeAddress: data?.storeAddress || "",
        storePhone: data?.storePhone || "",
        orderNumber,
        cashier: cashierName,
        date: transactionDate,
        items: items.map((i) => ({
          name: i.nameProduct || i.name || "-",
          qty: i.count || i.qty || 0,
          price: i.price || 0,
          total: i.totalPrice || i.price * (i.count || 1) || 0
        })),
        subtotal,
        discount,
        tax,
        total,
        paymentMethod,
        cashAmount,
        changeAmount
      };
      await printReceipt(receipt, "auto");
      toast.success("Struk berhasil dicetak");
    } catch (err) {
      if (err.name !== "NotFoundError") {
        toast.error(err?.message || "Gagal mencetak");
      }
    } finally {
      setThermalLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-border/50 w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 shrink-0">
          <div className="flex items-center gap-2">
            <CheckCircle size={20} className="text-emerald-500" />
            <h2 className="text-lg font-bold">{t("page.cashier.receipt.title")}</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-accent transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="bg-muted/30 rounded-xl border border-border/40 p-5 space-y-4">
            <div className="text-center pb-3 border-b border-border/30">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-2">
                <CheckCircle size={24} className="text-emerald-500" />
              </div>
              <p className="font-bold text-sm text-muted-foreground">
                {t("page.cashier.receipt.paymentSuccess")}
              </p>
              <p className="text-lg font-bold mt-0.5">{orderNumber}</p>
            </div>

            <div className="space-y-1.5 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{t("page.cashier.receipt.date")}</span>
                <span className="font-medium">{formattedDate}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{t("page.cashier.receipt.cashier")}</span>
                <span className="font-medium">{cashierName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{t("page.cashier.customer")}</span>
                <span className="font-medium">{customerName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{t("page.cashier.paymentMethod")}</span>
                <span className="font-medium capitalize">{paymentMethod}</span>
              </div>
            </div>

            <div className="border-t border-border/30 pt-3">
              <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
                {t("page.cashier.receipt.item")}
              </p>
              <div className="space-y-2">
                {items.length > 0 ? (
                  items.map((item, idx) => (
                    <div key={idx} className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {item.nameProduct || item.name || "-"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.count || item.qty || 0} x Rp {formatPrice(item.price || 0)}
                        </p>
                      </div>
                      <span className="text-sm font-medium shrink-0">
                        Rp {formatPrice(item.totalPrice || item.price * (item.count || 1) || 0)}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">-</p>
                )}
              </div>
            </div>

            <div className="border-t border-border/30 pt-3 space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{t("page.cashier.subtotal")}</span>
                <span>Rp {formatPrice(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{t("page.cashier.tax")} (11%)</span>
                <span>Rp {formatPrice(tax)}</span>
              </div>
              {discount > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-emerald-500">{t("page.cashier.discount")}</span>
                  <span className="text-emerald-500">-Rp {formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex items-center justify-between font-bold text-base border-t border-border/30 pt-1.5 mt-1.5">
                <span>{t("page.cashier.total")}</span>
                <span className="text-primary">Rp {formatPrice(total)}</span>
              </div>
            </div>

            {(paymentMethod === "cash" || paymentMethod?.toLowerCase() === "cash") && (
              <div className="border-t border-border/30 pt-3 space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t("page.cashier.cashAmount")}</span>
                  <span>Rp {formatPrice(cashAmount)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t("page.cashier.change")}</span>
                  <span className="font-medium text-emerald-500">
                    Rp {formatPrice(changeAmount)}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-border/30 pt-3 mt-4 space-y-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {t("page.cashier.receipt.sendWATitle")}
            </p>
            <div className="flex items-center gap-2">
              <Input
                type="text"
                value={waPhone}
                onChange={(e) => setWaPhone(e.target.value)}
                placeholder={t("page.cashier.receipt.phonePlaceholder")}
                className="flex-1"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  if (!waPhone) return;
                  waMutation.mutate({ orderId, phone: waPhone });
                }}
                loading={waMutation.isLoading}
                disabled={!waPhone || !orderId}>
                <Smartphone size={14} className="mr-1" />
                {t("page.cashier.receipt.sendWA")}
              </Button>
            </div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mt-2">
              {t("page.cashier.receipt.sendEmailTitle")}
            </p>
            <div className="flex items-center gap-2">
              <Input
                type="email"
                value={invoiceEmail}
                onChange={(e) => setInvoiceEmail(e.target.value)}
                placeholder={t("page.cashier.receipt.emailPlaceholder")}
                className="flex-1"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  if (!invoiceEmail) return;
                  emailMutation.mutate({ orderId, email: invoiceEmail });
                }}
                loading={emailMutation.isLoading}
                disabled={!invoiceEmail || !orderId}>
                <Mail size={14} className="mr-1" />
                {t("page.cashier.receipt.sendEmail")}
              </Button>
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
              Thermal
            </Button>
            <button
              onClick={printTestPage}
              className="h-11 w-11 rounded-xl border border-border/60 text-xs text-muted-foreground hover:bg-accent flex items-center justify-center"
              title="Test Printer">
              TP
            </button>
            <Button
              variant="outline"
              className="flex-1 h-11 rounded-xl border-border/60"
              onClick={() => window.print()}>
              <Printer size={16} />
              {t("page.cashier.receipt.print")}
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
              Pisah Bayar
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
                <h3 className="font-bold">Pisah Bayar</h3>
              </div>
              <button
                onClick={() => setShowSplit(false)}
                className="p-1 rounded-lg hover:bg-accent">
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Jumlah Orang</span>
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
                <span>Total</span>
                <span
                  className={
                    splitAmounts.reduce((s, a) => s + a, 0) === total
                      ? "text-primary"
                      : "text-destructive"
                  }>
                  Rp {formatPrice(splitAmounts.reduce((s, a) => s + a, 0))}
                  {splitAmounts.reduce((s, a) => s + a, 0) !== total && (
                    <span className="text-xs ml-1">(harus Rp {formatPrice(total)})</span>
                  )}
                </span>
              </div>
            </div>

            <div className="border-t border-border/50 p-4 shrink-0 flex items-center gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowSplit(false)}>
                Batal
              </Button>
              <Button
                className="flex-1"
                onClick={handleSplitSubmit}
                loading={splitMutation.isLoading}
                disabled={splitAmounts.reduce((s, a) => s + a, 0) !== total}>
                Simpan
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
    changeAmount: PropTypes.number
  }),
  onClose: PropTypes.func,
  onNewTransaction: PropTypes.func
};

export default ReceiptModal;
