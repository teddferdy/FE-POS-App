/* eslint-disable react/prop-types */
import React, { useState } from "react";
import { Plus, Minus, ShoppingCart, Pencil, AlertTriangle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { formatCurrencyRupiah } from "@/utils/formatter-currency";

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
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <ShoppingCart size={48} className="mb-2 opacity-30" />
            <p className="text-sm">{t("page.cashier.cart.empty")}</p>
            <p className="text-xs">{t("page.cashier.cart.emptyHint")}</p>
          </div>
        ) : (
          items.map((item, idx) => {
            const itemKey = item.cartKey || item.id || idx;
            const isEditing = editingPrice === itemKey;

            return (
              <div
                key={itemKey}
                className="flex items-start gap-3 p-3 rounded-xl bg-accent/50 border border-border">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium leading-tight truncate">{item.name}</p>
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
                        className="w-24 h-7 px-2 text-xs rounded border border-primary bg-background outline-none"
                        autoFocus
                      />
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                      {formatCurrencyRupiah(item.price)} / {item.unit || "pcs"}
                      <button
                        onClick={() => startEditPrice(item)}
                        className="text-muted-foreground/50 hover:text-muted-foreground transition-colors">
                        <Pencil size={10} />
                      </button>
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleDecrementClick(item)}
                    className="w-7 h-7 flex items-center justify-center rounded-md border border-border hover:bg-accent transition-colors">
                    <Minus size={13} />
                  </button>
                  <input
                    type="number"
                    value={item.count}
                    onChange={(e) => handleQtyChange(item, e.target.value)}
                    className="w-10 text-center text-sm font-semibold bg-transparent border-none outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    min="1"
                  />
                  <button
                    onClick={() => onIncrement(item)}
                    className="w-7 h-7 flex items-center justify-center rounded-md border border-border hover:bg-accent transition-colors">
                    <Plus size={13} />
                  </button>
                </div>
                <div className="text-right shrink-0 min-w-[80px]">
                  <p className="text-sm font-semibold">
                    {formatCurrencyRupiah(item.totalPrice || 0)}
                  </p>
                  <button
                    onClick={() => setDeleteTarget(item)}
                    className="text-xs text-red-500 hover:text-red-600 mt-0.5">
                    {t("common.delete")}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card rounded-xl shadow-lg border border-border w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
                <AlertTriangle size={20} className="text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-base">Hapus Item</h3>
                <p className="text-sm text-muted-foreground">
                  Yakin ingin menghapus <strong>{deleteTarget.name}</strong> dari pesanan?
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 text-sm font-medium rounded-lg border border-border hover:bg-accent transition-colors">
                Batal
              </button>
              <button
                onClick={() => {
                  onDelete(deleteTarget);
                  setDeleteTarget(null);
                }}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors">
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="border-t border-border p-4 space-y-3 shrink-0">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">
            {t("page.cashier.cart.subtotal", { count: totalItems })}
          </span>
          <span className="font-semibold">{formatCurrencyRupiah(subtotal)}</span>
        </div>
        <div className="flex justify-between text-lg font-bold">
          <span>{t("page.cashier.total")}</span>
          <span className="text-primary">{formatCurrencyRupiah(subtotal)}</span>
        </div>
        <button
          className="w-full h-11 text-base font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={items.length === 0}
          onClick={onCheckout}>
          {t("page.cashier.checkout")} {formatCurrencyRupiah(subtotal)}
        </button>
      </div>
    </div>
  );
};

export default CartPanel;
