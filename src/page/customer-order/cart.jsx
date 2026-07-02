import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ShoppingCart,
  Minus,
  Plus,
  Trash2,
  User,
  ArrowLeft,
  QrCode,
  Receipt,
  Menu,
  ShoppingBag,
  FileText,
  Loader2,
  Ticket,
  Star,
  UtensilsCrossed
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { axiosInstance } from "@/services";
import { loadCart, updateQty, removeItem, clearCart } from "./cartStore";

const Cart = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const storeId = searchParams.get("store");
  const tableId = searchParams.get("tåßable");

  const [cart, setCart] = useState(loadCart);
  const [customerName, setCustomerName] = useState("");
  const [instructions, setInstructions] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cashier");
  const [submitting, setSubmitting] = useState(false);
  const [member, setMember] = useState(null);
  const [memberLoading, setMemberLoading] = useState(false);

  // Member lookup debounce
  useEffect(() => {
    if (!customerName.trim() || !storeId) {
      setMember(null);
      return;
    }
    setMemberLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await axiosInstance.get(
          `/order/customer-member?name=${encodeURIComponent(customerName.trim())}&store=${storeId}`
        );
        setMember(res.data?.data || null);
      } catch {
        setMember(null);
      } finally {
        setMemberLoading(false);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [customerName, storeId]);

  // Refresh cart on mount & storage
  useEffect(() => {
    const refresh = () => setCart(loadCart());
    refresh();
    window.addEventListener("storage", refresh);
    return () => window.removeEventListener("storage", refresh);
  }, []);

  const handleQty = useCallback((pid, vl, delta) => {
    setCart(updateQty(pid, vl, delta));
  }, []);

  const handleRemove = useCallback((pid, vl) => {
    setCart(removeItem(pid, vl));
  }, []);

  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const totalItems = cart.reduce((s, i) => s + i.quantity, 0);

  const discountPercent = member?.tier?.discountPercent || 0;
  const discountAmount = Math.round(subtotal * (discountPercent / 100));
  const taxRate = 0.1; // ponytail: hardcoded 10%, load from BE config if needed
  const taxAmount = Math.round((subtotal - discountAmount) * taxRate);
  const total = subtotal - discountAmount + taxAmount;

  const placeOrder = async () => {
    if (!storeId || cart.length === 0) return;
    setSubmitting(true);
    try {
      const res = await axiosInstance.post("/order/customer-create", {
        store: Number(storeId),
        tableId: tableId ? Number(tableId) : null,
        customerName: customerName || null,
        customerId: member?.id || null,
        notes: instructions || null,
        items: cart.map((item) => ({
          productId: item.productId,
          productName: item.productName,
          price: item.price,
          quantity: item.quantity,
          notes: item.notes || null,
          options: item.options || [],
          modifiers: item.modifiers || []
        }))
      });
      const order = res.data?.data;
      const orderId = order?.id;
      clearCart();
      setCart([]);
      navigate(`/customer-order/tracking/${orderId}?store=${storeId}&table=${tableId || ""}`);
    } catch (e) {
      toast.error(e?.response?.data?.message || e.message || t("page.customerOrder.fail"));
    } finally {
      setSubmitting(false);
    }
  };

  if (!storeId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <p className="text-on-surface-variant">{t("page.customerOrder.invalidQr")}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-on-background font-sans antialiased pb-32">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-surface border-b border-outline-variant flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/customer-order?store=${storeId}&table=${tableId || ""}`)}
            className="p-1 active:scale-95 transition-transform">
            <ArrowLeft size={22} className="text-primary" />
          </button>
          <UtensilsCrossed size={18} className="text-primary" />
          <h1 className="font-bold text-sm text-on-surface">{t("page.customerOrder.cartTitle")}</h1>
        </div>
      </header>

      <main className="pt-20 px-4 max-w-lg mx-auto">
        <h2 className="text-xl font-bold text-on-surface mb-1">
          {t("page.customerOrder.cartTitle")}
        </h2>
        <p className="text-sm text-on-surface-variant mb-4">
          {t("page.customerOrder.reviewOrder")}
        </p>

        {/* Customer name + member badge */}
        <div className="mb-4">
          <label className="block font-bold text-sm text-on-surface mb-1.5 flex items-center gap-1.5">
            <User size={16} />
            {t("page.customerOrder.yourName")}
          </label>
          <Input
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder={t("page.customerOrder.namePlaceholder")}
            className="w-full bg-surface-container-lowest border-outline-variant rounded-xl text-sm focus-visible:ring-primary"
          />
          {memberLoading && (
            <div className="flex items-center gap-1.5 mt-1.5 text-xs text-on-surface-variant">
              <Loader2 size={12} className="animate-spin" /> Checking...
            </div>
          )}
          {member && !memberLoading && (
            <div className="mt-2 flex items-center gap-2 bg-primary-container/20 text-primary px-3 py-1.5 rounded-lg text-xs font-semibold">
              <Star size={14} fill="currentColor" />
              <span>
                {member.name} — {member.tier?.name || "Member"} (Diskon{" "}
                {member.tier?.discountPercent || 0}%)
              </span>
            </div>
          )}
        </div>

        {/* Cart items */}
        <div className="space-y-3 mb-4">
          {cart.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-on-surface-variant text-sm">{t("page.customerOrder.emptyCart")}</p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.productId + (item.variantLabel || "") + item.productName}
                className="bg-surface-container-lowest border border-outline-variant rounded-xl p-3 flex gap-3 items-center">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.productName}
                    className="w-20 h-20 rounded-lg object-cover bg-surface-container flex-shrink-0"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-lg bg-surface-container flex items-center justify-center text-primary font-bold text-lg flex-shrink-0">
                    {item.productName.charAt(0)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-sm text-on-surface truncate">
                        {item.productName}
                      </h3>
                      <p className="text-xs text-on-surface-variant mt-0.5">
                        Rp{item.price.toLocaleString("id-ID")}
                      </p>
                    </div>
                    <span className="font-bold text-sm text-primary">
                      Rp{(item.price * item.quantity).toLocaleString("id-ID")}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center bg-surface-container-low rounded-full border border-outline-variant">
                      <button
                        onClick={() => handleQty(item.productId, item.variantLabel, -1)}
                        className="w-8 h-8 flex items-center justify-center text-primary active:scale-90 transition-transform">
                        <Minus size={14} />
                      </button>
                      <span className="px-3 font-bold text-sm text-on-surface">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleQty(item.productId, item.variantLabel, 1)}
                        className="w-8 h-8 flex items-center justify-center text-primary active:scale-90 transition-transform">
                        <Plus size={14} />
                      </button>
                    </div>
                    <button
                      onClick={() => handleRemove(item.productId, item.variantLabel)}
                      className="text-error p-1.5 hover:bg-error-container rounded-full transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Special instructions */}
        <div className="mb-4">
          <label className="block font-bold text-sm text-on-surface mb-1.5 flex items-center gap-1.5">
            <FileText size={16} />
            {t("page.customerOrder.specialInstructions")}
          </label>
          <textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="Allergies, preferences, or delivery notes..."
            className="w-full p-3 bg-surface-container-lowest border border-outline-variant rounded-xl text-sm focus:ring-primary focus:border-primary h-20 placeholder:text-outline-variant resize-none outline-none"
          />
        </div>

        {/* Payment method */}
        <div className="mb-4">
          <h3 className="font-bold text-sm text-on-surface mb-2 flex items-center gap-1.5">
            <Ticket size={16} />
            Payment Method
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setPaymentMethod("qris")}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${
                paymentMethod === "qris"
                  ? "border-primary bg-primary-container/10"
                  : "border-outline-variant bg-surface-container-lowest"
              }`}>
              <QrCode
                size={22}
                className={paymentMethod === "qris" ? "text-primary" : "text-on-surface-variant"}
              />
              <span
                className={`text-xs font-semibold mt-1 ${paymentMethod === "qris" ? "text-primary" : "text-on-surface-variant"}`}>
                Pay Now (QRIS)
              </span>
            </button>
            <button
              onClick={() => setPaymentMethod("cashier")}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${
                paymentMethod === "cashier"
                  ? "border-primary bg-primary-container/10"
                  : "border-outline-variant bg-surface-container-lowest"
              }`}>
              <Receipt
                size={22}
                className={paymentMethod === "cashier" ? "text-primary" : "text-on-surface-variant"}
              />
              <span
                className={`text-xs font-semibold mt-1 ${paymentMethod === "cashier" ? "text-primary" : "text-on-surface-variant"}`}>
                Pay at Cashier
              </span>
            </button>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-surface-container p-4 rounded-xl space-y-2 mb-4">
          <div className="flex justify-between text-sm text-on-surface-variant">
            <span>{t("page.customerOrder.subtotal")}</span>
            <span className="font-semibold">Rp{subtotal.toLocaleString("id-ID")}</span>
          </div>
          {discountPercent > 0 && (
            <div className="flex justify-between text-sm text-primary font-semibold">
              <span>Diskon Member ({discountPercent}%)</span>
              <span>-Rp{discountAmount.toLocaleString("id-ID")}</span>
            </div>
          )}
          <div className="flex justify-between text-sm text-on-surface-variant">
            <span>Tax (10%)</span>
            <span className="font-semibold">Rp{taxAmount.toLocaleString("id-ID")}</span>
          </div>
          <div className="pt-2 border-t border-outline-variant flex justify-between text-on-surface">
            <span className="font-bold text-base">{t("page.customerOrder.total")}</span>
            <span className="font-bold text-lg text-primary">
              Rp{total.toLocaleString("id-ID")}
            </span>
          </div>
        </div>
      </main>

      {/* Bottom bar */}
      <div className="fixed bottom-0 w-full z-50 bg-surface shadow-[0_-4px_12px_0_rgba(0,0,0,0.08)]">
        <div className="px-4 pt-2 pb-1">
          <Button
            onClick={placeOrder}
            disabled={submitting || cart.length === 0}
            className="w-full bg-primary-container text-on-primary-container h-12 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all hover:brightness-110">
            <ShoppingCart size={18} />
            {submitting ? (
              <>
                <Loader2 size={16} className="animate-spin" /> {t("page.customerOrder.submitting")}
              </>
            ) : (
              <>
                {t("page.customerOrder.placeOrder")} • Rp{total.toLocaleString("id-ID")}
              </>
            )}
          </Button>
        </div>
        {/* Bottom nav */}
        <nav className="flex justify-around items-center h-14 px-4">
          <button
            onClick={() => navigate(`/customer-order?store=${storeId}&table=${tableId || ""}`)}
            className="flex flex-col items-center gap-0.5 text-on-surface-variant hover:text-primary transition-colors">
            <Menu size={20} />
            <span className="text-[10px] font-semibold">{t("page.customerOrder.menu")}</span>
          </button>
          <button className="flex flex-col items-center gap-0.5 text-primary font-bold transition-colors">
            <ShoppingBag size={20} />
            <span className="text-[10px] font-semibold">{t("page.customerOrder.cart")}</span>
          </button>
          <button
            onClick={() => navigate(`/customer-order?store=${storeId}&table=${tableId || ""}`)}
            className="flex flex-col items-center gap-0.5 text-on-surface-variant hover:text-primary transition-colors">
            <FileText size={20} />
            <span className="text-[10px] font-semibold">{t("page.customerOrder.orders")}</span>
          </button>
        </nav>
      </div>
    </div>
  );
};

export default Cart;
