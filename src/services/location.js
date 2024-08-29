import { axiosInstance } from ".";

export const getAllLocation = async () => {
  const { data, status } = await axiosInstance.get("/location/get-location");
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const addLocation = async (payload) => {
  const { data, status } = await axiosInstance.post("/location/add-new-location", payload);
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const editLocation = async (payload) => {
  const { data, status } = await axiosInstance.post(
    `/location/edit-location/${payload.id}`,
    payload
  );
  if (status !== 200) throw Error(`${data.message || data?.error}`);
  return data;
};

export const deleteLocation = async (payload) => {
  const { data, status } = await axiosInstance.post(
    `/location/delete-location/${payload.id}`,
    payload
  );
  if (status !== 200) throw Error(data?.error);
  return data;
};
