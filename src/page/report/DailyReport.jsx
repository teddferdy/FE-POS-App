import React, { useState } from "react";
import { useQuery } from "react-query";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { getDailyReport } from "@/services/report";
import { getAllLocation } from "@/services/location";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { DatePicker } from "@/components/ui/date-picker";
import { formatCurrency } from "@/utils/reportUtils";
import AbortController from "@/components/organism/abort-controller";
import NoStore from "@/components/ui/NoStore";

const DailyReport = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [cookie] = useCookies();
  const user = cookie?.user;
  const isSuperAdmin = user?.roleType === "super_admin";
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  const { data: locData } = useQuery(["locations-daily-report"], () => getAllLocation(), {
    staleTime: 5 * 60 * 1000,
    enabled: isSuperAdmin
  });

  const { data, isLoading, isError, refetch } = useQuery(
    ["daily-report", startDate, endDate],
    () =>
      getDailyReport({
        startDate: format(startDate, "yyyy-MM-dd"),
        endDate: format(endDate, "yyyy-MM-dd")
      }),
    { staleTime: 30000 }
  );

  const reports = data?.data || [];

  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <button
          onClick={() => navigate("/dashboard-super-admin")}
          className="hover:text-foreground transition-colors">
          {t("breadcrumb.home")}
        </button>
        <span className="text-xs">/</span>
        <span className="text-primary font-semibold">{t("page.report.daily.title")}</span>
      </nav>

      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground tracking-tight">
            {t("page.report.daily.title")}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">{t("page.report.daily.description")}</p>
        </div>
        <div className="flex items-center gap-2">
          <DatePicker date={startDate} setDate={setStartDate} />
          <DatePicker date={endDate} setDate={setEndDate} />
        </div>
      </div>

      {locData && (locData?.data || []).length === 0 ? (
        <NoStore />
      ) : (
        <>
          {isError ? (
            <AbortController refetch={refetch} />
          ) : isLoading ? (
            <div className="bg-card rounded-xl border border-border p-4">
              <div className="flex items-start justify-between mb-3">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-4 w-4 rounded" />
              </div>
              <Skeleton className="h-8 w-28 mb-2" />
              <Skeleton className="h-3 w-20" />
            </div>
          ) : reports.length === 0 ? (
            <div className="bg-card rounded-xl border border-border p-12 text-center">
              <p className="text-muted-foreground">{t("page.report.daily.noData")}</p>
            </div>
          ) : (
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/60 border-b">
                      <th className="px-3 py-3 text-left font-semibold text-muted-foreground text-xs uppercase">
                        {t("page.report.daily.table.date")}
                      </th>
                      <th className="px-3 py-3 text-right font-semibold text-muted-foreground text-xs uppercase">
                        {t("page.report.daily.table.transactions")}
                      </th>
                      <th className="px-3 py-3 text-right font-semibold text-muted-foreground text-xs uppercase">
                        {t("page.report.daily.table.sales")}
                      </th>
                      <th className="px-3 py-3 text-right font-semibold text-muted-foreground text-xs uppercase">
                        {t("page.report.daily.table.hpp")}
                      </th>
                      <th className="px-3 py-3 text-right font-semibold text-muted-foreground text-xs uppercase">
                        {t("page.report.daily.table.foodCost")}
                      </th>
                      <th className="px-3 py-3 text-right font-semibold text-muted-foreground text-xs uppercase">
                        {t("page.report.daily.table.grossProfit")}
                      </th>
                      <th className="px-3 py-3 text-right font-semibold text-muted-foreground text-xs uppercase">
                        {t("page.report.daily.table.netProfit")}
                      </th>
                      <th className="px-3 py-3 text-right font-semibold text-muted-foreground text-xs uppercase">
                        {t("page.report.daily.table.covers")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((r) => (
                      <tr key={r.id} className="border-b border-muted/30 hover:bg-muted/15">
                        <td className="px-3 py-3">{r.tanggal}</td>
                        <td className="px-3 py-3 text-right">{r.totalTransaksi}</td>
                        <td className="px-3 py-3 text-right">
                          {formatCurrency(r.totalPenjualanBersih)}
                        </td>
                        <td className="px-3 py-3 text-right">{formatCurrency(r.totalHpp)}</td>
                        <td className="px-3 py-3 text-right">{r.foodCostPersen}%</td>
                        <td className="px-3 py-3 text-right">{formatCurrency(r.grossProfit)}</td>
                        <td className="px-3 py-3 text-right font-semibold">
                          {formatCurrency(r.netProfit)}
                        </td>
                        <td className="px-3 py-3 text-right">{r.totalCovers}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default DailyReport;
