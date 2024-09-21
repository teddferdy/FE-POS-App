import { axiosInstance } from ".";

export const getAllTypePayment = async () => {
  const { data, status } = await axiosInstance.get("/type-payment/get-type-payment");
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const addTypePayment = async (payload) => {
  const { data, status } = await axiosInstance.post("/type-payment/add-new-type-payment", payload);
  if (status !== 200) throw Error(`${data.message}`);
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
