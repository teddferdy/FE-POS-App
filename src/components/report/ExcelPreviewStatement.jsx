import React from "react";
import { useTranslation } from "react-i18next";
import {
  ExcelBrandHeader,
  ExcelTitleBlock,
  ExcelInfoBlock,
  ExcelSignatureBlock,
  ExcelFooter
} from "./excelBlocks";

const incomeRows = [
  { keterangan: "Penjualan Tunai", nominal: "Rp 5.000.000" },
  { keterangan: "Piutang Masuk", nominal: "Rp 1.200.000" }
];
const expenseRows = [
  { keterangan: "Pembelian Stok", nominal: "Rp 3.000.000" },
  { keterangan: "Gaji Karyawan", nominal: "Rp 1.500.000" }
];

function SectionTable({ title, rows, accent, t, labelKey }) {
  return (
    <div className="space-y-1">
      <div className="text-xs font-bold uppercase tracking-wide text-slate-700">{labelKey}</div>
      <table className="w-full border-collapse overflow-hidden text-xs">
        <thead>
          <tr>
            <th
              className="border border-slate-200 px-3 py-2 text-left font-medium text-white"
              style={{ backgroundColor: accent }}>
              {t("page.reportSettings.previewKeterangan")}
            </th>
            <th
              className="border border-slate-200 px-3 py-2 text-right font-medium text-white"
              style={{ backgroundColor: accent }}>
              {t("page.reportSettings.previewNominal")}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} className={ri % 2 === 1 ? "bg-slate-50" : ""}>
              <td className="border border-slate-200 px-3 py-1.5">{row.keterangan}</td>
              <td className="border border-slate-200 px-3 py-1.5 text-right font-mono tabular-nums">
                {row.nominal}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div
        className="flex justify-between border-t-2 px-3 py-1.5 text-xs font-bold"
        style={{ borderColor: accent }}>
        <span className="uppercase">
          {title} {t("page.reportSettings.previewSubtotal")}
        </span>
        <span className="font-mono tabular-nums">
          {rows
            .reduce((s, r) => s + Number(r.nominal.replace(/[^0-9]/g, "") || 0), 0)
            .toLocaleString("id-ID")}
        </span>
      </div>
    </div>
  );
}

export default function ExcelPreviewStatement({ accent, branding }) {
  const { t } = useTranslation();
  const incomeTotal = incomeRows.reduce(
    (s, r) => s + Number(r.nominal.replace(/[^0-9]/g, "") || 0),
    0
  );
  const expenseTotal = expenseRows.reduce(
    (s, r) => s + Number(r.nominal.replace(/[^0-9]/g, "") || 0),
    0
  );
  const saldo = incomeTotal - expenseTotal;

  return (
    <div className="space-y-3 bg-white">
      <ExcelBrandHeader accent={accent} branding={branding} t={t} />
      <ExcelTitleBlock accent={accent} title={t("page.reportSettings.archetype.statement")} t={t} />
      <ExcelInfoBlock t={t} />
      <div className="space-y-4 px-4">
        <SectionTable
          title={t("page.reportSettings.previewIncome")}
          labelKey={t("page.reportSettings.previewIncome")}
          rows={incomeRows}
          accent={accent}
          t={t}
        />
        <SectionTable
          title={t("page.reportSettings.previewExpense")}
          labelKey={t("page.reportSettings.previewExpense")}
          rows={expenseRows}
          accent={accent}
          t={t}
        />
        <div
          className="flex items-center justify-between rounded-md px-4 py-2.5 text-sm font-bold text-white"
          style={{ backgroundColor: accent }}>
          <span className="uppercase tracking-wide">{t("page.reportSettings.previewSaldo")}</span>
          <span className="font-mono tabular-nums">Rp {saldo.toLocaleString("id-ID")}</span>
        </div>
      </div>
      <ExcelSignatureBlock t={t} />
      <ExcelFooter t={t} />
    </div>
  );
}
