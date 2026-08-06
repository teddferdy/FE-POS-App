/* eslint-disable react/prop-types */
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

const TableToolbar = ({ title, onReset, isFiltered, children }) => {
  const { t } = useTranslation();
  const [showFilters, setShowFilters] = useState(false);
  const filters = React.Children.toArray(children).filter(Boolean);

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex items-center justify-between gap-3">
        <h4 className="text-base font-semibold text-foreground shrink-0">{title}</h4>
        <Button
          variant={showFilters ? "default" : "outline"}
          size="sm"
          className="gap-2 h-9 lg:hidden"
          onClick={() => setShowFilters(!showFilters)}>
          <span className="material-symbols-outlined text-base">filter_list</span>
          {t("common.filter")}
        </Button>
      </div>
      <div
        className={`${showFilters ? "flex" : "hidden"} lg:flex flex-col sm:flex-row sm:flex-wrap lg:flex-nowrap items-end gap-3 w-full`}>
        {filters.map((filter, i) => (
          <div
            key={i}
            className="flex flex-col gap-1.5 min-w-0 flex-1 basis-full sm:basis-[calc(50%-0.375rem)] lg:basis-0">
            {filter}
          </div>
        ))}
        {onReset && (
          <div className="flex flex-col gap-1.5 shrink-0">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              &nbsp;
            </label>
            <Button
              variant="outline"
              size="sm"
              className="h-10 gap-1.5"
              onClick={onReset}
              disabled={isFiltered === undefined ? false : !isFiltered}>
              <RotateCcw size={14} />
              {t("common.resetFilter")}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TableToolbar;
