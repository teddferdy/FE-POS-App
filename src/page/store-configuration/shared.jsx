import React from "react";
import { useTranslation } from "react-i18next";
import { Skeleton } from "@/components/ui/skeleton";
import { STORE_CATEGORY_LABEL_KEYS, isTerminalStoreStatus } from "@/lib/store-configuration";

const STATUS_TONES = {
  active: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
  inactive: "bg-muted text-muted-foreground border-border",
  draft: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20"
};
const TERMINAL_TONE = "bg-destructive/10 text-destructive border-destructive/20";

// Status shown as text (never color alone).
export const StoreStatusPill = ({ status }) => {
  const { t } = useTranslation();
  if (!status) return <span className="text-xs text-muted-foreground">-</span>;
  const tone = isTerminalStoreStatus(status)
    ? TERMINAL_TONE
    : STATUS_TONES[status] || STATUS_TONES.inactive;
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${tone}`}>
      {t(`page.storeConfiguration.status.${status}`, { defaultValue: status })}
    </span>
  );
};

// Known categories use the existing location labels; any other persisted
// value is shown as stored.
export const useCategoryLabel = () => {
  const { t } = useTranslation();
  return (category) => {
    const key = STORE_CATEGORY_LABEL_KEYS[category];
    return key ? t(key) : category || "-";
  };
};

export const StoreConfigurationSkeleton = () => (
  <div className="mx-auto w-full max-w-5xl space-y-6" aria-busy="true">
    <div className="space-y-2">
      <Skeleton className="h-4 w-40" />
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-80 max-w-full" />
    </div>
    <div className="rounded-xl border border-border bg-card p-4 md:p-6 space-y-4">
      <Skeleton className="h-5 w-48" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  </div>
);
