import React from "react";
import { useTranslation } from "react-i18next";
import {
  ExcelBrandHeader,
  ExcelTitleBlock,
  ExcelInfoBlock,
  ExcelSignatureBlock,
  ExcelFooter
} from "./excelBlocks";
import { excelColumnLabel } from "./excelHelpers";

const SAMPLE_ROWS = [
  { name: "Nasi Goreng Spesial", sold: "150", revenue: "Rp 5.250.000" },
  { name: "Mie Ayam Bakso", sold: "128", revenue: "Rp 4.480.000" },
  { name: "Es Teh Manis", sold: "112", revenue: "Rp 1.120.000" }
];

const SHARES = [0.35, 0.3, 0.26];

export default function ExcelPreviewRanking({ accent, columns, branding }) {
  const { t } = useTranslation();
  const alignRightKeys = columns
    .filter((c) => c.type === "number" || c.type === "currency")
    .map((c) => c.key);

  return (
    <div className="space-y-1 bg-white">
      <ExcelBrandHeader accent={accent} branding={branding} t={t} />
      <ExcelTitleBlock accent={accent} title={t("page.reportSettings.archetype.ranking")} t={t} />
      <ExcelInfoBlock t={t} />
      <div className="overflow-x-auto px-4">
        <table className="w-full border-collapse overflow-hidden text-xs">
          <thead>
            <tr>
              <th
                className="w-9 border border-slate-200 px-1 py-2 text-center font-medium text-white"
                style={{ backgroundColor: accent }}>
                #
              </th>
              {columns.map((col, ci) => (
                <th
                  key={col.key}
                  className="border border-slate-200 px-3 py-2 text-left font-medium text-white"
                  style={{ backgroundColor: accent }}>
                  <span className="mr-1.5 font-normal opacity-70">{excelColumnLabel(ci)}</span>
                  {col.label}
                </th>
              ))}
              <th
                className="border border-slate-200 px-3 py-2 text-right font-medium text-white"
                style={{ backgroundColor: accent }}>
                {t("page.reportSettings.previewShare")}
              </th>
            </tr>
          </thead>
          <tbody>
            {SAMPLE_ROWS.map((row, ri) => (
              <tr key={ri} className={ri % 2 === 1 ? "bg-slate-50" : ""}>
                <td className="border border-slate-200 px-1 py-1.5 text-center font-medium">
                  {ri + 1}
                </td>
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`border border-slate-200 px-3 py-1.5 ${
                      alignRightKeys.includes(col.key)
                        ? "text-right font-mono tabular-nums"
                        : "text-left"
                    }`}>
                    {row[col.key] ?? "-"}
                  </td>
                ))}
                <td className="border border-slate-200 px-3 py-1.5 text-right font-mono tabular-nums">
                  <div className="flex items-center justify-end gap-1.5">
                    <span className="inline-block h-2 w-8 overflow-hidden rounded-full bg-slate-100">
                      <span
                        className="block h-full rounded-full"
                        style={{
                          width: `${SHARES[ri] * 100}%`,
                          backgroundColor: accent,
                          opacity: 0.7
                        }}
                      />
                    </span>
                    {(SHARES[ri] * 100).toFixed(1)}%
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-between px-4 text-xs font-bold">
        <span>{t("page.reportSettings.previewTotal")}</span>
        <span className="text-muted-foreground">3 {t("page.reportSettings.previewItems")}</span>
      </div>
      <ExcelSignatureBlock t={t} />
      <ExcelFooter t={t} />
    </div>
  );
}
