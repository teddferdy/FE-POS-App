import { axiosInstance } from ".";

export const getStockHistory = async (payload) => {
  const { data, status } = await axiosInstance.get(
    `/stock-history?store=${payload?.location || ""}&page=${payload?.page || 1}&limit=${payload?.limit || 10}`
  );
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const getStockOpname = async (payload) => {
  const { data, status } = await axiosInstance.get(
    `/stock-opname?store=${payload?.location || ""}&page=${payload?.page || 1}&limit=${payload?.limit || 10}`
  );
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const addStockOpname = async (payload) => {
  const { data, status } = await axiosInstance.post("/stock-opname", payload);
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};
