import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { useQuery } from "react-query";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import { Loading } from "@/components/ui/loading";
import { getBestSellerReport } from "@/services/report";
import { getAllLocation } from "@/services/location";
import { formatCurrency, formatNumber } from "@/utils/reportUtils";
import BestSellerTab from "./BestSellerTab";
import AbortController from "@/components/organism/abort-controller";
import NoStore from "@/components/ui/NoStore";

const BestSellingReportPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [cookie] = useCookies();
  const user = cookie?.user;
  const isSuperAdmin = user?.roleType === "super_admin";
  const [exportLoading, setExportLoading] = useState(false);

  const { data: locData } = useQuery(["locations-best-selling"], () => getAllLocation(), {
    staleTime: 5 * 60 * 1000,
    enabled: isSuperAdmin
  });

  const {
    data: bestSellerData,
    isLoading: bestLoading,
    isError,
    refetch
  } = useQuery(["best-seller-report"], () => getBestSellerReport({ limit: 10 }), {
    keepPreviousData: true
  });

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
      toast.success(t("common.success"), {
        description: t("page.report.bestSeller.exportSuccess")
      });
    } catch (err) {
      toast.error(t("common.error"), {
        description: err?.message || t("page.report.bestSeller.exportFailed")
      });
    } finally {
      setExportLoading(false);
    }
  };

  return (
    <div data-tour="page-reports" className="space-y-6">
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <button
          onClick={() => navigate("/dashboard-super-admin")}
          className="hover:text-foreground transition-colors">
          {t("breadcrumb.home")}
        </button>
        <span className="text-xs">/</span>
        <span className="text-primary font-semibold">{t("page.report.bestSeller.title")}</span>
      </nav>

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

      {locData && (locData?.data || []).length === 0 ? (
        <NoStore />
      ) : (
        <>
          {isError ? (
            <AbortController refetch={refetch} />
          ) : (
            <div className="relative min-h-[300px]">
              {!bestSellerData?.data && (
                <Loading fullscreen size="lg" label={t("common.loadingData")} />
              )}

              {bestSellerData?.data && (
                <BestSellerTab t={t} data={bestSellerData?.data} isLoading={bestLoading} />
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BestSellingReportPage;
