import { axiosInstance } from ".";

export const getExpenseCategories = async () => {
  const { data, status } = await axiosInstance.get("/expense-category");
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const addExpenseCategory = async (payload) => {
  const { data, status } = await axiosInstance.post("/expense-category", payload);
  if (status !== 200 && status !== 201) throw Error(`${data.message}`);
  return data;
};

export const editExpenseCategory = async (payload) => {
  const { data, status } = await axiosInstance.put(`/expense-category/${payload.id}`, payload);
  if (status !== 200 && status !== 201) throw Error(`${data.message}`);
  return data;
};

export const deleteExpenseCategory = async (payload) => {
  const { data, status } = await axiosInstance.delete(`/expense-category/${payload.id}`);
  if (status !== 200 && status !== 201 && status !== 204) throw Error(data?.error);
  return data;
};

export const getAllExpenses = async (payload) => {
  const { data, status } = await axiosInstance.get(
    `/expense?store=${payload?.location || ""}&page=${payload?.page || 1}&limit=${payload?.limit || 10}`
  );
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const addExpense = async (payload) => {
  const { data, status } = await axiosInstance.post("/expense", payload);
  if (status !== 200 && status !== 201) throw Error(`${data.message}`);
  return data;
};

export const editExpense = async (payload) => {
  const { data, status } = await axiosInstance.put(`/expense/${payload.id}`, payload);
  if (status !== 200 && status !== 201) throw Error(`${data.message}`);
  return data;
};

export const approveExpense = async (id) => {
  const { data, status } = await axiosInstance.post(`/expense/${id}/approve`);
  if (status !== 200 && status !== 201) throw Error(`${data.message}`);
  return data;
};
