import React from "react";
import { Store, Plus, Check, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

const StoreSelectCard = ({
  locations,
  selectedStores,
  onChange,
  isSuperAdmin,
  user,
  t,
  title,
  description,
  noStoreLabel,
  addStoreLabel,
  storeInfoLabel,
  allStores,
  onAllStoresChange,
  navigate
}) => {
  if (!isSuperAdmin) {
    if (selectedStores.length > 0 || user?.store) {
      return (
        <div className="bg-muted/30 rounded-lg p-4 flex items-center gap-2 text-sm text-muted-foreground">
          <Store size={16} className="shrink-0" />
          <span>
            {storeInfoLabel}{" "}
            <strong className="text-foreground">
              {user?.storeName || `Toko #${selectedStores[0] || user?.store || ""}`}
            </strong>
          </span>
        </div>
      );
    }
    return null;
  }

  const allSelected = locations.length > 0 && selectedStores.length === locations.length;

  const handleSelectAll = () => {
    onChange(allSelected ? [] : locations.map((l) => l.id));
  };

  return (
    <div className="bg-card rounded-xl shadow-sm border border-border p-4">
      <div className="flex items-center gap-3 mb-3">
        <Store size={20} className="text-primary shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">{title}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        {locations.length > 0 && !allStores && (
          <span className="text-xs text-muted-foreground shrink-0">
            {t("page.product.add.storeSection.selected", { count: selectedStores.length })}
          </span>
        )}
      </div>
      {locations.length === 0 ? (
        <div className="flex items-center gap-3 pl-9">
          <p className="text-sm text-muted-foreground">{noStoreLabel}</p>
          <Button size="sm" onClick={() => navigate("/add-location")} className="gap-1.5 shrink-0">
            <Plus size={16} />
            {addStoreLabel}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div
            className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
              allStores
                ? "bg-primary/10 border-primary"
                : "bg-background border-border hover:border-primary/50 cursor-pointer"
            }`}
            onClick={() => {
              if (!allStores) {
                onAllStoresChange?.(true);
                onChange([]);
              }
            }}>
            <div
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                allStores ? "border-primary" : "border-muted-foreground"
              }`}>
              {allStores && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
            </div>
            <div className="flex-1 min-w-0">
              <p
                className={`text-sm font-medium ${allStores ? "text-primary" : "text-foreground"}`}>
                {t("page.category.form.storeSection.allStores")}
              </p>
              <p className="text-xs text-muted-foreground">
                {t("page.category.form.storeSection.allStoresDesc")}
              </p>
            </div>
            {allStores && <Check size={16} className="text-primary shrink-0 mt-0.5" />}
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                {t("page.category.form.storeSection.orSpecific")}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            {locations.length > 1 && !allStores && (
              <button
                type="button"
                onClick={handleSelectAll}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors bg-background border-border text-muted-foreground hover:border-primary/50 hover:text-foreground">
                <div
                  className={`w-4 h-4 rounded border flex items-center justify-center ${
                    allSelected
                      ? "bg-primary border-primary text-primary-foreground"
                      : "border-muted-foreground"
                  }`}>
                  {allSelected && <Check size={12} strokeWidth={3} />}
                </div>
                {t("common.selectAll")}
              </button>
            )}
            <div className="flex flex-wrap gap-2">
              {locations.map((loc) => {
                const isChecked = selectedStores.includes(loc.id);
                return (
                  <button
                    key={loc.id}
                    type="button"
                    onClick={() => {
                      if (allStores) {
                        onAllStoresChange?.(false);
                        onChange([loc.id]);
                      } else {
                        onChange(
                          isChecked
                            ? selectedStores.filter((id) => id !== loc.id)
                            : [...selectedStores, loc.id]
                        );
                      }
                    }}
                    className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                      allStores
                        ? "bg-muted/30 border-border/50 text-muted-foreground/50"
                        : isChecked
                          ? "bg-primary/10 border-primary text-primary"
                          : "bg-background border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                    }`}>
                    {loc.name}
                    {isChecked && <Check size={14} strokeWidth={2.5} />}
                  </button>
                );
              })}
            </div>
            {allStores && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/40 border border-border/50">
                <Info size={14} className="text-muted-foreground shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground">
                  {t("page.category.form.storeSection.allStoresDisableHint", {
                    allStores: t("page.category.form.storeSection.allStores")
                  })}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StoreSelectCard;
