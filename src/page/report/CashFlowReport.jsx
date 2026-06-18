import React, { useState } from "react";
import { useQuery } from "react-query";
import { useTranslation } from "react-i18next";
import { getCashFlow } from "@/services/report";
import { Card, CardContent } from "@/components/ui/card";
import PageHeader from "@/components/ui/PageHeader";
import { Loading } from "@/components/ui/loading";
import { format } from "date-fns";
import { DatePicker } from "@/components/ui/date-picker";
import { formatCurrency } from "@/utils/reportUtils";
import AbortController from "@/components/organism/abort-controller";

const CashFlowReport = () => {
  const { t } = useTranslation();
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

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

  if (isError) return <AbortController refetch={refetch} />;

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
      <div>
        <div>
          <PageHeader
            breadcrumbs={[
              { i18nKey: "breadcrumb.home" },
              { i18nKey: "page.report.cashFlow.title" }
            ]}
            title={t("page.report.cashFlow.title")}
            description={t("page.report.cashFlow.description")}>
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
        </div>
      </div>
    </div>
  );
};

export default CashFlowReport;
