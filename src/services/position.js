import { axiosInstance } from ".";

export const getAllPosition = async () => {
  const { data, status } = await axiosInstance.get("/position/get-position");
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const getAllPositionTable = async () => {
  const { data, status } = await axiosInstance.get("/position/get-position-all");
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const addPosition = async (payload) => {
  const { data, status } = await axiosInstance.post("/position/add-new-position", payload);
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const editPosition = async (payload) => {
  const { data, status } = await axiosInstance.put(
    `/position/edit-position/${payload.id}`,
    payload
  );
  if (status !== 200) throw Error(`${data.message || data?.error}`);
  return data;
};

export const deletePosition = async (payload) => {
  const { data, status } = await axiosInstance.delete(`/position/delete-position/${payload.id}`, {
    data: payload
  });
  if (status !== 200) throw Error(data?.error);
  return data;
};
