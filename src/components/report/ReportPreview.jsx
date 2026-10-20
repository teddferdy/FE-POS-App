import React from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { Store } from "lucide-react";
import HorizontalScrollArea from "@/components/ui/HorizontalScrollArea";
import { formatReportValue } from "@/utils/reportFormat";
import { excelColumnLabel } from "./excelHelpers";

// A sample of what the export of a report looks like with the current
// settings. It follows the BE renderers (api/service/reportExporter): brand
// block (logo / address / phone / email switches), title, the selected
// columns in order with an accent-coloured header, totals row, and for
// Excel the ranking / cash-flow layouts, signature block and footer.

const SAMPLE_TEXT = {
  name: ["Nasi Goreng Spesial", "Es Teh Manis", "Mie Ayam Bakso"],
  productName: ["Nasi Goreng Spesial", "Es Teh Manis", "Mie Ayam Bakso"],
  product: ["Nasi Goreng Spesial", "Es Teh Manis", "Mie Ayam Bakso"],
  category: ["Makanan", "Minuman", "Camilan"],
  cashier: ["Budi Santoso", "Siti Rahayu", "Andi Wijaya"],
  city: ["Kota Bandung", "Kota Bekasi", "Kota Bogor"],
  keterangan: ["Penjualan Tunai", "Penjualan QRIS", "Pembelian Stok"]
};
const SAMPLE_NUMBERS = {
  currency: [1285000, 940000, 615000],
  number: [42, 35, 18],
  percent: [32.5, 28, 21.75],
  date: ["2026-10-01", "2026-10-02", "2026-10-03"]
};

const sampleValue = (col, i) => {
  if (SAMPLE_NUMBERS[col.type]) return SAMPLE_NUMBERS[col.type][i];
  return (SAMPLE_TEXT[col.key] || ["Item A", "Item B", "Item C"])[i];
};

const ROWS = [0, 1, 2];
const isNumeric = (col) => ["currency", "number", "percent"].includes(col.type);
const alignClass = (col) => (isNumeric(col) ? "text-right tabular-nums" : "text-left");

const BrandBlock = ({ branding, t }) => {
  const lines = [
    branding.showAddress && t("page.reportSettings.previewBrandAddress"),
    branding.showAddress && t("page.reportSettings.previewBrandCity"),
    branding.showPhone && t("page.reportSettings.previewBrandPhone"),
    branding.showEmail && t("page.reportSettings.previewBrandEmail")
  ].filter(Boolean);
  return (
    <div className="flex items-start gap-3">
      {branding.showLogo && (
        <span
          className="flex h-12 w-14 shrink-0 items-center justify-center rounded-md border border-dashed border-slate-300 bg-slate-50 text-slate-400"
          title={t("page.reportSettings.logoHint")}>
          <Store size={20} />
        </span>
      )}
      <div className="min-w-0">
        <p className="text-base font-bold text-slate-900">
          {t("page.reportSettings.previewBrandName")}
        </p>
        {lines.map((line) => (
          <p key={line} className="text-[11px] leading-snug text-slate-500">
            {line}
          </p>
        ))}
      </div>
    </div>
  );
};

