import { axiosInstance } from ".";

export const getAllNotifications = async (params = {}) => {
  const { data } = await axiosInstance.get("/notification", { params });
  return data;
};

export const getUnreadCount = async () => {
  const { data } = await axiosInstance.get("/notification/unread");
  return data;
};

export const markAsRead = async (id) => {
  const { data } = await axiosInstance.put(`/notification/${id}/read`);
  return data;
};

export const markAllAsRead = async () => {
  const { data } = await axiosInstance.put("/notification/read-all");
  return data;
};
