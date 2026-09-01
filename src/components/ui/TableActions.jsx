import React from "react";
import { MoreHorizontal } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import DynamicIcon from "@/components/ui/DynamicIcon";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from "@/components/ui/dropdown-menu";

const ActionIcon = ({ item }) => {
  if (item.icon) {
    const Icon = item.icon;
    return <Icon size={16} />;
  }
  if (item.iconName) {
    return <DynamicIcon name={item.iconName} size={16} />;
  }
  return null;
};

const TableActions = ({ items = [], visible = 2, align = "center", disabled = false }) => {
  const { t } = useTranslation();
  const shown = items.filter((it) => it && !it.hidden && !it.ifFalse);
  if (shown.length === 0) return null;

  const visibleCount = visible >= 0 ? visible : 2;
  const kebabOnly = shown.length > 2;
  const inline = kebabOnly ? [] : shown.slice(0, visibleCount);
  const overflow = kebabOnly ? shown : shown.slice(visibleCount);

  const iconButtonClass = (item) =>
    cn(
      "p-1.5 rounded-lg text-muted-foreground transition-all",
      item.danger
        ? "hover:text-destructive hover:bg-destructive/10"
        : "hover:text-primary hover:bg-primary/10"
    );

  if (overflow.length === 0) {
    return (
      <div
        className={cn(
          "flex items-center gap-1",
          align === "right" ? "justify-end" : "justify-center"
        )}>
        {inline.map((item, i) => (
          <button
            key={i}
            type="button"
            disabled={disabled || item.disabled}
            onClick={(e) => {
              e.stopPropagation();
              item.onClick?.(e);
            }}
            title={item.label}
            className={cn(
              iconButtonClass(item),
              (disabled || item.disabled) && "opacity-40 cursor-not-allowed"
            )}>
            <ActionIcon item={item} />
          </button>
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center gap-1",
        align === "right" ? "justify-end" : "justify-center"
      )}>
      {inline.map((item, i) => (
        <button
          key={i}
          type="button"
          disabled={disabled || item.disabled}
          onClick={(e) => {
            e.stopPropagation();
            item.onClick?.(e);
          }}
          title={item.label}
          className={cn(
            iconButtonClass(item),
            (disabled || item.disabled) && "opacity-40 cursor-not-allowed"
          )}>
          <ActionIcon item={item} />
        </button>
      ))}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            disabled={disabled}
            onClick={(e) => e.stopPropagation()}
            title={t("common.actions")}
            aria-label={t("common.actions")}
            className={cn(
              "h-10 w-10 rounded-lg outline-none flex items-center justify-center text-muted-foreground transition-all hover:text-primary hover:bg-primary/10",
              disabled && "opacity-40 cursor-not-allowed"
            )}>
            <MoreHorizontal size={18} />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {overflow.map((item, i) => (
            <DropdownMenuItem
              key={i}
              disabled={disabled || item.disabled}
              onSelect={(e) => {
                e.stopPropagation();
                item.onClick?.(e);
              }}
              className={cn(
                "gap-2 cursor-pointer",
                item.danger && "text-destructive focus:text-destructive"
              )}>
              <ActionIcon item={item} />
              <span>{item.label}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default TableActions;
