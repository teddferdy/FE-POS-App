import { axiosInstance } from ".";

export const getAllPriceListTemplate = async (payload) => {
  const { data, status } = await axiosInstance.get(
    `/price-list-template?store=${payload?.location || ""}&page=${payload?.page || 1}&limit=${payload?.limit || 10}`
  );
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const addPriceListTemplate = async (payload) => {
  const { data, status } = await axiosInstance.post("/price-list-template/add-new-price-list-template", payload);
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const editPriceListTemplate = async (payload) => {
  const { data, status } = await axiosInstance.put(
    `/price-list-template/edit-price-list-template/${payload.id}`,
    payload
  );
  if (status !== 200) throw Error(`${data.message || data?.error}`);
  return data;
};

export const deletePriceListTemplate = async (payload) => {
  const { data, status } = await axiosInstance.delete(`/price-list-template/delete-price-list-template/${payload.id}`, {
    data: payload
  });
  if (status !== 200) throw Error(data?.error);
  return data;
};

export const getPriceListTemplateById = async (payload) => {
  const { data, status } = await axiosInstance.get(`/price-list-template/get-price-list-template/${payload.id}`);
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};