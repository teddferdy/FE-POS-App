import axios, { AxiosError } from "axios";
import { ENDPOINT } from "@/utils/endpoints";
import { getToken } from "@/utils/cookies";

const axiosInstance = axios.create({
  baseURL: ENDPOINT.BASE_URL
});

axiosInstance.interceptors.request.use(
  (req) => {
    const token = getToken();
    if (token) {
      req.headers.Authorization = `Bearer ${token}`;
    }
    return req;
  },
  (err) => err
);

axiosInstance.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err instanceof AxiosError) {
      return err.response;
    } else return err;
  }
);

export { axiosInstance };
