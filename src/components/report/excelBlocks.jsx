import React from "react";
import { Store, MapPin, Phone } from "lucide-react";
import { excelColumnLabel } from "./excelHelpers";

const hexToRgba = (hex, alpha) => {
  if (!hex) return `rgba(15, 23, 42, ${alpha})`;
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export function ExcelBrandHeader({ accent, branding, t }) {
  const showLogo = branding?.showLogo;
  const showAddress = branding?.showAddress;
  const showPhone = branding?.showPhone;
  const hasBrand = showLogo || showAddress || showPhone;

  if (!hasBrand) return null;

  return (
    <div
      className="flex flex-wrap items-center justify-between gap-3 rounded-t-lg px-5 py-4"
      style={{ backgroundColor: accent }}>
      <div className="flex items-center gap-3">
        {showLogo && (
          <span
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg"
            style={{ backgroundColor: hexToRgba("#ffffff", 0.2) }}>
            <Store size={22} className="text-white" />
          </span>
        )}
        <div className="min-w-0">
          <div className="text-lg font-bold leading-tight text-white">
            {t("page.reportSettings.previewBrandName")}
          </div>
          {showAddress && (
            <div className="mt-0.5 text-[11px] leading-snug text-white/80">
              {t("page.reportSettings.previewBrandAddress")}
            </div>
          )}
        </div>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1 text-right text-white/90">
        {showAddress && (
          <span className="flex items-center gap-1.5 text-[11px]">
            <MapPin size={11} />
            <span className="text-xs">{t("page.reportSettings.previewBrandCity")}</span>
          </span>
        )}
        {showPhone && (
          <span className="flex items-center gap-1.5 text-[11px]">
            <Phone size={11} />
            <span className="text-xs">(+62) 812-3456-7890</span>
          </span>
        )}
      </div>
    </div>
  );
}

export function ExcelTitleBlock({ accent, title, subtitle, t }) {
  return (
    <div className="px-5 pb-1 pt-4 text-center">
      <div className="text-lg font-bold uppercase tracking-wide" style={{ color: accent }}>
        {title}
      </div>
      <div className="mt-0.5 text-xs text-muted-foreground">
        {subtitle || t("page.reportSettings.previewPeriod")}
      </div>
      <div className="mx-auto mt-2 h-0.5 w-16 rounded-full" style={{ backgroundColor: accent }} />
    </div>
  );
}

export function ExcelInfoBlock({ t }) {
  return (
    <div className="flex items-center justify-between px-5 pb-2 pt-1 text-[11px] text-muted-foreground">
      <span>{t("page.reportSettings.previewGenerated")}</span>
      <span>{t("page.reportSettings.previewSheetNo", { no: 1 })}</span>
    </div>
  );
}

export function ExcelTable({ columns, rows, accent, alignRightKeys = [] }) {
  return (
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
        </tr>
      </thead>
      <tbody>
        {rows.map((row, ri) => (
          <tr key={ri} className={ri % 2 === 1 ? "bg-slate-50" : ""}>
            <td className="border border-slate-200 px-1 py-1.5 text-center text-muted-foreground">
              {ri + 1}
            </td>
            {columns.map((col) => (
              <td
                key={col.key}
                className={`border border-slate-200 px-3 py-1.5 ${
                  col.type === "currency" || alignRightKeys.includes(col.key)
                    ? "font-mono tabular-nums text-right"
                    : "text-left"
                }`}>
                {row[col.key] ?? "-"}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function ExcelTotalsRow({ label, value, accent }) {
  return (
    <div
      className="flex items-center justify-between rounded-md border-t-2 px-4 py-2 text-sm font-bold"
      style={{ borderColor: accent }}>
      <span>{label}</span>
      <span className="font-mono tabular-nums">{value}</span>
    </div>
  );
}

export function ExcelSignatureBlock({ t }) {
  const signatures = [
    { key: "prepared", label: t("page.reportSettings.sigPreparedBy") },
    { key: "known", label: t("page.reportSettings.sigKnownBy") },
    { key: "approved", label: t("page.reportSettings.sigApprovedBy") }
  ];
  return (
    <div className="mt-6 px-5">
      <div className="grid grid-cols-3 gap-6 border-t border-slate-300 pt-4">
        {signatures.map((sig) => (
          <div key={sig.key} className="text-center">
            <div className="text-xs font-semibold text-slate-600">{sig.label}</div>
            <div className="mt-6 h-8" />
            <div className="border-b border-slate-400" />
            <div className="mt-1 text-[11px] text-slate-500">
              {t("page.reportSettings.sigDate")}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ExcelFooter({ t }) {
  return (
    <div className="mt-5 border-t border-slate-200 px-5 pb-3 pt-3 text-center text-[11px] italic text-muted-foreground">
      {t("page.reportSettings.previewPdfFooter")}
    </div>
  );
}
