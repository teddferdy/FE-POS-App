import React from "react";
import { useTranslation } from "react-i18next";
import { AlertTriangle, Clock } from "lucide-react";
import { formatCurrencyRupiah } from "@/utils/formatter-currency";

const DashboardAlerts = ({ apData, isLoading }) => {
  const { t } = useTranslation();

  if (isLoading) return null;
  if (!apData || !apData.data) return null;

  const { summary, outstandingPOs } = apData.data;

  // Calculate upcoming deadlines (next 7 days)
  const now = new Date();
  const nextWeek = new Date();
  nextWeek.setDate(now.getDate() + 7);

  const upcomingPOs = (outstandingPOs || []).filter((po) => {
    if (!po.dueDate) return false;
    const dueDate = new Date(po.dueDate);
    return dueDate >= now && dueDate <= nextWeek;
  });

  if (!summary || (summary.outstandingPOCount === 0 && upcomingPOs.length === 0)) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      {summary.outstandingPOCount > 0 && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-destructive/20 p-2 rounded-full text-destructive">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h4 className="font-semibold text-destructive">
                {t("page.dashboard.unpaidInvoices")}
              </h4>
              <p className="text-sm text-destructive/80">
                {summary.outstandingPOCount} {t("page.dashboard.outstandingPOs")}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-destructive">
              {formatCurrencyRupiah(summary.totalOutstanding || 0)}
            </p>
          </div>
        </div>
      )}

      {upcomingPOs.length > 0 && (
        <div className="bg-amber-100/50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-amber-200 dark:bg-amber-800 p-2 rounded-full text-amber-700 dark:text-amber-300">
              <Clock size={20} />
            </div>
            <div>
              <h4 className="font-semibold text-amber-700 dark:text-amber-200">
                {t("page.dashboard.upcomingDeadlines")}
              </h4>
              <p className="text-sm text-amber-600 dark:text-amber-400">
                {upcomingPOs.length} {t("page.dashboard.upcomingPOs")}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardAlerts;
