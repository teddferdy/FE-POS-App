import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { useQuery } from "react-query";
import { getSalesSummary } from "@/services/report";
import { getAllLocation } from "@/services/location";
import ExportButtons from "@/components/organism/ExportButtons";
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

  const { data: locData } = useQuery(["locations-sales-report"], () => getAllLocation(), {
    enabled: isSuperAdmin
  });

  const {
    data: salesData,
    isLoading: salesLoading,
    isError,
    refetch
  } = useQuery(["sales-summary", salesPeriod], () =>
    getSalesSummary({ period: salesPeriod.toLowerCase() })
  );

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
        <ExportButtons
          reportKey="sales"
          buildParams={() => ({
            filter: salesPeriod.toLowerCase()
          })}
        />
      </div>

      {locData && (locData?.data || []).length === 0 ? (
        <NoStore />
      ) : (
        <>
          {isError ? (
            <AbortController refetch={refetch} />
          ) : (
            <div className="relative min-h-[300px]">
              <GlobalSalesTab
                t={t}
                period={salesPeriod}
                setPeriod={setSalesPeriod}
                data={salesData?.data}
                isLoading={salesLoading}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SalesReportPage;
