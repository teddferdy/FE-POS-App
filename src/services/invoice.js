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

// The receipt as WhatsApp text (nothing is sent) — opened through wa.me on
// the cashier's own WhatsApp.
export const getInvoiceWhatsAppText = async (orderId) => {
  const { data, status } = await axiosInstance.get(`/pos/invoice/wa-text/${orderId}`);
  if (status !== 200) throw Error(`${data?.message}`);
  return data;
};

export const sendInvoiceEmail = async (payload) => {
  const { data, status } = await axiosInstance.post("/pos/invoice/send-email", payload);
  if (status !== 200 && status !== 201) throw Error(`${data?.message}`);
  return data;
};
