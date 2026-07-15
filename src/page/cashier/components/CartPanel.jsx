import React, { useState, useCallback, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { optimizeImage } from "@/utils/image";
import {
  Trash2,
  Minus,
  Plus,
  ShoppingBag,
  DollarSign,
  Percent,
  Edit3,
  Check,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";

const CartPanel = ({
  items,
  subtotal,
  taxRate,
  taxAmount,
  onIncrement,
  onDecrement,
  onDelete,
  onCheckout,
  totalItems,
  onUpdatePrice
}) => {
  const { t } = useTranslation();
  const [editingPrice, setEditingPrice] = useState(null);
  const [priceValue, setPriceValue] = useState("");
  const [priceErrors, setPriceErrors] = useState({});
  const inputRef = useRef(null);
  const [quantities, setQuantities] = useState({});
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const itemKey = (item) => item.cartKey || item.id || item.ID || item.idProduct || item._id;

  useEffect(() => {
    const next = {};
    items.forEach((item) => {
      const key = itemKey(item);
      next[key] = item.count || item.qty || 0;
    });
    setQuantities(next);
  }, [items]);

  const handleDecrement = useCallback(
    (item) => {
      const currentQty = item.count || item.qty || 0;
      if (currentQty <= 1) {
        setDeleteConfirm(item);
      } else {
        onDecrement(item);
      }
    },
    [onDecrement]
  );

  const handleDeleteConfirm = () => {
    if (deleteConfirm) {
      onDelete(deleteConfirm);
      setDeleteConfirm(null);
    }
  };

  const handleQtyChange = useCallback(
    (item, newQty) => {
      const currentQty = item.count || item.qty || 0;
      const diff = newQty - currentQty;
      if (diff > 0) {
        for (let i = 0; i < diff; i++) onIncrement(item);
      } else if (diff < 0) {
        if (currentQty <= 1) {
          setDeleteConfirm(item);
        } else {
          for (let i = 0; i < Math.abs(diff); i++) onDecrement(item);
        }
      }
    },
    [onIncrement, onDecrement]
  );

  const startEditingPrice = (item) => {
    setEditingPrice(itemKey(item));
    setPriceValue(String(item.price || item.unitPrice || 0));
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const savePrice = (item) => {
    const key = itemKey(item);
    const val = parseFloat(priceValue);
    if (isNaN(val) || val < 0) {
      setPriceErrors((prev) => ({ ...prev, [key]: t("page.cashier.invalidPrice") }));
      return;
    }
    onUpdatePrice?.(item, val);
    setEditingPrice(null);
    setPriceErrors((prev) => {
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });
  };

  const cancelEditingPrice = () => {
    setEditingPrice(null);
    setPriceValue("");
  };

  const formatPrice = (value) => {
    if (value == null || isNaN(value)) return "0";
    return Number(value).toLocaleString("id-ID");
  };

  const isEmpty = !items || items.length === 0;

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="hidden lg:flex items-center justify-between px-5 py-4 border-b border-border/50 shrink-0">
        <h2 className="font-semibold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          {t("page.cashier.orderCount", { count: totalItems })}
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin overscroll-contain min-h-0 px-3 py-3 space-y-2">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center gap-4 h-full">
            <div className="w-20 h-20 rounded-2xl bg-muted/50 border border-border/50 flex items-center justify-center">
              <ShoppingBag size={36} className="text-muted-foreground/40" />
            </div>
            <div className="text-center">
              <p className="font-medium text-muted-foreground">{t("page.cashier.emptyCart")}</p>
              <p className="text-sm text-muted-foreground/60 mt-1">
                {t("page.cashier.emptyCartDesc")}
              </p>
            </div>
          </div>
        ) : (
          items.map((item, idx) => {
            const key = itemKey(item);
            const isEditing = editingPrice === key;
            const err = priceErrors[key];
            const price = item.price || item.unitPrice || 0;
            const count = item.count || item.qty || 0;
            const lineTotal = item.totalPrice || price * count;
            const img =
              item.image || item.photo || item.ImageURL || item.imageProduct || item.image_url;

            return (
              <div
                key={key || idx}
                className="group bg-card/80 backdrop-blur-sm border border-border/40 rounded-xl p-3 hover:border-border/80 hover:shadow-sm transition-all duration-200">
                <div className="flex gap-3">
                  {img ? (
                    <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-muted/50">
                      <img
                        src={optimizeImage(img) || "/placeholder.svg"}
                        alt={item.nameProduct || item.name || ""}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.parentElement.classList.add(
                            "flex",
                            "items-center",
                            "justify-center"
                          );
                          const fallback = document.createElement("span");
                          fallback.className = "text-xl font-bold text-muted-foreground/30";
                          fallback.textContent =
                            (item.nameProduct || item.name || "?")[0]?.toUpperCase() || "?";
                          e.target.parentElement.appendChild(fallback);
                        }}
                      />
                    </div>
                  ) : (
                    <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-lg font-bold text-primary/40">
                        {(item.nameProduct || item.name || "?")[0]?.toUpperCase() || "?"}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-medium text-sm text-foreground truncate">
                          {item.nameProduct || item.name || t("page.cashier.unnamedProduct")}
                          {item.variantName && (
                            <span className="text-muted-foreground/70 font-normal ml-1">
                              - {item.variantName}
                            </span>
                          )}
                        </p>
                      </div>
                      <button
                        onClick={() => onDelete(item)}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 transition-all shrink-0">
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDecrement(item)}
                          className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-all active:scale-90">
                          <Minus size={14} />
                        </button>
                        <div className="relative">
                          <input
                            type="number"
                            min="1"
                            value={quantities[key] !== undefined ? quantities[key] : count}
                            onChange={(e) => {
                              const val = parseInt(e.target.value) || 0;
                              setQuantities((prev) => ({ ...prev, [key]: val }));
                            }}
                            onBlur={() => handleQtyChange(item, quantities[key])}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                handleQtyChange(item, quantities[key]);
                                e.target.blur();
                              }
                            }}
                            className="w-10 text-center text-sm font-semibold bg-transparent border-none outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                        </div>
                        <button
                          onClick={() => onIncrement(item)}
                          className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-all active:scale-90">
                          <Plus size={14} />
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        {isEditing ? (
                          <div className="flex items-center gap-1">
                            <div className="relative">
                              <span className="text-[10px] text-muted-foreground absolute left-1.5 top-1/2 -translate-y-1/2">
                                Rp
                              </span>
                              <input
                                ref={inputRef}
                                type="number"
                                value={priceValue}
                                onChange={(e) => setPriceValue(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") savePrice(item);
                                  if (e.key === "Escape") cancelEditingPrice();
                                }}
                                className="w-24 pl-6 pr-2 py-1 text-xs rounded-lg bg-accent border border-border/60 outline-none focus:border-primary/50 text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              />
                            </div>
                            <button
                              onClick={() => savePrice(item)}
                              className="p-1 rounded-md text-emerald-500 hover:bg-emerald-500/10 transition-all">
                              <Check size={14} />
                            </button>
                            <button
                              onClick={cancelEditingPrice}
                              className="p-1 rounded-md text-muted-foreground hover:bg-accent transition-all">
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <>
                            <span className="text-sm font-bold text-foreground">
                              Rp {formatPrice(lineTotal)}
                            </span>
                            <button
                              onClick={() => startEditingPrice(item)}
                              className="p-1 rounded-md text-muted-foreground/40 hover:text-foreground hover:bg-accent transition-all opacity-0 group-hover:opacity-100">
                              <Edit3 size={12} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                    {err && <p className="text-[10px] text-destructive mt-1">{err}</p>}
                    {item.discount > 0 && (
                      <div className="flex items-center gap-1 mt-1.5">
                        <Percent size={10} className="text-emerald-500" />
                        <span className="text-[10px] text-emerald-500 font-medium">
                          {t("page.cashier.discountLabel")} {item.discount}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="border-t border-border/50 bg-card/80 backdrop-blur-sm shrink-0 p-4 space-y-3">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{t("page.cashier.subtotal")}</span>
            <span className="font-medium text-foreground">Rp {formatPrice(subtotal)}</span>
          </div>
          {taxRate > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {t("page.cashier.tax")} ({Math.round(taxRate * 100)}%)
              </span>
              <span className="font-medium text-foreground">Rp {formatPrice(taxAmount)}</span>
            </div>
          )}
          <div className="border-t border-border/30 pt-2 flex items-center justify-between">
            <span className="text-sm font-semibold text-foreground">{t("page.cashier.total")}</span>
            <span className="font-bold text-foreground text-lg">
              Rp {formatPrice(subtotal + taxAmount)}
            </span>
          </div>
        </div>
        <Button
          onClick={onCheckout}
          className="w-full h-11 rounded-xl font-semibold text-sm relative overflow-hidden group/btn">
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary to-primary/90 opacity-90 group-hover/btn:opacity-100 transition-opacity" />
          <span className="relative flex items-center justify-center gap-2">
            <DollarSign size={16} />
            {t("page.cashier.checkout")}
          </span>
        </Button>
      </div>

      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{t("page.cashier.deleteTitle")}</DialogTitle>
            <DialogDescription>{t("page.cashier.deleteDesc")}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              {t("page.cashier.deleteNo")}
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              {t("page.cashier.deleteYes")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

CartPanel.propTypes = {
  items: PropTypes.array,
  subtotal: PropTypes.number,
  taxRate: PropTypes.number,
  taxAmount: PropTypes.number,
  onIncrement: PropTypes.func,
  onDecrement: PropTypes.func,
  onDelete: PropTypes.func,
  onCheckout: PropTypes.func,
  totalItems: PropTypes.number,
  onUpdatePrice: PropTypes.func
};

export default CartPanel;
