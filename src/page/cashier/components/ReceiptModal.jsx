import React from "react";
import PropTypes from "prop-types";
import { X, Printer, RotateCcw, CheckCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

const ReceiptModal = ({ data, onClose, onNewTransaction }) => {
  const { t } = useTranslation();
  const formatPrice = (value) => {
    if (value == null || isNaN(value)) return "0";
    return Number(value).toLocaleString("id-ID");
  };

  const orderNumber =
    data?.orderNumber ||
    data?.invoice ||
    data?.transactionNumber ||
    `#INV-${Date.now().toString().slice(-6)}`;
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

  return (
    <div className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-border/50 w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 shrink-0">
          <div className="flex items-center gap-2">
            <CheckCircle size={20} className="text-emerald-500" />
            <h2 className="text-lg font-bold">{t("page.cashier.receipt")}</h2>
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
                {t("page.cashier.paymentSuccess")}
              </p>
              <p className="text-lg font-bold mt-0.5">{orderNumber}</p>
            </div>

            <div className="space-y-1.5 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{t("page.cashier.date")}</span>
                <span className="font-medium">{formattedDate}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{t("page.cashier.cashier")}</span>
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
                {t("page.cashier.orderItems")}
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
        </div>

        <div className="border-t border-border/50 p-4 shrink-0 flex items-center gap-2">
          <Button
            variant="outline"
            className="flex-1 h-11 rounded-xl border-border/60"
            onClick={() => window.print()}>
            <Printer size={16} />
            {t("page.cashier.print")}
          </Button>
          <Button
            onClick={onNewTransaction}
            className="flex-1 h-11 rounded-xl relative overflow-hidden group/btn">
            <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary to-primary/90 opacity-90 group-hover/btn:opacity-100 transition-opacity" />
            <span className="relative flex items-center justify-center gap-2">
              <RotateCcw size={16} />
              {t("page.cashier.newTransaction")}
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
};

ReceiptModal.propTypes = {
  data: PropTypes.shape({
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
