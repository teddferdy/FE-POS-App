import { axiosInstance } from ".";

export const getAllDiscountByLocationAndActive = async ({
  location,
  limit,
  page,
  statusDiscount
}) => {
  const { data, status } = await axiosInstance.get(
    `/discount/get-discount-by-location?store=${location}&page=${page}&limit=${limit}&status=${statusDiscount}`
  );
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const getAllDiscount = async ({ location, page, limit, statusDiscount }) => {
  const { data, status } = await axiosInstance.get(
    `/discount/get-discount?store=${location}&page=${page}&limit=${limit}&status=${statusDiscount}`
  );
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const addDiscount = async (payload) => {
  const { data, status } = await axiosInstance.post("/discount/add-new-discount", payload);
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const editDiscount = async (payload) => {
  const { data, status } = await axiosInstance.put(
    `/discount/edit-discount/${payload.id}`,
    payload
  );
  if (status !== 200) throw Error(`${data.message || data?.error}`);
  return data;
};

export const deleteDiscount = async (payload) => {
  const { data, status } = await axiosInstance.delete(`/discount/delete-discount/${payload.id}`, {
    data: payload
  });
  if (status !== 200) throw Error(data?.error);
  return data;
};
