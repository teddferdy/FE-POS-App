import { axiosInstance } from ".";

export const getAllLocation = async () => {
  const { data, status } = await axiosInstance.get("/location/get-location");
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const getAllLocationTable = async ({
  page = 1,
  limit = 10,
  statusLocation = "all",
  category = "all"
}) => {
  let url = `/location/get-location-all?page=${page}&limit=${limit}&status=${statusLocation}`;
  if (category !== "all") {
    url += `&category=${encodeURIComponent(category)}`;
  }
  const { data, status } = await axiosInstance.get(url);
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const addLocation = async (payload) => {
  const { data, status } = await axiosInstance.post("/location/add-new-location", payload);
  if (status !== 200 && status !== 201) throw Error(`${data.message}`);
  return data;
};

export const editLocation = async (payload) => {
  console.log("PAYLOAD =>", payload);

  const { data, status } = await axiosInstance({
    method: "put",
    url: `/location/edit-location`,
    data: payload
  });
  if (status !== 200) throw Error(`${data.message || data?.error}`);
  return data;
};

export const getLocationById = async ({ id }) => {
  const { data, status } = await axiosInstance.get(`/location/get-location-detail/${id}`);
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const getLocationDetail = async ({ id }) => {
  const { data, status } = await axiosInstance.get(`/location/get-location-detail/${id}`);
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const deleteLocation = async (payload) => {
  const { data, status } = await axiosInstance.delete(`/location/delete-location`, {
    data: payload
  });
  if (status !== 200) throw Error(data?.message);
  return data;
};

export const generateLocationId = async () => {
  const { data, status } = await axiosInstance.get("/generate-id");
  if (status !== 200) throw Error(`${data?.message}`);
  return data;
};

export const editLocation = async (payload) => {
  console.log("PAYLOAD =>", payload);

  const { data, status } = await axiosInstance.put(`/edit-location`, payload);
  if (status !== 200 && status !== 201) throw Error(`${data?.message || data?.error}`);
  return data;
};

export const deleteLocation = async (payload) => {
  const { data, status } = await axiosInstance.delete(`/delete-location`, {
    data: payload
  });
  if (status !== 200 && status !== 201 && status !== 204) throw Error(`${data?.message}`);
  return data;
};
