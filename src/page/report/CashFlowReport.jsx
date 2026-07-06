import React, { useState } from "react";
import { useQuery } from "react-query";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { getCashFlow } from "@/services/report";
import { getAllLocation } from "@/services/location";
import { Card, CardContent } from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";
import { format } from "date-fns";
import { DatePicker } from "@/components/ui/date-picker";
import { formatCurrency } from "@/utils/reportUtils";
import AbortController from "@/components/organism/abort-controller";
import NoStore from "@/components/ui/NoStore";

const CashFlowReport = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [cookie] = useCookies();
  const user = cookie?.user;
  const isSuperAdmin = user?.roleType === "super_admin";
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  const { data: locData } = useQuery(["locations-cash-flow"], () => getAllLocation(), {
    staleTime: 5 * 60 * 1000,
    enabled: isSuperAdmin
  });

  const { data, isLoading, isError, refetch } = useQuery(
    ["cash-flow", startDate, endDate],
    () =>
      getCashFlow({
        startDate: format(startDate, "yyyy-MM-dd"),
        endDate: format(endDate, "yyyy-MM-dd")
      }),
    { staleTime: 30000 }
  );

  const cf = data?.data || {};

  const summaryCards = [
    {
      labelKey: "page.report.cashFlow.card.cashReceipt",
      value: cf.penerimaanTunai,
      color: "text-green-600"
    },
    {
      labelKey: "page.report.cashFlow.card.qrisReceipt",
      value: cf.penerimaanQris,
      color: "text-blue-600"
    },
    {
      labelKey: "page.report.cashFlow.card.transferReceipt",
      value: cf.penerimaanTransfer,
      color: "text-purple-600"
    },
    {
      labelKey: "page.report.cashFlow.card.totalInflow",
      value: cf.totalKasMasuk,
      color: "text-primary",
      bold: true
    }
  ];

  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <button
          onClick={() => navigate("/dashboard-super-admin")}
          className="hover:text-foreground transition-colors">
          {t("breadcrumb.home")}
        </button>
        <span className="text-xs">/</span>
        <span className="text-primary font-semibold">{t("page.report.cashFlow.title")}</span>
      </nav>

      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground tracking-tight">
            {t("page.report.cashFlow.title")}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {t("page.report.cashFlow.description")}
          </p>
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
            <Loading fullscreen size="lg" label={t("page.report.cashFlow.loading")} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {summaryCards.map((card) => (
                <Card key={card.labelKey}>
                  <CardContent className="p-5">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                      {t(card.labelKey)}
                    </p>
                    <p className={`text-xl font-bold ${card.color}`}>
                      {cf != null && card.value != null ? formatCurrency(card.value) : "-"}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CashFlowReport;
