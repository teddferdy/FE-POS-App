import React from "react";
import { Store } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

const StoreFilter = ({ locations = [], value = "", onChange, isSuperAdmin, t }) => {
  if (!isSuperAdmin || locations.length === 0) return null;

  return (
    <div className="flex items-center gap-2">
      <Store size={16} className="text-muted-foreground shrink-0" />
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder={t?.("header.selectStore") || "Pilih Toko"} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t?.("page.category.form.storeSection.allStores") || "Semua Toko"}</SelectItem>
          {locations.map((loc) => (
            <SelectItem key={loc.id} value={String(loc.id)}>
              {loc.name || loc.storeName || `Toko #${loc.id}`}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default StoreFilter;
