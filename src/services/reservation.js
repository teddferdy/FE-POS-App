import { axiosInstance } from ".";

export const getReservations = async ({ page = 1, limit = 10, date, status } = {}) => {
  const params = new URLSearchParams({ page, limit });
  if (date) params.set("date", date);
  if (status) params.set("status", status);
  const { data } = await axiosInstance.get(`/reservation?${params}`);
  return data;
};

export const getReservationById = async (id) => {
  const { data } = await axiosInstance.get(`/reservation/${id}`);
  return data;
};

export const createReservation = async (payload) => {
  const { data } = await axiosInstance.post("/reservation", payload);
  return data;
};

export const updateReservation = async ({ id, ...payload }) => {
  const { data } = await axiosInstance.put(`/reservation/${id}`, payload);
  return data;
};

export const deleteReservation = async (id) => {
  const { data } = await axiosInstance.delete(`/reservation/${id}`);
  return data;
};

export const getAvailableTables = async ({ date, startTime, endTime, store }) => {
  const params = new URLSearchParams({ date, startTime });
  if (endTime) params.set("endTime", endTime);
  if (store) params.set("store", store);
  const { data } = await axiosInstance.get(`/reservation/available-tables/list?${params}`);
  return data;
};
