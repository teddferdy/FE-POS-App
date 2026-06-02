import { axiosInstance } from ".";

export const getTotalEarning = async (payload) => {
  const { data, status } = await axiosInstance.get(
    `/best-selling/get-earning-today?store=${payload?.location ? payload?.location : ""}`
  );
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const getOverviewProduct = async (payload) => {
  const { data, status } = await axiosInstance.get(
    `/overview/product?store=${payload?.location ? payload?.location : ""}`
  );
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const getOverviewCategory = async (payload) => {
  const { data, status } = await axiosInstance.get(
    `/overview/category?store=${payload?.location ? payload?.location : ""}`
  );
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const getOverviewLocation = async () => {
  const { data, status } = await axiosInstance.get("/overview/location");
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const getOverviewMember = async (payload) => {
  const { data, status } = await axiosInstance.get(
    `/overview/member?store=${payload?.location ? payload?.location : ""}`
  );
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const getOverviewUser = async () => {
  const { data, status } = await axiosInstance.get("/overview/user");
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const getListTableBestSellingList = async (payload) => {
  const { data, status } = await axiosInstance.get(
    `/overview/best-selling?store=${payload?.location ? payload?.location : ""}`
  );
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const getListTableMemberList = async (payload) => {
  const { data, status } = await axiosInstance.get(
    `/overview/members/latest?store=${payload?.location ? payload?.location : ""}`
  );
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const getListTableCategoryList = async (payload) => {
  const { data, status } = await axiosInstance.get(
    `/overview/categories/latest?store=${payload?.location ? payload?.location : ""}`
  );
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const getListTableLocationList = async () => {
  const { data, status } = await axiosInstance.get("/overview/locations/latest");
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const getListTableProductList = async (payload) => {
  const { data, status } = await axiosInstance.get(
    `/overview/products/latest?store=${payload?.location ? payload?.location : ""}`
  );
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};
