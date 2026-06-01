import { axiosInstance } from ".";

export const getProductPriceByStore = async (payload) => {
  const { data, status } = await axiosInstance.get(
    `/pos/product/price-by-store?productId=${payload.productId}&storeIds=${(payload.storeIds || []).join(",")}`
  );
  if (status !== 200) throw Error(`${data?.message}`);
  return data;
};

export const updateProductPriceByStore = async (payload) => {
  const { data, status } = await axiosInstance.put("/pos/product/update-price-by-store", payload);
  if (status !== 200 && status !== 201) throw Error(`${data?.message}`);
  return data;
};
