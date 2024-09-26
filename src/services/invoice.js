import { axiosInstance } from ".";

// Logo Invoice
export const getAllInvoiceLogoByActive = async () => {
  const { data, status } = await axiosInstance.get("/invoice/get-invoice-logo-by-active");
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const getAllInvoiceLogo = async () => {
  const { data, status } = await axiosInstance.get("/invoice/get-invoice-logo");
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const addInvoiceLogo = async (payload) => {
  const { data, status } = await axiosInstance.post("/invoice/add-new-invoice-logo", payload);
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const editInvoiceLogo = async (payload) => {
  const { data, status } = await axiosInstance.put(
    `/invoice/edit-invoice-logo/${payload.id}`,
    payload
  );
  if (status !== 200) throw Error(`${data.message || data?.error}`);
  return data;
};

export const deleteInvoiceLogo = async (payload) => {
  const { data, status } = await axiosInstance.delete(
    `/invoice/delete-invoice-logo/${payload.id}`,
    {
      data: payload
    }
  );
  if (status !== 200) throw Error(data?.error);
  return data;
};

export const activateOrNotActiveInvoiceLogo = async (payload) => {
  const { data, status } = await axiosInstance.put(
    `/invoice/activate-invoice-logo/${payload.id}`,
    payload
  );
  if (status !== 200) throw Error(data?.error);
  return data;
};
