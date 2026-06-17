import React, { useState } from "react";
import { useQuery } from "react-query";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { getProfitLoss } from "@/services/report";
import { Card, CardContent } from "@/components/ui/card";
import PageHeader from "@/components/ui/PageHeader";
import { Loading } from "@/components/ui/loading";
import { format } from "date-fns";
import { DatePicker } from "@/components/ui/date-picker";
import { formatCurrency } from "@/utils/reportUtils";

const ProfitLossReport = () => {
  const { t } = useTranslation();
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  const { data, isLoading } = useQuery(
    ["profit-loss", startDate, endDate],
    () =>
      getProfitLoss({
        startDate: format(startDate, "yyyy-MM-dd"),
        endDate: format(endDate, "yyyy-MM-dd")
      }),
    { staleTime: 30000 }
  );

  const pl = data?.data || {};

  const summaryCards = [
    {
      labelKey: "page.report.profitLoss.card.totalRevenue",
      value: pl.totalRevenue,
      color: "text-green-600"
    },
    {
      labelKey: "page.report.profitLoss.card.netRevenue",
      value: pl.netRevenue,
      color: "text-blue-600"
    },
    {
      labelKey: "page.report.profitLoss.card.totalHpp",
      value: pl.totalHpp,
      color: "text-orange-600"
    },
    {
      labelKey: "page.report.profitLoss.card.grossProfit",
      value: pl.grossProfit,
      color: "text-purple-600"
    },
    {
      labelKey: "page.report.profitLoss.card.margin",
      value: pl.marginPersen != null ? `${pl.marginPersen}%` : null,
      color: "text-primary"
    }
  ];

  return (
    <motion.div initial="hidden" animate="show" variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } }} className="space-y-6">
      <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
      <PageHeader
        breadcrumbs={[{ i18nKey: "breadcrumb.home" }, { i18nKey: "page.report.profitLoss.title" }]}
        title={t("page.report.profitLoss.title")}
        description={t("page.report.profitLoss.description")}>
        <div className="flex items-center gap-2">
          <DatePicker date={startDate} setDate={setStartDate} />
          <DatePicker date={endDate} setDate={setEndDate} />
        </div>
      </PageHeader>
      </motion.div>

      <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
      {isLoading ? (
        <Loading fullscreen size="lg" label={t("page.report.profitLoss.loading")} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {summaryCards.map((card) => (
            <motion.div key={card.labelKey} variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
            <Card>
              <CardContent className="p-5">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  {t(card.labelKey)}
                </p>
                <p className={`text-xl font-bold ${card.color}`}>
                  {card.value != null
                    ? typeof card.value === "number"
                      ? formatCurrency(card.value)
                      : card.value
                    : "-"}
                </p>
              </CardContent>
            </Card>
            </motion.div>
          ))}
        </div>
      )}
      </motion.div>
    </motion.div>
  );
};

export default ProfitLossReport;
