import React, { useState } from "react";
import { useQuery } from "react-query";
import { useTranslation } from "react-i18next";
import { getDailyReport } from "@/services/report";
import { Card } from "@/components/ui/card";
import PageHeader from "@/components/ui/PageHeader";
import { Loading } from "@/components/ui/loading";
import { format } from "date-fns";
import { DatePicker } from "@/components/ui/date-picker";
import { formatCurrency } from "@/utils/reportUtils";
import AbortController from "@/components/organism/abort-controller";

const DailyReport = () => {
  const { t } = useTranslation();
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

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

  if (isError) return <AbortController refetch={refetch} />;

  return (
    <div className="space-y-6">
      <div>
        <div>
          <PageHeader
            breadcrumbs={[{ i18nKey: "breadcrumb.home" }, { i18nKey: "page.report.daily.title" }]}
            title={t("page.report.daily.title")}
            description={t("page.report.daily.description")}>
            <div className="flex items-center gap-2">
              <DatePicker date={startDate} setDate={setStartDate} />
              <DatePicker date={endDate} setDate={setEndDate} />
            </div>
          </PageHeader>
        </div>
      </div>

      <div>
        <div>
          {isLoading ? (
            <Loading fullscreen size="lg" label={t("page.report.daily.loading")} />
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
        </div>
      </div>
    </div>
  );
};

export default DailyReport;
