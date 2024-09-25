import { axiosInstance } from ".";

export const getTotalEarning = async () => {
  const { data, status } = await axiosInstance.get("/best-selling/get-earning-today");
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const getOverviewProduct = async () => {
  const { data, status } = await axiosInstance.get("/overview/get-product");
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const getOverviewCategory = async () => {
  const { data, status } = await axiosInstance.get("/overview/get-category");
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const getOverviewLocation = async () => {
  const { data, status } = await axiosInstance.get("/overview/get-location");
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const getOverviewMember = async () => {
  const { data, status } = await axiosInstance.get("/overview/get-member");
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const getOverviewUser = async () => {
  const { data, status } = await axiosInstance.get("/overview/get-user");
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const getListTableBestSellingList = async () => {
  const { data, status } = await axiosInstance.get("/overview/get-best-selling");
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const getListTableMemberList = async () => {
  const { data, status } = await axiosInstance.get("/overview/get-member-latest");
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const getListTableCategoryList = async () => {
  const { data, status } = await axiosInstance.get("/overview/get-category-latest");
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const getListTableLocationList = async () => {
  const { data, status } = await axiosInstance.get("/overview/get-location-latest");
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const getListTableProductList = async () => {
  const { data, status } = await axiosInstance.get("/overview/get-product-latest");
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};
