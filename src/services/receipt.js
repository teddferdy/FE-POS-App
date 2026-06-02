import { axiosInstance } from ".";

export const getOrderReceipt = async (orderId) => {
  const { data, status } = await axiosInstance.get(`/receipt/order/${orderId}`);
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};
