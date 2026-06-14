/* eslint-disable react/prop-types */
import React, { useState } from "react";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { formatCurrencyRupiah } from "@/utils/formatter-currency";
import { Button } from "@/components/ui/button";

const VariantModal = ({ product, onConfirm, onClose }) => {
  const { t } = useTranslation();
  const [selected, setSelected] = useState({});

  const options = product.options || [];

  const handleToggle = (groupId, opt) => {
    const group = options.find((g) => g.id === groupId || g.name === groupId);
    if (!group) return;
    const isMultiple = group.isMultiple;

    setSelected((prev) => {
      const current = prev[groupId] || [];
      if (isMultiple) {
        const exists = current.find((o) => o.name === opt.name);
        return {
          ...prev,
          [groupId]: exists ? current.filter((o) => o.name !== opt.name) : [...current, opt]
        };
      } else {
        return { ...prev, [groupId]: [opt] };
      }
    });
  };

  const groupedLabels = {};
  options.forEach((g) => {
    groupedLabels[g.id || g.name] = g.name || t("page.cashier.variant.groupName");
  });

  const selectedVariants = Object.values(selected).flat();
  const basePrice = Number(product.price || product.harga || 0);
  const extraPrice = selectedVariants.reduce((sum, o) => sum + Number(o.price || 0), 0);
  const totalPrice = basePrice + extraPrice;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-card rounded-xl shadow-lg border border-border w-full max-w-sm max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="font-semibold text-base">{product.nameProduct || product.name}</h3>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
            <X size={16} />
          </Button>
        </div>
        <div className="p-5 space-y-4">
          <div className="flex gap-3">
            {product.image && (
              <img
                src={product.image}
                alt={product.nameProduct || product.name}
                className="w-20 h-20 rounded-lg object-cover"
              />
            )}
            <div>
              <p className="text-2xl font-bold text-primary">{formatCurrencyRupiah(totalPrice)}</p>
              {extraPrice > 0 && (
                <p className="text-xs text-muted-foreground">
                  {t("page.cashier.variant.basePrice")} {formatCurrencyRupiah(basePrice)} +{" "}
                  {t("page.cashier.variant.variantPrice")} {formatCurrencyRupiah(extraPrice)}
                </p>
              )}
            </div>
          </div>

          {options.map((group) => {
            const gid = group.id || group.name;
            const groupName = group.name || t("page.cashier.variant.groupName");
            const isMultiple = group.isMultiple;
            const groupOptions = group.options || group.option || [];

            return (
              <div key={gid}>
                <p className="text-sm font-medium mb-2">
                  {groupName}{" "}
                  {isMultiple
                    ? t("page.cashier.variant.multiple")
                    : t("page.cashier.variant.single")}
                </p>
                <div className="flex flex-wrap gap-2">
                  {groupOptions.map((opt) => {
                    const optName = opt.name || opt.option || opt.label || "";
                    const optPrice = Number(opt.price || 0);
                    const isActive = (selected[gid] || []).some((o) => o.name === optName);
                    return (
                      <button
                        key={optName}
                        onClick={() => handleToggle(gid, { ...opt, name: optName })}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                          isActive
                            ? "bg-primary text-primary-foreground border-primary"
                            : "border-border text-muted-foreground hover:bg-accent"
                        }`}>
                        {optName}
                        {optPrice > 0 && ` +${formatCurrencyRupiah(optPrice)}`}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="px-5 py-4 border-t border-border flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            {t("common.cancel")}
          </Button>
          <Button onClick={() => onConfirm(product, selectedVariants)}>
            {t("page.cashier.variant.add")} {formatCurrencyRupiah(totalPrice)}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VariantModal;
