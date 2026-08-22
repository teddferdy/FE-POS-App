import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Search, X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const NavigationModal = ({ open, onOpenChange, categories = [] }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const inputRef = useRef(null);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const flatItems = useMemo(() => {
    const items = [];
    categories.forEach((cat) => {
      cat.sections?.forEach((section) => {
        section.items?.forEach((item) => {
          items.push({
            ...item,
            categoryTitle: cat.title,
            categoryI18nKey: cat.i18nKey,
            sectionTitle: section.title,
            sectionI18nKey: section.i18nKey
          });
        });
      });
    });
    return items;
  }, [categories]);

  const filtered = useMemo(() => {
    if (!query.trim()) return flatItems;
    const q = query.toLowerCase();
    return flatItems.filter((item) => {
      const label = (t(item.i18nKey) || item.title).toLowerCase();
      return label.includes(q) || item.href?.toLowerCase().includes(q);
    });
  }, [query, flatItems, t]);

  const groupedFiltered = useMemo(() => {
    const groups = {};
    filtered.forEach((item) => {
      const key = item.sectionTitle;
      if (!groups[key]) {
        groups[key] = {
          title: item.sectionTitle,
          i18nKey: item.sectionI18nKey,
          categoryTitle: item.categoryTitle,
          categoryI18nKey: item.categoryI18nKey,
          items: []
        };
      }
      groups[key].items.push(item);
    });
    return Object.values(groups);
  }, [filtered]);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery("");
      setSelectedIndex(0);
    }
  }, [open]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleSelect = useCallback(
    (href) => {
      if (!href) return;
      navigate(href);
      onOpenChange(false);
    },
    [navigate, onOpenChange]
  );

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter" && filtered[selectedIndex]) {
        handleSelect(filtered[selectedIndex].href);
      } else if (e.key === "Escape") {
        onOpenChange(false);
      }
    },
    [filtered, selectedIndex, handleSelect, onOpenChange]
  );

  useEffect(() => {
    const handleGlobalKey = (e) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    if (open) document.addEventListener("keydown", handleGlobalKey);
    return () => document.removeEventListener("keydown", handleGlobalKey);
  }, [open, onOpenChange]);

  const isActive = (href) => {
    if (!href) return false;
    return location.pathname === href || location.pathname.startsWith(href + "/");
  };

  let globalIndex = -1;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent withX={false} className="sm:max-w-lg p-0 gap-0 overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <Search size={18} className="text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none"
            placeholder={t("commandPalette.placeholder") || "Cari menu..."}
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="shrink-0 p-1 rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
              <X size={14} />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground bg-muted rounded border border-border">
            ESC
          </kbd>
        </div>

        <div className="max-h-[60vh] overflow-y-auto py-2 px-2">
          {groupedFiltered.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              {t("commandPalette.notFound", { query }) || `Menu "${query}" tidak ditemukan`}
            </div>
          ) : (
            groupedFiltered.map((group) => (
              <div key={group.title} className="mb-3">
                <div className="px-3 py-1.5 flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/50">
                    {t(group.i18nKey) || group.title}
                  </span>
                  <div className="flex-1 border-t border-border/30" />
                </div>
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    globalIndex++;
                    const idx = globalIndex;
                    const label = t(item.i18nKey) || item.title;
                    const active = isActive(item.href);
                    return (
                      <button
                        key={item.href}
                        onClick={() => handleSelect(item.href)}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-left transition-all duration-150",
                          active
                            ? "bg-primary/10 text-primary font-medium"
                            : selectedIndex === idx
                              ? "bg-accent text-foreground"
                              : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                        )}>
                        {item.icon && <item.icon size={16} className="shrink-0" />}
                        <span className="flex-1 truncate">{label}</span>
                        {active && (
                          <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NavigationModal;
