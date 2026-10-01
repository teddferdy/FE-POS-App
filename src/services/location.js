import { axiosInstance } from ".";
import { normalizeStoreId } from "@/utils/storeId";

export const getAllLocation = async (status) => {
  const params = status ? `?status=${status}` : "";
  const { data, status: resStatus } = await axiosInstance.get(
    `/location/get-location-public${params}`
  );
  if (resStatus !== 200) throw Error(`${data?.message || data?.error || "Gagal memuat data"}`);
  return data;
};

export const getAllLocationTable = async ({
  page = 1,
  limit = 10,
  statusLocation = "all",
  category = "all",
  search
}) => {
  const params = new URLSearchParams();
  params.append("page", page);
  params.append("limit", limit);
  params.append("status", statusLocation);
  if (category !== "all") params.append("category", category);
  if (search) params.append("search", search);
  const { data, status } = await axiosInstance.get(`/location/get-location-all?${params}`);
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

// W3 store configuration (canonical, store.manage). The server selector is
// strictly `loc-N` with no leading zeros, while list/detail projections and
// routes carry the padded form (loc-001). Normalization happens only here, at
// the W3 wrapper boundary: anything that does not resolve to a positive
// integer id (loc-000, "all", "abc", "", null, undefined) is rejected before
// any request is made, so it can never address an unintended store.
const toStoreConfigurationId = (id) => {
  const normalized = normalizeStoreId(id);
  if (!/^[1-9]\d*$/.test(normalized)) throw Error("Invalid store configuration id");
  return `loc-${normalized}`;
};

// Reads carry no client tenant/store scope: the backend resolves it from the
// canonical authorization context.
export const getStoreConfigurationById = async (id) => {
  const selector = toStoreConfigurationId(id);
  const { data, status } = await axiosInstance.get(`/location/store-configuration/${selector}`);
  if (status !== 200) throw Error(`${data?.message || data?.error}`);
  return data;
};

export const getStoreConfigurations = async (page = 1, limit = 20) => {
  const params = new URLSearchParams();
  params.append("page", page);
  params.append("limit", limit);
  const { data, status } = await axiosInstance.get(`/location/store-configuration?${params}`);
  if (status !== 200) throw Error(`${data?.message || data?.error}`);
  return data;
};

// Same boundary rule for the mutation selector, which travels as the body
// `id`: canonicalized (or rejected) without mutating the caller's payload.
// Every other field is sent exactly as provided by the W3 form layer.
const withStoreConfigurationId = (payload) => {
  if (payload instanceof FormData) {
    const id = toStoreConfigurationId(payload.get("id"));
    const copy = new FormData();
    for (const [key, value] of payload.entries()) {
      if (key !== "id") copy.append(key, value);
    }
    copy.append("id", id);
    return copy;
  }
  return { ...payload, id: toStoreConfigurationId(payload?.id) };
};

// The W3 mutation schema is strict: an interceptor-injected `store` would be
// rejected, so this request opts out of store injection.
export const editStoreConfiguration = async (payload) => {
  const body = withStoreConfigurationId(payload);
  const { data, status } = await axiosInstance.put("/location/store-configuration", body, {
    skipStoreInjection: true
  });
  if (status !== 200) throw Error(`${data?.message || data?.error}`);
  return data;
};
