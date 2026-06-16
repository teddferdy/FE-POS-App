/* eslint-disable react/prop-types */
import React, { useState } from "react";
import { X, Plus } from "lucide-react";
import { motion } from "framer-motion";
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-card/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-border/50 w-full max-w-sm max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/50">
          <h3 className="font-semibold text-base flex items-center gap-2">
            <div className="w-1.5 h-5 rounded-full bg-gradient-to-b from-primary to-primary/50" />
            {product.nameProduct || product.name}
          </h3>
          <motion.button
            whileHover={{ rotate: 90 }}
            onClick={onClose}
            className="h-8 w-8 rounded-xl hover:bg-accent/50 transition-colors flex items-center justify-center">
            <X size={16} />
          </motion.button>
        </div>
        <div className="p-5 space-y-4">
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3 p-3 rounded-xl bg-muted/30 backdrop-blur-sm border border-border/30">
            {product.image && (
              <motion.img
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                src={product.image}
                alt={product.nameProduct || product.name}
                className="w-20 h-20 rounded-xl object-cover border border-border/30"
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                {formatCurrencyRupiah(totalPrice)}
              </p>
              {extraPrice > 0 && (
                <p className="text-xs text-muted-foreground/70 mt-0.5">
                  {t("page.cashier.variant.basePrice")} {formatCurrencyRupiah(basePrice)}
                  {" + "}
                  {t("page.cashier.variant.variantPrice")} {formatCurrencyRupiah(extraPrice)}
                </p>
              )}
            </div>
          </motion.div>

          {options.map((group) => {
            const gid = group.id || group.name;
            const groupName = group.name || t("page.cashier.variant.groupName");
            const isMultiple = group.isMultiple;
            const groupOptions = group.options || group.option || [];

            return (
              <motion.div key={gid} initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}>
                <p className="text-sm font-medium mb-2 text-foreground/80 flex items-center gap-1.5">
                  {groupName}
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted/50 text-muted-foreground/60 border border-border/30">
                    {isMultiple
                      ? t("page.cashier.variant.multiple")
                      : t("page.cashier.variant.single")}
                  </span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {groupOptions.map((opt) => {
                    const optName = opt.name || opt.option || opt.label || "";
                    const optPrice = Number(opt.price || 0);
                    const isActive = (selected[gid] || []).some((o) => o.name === optName);
                    return (
                      <motion.button
                        key={optName}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleToggle(gid, { ...opt, name: optName })}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all duration-200 ${
                          isActive
                            ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground border-primary/50 shadow-md shadow-primary/20"
                            : "border-border/50 text-muted-foreground hover:bg-accent/50 bg-muted/20 hover:border-foreground/20"
                        }`}>
                        {optName}
                        {optPrice > 0 && (
                          <span className="ml-1 opacity-80">+{formatCurrencyRupiah(optPrice)}</span>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="px-5 py-4 border-t border-border/50 flex justify-end gap-2 bg-card/50">
          <Button variant="outline" onClick={onClose} className="rounded-xl border-border/50">
            {t("common.cancel")}
          </Button>
          <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
            <Button
              onClick={() => onConfirm(product, selectedVariants)}
              className="rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/20 transition-all">
              <Plus size={16} className="mr-1.5" />
              {t("page.cashier.variant.add")} {formatCurrencyRupiah(totalPrice)}
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default VariantModal;
