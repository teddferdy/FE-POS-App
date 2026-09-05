import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useQuery } from "react-query";
import { useCookies } from "react-cookie";
import { useSearchParams } from "react-router-dom";
import {
  ShoppingCart,
  X,
  Package,
  Menu,
  Sun,
  Moon,
  Store,
  ChevronRight,
  ChevronLeft,
  MonitorPlay,
  Loader2
} from "lucide-react";
import AbortController from "@/components/organism/abort-controller";
import { useDebounce } from "@/hooks/useDebounce";
import { useTranslation } from "react-i18next";
import { getProductByOutlet } from "@/services/product";
import { getAllLocation } from "@/services/location";
import { getAllTaxConfig } from "@/services/tax-config";
import { storeIdsEqual } from "@/utils/storeId";
import { orderList } from "@/state/order-list";
import {
  CART_MIRROR_KEY,
  DISPLAY_EVENT_TYPES,
  dispatchDisplayEvent
} from "@/utils/customerDisplayBoard";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { toast } from "sonner";
import ProductGrid from "./components/ProductGrid";
import CartPanel from "./components/CartPanel";
import CheckoutModal from "./components/CheckoutModal";
import ReceiptModal from "./components/ReceiptModal";
import OrderQueue from "./components/OrderQueue";
import Sidebar from "@/components/layout/Sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { UserDropdown, NotificationBell } from "@/components/layout/Header";
import { useThemeStore } from "@/state/theme";
import { useThemeEffect } from "@/hooks/useThemeEffect";

