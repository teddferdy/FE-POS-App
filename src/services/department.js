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
  if (status !== 200 && status !== 201) throw Error(`${data.message}`);
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

export const downloadDepartmentTemplate = async () => {
  const { data, status } = await axiosInstance.get("/department/download-template", {
    responseType: "arraybuffer"
  });
  if (status !== 200) throw new Error("Gagal download template");
  const blob = new Blob([data], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "template-department.xlsx");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const downloadDepartmentExcel = async () => {
  const { data, status } = await axiosInstance.get("/department/download", {
    responseType: "arraybuffer"
  });
  if (status !== 200) throw new Error("Gagal download data");
  const blob = new Blob([data], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "data-department.xlsx");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const uploadDepartmentExcel = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  const { data, status } = await axiosInstance.post("/department/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  if (status !== 200 && status !== 201) throw Error(`${data.message}`);
  return data;
};
