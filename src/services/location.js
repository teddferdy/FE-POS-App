import { axiosInstance } from ".";

export const getAllLocation = async (status) => {
  const params = status ? `?status=${status}` : '';
  const { data, status: resStatus } = await axiosInstance.get(`/location/get-location-public${params}`);
  if (resStatus !== 200) throw Error(`${data.message}`);
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
  const { data, status } = await axiosInstance.put("/location/edit-location", payload);
  if (status !== 200) throw Error(`${data.message || data?.error}`);
  return data;
};

export const deleteLocation = async (payload) => {
  const { data, status } = await axiosInstance.delete("/location/delete-location", {
    data: payload
  });
  if (status !== 200) throw Error(data?.message || data?.error);
  return data;
};

const _getLocationDetail = async ({ id }) => {
  const { data, status } = await axiosInstance.get(`/location/get-location-detail/${id}`);
  if (status !== 200) throw Error(`${data.message}`);
  return data;
};

export const generateLocationId = async () => {
  const { data, status } = await axiosInstance.get("/location/generate-id");
  if (status !== 200) throw Error(`${data?.message}`);
  return data;
};

export const getLocationDetail = _getLocationDetail;
export const getLocationById = _getLocationDetail;
