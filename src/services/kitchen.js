import { axiosInstance } from ".";

export const getKitchenOrders = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const { data, status } = await axiosInstance.get(`/order/kitchen?${query}`);
  if (status !== 200) throw Error(`${data?.message}`);
  return data;
};

export const updateOrderItemStatus = async (id, itemId, itemStatus) => {
  const { data, status } = await axiosInstance.put("/order/update-item-status", { id, itemId, itemStatus });
  if (status !== 200 && status !== 201) throw Error(`${data?.message}`);
  return data;
};
