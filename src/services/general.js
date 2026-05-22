import axios from "axios";

const BASE_URL = "https://wilayah-id-restapi.vercel.app/api/v1";

export const getProvinces = async () => {
  const { data } = await axios.get(`${BASE_URL}/regions/provinces`);
  return data.data;
};

export const getCities = async (provinceId) => {
  const { data } = await axios.get(`${BASE_URL}/regions/regencies?province_code=${provinceId}`);
  return data.data;
};

export const getDistricts = async (cityId) => {
  const { data } = await axios.get(`${BASE_URL}/regions/districts?regency_code=${cityId}`);
  return data.data;
};

export const getVillages = async (districtId) => {
  const { data } = await axios.get(`${BASE_URL}/regions/villages?district_code=${districtId}`);
  return data.data;
};

export const getPostalCode = async (villageId) => {
  const { data } = await axios.get(`${BASE_URL}/postal-codes?village_code=${villageId}`);
  return data.data;
};
