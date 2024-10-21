import { axiosInstance } from ".";

// Logo Invoice
export const getAllInvoiceLogoByActive = async (payload) => {
  const { data, status } = await axiosInstance.get(
    `/invoice/get-invoice-logo-by-active?store=${payload.location}`
  );
  if (status !== 200) throw Error(`${data.message}`);
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
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const editInvoiceLogo = async (payload) => {
  const { data, status } = await axiosInstance.put("/invoice/edit-invoice-logo", payload);
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
  if (status !== 200) throw Error(`${data.message}`);
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
