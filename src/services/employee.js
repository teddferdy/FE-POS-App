import { axiosInstance } from ".";

export const getAllEmployee = async ({
  page = 1,
  limit = 10,
  search = "",
  location = "",
  position = ""
} = {}) => {
  const params = { page, limit };
  if (search) params.search = search;
  if (location) params.location = location;
  if (position) params.position = position;
  const { data, status } = await axiosInstance.get("/employee/get-employee", { params });
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const addEmployee = async (payload) => {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      formData.append(key, value);
    }
  });
  const { data, status } = await axiosInstance.post("/employee/add-employee", formData);
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const editEmployee = async (payload) => {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      formData.append(key, value);
    }
  });
  const { data, status } = await axiosInstance.put(
    `/employee/edit-employee/${payload.id}`,
    formData
  );
  if (status !== 200) throw Error(`${data.message || data?.error}`);
  return data;
};

export const getEmployeeById = async (payload) => {
  const { data, status } = await axiosInstance.get(`/employee/get-employee/${payload.id}`);
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const getEmployeeDetail = async (employeeID) => {
  const { data, status } = await axiosInstance.get(`/employee/get-employee-detail/${employeeID}`);
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const deleteEmployee = async (payload) => {
  const { data, status } = await axiosInstance.delete(`/employee/delete-employee/${payload.id}`);
  if (status !== 200) throw Error(data?.error);
  return data;
};

export const generateEmployeeId = async () => {
  const { data, status } = await axiosInstance.get("/auth/generate-employee-id");
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};
