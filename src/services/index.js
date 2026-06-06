import axios, { AxiosError } from "axios";
import { ENDPOINT } from "@/utils/endpoints";
import { getToken } from "@/utils/cookies";

const axiosInstance = axios.create({
  baseURL: ENDPOINT.BASE_URL
});

let authExpiredCallback = null;

export const setAuthExpiredCallback = (cb) => {
  authExpiredCallback = cb;
};

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
      if (err.response?.status === 401 && getToken()) {
        document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
        if (authExpiredCallback) {
          authExpiredCallback();
        }
      }
      return err.response;
    } else return err;
  }
);

export { axiosInstance };
