import { axiosInstance } from ".";

export const getAllEmployee = async ({
  page = 1,
  limit = 10,
  search = "",
  location = "",
  position = "",
  status = ""
} = {}) => {
  const params = { page, limit };
  if (search) params.search = search;
  if (location) params.location = location;
  if (position) params.position = position;
  if (status) params.status = status;
  const { data } = await axiosInstance.get("/employee/get-employee", { params });
  if (!data) throw Error('No response');
  return data;
};

const buildFormData = (payload) => {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      if (Array.isArray(value)) {
        value.forEach((item) => formData.append(key, item));
      } else {
        formData.append(key, value);
      }
    }
  });
  return formData;
};

export const addEmployee = async (payload) => {
  const formData = buildFormData(payload);
  const { data, status } = await axiosInstance.post("/employee/add-employee", formData);
  if (status !== 200 && status !== 201) throw Error(`${data.message}`);
  return data;
};

export const editEmployee = async (payload) => {
  const formData = buildFormData(payload);
  const { data, status } = await axiosInstance.put(`/employee/edit-employee`, formData);
  if (status !== 200 && status !== 201) throw Error(`${data.message || data?.error}`);
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
  if (status !== 200 && status !== 201 && status !== 204) throw Error(data?.error);
  return data;
};

export const generateEmployeeId = async () => {
  const { data, status } = await axiosInstance.get("/auth/generate-employee-id");
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};
