import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Settings2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import HorizontalScrollArea from "@/components/ui/HorizontalScrollArea";
import AbortController from "@/components/organism/abort-controller";
import { useReportData } from "@/queries/useReportData";
import { useUserSession } from "@/hooks/useUserSession";
import { hasMenuAccess } from "@/utils/permission";
import { columnLabel, formatReportValue } from "@/utils/reportFormat";

const NUMERIC_TYPES = ["number", "currency", "percent"];
const ALIGN_CLASS = { left: "text-left", right: "text-right" };
const NO_KEYS = [];
const NO_PARAMS = {};

// The on-screen table of a report. It shows the columns chosen in
// /report/settings, in that order, with the same rows, values and totals
// as the PDF/Excel/CSV export of the report (GET /report/data/:key with the
// same params as <ExportButtons>).
const ReportTable = ({
  reportKey,
  params = NO_PARAMS,
  title = null,
  emptyText = null,
  signedKeys = NO_KEYS,
  queryOptions = NO_PARAMS
}) => {
  const { t } = useTranslation();
  const user = useUserSession();
  const {
    data: report,
    isLoading,
    isError,
    error,
    refetch
  } = useReportData(reportKey, params, queryOptions);
  const canEditSettings = hasMenuAccess(user, "/report/settings", ["view"]);

  const columns = report?.columns || [];
  const rows = report?.rows || [];
  const totals = report?.totals || null;
  const accent = report?.accentColor || "#0f172a";
  const alignOf = (col) =>
    ALIGN_CLASS[col.align === "right" || NUMERIC_TYPES.includes(col.type) ? "right" : "left"];
  const toneOf = (col, value) => {
    if (!signedKeys.includes(col.key)) return "";
    return Number(value) < 0 ? "text-destructive" : "text-emerald-600 dark:text-emerald-400";
  };

  return (
    <div
      className="overflow-hidden rounded-xl border border-border border-t-[3px] bg-card shadow-sm"
      style={{ borderTopColor: accent }}
      data-testid={`report-table-${reportKey}`}>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-5 py-3">
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-foreground">{title}</h3>
          {report?.subtitle && <p className="text-xs text-muted-foreground">{report.subtitle}</p>}
        </div>
        {canEditSettings && (
          <Link
            to={`/report/settings?report=${reportKey}`}
            className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
            <Settings2 size={14} />
            {t("page.reportTable.columnSettings")}
          </Link>
        )}
      </div>

      {isError ? (
        <div className="p-4">
          <AbortController refetch={refetch} error={error} />
        </div>
      ) : isLoading ? (
        <div className="space-y-2 p-5" aria-busy="true">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <p className="px-5 py-12 text-center text-sm text-muted-foreground">
          {emptyText || t("page.reportTable.empty")}
        </p>
      ) : (
        <HorizontalScrollArea>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    scope="col"
                    className={`whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground ${alignOf(col)}`}>
                    {columnLabel(t, reportKey, col)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((row, ri) => (
                <tr key={ri} className="transition-colors hover:bg-muted/30">
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`whitespace-nowrap px-4 py-3 ${alignOf(col)} ${
                        NUMERIC_TYPES.includes(col.type) ? "tabular-nums" : ""
                      } ${toneOf(col, row[col.key])}`}>
                      {formatReportValue(row[col.key], col.type) || "-"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
            {totals && (
              <tfoot>
                <tr
                  className="border-t-2 bg-muted/30 font-semibold"
                  style={{ borderTopColor: accent }}>
                  {columns.map((col, ci) => (
                    <td
                      key={col.key}
                      className={`whitespace-nowrap px-4 py-3 tabular-nums ${alignOf(col)}`}>
                      {col.key in totals
                        ? formatReportValue(totals[col.key], col.type)
                        : ci === 0
                          ? t("page.reportTable.total")
                          : ""}
                    </td>
                  ))}
                </tr>
              </tfoot>
            )}
          </table>
        </HorizontalScrollArea>
      )}
    </div>
  );
};

ReportTable.propTypes = {
  reportKey: PropTypes.string.isRequired,
  params: PropTypes.object,
  title: PropTypes.node,
  emptyText: PropTypes.node,
  // columns coloured green when >= 0 and red when negative (profit, margin…)
  signedKeys: PropTypes.arrayOf(PropTypes.string),
  queryOptions: PropTypes.object
};

export default ReportTable;
