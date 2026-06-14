import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "react-query";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import { Loading } from "@/components/ui/loading";
import { getBestSellerReport } from "@/services/report";
import { formatCurrency, formatNumber } from "@/utils/reportUtils";
import BestSellerTab from "./BestSellerTab";

const BestSellingReportPage = () => {
  const { t } = useTranslation();
  const [exportLoading, setExportLoading] = useState(false);

  const { data: bestSellerData, isLoading: bestLoading } = useQuery(["best-seller-report"], () =>
    getBestSellerReport({ limit: 10 })
  );

  const handleExport = async () => {
    setExportLoading(true);
    try {
      const d = bestSellerData?.data;
      if (!d) return;
      const rows = (d.bestSellers || []).map((p, i) => ({
        [t("page.report.bestSeller.table.rank")]: `#${i + 1}`,
        [t("page.report.bestSeller.table.productName")]: p.name,
        [t("page.report.bestSeller.table.totalSold")]: formatNumber(p.sold),
        [t("page.report.bestSeller.table.revenue")]: formatCurrency(p.revenue)
      }));
      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "BestSeller");
      XLSX.writeFile(wb, `best-seller-${Date.now()}.xlsx`);
      toast.success(t("common.success"), { description: t("page.report.bestSeller.exportSuccess") });
    } catch (err) {
      toast.error(t("common.error"), { description: err?.message || t("page.report.bestSeller.exportFailed") });
    } finally {
      setExportLoading(false);
    }
  };

  return (
    <div data-tour="page-reports" className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground tracking-tight">
            {t("page.report.bestSeller.title")}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {t("page.report.bestSeller.description")}
          </p>
        </div>
        <button
          disabled={exportLoading}
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm font-semibold text-foreground hover:bg-muted/50 transition-all disabled:opacity-50">
          <span className="material-symbols-outlined text-lg">download</span>
          {exportLoading ? t("common.downloading") : t("common.export")}
        </button>
      </div>

      <div className="relative min-h-[300px]">
        {!bestSellerData?.data && <Loading fullscreen size="lg" label={t("common.loadingData")} />}

        {bestSellerData?.data && (
          <BestSellerTab t={t} data={bestSellerData?.data} isLoading={bestLoading} />
        )}
      </div>
    </div>
  );
};

export default BestSellingReportPage;
