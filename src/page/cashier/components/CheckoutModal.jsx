/* eslint-disable react/prop-types */
import React, { useState } from "react";
import { useQuery, useMutation } from "react-query";
import { X, User, CreditCard, Table2, Percent } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getAllTypePayment } from "@/services/type-payment";
import { getAllMember } from "@/services/member";
import { getTablesByStore } from "@/services/table";
import { getAllDiscountByLocationAndActive } from "@/services/discount";
import { createOrder } from "@/services/order";
import { addMemberPoints } from "@/services/member";
import { useTranslation } from "react-i18next";
import { formatCurrencyRupiah } from "@/utils/formatter-currency";

const QUICK_AMOUNTS = [50000, 100000, 200000, 500000, 1000000];

const CheckoutModal = ({ onClose, items, subtotal, store, cashierName, cashierId, onComplete }) => {
  const { t } = useTranslation();
  const [paymentTypeId, setPaymentTypeId] = useState("");
  const [amountReceived, setAmountReceived] = useState("");
  const [memberSearch, setMemberSearch] = useState("");
  const [selectedMember, setSelectedMember] = useState(null);
  const [showMemberResults, setShowMemberResults] = useState(false);
  const [selectedTable, setSelectedTable] = useState("");
  const [selectedDiscount, setSelectedDiscount] = useState("");
  const [notes, setNotes] = useState("");

  const { data: paymentsData } = useQuery(
    ["type-payment"],
    () => getAllTypePayment({}),
    { staleTime: 60000 }
  );
  const payments = paymentsData?.data || paymentsData || [];

  const { data: tablesData } = useQuery(
    ["tables", store],
    () => getTablesByStore({ location: store }),
    { enabled: !!store }
  );
  const tables = tablesData?.data || tablesData || [];

  const { data: discountsData } = useQuery(
    ["discounts-active", store],
    () =>
      getAllDiscountByLocationAndActive({
        location: store,
        limit: 50,
        page: 1,
        statusDiscount: "active"
      }),
    { enabled: !!store }
  );
  const discounts = discountsData?.data || discountsData || [];

  const { data: membersData } = useQuery(
    ["members-search", memberSearch],
    () => getAllMember({ nameMember: memberSearch, limit: 10 }),
    { enabled: memberSearch.length >= 2 }
  );
  const members = membersData?.data || membersData || [];

  const orderMutation = useMutation((payload) => createOrder(payload), {
    onSuccess: (data) => {
      const result = data?.data || data;
      if (selectedMember) {
        addMemberPoints(selectedMember.id || selectedMember._id, {
          orderId: result.id || result._id,
          points: Math.floor(subtotal / 10000),
          description: `Pembelian ${result.orderNumber || ""}`
        }).catch(() => {});
      }
      handleAddPaymentTypePoints(paymentTypeId, result);
      onComplete({
        ...result,
        items: [...items],
        rawSubtotal: subtotal,
        subtotal: finalTotal,
        serviceCharge,
        discountAmount,
        paid: Number(amountReceived) || finalTotal,
        change: Math.max(0, (Number(amountReceived) || finalTotal) - finalTotal),
        paymentMethod: payments.find((p) => (p.id || p._id) === paymentTypeId)?.name || "Cash",
        memberName: selectedMember?.name || null,
        tableName: selectedTable
          ? tables.find((t) => (t.id || t._id) === selectedTable)?.name || selectedTable
          : null
      });
    },
    onError: (err) => {
      toast?.error?.(err?.message || t("page.cashier.toast.processError"));
    }
  });

  const handleAddPaymentTypePoints = (typeId, orderResult) => {
    const payment = payments.find((p) => (p.id || p._id) === typeId);
    if (payment?.earnPoints && selectedMember) {
      const points = Math.floor(subtotal / (payment.pointsPerUnit || 10000));
      addMemberPoints(selectedMember.id || selectedMember._id, {
        orderId: orderResult.id || orderResult._id,
        points,
        description: `Poin pembayaran ${payment.name} - ${orderResult.invoice || orderResult.invoiceNumber || ""}`
      }).catch(() => {});
    }
  };

  const discountObj = discounts.find((d) => (d.id || d._id) === selectedDiscount);
  let discountAmount = 0;
  if (discountObj) {
    const discType = discountObj.type || discountObj.discountType || "percentage";
    const discValue = Number(discountObj.value || discountObj.discountValue || 0);
    if (discType === "percentage" || discType === "percent") {
      discountAmount = Math.min(subtotal * (discValue / 100), subtotal);
    } else {
      discountAmount = Math.min(discValue, subtotal);
    }
  }
  const SERVICE_CHARGE_RATE = 0.05;
  const serviceCharge = Math.round(subtotal * SERVICE_CHARGE_RATE);
  const finalTotal = subtotal - discountAmount + serviceCharge;

  const change = Math.max(0, (Number(amountReceived) || 0) - finalTotal);
  const isComplete = paymentTypeId && (Number(amountReceived) || 0) >= finalTotal;

  const handleSubmit = () => {
    if (!isComplete) return;

    const orderItems = items.map((item) => ({
      product: item.id,
      productName: item.name,
      quantity: item.count,
      price: item.price,
      subtotal: item.totalPrice,
      ...(item.options && item.options.length > 0 ? { options: item.options } : {})
    }));

    const memberPayload = selectedMember
      ? { customerId: selectedMember.id || selectedMember._id, customerName: selectedMember.name }
      : {};

    const payload = {
      store: Number(store),
      cashierId: Number(cashierId),
      cashierName,
      items: orderItems,
      paymentMethod: payments.find((p) => (p.id || p._id) === paymentTypeId)?.name || "Cash",
      totalPrice: finalTotal,
      notes: notes || undefined,
      ...(selectedTable ? { tableId: Number(selectedTable) } : {}),
      ...(selectedDiscount ? { discountId: Number(selectedDiscount), discountAmount } : {}),
      ...memberPayload
    };

    orderMutation.mutate(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-2 sm:p-4 bg-black/50 overflow-y-auto">
      <div className="bg-card rounded-xl shadow-lg border border-border w-full max-w-lg mt-4 sm:mt-8">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="font-semibold text-base">{t("page.cashier.payment")}</h3>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
            <X size={16} />
          </Button>
        </div>

        <div className="p-5 space-y-5 max-h-[70vh] overflow-y-auto">
          <div className="space-y-1">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">
                {t("page.cashier.modal.totalShopping")}
              </span>
              <span>{formatCurrencyRupiah(subtotal)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">{t("page.cashier.modal.discount")}</span>
                <span className="text-red-500">-{formatCurrencyRupiah(discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Biaya Layanan (5%)</span>
              <span>{formatCurrencyRupiah(serviceCharge)}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-border">
              <span className="font-semibold">{t("page.cashier.total")}</span>
              <span className="text-2xl font-bold text-primary">{formatCurrencyRupiah(finalTotal)}</span>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">
              {t("page.cashier.modal.paymentMethod")}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {payments.map((p) => {
                const pid = p.id || p._id;
                return (
                  <button
                    key={pid}
                    onClick={() => setPaymentTypeId(pid)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                      paymentTypeId === pid
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border text-muted-foreground hover:bg-accent"
                    }`}>
                    <CreditCard size={16} />
                    {p.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">
              {t("page.cashier.modal.amountPaid")}
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                Rp
              </span>
              <Input
                type="text"
                inputMode="numeric"
                placeholder="0"
                value={amountReceived ? Number(amountReceived).toLocaleString("id-ID") : ""}
                onChange={(e) => {
                  const raw = e.target.value.replace(/\D/g, "");
                  setAmountReceived(raw);
                }}
                className="pl-10 h-11 text-lg font-semibold"
              />
            </div>
            <div className="flex gap-1.5 mt-2 flex-wrap">
              {QUICK_AMOUNTS.map((amount) => (
                <button
                  key={amount}
                  onClick={() => setAmountReceived(String(amount))}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg border border-border text-muted-foreground hover:bg-accent transition-colors">
                  {formatCurrencyRupiah(amount)}
                </button>
              ))}
            </div>
            {Number(amountReceived) > 0 && Number(amountReceived) < finalTotal && (
              <p className="text-xs text-red-500 mt-1">{t("page.cashier.modal.amountShort")}</p>
            )}
          </div>

          {Number(amountReceived) >= finalTotal && (
            <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-900">
              <span className="text-sm font-medium text-green-700 dark:text-green-400">
                {t("page.cashier.change")}
              </span>
              <span className="text-lg font-bold text-green-700 dark:text-green-400">
                {formatCurrencyRupiah(change)}
              </span>
            </div>
          )}

          {tables.length > 0 && (
            <div>
              <label className="text-sm font-medium mb-1.5 block flex items-center gap-1.5">
                <Table2 size={14} /> {t("page.cashier.modal.table")}
              </label>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setSelectedTable("")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    !selectedTable
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border text-muted-foreground hover:bg-accent"
                  }`}>
                  {t("page.cashier.modal.none")}
                </button>
                {tables.map((t) => {
                  const tid = t.id || t._id;
                  return (
                    <button
                      key={tid}
                      onClick={() => setSelectedTable(tid)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                        selectedTable === tid
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border text-muted-foreground hover:bg-accent"
                      }`}>
                      {t.name || t.tableName || tid}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {discounts.length > 0 && (
            <div>
              <label className="text-sm font-medium mb-1.5 block flex items-center gap-1.5">
                <Percent size={14} /> {t("page.cashier.modal.discount")}
              </label>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setSelectedDiscount("")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    !selectedDiscount
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border text-muted-foreground hover:bg-accent"
                  }`}>
                  {t("page.cashier.modal.none")}
                </button>
                {discounts.map((d) => {
                  const did = d.id || d._id;
                  const dType = d.type || d.discountType || "percentage";
                  const dVal = Number(d.value || d.discountValue || 0);
                  const label =
                    dType === "nominal" || dType === "fixed"
                      ? `${d.name || "Diskon"} (${formatCurrencyRupiah(dVal)})`
                      : `${d.name || "Diskon"} (${dVal}%)`;
                  return (
                    <button
                      key={did}
                      onClick={() => setSelectedDiscount(did)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                        selectedDiscount === did
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border text-muted-foreground hover:bg-accent"
                      }`}>
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <label className="text-sm font-medium mb-1.5 block flex items-center gap-1.5">
              <User size={14} /> {t("page.cashier.modal.member")}
            </label>
            <div className="relative">
              <User
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                placeholder={t("page.cashier.modal.memberSearch")}
                value={memberSearch}
                onChange={(e) => {
                  setMemberSearch(e.target.value);
                  setShowMemberResults(true);
                  setSelectedMember(null);
                }}
                onFocus={() => setShowMemberResults(true)}
                className="pl-9 h-10 text-sm"
              />
            </div>
            {selectedMember && (
              <div className="mt-2 flex items-center gap-2 p-2 bg-primary/10 rounded-lg">
                <User size={14} className="text-primary" />
                <span className="text-sm font-medium">{selectedMember.name}</span>
                <button
                  onClick={() => {
                    setSelectedMember(null);
                    setMemberSearch("");
                  }}
                  className="ml-auto text-xs text-red-500">
                  {t("common.delete")}
                </button>
              </div>
            )}
            {showMemberResults && memberSearch.length >= 2 && !selectedMember && (
              <div className="mt-1 border border-border rounded-lg max-h-32 overflow-y-auto">
                {members.length === 0 ? (
                  <p className="p-2 text-xs text-muted-foreground">
                    {t("page.cashier.modal.memberNotFound")}
                  </p>
                ) : (
                  members.map((m) => (
                    <button
                      key={m.id || m._id}
                      onClick={() => {
                        setSelectedMember(m);
                        setMemberSearch(m.name);
                        setShowMemberResults(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-accent flex items-center gap-2">
                      <User size={14} className="text-muted-foreground" />
                      <span className="font-medium">{m.name}</span>
                      <span className="text-xs text-muted-foreground">{m.phoneNumber || ""}</span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">
              {t("page.cashier.modal.notes")}
            </label>
            <textarea
              placeholder={t("page.cashier.modal.notesPlaceholder")}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div className="px-5 py-4 border-t border-border flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            {t("common.cancel")}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isComplete || orderMutation.isLoading}
            className="min-w-[140px]">
            {orderMutation.isLoading
              ? t("page.cashier.modal.processing")
              : `${t("page.cashier.checkout")} ${formatCurrencyRupiah(finalTotal)}`}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;
