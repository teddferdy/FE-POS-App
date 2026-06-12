import { axiosInstance } from ".";

export const getInvoiceSetting = async (store) => {
  const { data, status } = await axiosInstance.get("/invoice/setting", {
    params: { store }
  });
  if (status !== 200) throw Error(`${data?.message}`);
  return data;
};

export const updateInvoiceSetting = async (payload) => {
  const isFormData = payload instanceof FormData;
  const { data, status } = await axiosInstance.put("/invoice/setting", payload, {
    headers: isFormData ? { "Content-Type": "multipart/form-data" } : {}
  });
  if (status !== 200 && status !== 201) throw Error(`${data?.message}`);
  return data;
};

export const resetInvoiceSetting = async (payload) => {
  const { data, status } = await axiosInstance.post("/invoice/setting/reset", payload);
  if (status !== 200 && status !== 201) throw Error(`${data?.message}`);
  return data;
};

export const sendInvoiceWhatsApp = async (payload) => {
  const { data, status } = await axiosInstance.post("/pos/invoice/send-wa", payload);
  if (status !== 200 && status !== 201) throw Error(`${data?.message}`);
  return data;
};

export const sendInvoiceEmail = async (payload) => {
  const { data, status } = await axiosInstance.post("/pos/invoice/send-email", payload);
  if (status !== 200 && status !== 201) throw Error(`${data?.message}`);
  return data;
};

export const sendInvoiceWA = sendInvoiceWhatsApp;
