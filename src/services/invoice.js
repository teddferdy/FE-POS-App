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

export const getInvoiceTemplateFooter = async () => {
  const { data, status } = await axiosInstance.get("/invoice/footer/template");
  if (status !== 200) throw Error(`${data?.message}`);
  return data;
};

export const importInvoiceFooters = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  const { data, status } = await axiosInstance.post("/invoice/footer/import", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  if (status !== 200 && status !== 201) throw Error(`${data?.message}`);
  return data;
};

export const getInvoiceLogoByLocation = async (store) => {
  const { data, status } = await axiosInstance.get("/invoice/logo/by-location", {
    params: { store }
  });
  if (status !== 200) throw Error(`${data?.message}`);
  return data;
};

export const getInvoiceSocialMediaByLocation = async (store) => {
  const { data, status } = await axiosInstance.get("/invoice/social-media/by-location", {
    params: { store }
  });
  if (status !== 200) throw Error(`${data?.message}`);
  return data;
};

export const getInvoiceFooterByLocation = async (store) => {
  const { data, status } = await axiosInstance.get("/invoice/footer/by-location", {
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

export const getAllInvoiceLogo = async ({
  location,
  page,
  limit,
  status: statusActive,
  isActive
}) => {
  const { data, status } = await axiosInstance.get(
    `/invoice/get-invoice-logo?store=${location}&page=${page}&limit=${limit}&status=${statusActive}&isActive=${isActive}`
  );
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const addInvoiceLogo = async (payload) => {
  const { data, status } = await axiosInstance.post("/invoice/add-new-invoice-logo", payload);
  if (status !== 200 && status !== 201) throw Error(`${data.message}`);
  return data;
};

export const editInvoiceLogo = async (payload) => {
  const { data, status } = await axiosInstance.put("/invoice/edit-invoice-logo", payload);
  if (status !== 200 && status !== 201) throw Error(`${data.message || data?.error}`);
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

// Social Media Invoice List
export const getAllInvoiceSocialMediaByActive = async (payload) => {
  const { data, status } = await axiosInstance.get(
    `/invoice/get-invoice-social-media-by-active?store=${payload.location}`
  );
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const getAllInvoiceSocialMedia = async (payload) => {
  const { data, status } = await axiosInstance.get(
    `/invoice/get-invoice-social-media?store=${payload.location}`
  );
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const addInvoiceSocialMedia = async (payload) => {
  const { data, status } = await axiosInstance.post(
    "/invoice/add-new-invoice-social-media",
    payload
  );
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const editInvoiceSocialMedia = async (payload) => {
  const { data, status } = await axiosInstance.put(
    `/invoice/edit-invoice-social-media/${payload.id}`,
    payload
  );
  if (status !== 200) throw Error(`${data.message || data?.error}`);
  return data;
};

export const deleteInvoiceSocialMedia = async (payload) => {
  const { data, status } = await axiosInstance.delete(
    `/invoice/delete-invoice-social-media/${payload.id}`,
    {
      data: payload
    }
  );
  if (status !== 200) throw Error(data?.error);
  return data;
};

export const activateOrNotActiveInvoiceSocialMedia = async (payload) => {
  const { data, status } = await axiosInstance.put(
    `/invoice/activate-invoice-social-media/${payload.id}`,
    payload
  );
  if (status !== 200) throw Error(data?.error);
  return data;
};

// Invoice Footer
export const getAllInvoiceFooterByActive = async ({
  location,
  page,
  limit,
  status: statusActive,
  isActive
}) => {
  const { data, status } = await axiosInstance.get(
    `/invoice/get-invoice-footer-by-active?store=${location}&page=${page}&limit=${limit}&status=${statusActive}&isActive=${isActive}`
  );
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const getAllInvoiceFooter = async (payload) => {
  const { data, status } = await axiosInstance.get(
    `/invoice/get-invoice-footer?store=${payload.location}`
  );
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const addInvoiceFooter = async (payload) => {
  const { data, status } = await axiosInstance.post("/invoice/add-new-invoice-footer", payload);
  if (status !== 200 && status !== 201) throw Error(`${data.message}`);
  return data;
};

export const editInvoiceFooter = async (payload) => {
  const { data, status } = await axiosInstance.put(
    `/invoice/edit-invoice-footer/${payload.id}`,
    payload
  );
  if (status !== 200) throw Error(`${data.message || data?.error}`);
  return data;
};

export const deleteInvoiceFooter = async (payload) => {
  const { data, status } = await axiosInstance.delete(
    `/invoice/delete-invoice-footer/${payload.id}`,
    {
      data: payload
    }
  );
  if (status !== 200) throw Error(data?.error);
  return data;
};

export const activateOrNotActiveInvoiceFooter = async (payload) => {
  const { data, status } = await axiosInstance.put(
    `/invoice/activate-invoice-footer/${payload.id}`,
    payload
  );
  if (status !== 200) throw Error(data?.error);
  return data;
};

// Invoice By Location Super Admin
export const getInvoiceLogoByLocation = async ({ store }) => {
  const { data, status } = await axiosInstance.get(
    `/invoice/get-invoice-logo-by-location?store=${store}`
  );
  if (status !== 200) throw Error(data?.error);
  return data;
};

export const getInvoiceSocialMediaByLocation = async ({ store }) => {
  const { data, status } = await axiosInstance.get(
    `/invoice/get-invoice-social-media-by-location?store=${store}`
  );
  if (status !== 200) throw Error(data?.error);
  return data;
};

export const getInvoiceFooterByLocation = async ({ store }) => {
  const { data, status } = await axiosInstance.get(
    `/invoice/get-invoice-footer-by-location?store=${store}`
  );
  if (status !== 200) throw Error(data?.error);
  return data;
};

export const sendInvoiceWA = async (payload) => {
  const { data, status } = await axiosInstance.post("/pos/invoice/send-wa", payload);
  if (status !== 200 && status !== 201) throw Error(data?.message);
  return data;
};

export const sendInvoiceEmail = async (payload) => {
  const { data, status } = await axiosInstance.post("/pos/invoice/send-email", payload);
  if (status !== 200 && status !== 201) throw Error(data?.message);
  return data;
};
