import { axiosInstance } from ".";

export const getDashboardSummary = async (payload) => {
  const params = new URLSearchParams();
  if (payload?.store) params.append("store", payload.store);
  if (payload?.startDate) params.append("startDate", payload.startDate);
  if (payload?.endDate) params.append("endDate", payload.endDate);
  if (payload?.filter) params.append("filter", payload.filter);
  const query = params.toString();
  const { data, status } = await axiosInstance.get(
    `/pos/dashboard/summary${query ? `?${query}` : ""}`
  );
  if (status !== 200) throw Error(`${data?.message}`);
  return data;
};
