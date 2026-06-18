import React, { useState, useEffect, useMemo } from "react";
import { useQuery } from "react-query";
import { useCookies } from "react-cookie";
import { ShoppingCart, X, Package, Menu, Sun, Moon } from "lucide-react";
import AbortController from "@/components/organism/abort-controller";
import { AnimatePresence, motion } from "framer-motion";
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

  const {
    data: productsData,
    isLoading,
    isError,
    refetch
  } = useQuery(["products-outlet", store], () => getProductByOutlet({ location: store }), {
    enabled: !!store
  });

  const products = productsData?.data || productsData || [];

  const filteredProducts = products.filter((p) => {
    const name = (p.nameProduct || p.name || "").toLowerCase();
    const sku = (p.sku || "").toLowerCase();
    const q = search.toLowerCase();
    const matchesSearch = !search || name.includes(q) || sku.includes(q);
    const cat =
      p.category?.id ||
      p.category?._id ||
      p.category ||
      p.categoryId?.id ||
      p.categoryId?._id ||
      "";
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background relative">
      {/* Subtle background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-0">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-primary/5 dark:bg-primary/3 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] rounded-full bg-secondary/5 dark:bg-secondary/3 blur-3xl" />
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar collapsed={sidebarCollapsed} onToggle={handleToggleSidebar} />
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 lg:hidden">
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed left-0 top-0 h-screen w-72 shadow-2xl">
              <Sidebar collapsed={false} onToggle={() => setMobileSidebarOpen(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <motion.div
        layout
        className={`h-screen flex flex-col transition-all duration-300 ${sidebarCollapsed ? "lg:ml-16" : "lg:ml-64"}`}>
        <header className="sticky top-0 z-40 bg-background/70 backdrop-blur-xl border-b border-border/50 shrink-0">
          <div className="flex items-center justify-between px-4 lg:px-6 py-3 gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={handleMobileMenuToggle}
                className="lg:hidden p-2 rounded-xl text-muted-foreground hover:bg-accent hover:text-foreground transition-all">
                <Menu size={20} />
              </button>
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary/70 shadow-lg shadow-primary/20 flex items-center justify-center">
                  <Package className="text-primary-foreground" size={18} />
                </div>
                <div>
                  <h1 className="text-lg font-bold leading-tight text-foreground">{storeName}</h1>
                  <p className="text-xs text-muted-foreground/80">{userName}</p>
                </div>
              </motion.div>
              <StoreSelector cookie={cookie} setCookie={setCookie} />
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center bg-muted/60 rounded-full p-0.5 border border-border/60 shadow-sm">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => updateTranslation(lang.code)}
                    className={`px-1.5 sm:px-2.5 py-0.5 sm:py-1 text-[9px] sm:text-[10px] font-bold tracking-widest rounded-full transition-all duration-200 ${
                      translation === lang.code
                        ? "bg-foreground text-background shadow-sm scale-105"
                        : "text-muted-foreground hover:text-foreground"
                    }`}>
                    {lang.label}
                  </button>
                ))}
              </motion.div>
              <button
                onClick={toggleTheme}
                className="p-1.5 sm:p-2 rounded-xl text-muted-foreground hover:bg-accent hover:text-foreground transition-all">
                <Sun size={16} className="hidden dark:block sm:size-[18px]" />
                <Moon size={16} className="block dark:hidden sm:size-[18px]" />
              </button>
              <NotificationBell />
              <UserDropdown />
              <motion.div whileTap={{ scale: 0.9 }}>
                <Button
                  variant="outline"
                  size="sm"
                  className="lg:hidden relative rounded-xl border-border/60"
                  onClick={() => setShowCartMobile(!showCartMobile)}>
                  <ShoppingCart size={18} />
                  {totalItems > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1.5 -right-1.5 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg">
                      {totalItems}
                    </motion.span>
                  )}
                </Button>
              </motion.div>
            </div>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          {isError ? (
            <div className="flex-1 flex items-center justify-center">
              <AbortController refetch={refetch} />
            </div>
          ) : (
            <motion.div layout className="flex-1 flex flex-col overflow-hidden">
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
            </motion.div>
          )}

          {/* Mobile cart overlay */}
          <AnimatePresence>
            {showCartMobile && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="fixed inset-0 z-50 lg:hidden">
                <div
                  className="fixed inset-0 bg-black/40 backdrop-blur-sm"
                  onClick={() => setShowCartMobile(false)}
                />
                <motion.div
                  initial={{ x: "100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "100%" }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  className="fixed right-0 top-0 h-screen w-[88vw] sm:max-w-md bg-card/95 backdrop-blur-xl border-l border-border/50 shadow-2xl flex flex-col">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-border/50 shrink-0">
                    <h2 className="font-semibold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                      {t("page.cashier.orderCount", { count: totalItems })}
                    </h2>
                    <motion.button
                      whileHover={{ rotate: 90 }}
                      onClick={() => setShowCartMobile(false)}
                      className="p-1.5 rounded-lg hover:bg-accent transition-colors">
                      <X size={18} />
                    </motion.button>
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
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Desktop cart sidebar */}
          <motion.div
            layout
            className="hidden lg:relative lg:flex lg:w-[380px] xl:w-[420px] border-l border-border/50 bg-card/50 backdrop-blur-sm">
            <div className="w-full flex flex-col h-full">
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
          </motion.div>
        </div>

        <AnimatePresence>
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
        </AnimatePresence>

        <AnimatePresence>
          {receiptData && (
            <ReceiptModal
              data={receiptData}
              onClose={() => setReceiptData(null)}
              onNewTransaction={handleNewTransaction}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default CashierPage;
