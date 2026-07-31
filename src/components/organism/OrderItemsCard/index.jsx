/* eslint-disable react/prop-types */
import React from "react";
import { Package, Plus, Trash2, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Combobox } from "@/components/ui/combobox";
import { cn } from "@/lib/utils";

const COMMON_CONVERSION = {
  "kg->gram": 1000,
  "gram->kg": 0.001,
  "liter->ml": 1000,
  "ml->liter": 0.001,
  "meter->cm": 100,
  "cm->meter": 0.01,
  "meter->mm": 1000,
  "cm->mm": 10,
  "lusin->pcs": 12,
  "pcs->lusin": 1 / 12
};

const getSuggestedConversion = (from, to) => {
  const key = `${from}->${to}`;
  if (COMMON_CONVERSION[key] !== undefined) return COMMON_CONVERSION[key];
  return 1;
};

function SupplierPriceChips({ suppliersForItem, item, minPrice, formatIDR, onUpdate, idx, t }) {
  if (!suppliersForItem.length) {
    return (
      <span className="text-xs text-muted-foreground">
        {t("page.purchaseOrder.add.noSupplierForIngredient")}
      </span>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="text-[11px] text-muted-foreground font-medium shrink-0">
        {t("page.purchaseOrder.add.supplierPrice")}:
      </span>
      {suppliersForItem.map((sp) => {
        const isCheapest = sp.price === minPrice;
        const isSelected = item.supplierId === sp.supplierId;
        return (
          <button
            key={sp.supplierId}
            type="button"
            onClick={() => {
              onUpdate(idx, "supplierId", sp.supplierId);
              onUpdate(idx, "price", sp.price);
            }}
            className={cn(
              "text-[11px] px-2.5 py-1 rounded-full border transition-all",
              isSelected
                ? "bg-primary/10 border-primary text-primary font-medium shadow-sm"
                : isCheapest
                  ? "bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-400"
                  : "bg-background border-border hover:bg-accent/50 text-muted-foreground hover:text-foreground"
            )}>
            {sp.supplierName}: {formatIDR(sp.price)}
          </button>
        );
      })}
      <button
        type="button"
        onClick={() => onUpdate(idx, "supplierId", null)}
        className={cn(
          "text-[11px] px-2.5 py-1 rounded-full border transition-all",
          !item.supplierId
            ? "bg-primary/10 border-primary text-primary font-medium shadow-sm"
            : "bg-background border-border hover:bg-accent/50 text-muted-foreground hover:text-foreground"
        )}>
        {t("page.purchaseOrder.add.customPrice")}
      </button>
    </div>
  );
}

export default function OrderItemsCard({
  items = [],
  suppliers = [],
  supplierProductsMap = {},
  getSuppliersForIngredientName,
  unitOptions = [],
  discount = 0,
  totalAmount = 0,
  finalAmount = 0,
  additionalCost = 0,
  overDeliveryTolerance = 10,
  errors = {},
  hasDuplicateItems = false,
  itemsLoading = false,
  selectedStore = "",
  onAddItem,
  onRemoveItem,
  onUpdateItem,
  onDiscountChange,
  onAdditionalCostChange,
  onOverDeliveryToleranceChange,
  formatIDR,
  parseIDR,
  t
}) {
  if (!selectedStore) {
    return (
      <Card className="overflow-hidden border-0 shadow-md rounded-xl">
        <div className="bg-gradient-to-r from-emerald-600/90 to-emerald-700/90 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center">
              <Package size={18} className="text-white" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">
                {t("page.purchaseOrder.add.itemSection")}
              </h3>
              <p className="text-xs text-emerald-100">
                {t("page.purchaseOrder.add.itemSectionDesc")}
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center py-16 text-center px-4">
          <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-4">
            <ShoppingCart size={22} className="text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-foreground">
            {t("page.purchaseOrder.add.selectStoreFirst") || "Pilih store terlebih dahulu"}
          </p>
          <p className="text-xs text-muted-foreground mt-1.5 max-w-xs">
            {t("page.purchaseOrder.add.selectStoreHint") ||
              "Item pesanan akan muncul setelah store dipilih"}
          </p>
        </div>
      </Card>
    );
  }

  if (itemsLoading) {
    return (
      <Card className="overflow-hidden border-0 shadow-md rounded-xl">
        <div className="bg-gradient-to-r from-emerald-600/90 to-emerald-700/90 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center">
              <Package size={18} className="text-white" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">
                {t("page.purchaseOrder.add.itemSection")}
              </h3>
            </div>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div className="hidden lg:block space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="w-7 h-7 rounded-full shrink-0" />
                <Skeleton className="h-9 w-[180px] shrink-0" />
                <Skeleton className="h-9 flex-1" />
                <Skeleton className="h-9 w-24 shrink-0" />
                <Skeleton className="h-9 w-24 shrink-0" />
                <Skeleton className="h-9 w-36 shrink-0" />
                <Skeleton className="h-9 w-28 shrink-0" />
              </div>
            ))}
          </div>
          <div className="lg:hidden space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-border/60 p-4 space-y-3">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-9 w-full" />
                <Skeleton className="h-9 w-full" />
                <div className="grid grid-cols-2 gap-3">
                  <Skeleton className="h-9 w-full" />
                  <Skeleton className="h-9 w-full" />
                </div>
                <Skeleton className="h-9 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground text-center pt-1">
            {t("page.purchaseOrder.add.loadingIngredients") || "Memuat data bahan..."}
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border-0 shadow-md rounded-xl">
      <div className="bg-gradient-to-r from-emerald-600/90 to-emerald-700/90 px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
              <Package size={18} className="text-white" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-semibold text-white truncate">
                {t("page.purchaseOrder.add.itemSection")}
              </h3>
              <p className="text-xs text-emerald-100 hidden sm:block">
                {t("page.purchaseOrder.add.itemSectionDesc")}
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="gap-1.5 bg-white/20 text-white hover:bg-white/30 border-0 shrink-0"
            onClick={onAddItem}>
            <Plus size={18} />
            <span className="hidden sm:inline">{t("page.purchaseOrder.add.addItem")}</span>
          </Button>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        {errors.items && (
          <div className="flex items-center gap-2 rounded-lg bg-destructive/5 border border-destructive/20 px-3 py-2 mb-4">
            <span className="text-xs text-destructive font-medium">{errors.items}</span>
          </div>
        )}

        {hasDuplicateItems && (
          <div className="flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 mb-4 dark:bg-amber-950/20 dark:border-amber-800">
            <span className="text-xs text-amber-700 dark:text-amber-400 font-medium">
              {t("page.purchaseOrder.add.validation.duplicateItems")}
            </span>
          </div>
        )}

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
              <Package size={20} className="text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">
              {t("page.purchaseOrder.add.noItem")}
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-3 gap-1.5"
              onClick={onAddItem}>
              <Plus size={16} />
              {t("page.purchaseOrder.add.addItem")}
            </Button>
          </div>
        ) : (
          <>
            {/* Desktop table view */}
            <div className="hidden lg:block">
              <div className="rounded-xl border border-border/60 overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted/50 border-b border-border/60">
                      <th className="p-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider w-10">
                        #
                      </th>
                      <th className="p-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                        {t("page.purchaseOrder.add.supplier") || "Supplier"}
                      </th>
                      <th className="p-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                        {t("page.purchaseOrder.add.itemName") || "Nama Item"}
                      </th>
                      <th className="p-3 text-center text-[11px] font-semibold text-muted-foreground uppercase tracking-wider w-24">
                        {t("page.purchaseOrder.add.qty") || "Qty"}
                      </th>
                      <th className="p-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider w-24">
                        {t("page.product.form.unit") || "Satuan"}
                      </th>
                      <th className="p-3 text-right text-[11px] font-semibold text-muted-foreground uppercase tracking-wider w-36">
                        {t("page.purchaseOrder.add.price") || "Harga"}
                      </th>
                      <th className="p-3 text-right text-[11px] font-semibold text-muted-foreground uppercase tracking-wider w-28">
                        {t("page.purchaseOrder.add.subtotal") || "Subtotal"}
                      </th>
                      <th className="p-3 w-12" />
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, idx) => {
                      return (
                        <tr
                          key={idx}
                          className="group border-b border-border/40 last:border-0 hover:bg-muted/20 transition-colors">
                          <td className="p-3 align-top w-10">
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary shrink-0">
                              {idx + 1}
                            </span>
                          </td>
                          <td className="p-3 align-top">
                            <Combobox
                              options={[
                                { value: "", label: t("page.purchaseOrder.add.selectSupplier") },
                                ...suppliers.map((sp) => ({
                                  value: sp.id || sp._id,
                                  label: sp.name
                                }))
                              ]}
                              value={item.supplierId || ""}
                              onChange={(val) => {
                                const newVal = val || null;
                                onUpdateItem(idx, "supplierId", newVal);
                                onUpdateItem(idx, "name", "");
                                onUpdateItem(idx, "price", 0);
                                onUpdateItem(idx, "ingredientId", null);
                              }}
                              placeholder={t("page.purchaseOrder.add.selectSupplier")}
                              searchPlaceholder={t("page.purchaseOrder.add.selectSupplier")}
                            />
                          </td>
                          <td className="p-3 align-top">
                            <Combobox
                              options={
                                item.supplierId
                                  ? (supplierProductsMap[item.supplierId] || []).map((p) => ({
                                      value: p.name,
                                      label: p.name
                                    }))
                                  : []
                              }
                              value={item.name || ""}
                              onChange={(val) => {
                                const name = val || "";
                                onUpdateItem(idx, "name", name);
                                if (name && item.supplierId) {
                                  const product = supplierProductsMap[item.supplierId]?.find(
                                    (p) => p.name === name
                                  );
                                  if (product) {
                                    onUpdateItem(idx, "unit", product.unit || "pcs");
                                    onUpdateItem(idx, "price", product.price || 0);
                                  }
                                }
                              }}
                              placeholder={
                                item.supplierId
                                  ? t("page.purchaseOrder.add.itemNamePlaceholder")
                                  : t("page.purchaseOrder.add.selectSupplierFirst") ||
                                    "Pilih supplier terlebih dahulu"
                              }
                              searchPlaceholder={t("page.purchaseOrder.add.itemNamePlaceholder")}
                              disabled={!item.supplierId}
                            />
                          </td>
                          <td className="p-3 align-top w-24">
                            <Input
                              placeholder={t("page.purchaseOrder.add.qty")}
                              value={item.qty || ""}
                              onChange={(e) =>
                                onUpdateItem(
                                  idx,
                                  "qty",
                                  Number(e.target.value.replace(/[^0-9]/g, "")) || 0
                                )
                              }
                              className="h-9 text-sm text-center"
                            />
                          </td>
                          <td className="p-3 align-top w-24">
                            <Combobox
                              options={unitOptions.map((opt) => ({
                                value: opt.value,
                                label: opt.label
                              }))}
                              value={item.unit}
                              onChange={(val) => {
                                const prevUnit = item.unit;
                                onUpdateItem(idx, "unit", val);
                                const suggested = getSuggestedConversion(val, prevUnit);
                                if (suggested !== 1) {
                                  onUpdateItem(idx, "conversionToBase", suggested);
                                }
                              }}
                              placeholder={t("page.product.form.unitPlaceholder")}
                              searchPlaceholder={t("page.product.form.unitPlaceholder")}
                            />
                            <div className="mt-1.5">
                              <Input
                                type="text"
                                inputMode="decimal"
                                value={item.conversionToBase ? String(item.conversionToBase) : "1"}
                                onChange={(e) =>
                                  onUpdateItem(
                                    idx,
                                    "conversionToBase",
                                    Number(e.target.value.replace(/[^0-9.]/g, "")) || 1
                                  )
                                }
                                className="h-7 text-xs text-center"
                                title={`1 ${item.unit} = ? satuan stok`}
                                aria-label={`1 ${item.unit} = ? satuan stok`}
                              />
                              <p className="text-[10px] text-muted-foreground text-center mt-0.5">
                                {"1 " + item.unit + " = ? stok"}
                              </p>
                            </div>
                          </td>
                          <td className="p-3 align-top w-36">
                            <Input
                              placeholder={t("page.purchaseOrder.add.rpPlaceholder")}
                              value={item.price ? formatIDR(item.price) : ""}
                              onChange={(e) => onUpdateItem(idx, "price", parseIDR(e.target.value))}
                              className="h-9 text-sm text-right"
                            />
                          </td>
                          <td className="p-3 align-top w-28">
                            <div className="text-right">
                              <p className="text-sm font-semibold text-foreground">
                                Rp {(item.qty * item.price).toLocaleString("id-ID")}
                              </p>
                              <p className="text-[10px] text-muted-foreground">
                                {item.qty} x {formatIDR(item.price)}
                              </p>
                            </div>
                          </td>
                          <td className="p-3 align-top w-12">
                            {items.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive/70 hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => onRemoveItem(idx)}>
                                <Trash2 size={16} />
                              </Button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Supplier price chips for desktop */}
              <div className="mt-3 space-y-2">
                {items.map((item, idx) => {
                  const suppliersForItem = getSuppliersForIngredientName
                    ? getSuppliersForIngredientName(item.ingredientId)
                    : [];
                  const itemPrices = suppliersForItem.map((s) => s.price);
                  const minPrice = itemPrices.length > 0 ? Math.min(...itemPrices) : 0;
                  return item.ingredientId && suppliersForItem.length > 0 ? (
                    <div key={idx} className="flex items-start gap-3 pl-[52px]">
                      <span className="text-[10px] text-muted-foreground font-medium mt-1 shrink-0">
                        #{idx + 1}
                      </span>
                      <SupplierPriceChips
                        suppliersForItem={suppliersForItem}
                        item={item}
                        minPrice={minPrice}
                        formatIDR={formatIDR}
                        onUpdate={onUpdateItem}
                        idx={idx}
                        t={t}
                      />
                    </div>
                  ) : null;
                })}
              </div>
            </div>

            {/* Mobile/tablet card view */}
            <div className="lg:hidden space-y-3">
              {items.map((item, idx) => {
                const suppliersForItem = getSuppliersForIngredientName
                  ? getSuppliersForIngredientName(item.ingredientId)
                  : [];
                const itemPrices = suppliersForItem.map((s) => s.price);
                const minPrice = itemPrices.length > 0 ? Math.min(...itemPrices) : 0;
                return (
                  <div
                    key={idx}
                    className="rounded-xl border border-border/60 bg-card shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between gap-2 bg-muted/30 px-4 py-2.5 border-b border-border/40">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                          {idx + 1}
                        </span>
                        <span className="text-xs font-medium text-muted-foreground">
                          {t("page.purchaseOrder.add.item") || "Item"} #{idx + 1}
                        </span>
                      </div>
                      {items.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive/70 hover:text-destructive hover:bg-destructive/10"
                          onClick={() => onRemoveItem(idx)}>
                          <Trash2 size={14} />
                        </Button>
                      )}
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">
                          {t("page.purchaseOrder.add.supplier") || "Supplier"}
                        </Label>
                        <Combobox
                          options={[
                            { value: "", label: t("page.purchaseOrder.add.selectSupplier") },
                            ...suppliers.map((sp) => ({
                              value: sp.id || sp._id,
                              label: sp.name
                            }))
                          ]}
                          value={item.supplierId || ""}
                          onChange={(val) => {
                            const newVal = val || null;
                            onUpdateItem(idx, "supplierId", newVal);
                            onUpdateItem(idx, "name", "");
                            onUpdateItem(idx, "price", 0);
                            onUpdateItem(idx, "ingredientId", null);
                          }}
                          placeholder={t("page.purchaseOrder.add.selectSupplier")}
                          searchPlaceholder={t("page.purchaseOrder.add.selectSupplier")}
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">
                          {t("page.purchaseOrder.add.itemName") || "Nama Item"}
                        </Label>
                        <Combobox
                          options={
                            item.supplierId
                              ? (supplierProductsMap[item.supplierId] || []).map((p) => ({
                                  value: p.name,
                                  label: p.name
                                }))
                              : []
                          }
                          value={item.name || ""}
                          onChange={(val) => {
                            const name = val || "";
                            onUpdateItem(idx, "name", name);
                            if (name && item.supplierId) {
                              const product = supplierProductsMap[item.supplierId]?.find(
                                (p) => p.name === name
                              );
                              if (product) {
                                onUpdateItem(idx, "unit", product.unit || "pcs");
                                onUpdateItem(idx, "price", product.price || 0);
                              }
                            }
                          }}
                          placeholder={
                            item.supplierId
                              ? t("page.purchaseOrder.add.itemNamePlaceholder")
                              : t("page.purchaseOrder.add.selectSupplierFirst") ||
                                "Pilih supplier terlebih dahulu"
                          }
                          searchPlaceholder={t("page.purchaseOrder.add.itemNamePlaceholder")}
                          disabled={!item.supplierId}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label className="text-xs text-muted-foreground">
                            {t("page.purchaseOrder.add.qty") || "Qty"}
                          </Label>
                          <Input
                            placeholder={t("page.purchaseOrder.add.qty")}
                            value={item.qty || ""}
                            onChange={(e) =>
                              onUpdateItem(
                                idx,
                                "qty",
                                Number(e.target.value.replace(/[^0-9]/g, "")) || 0
                              )
                            }
                            className="h-9 text-sm text-center"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs text-muted-foreground">
                            {t("page.product.form.unit") || "Satuan"}
                          </Label>
                          <Combobox
                            options={unitOptions.map((opt) => ({
                              value: opt.value,
                              label: opt.label
                            }))}
                            value={item.unit}
                            onChange={(val) => {
                              const prevUnit = item.unit;
                              onUpdateItem(idx, "unit", val);
                              const suggested = getSuggestedConversion(val, prevUnit);
                              if (suggested !== 1) {
                                onUpdateItem(idx, "conversionToBase", suggested);
                              }
                            }}
                            placeholder={t("page.product.form.unitPlaceholder")}
                            searchPlaceholder={t("page.product.form.unitPlaceholder")}
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">
                          {"1 " + (item.unit || "pcs") + " = ? satuan stok (konversi)"}
                        </Label>
                        <Input
                          type="text"
                          inputMode="decimal"
                          value={item.conversionToBase ? String(item.conversionToBase) : "1"}
                          onChange={(e) =>
                            onUpdateItem(
                              idx,
                              "conversionToBase",
                              Number(e.target.value.replace(/[^0-9.]/g, "")) || 1
                            )
                          }
                          className="h-9 text-sm text-center"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">
                          {t("page.purchaseOrder.add.price") || "Harga"}
                        </Label>
                        <Input
                          placeholder={t("page.purchaseOrder.add.rpPlaceholder")}
                          value={item.price ? formatIDR(item.price) : ""}
                          onChange={(e) => onUpdateItem(idx, "price", parseIDR(e.target.value))}
                          className="h-9 text-sm text-right"
                        />
                      </div>

                      <div className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2">
                        <span className="text-xs text-muted-foreground">
                          {t("page.purchaseOrder.add.subtotal") || "Subtotal"}
                        </span>
                        <span className="text-sm font-bold text-foreground">
                          Rp {(item.qty * item.price).toLocaleString("id-ID")}
                        </span>
                      </div>
                    </div>

                    {item.ingredientId && suppliersForItem.length > 0 && (
                      <div className="px-4 pb-4">
                        <SupplierPriceChips
                          suppliersForItem={suppliersForItem}
                          item={item}
                          minPrice={minPrice}
                          formatIDR={formatIDR}
                          onUpdate={onUpdateItem}
                          idx={idx}
                          t={t}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Summary section */}
            <div className="mt-6 rounded-xl bg-gradient-to-b from-muted/50 to-muted/20 border border-border/60 p-4 sm:p-5">
              <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6 justify-end">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4 sm:pt-1">
                  <div className="flex items-center gap-3">
                    <Label className="text-sm text-muted-foreground font-medium whitespace-nowrap">
                      {t("page.purchaseOrder.add.discount")}
                    </Label>
                    <Input
                      placeholder={t("page.purchaseOrder.add.rpPlaceholder")}
                      value={discount ? formatIDR(discount) : ""}
                      onChange={(e) => onDiscountChange(parseIDR(e.target.value))}
                      className="h-9 text-sm w-32 sm:w-36 text-right"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <Label className="text-sm text-muted-foreground font-medium whitespace-nowrap">
                      {t("page.purchaseOrder.add.additionalCost")}
                    </Label>
                    <Input
                      placeholder={t("page.purchaseOrder.add.rpPlaceholder")}
                      value={additionalCost ? formatIDR(additionalCost) : ""}
                      onChange={(e) => onAdditionalCostChange(parseIDR(e.target.value))}
                      className="h-9 text-sm w-32 sm:w-36 text-right"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <Label className="text-sm text-muted-foreground font-medium whitespace-nowrap">
                      {t("page.purchaseOrder.add.overDeliveryTolerance")}
                    </Label>
                    <Input
                      type="text"
                      inputMode="decimal"
                      value={overDeliveryTolerance || ""}
                      onChange={(e) =>
                        onOverDeliveryToleranceChange(
                          Number(e.target.value.replace(/[^0-9.]/g, "")) || 0
                        )
                      }
                      className="h-9 text-sm w-20 text-right"
                    />
                  </div>
                </div>
                <div className="flex-1 max-w-[280px] ml-auto">
                  <div className="text-right space-y-1">
                    <p className="text-xs text-muted-foreground">
                      {t("page.purchaseOrder.add.totalPrice")}
                    </p>
                    <p className="text-xl sm:text-2xl font-bold text-foreground">
                      Rp {totalAmount.toLocaleString("id-ID")}
                    </p>
                  </div>
                  {(discount > 0 || additionalCost > 0) && (
                    <>
                      <div className="border-t border-border/60 my-2" />
                      <div className="text-right space-y-0.5">
                        {discount > 0 && (
                          <p className="text-xs font-medium text-destructive">
                            {t("page.purchaseOrder.add.discountLabel")} - Rp{" "}
                            {discount.toLocaleString("id-ID")}
                          </p>
                        )}
                        {additionalCost > 0 && (
                          <p className="text-xs font-medium text-emerald-600">
                            {t("page.purchaseOrder.add.additionalCostLabel")} + Rp{" "}
                            {additionalCost.toLocaleString("id-ID")}
                          </p>
                        )}
                        <p className="text-base sm:text-lg font-bold text-foreground">
                          Rp {finalAmount.toLocaleString("id-ID")}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}
