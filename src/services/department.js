import { axiosInstance } from ".";

export const getAllDepartment = async () => {
  const { data, status } = await axiosInstance.get("/department/get-department");
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const getAllDepartmentTable = async ({
  page = 1,
  limit = 10,
  statusRole = "all",
  search = ""
}) => {
  const { data, status } = await axiosInstance.get(
    `/department/get-department-all?page=${page}&limit=${limit}&status=${statusRole}&search=${search}`
  );
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const addDepartment = async (payload) => {
  const { data, status } = await axiosInstance.post("/department/add-new-department", payload);
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const editDepartment = async (payload) => {
  const { data, status } = await axiosInstance.put(
    `/department/edit-department/${payload.id}`,
    payload
  );
  if (status !== 200) throw Error(`${data.message || data?.error}`);
  return data;
};

export const deleteDepartment = async (payload) => {
  const { data, status } = await axiosInstance.delete(
    `/department/delete-department/${payload.id}`,
    { data: payload }
  );
  if (status !== 200) throw Error(data?.error);
  return data;
};
