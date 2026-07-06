import React, { useState, useMemo, useCallback } from "react";
import PropTypes from "prop-types";
import { Search, Barcode, Grid3X3, List, Tag, Package, Loader2, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useCookies } from "react-cookie";
import { useQuery } from "react-query";
import { orderList } from "@/state/order-list";
import { getAllCategoryActive } from "@/services/category";
import { optimizeImage } from "@/utils/image";
import VariantModal from "./VariantModal";

const ProductGrid = ({
  products: propProducts,
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
  const [cookie] = useCookies();
  const [viewMode, setViewMode] = useState("grid");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [inputMode, setInputMode] = useState("search");
  const cart = orderList();

  const { data: categoriesData } = useQuery(
    ["categories-cashier", store],

    () => getAllCategoryActive({ location: store }),

    { enabled: !!store, staleTime: 3 * 60 * 1000 }
  );
  const categories = categoriesData?.data || categoriesData || [];

  const products = propProducts || [];

  const formatPrice = (value) => {
    if (value == null || isNaN(value)) return "0";
    return Number(value).toLocaleString("id-ID");
  };

  const getCatId = useCallback((product) => {
    const raw =
      product.category?.id ??
      product.category?._id ??
      product.category ??
      product.categoryId?.id ??
      product.categoryId?._id ??
      "";
    if (typeof raw === "string") {
      try {
        return JSON.parse(raw).id;
      } catch {
        return raw;
      }
    }
    return raw;
  }, []);

  const productsByCategory = useMemo(() => {
    const catMap = {};
    categories?.forEach((cat) => {
      catMap[cat.id || cat._id] = cat;
    });
    const groups = {};
    products.forEach((p) => {
      const catId = getCatId(p);
      if (!groups[catId]) groups[catId] = { category: catMap[catId] || null, products: [] };
      groups[catId].products.push(p);
    });
    if (!categories?.length) return Object.values(groups);
    return categories.map((cat) => {
      const catId = cat.id || cat._id;
      return groups[catId] || { category: cat, products: [] };
    });
  }, [categories, products, getCatId]);

  const hasChoices = useCallback((product) => {
    if (product.variant && Array.isArray(product.variant) && product.variant.length > 0)
      return true;
    if (
      product.isOption &&
      product.options &&
      Array.isArray(product.options) &&
      product.options.length > 0
    )
      return true;
    if (
      product.hasModifiers &&
      product.modifiers &&
      Array.isArray(product.modifiers) &&
      product.modifiers.length > 0
    )
      return true;
    return false;
  }, []);

  const handleProductClick = useCallback(
    (product) => {
      if (hasChoices(product)) {
        setSelectedProduct(product);
        setShowVariantModal(true);
      } else {
        cart.addOrder(product, store);
      }
    },
    [cart, store, hasChoices]
  );

  const handleAddToCart = useCallback(
    (product, choice = null) => {
      if (choice) {
        const variantProduct = {
          ...product,
          variantName: choice.label || choice.nameVariant || choice.name,
          price: choice.price || product.price,
          totalPrice: choice.price || product.price,
          image: choice.image || product.image || product.imageProduct,
          ID: product.ID || product.id,
          idProduct: product.idProduct || product.id
        };
        cart.addOrder(variantProduct, store);
      } else {
        cart.addOrder(product, store);
      }
      setShowVariantModal(false);
      setSelectedProduct(null);
    },
    [cart, store]
  );

  const randomColors = useMemo(() => {
    const colors = [
      "from-primary/20 to-primary/5",
      "from-secondary/20 to-secondary/5",
      "from-emerald-500/20 to-emerald-500/5",
      "from-violet-500/20 to-violet-500/5",
      "from-amber-500/20 to-amber-500/5",
      "from-rose-500/20 to-rose-500/5",
      "from-cyan-500/20 to-cyan-500/5",
      "from-orange-500/20 to-orange-500/5"
    ];
    return (id) => colors[(id || 0) % colors.length];
  }, []);

  const getCartCount = useCallback(
    (productId) => {
      const item = cart.order.find((item) => item.idProduct === productId || item.id === productId);
      return item?.count || 0;
    },
    [cart.order]
  );

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={40} className="mx-auto text-primary animate-spin mb-3" />
          <p className="text-muted-foreground font-medium">{t("page.cashier.loadingProducts")}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center gap-3 px-4 lg:px-6 pt-4 pb-3">
        <div className="flex items-center gap-2 bg-muted/50 rounded-xl p-0.5 border border-border/40">
          <button
            onClick={() => setInputMode("search")}
            className={`p-1.5 rounded-lg transition-all ${
              inputMode === "search"
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}>
            <Search size={16} />
          </button>
          <button
            onClick={() => setInputMode("barcode")}
            className={`p-1.5 rounded-lg transition-all ${
              inputMode === "barcode"
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}>
            <Barcode size={16} />
          </button>
        </div>

        <div className="flex-1 relative">
          {inputMode === "search" ? (
            <>
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={t("page.cashier.searchPlaceholder")}
                className="w-full h-10 pl-9 pr-4 text-sm rounded-xl bg-accent/50 border border-border/60 outline-none focus:border-primary/50 transition-colors"
              />
              {search && (
                <button
                  onClick={() => onSearchChange("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  <X size={14} />
                </button>
              )}
            </>
          ) : (
            <>
              <Barcode
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <input
                type="text"
                value={barcode}
                onChange={(e) => onBarcodeChange(e.target.value)}
                placeholder={t("page.cashier.barcodePlaceholder")}
                className="w-full h-10 pl-9 pr-4 text-sm rounded-xl bg-accent/50 border border-border/60 outline-none focus:border-primary/50 transition-colors font-mono tracking-wider"
              />
              {barcode && (
                <button
                  onClick={() => onBarcodeChange("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  <X size={14} />
                </button>
              )}
            </>
          )}
        </div>

        <div className="flex items-center gap-1 bg-muted/50 rounded-xl p-0.5 border border-border/40">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-1.5 rounded-lg transition-all ${
              viewMode === "grid"
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}>
            <Grid3X3 size={16} />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-1.5 rounded-lg transition-all ${
              viewMode === "list"
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}>
            <List size={16} />
          </button>
        </div>
      </div>

      {categories.length > 0 && (
        <div className="flex items-center gap-2 px-4 lg:px-6 pb-2 overflow-x-auto scrollbar-none">
          <button
            onClick={() => onCategoryChange("")}
            className={`shrink-0 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
              !categoryId
                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                : "bg-card border-border/60 text-muted-foreground hover:border-border hover:text-foreground"
            }`}>
            {t("page.cashier.allCategories")}
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id || cat._id}
              onClick={() => onCategoryChange(cat.id || cat._id)}
              className={`shrink-0 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                categoryId === (cat.id || cat._id)
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-card border-border/60 text-muted-foreground hover:border-border hover:text-foreground"
              }`}>
              {cat.nameCategory || cat.name}
            </button>
          ))}
        </div>
      )}

      <div className="flex-1 overflow-y-auto pb-4">
        {!products.length ? (
          <div className="flex items-center justify-center h-full px-4 lg:px-6">
            <div className="text-center">
              {!store ? (
                <>
                  <div className="w-16 h-16 rounded-2xl bg-muted/50 border border-border/50 flex items-center justify-center mx-auto mb-3">
                    <Package size={32} className="text-muted-foreground/40" />
                  </div>
                  <p className="font-medium text-muted-foreground">{t("page.cashier.noStore")}</p>
                  <p className="text-sm text-muted-foreground/60 mt-1">
                    {t("page.cashier.noStoreDesc")}
                  </p>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-2xl bg-muted/50 border border-border/50 flex items-center justify-center mx-auto mb-3">
                    <Package size={32} className="text-muted-foreground/40" />
                  </div>
                  <p className="font-medium text-muted-foreground">
                    {t("page.cashier.noProducts")}
                  </p>
                  <p className="text-sm text-muted-foreground/60 mt-1">
                    {t("page.cashier.noProductsDesc")}
                  </p>
                </>
              )}
            </div>
          </div>
        ) : (
          productsByCategory.map(({ category, products: catProducts }) => (
            <div key={category?.id || category?._id} className="mb-6">
              <div className="px-4 lg:px-6 py-3 border-b border-border/40">
                <h3 className="text-sm font-semibold text-foreground">
                  {category?.nameCategory || category?.name || "Uncategorized"}
                </h3>
              </div>
              {catProducts.length > 0 ? (
                viewMode === "grid" ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 px-4 lg:px-6 pt-3">
                    {catProducts.map((product, idx) => {
                      const img = product.image || product.imageProduct || product.photo || null;
                      const productId =
                        product.id || product.ID || product.idProduct || product._id;
                      const cartCount = getCartCount(productId);
                      return (
                        <button
                          key={productId || idx}
                          onClick={() => handleProductClick(product)}
                          className="group bg-card/80 backdrop-blur-sm border border-border/40 rounded-xl p-3 hover:border-border/80 hover:shadow-md hover:bg-card transition-all duration-200 text-left active:scale-[0.98]">
                          <div className="relative mb-2.5">
                            {img ? (
                              <div className="w-full aspect-square rounded-lg overflow-hidden bg-muted/50">
                                <img
                                  src={optimizeImage(img) || "/placeholder.svg"}
                                  alt={product.nameProduct || product.name || ""}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  onError={(e) => {
                                    e.target.style.display = "none";
                                    e.target.parentElement.classList.add(
                                      "flex",
                                      "items-center",
                                      "justify-center"
                                    );
                                    const fallback = document.createElement("span");
                                    fallback.className =
                                      "text-2xl font-bold text-muted-foreground/30";
                                    fallback.textContent =
                                      (product.nameProduct ||
                                        product.name ||
                                        "?")[0]?.toUpperCase() || "?";
                                    e.target.parentElement.appendChild(fallback);
                                  }}
                                />
                              </div>
                            ) : (
                              <div
                                className={`w-full aspect-square rounded-lg bg-gradient-to-br ${randomColors(idx)} border border-border/30 flex items-center justify-center relative`}>
                                <Package size={28} className="text-muted-foreground/30" />
                              </div>
                            )}
                            {cartCount > 0 && (
                              <div className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-primary shadow-lg shadow-primary/30 flex items-center justify-center z-10">
                                <span className="text-primary-foreground text-[10px] font-bold">
                                  {cartCount}
                                </span>
                              </div>
                            )}
                            {!product.isAvailable && (
                              <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] rounded-lg flex items-center justify-center">
                                <span className="text-[10px] font-bold text-white bg-destructive/90 px-2 py-1 rounded-md uppercase tracking-wider">
                                  {t("page.cashier.product.notFound")}
                                </span>
                              </div>
                            )}
                            {product.stock !== undefined &&
                              Number(product.stock) <= 0 &&
                              product.isAvailable !== false && (
                                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] rounded-lg flex items-center justify-center">
                                  <span className="text-[10px] font-bold text-white bg-destructive/90 px-2 py-1 rounded-md uppercase tracking-wider">
                                    {t("page.cashier.product.outOfStock")}
                                  </span>
                                </div>
                              )}
                            <div className="absolute top-1.5 left-1.5 flex flex-col gap-1">
                              {hasChoices(product) && (
                                <span className="px-1.5 py-0.5 rounded-md bg-amber-500/90 backdrop-blur-sm shadow-sm">
                                  <span className="text-[9px] font-bold text-white uppercase tracking-wider flex items-center gap-0.5">
                                    <Tag size={8} />
                                    {t("page.cashier.variant")}
                                  </span>
                                </span>
                              )}
                              {product.point > 0 && (
                                <span className="px-1.5 py-0.5 rounded-md bg-violet-500/90 backdrop-blur-sm shadow-sm">
                                  <span className="text-[9px] font-bold text-white flex items-center gap-0.5">
                                    {product.point} pts
                                  </span>
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-foreground leading-tight line-clamp-2 min-h-[2em]">
                              {product.nameProduct ||
                                product.name ||
                                t("page.cashier.unnamedProduct")}
                            </p>
                            {product.brand && (
                              <p className="text-[10px] text-muted-foreground/60 truncate">
                                {product.brand}
                              </p>
                            )}
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-bold text-primary">
                                Rp {formatPrice(product.price || product.sellPrice || 0)}
                              </p>
                              {product.stock !== undefined &&
                                Number(product.stock) > 0 &&
                                Number(product.stock) <= Number(product.minStock) && (
                                  <span className="text-[9px] text-amber-500 font-semibold">
                                    {t("page.cashier.stock")} {product.stock}
                                  </span>
                                )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="space-y-2 px-4 lg:px-6 pt-3">
                    {catProducts.map((product, idx) => {
                      const img = product.image || product.imageProduct || product.photo || null;
                      const productId =
                        product.id || product.ID || product.idProduct || product._id;
                      const cartCount = getCartCount(productId);
                      return (
                        <button
                          key={productId || idx}
                          onClick={() => handleProductClick(product)}
                          className="w-full group flex items-center gap-3 bg-card/80 backdrop-blur-sm border border-border/40 rounded-xl p-3 hover:border-border/80 hover:shadow-sm hover:bg-card transition-all duration-200 text-left active:scale-[0.99]">
                          {img ? (
                            <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-muted/50">
                              <img
                                src={optimizeImage(img) || "/placeholder.svg"}
                                alt={product.nameProduct || product.name || ""}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = "none";
                                  e.target.parentElement.classList.add(
                                    "flex",
                                    "items-center",
                                    "justify-center"
                                  );
                                  const fallback = document.createElement("span");
                                  fallback.className = "text-lg font-bold text-muted-foreground/30";
                                  fallback.textContent =
                                    (product.nameProduct ||
                                      product.name ||
                                      "?")[0]?.toUpperCase() || "?";
                                  e.target.parentElement.appendChild(fallback);
                                }}
                              />
                            </div>
                          ) : (
                            <div
                              className={`w-12 h-12 rounded-lg bg-gradient-to-br ${randomColors(idx)} border border-border/30 flex items-center justify-center shrink-0`}>
                              <Package size={20} className="text-muted-foreground/30" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="text-sm font-medium text-foreground truncate">
                                {product.nameProduct ||
                                  product.name ||
                                  t("page.cashier.unnamedProduct")}
                              </p>
                              {hasChoices(product) && (
                                <span className="px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-500 text-[9px] font-bold uppercase tracking-wider shrink-0">
                                  <Tag size={8} className="inline mr-0.5" />
                                  {t("page.cashier.variant")}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground/60 truncate">
                              {product.sku || ""}
                            </p>
                          </div>
                          {cartCount > 0 && (
                            <div className="w-6 h-6 rounded-full bg-primary shadow-sm flex items-center justify-center shrink-0">
                              <span className="text-primary-foreground text-[10px] font-bold">
                                {cartCount}
                              </span>
                            </div>
                          )}
                          <p className="text-sm font-bold text-primary shrink-0">
                            Rp {formatPrice(product.price || product.sellPrice || 0)}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                )
              ) : (
                <div className="px-4 lg:px-6 pt-3">
                  <p className="text-sm text-muted-foreground/60 italic">Produk belum ada</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {showVariantModal && selectedProduct && (
        <VariantModal
          product={selectedProduct}
          onSelect={(variant) => handleAddToCart(selectedProduct, variant)}
          onClose={() => {
            setShowVariantModal(false);
            setSelectedProduct(null);
          }}
        />
      )}
    </>
  );
};

ProductGrid.propTypes = {
  products: PropTypes.array,
  isLoading: PropTypes.bool,
  search: PropTypes.string,
  onSearchChange: PropTypes.func,
  barcode: PropTypes.string,
  onBarcodeChange: PropTypes.func,
  categoryId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onCategoryChange: PropTypes.func,
  store: PropTypes.any
};

export default ProductGrid;
