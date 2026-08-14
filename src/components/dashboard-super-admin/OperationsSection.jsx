/* eslint-disable react/prop-types */
import React from "react";
import {
  Package,
  AlertTriangle,
  Factory,
  Banknote,
  ListOrdered,
  CalendarCheck2,
  Boxes
} from "lucide-react";
import SectionCard from "./SectionCard";
import { formatCurrencyRupiah } from "@/utils/formatter-currency";
import { hasOwn, safeGet } from "@/lib/safe-lookup";

const PROD_STATUS = {
  draft: { label: "Draft", color: "text-muted-foreground", bg: "bg-muted" },
  planned: {
    label: "Terencana",
    color: "text-sky-600 dark:text-sky-400",
    bg: "bg-sky-100 dark:bg-sky-900/30"
  },
  in_progress: {
    label: "Berjalan",
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-100 dark:bg-amber-900/30"
  },
  completed: {
    label: "Selesai",
    color: "text-green-600 dark:text-green-400",
    bg: "bg-green-100 dark:bg-green-900/30"
  },
  cancelled: {
    label: "Batal",
    color: "text-destructive",
    bg: "bg-destructive/10"
  }
};

const OperationsSection = ({ operations }) => {
  const lowStock = operations?.lowStockItems || [];
  const production = operations?.production || {};
  const register = operations?.cashRegister || { open: 0, closed: 0 };

  const prodSummary = ["draft", "planned", "in_progress", "completed", "cancelled"]
    .filter((s) => hasOwn(production, s) && production[s] > 0)
    .map((s) => ({ status: s, ...safeGet(PROD_STATUS, s, {}) }));

  return (
    <SectionCard
      icon={Package}
      title="Operasional"
      subtitle="Stok, produksi, kasir, dan kapasitas layanan"
      bodyClassName="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <div className="bg-muted/40 rounded-lg p-3">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
            <Boxes size={12} /> Nilai Stok
          </p>
          <p className="text-base font-bold text-foreground">
            {formatCurrencyRupiah(operations?.stockValue || 0)}
          </p>
        </div>
        <div className="bg-muted/40 rounded-lg p-3">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
            <Banknote size={12} /> Kasir Terbuka
          </p>
          <p className="text-base font-bold text-foreground">
            {register.open || 0}{" "}
            <span className="text-xs font-normal text-muted-foreground">
              dari {register.open + register.closed || 0}
            </span>
          </p>
        </div>
        <div className="bg-muted/40 rounded-lg p-3">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
            <ListOrdered size={12} /> Antrian
          </p>
          <p className="text-base font-bold text-foreground">
            {operations?.queueWaiting || 0}{" "}
            <span className="text-xs font-normal text-muted-foreground">menunggu</span>
          </p>
        </div>
        <div className="bg-muted/40 rounded-lg p-3">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
            <CalendarCheck2 size={12} /> Reservasi Hari Ini
          </p>
          <p className="text-base font-bold text-foreground">
            {operations?.reservationsToday || 0}
          </p>
        </div>
        <div className="bg-muted/40 rounded-lg p-3">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
            <Factory size={12} /> Produksi
          </p>
          <div className="flex flex-wrap gap-1 mt-1">
            {prodSummary.length === 0 && (
              <span className="text-sm text-muted-foreground">Tidak ada</span>
            )}
            {prodSummary.map((s) => (
              <span
                key={s.status}
                className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${s.bg} ${s.color}`}>
                {s.label}: {production[s.status]}
              </span>
            ))}
          </div>
        </div>
        <div className="bg-muted/40 rounded-lg p-3">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
            <AlertTriangle size={12} /> Stok Menipis
          </p>
          <p className="text-base font-bold text-destructive">
            {operations?.lowStockCount || 0} item
          </p>
        </div>
      </div>

      <div>
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <AlertTriangle size={13} className="text-destructive" />
          Item Stok Menipis
        </p>
        {lowStock.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4 bg-muted/30 rounded-lg">
            Semua stok aman
          </p>
        ) : (
          <div className="overflow-x-auto -mx-5 px-5">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50 text-muted-foreground">
                  <th className="text-left px-3 py-2.5 font-medium rounded-l-lg">Item</th>
                  <th className="text-left px-3 py-2.5 font-medium">Tipe</th>
                  <th className="text-left px-3 py-2.5 font-medium">Store</th>
                  <th className="text-right px-3 py-2.5 font-medium rounded-r-lg">Stok / Min</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {lowStock.slice(0, 8).map((item) => (
                  <tr
                    key={`${item.type}-${item.id}`}
                    className="hover:bg-accent/30 transition-colors">
                    <td className="px-3 py-2.5 font-medium text-foreground">{item.name}</td>
                    <td className="px-3 py-2.5">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase ${
                          item.type === "product"
                            ? "bg-primary/10 text-primary"
                            : "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400"
                        }`}>
                        {item.type === "product" ? "Produk" : "Bahan"}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-muted-foreground">{item.storeName}</td>
                    <td className="px-3 py-2.5 text-right font-mono text-xs">
                      <span className="text-destructive font-semibold">{item.stock}</span>
                      <span className="text-muted-foreground">
                        {" "}
                        / {item.minStock} {item.unit}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </SectionCard>
  );
};

export default OperationsSection;
