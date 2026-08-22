import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { HelpCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ponytail: legend berupa modal — tidak lagi makan ruang vertikal di atas tabel.
// API props tetap (items, className) agar pemanggil lama tidak perlu diubah.
const TableActionLegend = ({ items = [], className }) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  if (!items || items.length === 0) return null;

  return (
    <div className={cn(className)}>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
            <HelpCircle size={14} />
            {t("common.legend")}
          </Button>
        </DialogTrigger>
        <DialogContent className="w-[calc(100vw-2rem)] max-w-md">
          <DialogHeader>
            <DialogTitle>{t("common.legendTitle")}</DialogTitle>
            <DialogDescription>{t("common.legendDescription")}</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-2">
            {items.map((item, i) => {
              const Icon = item.icon;
              return (
                <div
                  key={i}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg border border-border/60 bg-muted/40 text-sm text-muted-foreground">
                  <span className="shrink-0">
                    {React.isValidElement(Icon) ? Icon : <Icon size={16} />}
                  </span>
                  <span>{item.label}</span>
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TableActionLegend;
