import { axiosInstance } from ".";

export const getAllShift = async ({ store, page, limit, statusShift }) => {
  const { data, status } = await axiosInstance.get(
    `/shift/get-shift?store=${store}&page=${page}&limit=${limit}&status=${statusShift}`
  );
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const addShift = async (payload) => {
  const { data, status } = await axiosInstance.post("/shift/add-new-shift", payload);
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const editShift = async (payload) => {
  const { data, status } = await axiosInstance.put(`/shift/edit-shift/${payload.id}`, payload);
  if (status !== 200) throw Error(`${data.message || data?.error}`);
  return data;
};

export const deleteShift = async (payload) => {
  const { data, status } = await axiosInstance.delete(`/shift/delete-shift/${payload.id}`, {
    data: payload
  });
  if (status !== 200) throw Error(data?.error);
  return data;
};
