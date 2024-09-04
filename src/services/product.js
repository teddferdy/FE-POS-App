import { axiosInstance } from ".";

export const getAllProduct = async ({ nameProduct, category }) => {
  const { data, status } = await axiosInstance.get(
    `product/get-product?nameProduct=${nameProduct}&category=${category}`
  );
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const addProduct = async (payload) => {
  const { data, status } = await axiosInstance.post("/product/add-product", payload);
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};
