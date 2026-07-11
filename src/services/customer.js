import { axiosInstance } from ".";

export const getAllCustomer = async (params = {}) => {
  const { data, status } = await axiosInstance.get("/member/get-member", { params });
  if (status !== 200) throw Error(`${data?.message}`);
  return data;
};

export const getCustomerById = async (id) => {
  const { data, status } = await axiosInstance.get(`/member/get-member/${id}`);
  if (status !== 200) throw Error(`${data?.message}`);
  return data;
};

export const addCustomer = async (payload) => {
  const { data, status } = await axiosInstance.post("/member/add-new-member", payload);
  if (status !== 200 && status !== 201) throw Error(`${data?.message}`);
  return data;
};

export const editCustomer = async (payload) => {
  const { data, status } = await axiosInstance.put(
    `/member/edit-member/${payload.id}`,
    payload
  );
  if (status !== 200 && status !== 201) throw Error(`${data?.message || data?.error}`);
  return data;
};

export const deleteCustomer = async (payload) => {
  const { data, status } = await axiosInstance.delete(`/member/delete-member/${payload.id}`);
  if (status !== 200 && status !== 201 && status !== 204) throw Error(`${data?.error}`);
  return data;
};
