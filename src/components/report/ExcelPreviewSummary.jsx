import React from "react";
import { useTranslation } from "react-i18next";
import {
  ExcelBrandHeader,
  ExcelTitleBlock,
  ExcelInfoBlock,
  ExcelTable,
  ExcelTotalsRow,
  ExcelSignatureBlock,
  ExcelFooter
} from "./excelBlocks";

const SAMPLE_ROWS = [
  { tanggal: "01/01/2024", netProfit: "Rp 1.250.000", sales: "Rp 5.000.000" },
  { tanggal: "02/01/2024", netProfit: "Rp 980.000", sales: "Rp 4.200.000" },
  { tanggal: "03/01/2024", netProfit: "Rp 1.100.000", sales: "Rp 4.800.000" }
];

export default function ExcelPreviewSummary({ accent, columns, branding }) {
  const { t } = useTranslation();
  const currencyKeys = columns.filter((c) => c.type === "currency").map((c) => c.key);

  return (
    <div className="space-y-1 bg-white">
      <ExcelBrandHeader accent={accent} branding={branding} t={t} />
      <ExcelTitleBlock accent={accent} title={t("page.reportSettings.archetype.summary")} t={t} />
      <ExcelInfoBlock t={t} />
      <div className="overflow-x-auto px-4">
        <ExcelTable
          columns={columns}
          rows={SAMPLE_ROWS}
          accent={accent}
          alignRightKeys={currencyKeys}
        />
      </div>
      <div className="px-4">
        <ExcelTotalsRow
          label={t("page.reportSettings.previewTotal")}
          value="Rp 3.330.000"
          accent={accent}
        />
      </div>
      <ExcelSignatureBlock t={t} />
      <ExcelFooter t={t} />
    </div>
  );
}
