import { axiosInstance } from ".";

export const getAllCustomer = async (params = {}) => {
  const { data, status } = await axiosInstance.get("/member/get-member", { params });
  if (status !== 200) throw Error(`${data?.message}`);
  return data;
};

export const addCustomer = async (payload) => {
  const { data, status } = await axiosInstance.post("/member/add-new-member", payload);
  if (status !== 200 && status !== 201) throw Error(`${data?.message}`);
  return data;
};
