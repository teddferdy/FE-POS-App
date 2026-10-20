import { useQuery } from "react-query";
import { getReportData } from "@/services/reportData";
import { qk } from "./keys";

// Report rows + the columns chosen in /report/settings. Pages that also
// need the rows (summary cards) call this with the same params as their
// <ReportTable>, so both share one request.
export const useReportData = (reportKey, params = {}, options = {}) =>
  useQuery(qk.reportData.detail(reportKey, params), () => getReportData(reportKey, params), {
    keepPreviousData: true,
    ...options
  });