const SampleTable = ({ columns, rows, accent, totals, excel, ranking, t }) => {
  const visibleTotals = totals.filter((key) => columns.some((c) => c.key === key));
  const sum = (col) => rows.reduce((acc, i) => acc + Number(sampleValue(col, i) || 0), 0);
  const cell = "border border-slate-200 px-3 py-1.5";
  return (
    <HorizontalScrollArea>
      <table className="w-full border-collapse text-xs text-slate-800">
        <thead>
          {excel && (
            <tr className="bg-slate-100 text-[10px] text-slate-400">
              {[
                ...(ranking ? ["#"] : []),
                ...columns.map((c) => c.key),
                ...(ranking ? ["share"] : [])
              ].map((key, i) => (
                <th key={key} className="border border-slate-200 px-2 py-0.5 font-normal">
                  {excelColumnLabel(i)}
                </th>
              ))}
            </tr>
          )}
          <tr style={{ backgroundColor: accent }} className="text-white">
            {ranking && <th className={`${cell} w-10 text-center font-semibold`}>#</th>}
            {columns.map((col) => (
              <th key={col.key} className={`${cell} font-semibold ${alignClass(col)}`}>
                {col.label}
              </th>
            ))}
            {ranking && (
              <th className={`${cell} text-right font-semibold`}>
                {t("page.reportSettings.previewShare")}
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {rows.map((i) => (
            <tr key={i} className={i % 2 === 1 ? "bg-slate-50" : "bg-white"}>
              {ranking && <td className={`${cell} text-center`}>{i + 1}</td>}
              {columns.map((col) => (
                <td key={col.key} className={`${cell} ${alignClass(col)}`}>
                  {formatReportValue(sampleValue(col, i), col.type)}
                </td>
              ))}
              {ranking && (
                <td className={`${cell} text-right tabular-nums`}>
                  {formatReportValue([45, 33, 22][i], "percent")}
                </td>
              )}
            </tr>
          ))}
        </tbody>
        {visibleTotals.length > 0 && (
          <tfoot>
            <tr className="border-t-2 bg-white font-bold" style={{ borderTopColor: accent }}>
              {ranking && (
                <td className={`${cell} text-center`}>{t("page.reportSettings.previewTotal")}</td>
              )}
              {columns.map((col, ci) => (
                <td key={col.key} className={`${cell} ${alignClass(col)}`}>
                  {visibleTotals.includes(col.key)
                    ? formatReportValue(sum(col), col.type)
                    : ci === 0 && !ranking
                      ? t("page.reportSettings.previewTotal")
                      : ""}
                </td>
              ))}
              {ranking && <td className={cell} />}
            </tr>
          </tfoot>
        )}
      </table>
    </HorizontalScrollArea>
  );
};

const StatementSections = ({ columns, accent, t }) => {
  const [labelCol, amountCol] = columns;
  const section = (titleKey, rows) => (
    <div className="space-y-1">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-700">{t(titleKey)}</p>
      <HorizontalScrollArea>
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr style={{ backgroundColor: accent }} className="text-white">
              <th className="border border-slate-200 px-3 py-1.5 text-left">{labelCol.label}</th>
              {amountCol && (
                <th className="border border-slate-200 px-3 py-1.5 text-right">
                  {amountCol.label}
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map(([label, amount]) => (
              <tr key={label}>
                <td className="border border-slate-200 px-3 py-1.5">{label}</td>
                {amountCol && (
                  <td className="border border-slate-200 px-3 py-1.5 text-right tabular-nums">
                    {formatReportValue(amount, "currency")}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </HorizontalScrollArea>
    </div>
  );
  return (
    <div className="space-y-4">
      {section("page.reportSettings.previewIncome", [
        ["Penjualan Tunai", 5000000],
        ["Penjualan QRIS", 1200000]
      ])}
      {section("page.reportSettings.previewExpense", [
        ["Pembelian Stok", 3000000],
        ["Biaya Operasional", 1500000]
      ])}
      <div
        className="flex justify-between border-t-2 px-3 py-2 text-sm font-bold"
        style={{ borderTopColor: accent }}>
        <span>{t("page.reportSettings.previewSaldo")}</span>
        <span className="tabular-nums">{formatReportValue(1700000, "currency")}</span>
      </div>
    </div>
  );
};

const ReportPreview = ({
  variant,
  title = "",
  archetype = "summary",
  columns,
  totals = [],
  accent,
  branding
}) => {
  const { t } = useTranslation();
  const excel = variant === "excel";

  if (columns.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        {t("page.reportSettings.previewEmpty")}
      </p>
    );
  }

  const body =
    excel && archetype === "statement" && columns.length >= 1 ? (
      <StatementSections columns={columns} accent={accent} t={t} />
    ) : (
      <SampleTable
        columns={columns}
        rows={ROWS}
        accent={accent}
        totals={totals}
        excel={excel}
        ranking={excel && archetype === "ranking"}
        t={t}
      />
    );

  return (
    <div
      className="space-y-4 bg-white p-6 text-slate-900"
      data-testid={`report-preview-${variant}`}>
      <BrandBlock branding={branding} t={t} />
      <div className="border-t border-slate-200 pt-3">
        <p className="text-sm font-bold">{title}</p>
        <p className="text-[11px] text-slate-500">{t("page.reportSettings.previewPeriod")}</p>
        {excel && (
          <p className="mt-1 text-[10px] text-slate-400">
            {t("page.reportSettings.previewGenerated")}
          </p>
        )}
      </div>
      {body}
      {excel && (
        <div className="grid grid-cols-3 gap-6 pt-4 text-center text-[11px] text-slate-600">
          {["sigPreparedBy", "sigKnownBy", "sigApprovedBy"].map((key) => (
            <div key={key}>
              <p className="border-b border-slate-400 pb-6">{t(`page.reportSettings.${key}`)}</p>
            </div>
          ))}
        </div>
      )}
      <p className="pt-2 text-center text-[10px] italic text-slate-500">
        {excel ? t("page.reportSettings.previewPdfFooter") : t("page.reportSettings.previewPage")}
      </p>
    </div>
  );
};

ReportPreview.propTypes = {
  variant: PropTypes.oneOf(["pdf", "excel"]).isRequired,
  title: PropTypes.node,
  archetype: PropTypes.string,
  columns: PropTypes.arrayOf(
    PropTypes.shape({ key: PropTypes.string, label: PropTypes.node, type: PropTypes.string })
  ).isRequired,
  totals: PropTypes.arrayOf(PropTypes.string),
  accent: PropTypes.string.isRequired,
  branding: PropTypes.object.isRequired
};

export default ReportPreview;
