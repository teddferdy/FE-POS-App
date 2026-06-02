import { axiosInstance } from ".";

export const getInvoiceLogoByActive = async (payload) => {
  const { data, status } = await axiosInstance.get("/invoice/logo/active", {
    params: {
      store: payload.location,
      isActive: payload.isActive
    }
  });
  if (status !== 200) throw Error(`${data?.message}`);
  return data;
};

export const getAllInvoiceLogos = async (payload) => {
  const { data, status } = await axiosInstance.get("/invoice/logo", {
    params: {
      store: payload.location,
      page: payload.page,
      limit: payload.limit,
      isActive: payload.isActive
    }
  });
  if (status !== 200) throw Error(`${data?.message}`);
  return data;
};

export const addInvoiceLogo = async (payload) => {
  const { data, status } = await axiosInstance.post("/invoice/logo", payload);
  if (status !== 200 && status !== 201) throw Error(`${data?.message}`);
  return data;
};

export const editInvoiceLogo = async (id, payload) => {
  const { data, status } = await axiosInstance.put(`/invoice/logo/${id}`, payload);
  if (status !== 200 && status !== 201) throw Error(`${data?.message || data?.error}`);
  return data;
};

export const deleteInvoiceLogo = async (id) => {
  const { data, status } = await axiosInstance.delete(`/invoice/logo/${id}`);
  if (status !== 200 && status !== 201 && status !== 204) throw Error(`${data?.error}`);
  return data;
};

export const activateInvoiceLogo = async (id) => {
  const { data, status } = await axiosInstance.put(`/invoice/logo/${id}/activate`);
  if (status !== 200 && status !== 201) throw Error(`${data?.message}`);
  return data;
};

export const getInvoiceTemplateLogo = async () => {
  const { data, status } = await axiosInstance.get("/invoice/logo/template");
  if (status !== 200) throw Error(`${data?.message}`);
  return data;
};

export const importInvoiceLogos = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  const { data, status } = await axiosInstance.post("/invoice/logo/import", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  if (status !== 200 && status !== 201) throw Error(`${data?.message}`);
  return data;
};

export const getInvoiceSocialMediaByActive = async (payload) => {
  const { data, status } = await axiosInstance.get("/invoice/social-media/active", {
    params: {
      store: payload.location,
      isActive: payload.isActive
    }
  });
  if (status !== 200) throw Error(`${data?.message}`);
  return data;
};

export const getAllInvoiceSocialMedia = async (payload) => {
  const { data, status } = await axiosInstance.get("/invoice/social-media", {
    params: {
      store: payload.location,
      page: payload.page,
      limit: payload.limit,
      isActive: payload.isActive
    }
  });
  if (status !== 200) throw Error(`${data?.message}`);
  return data;
};

export const addInvoiceSocialMedia = async (payload) => {
  const { data, status } = await axiosInstance.post("/invoice/social-media", payload);
  if (status !== 200 && status !== 201) throw Error(`${data?.message}`);
  return data;
};

export const editInvoiceSocialMedia = async (id, payload) => {
  const { data, status } = await axiosInstance.put(`/invoice/social-media/${id}`, payload);
  if (status !== 200 && status !== 201) throw Error(`${data?.message || data?.error}`);
  return data;
};

export const deleteInvoiceSocialMedia = async (id) => {
  const { data, status } = await axiosInstance.delete(`/invoice/social-media/${id}`);
  if (status !== 200 && status !== 201 && status !== 204) throw Error(`${data?.error}`);
  return data;
};

export const activateInvoiceSocialMedia = async (id) => {
  const { data, status } = await axiosInstance.put(`/invoice/social-media/${id}/activate`);
  if (status !== 200 && status !== 201) throw Error(`${data?.message}`);
  return data;
};

export const getInvoiceFooterByActive = async (payload) => {
  const { data, status } = await axiosInstance.get("/invoice/footer/active", {
    params: {
      store: payload.location,
      isActive: payload.isActive
    }
  });
  if (status !== 200) throw Error(`${data?.message}`);
  return data;
};

export const getAllInvoiceFooters = async (payload) => {
  const { data, status } = await axiosInstance.get("/invoice/footer", {
    params: {
      store: payload.location,
      page: payload.page,
      limit: payload.limit,
      isActive: payload.isActive
    }
  });
  if (status !== 200) throw Error(`${data?.message}`);
  return data;
};

export const addInvoiceFooter = async (payload) => {
  const { data, status } = await axiosInstance.post("/invoice/footer", payload);
  if (status !== 200 && status !== 201) throw Error(`${data?.message}`);
  return data;
};

export const editInvoiceFooter = async (id, payload) => {
  const { data, status } = await axiosInstance.put(`/invoice/footer/${id}`, payload);
  if (status !== 200 && status !== 201) throw Error(`${data?.message || data?.error}`);
  return data;
};

export const deleteInvoiceFooter = async (id) => {
  const { data, status } = await axiosInstance.delete(`/invoice/footer/${id}`);
  if (status !== 200 && status !== 201 && status !== 204) throw Error(`${data?.error}`);
  return data;
};

export const activateInvoiceFooter = async (id) => {
  const { data, status } = await axiosInstance.put(`/invoice/footer/${id}/activate`);
  if (status !== 200 && status !== 201) throw Error(`${data?.message}`);
  return data;
};

export const getInvoiceLogosByLocation = async (store) => {
  const { data, status } = await axiosInstance.get("/invoice/logo", {
    params: { store }
  });
  if (status !== 200) throw Error(`${data?.message}`);
  return data;
};

export const getInvoiceSocialMediaByLocation = async (store) => {
  const { data, status } = await axiosInstance.get("/invoice/social-media", {
    params: { store }
  });
  if (status !== 200) throw Error(`${data?.message}`);
  return data;
};

export const getInvoiceFootersByLocation = async (store) => {
  const { data, status } = await axiosInstance.get("/invoice/footer", {
    params: { store }
  });
  if (status !== 200) throw Error(`${data?.message}`);
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
export const getAllInvoiceFooterByActive = getInvoiceFooterByActive;
export const getAllInvoiceLogo = getAllInvoiceLogos;
export const activateOrNotActiveInvoiceLogo = activateInvoiceLogo;
export const activateOrNotActiveInvoiceSocialMedia = activateInvoiceSocialMedia;
