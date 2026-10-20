// Formats a report cell exactly like the BE export formatter
// (api/service/reportExporter/formatters.js), so a value on screen reads the
// same as in the PDF/Excel/CSV of that report.

const MONTHS_ID = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des"
];

const toNumber = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

// "2026-09-01" is a calendar date: read it as a local date, not UTC midnight.
const toDate = (value) => {
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [y, m, d] = value.split("-").map(Number);
    return new Date(y, m - 1, d);
  }
  return new Date(value);
};

export const formatReportDate = (value) => {
  if (!value) return "";
  const d = toDate(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return `${String(d.getDate()).padStart(2, "0")} ${MONTHS_ID[d.getMonth()]} ${d.getFullYear()}`;
};

export const formatReportValue = (value, type) => {
  if (value === null || value === undefined) return "";
  switch (type) {
    case "number":
      return toNumber(value).toLocaleString("id-ID");
    case "currency":
      return `Rp ${toNumber(value).toLocaleString("id-ID")}`;
    case "percent":
      // whole-number percent: margin 12.5 = 12,5%
      return `${toNumber(value).toLocaleString("id-ID", { maximumFractionDigits: 2 })}%`;
    case "date":
      return formatReportDate(value);
    default:
      return String(value);
  }
};

// Translated label of a report / column, falling back to the BE label.
export const reportLabel = (t, key, fallback) =>
  t(`page.reportSettings.reportLabels.${key}`, { defaultValue: fallback || key });

export const columnLabel = (t, reportKey, column) =>
  t(`page.reportSettings.columnLabels.${reportKey}.${column.key}`, {
    defaultValue: column.label || column.key
  });
