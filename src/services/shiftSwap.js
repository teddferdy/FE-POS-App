import { axiosInstance } from ".";

export const getShiftSwaps = async ({ store, page, pageSize, status, mine, from, to }) => {
  const params = new URLSearchParams();
  if (store) params.set("store", store);
  if (page) params.set("page", page);
  if (pageSize) params.set("pageSize", pageSize);
  if (status) params.set("status", status);
  if (mine) params.set("mine", mine);
  if (from) params.set("from", from);
  if (to) params.set("to", to);

  const { data, status: httpStatus } = await axiosInstance.get(
    `/shift-swap/get-swap?${params.toString()}`
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

export const cancelShiftSwap = async ({ id }) => {
  const { data, status: httpStatus } = await axiosInstance.put(`/shift-swap/cancel/${id}`);
  if (httpStatus !== 200 && httpStatus !== 201) throw Error(`${data.message}`);
  return data;
};

export const createShiftSwap = async (payload) => {
  const { data, status } = await axiosInstance.post("/shift-swap/create-swap", payload);
  if (status !== 200 && status !== 201) throw Error(`${data.message}`);
  return data;
};
