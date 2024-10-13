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
    `/overview/get-product?store=${payload?.location ? payload?.location : ""}`
  );
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const getOverviewCategory = async (payload) => {
  const { data, status } = await axiosInstance.get(
    `/overview/get-category?store=${payload?.location ? payload?.location : ""}`
  );
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const getOverviewLocation = async () => {
  const { data, status } = await axiosInstance.get("/overview/get-location");
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const getOverviewMember = async (payload) => {
  const { data, status } = await axiosInstance.get(
    `/overview/get-member?store=${payload?.location ? payload?.location : ""}`
  );
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const getOverviewUser = async () => {
  const { data, status } = await axiosInstance.get("/overview/get-user");
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const getListTableBestSellingList = async (payload) => {
  const { data, status } = await axiosInstance.get(
    `/overview/get-best-selling?store=${payload?.location ? payload?.location : ""}`
  );
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const getListTableMemberList = async (payload) => {
  const { data, status } = await axiosInstance.get(
    `/overview/get-member-latest?store=${payload?.location ? payload?.location : ""}`
  );
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const getListTableCategoryList = async (payload) => {
  const { data, status } = await axiosInstance.get(
    `/overview/get-category-latest?store=${payload?.location ? payload?.location : ""}`
  );
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const getListTableLocationList = async () => {
  const { data, status } = await axiosInstance.get("/overview/get-location-latest");
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const getListTableProductList = async (payload) => {
  const { data, status } = await axiosInstance.get(
    `/overview/get-product-latest?store=${payload?.location ? payload?.location : ""}`
  );
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};
