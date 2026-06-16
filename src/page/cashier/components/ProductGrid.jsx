/* eslint-disable react/prop-types */
import React, { useState, useRef, useEffect } from "react";
import { useQuery } from "react-query";
import { Search, Barcode, Package } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Loading } from "@/components/ui/loading";
import { getAllCategoryActive } from "@/services/category";
import { lookupBarcode } from "@/services/product";
import { orderList } from "@/state/order-list";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { formatCurrencyRupiah } from "@/utils/formatter-currency";
import VariantModal from "./VariantModal";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.04 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 12, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", damping: 20, stiffness: 260 }
  }
};

const ProductGrid = ({
  products,
  isLoading,
  search,
  onSearchChange,
  barcode,
  onBarcodeChange,
  categoryId,
  onCategoryChange,
  store
}) => {
  const { t } = useTranslation();
  const cart = orderList();
  const barcodeRef = useRef(null);
  const [variantProduct, setVariantProduct] = useState(null);

  const { data: categoriesData } = useQuery(
    ["categories-active", store],
    () => getAllCategoryActive({ location: store }),
    { enabled: !!store }
  );

  const categories = categoriesData?.data || categoriesData || [];

  useEffect(() => {
    if (barcodeRef.current) {
      barcodeRef.current.focus();
    }
  }, []);

  const handleBarcodeLookup = async (value) => {
    try {
      const result = await lookupBarcode(value);
      const product = result?.data || result?.product || result;
      if (product) {
        addToCart(product);
        onBarcodeChange("");
      }
    } catch {
      onBarcodeChange("");
    }
  };

  const addToCart = (product) => {
    const hasOptions = product.options && product.options.length > 0;
    if (hasOptions) {
      setVariantProduct(product);
      return;
    }
    const price = Number(product.price || product.harga || 0);
    const productName =
      product.nameProduct || product.name || t("page.cashier.product.defaultName");
    const existing = cart.order.find((item) => item.id === (product.id || product._id));
    if (existing) {
      cart.incrementOrder(existing);
    } else {
      cart.addingProduct({
        id: product.id || product._id,
        name: productName,
        price,
        count: 1,
        totalPrice: price,
        image: product.image || null,
        unit: product.unit || "",
        sku: product.sku || "",
        point: product.point || 0,
        redeemPoints: product.redeemPoints || 0
      });
    }
    toast.success(t("page.cashier.product.addedToCart", { name: productName }));
  };

  const handleAddVariants = (product, selectedOptions) => {
    const basePrice = Number(product.price || product.harga || 0);
    const optionLabels = selectedOptions.map((o) => o.name).join(", ");
    const optionPrice = selectedOptions.reduce((sum, o) => sum + Number(o.price || 0), 0);
    const totalPrice = basePrice + optionPrice;
    const key = `${product.id || product._id}-${selectedOptions.map((o) => o.name).join("-")}`;
    const productName = `${product.nameProduct || product.name} (${optionLabels})`;
    const existing = cart.order.find((item) => item.cartKey === key);
    if (existing) {
      cart.incrementOrder(existing);
    } else {
      cart.addingProduct({
        id: product.id || product._id,
        cartKey: key,
        name: product.nameProduct || product.name,
        price: totalPrice,
        count: 1,
        totalPrice,
        image: product.image || null,
        unit: product.unit || "",
        options: selectedOptions,
        point: product.point || 0,
        redeemPoints: product.redeemPoints || 0
      });
    }
    toast.success(t("page.cashier.product.addedToCart", { name: productName }));
    setVariantProduct(null);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 lg:p-4 border-b border-border/50 space-y-2 shrink-0 bg-background/40 backdrop-blur-sm">
        <div className="flex gap-2">
          <div className="relative flex-1 group">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 group-focus-within:text-primary transition-colors"
            />
            <Input
              placeholder={t("page.cashier.search")}
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 h-9 text-sm bg-muted/50 backdrop-blur-sm border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all duration-300 rounded-xl"
            />
          </div>
          <div className="relative w-40 group">
            <Barcode
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 group-focus-within:text-primary transition-colors"
            />
            <Input
              ref={barcodeRef}
              placeholder={t("page.cashier.barcode")}
              value={barcode}
              onChange={(e) => onBarcodeChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && barcode.trim()) {
                  handleBarcodeLookup(barcode.trim());
                }
              }}
              className="pl-9 h-9 text-sm bg-muted/50 backdrop-blur-sm border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all duration-300 rounded-xl"
            />
          </div>
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onCategoryChange("")}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 ${
              !categoryId
                ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground border-primary/50 shadow-md shadow-primary/20"
                : "border-border/50 text-muted-foreground hover:bg-accent/50 hover:border-foreground/20 bg-muted/30 backdrop-blur-sm"
            }`}>
            {t("common.all")}
          </motion.button>
          {categories.map((cat) => (
            <motion.button
              key={cat.id || cat._id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onCategoryChange(cat.id || cat._id)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 ${
                categoryId === (cat.id || cat._id)
                  ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground border-primary/50 shadow-md shadow-primary/20"
                  : "border-border/50 text-muted-foreground hover:bg-accent/50 hover:border-foreground/20 bg-muted/30 backdrop-blur-sm"
              }`}>
              {cat.name}
            </motion.button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 lg:p-4">
        {isLoading ? (
          <Loading fullscreen={false} />
        ) : products.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <div className="w-20 h-20 rounded-2xl bg-muted/50 backdrop-blur-sm border border-border/30 flex items-center justify-center mb-3">
              <Package size={36} className="opacity-30" />
            </div>
            <p className="text-sm">{t("page.cashier.product.notFound")}</p>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
            <AnimatePresence mode="popLayout">
              {products.map((product) => {
                const pid = product.id || product._id;
                const imageUrl = product.image || (product.images && product.images[0]) || null;
                const productName =
                  product.nameProduct || product.name || t("page.cashier.product.defaultName");
                const productPrice = Number(product.price || product.harga || 0);
                const stock = product.stock ?? product.quantity ?? null;
                const hasOptions = product.options && product.options.length > 0;

                return (
                  <motion.button
                    key={pid}
                    variants={itemVariants}
                    layout
                    whileHover={{ y: -4, boxShadow: "0 8px 30px rgba(0,0,0,0.08)" }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => addToCart(product)}
                    className="group text-left bg-card/70 backdrop-blur-sm border border-border/50 rounded-2xl overflow-hidden hover:border-primary/30 hover:bg-card/90 transition-all duration-300 relative">
                    <div className="aspect-square bg-gradient-to-br from-muted/80 to-muted/40 relative overflow-hidden">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={productName}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5">
                          <Package size={36} className="text-muted-foreground/20" />
                        </div>
                      )}
                      {stock !== null && stock <= 0 && (
                        <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center">
                          <motion.span
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="text-white text-xs font-semibold bg-gradient-to-r from-red-600 to-red-500 px-3 py-1 rounded-full shadow-lg">
                            {t("page.cashier.product.outOfStock")}
                          </motion.span>
                        </div>
                      )}
                      {hasOptions && (
                        <div className="absolute top-2 right-2">
                          <span className="text-[10px] font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-white px-2 py-0.5 rounded-full shadow-md">
                            {t("page.cashier.product.variant")}
                          </span>
                        </div>
                      )}
                      {!hasOptions && stock !== 0 && (
                        <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/0 group-hover:ring-primary/20 transition-all duration-300" />
                      )}
                    </div>
                    <div className="p-2.5 space-y-1">
                      <p className="text-xs font-medium line-clamp-2 leading-tight min-h-[2em] text-foreground/90">
                        {productName}
                      </p>
                      <p className="text-sm font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                        {formatCurrencyRupiah(productPrice)}
                      </p>
                      {stock !== null && (
                        <p className="text-[10px] text-muted-foreground/70">
                          {t("page.cashier.product.stock")}: {stock}
                        </p>
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {variantProduct && (
          <VariantModal
            product={variantProduct}
            onConfirm={handleAddVariants}
            onClose={() => setVariantProduct(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductGrid;
