import React from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

const TableActionLegend = ({ items = [], className }) => {
  const { t } = useTranslation();
  if (!items || items.length === 0) return null;

  return (
    <div className={cn("rounded-xl border border-border bg-card p-4", className)}>
      <h4 className="text-sm font-semibold text-foreground mb-1">{t("common.legendTitle")}</h4>
      <p className="text-xs text-muted-foreground mb-3">{t("common.legendDescription")}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
        {items.map((item, i) => {
          const Icon = item.icon;
          return (
            <div
              key={i}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border/60 bg-muted/40 text-xs text-muted-foreground">
              <span className="shrink-0">
                {React.isValidElement(Icon) ? Icon : <Icon size={15} />}
              </span>
              <span>{item.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TableActionLegend;
