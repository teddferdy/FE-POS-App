import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { useMutation, useQuery } from "react-query";
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
  Search
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { createTransaction } from "@/services/transaction";
import { getAllCustomer } from "@/services/customer";
import { getDiscount } from "@/services/discount";
import { toast } from "sonner";

const PAYMENT_METHODS = [
  { id: "cash", label: "Tunai", icon: Banknote, color: "from-emerald-500 to-emerald-600" },
  { id: "qris", label: "QRIS", icon: Smartphone, color: "from-violet-500 to-violet-600" },
  { id: "debit", label: "Debit", icon: CreditCard, color: "from-blue-500 to-blue-600" },
  { id: "credit", label: "Kredit", icon: CreditCard, color: "from-orange-500 to-orange-600" },
  { id: "other", label: "Lainnya", icon: Wallet, color: "from-slate-500 to-slate-600" }
];

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
  const cashInputRef = useRef(null);
  const searchContainerRef = useRef(null);
  const discountSearchRef = useRef(null);

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

  const { data: customersData } = useQuery(["customers"], getAllCustomer, {});
  const { data: discountsData } = useQuery(["discounts"], getDiscount, {});

  const customers = useMemo(() => {
    const data = customersData?.data || customersData || [];
    return Array.isArray(data) ? data : [];
  }, [customersData]);

  const discounts = useMemo(() => {
    const data = discountsData?.data || discountsData || [];
    return Array.isArray(data) ? data : [];
  }, [discountsData]);

  const taxRate = 0.11;
  const taxAmount = subtotal * taxRate;
  const discountValue = selectedDiscount
    ? selectedDiscount.type === "percentage"
      ? subtotal * (selectedDiscount.value / 100)
      : selectedDiscount.value
    : discountAmount;
  const total = Math.max(0, subtotal + taxAmount - discountValue);
  const cashAmountNum = parseFloat(cashAmount) || 0;
  const change = fullPayment ? 0 : Math.max(0, cashAmountNum - total);

  const applyFullPayment = useCallback(() => {
    setFullPayment(true);
    setCashAmount(String(Math.ceil(total / 1000) * 1000));
  }, [total]);

  const handleDiscountSelect = useCallback((disc) => {
    setSelectedDiscount(disc);
    setShowDiscountDropdown(false);
    setDiscountAmount(0);
  }, []);

  const clearDiscount = useCallback(() => {
    setSelectedDiscount(null);
    setDiscountAmount(0);
  }, []);

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
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowCustomerDropdown(false);
      }
      if (discountSearchRef.current && !discountSearchRef.current.contains(e.target)) {
        setShowDiscountDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const mutation = useMutation({
    mutationFn: (payload) => createTransaction(payload),
    onSuccess: (res) => {
      toast.success(t("page.cashier.transactionSuccess"));
      const result = res?.data || res;
      onComplete(result);
    },
    onError: (err) => {
      toast.error(
        err?.response?.data?.message || err?.message || t("page.cashier.transactionError")
      );
    }
  });

  const handleSubmit = useCallback(() => {
    if (!paymentMethod) {
      toast.error(t("page.cashier.selectPayment"));
      return;
    }
    if (paymentMethod === "cash" && cashAmountNum < total) {
      toast.error(t("page.cashier.insufficientCash"));
      return;
    }

    const mappedItems = items.map((item) => ({
      idProduct: item.idProduct,
      nameProduct: item.nameProduct,
      price: item.price,
      count: item.count,
      variantName: item.variantName || null,
      totalPrice: item.totalPrice,
      discount: item.discount || 0
    }));

    const payload = {
      cashierId: cashierId || cookie?.user?.id || cookie?.user?.ID,
      cashierName: cashierName || cookie?.user?.userName || cookie?.user?.name,
      storeId: store,
      customerId: selectedCustomer?.id || selectedCustomer?._id || null,
      discountId: selectedDiscount?.id || selectedDiscount?._id || null,
      discountValue: discountValue,
      tax: taxAmount,
      total: total,
      paymentMethod: paymentMethod,
      cashAmount: paymentMethod === "cash" ? cashAmountNum : total,
      changeAmount: paymentMethod === "cash" ? change : 0,
      items: mappedItems
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
    discountValue,
    taxAmount,
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

  const canSubmit = paymentMethod && (paymentMethod !== "cash" || cashAmountNum >= total);

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

              <div ref={searchContainerRef} className="relative">
                <label className="block text-sm font-medium mb-1.5 text-muted-foreground">
                  {t("page.cashier.customer")}
                </label>
                <div className="relative">
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
                    }}
                    onFocus={() => setShowCustomerDropdown(true)}
                    placeholder={t("page.cashier.searchCustomer")}
                    className="w-full h-10 pl-9 pr-4 text-sm rounded-xl bg-accent/50 border border-border/60 outline-none focus:border-primary/50 transition-colors"
                  />
                </div>
                {showCustomerDropdown && (
                  <div className="absolute z-10 mt-1 w-full bg-card border border-border/60 rounded-xl shadow-xl overflow-hidden">
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
                  </div>
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
                    }}
                    onFocus={() => setShowDiscountDropdown(true)}
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
                {showDiscountDropdown && (
                  <div className="absolute z-10 mt-1 w-full bg-card border border-border/60 rounded-xl shadow-xl overflow-hidden">
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
                              {d.type === "percentage"
                                ? `${d.value}%`
                                : `Rp ${formatPrice(d.value)}`}
                            </span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="px-4 py-3 text-sm text-muted-foreground">
                        {t("page.cashier.noDiscount")}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-muted-foreground">
                  {t("page.cashier.paymentMethod")}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {PAYMENT_METHODS.map((method) => {
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
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium text-sm">
                      Rp
                    </span>
                    <input
                      ref={cashInputRef}
                      type="number"
                      value={cashAmount}
                      onChange={(e) => {
                        setCashAmount(e.target.value);
                        setFullPayment(false);
                      }}
                      placeholder="0"
                      className="w-full h-12 pl-10 pr-4 text-lg font-bold rounded-xl bg-accent/50 border border-border/60 outline-none focus:border-primary/50 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                  {cashAmountNum > 0 && cashAmountNum < total && (
                    <div className="flex items-center gap-1.5 text-xs text-destructive bg-destructive/5 rounded-lg px-3 py-2">
                      <AlertCircle size={12} />
                      {t("page.cashier.insufficientCash")}
                    </div>
                  )}
                  {cashAmountNum >= total && (
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
                    {PAYMENT_METHODS.find((m) => m.id === paymentMethod)?.label || "-"}
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
