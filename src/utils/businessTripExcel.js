import * as XLSX from "xlsx";
import { buildTripRows } from "./businessTripDoc";

export const buildTripWorkbook = (trip, t = (k) => k) => {
  const rows = buildTripRows(trip, t);

  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws["!cols"] = [
    { wch: 26 },
    { wch: 34 },
    { wch: 8 },
    { wch: 26 },
    { wch: 34 },
    { wch: 18 },
    { wch: 22 }
  ];

  ws["!merges"] = [
    // title row spans (fixed positions)
    { s: { r: 3, c: 0 }, e: { r: 3, c: 1 } }
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, t("page.businessTrip.excel.sheetName") || "SPPD");
  return wb;
};

export const downloadTripWorkbook = (trip, t = (k) => k) => {
  const wb = buildTripWorkbook(trip, t);
  XLSX.writeFile(wb, `${trip.tripNumber || "SPPD"}.xlsx`);
};
