import React, { useState, useMemo } from "react";
import PropTypes from "prop-types";
import { X, Package, Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

const VariantModal = ({ product, onSelect, onClose }) => {
  const { t } = useTranslation();
  const [selectedVariant, setSelectedVariant] = useState(null);

  const variants = useMemo(() => {
    if (product?.variant && Array.isArray(product.variant)) {
      return product.variant.filter((v) => v != null && (v.nameVariant || v.name));
    }
    return [];
  }, [product]);

  const formatPrice = (value) => {
    if (value == null || isNaN(value)) return "0";
    return Number(value).toLocaleString("id-ID");
  };

  const productImage = product?.image || product?.imageProduct || product?.photo || null;

  if (!product) return null;

  return (
    <div className="fixed inset-0 z-[55] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-border/50 w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 shrink-0">
          <div className="flex items-center gap-2">
            <Package size={20} className="text-primary" />
            <h2 className="text-lg font-bold">{t("page.cashier.selectVariant")}</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-accent transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="flex items-center gap-4 bg-muted/30 rounded-xl p-4 border border-border/40">
            {productImage ? (
              <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-muted/50">
                <img
                  src={productImage || "/placeholder.svg"}
                  alt={product.nameProduct || product.name || ""}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/10 flex items-center justify-center shrink-0">
                <Package size={24} className="text-primary/40" />
              </div>
            )}
            <div>
              <p className="font-semibold text-foreground">
                {product.nameProduct || product.name || t("page.cashier.unnamedProduct")}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {t("page.cashier.chooseVariant")}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              {t("page.cashier.availableVariants")}
            </p>
            {variants.map((variant, idx) => {
              const isSelected =
                selectedVariant?.nameVariant === variant.nameVariant &&
                selectedVariant?.price === variant.price;
              const variantPrice = variant.price || product.price || 0;
              const variantImage = variant.image || null;

              return (
                <button
                  key={variant.nameVariant || idx}
                  onClick={() => setSelectedVariant(variant)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 text-left ${
                    isSelected
                      ? "border-primary bg-primary/10 shadow-sm shadow-primary/10"
                      : "border-border/40 bg-card/50 hover:border-border/70 hover:bg-accent/50"
                  }`}>
                  {variantImage ? (
                    <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-muted/50">
                      <img
                        src={variantImage || "/placeholder.svg"}
                        alt={variant.nameVariant || variant.name || ""}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-muted/50 border border-border/30 flex items-center justify-center shrink-0">
                      <Package size={16} className="text-muted-foreground/40" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">
                      {variant.nameVariant || variant.name || "-"}
                    </p>
                    <p className="text-xs text-muted-foreground">Rp {formatPrice(variantPrice)}</p>
                  </div>
                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                      <Check size={12} className="text-primary-foreground" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="border-t border-border/50 p-4 shrink-0">
          <Button
            onClick={() => onSelect(selectedVariant)}
            disabled={!selectedVariant}
            className="w-full h-12 rounded-xl font-semibold text-sm relative overflow-hidden group/btn">
            <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary to-primary/90 opacity-90 group-hover/btn:opacity-100 transition-opacity" />
            <span className="relative flex items-center justify-center gap-2">
              <Package size={16} />
              {t("page.cashier.addToCart")}
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
};

VariantModal.propTypes = {
  product: PropTypes.shape({
    variant: PropTypes.array,
    image: PropTypes.string,
    imageProduct: PropTypes.string,
    photo: PropTypes.string,
    nameProduct: PropTypes.string,
    name: PropTypes.string,
    price: PropTypes.number
  }),
  onSelect: PropTypes.func,
  onClose: PropTypes.func
};

export default VariantModal;
