import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import {
  ShoppingCart,
  Plus,
  Minus,
  Send,
  QrCode,
  Store,
  X,
  CheckCircle,
  Search,
  Star,
  MessageSquare
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
  const [searchQuery, setSearchQuery] = useState("");
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

  const filteredProducts = useMemo(() => {
    let result = products;
    if (activeCategory !== "all") {
      result = result.filter((p) => String(p.category || p.categoryId) === String(activeCategory));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          prodName(p).toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q))
      );
    }
    return result;
  }, [activeCategory, searchQuery, products]);

  const prodName = (p) => p.name || p.nameProduct || "-";
  const prodPrice = (p) => (p ? Number(p.sellingPrice || p.price || 0) : 0);
  const prodId = (p) => p.id || p.productId;

  const hasVariants = (p) =>
    p.isOption || p.hasModifiers || p.options?.length || p.modifiers?.length;

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
        extra += Number(found.price || 0);
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
    for (const m of variantProduct.modifiers || []) {
      if (variantMods.includes(m.id)) parts.push(m.name);
    }
    return parts.join(VAR_SEPARATOR);
  }, [variantProduct, variantSelections, variantMods]);

  const addToCart = (product, label, extra, options = [], modifiers = []) => {
    const pid = prodId(product);
    const basePrice = prodPrice(product);
    const finalPrice = basePrice + extra;
    const displayName = label ? `${prodName(product)} (${label})` : prodName(product);
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === pid && item.variantLabel === label);
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
          variantLabel: label,
          options,
          modifiers
        }
      ];
    });
  };

  const handleAddClick = (product) => {
    if (hasVariants(product)) {
      openVariant(product);
    } else {
      addToCart(product, "", 0, [], []);
    }
  };

  const confirmVariant = () => {
    if (!variantProduct) return;

    // Construct structured options
    const selectedOptions = [];
    const opts = variantProduct.options || [];
    for (const group of opts) {
      const sel = variantSelections[group.id];
      if (sel) {
        const found = (group.options || []).find((o) => o.name === sel);
        selectedOptions.push({
          id: group.id,
          name: group.name,
          value: sel,
          price: found ? Number(found.price || 0) : 0
        });
      }
    }

    // Construct structured modifiers
    const selectedModifiers = [];
    const mods = variantProduct.modifiers || [];
    for (const m of mods) {
      if (variantMods.includes(m.id)) {
        selectedModifiers.push({
          id: m.id,
          name: m.name,
          price: Number(m.price || 0)
        });
      }
    }

    addToCart(variantProduct, variantLabel, variantExtraPrice, selectedOptions, selectedModifiers);
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
      prev.filter((item) => !(item.productId === productId && item.variantLabel === variantLabel))
    );
  };

  const updateItemNotes = (productId, variantLabel, note) => {
    setCart((prev) =>
      prev.map((item) =>
        item.productId === productId && item.variantLabel === variantLabel
          ? { ...item, notes: note }
          : item
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
          notes: item.notes || null,
          options: item.options || [],
          modifiers: item.modifiers || []
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
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
        <Card className="p-8 text-center max-w-sm bg-neutral-900 border-neutral-800 text-neutral-100">
          <QrCode size={48} className="mx-auto text-orange-500 mb-4" />
          <h1 className="text-xl font-bold mb-2">{t("page.customerOrder.invalidQr")}</h1>
          <p className="text-sm text-neutral-400 mb-4">{t("page.customerOrder.scanQrToOrder")}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 pb-24 font-sans antialiased">
      <div className="max-w-md mx-auto bg-neutral-900 min-h-screen shadow-2xl relative border-x border-neutral-800">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-neutral-900/90 backdrop-blur-md border-b border-neutral-800 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
              <Store size={18} />
            </div>
            <div>
              <h1 className="font-bold text-sm text-neutral-100">
                {t("page.customerOrder.title")}
              </h1>
              {tableId && (
                <p className="text-xs font-semibold text-orange-500 mt-0.5">
                  {t("page.customerOrder.tableNumber", { number: tableId })}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={() => setCartOpen(true)}
            className="relative w-10 h-10 rounded-xl bg-neutral-800 hover:bg-neutral-700 transition-colors flex items-center justify-center text-neutral-300">
            <ShoppingCart size={18} />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold border-2 border-neutral-900 animate-bounce">
                {totalItems}
              </span>
            )}
          </button>
        </header>

        {/* Search Bar */}
        <div className="px-4 pt-4">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
              size={16}
            />
            <Input
              type="text"
              placeholder="Cari makanan atau minuman..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-neutral-800 border-neutral-700 text-neutral-100 placeholder-neutral-500 pl-9 rounded-xl text-sm focus-visible:ring-orange-500"
            />
          </div>
        </div>

        {/* Category tabs */}
        <div className="px-4 py-3 overflow-x-auto no-scrollbar">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveCategory("all")}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                activeCategory === "all"
                  ? "bg-orange-500 text-white border-orange-500 shadow-lg shadow-orange-500/20"
                  : "bg-neutral-850 text-neutral-400 border-neutral-800 hover:bg-neutral-800 hover:text-white"
              }`}>
              {t("page.customerOrder.allCategory")}
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                  activeCategory === cat.id
                    ? "bg-orange-500 text-white border-orange-500 shadow-lg shadow-orange-500/20"
                    : "bg-neutral-850 text-neutral-400 border-neutral-800 hover:bg-neutral-800 hover:text-white"
                }`}>
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Menu List */}
        <main className="px-4 space-y-3 pb-8">
          {loading ? (
            <div className="space-y-3 py-8">
              {[1, 2, 3].map((n) => (
                <div key={n} className="w-full h-24 rounded-2xl bg-neutral-800 animate-pulse" />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-neutral-500 text-sm">{t("page.customerOrder.noProducts")}</p>
            </div>
          ) : (
            filteredProducts.map((product) => {
              const rating = (4.5 + (prodId(product) % 5) * 0.1).toFixed(1);
              return (
                <Card
                  key={prodId(product)}
                  className="bg-neutral-850 border-neutral-800/80 p-3 flex gap-3 items-center rounded-2xl hover:border-neutral-700 transition-all duration-300 relative group overflow-hidden">
                  {/* Image or Placeholder */}
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={prodName(product)}
                      className="w-20 h-20 rounded-xl object-cover bg-neutral-800 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 font-extrabold text-2xl flex-shrink-0 border border-orange-500/20">
                      {prodName(product).charAt(0).toUpperCase()}
                    </div>
                  )}

                  {/* Rating Badge */}
                  <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-sm text-yellow-500 text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 z-1">
                    <Star size={10} fill="currentColor" />
                    <span>{rating}</span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 pr-2">
                    <h3 className="font-bold text-neutral-100 text-sm truncate group-hover:text-orange-500 transition-colors">
                      {prodName(product)}
                    </h3>
                    {product.description && (
                      <p className="text-xs text-neutral-400 line-clamp-2 mt-1 leading-relaxed">
                        {product.description}
                      </p>
                    )}
                    <p className="text-orange-500 font-extrabold text-sm mt-2">
                      Rp{prodPrice(product).toLocaleString("id-ID")}
                    </p>
                  </div>

                  {/* Add Button */}
                  <Button
                    size="sm"
                    className="shrink-0 bg-orange-500 hover:bg-orange-600 text-white rounded-xl h-9 w-9 p-0 flex items-center justify-center shadow-lg shadow-orange-500/25 transition-transform active:scale-95"
                    onClick={() => handleAddClick(product)}>
                    <Plus size={16} />
                  </Button>
                </Card>
              );
            })
          )}
        </main>

        {/* Floating Cart Bottom Bar */}
        {cart.length > 0 && (
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-neutral-900 via-neutral-900 to-transparent pointer-events-none z-10">
            <button
              onClick={() => setCartOpen(true)}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white shadow-xl shadow-orange-500/30 p-3 rounded-2xl flex items-center justify-between pointer-events-auto transition-transform active:scale-98">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <ShoppingCart size={18} />
                <span>
                  {totalItems} {t("page.customerOrder.items")}
                </span>
                <span className="opacity-50">|</span>
                <span>Rp{totalPrice.toLocaleString("id-ID")}</span>
              </div>
              <span className="text-xs font-bold bg-white/20 px-3 py-1 rounded-xl">
                {t("page.customerOrder.viewCart")}
              </span>
            </button>
          </div>
        )}

        {/* Cart Dialog */}
        <Dialog open={cartOpen} onOpenChange={setCartOpen}>
          <DialogContent className="sm:max-w-sm max-h-[85vh] flex flex-col bg-neutral-900 border-neutral-800 text-neutral-100 rounded-3xl p-6">
            <DialogHeader className="pb-3 border-b border-neutral-800">
              <DialogTitle className="text-lg font-bold text-neutral-100 flex items-center gap-2">
                <ShoppingCart size={18} className="text-orange-500" />
                {t("page.customerOrder.cartTitle")}
              </DialogTitle>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto space-y-4 py-4 pr-1 scrollbar-thin">
              <div>
                <label className="text-xs font-semibold text-neutral-400 mb-1.5 block">
                  Identitas Pemesan
                </label>
                <Input
                  placeholder={t("page.customerOrder.namePlaceholder")}
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="bg-neutral-800 border-neutral-700 text-neutral-100 placeholder-neutral-500 rounded-xl text-sm focus-visible:ring-orange-500"
                />
              </div>

              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-neutral-500 text-sm">{t("page.customerOrder.emptyCart")}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div
                      key={item.productId + (item.variantLabel || "")}
                      className="bg-neutral-850 border border-neutral-800/80 p-3 rounded-2xl space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="truncate font-bold text-sm text-neutral-100">
                            {item.productName}
                          </p>
                          <p className="text-xs text-orange-500 font-extrabold mt-0.5">
                            Rp{item.price.toLocaleString("id-ID")}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-neutral-500 hover:text-red-400 hover:bg-neutral-800 rounded-lg"
                          onClick={() => removeItem(item.productId, item.variantLabel)}>
                          <X size={14} />
                        </Button>
                      </div>

                      {/* Item Notes Input */}
                      <div className="relative">
                        <MessageSquare
                          size={12}
                          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-500"
                        />
                        <Input
                          type="text"
                          placeholder="Tambahkan catatan (kurang es, pedas)..."
                          value={item.notes || ""}
                          onChange={(e) =>
                            updateItemNotes(item.productId, item.variantLabel, e.target.value)
                          }
                          className="h-7 bg-neutral-800 border-neutral-750 text-neutral-300 placeholder-neutral-500 pl-7 text-[10px] rounded-lg focus-visible:ring-orange-500"
                        />
                      </div>

                      {/* Quantity Controller */}
                      <div className="flex items-center justify-end gap-1.5 pt-1">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7 bg-neutral-800 border-neutral-700 text-neutral-300 hover:bg-neutral-700 rounded-lg"
                          onClick={() => updateQty(item.productId, item.variantLabel, -1)}>
                          <Minus size={12} />
                        </Button>
                        <span className="w-8 text-center text-xs font-bold text-neutral-100">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7 bg-neutral-800 border-neutral-700 text-neutral-300 hover:bg-neutral-700 rounded-lg"
                          onClick={() => updateQty(item.productId, item.variantLabel, 1)}>
                          <Plus size={12} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Separator className="bg-neutral-800" />

            <div className="pt-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
                  {t("page.customerOrder.total")}
                </p>
                <p className="font-extrabold text-orange-500 text-xl mt-0.5">
                  Rp{totalPrice.toLocaleString("id-ID")}
                </p>
              </div>
              <Button
                onClick={placeOrder}
                disabled={submitting || cart.length === 0}
                className="bg-orange-500 hover:bg-orange-600 text-white rounded-2xl px-5 h-12 shadow-lg shadow-orange-500/20 font-bold gap-1.5">
                <Send size={16} />
                {submitting ? t("page.customerOrder.submitting") : t("page.customerOrder.order")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Variant modal */}
        <Dialog open={!!variantProduct} onOpenChange={(o) => !o && setVariantProduct(null)}>
          <DialogContent className="sm:max-w-sm bg-neutral-900 border-neutral-800 text-neutral-100 rounded-3xl p-6">
            <DialogHeader className="pb-3 border-b border-neutral-800">
              <DialogTitle className="text-base font-bold text-neutral-100">
                {variantProduct ? prodName(variantProduct) : ""}
              </DialogTitle>
              <DialogDescription className="text-xs text-neutral-400">
                {t("page.customerOrder.chooseVariant")}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4 max-h-[50vh] overflow-y-auto pr-1">
              {(variantProduct?.options || []).map((group) => (
                <div key={group.id} className="space-y-1.5">
                  <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                    {group.name}
                  </p>
                  <div className="grid grid-cols-1 gap-2">
                    {(group.options || []).map((opt) => {
                      const active = variantSelections[group.id] === opt.name;
                      return (
                        <button
                          key={opt.name}
                          onClick={() => selectOption(group.id, opt.name)}
                          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                            active
                              ? "border-orange-500 bg-orange-500/10 text-orange-500 shadow-md shadow-orange-500/5"
                              : "border-neutral-800 bg-neutral-850 hover:bg-neutral-800 text-neutral-350"
                          }`}>
                          <span>{opt.name}</span>
                          {Number(opt.price) > 0 && (
                            <span className="text-[10px] opacity-70">
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
                <div className="space-y-1.5">
                  <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                    {t("page.customerOrder.addOns")}
                  </p>
                  <div className="grid grid-cols-1 gap-2">
                    {(variantProduct.modifiers || []).map((mod) => {
                      const active = variantMods.includes(mod.id);
                      return (
                        <button
                          key={mod.id}
                          onClick={() => toggleMod(mod.id)}
                          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                            active
                              ? "border-orange-500 bg-orange-500/10 text-orange-500 shadow-md shadow-orange-500/5"
                              : "border-neutral-800 bg-neutral-850 hover:bg-neutral-800 text-neutral-350"
                          }`}>
                          <span>{mod.name}</span>
                          <span className="text-[10px] opacity-70">
                            +Rp{Number(mod.price).toLocaleString("id-ID")}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-neutral-800">
              <div>
                <p className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider">
                  Harga Kustom
                </p>
                <p className="font-extrabold text-orange-500 text-lg mt-0.5">
                  Rp{(prodPrice(variantProduct) + variantExtraPrice).toLocaleString("id-ID")}
                </p>
              </div>
              <Button
                onClick={confirmVariant}
                className="bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-bold h-11 px-5 shadow-lg shadow-orange-500/20">
                {t("page.customerOrder.addToCart")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Success dialog */}
        <Dialog open={!!successOrder} onOpenChange={(o) => !o && setSuccessOrder(null)}>
          <DialogContent className="sm:max-w-sm text-center bg-neutral-900 border-neutral-800 text-neutral-100 rounded-3xl p-6">
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/20 text-green-500">
                <CheckCircle size={36} />
              </div>
              <DialogTitle className="text-xl font-bold text-neutral-100">
                {t("page.customerOrder.successModalTitle")}
              </DialogTitle>
              <DialogDescription className="text-sm text-neutral-400">
                {t("page.customerOrder.successModalDesc", { orderNumber: successOrder })}
              </DialogDescription>
              <Button
                className="mt-2 bg-green-600 hover:bg-green-700 text-white rounded-2xl w-full font-bold h-11 shadow-lg shadow-green-500/10"
                onClick={() => setSuccessOrder(null)}>
                {t("page.customerOrder.successModalConfirm")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default CustomerOrder;
