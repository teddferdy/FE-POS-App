import { axiosInstance } from ".";

export const getAllShiftTemplate = async () => {
  const { data, status } = await axiosInstance.get("/shift-template/get-shift-template");
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const getAllShiftTemplateTable = async ({
  page = 1,
  limit = 10,
  statusRole = "all",
  search = ""
}) => {
  const { data, status } = await axiosInstance.get(
    `/shift-template/get-shift-template-all?page=${page}&limit=${limit}&status=${statusRole}&search=${search}`
  );
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const getShiftTemplateById = async (payload) => {
  const { data, status } = await axiosInstance.get(
    `/shift-template/get-shift-template/${payload.id}`
  );
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const addShiftTemplate = async (payload) => {
  const { data, status } = await axiosInstance.post(
    "/shift-template/add-new-shift-template",
    payload
  );
  if (status !== 200 && status !== 201) throw Error(`${data.message}`);
  return data;
};

export const editShiftTemplate = async (payload) => {
  const { data, status } = await axiosInstance.put(
    `/shift-template/edit-shift-template/${payload.id}`,
    payload
  );
  if (status !== 200) throw Error(`${data.message || data?.error}`);
  return data;
};

export const deleteShiftTemplate = async (payload) => {
  const { data, status } = await axiosInstance.delete(
    `/shift-template/delete-shift-template/${payload.id}`,
    { data: payload }
  );
  if (status !== 200) throw Error(data?.error);
  return data;
};
