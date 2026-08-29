import { axiosInstance } from ".";

export const getOvertimes = async ({ store, page, pageSize, status, mine, from, to } = {}) => {
  const params = new URLSearchParams();
  if (store) params.set("store", store);
  if (page) params.set("page", page);
  if (pageSize) params.set("pageSize", pageSize);
  if (status) params.set("status", status);
  if (mine) params.set("mine", mine);
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  const { data, status: httpStatus } = await axiosInstance.get(
    `/overtime/get-overtime?${params.toString()}`
  );
  if (httpStatus !== 200) throw Error(`${data.message}`);
  return data;
};

export const createOvertime = async (payload) => {
  const { data, status } = await axiosInstance.post("/overtime/create-overtime", payload);
  if (status !== 200 && status !== 201) throw Error(`${data.message}`);
  return data;
};

export const updateOvertimeStatus = async ({ id, status, note }) => {
  const { data, status: httpStatus } = await axiosInstance.put(`/overtime/update-status/${id}`, {
    status,
    note
  });
  if (httpStatus !== 200 && httpStatus !== 201) throw Error(`${data.message}`);
  return data;
};

export const cancelOvertime = async ({ id }) => {
  const { data, status: httpStatus } = await axiosInstance.put(`/overtime/cancel/${id}`);
  if (httpStatus !== 200 && httpStatus !== 201) throw Error(`${data.message}`);
  return data;
};

export const postOvertimePayroll = async ({ store, month }) => {
  const { data, status } = await axiosInstance.post("/overtime/post-payroll", { store, month });
  if (status !== 200 && status !== 201) throw Error(`${data.message}`);
  return data;
};

export const getOvertimeShiftOptions = async ({ store }) => {
  const { data, status } = await axiosInstance.get(
    `/shift/get-shift?store=${store}&page=1&pageSize=100&status=active`
  );
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};
