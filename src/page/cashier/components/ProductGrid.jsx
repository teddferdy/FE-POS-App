/* eslint-disable react/prop-types */
import React, { useState, useRef, useEffect } from "react";
import { useQuery } from "react-query";
import { Search, Barcode, Package } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Loading } from "@/components/ui/loading";
import { getAllCategoryActive } from "@/services/category";
import { lookupBarcode } from "@/services/product";
import { orderList } from "@/state/order-list";
import { formatCurrencyRupiah } from "@/utils/formatter-currency";
import VariantModal from "./VariantModal";

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
    const existing = cart.order.find((item) => item.id === (product.id || product._id));
    if (existing) {
      cart.incrementOrder(existing);
    } else {
      cart.addingProduct({
        id: product.id || product._id,
        name: product.nameProduct || product.name || "Produk",
        price,
        count: 1,
        totalPrice: price,
        image: product.image || null,
        unit: product.unit || "",
        sku: product.sku || ""
      });
    }
  };

  const handleAddVariants = (product, selectedOptions) => {
    const basePrice = Number(product.price || product.harga || 0);
    const optionLabels = selectedOptions.map((o) => o.label).join(", ");
    const optionPrice = selectedOptions.reduce((sum, o) => sum + Number(o.price || 0), 0);
    const totalPrice = basePrice + optionPrice;
    const key = `${product.id || product._id}-${selectedOptions.map((o) => o.name).join("-")}`;
    const existing = cart.order.find((item) => item.cartKey === key);
    if (existing) {
      cart.incrementOrder(existing);
    } else {
      cart.addingProduct({
        id: product.id || product._id,
        cartKey: key,
        name: `${product.nameProduct || product.name} (${optionLabels})`,
        price: totalPrice,
        count: 1,
        totalPrice,
        image: product.image || null,
        unit: product.unit || "",
        options: selectedOptions
      });
    }
    setVariantProduct(null);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 lg:p-4 border-b border-border space-y-2 shrink-0">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              placeholder="Cari produk..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 h-9 text-sm"
            />
          </div>
          <div className="relative w-40">
            <Barcode
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              ref={barcodeRef}
              placeholder="Scan barcode"
              value={barcode}
              onChange={(e) => onBarcodeChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && barcode.trim()) {
                  handleBarcodeLookup(barcode.trim());
                }
              }}
              className="pl-9 h-9 text-sm"
            />
          </div>
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => onCategoryChange("")}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              !categoryId
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border text-muted-foreground hover:bg-accent"
            }`}>
            Semua
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id || cat._id}
              onClick={() => onCategoryChange(cat.id || cat._id)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                categoryId === (cat.id || cat._id)
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:bg-accent"
              }`}>
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 lg:p-4">
        {isLoading ? (
          <Loading />
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <Package size={48} className="mb-2 opacity-30" />
            <p className="text-sm">Produk tidak ditemukan</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
            {products.map((product) => {
              const pid = product.id || product._id;
              const imageUrl = product.image || (product.images && product.images[0]) || null;
              const productName = product.nameProduct || product.name || "Produk";
              const productPrice = Number(product.price || product.harga || 0);
              const stock = product.stock ?? product.quantity ?? null;
              const hasOptions = product.options && product.options.length > 0;

              return (
                <button
                  key={pid}
                  onClick={() => addToCart(product)}
                  className="group text-left bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 hover:shadow-sm transition-all">
                  <div className="aspect-square bg-muted relative overflow-hidden">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={productName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package size={32} className="text-muted-foreground/30" />
                      </div>
                    )}
                    {stock !== null && stock <= 0 && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="text-white text-xs font-semibold bg-red-600 px-2 py-0.5 rounded">
                          Habis
                        </span>
                      </div>
                    )}
                    {hasOptions && (
                      <div className="absolute top-1.5 right-1.5">
                        <span className="text-[10px] font-medium bg-amber-500 text-white px-1.5 py-0.5 rounded">
                          Varian
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-2.5">
                    <p className="text-xs font-medium line-clamp-2 leading-tight min-h-[2em]">
                      {productName}
                    </p>
                    <p className="text-sm font-bold text-primary mt-1">
                      {formatCurrencyRupiah(productPrice)}
                    </p>
                    {stock !== null && (
                      <p className="text-[10px] text-muted-foreground mt-0.5">Stok: {stock}</p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {variantProduct && (
        <VariantModal
          product={variantProduct}
          onConfirm={handleAddVariants}
          onClose={() => setVariantProduct(null)}
        />
      )}
    </div>
  );
};

export default ProductGrid;
