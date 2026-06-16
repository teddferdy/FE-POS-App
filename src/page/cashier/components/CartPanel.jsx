/* eslint-disable react/prop-types */
import React, { useState } from "react";
import { Plus, Minus, ShoppingCart, Pencil, AlertTriangle, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { formatCurrencyRupiah } from "@/utils/formatter-currency";

const itemAnimation = {
  initial: { opacity: 0, x: 20, height: 0 },
  animate: {
    opacity: 1,
    x: 0,
    height: "auto",
    transition: { type: "spring", damping: 25, stiffness: 300 }
  },
  exit: {
    opacity: 0,
    x: 20,
    height: 0,
    transition: { duration: 0.2 }
  }
};

const CartPanel = ({
  items,
  subtotal,
  onIncrement,
  onDecrement,
  onDelete,
  onCheckout,
  totalItems,
  onUpdatePrice
}) => {
  const { t } = useTranslation();
  const [editingPrice, setEditingPrice] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);

  const handleQtyChange = (item, newVal) => {
    const qty = parseInt(newVal, 10);
    if (isNaN(qty) || qty < 0) return;
    const diff = qty - (item.count || 0);
    if (diff > 0) {
      for (let i = 0; i < diff; i++) onIncrement(item);
    } else if (diff < 0) {
      if (qty === 0) {
        setDeleteTarget(item);
        return;
      }
      for (let i = 0; i < Math.abs(diff); i++) onDecrement(item);
    }
  };

  const handleDecrementClick = (item) => {
    if (item.count <= 1) {
      setDeleteTarget(item);
    } else {
      onDecrement(item);
    }
  };

  const startEditPrice = (item) => {
    setEditingPrice(item.cartKey || item.id);
    setEditValue(String(item.price));
  };

  const saveEditPrice = (item) => {
    const newPrice = parseInt(editValue.replace(/[^0-9]/g, ""), 10);
    if (newPrice > 0 && onUpdatePrice) {
      onUpdatePrice(item, newPrice);
    }
    setEditingPrice(null);
    setEditValue("");
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin">
        <AnimatePresence mode="popLayout">
          {items.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <div className="w-16 h-16 rounded-2xl bg-muted/50 backdrop-blur-sm border border-border/30 flex items-center justify-center mb-3">
                <ShoppingCart size={32} className="opacity-30" />
              </div>
              <p className="text-sm">{t("page.cashier.cart.empty")}</p>
              <p className="text-xs text-muted-foreground/60 mt-0.5">
                {t("page.cashier.cart.emptyHint")}
              </p>
            </motion.div>
          ) : (
            items.map((item, idx) => {
              const itemKey = item.cartKey || item.id || idx;
              const isEditing = editingPrice === itemKey;

              return (
                <motion.div
                  key={itemKey}
                  variants={itemAnimation}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  layout
                  className="flex items-start gap-3 p-3 rounded-2xl bg-card/70 backdrop-blur-sm border border-border/40 hover:border-border/60 transition-all duration-200 shadow-sm">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-tight truncate text-foreground/90">
                      {item.name}
                    </p>
                    {item.options && item.options.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {item.options.map((opt, i) => (
                          <span
                            key={i}
                            className="text-[10px] px-1.5 py-0.5 rounded-full bg-gradient-to-r from-primary/10 to-primary/5 text-primary font-medium border border-primary/10">
                            {opt.name}
                          </span>
                        ))}
                      </div>
                    )}
                    {isEditing ? (
                      <div className="flex items-center gap-1 mt-1">
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={() => saveEditPrice(item)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") saveEditPrice(item);
                            if (e.key === "Escape") setEditingPrice(null);
                          }}
                          className="w-24 h-7 px-2 text-xs rounded-xl border border-primary/50 bg-background outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                          autoFocus
                        />
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground/70 mt-0.5 flex items-center gap-1">
                        {formatCurrencyRupiah(item.price)} / {item.unit || "pcs"}
                        <button
                          onClick={() => startEditPrice(item)}
                          className="text-muted-foreground/30 hover:text-muted-foreground transition-colors">
                          <Pencil size={10} />
                        </button>
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDecrementClick(item)}
                      className="w-7 h-7 flex items-center justify-center rounded-xl border border-border/50 hover:bg-accent/50 hover:border-border transition-all text-muted-foreground">
                      <Minus size={13} />
                    </motion.button>
                    <input
                      type="number"
                      value={item.count}
                      onChange={(e) => handleQtyChange(item, e.target.value)}
                      className="w-10 text-center text-sm font-semibold bg-transparent border-none outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none text-foreground"
                      min="1"
                    />
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => onIncrement(item)}
                      className="w-7 h-7 flex items-center justify-center rounded-xl border border-border/50 hover:bg-accent/50 hover:border-border transition-all text-muted-foreground">
                      <Plus size={13} />
                    </motion.button>
                  </div>
                  <div className="text-right shrink-0 min-w-[80px]">
                    <p className="text-sm font-semibold text-foreground">
                      {formatCurrencyRupiah(item.totalPrice || 0)}
                    </p>
                    <button
                      onClick={() => setDeleteTarget(item)}
                      className="text-xs text-red-400 hover:text-red-500 mt-0.5 transition-colors">
                      <Trash2 size={12} className="inline mr-0.5" />
                      {t("common.delete")}
                    </button>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {deleteTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-card/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-border/50 w-full max-w-sm p-6 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500/20 to-red-500/10 flex items-center justify-center shrink-0 border border-red-500/20">
                  <AlertTriangle size={20} className="text-red-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-base text-foreground">
                    {t("page.cashier.cart.removeItem")}
                  </h3>
                  <p className="text-sm text-muted-foreground/80 mt-0.5">
                    {t("page.cashier.cart.removeConfirm", { name: deleteTarget.name })}
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setDeleteTarget(null)}
                  className="px-4 py-2 text-sm font-medium rounded-xl border border-border/50 hover:bg-accent/50 transition-all">
                  {t("page.cashier.cart.cancel")}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    onDelete(deleteTarget);
                    setDeleteTarget(null);
                  }}
                  className="px-4 py-2 text-sm font-medium rounded-xl bg-gradient-to-r from-red-600 to-red-500 text-white hover:from-red-700 hover:to-red-600 shadow-lg shadow-red-500/20 transition-all">
                  {t("page.cashier.cart.confirmDelete")}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        layout
        className="border-t border-border/50 p-4 space-y-3 shrink-0 bg-card/80 backdrop-blur-sm">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground/70">
            {t("page.cashier.cart.subtotal", { count: totalItems })}
          </span>
          <span className="font-semibold text-foreground">{formatCurrencyRupiah(subtotal)}</span>
        </div>
        <div className="flex justify-between text-lg font-bold">
          <span className="text-foreground/90">{t("page.cashier.total")}</span>
          <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            {formatCurrencyRupiah(subtotal)}
          </span>
        </div>
        <motion.button
          whileHover={items.length > 0 ? { scale: 1.01 } : {}}
          whileTap={items.length > 0 ? { scale: 0.99 } : {}}
          className="relative w-full h-11 text-base font-semibold rounded-2xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:from-primary/90 hover:to-primary/70 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-primary shadow-lg shadow-primary/20 overflow-hidden group"
          disabled={items.length === 0}
          onClick={onCheckout}>
          <motion.span
            initial={false}
            className="relative z-10 flex items-center justify-center gap-2">
            <ShoppingCart size={16} />
            {t("page.cashier.checkout")} {formatCurrencyRupiah(subtotal)}
          </motion.span>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
        </motion.button>
      </motion.div>
    </div>
  );
};

export default CartPanel;
