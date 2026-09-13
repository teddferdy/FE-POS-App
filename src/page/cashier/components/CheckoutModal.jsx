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
import { Combobox } from "@/components/ui/combobox";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { createOrder } from "@/services/order";
import { getAllCustomer, addCustomer } from "@/services/customer";
import { getAllDiscount, lookupDiscountByCode } from "@/services/discount";
import { getAllMemberTier } from "@/services/member-tier";
import { getAllTypePayment } from "@/services/type-payment";
import { getMemberById } from "@/services/member";
import { getTableAvailability, getTablesWithActiveOrders } from "@/services/table";
import { getPaymentIconKind } from "@/utils/payment";
import { toast } from "sonner";
import { dispatchDisplayEvent, DISPLAY_EVENT_TYPES } from "@/utils/customerDisplayBoard";

// The customer/discount dropdowns render in a fixed-position portal anchored
// to their input's rect — always below it, with no bounds check. On a
// shorter viewport (tablet, small laptop) with the field scrolled down near
// the bottom of the screen, that pushes the list off-screen entirely. Flip
// it above the input whenever there isn't enough room below; 200px covers
// the list's own max-h-40 (160px) plus its border/padding.
const DROPDOWN_MAX_HEIGHT = 200;

const computeDropdownPos = (rect) => {
  if (!rect) return null;
  const spaceBelow = window.innerHeight - rect.bottom;
  const openUpward = spaceBelow < DROPDOWN_MAX_HEIGHT && rect.top > spaceBelow;
  return openUpward
    ? { bottom: window.innerHeight - rect.top + 4, left: rect.left, width: rect.width }
    : { top: rect.bottom + 4, left: rect.left, width: rect.width };
};

