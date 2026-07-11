import { axiosInstance } from ".";

export const getDashboardSummary = async (params = {}) => {
  const query = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v != null && v !== "")
  ).toString();
  const { data, status } = await axiosInstance.get(
    `/pos/dashboard/summary${query ? `?${query}` : ""}`
  );
  if (status !== 200) throw Error(`${data?.message}`);
  return data;
};
