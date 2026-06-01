import { axiosInstance } from ".";

export const getAllTaxConfig = async (payload) => {
  const { data, status } = await axiosInstance.get(
    `/tax-config?store=${payload?.location || ""}&page=${payload?.page || 1}&limit=${payload?.limit || 10}`
  );
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const addTaxConfig = async (payload) => {
  const { data, status } = await axiosInstance.post("/tax-config/add-new-tax-config", payload);
  if (status !== 200 && status !== 201) throw Error(`${data.message}`);
  return data;
};

export const editTaxConfig = async (payload) => {
  const { data, status } = await axiosInstance.put(
    `/tax-config/edit-tax-config/${payload.id}`,
    payload
  );
  if (status !== 200) throw Error(`${data.message || data?.error}`);
  return data;
};

export const deleteTaxConfig = async (payload) => {
  const { data, status } = await axiosInstance.delete(
    `/tax-config/delete-tax-config/${payload.id}`,
    {
      data: payload
    }
  );
  if (status !== 200) throw Error(data?.error);
  return data;
};

export const getTaxConfigById = async (payload) => {
  const { data, status } = await axiosInstance.get(`/tax-config/get-tax-config/${payload.id}`);
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};
