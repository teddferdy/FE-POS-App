/* eslint-disable react/prop-types */
import React, { useState, useEffect, useMemo } from "react";
import { useQuery } from "react-query";
import { useCookies } from "react-cookie";
import { ShoppingCart, X, Package, Menu, Sun, Moon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { getProductByOutlet } from "@/services/product";
import { orderList } from "@/state/order-list";
import { Button } from "@/components/ui/button";
import ProductGrid from "./components/ProductGrid";
import CartPanel from "./components/CartPanel";
import CheckoutModal from "./components/CheckoutModal";
import ReceiptModal from "./components/ReceiptModal";
import Sidebar from "@/components/layout/Sidebar";
import { UserDropdown, NotificationBell, StoreSelector } from "@/components/layout/Header";
import { translationSelect } from "@/state/translation";
import { useThemeStore } from "@/state/theme";

const CashierPage = () => {
  const { t } = useTranslation();
  const [cookie, setCookie] = useCookies();
  const store = cookie?.store || cookie?.activeStore || cookie?.user?.store;
  const user = useMemo(() => {
    const fromSession = () => {
      try {
        const stored = sessionStorage.getItem("user");
        return stored ? JSON.parse(stored) : null;
      } catch {
        return null;
      }
    };
    const session = fromSession();
    if (
      session &&
      session.accessMenu &&
      Array.isArray(session.accessMenu) &&
      session.accessMenu.length > 0
    ) {
      return session;
    }
    return cookie?.user;
  }, [cookie?.user]);
  const userName = user?.userName || user?.name || cookie?.name || t("page.cashier.cashierName");
  const storeName =
    cookie?.store_name || cookie?.activeStoreName || user?.storeName || t("page.cashier.storeName");
  const { translation, updateTranslation } = translationSelect();
  const { theme, toggleTheme: toggleThemeStore } = useThemeStore();

  // Apply theme on mount and whenever theme changes
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  const toggleTheme = () => toggleThemeStore();
  const languages = [
    { code: "id", label: "ID" },
    { code: "en", label: "EN" }
  ];

  const [search, setSearch] = useState("");
  const [barcode, setBarcode] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [showCartMobile, setShowCartMobile] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [receiptData, setReceiptData] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const handleToggleSidebar = () => setSidebarCollapsed((prev) => !prev);
  const handleMobileMenuToggle = () => setMobileSidebarOpen((prev) => !prev);

  const cart = orderList();

  const { data: productsData, isLoading } = useQuery(
    ["products-outlet", store],
    () => getProductByOutlet({ location: store }),
    { enabled: !!store }
  );

  const products = productsData?.data || productsData || [];

  const filteredProducts = products.filter((p) => {
    const name = (p.nameProduct || p.name || "").toLowerCase();
    const sku = (p.sku || "").toLowerCase();
    const q = search.toLowerCase();
    const matchesSearch = !search || name.includes(q) || sku.includes(q);
    const cat = p.category?.id || p.category?._id || p.categoryId?.id || p.categoryId?._id || "";
    const matchesCategory = !categoryId || cat === categoryId;
    return matchesSearch && matchesCategory;
  });

  const totalItems = cart.order.reduce((sum, item) => sum + (item.count || 0), 0);
  const subtotal = cart.order.reduce((sum, item) => sum + (Number(item.totalPrice) || 0), 0);

  const handleCheckoutComplete = (result) => {
    setReceiptData(result);
    setCheckoutOpen(false);
  };

  const handleNewTransaction = () => {
    cart.resetOrder();
    setReceiptData(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar collapsed={sidebarCollapsed} onToggle={handleToggleSidebar} />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="fixed left-0 top-0 h-screen w-64 animate-in slide-in-from-left">
            <Sidebar collapsed={false} onToggle={() => setMobileSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div
        className={`h-screen flex flex-col transition-all duration-300 ${sidebarCollapsed ? "lg:ml-16" : "lg:ml-64"}`}>
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border shrink-0">
          <div className="flex items-center justify-between px-4 lg:px-6 py-3 gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={handleMobileMenuToggle}
                className="lg:hidden p-2 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
                <Menu size={20} />
              </button>
              <Package className="text-primary shrink-0" size={24} />
              <div>
                <h1 className="text-lg font-bold leading-tight">{storeName}</h1>
                <p className="text-xs text-muted-foreground">{userName}</p>
              </div>
              <StoreSelector cookie={cookie} setCookie={setCookie} />
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="flex items-center bg-muted/50 rounded-full p-0.5 border border-border">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => updateTranslation(lang.code)}
                    className={`px-1.5 sm:px-2 py-0.5 sm:py-1 text-[9px] sm:text-[10px] font-bold tracking-widest rounded-full transition-all duration-200 ${
                      translation === lang.code
                        ? "bg-foreground text-background shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}>
                    {lang.label}
                  </button>
                ))}
              </div>
              <button
                onClick={toggleTheme}
                className="p-1.5 sm:p-2 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
                <Sun size={16} className="hidden dark:block sm:size-[18px]" />
                <Moon size={16} className="block dark:hidden sm:size-[18px]" />
              </button>
              <NotificationBell />
              <UserDropdown />
              <Button
                variant="outline"
                size="sm"
                className="lg:hidden relative"
                onClick={() => setShowCartMobile(!showCartMobile)}>
                <ShoppingCart size={18} />
                {totalItems > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 flex flex-col overflow-hidden">
            <ProductGrid
              products={filteredProducts}
              isLoading={isLoading}
              search={search}
              onSearchChange={setSearch}
              barcode={barcode}
              onBarcodeChange={setBarcode}
              categoryId={categoryId}
              onCategoryChange={setCategoryId}
              store={store}
            />
          </div>

          <div
            className={`${
              showCartMobile ? "fixed inset-0 z-40 flex" : "hidden"
            } lg:relative lg:flex lg:w-[380px] xl:w-[420px] border-l border-border bg-card`}>
            {showCartMobile && (
              <div
                className="fixed inset-0 bg-black/50 lg:hidden"
                onClick={() => setShowCartMobile(false)}
              />
            )}
            <div
              className={`${
                showCartMobile ? "relative ml-auto" : ""
              } w-full max-w-md lg:max-w-none bg-card flex flex-col h-full`}>
              <div className="flex items-center justify-between px-4 py-3 border-b border-border lg:hidden">
                <h2 className="font-semibold">
                  {t("page.cashier.orderCount", { count: totalItems })}
                </h2>
                <Button variant="ghost" size="icon" onClick={() => setShowCartMobile(false)}>
                  <X size={18} />
                </Button>
              </div>
              <CartPanel
                items={cart.order}
                subtotal={subtotal}
                onIncrement={cart.incrementOrder}
                onDecrement={cart.decrementOrder}
                onDelete={cart.handleDeleteOrder}
                onCheckout={() => setCheckoutOpen(true)}
                totalItems={totalItems}
                onUpdatePrice={(item, newPrice) => cart.updateItemPrice(item, newPrice)}
              />
            </div>
          </div>
        </div>

        {checkoutOpen && (
          <CheckoutModal
            onClose={() => setCheckoutOpen(false)}
            items={cart.order}
            subtotal={subtotal}
            store={store}
            cashierName={userName}
            cashierId={user?.id || user?.ID}
            onComplete={handleCheckoutComplete}
          />
        )}

        {receiptData && (
          <ReceiptModal
            data={receiptData}
            onClose={() => setReceiptData(null)}
            onNewTransaction={handleNewTransaction}
          />
        )}
      </div>
    </div>
  );
};

export default CashierPage;
