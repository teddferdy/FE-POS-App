import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { useQuery } from "react-query";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import { Loading } from "@/components/ui/loading";
import { getSalesSummary } from "@/services/report";
import { getAllLocation } from "@/services/location";
import { getDateRangeForPeriod, formatCurrency, formatNumber } from "@/utils/reportUtils";
import GlobalSalesTab from "./GlobalSalesTab";
import AbortController from "@/components/organism/abort-controller";
import NoStore from "@/components/ui/NoStore";

const SalesReportPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [cookie] = useCookies();
  const user = cookie?.user;
  const isSuperAdmin = user?.roleType === "super_admin";
  const [salesPeriod, setSalesPeriod] = useState("Today");
  const [exportLoading, setExportLoading] = useState(false);

  const { data: locData } = useQuery(["locations-sales-report"], () => getAllLocation(), {
    staleTime: 5 * 60 * 1000,
    enabled: isSuperAdmin
  });

  const dateRange = getDateRangeForPeriod(salesPeriod);

  const {
    data: salesData,
    isLoading: salesLoading,
    isError,
    refetch
  } = useQuery(["sales-summary", salesPeriod], () =>
    getSalesSummary({ filter: salesPeriod.toLowerCase(), ...dateRange }),
    { keepPreviousData: true }
  );

  const handleExport = async () => {
    setExportLoading(true);
    try {
      const d = salesData?.data;
      if (!d) return;
      const rows = [
        [t("page.report.sales.title"), "", "", ""],
        [],
        [t("page.report.sales.kpi.totalCustomers"), formatNumber(d.totalCustomers || 0), "", ""],
        [t("page.report.sales.kpi.totalSales"), formatCurrency(d.totalSales || 0), "", ""],
        [],
        [
          t("page.report.sales.table.storeName"),
          t("page.report.sales.table.location"),
          t("page.report.sales.table.totalSales"),
          t("page.report.sales.table.transactions")
        ],
        ...(d.stores || []).map((s) => [s.name, s.city || "-", s.sales || 0, s.transactions || 0])
      ];
      const ws = XLSX.utils.aoa_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "SalesReport");
      XLSX.writeFile(wb, `sales-report-${salesPeriod.toLowerCase()}-${Date.now()}.xlsx`);
      toast.success(t("common.success"), { description: t("page.report.sales.exportSuccess") });
    } catch (err) {
      toast.error(t("common.error"), {
        description: err?.message || t("page.report.sales.exportFailed")
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
        <span className="text-primary font-semibold">{t("page.report.sales.title")}</span>
      </nav>

      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground tracking-tight">
            {t("page.report.sales.title")}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">{t("page.report.sales.description")}</p>
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
              {!salesData?.data && <Loading fullscreen size="lg" label={t("common.loadingData")} />}

              {salesData?.data && (
                <GlobalSalesTab
                  t={t}
                  period={salesPeriod}
                  setPeriod={setSalesPeriod}
                  data={salesData?.data}
                  isLoading={salesLoading}
                />
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SalesReportPage;
