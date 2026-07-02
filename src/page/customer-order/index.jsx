import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Search,
  ShoppingCart,
  Plus,
  Store,
  QrCode,
  UtensilsCrossed,
  ArrowRight,
  Menu,
  FileText,
  ShoppingBag
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { axiosInstance } from "@/services";
import { loadCart } from "./cartStore";

const CustomerOrder = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tableId = searchParams.get("table");
  const storeId = searchParams.get("store");

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState(loadCart);

  useEffect(() => {
    if (!storeId) {
      setLoading(false);
      return;
    }
    axiosInstance
      .get(`/order/customer-menu?store=${storeId}`)
      .then((res) => {
        if (res.data?.data) {
          setProducts(res.data.data.products || []);
          setCategories(res.data.data.categories || []);
        }
      })
      .catch((e) => {
        console.error(e);
        toast.error(t("page.customerOrder.loadMenuFail"), {
          description: e?.response?.data?.message || e.message
        });
      })
      .finally(() => setLoading(false));
  }, [storeId]);

  useEffect(() => {
    const onStorage = () => setCart(loadCart());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const filteredProducts = useMemo(() => {
    let result = products;
    if (activeCategory !== "all") {
      result = result.filter((p) => String(p.category || p.categoryId) === String(activeCategory));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          (p.name || p.nameProduct || "").toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q))
      );
    }
    return result;
  }, [activeCategory, searchQuery, products]);

  const prodName = (p) => p.name || p.nameProduct || "-";
  const prodPrice = (p) => Number(p.sellingPrice || p.price || 0);
  const prodId = (p) => p.id || p.productId;
  const totalItems = cart.reduce((s, i) => s + i.quantity, 0);
  const totalPrice = cart.reduce((s, i) => s + i.price * i.quantity, 0);

  const refreshCart = useCallback(() => setCart(loadCart()), []);

  if (!storeId) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-4">
        <Card className="p-8 text-center max-w-sm">
          <QrCode size={48} className="mx-auto text-primary mb-4" />
          <h1 className="text-xl font-bold mb-2 text-on-surface">
            {t("page.customerOrder.invalidQr")}
          </h1>
          <p className="text-sm text-on-surface-variant mb-4">
            {t("page.customerOrder.scanQrToOrder")}
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-on-background font-sans antialiased pb-48">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-surface border-b border-outline-variant flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-3">
          <UtensilsCrossed size={20} className="text-primary" />
          <h1 className="font-bold text-sm text-on-surface">{t("page.customerOrder.title")}</h1>
          {tableId && (
            <span className="text-xs font-semibold text-primary ml-1 px-2 py-0.5 bg-primary-container/20 rounded-md">
              {t("page.customerOrder.tableNumber", { number: tableId })}
            </span>
          )}
        </div>
        <button
          onClick={() => navigate(`/customer-order/cart?store=${storeId}&table=${tableId || ""}`)}
          className="relative w-10 h-10 flex items-center justify-center text-on-surface-variant hover:bg-surface-container-low rounded-xl transition-colors">
          <ShoppingCart size={20} />
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-1 bg-primary text-on-primary text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-surface">
              {totalItems}
            </span>
          )}
        </button>
      </header>

      <main className="pt-14">
        {/* Search */}
        <section className="px-4 pt-4 pb-2">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
            <Input
              placeholder={t("page.customerOrder.searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-10 bg-surface-container-lowest border-outline-variant rounded-xl text-sm focus-visible:ring-primary"
            />
          </div>
        </section>

        {/* Categories */}
        <nav className="sticky top-14 z-40 bg-surface/95 backdrop-blur-md py-3 overflow-x-auto no-scrollbar flex items-center gap-2 px-4 border-b border-surface-container">
          <button
            onClick={() => setActiveCategory("all")}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border ${
              activeCategory === "all"
                ? "bg-primary text-on-primary border-primary"
                : "bg-surface-container-lowest text-on-surface-variant border-outline-variant hover:border-primary"
            }`}>
            {t("page.customerOrder.allCategory")}
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border ${
                activeCategory === cat.id
                  ? "bg-primary text-on-primary border-primary"
                  : "bg-surface-container-lowest text-on-surface-variant border-outline-variant hover:border-primary"
              }`}>
              {cat.name}
            </button>
          ))}
        </nav>

        {/* Products */}
        <section className="px-4 pt-4 pb-8 space-y-3">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="w-full h-24 rounded-xl bg-surface-container-high animate-pulse"
                />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-on-surface-variant text-sm">
                {t("page.customerOrder.noProducts")}
              </p>
            </div>
          ) : (
            filteredProducts.map((product) => {
              const pid = prodId(product);
              return (
                <div
                  key={pid}
                  onClick={() =>
                    navigate(`/customer-order/menu/${pid}?store=${storeId}&table=${tableId || ""}`)
                  }
                  className="flex items-center gap-3 p-2 bg-surface-container-lowest rounded-xl border border-outline-variant hover:bg-surface-container-low transition-colors cursor-pointer active:scale-[0.99]">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={prodName(product)}
                      className="w-20 h-20 rounded-lg object-cover bg-surface-container flex-shrink-0"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-lg bg-primary-container/20 flex items-center justify-center text-primary font-bold text-xl flex-shrink-0">
                      {prodName(product).charAt(0)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0 pr-1">
                    <h3 className="font-bold text-sm text-on-surface truncate">
                      {prodName(product)}
                    </h3>
                    {product.description && (
                      <p className="text-xs text-on-surface-variant line-clamp-1 mt-0.5">
                        {product.description}
                      </p>
                    )}
                    <p className="font-bold text-sm text-primary mt-1.5">
                      Rp{prodPrice(product).toLocaleString("id-ID")}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    className="shrink-0 bg-primary hover:bg-primary-container text-on-primary rounded-xl h-10 w-10 p-0 flex items-center justify-center shadow-sm active:scale-90 transition-transform"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(
                        `/customer-order/menu/${pid}?store=${storeId}&table=${tableId || ""}`
                      );
                    }}>
                    <Plus size={18} />
                  </Button>
                </div>
              );
            })
          )}
        </section>
      </main>

      {/* Floating cart bar */}
      {totalItems > 0 && (
        <div className="fixed bottom-0 left-0 w-full p-4 z-50 pointer-events-none">
          <div
            onClick={() => navigate(`/customer-order/cart?store=${storeId}&table=${tableId || ""}`)}
            className="max-w-lg mx-auto w-full bg-primary text-on-primary h-14 rounded-2xl flex items-center justify-between px-5 shadow-lg pointer-events-auto cursor-pointer active:scale-[0.98] transition-transform">
            <div className="flex items-center gap-3">
              <div className="relative">
                <ShoppingCart size={20} />
                <span className="absolute -top-2 -right-2 bg-error text-on-error text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-primary">
                  {totalItems}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-sm">
                  {totalItems} {t("page.customerOrder.items")}
                </span>
                <span className="text-[10px] uppercase tracking-wider opacity-80">
                  {t("page.customerOrder.viewCart")}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base">Rp{totalPrice.toLocaleString("id-ID")}</span>
              <ArrowRight size={18} />
            </div>
          </div>
        </div>
      )}

      {/* Bottom nav */}
      <nav className="fixed bottom-0 w-full z-40 bg-surface shadow-[0_-4px_12px_0_rgba(0,0,0,0.08)] flex justify-around items-center h-14 px-4">
        <button className="flex flex-col items-center gap-0.5 text-primary font-bold transition-colors">
          <Menu size={20} />
          <span className="text-[10px] font-semibold">{t("page.customerOrder.menu")}</span>
        </button>
        <button
          onClick={() => navigate(`/customer-order/cart?store=${storeId}&table=${tableId || ""}`)}
          className="flex flex-col items-center gap-0.5 text-on-surface-variant hover:text-primary transition-colors">
          <ShoppingBag size={20} />
          <span className="text-[10px] font-semibold">{t("page.customerOrder.cart")}</span>
        </button>
        <button className="flex flex-col items-center gap-0.5 text-on-surface-variant hover:text-primary transition-colors">
          <FileText size={20} />
          <span className="text-[10px] font-semibold">{t("page.customerOrder.orders")}</span>
        </button>
      </nav>
    </div>
  );
};

export default CustomerOrder;
