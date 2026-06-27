import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import PropTypes from "prop-types";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useCookies } from "react-cookie";
import {
  X,
  CreditCard,
  Banknote,
  Check,
  Receipt,
  Percent,
  Printer,
  Ticket,
  Users,
  Smartphone,
  Loader2,
  AlertCircle,
  Wallet,
  RotateCcw,
  Search,
  Plus,
  UserPlus
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { createOrder } from "@/services/order";
import { getAllCustomer, addCustomer } from "@/services/customer";
import { getAllDiscount, lookupDiscountByCode } from "@/services/discount";
import { getAllMemberTier } from "@/services/member-tier";
import { getAllTypePayment } from "@/services/type-payment";
import { getMemberById } from "@/services/member";
import { toast } from "sonner";

const CheckoutModal = ({
  items: propItems,
  subtotal: propSubtotal,
  store,
  cashierName,
  cashierId,
  onClose,
  onComplete
}) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [cookie] = useCookies();
  const [step] = useState("payment");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [cashAmount, setCashAmount] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [selectedDiscount, setSelectedDiscount] = useState(null);
  const [showDiscountDropdown, setShowDiscountDropdown] = useState(false);
  const [discountSearch, setDiscountSearch] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [fullPayment, setFullPayment] = useState(false);
  const [addCustomerOpen, setAddCustomerOpen] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerPhone, setNewCustomerPhone] = useState("");
  const [selectedTier, setSelectedTier] = useState(null);
  const [promoCode, setPromoCode] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);
  const [redeemPoints, setRedeemPoints] = useState("");
  const [memberPoints, setMemberPoints] = useState(0);
  const cashInputRef = useRef(null);
  const searchContainerRef = useRef(null);
  const discountSearchRef = useRef(null);
  const customerPortalRef = useRef(null);
  const discountPortalRef = useRef(null);
  const [customerDropdownPos, setCustomerDropdownPos] = useState({ top: 0, left: 0, width: 0 });
  const [discountDropdownPos, setDiscountDropdownPos] = useState({ top: 0, left: 0, width: 0 });

  const updateDropdownPos = useCallback(() => {
    const custRect = searchContainerRef.current?.getBoundingClientRect();
    if (custRect) setCustomerDropdownPos({ top: custRect.bottom + 4, left: custRect.left, width: custRect.width });
    const discRect = discountSearchRef.current?.getBoundingClientRect();
    if (discRect) setDiscountDropdownPos({ top: discRect.bottom + 4, left: discRect.left, width: discRect.width });
  }, []);

  const items = useMemo(() => {
    if (propItems && propItems.length > 0) {
      return propItems.map((item) => ({
        idProduct: item.id || item.ID || item.idProduct || item._id,
        nameProduct: item.nameProduct || item.name || "",
        price: Number(item.price) || 0,
        variantName: item.variantName || null,
        count: item.count || item.qty || 0,
        image: item.image || item.imageProduct || null,
        discount: Number(item.discountItem) || 0,
        totalPrice: Number(item.totalPrice) || 0
      }));
    }
    return [];
  }, [propItems]);

  const subtotal = useMemo(
    () => propSubtotal || items.reduce((sum, item) => sum + Number(item.totalPrice) || 0, 0),
    [propSubtotal, items]
  );

  const { data: customersData } = useQuery(
    ["customers"],
    () => getAllCustomer({ page: 1, limit: 999 }),
    { staleTime: 5 * 60 * 1000 }
  );
  const { data: discountsData } = useQuery(
    ["discounts-active"],
    () => getAllDiscount({ page: 1, limit: 999, statusDiscount: "active" }),
    { staleTime: 5 * 60 * 1000 }
  );
  const { data: tiersData } = useQuery(
    ["member-tiers-active"],
    () => getAllMemberTier({ status: "active" }),
    { staleTime: 5 * 60 * 1000 }
  );
  const { data: paymentMethodsData } = useQuery(
    ["payment-methods-active"],
    () => getAllTypePayment({ store, status: "active" }),
    { staleTime: 5 * 60 * 1000 }
  );
  const customerId = selectedCustomer?.id || selectedCustomer?._id;
  const { data: memberData } = useQuery(
    ["member-points", customerId],
    () => getMemberById({ id: customerId }),
    { enabled: !!customerId, retry: false, staleTime: 10 * 1000 }
  );

  const customers = useMemo(() => {
    const data = customersData?.data || customersData || [];
    const list = Array.isArray(data) ? data : [];
    // ponytail: filter active only client-side; BE doesn't support status filter
    return list.filter((c) => {
      const s = (c.status || "").toString().toLowerCase();
      return !s || s === "active" || s === "true";
    });
  }, [customersData]);

  const discounts = useMemo(() => {
    const data = discountsData?.data || discountsData || [];
    return Array.isArray(data) ? data : [];
  }, [discountsData]);

  const memberTiers = useMemo(() => {
    const data = tiersData?.data || tiersData?.tiers || [];
    return Array.isArray(data) ? data : [];
  }, [tiersData]);

  const paymentMethods = useMemo(() => {
    const data = paymentMethodsData?.data || paymentMethodsData || [];
    const list = Array.isArray(data) ? data : [];
    if (list.length > 0) {
      return list
        .filter((pm) => {
          const s = (pm.status || '').toString().toLowerCase();
          return !s || s === 'active' || s === 'true';
        })
        .map((pm) => ({
          id: pm.type || pm.id?.toString() || pm.name?.toLowerCase(),
          label: pm.name,
          icon: pm.type === "cash" || pm.type === "tunai" ? Banknote
               : pm.type === "qris" || pm.type === "e-wallet" ? Smartphone
               : pm.type === "debit" || pm.type === "kartu" ? CreditCard
               : Wallet,
          color: "from-primary to-primary/70"
        }))
    }
    // ponytail: fallback when API unavailable
    return [
      { id: "cash", label: "Tunai", icon: Banknote, color: "from-emerald-500 to-emerald-600" },
      { id: "qris", label: "QRIS", icon: Smartphone, color: "from-violet-500 to-violet-600" },
      { id: "debit", label: "Debit", icon: CreditCard, color: "from-blue-500 to-blue-600" },
      { id: "credit", label: "Kredit", icon: CreditCard, color: "from-orange-500 to-orange-600" },
      { id: "other", label: "Lainnya", icon: Wallet, color: "from-slate-500 to-slate-600" }
    ];
  }, [paymentMethodsData]);

  const taxRate = 0.11;
  const taxAmount = subtotal * taxRate;
  const discountValue = selectedDiscount
    ? selectedDiscount.type === "percent"
      ? subtotal * (selectedDiscount.value / 100)
      : selectedDiscount.value
    : discountAmount;
  const total = Math.max(0, subtotal + taxAmount - discountValue);
  const pointsDiscount = Number(redeemPoints) || 0;
  const remainingTotal = Math.max(0, total - pointsDiscount);
  const cashAmountNum = parseFloat(cashAmount) || 0;
  const change = Math.max(0, cashAmountNum - remainingTotal);

  const applyFullPayment = useCallback(() => {
    setFullPayment(true);
    setCashAmount(String(Math.ceil(total / 1000) * 1000));
  }, [total]);

  const handleDiscountSelect = useCallback((disc) => {
    setSelectedDiscount(disc);
    setDiscountSearch(disc.nameDiscount || disc.name || disc.discountName || "");
    setShowDiscountDropdown(false);
    setDiscountAmount(0);
  }, []);

  const clearDiscount = useCallback(() => {
    setSelectedDiscount(null);
    setDiscountAmount(0);
    setPromoCode("");
    setDiscountSearch("");
  }, []);

  const handleApplyPromoCode = useCallback(async () => {
    if (!promoCode.trim()) return;
    setPromoLoading(true);
    try {
      const res = await lookupDiscountByCode(promoCode.trim().toUpperCase(), store);
      const disc = res?.data || res;
      if (disc?.id || disc?._id) {
        setSelectedDiscount(disc);
        toast.success(t("page.cashier.promoApplied"));
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || t("page.cashier.promoInvalid"));
    } finally {
      setPromoLoading(false);
    }
  }, [promoCode, store, t]);

  const filteredCustomers = useMemo(() => {
    if (!customerSearch) return customers;
    const q = customerSearch.toLowerCase();
    return customers.filter(
      (c) =>
        (c.name || c.Name || "").toLowerCase().includes(q) ||
        (c.phone || c.Phone || "").toLowerCase().includes(q) ||
        (c.email || "").toLowerCase().includes(q)
    );
  }, [customers, customerSearch]);

  const filteredDiscounts = useMemo(() => {
    if (!discountSearch) return discounts;
    const q = discountSearch.toLowerCase();
    return discounts.filter((d) =>
      (d.nameDiscount || d.name || d.discountName || "").toLowerCase().includes(q)
    );
  }, [discounts, discountSearch]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target) && !customerPortalRef.current?.contains(e.target)) {
        setShowCustomerDropdown(false);
      }
      if (discountSearchRef.current && !discountSearchRef.current.contains(e.target) && !discountPortalRef.current?.contains(e.target)) {
        setShowDiscountDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!showCustomerDropdown && !showDiscountDropdown) return;
    const updatePos = () => {
      const custRect = searchContainerRef.current?.getBoundingClientRect();
      if (custRect) setCustomerDropdownPos({ top: custRect.bottom + 4, left: custRect.left, width: custRect.width });
      const discRect = discountSearchRef.current?.getBoundingClientRect();
      if (discRect) setDiscountDropdownPos({ top: discRect.bottom + 4, left: discRect.left, width: discRect.width });
    };
    window.addEventListener("scroll", updatePos, true);
    window.addEventListener("resize", updatePos);
    return () => {
      window.removeEventListener("scroll", updatePos, true);
      window.removeEventListener("resize", updatePos);
    };
  }, [showCustomerDropdown, showDiscountDropdown]);

  useEffect(() => {
    if (customerId) {
      const pts = memberData?.data?.totalPoints || memberData?.totalPoints || 0;
      setMemberPoints(Number(pts));
      setRedeemPoints("");
    } else {
      setMemberPoints(0);
      setRedeemPoints("");
    }
  }, [customerId, memberData]);

  const mutation = useMutation({
    mutationFn: (payload) => createOrder(payload),
    onSuccess: (res, variables) => {
      toast.success(t("page.cashier.transactionSuccess"));
      const order = res?.data || res;
      onComplete({
        ...order,
        subtotal: order.subTotal,
        total: order.totalPrice,
        grandTotal: order.totalPrice,
        cashAmount: variables.paymentMethod === "cash" ? variables.cashAmount : order.totalPrice,
        changeAmount: variables.paymentMethod === "cash" ? variables.changeAmount : 0,
        items: (order.items || []).map((item) => ({
          ...item,
          nameProduct: item.productName,
          count: item.quantity
        }))
      });
    },
    onError: (err) => {
      toast.error(
        err?.response?.data?.message || err?.message || t("page.cashier.transactionError")
      );
    }
  });

  const addCustomerMutation = useMutation({
    mutationFn: (payload) => addCustomer(payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries(["customers"]);
      const newCust = res?.data || res;
      if (newCust?.id || newCust?._id) {
        setSelectedCustomer(newCust);
        setCustomerSearch(newCust.name || newCust.Name || newCustomerName);
      }
      setAddCustomerOpen(false);
      setNewCustomerName("");
      setNewCustomerPhone("");
      setSelectedTier(null);
      toast.success(t("page.cashier.customerAdded"));
    },
    onError: (err) => {
      toast.error(
        err?.response?.data?.message || err?.message || t("page.cashier.customerAddError")
      );
    }
  });

  const handleAddCustomer = useCallback(() => {
    if (!newCustomerName.trim()) return;
    addCustomerMutation.mutate({
      name: newCustomerName.trim(),
      phone: newCustomerPhone.trim(),
      phoneNumber: newCustomerPhone.trim(),
      tier: selectedTier?.id || null
    });
  }, [newCustomerName, newCustomerPhone, selectedTier, addCustomerMutation]);

  const handleSubmit = useCallback(() => {
    if (!paymentMethod) {
      toast.error(t("page.cashier.selectPayment"));
      return;
    }
    if (paymentMethod === "cash" && cashAmountNum < total) {
      toast.error(t("page.cashier.insufficientCash"));
      return;
    }

    const payload = {
      store: store,
      cashierId: cashierId || cookie?.user?.id || cookie?.user?.ID,
      cashierName: cashierName || cookie?.user?.userName || cookie?.user?.name,
      customerId: selectedCustomer?.id || selectedCustomer?._id || null,
      customerName: selectedCustomer?.name || selectedCustomer?.Name || null,
      discountId: selectedDiscount?.id || selectedDiscount?._id || null,
      promoCode: promoCode.trim() || undefined,
      redeemedPoints: Number(redeemPoints) || 0,
      paymentMethod: paymentMethod,
      cashAmount: paymentMethod === "cash" ? cashAmountNum : total,
      changeAmount: paymentMethod === "cash" ? change : 0,
      items: items.map((item) => ({
        product: item.idProduct,
        productName: item.nameProduct,
        quantity: item.count,
        price: item.price,
        basePrice: item.price,
        subtotal: item.totalPrice,
        options: item.variantName ? [{ name: item.variantName }] : [],
        modifiers: []
      }))
    };

    mutation.mutate(payload);
  }, [
    paymentMethod,
    cashAmountNum,
    total,
    items,
    cashierId,
    cashierName,
    store,
    selectedCustomer,
    selectedDiscount,
    promoCode,
    redeemPoints,
    change,
    mutation,
    cookie,
    t
  ]);

  const formatPrice = (value) => {
    if (value == null || isNaN(value)) return "0";
    return Number(value).toLocaleString("id-ID");
  };

  const quickAmounts = useMemo(() => {
    if (total <= 0) return [];
    const base = Math.ceil(total / 1000) * 1000;
    return [base, base + 10000, base + 20000, base + 50000, base + 100000];
  }, [total]);

  const canSubmit = paymentMethod && (paymentMethod !== "cash" || cashAmountNum >= remainingTotal);

  return (
    <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-border/50 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 shrink-0">
          <div className="flex items-center gap-2">
            <Receipt size={20} className="text-primary" />
            <h2 className="text-lg font-bold">{t("page.cashier.payment")}</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-accent transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {step === "payment" && (
            <>
              <div className="bg-muted/40 rounded-xl p-4 border border-border/40 space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t("page.cashier.subtotal")}</span>
                  <span className="font-medium">Rp {formatPrice(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t("page.cashier.tax")} (11%)</span>
                  <span className="font-medium">Rp {formatPrice(taxAmount)}</span>
                </div>
                {discountValue > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-emerald-500 flex items-center gap-1">
                      <Percent size={12} />
                      {t("page.cashier.discount")}
                    </span>
                    <span className="font-medium text-emerald-500">
                      -Rp {formatPrice(discountValue)}
                    </span>
                  </div>
                )}
                <div className="border-t border-border/40 pt-1.5 mt-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold">{t("page.cashier.total")}</span>
                    <span className="font-bold text-lg text-primary">Rp {formatPrice(total)}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-muted-foreground">
                  {t("page.cashier.paymentMethod")}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(paymentMethods.length > 0 ? paymentMethods : []).map((method) => {
                    const Icon = method.icon;
                    const isSelected = paymentMethod === method.id;
                    return (
                      <button
                        key={method.id}
                        onClick={() => setPaymentMethod(method.id)}
                        className={`relative flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all duration-200 ${
                          isSelected
                            ? "border-primary bg-primary/10 shadow-sm shadow-primary/10 scale-[1.02]"
                            : "border-border/50 bg-card/50 hover:border-border hover:bg-accent/50"
                        }`}>
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center bg-gradient-to-br ${method.color} shadow-sm`}>
                          <Icon size={16} className="text-white" />
                        </div>
                        <span
                          className={`text-xs font-medium ${
                            isSelected ? "text-primary" : "text-muted-foreground"
                          }`}>
                          {method.label}
                        </span>
                        {isSelected && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center shadow-lg">
                            <Check size={10} className="text-primary-foreground" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {paymentMethod === "cash" && (
                <div className="bg-muted/30 rounded-xl p-4 border border-border/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-muted-foreground">
                      {t("page.cashier.cashAmount")}
                    </label>
                    <button
                      onClick={applyFullPayment}
                      className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors">
                      <RotateCcw size={12} />
                      {t("page.cashier.roundUp")}
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      ref={cashInputRef}
                      type="text"
                      value={cashAmount ? `Rp ${Number(cashAmount).toLocaleString("id-ID")}` : ""}
                      onChange={(e) => {
                        setCashAmount(e.target.value.replace(/[^0-9]/g, ""));
                        setFullPayment(false);
                      }}
                      placeholder="Rp 0"
                      className="w-full h-12 px-4 text-lg font-bold rounded-xl bg-accent/50 border border-border/60 outline-none focus:border-primary/50 transition-colors text-right"
                      inputMode="numeric"
                    />
                  </div>
                  {cashAmountNum > 0 && remainingTotal > 0 && cashAmountNum < remainingTotal && (
                    <div className="flex items-center gap-1.5 text-xs text-destructive bg-destructive/5 rounded-lg px-3 py-2">
                      <AlertCircle size={12} />
                      {t("page.cashier.insufficientCash")}
                    </div>
                  )}
                  {cashAmountNum >= remainingTotal && (
                    <div className="flex items-center justify-between text-sm bg-emerald-500/5 rounded-lg px-3 py-2">
                      <span className="text-emerald-500 font-medium">
                        {t("page.cashier.change")}
                      </span>
                      <span className="font-bold text-emerald-500">Rp {formatPrice(change)}</span>
                    </div>
                  )}
                  {!fullPayment && (
                    <div className="flex flex-wrap gap-1.5">
                      {quickAmounts.map((amt, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setCashAmount(String(amt));
                            setFullPayment(false);
                          }}
                          className="px-3 py-1.5 text-xs font-medium rounded-lg bg-accent/50 border border-border/50 hover:bg-accent hover:border-border transition-all">
                          Rp {formatPrice(amt)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div ref={searchContainerRef} className="relative">
                <label className="block text-sm font-medium mb-1.5 text-muted-foreground">
                  {t("page.cashier.customer")}
                </label>
                <div className="relative flex gap-2">
                  <div className="relative flex-1">
                    <Search
                      size={15}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    />
                    <input
                      type="text"
                      value={customerSearch}
                      onChange={(e) => {
                        setCustomerSearch(e.target.value);
                        setShowCustomerDropdown(true);
                        updateDropdownPos();
                      }}
                      onFocus={() => {
                        setShowCustomerDropdown(true);
                        updateDropdownPos();
                      }}
                      placeholder={t("page.cashier.searchCustomer")}
                      className="w-full h-10 pl-9 pr-4 text-sm rounded-xl bg-accent/50 border border-border/60 outline-none focus:border-primary/50 transition-colors"
                    />
                  </div>
                  <button
                    onClick={() => setAddCustomerOpen(true)}
                    className="shrink-0 w-10 h-10 rounded-xl bg-primary/10 border border-border/60 flex items-center justify-center text-primary hover:bg-primary/20 transition-all"
                    title={t("page.cashier.addCustomer")}>
                    <Plus size={18} />
                  </button>
                </div>
                {showCustomerDropdown && createPortal(
                  <div
                    ref={customerPortalRef}
                    style={{
                      position: 'fixed',
                      top: customerDropdownPos.top,
                      left: customerDropdownPos.left,
                      width: customerDropdownPos.width,
                      zIndex: 70
                    }}
                    className="bg-card border border-border/60 rounded-xl shadow-xl overflow-hidden">
                    {filteredCustomers.length > 0 ? (
                      <div className="max-h-40 overflow-y-auto">
                        {filteredCustomers.map((c, idx) => (
                          <button
                            key={c.id || c._id || idx}
                            onClick={() => {
                              setSelectedCustomer(c);
                              setShowCustomerDropdown(false);
                              setCustomerSearch(c.name || c.Name || "");
                            }}
                            className="w-full px-4 py-2.5 text-left text-sm hover:bg-accent transition-colors flex items-center gap-2">
                            <Users size={14} className="text-muted-foreground" />
                            <span className="font-medium">{c.name || c.Name || "-"}</span>
                            <span className="text-muted-foreground text-xs ml-auto">
                              {c.phone || c.Phone || ""}
                            </span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="px-4 py-3 text-sm text-muted-foreground">
                        {t("page.cashier.noCustomer")}
                      </div>
                    )}
                  </div>,
                  document.body
                )}
              </div>

              <div ref={discountSearchRef} className="relative">
                <label className="block text-sm font-medium mb-1.5 text-muted-foreground">
                  {t("page.cashier.discount")}
                </label>
                <div className="relative">
                  <Ticket
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <input
                    type="text"
                    value={discountSearch}
                    onChange={(e) => {
                      setDiscountSearch(e.target.value);
                      setShowDiscountDropdown(true);
                      updateDropdownPos();
                    }}
                    onFocus={() => {
                      setShowDiscountDropdown(true);
                      updateDropdownPos();
                    }}
                    placeholder={t("page.cashier.searchDiscount")}
                    className="w-full h-10 pl-9 pr-4 text-sm rounded-xl bg-accent/50 border border-border/60 outline-none focus:border-primary/50 transition-colors"
                  />
                  {selectedDiscount && (
                    <button
                      onClick={clearDiscount}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      <X size={14} />
                    </button>
                  )}
                </div>
                {showDiscountDropdown && createPortal(
                  <div
                    ref={discountPortalRef}
                    style={{
                      position: 'fixed',
                      top: discountDropdownPos.top,
                      left: discountDropdownPos.left,
                      width: discountDropdownPos.width,
                      zIndex: 70
                    }}
                    className="bg-card border border-border/60 rounded-xl shadow-xl overflow-hidden">
                    {filteredDiscounts.length > 0 ? (
                      <div className="max-h-40 overflow-y-auto">
                        {filteredDiscounts.map((d, idx) => (
                          <button
                            key={d.id || d._id || idx}
                            onClick={() => handleDiscountSelect(d)}
                            className="w-full px-4 py-2.5 text-left text-sm hover:bg-accent transition-colors flex items-center gap-2">
                            <Percent size={14} className="text-emerald-500" />
                            <span className="font-medium">
                              {d.nameDiscount || d.name || d.discountName || "-"}
                            </span>
                            <span className="text-muted-foreground text-xs ml-auto">
                              {d.type === "percent" ? `${d.value}%` : `Rp ${formatPrice(d.value)}`}
                            </span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="px-4 py-3 text-sm text-muted-foreground">
                        {t("page.cashier.noDiscount")}
                      </div>
                    )}
                  </div>,
                  document.body
                )}
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-muted-foreground">
                  {t("page.cashier.promoCode")}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder={t("page.cashier.promoCodePlaceholder")}
                    className="flex-1 h-10 px-4 text-sm rounded-xl bg-accent/50 border border-border/60 outline-none focus:border-primary/50 transition-colors uppercase"
                    disabled={promoLoading || !!selectedDiscount}
                  />
                  <Button
                    size="sm"
                    onClick={handleApplyPromoCode}
                    disabled={!promoCode.trim() || promoLoading || !!selectedDiscount}
                    className="h-10 px-4 rounded-xl shrink-0">
                    {promoLoading ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      t("page.cashier.apply")
                    )}
                  </Button>
                </div>
                {selectedDiscount && promoCode && (
                  <p className="text-xs text-emerald-500 flex items-center gap-1 mt-1">
                    <Check size={10} />
                    {t("page.cashier.promoApplied")}
                  </p>
                )}
              </div>

              {memberPoints > 0 && (
                <div className="bg-violet-500/5 rounded-xl p-4 border border-violet-500/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-muted-foreground">Redeem Poin</label>
                    <span className="text-xs text-violet-500 font-medium">
                      {t("common.available", "Tersedia")}: {memberPoints.toLocaleString("id-ID")} pts
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={redeemPoints ? Number(redeemPoints).toLocaleString("id-ID") : ""}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, "");
                        const max = Math.min(memberPoints, total);
                        setRedeemPoints(val ? String(Math.min(Number(val), max)) : "");
                      }}
                      placeholder="0"
                      className="flex-1 h-12 px-4 text-lg font-bold rounded-xl bg-accent/50 border border-border/60 outline-none focus:border-primary/50 transition-colors text-right tabular-nums"
                      inputMode="numeric"
                    />
                    <button
                      onClick={() => {
                        setRedeemPoints(String(Math.min(memberPoints, total)));
                      }}
                      className="shrink-0 h-12 px-4 rounded-xl bg-violet-500/10 border border-violet-500/30 text-sm font-semibold text-violet-600 hover:bg-violet-500/20 transition-all"
                    >
                      Max
                    </button>
                  </div>
                  {redeemPoints > 0 && (
                    <p className="text-xs text-emerald-500 flex items-center gap-1">
                      Diskon: Rp {Number(redeemPoints).toLocaleString("id-ID")}
                    </p>
                  )}
                </div>
              )}
            </>
          )}

          {step === "processing" && (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <div className="relative">
                <Loader2 size={48} className="text-primary animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Printer size={20} className="text-primary" />
                </div>
              </div>
              <p className="font-medium text-muted-foreground">
                {t("page.cashier.processingPayment")}
              </p>
            </div>
          )}

          {step === "success" && (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <Check size={32} className="text-emerald-500" />
              </div>
              <div className="text-center">
                <p className="font-bold text-lg">{t("page.cashier.paymentSuccess")}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {t("page.cashier.paymentSuccessDesc")}
                </p>
              </div>
              <div className="bg-muted/30 rounded-xl p-4 border border-border/40 w-full max-w-xs">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t("page.cashier.total")}</span>
                  <span className="font-bold">Rp {formatPrice(total)}</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-1">
                  <span className="text-muted-foreground">{t("page.cashier.paymentMethod")}</span>
                  <span className="font-medium">
                    {paymentMethods.find((m) => m.id === paymentMethod)?.label || (paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1))}
                  </span>
                </div>
                {paymentMethod === "cash" && (
                  <div className="flex items-center justify-between text-sm mt-1">
                    <span className="text-muted-foreground">{t("page.cashier.change")}</span>
                    <span className="font-medium">Rp {formatPrice(change)}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {addCustomerOpen && (
          <div className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div
              className="bg-card rounded-2xl shadow-2xl border border-border/50 w-full max-w-md overflow-hidden"
              onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between px-5 py-4 border-b border-border/50">
                <div className="flex items-center gap-2">
                  <UserPlus size={18} className="text-primary" />
                  <h3 className="font-semibold">{t("page.cashier.addCustomerTitle")}</h3>
                </div>
                <button
                  onClick={() => setAddCustomerOpen(false)}
                  className="p-1 rounded-lg hover:bg-accent transition-colors">
                  <X size={16} />
                </button>
              </div>
              <div className="p-5">
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1.5 text-muted-foreground">
                    {t("page.cashier.addCustomerName")}
                  </label>
                  <input
                    type="text"
                    value={newCustomerName}
                    onChange={(e) => setNewCustomerName(e.target.value)}
                    placeholder={t("page.cashier.addCustomerName")}
                    className="w-full h-10 px-4 text-sm rounded-xl bg-accent/50 border border-border/60 outline-none focus:border-primary/50 transition-colors"
                    autoFocus
                  />
                </div>
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1.5 text-muted-foreground">
                    {t("page.cashier.addCustomerPhone")}
                  </label>
                  <input
                    type="text"
                    value={newCustomerPhone}
                    onChange={(e) =>
                      setNewCustomerPhone(e.target.value.replace(/\D/g, "").slice(0, 14))
                    }
                    placeholder={t("page.cashier.addCustomerPhone")}
                    className="w-full h-10 px-4 text-sm rounded-xl bg-accent/50 border border-border/60 outline-none focus:border-primary/50 transition-colors"
                    inputMode="numeric"
                    maxLength={14}
                  />
                  <p className="text-xs text-muted-foreground mt-1">{t("common.phoneHint")}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-muted-foreground">
                    {t("page.cashier.addCustomerMemberTier")}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {memberTiers.length === 0 ? (
                      <div className="col-span-2 text-sm text-muted-foreground bg-accent/30 rounded-xl px-3 py-2">
                        {t("page.cashier.addCustomerNoTier")}
                      </div>
                    ) : (
                      memberTiers.map((tier) => {
                        const isSelected = selectedTier?.id === tier.id;
                        return (
                          <button
                            key={tier.id}
                            onClick={() => setSelectedTier(isSelected ? null : tier)}
                            className={`text-left p-3 rounded-xl border transition-all ${
                              isSelected
                                ? "border-primary bg-primary/10 shadow-sm"
                                : "border-border/50 bg-accent/30 hover:border-border hover:bg-accent/50"
                            }`}>
                            <div className="flex items-center gap-2">
                              <div
                                className="w-2.5 h-2.5 rounded-full shrink-0"
                                style={{ backgroundColor: tier.color || "#f59e0b" }}
                              />
                              <span className="text-sm font-semibold">{tier.name}</span>
                            </div>
                            <span className="text-[10px] text-muted-foreground mt-1 block">
                              {tier.discountPercent > 0
                                ? `${tier.discountPercent}% ${t("page.cashier.discount")}`
                                : "-"}
                            </span>
                            {isSelected && tier.benefits?.length > 0 && (
                              <div className="mt-2 pt-2 border-t border-border/40 space-y-1">
                                {tier.benefits.map((b, i) => (
                                  <div key={i} className="flex items-start gap-1.5">
                                    <Check size={10} className="text-emerald-500 mt-0.5 shrink-0" />
                                    <span className="text-[11px] text-muted-foreground">{b}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 px-5 py-4 border-t border-border/50 bg-muted/20">
                <Button
                  variant="outline"
                  onClick={() => setAddCustomerOpen(false)}
                  className="flex-1">
                  {t("page.cashier.addCustomerCancel")}
                </Button>
                <Button
                  onClick={handleAddCustomer}
                  disabled={!newCustomerName.trim() || addCustomerMutation.isLoading}
                  className="flex-1">
                  {addCustomerMutation.isLoading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <UserPlus size={16} />
                  )}
                  {t("page.cashier.addCustomerSave")}
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="border-t border-border/50 p-4 shrink-0">
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit || mutation.isLoading}
            className="w-full h-12 rounded-xl font-semibold text-sm relative overflow-hidden group/btn">
            <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary to-primary/90 opacity-90 group-hover/btn:opacity-100 transition-opacity" />
            <span className="relative flex items-center justify-center gap-2">
              {mutation.isLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Check size={16} />
              )}
              {mutation.isLoading ? t("page.cashier.processing") : t("page.cashier.confirmPayment")}
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
};

CheckoutModal.propTypes = {
  items: PropTypes.array,
  subtotal: PropTypes.number,
  store: PropTypes.any,
  cashierName: PropTypes.string,
  cashierId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onClose: PropTypes.func,
  onComplete: PropTypes.func
};

export default CheckoutModal;
