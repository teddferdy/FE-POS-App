import React, { useRef, useState } from "react";
import PropTypes from "prop-types";
import { X, CheckCircle2, Users, Banknote, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useCookies } from "react-cookie";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { getOrderById, updateOrderStatus } from "@/services/order";

// F4-01: settles an order that already exists (e.g. created through
// BISA-MAKAN's QR ordering flow) instead of the previous workaround of
// re-typing its items into a brand-new POS order — see CashierPage's
// handleLoadOrder, which only pre-fills the cart and leaves the original
// order unpaid. Every mutation here targets the SAME order id/store that was
// already fetched; this component never calls order/create.
const CASHIER_ORDER_QUEUE_STATUSES = ["pending", "confirmed", "preparing", "ready", "served"];

// Mirrors CheckoutModal's own order -> receipt-prop mapping (subTotal ->
// subtotal, totalPrice -> total/grandTotal, item.productName -> nameProduct,
// item.quantity -> count) so ReceiptModal renders identically regardless of
// whether it was opened after a fresh POS sale or after settling an existing
// order here.
//
// DR-04: when the settlement tender is known (the just-validated payload),
// the receipt reflects it instead of fabricating cash = total / change = 0.
// A null tender keeps the legacy bill-view defaults (split-bill preview,
// which is not a settlement).
const toReceiptData = (order, tender = null) => ({
  ...order,
  subtotal: order.subTotal,
  total: order.totalPrice,
  grandTotal: order.totalPrice,
  paymentMethod: tender?.paymentMethod ?? order.paymentMethod,
  cashAmount: tender ? tender.cashAmount : order.totalPrice,
  changeAmount: tender ? tender.changeAmount : 0,
  items: (order.items || []).map((item) => ({
    ...item,
    nameProduct: item.productName,
    count: item.quantity
  }))
});

// DR-04: the canonical settlement methods (same set the BE validates).
// The cashier must tender explicitly — the backend fails closed (422) when
// a method-less order is settled without one.
const SETTLEMENT_METHODS = [
  "cash",
  "qris",
  "debit",
  "credit",
  "transfer",
  "e-wallet",
  "points",
  "other"
];

