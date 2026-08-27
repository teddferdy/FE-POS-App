import { axiosInstance } from ".";

export const getShiftSwaps = async ({ store, page, pageSize, status }) => {
  const { data, status: httpStatus } = await axiosInstance.get(
    `/shift-swap/get-swap?store=${store}&page=${page}&pageSize=${pageSize}&status=${status || ""}`
  );
  if (httpStatus !== 200) throw Error(`${data.message}`);
  return data;
};

export const updateShiftSwapStatus = async ({ id, status }) => {
  const { data, status: httpStatus } = await axiosInstance.put(
    `/shift-swap/update-swap-status/${id}`,
    { status }
  );
  if (httpStatus !== 200 && httpStatus !== 201) throw Error(`${data.message}`);
  return data;
};

export const createShiftSwap = async (payload) => {
  const { data, status } = await axiosInstance.post("/shift-swap/create-swap", payload);
  if (status !== 200 && status !== 201) throw Error(`${data.message}`);
  return data;
};
