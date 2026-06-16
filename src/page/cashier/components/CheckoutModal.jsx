/* eslint-disable react/prop-types */
import React, { useState } from "react";
import { useQuery, useMutation } from "react-query";
import {
  X,
  User,
  CreditCard,
  Table2,
  Percent,
  UtensilsCrossed,
  ShoppingBag,
  Star,
  Check
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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

const slideUp = {
  initial: { opacity: 0, y: 30, scale: 0.98 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", damping: 25, stiffness: 300 }
  },
  exit: { opacity: 0, y: 20, scale: 0.98, transition: { duration: 0.15 } }
};

const stagger = {
  animate: { transition: { staggerChildren: 0.05 } }
};

const CheckoutModal = ({ onClose, items, subtotal, store, cashierName, cashierId, onComplete }) => {
  const { t } = useTranslation();
  const [paymentTypeId, setPaymentTypeId] = useState("");
  const [amountReceived, setAmountReceived] = useState("");
  const [memberSearch, setMemberSearch] = useState("");
  const [selectedMember, setSelectedMember] = useState(null);
  const [showMemberResults, setShowMemberResults] = useState(false);
  const [selectedTable, setSelectedTable] = useState("");
  const [orderType, setOrderType] = useState("dine_in");
  const [selectedDiscount, setSelectedDiscount] = useState("");
  const [notes, setNotes] = useState("");
  const [redeemedItemKeys, setRedeemedItemKeys] = useState([]);

  const { data: paymentsData } = useQuery(["type-payment"], () => getAllTypePayment({}), {
    staleTime: 60000
  });
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
        const earnedPoints = items.reduce((sum, item) => {
          const key = item.cartKey || item.id;
          if (redeemedItemKeys.includes(key)) return sum;
          return sum + (item.point || 0) * (item.count || 0);
        }, 0);
        if (earnedPoints > 0) {
          addMemberPoints(selectedMember.id || selectedMember._id, {
            orderId: result.id || result._id,
            points: earnedPoints,
            description: `Pembelian ${result.orderNumber || ""}`
          }).catch(() => {});
        }
        if (totalRedeemPoints > 0) {
          addMemberPoints(selectedMember.id || selectedMember._id, {
            orderId: result.id || result._id,
            points: -totalRedeemPoints,
            description: `Penukaran poin ${result.orderNumber || ""}`
          }).catch(() => {});
        }
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
        memberPhone: selectedMember?.phoneNumber || null,
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
  const redeemedAmount = items.reduce((sum, item) => {
    const key = item.cartKey || item.id;
    return redeemedItemKeys.includes(key)
      ? sum + (item.totalPrice || item.price * item.count)
      : sum;
  }, 0);
  const adjustedSubtotal = subtotal - redeemedAmount;
  const totalRedeemPoints = items.reduce((sum, item) => {
    const key = item.cartKey || item.id;
    return redeemedItemKeys.includes(key) ? sum + (item.redeemPoints || 0) : sum;
  }, 0);
  let discountAmount = 0;
  if (discountObj) {
    const discType = discountObj.type || discountObj.discountType || "percentage";
    const discValue = Number(discountObj.value || discountObj.discountValue || 0);
    if (discType === "percentage" || discType === "percent") {
      discountAmount = Math.min(adjustedSubtotal * (discValue / 100), adjustedSubtotal);
    } else {
      discountAmount = Math.min(discValue, adjustedSubtotal);
    }
  }
  const SERVICE_CHARGE_RATE = 0.05;
  const serviceCharge = Math.round(adjustedSubtotal * SERVICE_CHARGE_RATE);
  const finalTotal = adjustedSubtotal - discountAmount + serviceCharge;

  const change = Math.max(0, (Number(amountReceived) || 0) - finalTotal);
  const isComplete = paymentTypeId && (Number(amountReceived) || 0) >= finalTotal;

  const handleSubmit = () => {
    if (!isComplete) return;

    const orderItems = items.map((item) => {
      const key = item.cartKey || item.id;
      const isRedeemed = redeemedItemKeys.includes(key);
      return {
        product: item.id,
        productName: item.name,
        quantity: item.count,
        price: isRedeemed ? 0 : item.price,
        subtotal: isRedeemed ? 0 : item.totalPrice,
        ...(isRedeemed ? { redeemed: true, redeemPoints: item.redeemPoints } : {}),
        ...(item.options && item.options.length > 0 ? { options: item.options } : {})
      };
    });

    const memberPayload = selectedMember
      ? {
          customerId: selectedMember.id || selectedMember._id,
          customerName: selectedMember.name,
          customerPhone: selectedMember.phoneNumber
        }
      : {};

    const payload = {
      store: Number(store),
      cashierId: Number(cashierId),
      cashierName,
      orderType,
      items: orderItems,
      paymentMethod: payments.find((p) => (p.id || p._id) === paymentTypeId)?.name || "Cash",
      totalPrice: finalTotal,
      notes: notes || undefined,
      ...(orderType === "dine_in" && selectedTable ? { tableId: Number(selectedTable) } : {}),
      ...(selectedDiscount ? { discountId: Number(selectedDiscount), discountAmount } : {}),
      ...memberPayload
    };

    orderMutation.mutate(payload);
  };

  return (
    <motion.div
      variants={slideUp}
      initial="initial"
      animate="animate"
      exit="exit"
      className="fixed inset-0 z-50 flex items-start justify-center p-2 sm:p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <motion.div className="bg-card/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-border/50 w-full max-w-lg mt-4 sm:mt-8 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/50 bg-card/50">
          <h3 className="font-semibold text-base flex items-center gap-2">
            <div className="w-1.5 h-5 rounded-full bg-gradient-to-b from-primary to-primary/50" />
            {t("page.cashier.payment")}
          </h3>
          <motion.button
            whileHover={{ rotate: 90 }}
            onClick={onClose}
            className="h-8 w-8 rounded-xl hover:bg-accent/50 transition-colors flex items-center justify-center">
            <X size={16} />
          </motion.button>
        </div>

        <div className="p-5 space-y-5 max-h-[70vh] overflow-y-auto scrollbar-thin">
          <motion.div variants={stagger} className="space-y-1">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground/70">
                {t("page.cashier.modal.totalShopping")}
              </span>
              <span className="font-medium">{formatCurrencyRupiah(subtotal)}</span>
            </div>
            {redeemedAmount > 0 && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground/70">
                  {t("page.cashier.modal.redeemTitle")}
                </span>
                <span className="text-amber-500 font-medium">
                  -{formatCurrencyRupiah(redeemedAmount)}
                </span>
              </div>
            )}
            {discountAmount > 0 && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground/70">{t("page.cashier.modal.discount")}</span>
                <span className="text-red-500 font-medium">
                  -{formatCurrencyRupiah(discountAmount)}
                </span>
              </div>
            )}
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground/70">
                {t("page.cashier.modal.serviceCharge")}
              </span>
              <span className="font-medium">{formatCurrencyRupiah(serviceCharge)}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-border/50">
              <span className="font-semibold text-foreground/90">{t("page.cashier.total")}</span>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                {formatCurrencyRupiah(finalTotal)}
              </span>
            </div>
          </motion.div>

          <div>
            <label className="text-sm font-medium mb-2 block text-foreground/80">
              {t("page.cashier.modal.paymentMethod")}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {payments.map((p) => {
                const pid = p.id || p._id;
                const selected = paymentTypeId === pid;
                return (
                  <motion.button
                    key={pid}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setPaymentTypeId(pid)}
                    className={`relative flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all duration-200 overflow-hidden ${
                      selected
                        ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground border-primary/50 shadow-md shadow-primary/20"
                        : "border-border/50 text-muted-foreground hover:bg-accent/50 hover:border-border bg-muted/30"
                    }`}>
                    <CreditCard size={16} />
                    {p.name}
                    {selected && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute right-2 w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                        <Check size={12} />
                      </motion.span>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block text-foreground/80">
              {t("page.cashier.modal.amountPaid")}
            </label>
            <div className="relative">
              <Input
                type="text"
                inputMode="numeric"
                placeholder="Rp0"
                value={amountReceived ? `Rp${Number(amountReceived).toLocaleString("id-ID")}` : ""}
                onChange={(e) => {
                  const raw = e.target.value.replace(/[^\d]/g, "");
                  setAmountReceived(raw);
                }}
                className="pl-3 h-11 text-lg font-semibold bg-muted/30 backdrop-blur-sm border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all rounded-xl"
              />
            </div>
            <div className="flex gap-1.5 mt-2 flex-wrap">
              {QUICK_AMOUNTS.map((amount) => (
                <motion.button
                  key={amount}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setAmountReceived(String(amount))}
                  className={`px-3 py-1.5 text-xs font-medium rounded-xl border transition-all duration-200 ${
                    Number(amountReceived) === amount
                      ? "bg-primary/10 text-primary border-primary/30"
                      : "border-border/50 text-muted-foreground hover:bg-accent/50 bg-muted/20"
                  }`}>
                  {formatCurrencyRupiah(amount)}
                </motion.button>
              ))}
            </div>
            <AnimatePresence>
              {Number(amountReceived) > 0 && Number(amountReceived) < finalTotal && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-xs text-red-400 mt-1">
                  {t("page.cashier.modal.amountShort")}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          <AnimatePresence>
            {Number(amountReceived) >= finalTotal && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex justify-between items-center p-3 rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20">
                <span className="text-sm font-medium text-green-600 dark:text-green-400">
                  {t("page.cashier.change")}
                </span>
                <span className="text-lg font-bold text-green-600 dark:text-green-400">
                  {formatCurrencyRupiah(change)}
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          <div>
            <label className="text-sm font-medium mb-2 block text-foreground/80">
              {t("page.cashier.modal.orderType")}
            </label>
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setOrderType("dine_in");
                  setSelectedTable("");
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all duration-200 flex-1 ${
                  orderType === "dine_in"
                    ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground border-primary/50 shadow-md shadow-primary/20"
                    : "border-border/50 text-muted-foreground hover:bg-accent/50 bg-muted/30"
                }`}>
                <UtensilsCrossed size={16} />
                {t("page.cashier.modal.dineIn")}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setOrderType("take_away");
                  setSelectedTable("");
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all duration-200 flex-1 ${
                  orderType === "take_away"
                    ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground border-primary/50 shadow-md shadow-primary/20"
                    : "border-border/50 text-muted-foreground hover:bg-accent/50 bg-muted/30"
                }`}>
                <ShoppingBag size={16} />
                {t("page.cashier.modal.takeAway")}
              </motion.button>
            </div>
          </div>

          {orderType === "dine_in" && tables.length > 0 && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
              <label className="text-sm font-medium mb-2 block flex items-center gap-1.5 text-foreground/80">
                <Table2 size={14} /> {t("page.cashier.modal.table")}
              </label>
              <div className="flex flex-wrap gap-1.5">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedTable("")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all duration-200 ${
                    !selectedTable
                      ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground border-primary/50 shadow-sm"
                      : "border-border/50 text-muted-foreground hover:bg-accent/50 bg-muted/20"
                  }`}>
                  {t("page.cashier.modal.none")}
                </motion.button>
                {tables.map((t) => {
                  const tid = t.id || t._id;
                  return (
                    <motion.button
                      key={tid}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedTable(tid)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all duration-200 ${
                        selectedTable === tid
                          ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground border-primary/50 shadow-sm"
                          : "border-border/50 text-muted-foreground hover:bg-accent/50 bg-muted/20"
                      }`}>
                      {t.name || t.tableName || tid}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {discounts.length > 0 && (
            <div>
              <label className="text-sm font-medium mb-2 block flex items-center gap-1.5 text-foreground/80">
                <Percent size={14} /> {t("page.cashier.modal.discount")}
              </label>
              <div className="flex flex-wrap gap-1.5">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedDiscount("")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all duration-200 ${
                    !selectedDiscount
                      ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground border-primary/50 shadow-sm"
                      : "border-border/50 text-muted-foreground hover:bg-accent/50 bg-muted/20"
                  }`}>
                  {t("page.cashier.modal.none")}
                </motion.button>
                {discounts.map((d) => {
                  const did = d.id || d._id;
                  const dType = d.type || d.discountType || "percentage";
                  const dVal = Number(d.value || d.discountValue || 0);
                  const label =
                    dType === "nominal" || dType === "fixed"
                      ? `${d.name || "Diskon"} (${formatCurrencyRupiah(dVal)})`
                      : `${d.name || "Diskon"} (${dVal}%)`;
                  return (
                    <motion.button
                      key={did}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedDiscount(did)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all duration-200 ${
                        selectedDiscount === did
                          ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground border-primary/50 shadow-sm"
                          : "border-border/50 text-muted-foreground hover:bg-accent/50 bg-muted/20"
                      }`}>
                      {label}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <label className="text-sm font-medium mb-2 block flex items-center gap-1.5 text-foreground/80">
              <User size={14} /> {t("page.cashier.modal.member")}
            </label>
            <div className="relative">
              <User
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60"
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
                className="pl-9 h-10 text-sm bg-muted/30 backdrop-blur-sm border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all rounded-xl"
              />
            </div>
            <AnimatePresence>
              {selectedMember && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="mt-2 p-3 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center">
                      <User size={14} className="text-primary" />
                    </div>
                    <span className="text-sm font-medium text-foreground/90">
                      {selectedMember.name}
                    </span>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      onClick={() => {
                        setSelectedMember(null);
                        setMemberSearch("");
                      }}
                      className="ml-auto text-xs text-red-400 hover:text-red-500 transition-colors">
                      {t("common.delete")}
                    </motion.button>
                  </div>
                  <div className="flex items-center gap-2 pl-9 mt-0.5">
                    <span className="text-xs text-muted-foreground/70">
                      {t("page.cashier.modal.memberPoints")}:{" "}
                      {Number(selectedMember.totalPoints || 0).toLocaleString("id-ID")}
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <AnimatePresence>
              {showMemberResults && memberSearch.length >= 2 && !selectedMember && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="mt-1 border border-border/50 rounded-xl overflow-hidden bg-card/90 backdrop-blur-sm shadow-lg">
                  {members.length === 0 ? (
                    <p className="p-3 text-xs text-muted-foreground/70">
                      {t("page.cashier.modal.memberNotFound")}
                    </p>
                  ) : (
                    members.map((m) => (
                      <motion.button
                        key={m.id || m._id}
                        whileHover={{ backgroundColor: "rgba(255,255,255,0.05)" }}
                        onClick={() => {
                          setSelectedMember(m);
                          setMemberSearch(m.name);
                          setShowMemberResults(false);
                        }}
                        className="w-full text-left px-3 py-2.5 text-sm flex items-center gap-2 hover:bg-accent/30 transition-colors border-b border-border/20 last:border-0">
                        <div className="w-7 h-7 rounded-lg bg-muted/50 flex items-center justify-center">
                          <User size={14} className="text-muted-foreground/60" />
                        </div>
                        <div>
                          <span className="font-medium text-foreground/90">{m.name}</span>
                          {m.phoneNumber && (
                            <span className="text-xs text-muted-foreground/60 ml-2">
                              {m.phoneNumber}
                            </span>
                          )}
                        </div>
                      </motion.button>
                    ))
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {selectedMember && items.some((item) => item.redeemPoints > 0) && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
              <label className="text-sm font-medium mb-2 block flex items-center gap-1.5">
                <Star size={14} className="text-amber-500" />
                {t("page.cashier.modal.redeemTitle")}
              </label>
              <div className="text-xs text-muted-foreground/70 mb-2">
                {t("page.cashier.modal.redeemBalance")}:{" "}
                {Number(selectedMember.totalPoints || 0).toLocaleString("id-ID")}
              </div>
              <div className="space-y-1.5">
                {items.map((item, idx) => {
                  if (!item.redeemPoints) return null;
                  const key = item.cartKey || item.id || idx;
                  const isRedeemed = redeemedItemKeys.includes(key);
                  return (
                    <motion.button
                      key={key}
                      whileHover={{ scale: 1.005 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        if (isRedeemed) {
                          setRedeemedItemKeys((prev) => prev.filter((k) => k !== key));
                        } else {
                          const currentTotal = redeemedItemKeys.reduce((sum, k) => {
                            const it = items.find(
                              (i) => (i.cartKey || i.id || items.indexOf(i)) === k
                            );
                            return sum + (it?.redeemPoints || 0);
                          }, 0);
                          if (
                            (selectedMember.totalPoints || 0) >=
                            currentTotal + item.redeemPoints
                          ) {
                            setRedeemedItemKeys((prev) => [...prev, key]);
                          } else {
                            toast.error(t("page.cashier.modal.redeemInsufficient"));
                          }
                        }
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border text-sm transition-all duration-200 ${
                        isRedeemed
                          ? "bg-gradient-to-r from-amber-500/10 to-amber-500/5 border-amber-500/30 text-amber-700 dark:text-amber-400"
                          : "border-border/50 text-muted-foreground hover:bg-accent/30 bg-muted/20"
                      }`}>
                      <span className="font-medium">{item.name}</span>
                      <span
                        className={`text-xs font-semibold flex items-center gap-1 ${
                          isRedeemed ? "text-amber-600 dark:text-amber-400" : ""
                        }`}>
                        {isRedeemed && (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center">
                            <Check size={10} />
                          </motion.span>
                        )}
                        {Number(item.redeemPoints).toLocaleString("id-ID")} poin
                      </span>
                    </motion.button>
                  );
                })}
              </div>
              {totalRedeemPoints > 0 && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs text-amber-600 dark:text-amber-400 mt-1 font-medium">
                  {t("page.cashier.modal.redeemTotal")}:{" "}
                  {Number(totalRedeemPoints).toLocaleString("id-ID")} poin
                </motion.p>
              )}
            </motion.div>
          )}

          <div>
            <label className="text-sm font-medium mb-2 block text-foreground/80">
              {t("page.cashier.modal.notes")}
            </label>
            <textarea
              placeholder={t("page.cashier.modal.notesPlaceholder")}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-border/50 rounded-xl bg-muted/30 backdrop-blur-sm text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
            />
          </div>
        </div>

        <div className="px-5 py-4 border-t border-border/50 flex justify-end gap-2 bg-card/50">
          <Button variant="outline" onClick={onClose} className="rounded-xl border-border/50">
            {t("common.cancel")}
          </Button>
          <motion.div
            whileHover={isComplete ? { scale: 1.01 } : {}}
            whileTap={isComplete ? { scale: 0.99 } : {}}>
            <Button
              onClick={handleSubmit}
              disabled={!isComplete || orderMutation.isLoading}
              className="min-w-[140px] rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/20 transition-all">
              {orderMutation.isLoading ? (
                <span className="flex items-center gap-2">
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                  />
                  {t("page.cashier.modal.processing")}
                </span>
              ) : (
                `${t("page.cashier.checkout")} ${formatCurrencyRupiah(finalTotal)}`
              )}
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CheckoutModal;