const CheckoutModal = ({
  items: propItems,
  subtotal: propSubtotal,
  taxRate: propTaxRate,
  store,
  cashierName,
  cashierId,
  onClose,
  onTableChange,
  onComplete
}) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [cookie] = useCookies();
  // Generated once per modal mount (i.e. once per checkout attempt — the
  // parent only mounts this modal via `{checkoutOpen && <CheckoutModal/>}`
  // and unmounts it on success or close) and reused across every retry of
  // that same attempt, so a double-click or a resubmit after a timeout
  // hits the backend's idempotency-key unique constraint instead of
  // creating a second order. A fresh checkout (new mount) gets a fresh key.
  const [idempotencyKey] = useState(() =>
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`
  );
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
  const [useTax, setUseTax] = useState(true);
  const [orderType, setOrderType] = useState("take-away");
  const [selectedTable, setSelectedTable] = useState(null);
  const [partySize, setPartySize] = useState("");
  const [qrisPending, setQrisPending] = useState(false);
  const [pendingPayload, setPendingPayload] = useState(null);
  // F-SMOKE-02: mutation.isLoading flips a tick after mutate() runs, too
  // late to stop several fireEvent-speed clicks in the same turn — mirrors
  // CollectPaymentModal's synchronous guard (set on the click that starts
  // the submission, cleared in onSettled regardless of outcome).
  const isSubmittingRef = useRef(false);
  const cashInputRef = useRef(null);
  const searchContainerRef = useRef(null);
  const discountSearchRef = useRef(null);
  const customerPortalRef = useRef(null);
  const discountPortalRef = useRef(null);
  const [customerDropdownPos, setCustomerDropdownPos] = useState({ top: 0, left: 0, width: 0 });
  const [discountDropdownPos, setDiscountDropdownPos] = useState({ top: 0, left: 0, width: 0 });

  const updateDropdownPos = useCallback(() => {
    const custPos = computeDropdownPos(searchContainerRef.current?.getBoundingClientRect());
    if (custPos) setCustomerDropdownPos(custPos);
    const discPos = computeDropdownPos(discountSearchRef.current?.getBoundingClientRect());
    if (discPos) setDiscountDropdownPos(discPos);
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
    ["customers", store],
    () => getAllCustomer({ page: 1, limit: 999, store }),
    { enabled: !!store }
  );
  const { data: discountsData } = useQuery(
    ["discounts-active", store],
    () => getAllDiscount({ page: 1, limit: 999, location: store, status: "active" }),
    { enabled: !!store }
  );
  const { data: tiersData } = useQuery(["member-tiers-active"], () =>
    getAllMemberTier({ status: "active" })
  );
  const { data: paymentMethodsData } = useQuery(["payment-methods-active"], () =>
    getAllTypePayment({ store, status: "active" })
  );
  const { data: tablesData, isLoading: tablesLoading } = useQuery(
    ["table-availability", store],
    () => getTableAvailability({ location: store }),
    { enabled: !!store, staleTime: 0, refetchOnMount: true }
  );
  // The static availability snapshot (table.status above) is stale against
  // QR/customer orders, which the backend creates without flipping the table
  // to "occupied". An order-aware snapshot is the source of truth for which
  // tables are genuinely free for a NEW pos order — every table carrying at
  // least one active (pending/confirmed/preparing/ready/served) order is
  // treated as occupied here regardless of what the cached status says.
  const {
    data: activeOrdersData,
    isLoading: activeOrdersLoading,
    isFetching: activeOrdersFetching,
    isError: activeOrdersError
  } = useQuery(
    ["table-active-orders", store],
    () => getTablesWithActiveOrders({ location: store }),
    { enabled: !!store, staleTime: 0, refetchOnMount: true }
  );
  const tableIdsWithActiveOrders = useMemo(() => {
    const list = Array.isArray(activeOrdersData?.data) ? activeOrdersData.data : [];
    return new Set(
      list.filter((t) => Array.isArray(t.orders) && t.orders.length > 0).map((t) => t.id)
    );
  }, [activeOrdersData]);
  const allTables = useMemo(() => tablesData?.data?.tables || [], [tablesData]);
  const partySizeNum = Number(partySize) || 0;
  const occupancyLoading = tablesLoading || activeOrdersLoading || activeOrdersFetching;
  const occupancyError = !!activeOrdersError;
  // Fail closed: until occupancy is known (and unless it errored) no table is
  // offered as safely available for a new order.
  const canResolveTableSafety = !occupancyLoading && !occupancyError;
  const availableTables = useMemo(
    () =>
      allTables.filter(
        (t) =>
          t.status === "available" &&
          !tableIdsWithActiveOrders.has(t.id) &&
          (partySizeNum === 0 || Number(t.capacity) >= partySizeNum)
      ),
    [allTables, tableIdsWithActiveOrders, partySizeNum]
  );

  const isQrisPayment = paymentMethod === "e-wallet" || paymentMethod === "qris";

  useEffect(() => {
    onTableChange?.(selectedTable);
  }, [selectedTable, onTableChange]);

  useEffect(() => {
    if (partySize && !selectedTable) {
      setSelectedTable(null);
    }
  }, [partySize, selectedTable]);
  const selectedTableStillFits =
    !selectedTable ||
    !partySizeNum ||
    !selectedTable.capacity ||
    Number(selectedTable.capacity) >= partySizeNum;

  useEffect(() => {
    if (selectedTable && !selectedTableStillFits) setSelectedTable(null);
  }, [selectedTableStillFits, selectedTable]);

  const customerId = selectedCustomer?.id || selectedCustomer?._id;
  const { data: memberData } = useQuery(
    ["member-points", customerId],
    () => getMemberById({ id: customerId }),
    { enabled: !!customerId, retry: false }
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
    return list
      .filter((pm) => {
        const s = (pm.status || "").toString().toLowerCase();
        return !s || s === "active" || s === "true";
      })
      .map((pm) => {
        const kind = getPaymentIconKind(pm.type);
        const icon =
          kind === "cash"
            ? Banknote
            : kind === "ewallet"
              ? Smartphone
              : kind === "card"
                ? CreditCard
                : Wallet;
        return {
          id: pm.type || pm.id?.toString() || pm.name?.toLowerCase(),
          label: pm.name,
          icon,
          color: "from-primary to-primary/70"
        };
      });
  }, [paymentMethodsData]);

  const taxRate = Number.isFinite(propTaxRate) ? propTaxRate : 0.11;
  const taxAmount = useTax ? subtotal * taxRate : 0;
  const matchedTier = useMemo(() => {
    if (!memberPoints || memberTiers.length === 0) return null;
    const active = memberTiers.filter((t) => t.status === "active");
    const exact = active.find((t) => memberPoints >= t.minPoints && memberPoints <= t.maxPoints);
    if (exact) return exact;
    // ponytail: no exact range match; pick highest tier whose minPoints we meet
    return (
      active
        .filter((t) => t.minPoints <= memberPoints)
        .sort((a, b) => b.minPoints - a.minPoints)[0] || null
    );
  }, [memberPoints, memberTiers]);
  const tierDiscountValue =
    matchedTier?.discountPercent > 0 ? subtotal * (matchedTier.discountPercent / 100) : 0;
  const discountValue = selectedDiscount
    ? selectedDiscount.type === "percent"
      ? subtotal * (selectedDiscount.value / 100)
      : selectedDiscount.value
    : discountAmount;
  const totalDiscount = discountValue + tierDiscountValue;
  const total = Math.max(0, subtotal + taxAmount - totalDiscount);
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
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target) &&
        !customerPortalRef.current?.contains(e.target)
      ) {
        setShowCustomerDropdown(false);
      }
      if (
        discountSearchRef.current &&
        !discountSearchRef.current.contains(e.target) &&
        !discountPortalRef.current?.contains(e.target)
      ) {
        setShowDiscountDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!showCustomerDropdown && !showDiscountDropdown) return;
    const updatePos = () => {
      const custPos = computeDropdownPos(searchContainerRef.current?.getBoundingClientRect());
      if (custPos) setCustomerDropdownPos(custPos);
      const discPos = computeDropdownPos(discountSearchRef.current?.getBoundingClientRect());
      if (discPos) setDiscountDropdownPos(discPos);
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
      queryClient.invalidateQueries(["products-outlet", store]);
      queryClient.invalidateQueries(["categories-cashier", store]);
      queryClient.invalidateQueries(["products"]);
      onComplete({
        ...order,
        subtotal: order.subTotal,
        total: order.totalPrice,
        grandTotal: order.totalPrice,
        // F9-01: the backend recomputes prices/total server-side and
        // ignores whatever the client submitted — reconciling changeAmount
        // against the client's pre-submit `variables.changeAmount` (computed
        // against the client's own, possibly stale, total) could show cash
        // change that doesn't match what was actually charged. Always
        // derive it from the server-authoritative `order.totalPrice`.
        cashAmount: variables.paymentMethod === "cash" ? variables.cashAmount : order.totalPrice,
        changeAmount:
          variables.paymentMethod === "cash"
            ? Math.max(0, Number(variables.cashAmount || 0) - Number(order.totalPrice || 0))
            : 0,
        items: (order.items || []).map((item) => ({
          ...item,
          nameProduct: item.productName,
          count: item.quantity
        })),
        customer: selectedCustomer
          ? {
              name: selectedCustomer.name || selectedCustomer.Name,
              memberTier: matchedTier?.name || "",
              memberPoints: Number(
                selectedCustomer.totalPoints ||
                  selectedCustomer.TotalPoints ||
                  memberData?.data?.totalPoints ||
                  0
              )
            }
          : null
      });
    },
    onError: (err) => {
      toast.error(
        err?.response?.data?.message || err?.message || t("page.cashier.transactionError")
      );
    },
    onSettled: () => {
      isSubmittingRef.current = false;
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
      nameMember: newCustomerName.trim(),
      phoneNumber: newCustomerPhone.trim(),
      tier: selectedTier?.id || null
    });
  }, [newCustomerName, newCustomerPhone, selectedTier, addCustomerMutation]);

  const handleQrisConfirm = useCallback(() => {
    if (!pendingPayload) return;
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    mutation.mutate(pendingPayload);
  }, [pendingPayload, mutation]);

  const startQrisPayment = useCallback(
    (payload, method) => {
      setPendingPayload(payload);
      setQrisPending(true);
      dispatchDisplayEvent({
        type: DISPLAY_EVENT_TYPES.QRIS_PAYMENT_REQUEST,
        store,
        total: remainingTotal,
        tableName: selectedTable?.name || "",
        paymentMethod: method
      });
    },
    [store, remainingTotal, selectedTable]
  );

  const handleSubmit = useCallback(() => {
    // F9-23: an empty cart must never reach the payment/order creation path.
    if (items.length === 0) {
      toast.error(t("page.cashier.emptyCart", "Keranjang kosong"));
      return;
    }
    if (orderType === "dine-in") {
      if (!selectedTable) {
        toast.error(t("page.cashier.selectTable", "Pilih meja terlebih dahulu"));
        return;
      }
      if (!canResolveTableSafety) {
        toast.error(
          occupancyError
            ? t("page.cashier.tableOccupancyError", "Gagal memuat status meja")
            : t("page.cashier.tableOccupancyLoading", "Memeriksa ketersediaan meja...")
        );
        return;
      }
      // Defense in depth: the UI blocks occupied tables, but a QR order can
      // land after the table was picked — re-check at submit time so a second
      // order is never created on a table with an active customer order.
      if (tableIdsWithActiveOrders.has(selectedTable.id)) {
        toast.error(t("page.cashier.tableOccupied", "Meja sedang digunakan"));
        return;
      }
    }
    if (remainingTotal > 0 && !paymentMethod) {
      toast.error(t("page.cashier.selectPayment"));
      return;
    }
    if (remainingTotal > 0 && paymentMethod === "cash" && cashAmountNum < remainingTotal) {
      toast.error(t("page.cashier.insufficientCash"));
      return;
    }

    const method = paymentMethod || "points";
    const payload = {
      store: store,
      idempotencyKey,
      cashierId: cashierId || cookie?.user?.id || cookie?.user?.ID,
      cashierName: cashierName || cookie?.user?.userName || cookie?.user?.name,
      customerId: selectedCustomer?.id || selectedCustomer?._id || null,
      customerName: selectedCustomer?.name || selectedCustomer?.Name || null,
      discountId: selectedDiscount?.id || selectedDiscount?._id || null,
      promoCode: promoCode.trim() || undefined,
      redeemedPoints: Number(redeemPoints) || 0,
      useTax,
      paymentMethod: method,
      source: "pos",
      tableId: orderType === "dine-in" ? selectedTable?.id || null : null,
      totalCovers: orderType === "dine-in" ? partySizeNum : 0,
      // F-SMOKE-01: the backend's cash-tender validation (validateCashTender)
      // rejects any non-cash order that carries cashAmount/changeAmount at
      // all, even a "harmless" placeholder like the total/0 sent here
      // before — so these keys must be entirely absent for non-cash
      // methods, not merely zeroed.
      ...(method === "cash" ? { cashAmount: cashAmountNum, changeAmount: change } : {}),
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

    if (method === "e-wallet" || method === "qris") {
      startQrisPayment(payload, method);
      return;
    }

    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    mutation.mutate(payload);
  }, [
    paymentMethod,
    cashAmountNum,
    total,
    remainingTotal,
    items,
    cashierId,
    cashierName,
    store,
    idempotencyKey,
    selectedCustomer,
    selectedDiscount,
    promoCode,
    redeemPoints,
    change,
    orderType,
    selectedTable,
    canResolveTableSafety,
    occupancyError,
    tableIdsWithActiveOrders,
    mutation,
    cookie,
    t,
    startQrisPayment
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

  const canSubmit =
    items.length > 0 &&
    (remainingTotal === 0 ||
      (paymentMethod && (paymentMethod !== "cash" || cashAmountNum >= remainingTotal)));

  return (
    // F9-04: migrated onto the project's accessible Dialog primitive —
    // the manual window-keydown Escape handler (removed) is superseded by
    // Radix's own per-dialog Escape handling, which already closes only
    // the topmost of two stacked dialogs (this modal + the nested
    // add-customer dialog below), matching the prior "closes whichever
    // layer is on top" behavior without extra code.
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="max-w-2xl max-h-[90vh] flex flex-col overflow-hidden p-0"
        withX={false}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 shrink-0">
          <div className="flex items-center gap-2">
            <Receipt size={20} className="text-primary" />
            <DialogTitle className="text-lg font-bold">{t("page.cashier.payment")}</DialogTitle>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-accent transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <div className="bg-muted/40 rounded-xl p-4 border border-border/40 space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{t("page.cashier.subtotal")}</span>
              <span className="font-medium">Rp {formatPrice(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-2">
                Gunakan Pajak
                <button
                  type="button"
                  onClick={() => setUseTax(!useTax)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${useTax ? "bg-primary" : "bg-muted"}`}
                  aria-label="Gunakan Pajak">
                  <span
                    className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${useTax ? "translate-x-5" : "translate-x-1"}`}
                  />
                </button>
                <span className="text-xs font-medium">{useTax ? "ON" : "OFF"}</span>
              </span>
              <span className="font-medium text-xs text-muted-foreground">
                {useTax ? "Pajak aktif" : "Pajak nonaktif"}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {t("page.cashier.tax")} ({Math.round(taxRate * 100)}%)
              </span>
              <span className="font-medium">Rp {formatPrice(taxAmount)}</span>
            </div>
            {totalDiscount > 0 && (
              <>
                {tierDiscountValue > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-emerald-500 flex items-center gap-1">
                      <Percent size={12} />
                      {matchedTier.name} ({matchedTier.discountPercent}%)
                    </span>
                    <span className="font-medium text-emerald-500">
                      -Rp {formatPrice(tierDiscountValue)}
                    </span>
                  </div>
                )}
                {discountValue > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-emerald-500 flex items-center gap-1">
                      <Percent size={12} />
                      {selectedDiscount?.nameDiscount ||
                        selectedDiscount?.name ||
                        t("page.cashier.discount")}
                      {selectedDiscount &&
                        selectedDiscount.type === "percent" &&
                        ` (${selectedDiscount.value}%)`}
                    </span>
                    <span className="font-medium text-emerald-500">
                      -Rp {formatPrice(discountValue)}
                    </span>
                  </div>
                )}
              </>
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
              {t("page.cashier.modal.orderType")}
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setOrderType("dine-in");
                  setSelectedTable(null);
                }}
                className={`flex-1 p-3 rounded-xl border text-sm font-medium transition-all ${
                  orderType === "dine-in"
                    ? "border-primary bg-primary/10 shadow-sm"
                    : "border-border/50 bg-card/50 hover:border-border"
                }`}>
                {t("page.cashier.modal.dineIn")}
              </button>
              <button
                onClick={() => {
                  setOrderType("take-away");
                  setSelectedTable(null);
                }}
                className={`flex-1 p-3 rounded-xl border text-sm font-medium transition-all ${
                  orderType === "take-away"
                    ? "border-primary bg-primary/10 shadow-sm"
                    : "border-border/50 bg-card/50 hover:border-border"
                }`}>
                {t("page.cashier.modal.takeAway")}
              </button>
            </div>
            {orderType === "dine-in" && (
              <div className="mt-2 space-y-2">
                <div className="flex items-start gap-2">
                  <div className="w-[38%] shrink-0">
                    <label className="block text-xs font-medium text-muted-foreground mb-1">
                      {t("page.cashier.guests", "Jumlah orang")}
                    </label>
                    <div className="flex items-center gap-1.5 rounded-lg border border-border/60 bg-background px-2.5 focus-within:border-primary">
                      <Users size={14} className="text-muted-foreground shrink-0" />
                      <input
                        type="number"
                        min="1"
                        value={partySize}
                        onChange={(e) => setPartySize(e.target.value)}
                        placeholder="0"
                        className="w-full py-2 text-sm outline-none bg-transparent"
                      />
                    </div>
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-muted-foreground mb-1">
                      {t("page.cashier.modal.table", "Pilih Meja")}
                    </label>
                    <Combobox
                      options={[
                        { value: "", label: t("page.cashier.selectTable", "Pilih Meja") },
                        ...allTables.map((tbl) => {
                          const hasActiveOrder = tableIdsWithActiveOrders.has(tbl.id);
                          const isAvailable = tbl.status === "available" && !hasActiveOrder;
                          const statusKey = hasActiveOrder ? "occupied" : tbl.status || "available";
                          const statusLabel = t(`page.table.status.${statusKey}`, statusKey);
                          return {
                            value: String(tbl.id),
                            label: `${tbl.name} (${t("page.cashier.capacity", "Kapasitas")}: ${tbl.capacity}) — ${statusLabel}`,
                            disabled: !isAvailable || !canResolveTableSafety
                          };
                        })
                      ]}
                      value={String(selectedTable?.id || "")}
                      loading={!canResolveTableSafety}
                      onChange={(v) => {
                        const tbl = allTables.find(
                          (tb) =>
                            String(tb.id) === v &&
                            tb.status === "available" &&
                            !tableIdsWithActiveOrders.has(tb.id)
                        );
                        setSelectedTable(tbl || null);
                      }}
                      placeholder={t("page.cashier.selectTable", "Pilih Meja")}
                      searchPlaceholder="Cari meja..."
                    />
                    {occupancyError && (
                      <p className="mt-1 text-xs text-destructive flex items-center gap-1">
                        <AlertCircle size={12} />
                        {t(
                          "page.cashier.tableOccupancyError",
                          "Gagal memuat status meja, mohon coba lagi"
                        )}
                      </p>
                    )}
                  </div>
                </div>
                {partySizeNum > 0 && canResolveTableSafety && availableTables.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    {t(
                      "page.cashier.guestsNoTable",
                      "Tidak ada meja kosong untuk jumlah orang tersebut"
                    )}
                  </p>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-muted-foreground">
              {t("page.cashier.paymentMethod")}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {paymentMethods.length === 0 ? (
                <p className="col-span-full text-sm text-muted-foreground text-center py-3">
                  {t("page.cashier.noPaymentMethods", "Tidak ada metode pembayaran aktif")}
                </p>
              ) : (
                paymentMethods.map((method) => {
                  const Icon = method.icon;
                  const isSelected = paymentMethod === method.id;
                  return (
                    <button
                      key={method.id}
                      onClick={() => {
                        setPaymentMethod(method.id);
                        setQrisPending(false);
                      }}
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
                })
              )}
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
                  <span className="text-emerald-500 font-medium">{t("page.cashier.change")}</span>
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
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <input
                  type="text"
                  value={customerSearch}
                  onChange={(e) => {
                    const val = e.target.value;
                    setCustomerSearch(val);
                    setShowCustomerDropdown(true);
                    updateDropdownPos();
                    // Editing the text after a customer was picked must drop
                    // that selection — otherwise the field can show one name
                    // while a *different*, stale customer is still the one
                    // actually attached to the order (points/tier included).
                    if (
                      selectedCustomer &&
                      val !== (selectedCustomer.name || selectedCustomer.Name)
                    ) {
                      setSelectedCustomer(null);
                    }
                  }}
                  onFocus={() => {
                    setShowCustomerDropdown(true);
                    updateDropdownPos();
                  }}
                  placeholder={t("page.cashier.searchCustomer")}
                  className="w-full h-10 pl-9 pr-9 text-sm rounded-xl bg-accent/50 border border-border/60 outline-none focus:border-primary/50 transition-colors"
                />
                {selectedCustomer && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCustomer(null);
                      setCustomerSearch("");
                    }}
                    aria-label={t("common.clear", "Clear")}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground hover:text-foreground">
                    <X size={14} />
                  </button>
                )}
              </div>
              <button
                onClick={() => setAddCustomerOpen(true)}
                className="shrink-0 w-10 h-10 rounded-xl bg-primary/10 border border-border/60 flex items-center justify-center text-primary hover:bg-primary/20 transition-all"
                title={t("page.cashier.addCustomer")}>
                <Plus size={18} />
              </button>
            </div>
            {showCustomerDropdown &&
              createPortal(
                <div
                  ref={customerPortalRef}
                  style={{ position: "fixed", ...customerDropdownPos, zIndex: 70 }}
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

          {selectedCustomer && matchedTier && (
            <div className="flex items-center gap-2 px-1 -mt-1">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: matchedTier.color || "#f59e0b" }}
              />
              <span className="text-xs font-semibold">{matchedTier.name}</span>
              {matchedTier.discountPercent > 0 && (
                <span className="text-xs text-emerald-500 font-medium">
                  {matchedTier.discountPercent}% {t("page.cashier.discount")}
                </span>
              )}
              {memberPoints > 0 && (
                <span className="text-xs text-muted-foreground ml-auto">
                  {memberPoints.toLocaleString("id-ID")} pts
                </span>
              )}
            </div>
          )}

          <div ref={discountSearchRef} className="relative">
            <label className="block text-sm font-medium mb-1.5 text-muted-foreground">
              {t("page.cashier.discount")}
            </label>
            <div className="relative">
              <Ticket
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <input
                type="text"
                value={discountSearch}
                onChange={(e) => {
                  const val = e.target.value;
                  setDiscountSearch(val);
                  setShowDiscountDropdown(true);
                  updateDropdownPos();
                  // Same stale-selection risk as the customer field: don't
                  // let an edited search term keep a no-longer-matching
                  // discount silently applied to the total.
                  if (
                    selectedDiscount &&
                    val !==
                      (selectedDiscount.nameDiscount ||
                        selectedDiscount.name ||
                        selectedDiscount.discountName)
                  ) {
                    setSelectedDiscount(null);
                  }
                }}
                onFocus={() => {
                  setShowDiscountDropdown(true);
                  updateDropdownPos();
                }}
                placeholder={t("page.cashier.searchDiscount")}
                className="w-full h-10 pl-9 pr-9 text-sm rounded-xl bg-accent/50 border border-border/60 outline-none focus:border-primary/50 transition-colors"
              />
              {selectedDiscount && (
                <button
                  type="button"
                  onClick={clearDiscount}
                  aria-label={t("common.clear", "Clear")}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground hover:text-foreground">
                  <X size={14} />
                </button>
              )}
            </div>
            {showDiscountDropdown &&
              createPortal(
                <div
                  ref={discountPortalRef}
                  style={{ position: "fixed", ...discountDropdownPos, zIndex: 70 }}
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
                className="flex-1 h-10 px-4 text-sm rounded-xl bg-accent/50 border border-border/60 outline-none focus:border-primary/50 transition-colors"
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
                  className="shrink-0 h-12 px-4 rounded-xl bg-violet-500/10 border border-violet-500/30 text-sm font-semibold text-violet-600 hover:bg-violet-500/20 transition-all">
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
        </div>

        {/* F9-04: a second, independent Dialog for the add-customer
            sub-flow — Radix supports these stacked, and closes only the
            topmost one on Escape, matching the prior "closes whichever
            layer is on top" behavior of the manual handler this replaced. */}
        {addCustomerOpen && (
          <Dialog open onOpenChange={(open) => !open && setAddCustomerOpen(false)}>
            <DialogContent className="max-w-md p-0 overflow-hidden" withX={false}>
              <div className="flex items-center justify-between px-5 py-4 border-b border-border/50">
                <div className="flex items-center gap-2">
                  <UserPlus size={18} className="text-primary" />
                  <DialogTitle className="font-semibold">
                    {t("page.cashier.addCustomerTitle")}
                  </DialogTitle>
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
                            {isSelected &&
                              (Array.isArray(tier.benefits)
                                ? tier.benefits
                                : (tier.benefits || "").split("\n").filter(Boolean)
                              ).length > 0 && (
                                <div className="mt-2 pt-2 border-t border-border/40 space-y-1">
                                  {(Array.isArray(tier.benefits)
                                    ? tier.benefits
                                    : (tier.benefits || "").split("\n").filter(Boolean)
                                  ).map((b, i) => (
                                    <div key={i} className="flex items-start gap-1.5">
                                      <Check
                                        size={10}
                                        className="text-emerald-500 mt-0.5 shrink-0"
                                      />
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
                  variant="danger"
                  onClick={() => setAddCustomerOpen(false)}
                  className="flex-1">
                  {t("page.cashier.addCustomerCancel")}
                </Button>
                <Button
                  variant="success"
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
            </DialogContent>
          </Dialog>
        )}

        <div className="border-t border-border/50 p-4 shrink-0 space-y-2">
          {qrisPending && isQrisPayment ? (
            <>
              <div className="flex items-start gap-2 rounded-xl bg-primary/10 border border-primary/20 px-3 py-2.5 text-sm">
                <Smartphone size={16} className="text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-primary">
                    {t("page.cashier.qris.onBoard", "QRIS ditampilkan di layar pelanggan")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t(
                      "page.cashier.qris.waiting",
                      "Tunggu pembayaran pelanggan, lalu konfirmasi di bawah."
                    )}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="danger"
                  onClick={() => setQrisPending(false)}
                  className="flex-1 h-12 rounded-xl">
                  {t("page.cashier.cancel", "Batal")}
                </Button>
                <Button
                  variant="success"
                  onClick={handleQrisConfirm}
                  disabled={mutation.isLoading}
                  className="flex-[2] h-12 rounded-xl font-semibold text-sm">
                  {mutation.isLoading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Check size={16} />
                  )}
                  {mutation.isLoading
                    ? t("page.cashier.processing")
                    : t("page.cashier.qris.confirmReceived", "Konfirmasi Pembayaran Diterima")}
                </Button>
              </div>
            </>
          ) : (
            <Button
              variant="success"
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
                {mutation.isLoading
                  ? t("page.cashier.processing")
                  : t("page.cashier.confirmPayment")}
              </span>
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

CheckoutModal.propTypes = {
  items: PropTypes.array,
  subtotal: PropTypes.number,
  store: PropTypes.any,
  cashierName: PropTypes.string,
  cashierId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  taxRate: PropTypes.number,
  onClose: PropTypes.func,
  onTableChange: PropTypes.func,
  onComplete: PropTypes.func
};

export default CheckoutModal;
