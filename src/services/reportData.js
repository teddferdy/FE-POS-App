import { axiosInstance } from ".";

// GET /report/data/:key — the rows of a report with the columns, order and
// totals from /report/settings: the same data its PDF/Excel/CSV export holds.
export const getReportData = async (key, params = {}) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") query.append(k, v);
  });
  const qs = query.toString();
  const { data, status } = await axiosInstance.get(`/report/data/${key}${qs ? `?${qs}` : ""}`);
  if (status !== 200) throw Error(`${data?.message}`);
  return data?.data;
};
