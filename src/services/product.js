import { axiosInstance } from ".";

export const getAllProduct = async ({ nameMember, category }) => {
  const { data, status } = await axiosInstance.get(
    `product/get-product?nameProduct=${nameMember}&category=${category}`
  );
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const addMember = async (payload) => {
  const { data, status } = await axiosInstance.post("/product/add-product", payload);
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};
