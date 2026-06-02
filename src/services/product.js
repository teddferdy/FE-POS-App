import { axiosInstance } from ".";

export const getProductById = async (id) => {
  const { data, status } = await axiosInstance.get(`/product/get-by-id/${id}`);
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const getAllProduct = async ({ location, nameProduct, category }) => {
  const { data, status } = await axiosInstance.get(
    `/product/get-product?store=${location}&nameProduct=${nameProduct}&category=${category}`
  );
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const getProductByOutlet = async ({ location }) => {
  const { data, status } = await axiosInstance.get(
    `/product/get-product-by-super-admin?store=${location}`
  );
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const getAllProductTable = async ({ location, limit, page, statusProduct }) => {
  const { data, status } = await axiosInstance.get(
    `/product/get-product-all?store=${location}&page=${page}&limit=${limit}&status=${statusProduct}`
  );
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const addProduct = async (payload) => {
  const { data, status } = await axiosInstance.post("/product/add-product", payload);
  if (status !== 200 && status !== 201) throw Error(`${data.message}`);
  return data;
};

export const editProduct = async (payload) => {
  const { data, status } = await axiosInstance.put("/product/edit-product", payload);
  if (status !== 200 && status !== 201) throw Error(`${data.message}`);
  return data;
};

export const lookupBarcode = async (barcode) => {
  const { data, status } = await axiosInstance.post("/pos/lookup-barcode", { barcode });
  if (status !== 200 && status !== 201) throw Error(`${data?.message}`);
  return data;
};

export const addProductBatch = async (payload) => {
  const { data, status } = await axiosInstance.post("/pos/product/add-batch", payload);
  if (status !== 200 && status !== 201) throw Error(`${data?.message}`);
  return data;
};

export const getProductBatches = async (payload) => {
  const { data, status } = await axiosInstance.get(
    `/pos/product/batches?productId=${payload.productId}&store=${payload.store}`
  );
  if (status !== 200) throw Error(`${data?.message}`);
  return data;
};

export const deleteProduct = async (payload) => {
  const { data, status } = await axiosInstance.delete(`/product/delete-product/${payload.id}`, {
    data: payload
  });
  if (status !== 200) throw Error(data?.error);
  return data;
};

const downloadBlob = async (url, filename) => {
  const { data, status } = await axiosInstance.get(url, {
    responseType: "arraybuffer"
  });

  if (status !== 200) throw new Error("Download failed");

  const blob = new Blob([data], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  });

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
};

export const downloadProductTemplate = async () => {
  return downloadBlob("/product/template", `template-produk.xlsx`);
};

export const downloadProductExcel = async () => {
  return downloadBlob("/product/download", `${Date.now()}-products.xlsx`);
};

export const uploadProductExcel = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  const { data, status } = await axiosInstance.post("/product/import", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  if (status !== 200 && status !== 201) throw Error(`${data.message}`);
  return data;
};
