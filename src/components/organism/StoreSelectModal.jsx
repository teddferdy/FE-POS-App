import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Store, Plus, Check, Info, LayoutGrid } from "lucide-react";
import Modal from "@/components/organism/modal";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const StoreSelectModal = ({
  open,
  onOpenChange,
  locations = [],
  locationsLoading = false,
  selectedStores = [],
  allStores = false,
  onConfirm,
  mandatory = true,
  noStoreLabel,
  addStoreLabel
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [draftStores, setDraftStores] = useState(selectedStores);
  const [draftAll, setDraftAll] = useState(allStores);

  useEffect(() => {
    if (open) {
      setDraftStores(selectedStores);
      setDraftAll(allStores);
    }
  }, [open, selectedStores, allStores]);

  const isValid = draftAll || draftStores.length > 0;
  const allSelected = locations.length > 0 && draftStores.length === locations.length;

  const handleSelectAll = () => setDraftStores(allSelected ? [] : locations.map((l) => l.id));

  const tabs = [
    { id: "all", label: t("page.category.form.storeSection.allStores"), icon: Store },
    { id: "specific", label: t("page.category.form.storeSection.specificTab"), icon: LayoutGrid }
  ];

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      type="form"
      title={t("page.expense.form.storeSection.modalTitle")}
      description={t("page.expense.form.storeSection.modalDesc")}
      confirmText={t("common.save")}
      confirmDisabled={mandatory && !isValid}
      onCancel={() => setDraftStores(selectedStores)}
      onConfirm={() => {
        if (!isValid) return false;
        onConfirm?.(draftStores, draftAll);
      }}>
      {locationsLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-[72px] w-full rounded-lg" />
        </div>
      ) : locations.length === 0 ? (
        <div className="flex items-center gap-3">
          <p className="text-sm text-muted-foreground">{noStoreLabel || t("common.noStore")}</p>
          <Button size="sm" onClick={() => navigate("/add-location")} className="gap-1.5 shrink-0">
            <Plus size={16} />
            {addStoreLabel || t("common.addStore")}
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-1 p-1 bg-muted rounded-lg">
            {tabs.map((tab) => {
              const isActive = draftAll ? tab.id === "all" : tab.id === "specific";
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    if (isActive) return;
                    if (tab.id === "all") setDraftAll(true);
                    else setDraftAll(false);
                  }}
                  className={cn(
                    "flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive
                      ? "bg-background text-primary shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}>
                  <TabIcon size={14} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {draftAll ? (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/40 border border-border/50">
              <Info size={14} className="text-muted-foreground shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground">
                {t("page.category.form.storeSection.allStoresDesc")}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {locations.length > 1 && (
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors bg-background border-border text-muted-foreground hover:border-primary/50 hover:text-foreground">
                  <div
                    className={cn(
                      "w-4 h-4 rounded border flex items-center justify-center",
                      allSelected
                        ? "bg-primary border-primary text-primary-foreground"
                        : "border-muted-foreground"
                    )}>
                    {allSelected && <Check size={12} strokeWidth={3} />}
                  </div>
                  {t("common.selectAll")}
                </button>
              )}
              <div className="flex flex-wrap gap-2">
                {locations.map((loc) => {
                  const isChecked = draftStores.includes(loc.id);
                  return (
                    <button
                      key={loc.id}
                      type="button"
                      onClick={() =>
                        setDraftStores(
                          isChecked
                            ? draftStores.filter((id) => id !== loc.id)
                            : [...draftStores, loc.id]
                        )
                      }
                      className={cn(
                        "inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-colors",
                        isChecked
                          ? "bg-primary/10 border-primary text-primary"
                          : "bg-background border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                      )}>
                      {loc.name}
                      {isChecked && <Check size={14} strokeWidth={2.5} />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};

export default StoreSelectModal;
