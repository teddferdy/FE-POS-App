import { axiosInstance } from ".";

export const getSalesReport = async (payload) => {
  const { data, status } = await axiosInstance.get(
    `/report/sales?store=${payload?.location || ""}&startDate=${payload?.startDate || ""}&endDate=${payload?.endDate || ""}`
  );
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const getDailySummary = async (payload) => {
  const { data, status } = await axiosInstance.get(
    `/report/daily-summary?store=${payload?.location || ""}&date=${payload?.date || ""}`
  );
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const getProfitLoss = async (payload) => {
  const { data, status } = await axiosInstance.get(
    `/report/profit-loss?store=${payload?.location || ""}&startDate=${payload?.startDate || ""}&endDate=${payload?.endDate || ""}`
  );
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const getCashFlow = async (payload) => {
  const { data, status } = await axiosInstance.get(
    `/report/cash-flow?store=${payload?.location || ""}&startDate=${payload?.startDate || ""}&endDate=${payload?.endDate || ""}`
  );
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};
