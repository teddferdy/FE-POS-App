import { axiosInstance } from ".";

export const getExpenseCategories = async () => {
  const { data, status } = await axiosInstance.get("/expense-category/get-all");
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const addExpenseCategory = async (payload) => {
  const { data, status } = await axiosInstance.post("/expense-category/add", payload);
  if (status !== 200 && status !== 201) throw Error(`${data.message}`);
  return data;
};

export const editExpenseCategory = async (payload) => {
  const { data, status } = await axiosInstance.put(`/expense-category/edit/${payload.id}`, payload);
  if (status !== 200 && status !== 201) throw Error(`${data.message}`);
  return data;
};

export const deleteExpenseCategory = async (payload) => {
  const { data, status } = await axiosInstance.delete(`/expense-category/delete/${payload.id}`);
  if (status !== 200 && status !== 201 && status !== 204) throw Error(data?.error);
  return data;
};

export const getAllExpenses = async (payload) => {
  const params = new URLSearchParams();
  if (payload?.location) params.append("store", payload.location);
  if (payload?.page) params.append("page", payload.page);
  if (payload?.limit) params.append("limit", payload.limit);
  if (payload?.search) params.append("search", payload.search);
  if (payload?.status) params.append("status", payload.status);
  if (payload?.startDate) params.append("startDate", payload.startDate);
  if (payload?.endDate) params.append("endDate", payload.endDate);
  const { data, status } = await axiosInstance.get(`/expense/get-all?${params}`);
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const addExpense = async (payload) => {
  const { data, status } = await axiosInstance.post("/expense/add", payload);
  if (status !== 200 && status !== 201) throw Error(`${data.message}`);
  return data;
};

export const editExpense = async (payload) => {
  const { data, status } = await axiosInstance.put(`/expense/edit/${payload.id}`, payload);
  if (status !== 200 && status !== 201) throw Error(`${data.message}`);
  return data;
};

export const approveExpense = async (id) => {
  const { data, status } = await axiosInstance.put(`/expense/approve/${id}`);
  if (status !== 200 && status !== 201) throw Error(`${data.message}`);
  return data;
};

export const getExpenseById = async (id) => {
  const { data, status } = await axiosInstance.get(`/expense/get-by-id/${id}`);
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const getExpenseSummary = async (payload) => {
  const { data, status } = await axiosInstance.get(
    `/expense/get-summary?store=${payload?.location || ""}&startDate=${payload?.startDate || ""}&endDate=${payload?.endDate || ""}`
  );
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const deleteExpense = async (id) => {
  const { data, status } = await axiosInstance.delete(`/expense/delete/${id}`);
  if (status !== 200 && status !== 201 && status !== 204) throw Error(data?.error);
  return data;
};

export const rejectExpense = async (id) => {
  const { data, status } = await axiosInstance.put(`/expense/reject/${id}`);
  if (status !== 200 && status !== 201) throw Error(`${data.message}`);
  return data;
};
