import axios from "axios";

const NOMINATIM_BASE = "https://nominatim.openstreetmap.org";

export const reverseGeocode = async (lat, lng) => {
  const { data } = await axios.get(`${NOMINATIM_BASE}/reverse`, {
    params: {
      format: "jsonv2",
      lat,
      lon: lng,
      "accept-language": "id"
    }
  });
  return data;
};

export const forwardGeocode = async (query) => {
  const { data } = await axios.get(`${NOMINATIM_BASE}/search`, {
    params: {
      format: "jsonv2",
      q: query,
      countrycodes: "id",
      limit: 1,
      "accept-language": "id"
    }
  });
  return data?.[0] || null;
};
