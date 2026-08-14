import { axiosInstance } from "./index";

const BASE_URL = "/regions";

export const getProvinces = async () => {
  const { data } = await axiosInstance.get(`${BASE_URL}/provinces`);
  return (data.data || []).map((p) => ({
    kode_prov: p.code,
    nama_provinsi: p.name,
    latitude: p.latitude,
    longitude: p.longitude
  }));
};

export const getCities = async (provinceId) => {
  const { data } = await axiosInstance.get(`${BASE_URL}/regencies`, {
    params: { province_code: provinceId }
  });
  return (data.data || []).map((c) => ({
    kode_kab: c.code,
    nama_kabupaten: c.name,
    latitude: c.latitude,
    longitude: c.longitude
  }));
};

export const getDistricts = async (cityId) => {
  const { data } = await axiosInstance.get(`${BASE_URL}/districts`, {
    params: { regency_code: cityId }
  });
  return (data.data || []).map((d) => ({
    kode_kec: d.code,
    nama_kecamatan: d.name,
    latitude: d.latitude,
    longitude: d.longitude
  }));
};

export const getVillages = async (districtId) => {
  const { data } = await axiosInstance.get(`${BASE_URL}/villages`, {
    params: { district_code: districtId }
  });
  return (data.data || []).map((v) => ({ kode_desa: v.code, nama_desa: v.name }));
};

export const getPostalCode = async (villageId) => {
  const { data } = await axiosInstance.get(`${BASE_URL}/postal-codes`, {
    params: { village_code: villageId }
  });
  return (data.data || []).map((p) => ({ kode_pos: p.postalCode }));
};
