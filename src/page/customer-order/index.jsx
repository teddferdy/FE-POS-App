import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import {
  ShoppingCart, Plus, Minus, Send, QrCode, Store, X, CheckCircle
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { axiosInstance } from "@/services";

const VAR_SEPARATOR = " • ";

const CustomerOrder = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const tableId = searchParams.get("table");
  const storeId = searchParams.get("store");

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successOrder, setSuccessOrder] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [variantProduct, setVariantProduct] = useState(null);
  const [variantSelections, setVariantSelections] = useState({});
  const [variantMods, setVariantMods] = useState([]);

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

  const filteredProducts = useMemo(
    () =>
      activeCategory === "all"
        ? products
        : products.filter(
            (p) => String(p.category || p.categoryId) === String(activeCategory)
          ),
    [activeCategory, products]
  );

  const prodName = (p) => p.name || p.nameProduct || "-";
  const prodPrice = (p) => (p ? Number(p.sellingPrice || p.price || 0) : 0);
  const prodId = (p) => p.id || p.productId;

  const hasVariants = (p) => p.isOption || p.hasModifiers || p.options?.length || p.modifiers?.length;

  const openVariant = (product) => {
    setVariantProduct(product);
    setVariantSelections({});
    setVariantMods([]);
  };

  const selectOption = (groupId, optionName) => {
    setVariantSelections((prev) => ({ ...prev, [groupId]: optionName }));
  };

  const toggleMod = (modId) => {
    setVariantMods((prev) =>
      prev.includes(modId) ? prev.filter((id) => id !== modId) : [...prev, modId]
    );
  };

  const variantExtraPrice = useMemo(() => {
    if (!variantProduct) return 0;
    let extra = 0;
    const opts = variantProduct.options || [];
    for (const group of opts) {
      const sel = variantSelections[group.id];
      if (sel) {
        const found = (group.options || []).find((o) => o.name === sel);
        if (found) extra += Number(found.price || 0);
      }
    }
    const mods = variantProduct.modifiers || [];
    for (const m of mods) {
      if (variantMods.includes(m.id)) extra += Number(m.price || 0);
    }
    return extra;
  }, [variantProduct, variantSelections, variantMods]);

  const variantLabel = useMemo(() => {
    if (!variantProduct) return "";
    const parts = [];
    const opts = variantProduct.options || [];
    for (const group of opts) {
      const sel = variantSelections[group.id];
      if (sel) parts.push(sel);
    }
    for (const m of (variantProduct.modifiers || [])) {
      if (variantMods.includes(m.id)) parts.push(m.name);
    }
    return parts.join(VAR_SEPARATOR);
  }, [variantProduct, variantSelections, variantMods]);

  const addToCart = (product, label, extra) => {
    const pid = prodId(product);
    const basePrice = prodPrice(product);
    const finalPrice = basePrice + extra;
    const displayName = label ? `${prodName(product)} (${label})` : prodName(product);
    setCart((prev) => {
      const existing = prev.find(
        (item) => item.productId === pid && item.variantLabel === label
      );
      if (existing) {
        return prev.map((item) =>
          item.productId === pid && item.variantLabel === label
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [
        ...prev,
        {
          productId: pid,
          productName: displayName,
          price: finalPrice,
          quantity: 1,
          notes: "",
          variantLabel: label
        }
      ];
    });
  };

  const handleAddClick = (product) => {
    if (hasVariants(product)) {
      openVariant(product);
    } else {
      addToCart(product, "", 0);
    }
  };

  const confirmVariant = () => {
    if (!variantProduct) return;
    addToCart(variantProduct, variantLabel, variantExtraPrice);
    setVariantProduct(null);
  };

  const updateQty = (productId, variantLabel, delta) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.productId === productId && item.variantLabel === variantLabel
            ? { ...item, quantity: Math.max(1, item.quantity + delta) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeItem = (productId, variantLabel) => {
    setCart((prev) =>
      prev.filter(
        (item) => !(item.productId === productId && item.variantLabel === variantLabel)
      )
    );
  };

  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const placeOrder = async () => {
    if (!storeId || cart.length === 0) return;
    setSubmitting(true);
    try {
      const res = await axiosInstance.post("/order/customer-create", {
        store: Number(storeId),
        tableId: tableId ? Number(tableId) : null,
        items: cart.map((item) => ({
          productId: item.productId,
          productName: item.productName,
          price: item.price,
          quantity: item.quantity,
          notes: item.notes || null
        })),
        customerName: customerName || null
      });
      const no = res.data?.data?.orderNumber || res.data?.orderNumber;
      setSuccessOrder(no);
      setCart([]);
      setCustomerName("");
    } catch (e) {
      toast.error(t("page.customerOrder.fail"), {
        description: e?.response?.data?.message || e.message || t("page.customerOrder.failDesc")
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!storeId) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white flex items-center justify-center p-4">
        <Card className="p-8 text-center max-w-sm">
          <QrCode size={48} className="mx-auto text-muted-foreground mb-4" />
          <h1 className="text-xl font-bold mb-2">{t("page.customerOrder.invalidQr")}</h1>
          <p className="text-sm text-muted-foreground mb-4">{t("page.customerOrder.scanQrToOrder")}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white pb-20">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm border-b">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <Store size={20} className="text-orange-600" />
          <div className="flex-1">
            <h1 className="font-bold text-lg">{t("page.customerOrder.title")}</h1>
            {tableId && (
              <p className="text-xs text-muted-foreground">
                {t("page.customerOrder.tableNumber", { number: tableId })}
              </p>
            )}
          </div>
          <button onClick={() => setCartOpen(true)} className="relative">
            <ShoppingCart size={20} />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-orange-600 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Category tabs */}
      <div className="max-w-lg mx-auto px-4 py-3 overflow-x-auto">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveCategory("all")}
            className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
              activeCategory === "all"
                ? "bg-orange-600 text-white"
                : "bg-white text-foreground border hover:bg-orange-50"
            }`}>
            {t("page.customerOrder.allCategory")}
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
                activeCategory === cat.id
                  ? "bg-orange-600 text-white"
                  : "bg-white text-foreground border hover:bg-orange-50"
              }`}>
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Menu */}
      <main className="max-w-lg mx-auto px-4 space-y-3">
        {loading ? (
          <p className="text-center text-muted-foreground py-8">{t("page.customerOrder.loading")}</p>
        ) : filteredProducts.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">{t("page.customerOrder.noProducts")}</p>
        ) : (
          filteredProducts.map((product) => (
            <Card key={prodId(product)} className="p-4 flex gap-4 items-center">
              <div className="w-16 h-16 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-xl flex-shrink-0">
                {prodName(product).charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm truncate">{prodName(product)}</h3>
                <p className="text-orange-600 font-bold text-sm mt-0.5">
                  Rp{prodPrice(product).toLocaleString("id-ID")}
                </p>
              </div>
              <Button size="sm" className="shrink-0" onClick={() => handleAddClick(product)}>
                <Plus size={16} />
              </Button>
            </Card>
          ))
        )}
      </main>

      {/* Floating cart bar */}
      {cart.length > 0 && (
        <button
          onClick={() => setCartOpen(true)}
          className="fixed bottom-0 left-0 right-0 z-20 bg-white border-t shadow-lg p-3">
          <div className="max-w-lg mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <ShoppingCart size={16} className="text-orange-600" />
              <span className="font-medium">{totalItems} {t("page.customerOrder.items")}</span>
              <span className="text-muted-foreground">|</span>
              <span className="font-bold text-orange-600">
                Rp{totalPrice.toLocaleString("id-ID")}
              </span>
            </div>
            <Button size="sm" className="pointer-events-none">
              {t("page.customerOrder.viewCart")}
            </Button>
          </div>
        </button>
      )}

      {/* Cart dialog */}
      <Dialog open={cartOpen} onOpenChange={setCartOpen}>
        <DialogContent className="sm:max-w-sm max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{t("page.customerOrder.cartTitle")}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto space-y-3 py-2">
            <Input
              placeholder={t("page.customerOrder.namePlaceholder")}
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="text-sm"
            />
            {cart.length === 0 ? (
              <p className="text-center text-muted-foreground py-8 text-sm">
                {t("page.customerOrder.emptyCart")}
              </p>
            ) : (
              <div className="space-y-2">
                {cart.map((item) => (
                  <div
                    key={item.productId + (item.variantLabel || "")}
                    className="flex items-center justify-between gap-2 text-sm">
                    <div className="flex-1 min-w-0">
                      <p className="truncate font-medium">{item.productName}</p>
                      <p className="text-xs text-muted-foreground">
                        Rp{item.price.toLocaleString("id-ID")} x {item.quantity}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground"
                        onClick={() =>
                          removeItem(item.productId, item.variantLabel)
                        }>
                        <X size={14} />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => updateQty(item.productId, item.variantLabel, -1)}>
                        <Minus size={12} />
                      </Button>
                      <span className="w-6 text-center font-medium">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => updateQty(item.productId, item.variantLabel, 1)}>
                        <Plus size={12} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <Separator />
          <div className="flex items-center justify-between gap-2 pt-2">
            <p className="text-xs text-muted-foreground">{t("page.customerOrder.total")}</p>
            <div className="flex items-center gap-3">
              <p className="font-bold text-orange-600 text-lg">
                Rp{totalPrice.toLocaleString("id-ID")}
              </p>
              <Button
                onClick={placeOrder}
                disabled={submitting || cart.length === 0}
                className="gap-1">
                <Send size={16} />
                {submitting ? t("page.customerOrder.submitting") : t("page.customerOrder.order")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Variant modal */}
      <Dialog open={!!variantProduct} onOpenChange={(o) => !o && setVariantProduct(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{variantProduct ? prodName(variantProduct) : ""}</DialogTitle>
            <DialogDescription>
              {t("page.customerOrder.chooseVariant")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {(variantProduct?.options || []).map((group) => (
              <div key={group.id}>
                <p className="text-sm font-medium mb-2">{group.name}</p>
                <div className="space-y-2">
                  {(group.options || []).map((opt) => {
                    const active = variantSelections[group.id] === opt.name;
                    return (
                      <button
                        key={opt.name}
                        onClick={() => selectOption(group.id, opt.name)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm border transition-colors ${
                          active
                            ? "border-orange-600 bg-orange-50 text-orange-700"
                            : "border-border hover:bg-muted"
                        }`}>
                        <span>{opt.name}</span>
                        {Number(opt.price) > 0 && (
                          <span className="text-xs text-muted-foreground">
                            +Rp{Number(opt.price).toLocaleString("id-ID")}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
            {(variantProduct?.modifiers || []).length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">
                  {t("page.customerOrder.addOns")}
                </p>
                <div className="space-y-2">
                  {(variantProduct.modifiers || []).map((mod) => {
                    const active = variantMods.includes(mod.id);
                    return (
                      <button
                        key={mod.id}
                        onClick={() => toggleMod(mod.id)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm border transition-colors ${
                          active
                            ? "border-orange-600 bg-orange-50 text-orange-700"
                            : "border-border hover:bg-muted"
                        }`}>
                        <span>{mod.name}</span>
                        <span className="text-xs text-muted-foreground">
                          +Rp{Number(mod.price).toLocaleString("id-ID")}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center justify-between pt-2 border-t">
            <p className="font-bold text-orange-600">
              Rp{(prodPrice(variantProduct) + variantExtraPrice).toLocaleString("id-ID")}
            </p>
            <Button onClick={confirmVariant}>
              {t("page.customerOrder.addToCart")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Success dialog */}
      <Dialog open={!!successOrder} onOpenChange={(o) => !o && setSuccessOrder(null)}>
        <DialogContent className="sm:max-w-sm text-center">
          <div className="flex flex-col items-center gap-3 py-4">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle size={36} className="text-green-600" />
            </div>
            <DialogTitle>{t("page.customerOrder.successModalTitle")}</DialogTitle>
            <DialogDescription>
              {t("page.customerOrder.successModalDesc", { orderNumber: successOrder })}
            </DialogDescription>
            <Button
              className="mt-2"
              onClick={() => setSuccessOrder(null)}>
              {t("page.customerOrder.successModalConfirm")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomerOrder;
