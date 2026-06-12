import { axiosInstance } from ".";

export const getAllTypePaymentListActive = async ({
  store,
  page = 1,
  limit = 10,
  statusPayment = "all"
}) => {
  const params = new URLSearchParams();
  if (store) params.append("store", store);
  params.append("page", page);
  params.append("limit", limit);
  params.append("status", statusPayment);
  const { data, status } = await axiosInstance.get(
    `/type-payment/get-type-payment?${params.toString()}`
  );
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const getAllTypePayment = async (payload = {}) => {
  const params = new URLSearchParams();
  if (payload.store) params.append("store", payload.store);
  const query = params.toString();
  const { data, status } = await axiosInstance.get(
    `/type-payment/get-list-type-payment${query ? `?${query}` : ""}`
  );
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const getTypePaymentById = async (id) => {
  const { data, status } = await axiosInstance.get(`/type-payment/get-by-id/${id}`);
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const addTypePayment = async (payload) => {
  const { data, status } = await axiosInstance.post("/type-payment/add-new-type-payment", payload);
  if (status !== 200 && status !== 201) throw Error(`${data.message}`);
  return data;
};

export const editTypePayment = async (payload) => {
  const { data, status } = await axiosInstance.put(
    `/type-payment/edit-type-payment/${payload.id}`,
    payload
  );
  if (status !== 200) throw Error(`${data.message || data?.error}`);
  return data;
};

export const deleteTypePayment = async (payload) => {
  const { data, status } = await axiosInstance.delete(
    `/type-payment/delete-type-payment/${payload.id}`,
    {
      data: payload
    }
  );
  if (status !== 200) throw Error(data?.error);
  return data;
};