const CollectPaymentModal = ({ order, store, onClose, onOpenReceipt }) => {
  const { t } = useTranslation();
  const [cookie] = useCookies();
  const user = cookie?.user;
  const queryClient = useQueryClient();
  const [mode, setMode] = useState("choose"); // choose | confirmFull
  // DR-04 tender state: null method means "not chosen yet" — the effective
  // method falls back to the order's own stated intent (e.g. a QR order's
  // paymentMethod), else cash. Cash input empty means exact tender (the
  // server fills cashReceived = due, changeGiven = 0, same as order/create).
  const [methodChoice, setMethodChoice] = useState(null);
  const [cashReceivedInput, setCashReceivedInput] = useState("");

  // Always re-fetch the authoritative current state before offering a
  // payment action — the order queue this modal is opened from can be up to
  // 30s stale, and an order already paid/cancelled elsewhere must never be
  // paid again from here.
  const {
    data: orderData,
    isLoading,
    isError
  } = useQuery(["collect-payment-order", order?.id], () => getOrderById(order.id), {
    enabled: !!order?.id,
    retry: false
  });
  const freshOrder = orderData?.data || order;
  const isAlreadySettled =
    freshOrder?.paymentStatus === "paid" || ["cancelled", "void"].includes(freshOrder?.status);

  const amountDue = Number(freshOrder?.totalPrice) || 0;
  const effectiveMethod =
    methodChoice ??
    (SETTLEMENT_METHODS.includes(freshOrder?.paymentMethod) ? freshOrder.paymentMethod : "cash");
  const cashReceivedOrNull = cashReceivedInput === "" ? null : Number(cashReceivedInput);
  const cashChange = cashReceivedOrNull === null ? 0 : Math.max(0, cashReceivedOrNull - amountDue);
  // Block confirming cash that cannot cover the bill; the server revalidates
  // everything (422) regardless — this is UX only, never the trust boundary.
  const cashCovers =
    effectiveMethod !== "cash" ||
    cashReceivedOrNull === null ||
    (Number.isInteger(cashReceivedOrNull) && cashReceivedOrNull >= amountDue);

  const invalidateOrderQueues = () => {
    CASHIER_ORDER_QUEUE_STATUSES.forEach((status) =>
      queryClient.invalidateQueries(["cashier-orders-" + status, store])
    );
    queryClient.invalidateQueries(["customer-orders"]);
  };

  // react-query's mutation.isLoading flips asynchronously (a tick after
  // mutate() runs), which is too late to stop several fireEvent-speed clicks
  // fired in the same turn — this ref is set synchronously on the very first
  // click, so every click after it is a no-op regardless of render timing.
  const isSubmittingRef = useRef(false);

  const settleMutation = useMutation({
    // DR-04: the settlement carries the actual tender — method always, cash
    // detail only for cash (never fabricated for other methods). The server
    // validates (422) and resolves register attribution; this modal never
    // sends a register id.
    mutationFn: (tender) =>
      updateOrderStatus({
        id: freshOrder.id,
        store,
        status: "paid",
        changedBy: user?.id,
        changedByName: user?.fullName || user?.userName,
        paymentMethod: tender.paymentMethod,
        ...(tender.paymentMethod === "cash" && tender.cashAmount !== null
          ? { cashAmount: tender.cashAmount, changeAmount: tender.changeAmount }
          : {})
      }),
    onSuccess: async (_data, tender) => {
      toast.success(t("page.cashier.collectPayment.toast.paidSuccess"));
      invalidateOrderQueues();
      // Re-fetch rather than trust the mutation response for the receipt —
      // updateOrderStatus's response order was loaded without its items
      // association, while the receipt view needs the full item list.
      const refreshed = await getOrderById(freshOrder.id);
      // DR-04: hand the receipt the just-settled tender (server-validated
      // by the 200 above) instead of fabricating cash = total / change = 0.
      const receiptTender =
        tender.paymentMethod === "cash"
          ? {
              paymentMethod: "cash",
              cashAmount: tender.cashAmount ?? amountDue,
              changeAmount: tender.changeAmount ?? 0
            }
          : { paymentMethod: tender.paymentMethod, cashAmount: null, changeAmount: null };
      onOpenReceipt(toReceiptData(refreshed?.data || freshOrder, receiptTender));
      onClose();
    },
    onError: (err) => {
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          t("page.cashier.collectPayment.toast.paidFailed")
      );
    },
    onSettled: () => {
      isSubmittingRef.current = false;
    }
  });

  const handleConfirmFullPayment = () => {
    if (isSubmittingRef.current || settleMutation.isLoading) return;
    if (!cashCovers) return;
    isSubmittingRef.current = true;
    // DR-04 tender: method always; cash detail only when the cashier typed
    // an amount (empty = exact tender, server fills received = due).
    const tender =
      effectiveMethod === "cash" && cashReceivedOrNull !== null
        ? {
            paymentMethod: "cash",
            cashAmount: cashReceivedOrNull,
            changeAmount: cashChange
          }
        : { paymentMethod: effectiveMethod, cashAmount: null, changeAmount: null };
    settleMutation.mutate(tender);
  };

  const handleSplitBill = () => {
    onOpenReceipt(toReceiptData(freshOrder));
  };

  const formatPrice = (value) => Number(value || 0).toLocaleString("id-ID");

  return (
    // F9-04: migrated onto the project's accessible Dialog primitive —
    // Escape now closes this modal the same way its own X button already
    // did unconditionally (there was no business rule blocking a close via
    // the X, even mid-mutation), so wiring Escape to the same `onClose`
    // is a consistency fix, not new behavior.
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-sm p-0 overflow-hidden" withX={false}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/50">
          <DialogTitle className="text-base font-bold">
            {t("page.cashier.collectPayment.title")}
          </DialogTitle>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-accent">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-6 text-muted-foreground">
              <Loader2 size={20} className="animate-spin mr-2" />
              {t("common.loadingData")}
            </div>
          ) : isError ? (
            <p className="text-sm text-destructive text-center py-4">
              {t("page.cashier.collectPayment.loadFailed")}
            </p>
          ) : (
            <>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  {t("page.cashier.collectPayment.orderNumber")}
                </p>
                <p className="font-bold">{freshOrder?.orderNumber}</p>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-border/60">
                <span className="text-sm font-medium">
                  {t("page.cashier.collectPayment.amountDue")}
                </span>
                <span className="text-lg font-bold">Rp {formatPrice(amountDue)}</span>
              </div>

              {isAlreadySettled ? (
                <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium justify-center py-2">
                  <CheckCircle2 size={16} />
                  {t("page.cashier.collectPayment.alreadyPaid")}
                </div>
              ) : mode === "confirmFull" ? (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    {t("page.cashier.collectPayment.confirmFullDesc")}
                  </p>
                  <div className="space-y-1">
                    <label htmlFor="collect-payment-method" className="text-sm font-medium">
                      {t("page.cashier.paymentMethod")}
                    </label>
                    <select
                      id="collect-payment-method"
                      value={effectiveMethod}
                      onChange={(e) => setMethodChoice(e.target.value)}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                      {SETTLEMENT_METHODS.map((m) => (
                        <option key={m} value={m}>
                          {t(`page.cashier.collectPayment.method.${m}`, m)}
                        </option>
                      ))}
                    </select>
                  </div>
                  {effectiveMethod === "cash" && (
                    <div className="space-y-1">
                      <label htmlFor="collect-payment-cash" className="text-sm font-medium">
                        {t("page.cashier.cashAmount")}
                      </label>
                      <input
                        id="collect-payment-cash"
                        inputMode="numeric"
                        placeholder={String(amountDue)}
                        value={cashReceivedInput}
                        onChange={(e) =>
                          setCashReceivedInput(e.target.value.replace(/[^0-9]/g, ""))
                        }
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                      />
                      <p className="text-sm text-muted-foreground">
                        {t("page.cashier.change")}: Rp {formatPrice(cashChange)}
                      </p>
                      {!cashCovers && (
                        <p className="text-sm text-destructive">
                          {t(
                            "page.cashier.collectPayment.cashInsufficient",
                            "Cash received must cover the amount due."
                          )}
                        </p>
                      )}
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      disabled={settleMutation.isLoading}
                      onClick={() => setMode("choose")}>
                      {t("common.cancel")}
                    </Button>
                    <Button
                      variant="success"
                      className="flex-1"
                      loading={settleMutation.isLoading}
                      disabled={!cashCovers}
                      onClick={handleConfirmFullPayment}>
                      {t("page.cashier.collectPayment.confirm")}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Button
                    variant="success"
                    className="flex-1 h-11"
                    onClick={() => setMode("confirmFull")}>
                    <Banknote size={16} className="mr-1.5" />
                    {t("page.cashier.collectPayment.payFull")}
                  </Button>
                  <Button variant="outline" className="flex-1 h-11" onClick={handleSplitBill}>
                    <Users size={16} className="mr-1.5" />
                    {t("page.cashier.collectPayment.splitBill")}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

CollectPaymentModal.propTypes = {
  order: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  }).isRequired,
  store: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onClose: PropTypes.func.isRequired,
  onOpenReceipt: PropTypes.func.isRequired
};

export default CollectPaymentModal;
