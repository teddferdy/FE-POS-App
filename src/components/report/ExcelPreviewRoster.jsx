import React from "react";
import { useTranslation } from "react-i18next";
import {
  ExcelBrandHeader,
  ExcelTitleBlock,
  ExcelInfoBlock,
  ExcelTable,
  ExcelSignatureBlock,
  ExcelFooter
} from "./excelBlocks";

const SAMPLE_ROWS = [
  {
    cashier: "Budi Santoso",
    totalSales: "Rp 46.200.000",
    transactions: "320",
    avgTransaction: "Rp 144.375",
    itemsSold: "1.240",
    accuracyRate: "98%"
  },
  {
    cashier: "Siti Rahayu",
    totalSales: "Rp 41.850.000",
    transactions: "298",
    avgTransaction: "Rp 140.436",
    itemsSold: "1.105",
    accuracyRate: "97%"
  },
  {
    cashier: "Andi Wijaya",
    totalSales: "Rp 38.400.000",
    transactions: "275",
    avgTransaction: "Rp 139.636",
    itemsSold: "990",
    accuracyRate: "99%"
  }
];

export default function ExcelPreviewRoster({ accent, columns, branding }) {
  const { t } = useTranslation();
  const alignRightKeys = columns
    .filter((c) => c.type === "number" || c.type === "currency" || c.type === "percent")
    .map((c) => c.key);

  return (
    <div className="space-y-1 bg-white">
      <ExcelBrandHeader accent={accent} branding={branding} t={t} />
      <ExcelTitleBlock accent={accent} title={t("page.reportSettings.archetype.roster")} t={t} />
      <ExcelInfoBlock t={t} />
      <div className="overflow-x-auto px-4">
        <ExcelTable
          columns={columns}
          rows={SAMPLE_ROWS}
          accent={accent}
          alignRightKeys={alignRightKeys}
        />
      </div>
      <div className="flex justify-between px-4 text-xs font-bold">
        <span>{t("page.reportSettings.previewTotal")}</span>
        <span className="text-muted-foreground">3 {t("page.reportSettings.previewEmployees")}</span>
      </div>
      <ExcelSignatureBlock t={t} />
      <ExcelFooter t={t} />
    </div>
  );
}