const CashierPage = () => {
  const { t } = useTranslation();
  const cookie = useCookies();
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
  const role = user?.roleType;
  const isSuperAdmin = role === "super_admin";
  const [searchParams, setSearchParams] = useSearchParams();
  const storeParam = searchParams.get("store");
  const [pickedStore, setPickedStore] = useState(null);
  const store = storeParam || (isSuperAdmin ? pickedStore : cookie?.activeStore || user?.store);
  const boardTabRef = useRef(0);

  const openBoardTab = (storeId) => {
    const now = Date.now();
    if (now - boardTabRef.current < 500 || isOpeningBoard) return;
    boardTabRef.current = now;
    setIsOpeningBoard(true);
    const boardWindow = window.open(
      storeId ? `/customer-display-board?store=${storeId}` : "/customer-display-board",
      "_blank"
    );
    if (!boardWindow) {
      setIsOpeningBoard(false);
      toast.error(t("page.cashier.popupBlocked"));
      return;
    }
    setTimeout(() => setIsOpeningBoard(false), 800);
  };

  const { data: locsData, isLoading: locsLoading } = useQuery(
    ["cashier-locations"],
    getAllLocation,
    {
      enabled: isSuperAdmin
    }
  );
  const locationList = locsData?.data || locsData || [];

  const storeName = store
    ? locationList.find((l) => storeIdsEqual(l.id, store))?.name || t("page.cashier.storeName")
    : t("page.cashier.storeName");
  const userName = user?.userName || user?.name || cookie?.name || t("page.cashier.cashierName");
  const { toggleTheme: toggleThemeStore } = useThemeStore();
  useThemeEffect();

  const toggleTheme = () => toggleThemeStore();

  const [search, setSearch] = useState("");
  const [barcode, setBarcode] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [showCartMobile, setShowCartMobile] = useState(false);
  const [isOpeningBoard, setIsOpeningBoard] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [receiptData, setReceiptData] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [clearCartOpen, setClearCartOpen] = useState(false);
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);
  const [cartExpanded, setCartExpanded] = useState(true);

  useEffect(() => {
    const visited = localStorage.getItem("pos-onboarding-done");
    if (visited) setHasSeenOnboarding(true);
  }, []);

  useEffect(() => {
    if (!hasSeenOnboarding) {
      const timer = setTimeout(() => {
        setOnboardingOpen(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [hasSeenOnboarding]);

  const handleCompleteOnboarding = useCallback(() => {
    localStorage.setItem("pos-onboarding-done", "true");
    setHasSeenOnboarding(true);
    setOnboardingOpen(false);
    toast.success(t("page.cashier.welcome"), {
      description: t("page.cashier.welcomeDesc")
    });
  }, [t]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setShowCartMobile(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSidebarHoverChange = (collapsed) => setSidebarCollapsed(collapsed);
  const handleMobileMenuToggle = () => setMobileSidebarOpen((prev) => !prev);

  const cart = orderList();

  // Debounced for the network request only — the input itself stays
  // controlled by the raw `search` state so typing feels instant, and the
  // client-side re-filter below also uses the raw value against whatever
  // is already loaded. Without this, every keystroke fired a live request
  // against the store's full product list (this is the highest-traffic
  // screen in the app).
  const debouncedSearch = useDebounce(search, 300);

  const {
    data: productsData,
    isLoading,
    isError,
    refetch
  } = useQuery(
    ["products-outlet", store, debouncedSearch],
    () => getProductByOutlet({ location: store, search: debouncedSearch || undefined }),
    {
      enabled: !!store
    }
  );

  const products = productsData?.data || productsData || [];
  const bundles = useMemo(() => productsData?.bundles || [], [productsData]);

  const bundleProducts = useMemo(
    () =>
      bundles.map((b) => ({
        id: b.id,
        nameProduct: b.name,
        sku: b.sku,
        sellPrice: b.bundlePrice,
        price: b.bundlePrice,
        stock: b.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0,
        isBundle: true,
        category: { id: "bundle", nameCategory: "Bundle" },
        bundleData: b
      })),
    [bundles]
  );

  const allProducts = useMemo(() => [...products, ...bundleProducts], [products, bundleProducts]);

  const catId = (p) => {
    const raw =
      p.category?.id ??
      p.category?._id ??
      p.category ??
      p.categoryId?.id ??
      p.categoryId?._id ??
      "";
    if (typeof raw === "string") {
      try {
        return JSON.parse(raw).id;
      } catch {
        return raw;
      }
    }
    return raw;
  };

  const filteredProducts = useMemo(
    () =>
      allProducts.filter((p) => {
        const name = (p.nameProduct || p.name || "").toLowerCase();
        const sku = (p.sku || "").toLowerCase();
        const q = search.toLowerCase();
        const matchesSearch = !search || name.includes(q) || sku.includes(q);
        const matchesCategory = !categoryId || String(catId(p)) === String(categoryId);
        return matchesSearch && matchesCategory;
      }),
    [allProducts, search, categoryId]
  );

  const totalItems = cart.order.reduce((sum, item) => sum + (item.count || 0), 0);
  const subtotal = cart.order.reduce((sum, item) => sum + (Number(item.totalPrice) || 0), 0);

  const { data: taxConfigData, isLoading: taxLoading } = useQuery(
    ["cashier-tax-config", store],
    () => getAllTaxConfig({ location: store, status: "active", limit: 50 }),
    { enabled: !!store }
  );

  const taxConfigs = taxConfigData?.data || [];
  const taxRatePercent = useMemo(() => {
    return taxConfigs
      .filter((tc) => tc.type === "ppn" && tc.status === "active")
      .reduce((sum, tc) => sum + (tc.rate || 0), 0);
  }, [taxConfigs]);
  const taxRate = taxRatePercent / 100;
  const taxAmount = Math.round(subtotal * taxRate);

  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem(
        CART_MIRROR_KEY,
        JSON.stringify({
          totalItems,
          subtotal,
          taxRate,
          taxAmount,
          total: subtotal + taxAmount,
          tableName: selectedTable?.name || "",
          items: cart.order.map((item) => ({
            cartKey: item.cartKey || item.id,
            nameProduct: item.nameProduct || item.name || "",
            variantName: item.variantName || null,
            count: item.count || 0,
            price: Number(item.price) || 0,
            totalPrice: Number(item.totalPrice) || 0,
            unit: item.unit || ""
          })),
          updatedAt: Date.now()
        })
      );
    }, 150);
    return () => clearTimeout(timer);
  }, [cart.order, totalItems, subtotal, taxRate, taxAmount, selectedTable]);

  const handleLoadOrder = useCallback(
    (order) => {
      cart.resetOrder();
      if (order?.items?.length) {
        order.items.forEach((item) => {
          cart.addingProduct({
            id: item.product,
            cartKey: `${item.product}_${item.options?.[0]?.name || ""}`,
            nameProduct: item.productName,
            variantName: item.options?.[0]?.name || null,
            price: item.price,
            count: item.quantity,
            totalPrice: item.totalPrice || item.price * item.quantity,
            image: null,
            unit: "",
            sku: "",
            point: 0,
            redeemPoints: 0
          });
        });
      }
      toast.success(t("page.cashier.orderLoaded"), {
        description: t("page.cashier.orderLoadedDesc", { count: order.items.length })
      });
    },
    [cart, t]
  );

  const handleCheckoutComplete = useCallback(
    (result) => {
      setReceiptData(result);
      setCheckoutOpen(false);
      cart.resetOrder();
      dispatchDisplayEvent({
        type: DISPLAY_EVENT_TYPES.TRANSACTION_SUCCESS,
        store,
        orderId: result?.id || result?._id || "",
        orderNumber: result?.orderNumber || result?.invoice || "",
        total: result?.total || result?.grandTotal || result?.totalPrice || 0
      });
    },
    [cart, store]
  );

  const handleNewTransaction = useCallback(() => {
    cart.resetOrder();
    setSelectedTable(null);
    setReceiptData(null);
  }, [cart]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background relative">
      {/* Subtle background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-0">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-primary/5 dark:bg-primary/3 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] rounded-full bg-secondary/5 dark:bg-secondary/3 blur-3xl" />
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden xl:block">
        <Sidebar collapsed={sidebarCollapsed} onHoverChange={handleSidebarHoverChange} />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 xl:hidden">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="fixed left-0 top-0 h-screen w-72 shadow-2xl">
            <Sidebar collapsed={false} onToggle={() => setMobileSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div
        className={`h-screen flex flex-col transition-all duration-300 ${sidebarCollapsed ? "xl:ml-16" : "xl:ml-64"}`}>
        <header className="sticky top-0 z-40 bg-background/70 backdrop-blur-xl border-b border-border/50 shrink-0">
          <TooltipProvider>
            <div className="flex items-center justify-between px-4 lg:px-6 py-3 gap-4">
              <div className="flex items-center gap-3">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={handleMobileMenuToggle}
                      className="xl:hidden p-2 rounded-xl text-muted-foreground hover:bg-accent hover:text-foreground transition-all">
                      <Menu size={20} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" align="center">
                    {t("page.cashier.menu")}
                  </TooltipContent>
                </Tooltip>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary/70 shadow-lg shadow-primary/20 flex items-center justify-center">
                    <Package className="text-primary-foreground" size={18} />
                  </div>
                  <div>
                    <h1 className="text-lg font-bold leading-tight text-foreground">{storeName}</h1>
                    <p className="text-xs text-muted-foreground/80">{userName}</p>
                  </div>
                </div>
                {/* <StoreSelector cookie={cookie} setCookie={setCookie} /> */}
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                {storeParam && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isOpeningBoard}
                        className="relative rounded-xl border-border/60 bg-card/60 hover:border-primary/40 hover:bg-primary/5 hover:text-primary transition-all px-4 lg:px-6 hidden sm:inline-flex group"
                        onClick={() => openBoardTab(store)}>
                        {isOpeningBoard ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <MonitorPlay
                            size={16}
                            className="transition-transform duration-200 group-hover:scale-110"
                          />
                        )}
                        <span className="hidden lg:inline">
                          {t("page.cashier.openCustomerDisplay")}
                        </span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" align="center">
                      {t("page.cashier.openCustomerDisplay")}
                    </TooltipContent>
                  </Tooltip>
                )}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={toggleTheme}
                      className="p-1.5 sm:p-2 rounded-xl text-muted-foreground hover:bg-accent hover:text-foreground transition-all">
                      <Sun size={16} className="hidden dark:block sm:size-[18px]" />
                      <Moon size={16} className="block dark:hidden sm:size-[18px]" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" align="center">
                    {t("page.cashier.toggleTheme")}
                  </TooltipContent>
                </Tooltip>
                <NotificationBell />
                <UserDropdown />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="xl:hidden relative rounded-xl border-border/60"
                      onClick={() => setShowCartMobile(!showCartMobile)}>
                      <ShoppingCart size={18} />
                      {totalItems > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg">
                          {totalItems}
                        </span>
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="left" align="center">
                    {t("page.cashier.cart", { count: totalItems })}
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </TooltipProvider>
        </header>

        <div className="flex flex-1 overflow-hidden">
          {!store ? (
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="text-center w-full">
                <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <Store size={40} className="text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  {t("page.cashier.storeName")}
                </h2>
                <p className="text-muted-foreground mb-8">Pilih toko</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {locsLoading
                    ? [0, 1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className={`flex items-center gap-4 p-5 rounded-xl border-2 border-border bg-card ${
                            i === 1 ? "hidden sm:flex" : i >= 2 ? "hidden lg:flex" : ""
                          }`}>
                          <Skeleton className="w-12 h-12 rounded-xl shrink-0" />
                          <div className="flex-1 min-w-0 space-y-2">
                            <Skeleton className="h-5 w-5/6" />
                            <Skeleton className="h-4 w-4/6" />
                          </div>
                          <Skeleton className="w-5 h-5 shrink-0" />
                        </div>
                      ))
                    : locationList.map((loc) => (
                        <button
                          key={loc.id}
                          onClick={() => {
                            setPickedStore(loc.id);
                            setSearchParams({ store: loc.id });
                            openBoardTab(loc.id);
                          }}
                          className="flex items-center gap-4 p-5 rounded-xl border-2 border-border bg-card hover:border-primary hover:shadow-lg transition-all text-left group">
                          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/15">
                            <Store size={24} className="text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-foreground">{loc.name}</p>
                            <p className="text-sm text-muted-foreground">Pilih toko</p>
                          </div>
                          <ChevronRight
                            size={20}
                            className="text-muted-foreground group-hover:text-primary transition-colors shrink-0"
                          />
                        </button>
                      ))}
                </div>
              </div>
            </div>
          ) : isError ? (
            <div className="flex-1 flex items-center justify-center">
              <AbortController refetch={refetch} />
            </div>
          ) : (
            <div className="flex-1 flex flex-col overflow-hidden">
              <OrderQueue store={store} onLoadOrder={handleLoadOrder} />
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
                storeName={storeName}
              />
            </div>
          )}

          {/* Mobile cart overlay */}
          {showCartMobile && (
            <div className="fixed inset-0 z-50 xl:hidden">
              <div
                className="fixed inset-0 bg-black/40 backdrop-blur-sm"
                onClick={() => setShowCartMobile(false)}
              />
              <div className="fixed right-0 top-0 bottom-0 w-[88vw] sm:max-w-md bg-card/95 backdrop-blur-xl border-l border-border/50 shadow-2xl flex flex-col">
                <div className="flex items-center justify-between px-5 py-4 border-b border-border/50 shrink-0">
                  <h2 className="font-semibold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                    {t("page.cashier.orderCount", { count: totalItems })}
                  </h2>
                  <button
                    onClick={() => setShowCartMobile(false)}
                    className="p-1.5 rounded-lg hover:bg-accent transition-colors">
                    <X size={18} />
                  </button>
                </div>
                <CartPanel
                  items={cart.order}
                  subtotal={subtotal}
                  taxRate={taxRate}
                  taxAmount={taxAmount}
                  onIncrement={cart.incrementOrder}
                  onDecrement={cart.decrementOrder}
                  onDelete={cart.handleDeleteOrder}
                  onCheckout={() => setCheckoutOpen(true)}
                  totalItems={totalItems}
                  onUpdatePrice={(item, newPrice) => cart.updateItemPrice(item, newPrice)}
                  isLoading={taxLoading}
                />
              </div>
            </div>
          )}

          {/* Desktop cart sidebar */}
          {store && (
            <div
              className={`hidden lg:flex shrink-0 h-full border-l border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 relative ${
                cartExpanded ? "lg:w-[380px] xl:w-[420px]" : "lg:w-14"
              }`}>
              {/* Toggle button */}
              <button
                onClick={() => setCartExpanded(!cartExpanded)}
                className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 w-6 h-12 flex items-center justify-center rounded-l-lg bg-card border border-border/50 border-r-0 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                title={cartExpanded ? "Collapse cart" : "Expand cart"}>
                {cartExpanded ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
              </button>
              <CartPanel
                items={cart.order}
                subtotal={subtotal}
                taxRate={taxRate}
                taxAmount={taxAmount}
                onIncrement={cart.incrementOrder}
                onDecrement={cart.decrementOrder}
                onDelete={cart.handleDeleteOrder}
                onCheckout={() => setCheckoutOpen(true)}
                totalItems={totalItems}
                onUpdatePrice={(item, newPrice) => cart.updateItemPrice(item, newPrice)}
                isLoading={taxLoading}
                expanded={cartExpanded}
              />
            </div>
          )}
        </div>

        {checkoutOpen && (
          <CheckoutModal
            onClose={() => setCheckoutOpen(false)}
            items={cart.order}
            subtotal={subtotal}
            taxRate={taxRate}
            store={store}
            cashierName={userName}
            cashierId={user?.id || user?.ID}
            onTableChange={setSelectedTable}
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

        {/* Clear Cart Confirmation */}
        <Dialog open={clearCartOpen} onOpenChange={setClearCartOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("page.cashier.clearCart")}</DialogTitle>
              <DialogDescription>{t("page.cashier.clearCartDesc")}</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="danger" onClick={() => setClearCartOpen(false)}>
                {t("page.cashier.cancel")}
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  cart.resetOrder();
                  setClearCartOpen(false);
                  toast.info(t("page.cashier.cartCleared"));
                }}>
                {t("page.cashier.clear")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Onboarding Welcome Modal */}
        <Dialog open={onboardingOpen} onOpenChange={setOnboardingOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-center text-xl">
                🎉 {t("page.cashier.welcome")}
              </DialogTitle>
              <DialogDescription className="text-center">
                {t("page.cashier.welcomeDesc")}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <ShoppingCart size={16} className="text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{t("page.cashier.tourCart")}</p>
                  <p className="text-xs text-muted-foreground">{t("page.cashier.tourCartDesc")}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Package size={16} className="text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{t("page.cashier.tourProducts")}</p>
                  <p className="text-xs text-muted-foreground">
                    {t("page.cashier.tourProductsDesc")}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Store size={16} className="text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{t("page.cashier.tourCheckout")}</p>
                  <p className="text-xs text-muted-foreground">
                    {t("page.cashier.tourCheckoutDesc")}
                  </p>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button className="w-full" onClick={handleCompleteOnboarding}>
                {t("page.cashier.startUsing")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default CashierPage;
