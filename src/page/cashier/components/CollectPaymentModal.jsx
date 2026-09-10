import React, { useRef, useState } from "react";
import PropTypes from "prop-types";
import { X, CheckCircle2, Users, Banknote, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useCookies } from "react-cookie";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
const toReceiptData = (order) => ({
  ...order,
  subtotal: order.subTotal,
  total: order.totalPrice,
  grandTotal: order.totalPrice,
  cashAmount: order.totalPrice,
  changeAmount: 0,
  items: (order.items || []).map((item) => ({
    ...item,
    nameProduct: item.productName,
    count: item.quantity
  }))
});

const CollectPaymentModal = ({ order, store, onClose, onOpenReceipt }) => {
  const { t } = useTranslation();
  const [cookie] = useCookies();
  const user = cookie?.user;
  const queryClient = useQueryClient();
  const [mode, setMode] = useState("choose"); // choose | confirmFull

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
    mutationFn: () =>
      updateOrderStatus({
        id: freshOrder.id,
        store,
        status: "paid",
        changedBy: user?.id,
        changedByName: user?.fullName || user?.userName
      }),
    onSuccess: async () => {
      toast.success(t("page.cashier.collectPayment.toast.paidSuccess"));
      invalidateOrderQueues();
      // Re-fetch rather than trust the mutation response for the receipt —
      // updateOrderStatus's response order was loaded without its items
      // association, while the receipt view needs the full item list.
      const refreshed = await getOrderById(freshOrder.id);
      onOpenReceipt(toReceiptData(refreshed?.data || freshOrder));
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
    isSubmittingRef.current = true;
    settleMutation.mutate();
  };

  const handleSplitBill = () => {
    onOpenReceipt(toReceiptData(freshOrder));
  };

  const amountDue = Number(freshOrder?.totalPrice) || 0;
  const formatPrice = (value) => Number(value || 0).toLocaleString("id-ID");

  return (
    <div className="fixed inset-0 z-[75] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl shadow-2xl border border-border/50 w-full max-w-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/50">
          <h2 className="text-base font-bold">{t("page.cashier.collectPayment.title")}</h2>
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
      </div>
    </div>
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
