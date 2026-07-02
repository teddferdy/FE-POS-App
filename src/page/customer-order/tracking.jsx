import React, { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import {
  CheckCircle,
  Info,
  Menu,
  ShoppingCart,
  FileText,
  HelpCircle,
  RefreshCw,
  UtensilsCrossed,
  Clock,
  ChefHat
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { axiosInstance } from "@/services";

const STEPS = [
  { key: "pending", label: "Order Received" },
  { key: "preparing", label: "Preparing" },
  { key: "ready", label: "Ready to Serve" }
];

const Tracking = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const storeId = searchParams.get("store");
  const tableId = searchParams.get("table");

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchOrder = () => {
    if (!id) return;
    axiosInstance
      .get(`/order/customer-order/${id}`)
      .then((res) => setOrder(res.data?.data || null))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  // Poll every 10s for status updates
  useEffect(() => {
    if (!order) return;
    const interval = setInterval(fetchOrder, 10000);
    return () => clearInterval(interval);
  }, [id, order?.status]);

  const statusOrder = ["pending", "preparing", "ready", "served", "completed"];
  const currentIdx = statusOrder.indexOf(order?.status || "pending");

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-on-background font-sans antialiased flex flex-col pb-32">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-surface border-b border-outline-variant flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-2">
          <UtensilsCrossed size={18} className="text-primary" />
          <h1 className="font-bold text-sm text-on-surface">
            Order #{order?.orderNumber} {tableId && `• Table ${tableId}`}
          </h1>
        </div>
        <button className="p-1 active:scale-95 transition-transform">
          <Info size={20} className="text-outline" />
        </button>
      </header>

      <main className="flex-grow pt-20 pb-4 px-4 max-w-lg mx-auto w-full">
        {/* Success header */}
        <section className="text-center mb-5">
          <div className="w-16 h-16 bg-primary-container rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg relative">
            <div className="absolute inset-0 bg-primary-container rounded-full animate-ping opacity-30" />
            <CheckCircle size={32} className="text-on-primary-container relative z-10" />
          </div>
          <h2 className="text-xl font-bold text-primary mb-1">
            {t("page.customerOrder.successModalTitle")}
          </h2>
          <p className="text-sm text-on-surface-variant">Order #{order?.orderNumber}</p>
          <div className="mt-2 flex items-center justify-center gap-2">
            <span className="text-[10px] font-bold uppercase bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full">
              Pay at Counter
            </span>
          </div>
        </section>

        {/* Estimated Time + Kitchen card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
          <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant flex flex-col items-center text-center">
            <span className="text-[10px] font-bold uppercase text-secondary tracking-wider mb-1">
              Estimated Wait
            </span>
            <div className="flex items-center gap-1.5 text-xl font-bold text-primary">
              <Clock size={20} />
              15-20 min
            </div>
            <span className="text-xs text-on-surface-variant mt-1">Freshly prepared for you</span>
          </div>
          <div className="relative rounded-xl overflow-hidden min-h-[130px] border border-outline-variant bg-surface-container-high flex items-center justify-center">
            <ChefHat size={40} className="text-primary-container/50" />
            <div className="absolute bottom-2 left-3 text-white">
              <p className="font-bold text-sm drop-shadow-md">Preparing Now</p>
              <p className="text-xs opacity-80 drop-shadow-md">Our chefs at work</p>
            </div>
          </div>
        </div>

        {/* Progress Tracker */}
        <section className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant mb-5">
          <h3 className="font-bold text-sm mb-4">{t("page.customerOrder.orderProgress")}</h3>
          <div className="relative space-y-5">
            {STEPS.map((step, idx) => {
              const completed = idx < currentIdx;
              const active = idx === currentIdx;
              const isLast = idx === STEPS.length - 1;
              return (
                <div key={step.key} className="flex items-start gap-3 relative">
                  {!isLast && (
                    <div
                      className={`absolute left-4 top-8 bottom-[-20px] w-0.5 ${completed ? "bg-primary" : "bg-outline-variant"}`}
                    />
                  )}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 ${
                      completed
                        ? "bg-primary"
                        : active
                          ? "bg-primary-container border-2 border-primary"
                          : "bg-surface-container-high"
                    }`}>
                    {completed ? (
                      <CheckCircle size={18} className="text-on-primary" />
                    ) : active ? (
                      <RefreshCw
                        size={16}
                        className="text-primary animate-spin"
                        style={{ animationDuration: "3s" }}
                      />
                    ) : (
                      <UtensilsCrossed size={16} className="text-outline" />
                    )}
                  </div>
                  <div className="pt-0.5">
                    <p
                      className={`font-bold text-sm ${completed ? "text-on-surface" : active ? "text-primary" : "text-outline"}`}>
                      {step.label}
                    </p>
                    <p className="text-xs text-on-surface-variant">
                      {completed ? "Done" : active ? "In progress" : "Pending"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Help button */}
        <div className="flex justify-center mb-5">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-surface-container-high rounded-full text-on-surface-variant font-semibold text-sm transition-all active:scale-95 border border-outline-variant">
            <HelpCircle size={16} />
            Need Help or Feedback?
          </button>
        </div>

        {/* Order summary mini */}
        {order && (
          <div className="bg-surface-container p-3 rounded-xl border border-outline-variant flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-primary font-bold text-sm">
                {order.totalQuantity || 0}
              </div>
              <div>
                <p className="font-bold text-sm">{order.totalQuantity || 0} Items Ordered</p>
                <p className="text-xs text-on-surface-variant">{order.orderNumber}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-sm text-primary">
                Rp{Number(order.totalPrice || 0).toLocaleString("id-ID")}
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Order More button */}
      <div className="fixed bottom-16 left-0 right-0 p-4 z-50 pointer-events-none">
        <div className="max-w-lg mx-auto w-full pointer-events-auto">
          <Button
            onClick={() => navigate(`/customer-order?store=${storeId}&table=${tableId || ""}`)}
            className="w-full bg-primary text-on-primary h-12 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all">
            <ShoppingCart size={18} />
            {t("page.customerOrder.orderMore")}
          </Button>
        </div>
      </div>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 w-full z-50 bg-surface shadow-[0_-4px_12px_0_rgba(0,0,0,0.08)] flex justify-around items-center h-14 px-4">
        <button
          onClick={() => navigate(`/customer-order?store=${storeId}&table=${tableId || ""}`)}
          className="flex flex-col items-center gap-0.5 text-on-surface-variant hover:text-primary transition-colors">
          <Menu size={20} />
          <span className="text-[10px] font-semibold">Menu</span>
        </button>
        <button
          onClick={() => navigate(`/customer-order/cart?store=${storeId}&table=${tableId || ""}`)}
          className="flex flex-col items-center gap-0.5 text-on-surface-variant hover:text-primary transition-colors">
          <ShoppingCart size={20} />
          <span className="text-[10px] font-semibold">Cart</span>
        </button>
        <button className="flex flex-col items-center gap-0.5 text-primary font-bold transition-colors">
          <FileText size={20} />
          <span className="text-[10px] font-semibold">Orders</span>
        </button>
      </nav>
    </div>
  );
};

export default Tracking;
