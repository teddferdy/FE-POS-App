import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { useQuery } from "react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { getBestSellerReport } from "@/services/report";
import { getAllLocation } from "@/services/location";
import ExportButtons from "@/components/organism/ExportButtons";
import BestSellerTab from "./BestSellerTab";
import AbortController from "@/components/organism/abort-controller";
import NoStore from "@/components/ui/NoStore";

const BestSellingReportPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [cookie] = useCookies();
  const user = cookie?.user;
  const isSuperAdmin = user?.roleType === "super_admin";

  const { data: locData } = useQuery(["locations-best-selling"], () => getAllLocation(), {
    enabled: isSuperAdmin
  });

  const {
    data: bestSellerData,
    isLoading: bestLoading,
    isError,
    refetch
  } = useQuery(
    ["best-seller-report"],
    () => getBestSellerReport({ limit: 10, store: isSuperAdmin ? "" : user?.store || "" }),
    {}
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
        <ExportButtons reportKey="bestSeller" />
      </div>

      {locData && (locData?.data || []).length === 0 ? (
        <NoStore />
      ) : (
        <>
          {isError ? (
            <AbortController refetch={refetch} />
          ) : (
            <div className="relative min-h-[300px]">
              {bestLoading && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-card rounded-xl border border-border p-4">
                      <div className="flex items-start justify-between mb-3">
                        <Skeleton className="h-3 w-24" />
                        <Skeleton className="h-4 w-4 rounded" />
                      </div>
                      <Skeleton className="h-8 w-28 mb-2" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  ))}
                </div>
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
