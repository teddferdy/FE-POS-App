import React, { useState, useEffect, useMemo } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Minus, ShoppingCart, Info } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { axiosInstance } from "@/services";
import { addItem } from "./cartStore";

const VAR_SEPARATOR = " • ";

const Detail = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const storeId = searchParams.get("store");
  const tableId = searchParams.get("table");

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [variantSelections, setVariantSelections] = useState({});
  const [variantMods, setVariantMods] = useState([]);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!storeId || !id) return;
    axiosInstance
      .get(`/order/customer-menu?store=${storeId}`)
      .then((res) => {
        const p = (res.data?.data?.products || []).find(
          (x) => String(x.id || x.productId) === String(id)
        );
        setProduct(p || null);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id, storeId]);

  const prodName = (p) => p?.name || p?.nameProduct || "-";
  const prodPrice = (p) => Number(p?.sellingPrice || p?.price || 0);

  // const hasVariants = (p) =>
  //   p?.options?.length || p?.modifiers?.length || p?.isOption || p?.hasModifiers;

  const selectOption = (groupId, optionName) =>
    setVariantSelections((prev) => ({ ...prev, [groupId]: optionName }));

  const toggleMod = (modId) =>
    setVariantMods((prev) =>
      prev.includes(modId) ? prev.filter((m) => m !== modId) : [...prev, modId]
    );

  const extraPrice = useMemo(() => {
    if (!product) return 0;
    let extra = 0;
    for (const group of product.options || []) {
      const sel = variantSelections[group.id];
      if (sel) {
        const found = (group.options || []).find((o) => o.name === sel);
        extra += Number(found?.price || 0);
      }
    }
    for (const m of product.modifiers || []) {
      if (variantMods.includes(m.id)) extra += Number(m.price || 0);
    }
    return extra;
  }, [product, variantSelections, variantMods]);

  const variantLabel = useMemo(() => {
    if (!product) return "";
    const parts = [];
    for (const group of product.options || []) {
      const sel = variantSelections[group.id];
      if (sel) parts.push(sel);
    }
    for (const m of product.modifiers || []) {
      if (variantMods.includes(m.id)) parts.push(m.name);
    }
    return parts.join(VAR_SEPARATOR);
  }, [product, variantSelections, variantMods]);

  const handleAdd = () => {
    if (!product) return;

    const selectedOptions = [];
    for (const group of product.options || []) {
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
    const selectedModifiers = [];
    for (const m of product.modifiers || []) {
      if (variantMods.includes(m.id)) {
        selectedModifiers.push({ id: m.id, name: m.name, price: Number(m.price || 0) });
      }
    }
    const unitPrice = prodPrice(product) + extraPrice;
    addItem({
      productId: product.id || product.productId,
      productName: variantLabel ? `${prodName(product)} (${variantLabel})` : prodName(product),
      price: unitPrice,
      quantity: qty,
      notes,
      variantLabel,
      options: selectedOptions,
      modifiers: selectedModifiers,
      image: product.image || null
    });
    toast.success(t("page.customerOrder.addToCart"), {
      description: `${qty}x ${prodName(product)}`
    });
    navigate(`/customer-order/cart?store=${storeId}&table=${tableId || ""}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <p className="text-on-surface-variant">{t("page.customerOrder.noProducts")}</p>
      </div>
    );
  }

  const unitPrice = prodPrice(product) + extraPrice;
  const totalPrice = unitPrice * qty;

  return (
    <div className="min-h-screen bg-background text-on-background font-sans antialiased pb-28">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-surface border-b border-outline-variant flex items-center justify-between px-4 h-14">
        <button onClick={() => navigate(-1)} className="active:scale-95 transition-transform p-1">
          <ArrowLeft size={24} className="text-primary" />
        </button>
        <h1 className="font-bold text-sm text-primary">{prodName(product)}</h1>
        <button className="active:scale-95 transition-transform p-1">
          <Info size={20} className="text-outline" />
        </button>
      </header>

      <main className="pt-14">
        {/* Hero Image */}
        <section className="relative w-full h-64 overflow-hidden bg-surface-container">
          {product.image ? (
            <img
              src={product.image}
              alt={prodName(product)}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-primary font-bold text-4xl bg-surface-container-high">
              {prodName(product).charAt(0)}
            </div>
          )}
          <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/50 to-transparent">
            <div className="flex justify-between items-end">
              <h2 className="text-xl font-bold text-white">{prodName(product)}</h2>
              <span className="font-bold text-lg text-white">
                Rp{prodPrice(product).toLocaleString("id-ID")}
              </span>
            </div>
          </div>
        </section>

        <div className="px-4 py-4 space-y-5">
          {/* Description */}
          {product.description && (
            <section>
              <h3 className="font-bold text-sm text-on-surface mb-1">Description</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                {product.description}
              </p>
            </section>
          )}

          {/* Options (radio) */}
          {(product.options || []).map((group) => (
            <section key={group.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-on-surface">{group.name}</h3>
                <span className="text-[10px] font-bold text-primary bg-primary-container/20 px-2 py-0.5 rounded">
                  REQUIRED
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {(group.options || []).map((opt) => {
                  const active = variantSelections[group.id] === opt.name;
                  return (
                    <button
                      key={opt.name}
                      onClick={() => selectOption(group.id, opt.name)}
                      className={`flex items-center justify-center px-3 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                        active
                          ? "bg-primary text-on-primary border-primary"
                          : "bg-surface-container-lowest text-on-surface-variant border-outline-variant hover:border-primary"
                      }`}>
                      {opt.name}
                      {Number(opt.price) > 0 && (
                        <span className="ml-1 opacity-70">
                          +{Number(opt.price).toLocaleString("id-ID")}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </section>
          ))}

          {/* Modifiers (checkbox) */}
          {(product.modifiers || []).length > 0 && (
            <section className="space-y-2">
              <h3 className="font-bold text-sm text-on-surface">
                {t("page.customerOrder.addOns")}
              </h3>
              <div className="space-y-1.5">
                {(product.modifiers || []).map((mod) => {
                  const active = variantMods.includes(mod.id);
                  return (
                    <label
                      key={mod.id}
                      onClick={() => toggleMod(mod.id)}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                        active
                          ? "bg-primary-container/10 border-primary"
                          : "bg-surface-container-low border-transparent hover:border-outline-variant"
                      }`}>
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={active}
                          onChange={() => {}}
                          className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary"
                        />
                        <span className="text-sm">{mod.name}</span>
                      </div>
                      <span className="text-xs text-on-surface-variant">
                        +Rp{Number(mod.price).toLocaleString("id-ID")}
                      </span>
                    </label>
                  );
                })}
              </div>
            </section>
          )}

          {/* Notes */}
          <section className="space-y-2">
            <h3 className="font-bold text-sm text-on-surface">
              {t("page.customerOrder.specialInstructions")}
            </h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="E.g. No onions, sauce on the side..."
              className="w-full p-3 bg-surface-container-lowest border border-outline-variant rounded-xl text-sm focus:ring-primary focus:border-primary h-20 placeholder:text-outline-variant resize-none outline-none"
            />
          </section>
        </div>
      </main>

      {/* Bottom bar */}
      <footer className="fixed bottom-0 w-full z-50 bg-surface shadow-[0_-4px_12px_0_rgba(0,0,0,0.08)]">
        <div className="px-4 h-20 flex items-center gap-3 max-w-lg mx-auto">
          <div className="flex items-center bg-surface-container-high rounded-full h-11 px-1">
            <button
              onClick={() => setQty(Math.max(1, qty - 1))}
              className="w-10 h-full flex items-center justify-center text-primary active:scale-90 transition-transform">
              <Minus size={18} />
            </button>
            <span className="w-8 text-center font-bold text-on-surface">{qty}</span>
            <button
              onClick={() => setQty(qty + 1)}
              className="w-10 h-full flex items-center justify-center text-primary active:scale-90 transition-transform">
              <Plus size={18} />
            </button>
          </div>
          <Button
            onClick={handleAdd}
            className="flex-1 bg-primary hover:bg-primary-container text-on-primary h-11 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all">
            <ShoppingCart size={18} />
            <span>{t("page.customerOrder.addToCart")}</span>
            <span className="ml-auto">Rp{totalPrice.toLocaleString("id-ID")}</span>
          </Button>
        </div>
      </footer>
    </div>
  );
};

export default Detail;
