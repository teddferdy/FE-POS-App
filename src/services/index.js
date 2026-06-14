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

let sessionExpiredFired = false;

axiosInstance.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err instanceof AxiosError) {
      const isPublicAuth =
        err.config?.url === "/auth/login" ||
        err.config?.url === "/auth/register" ||
        err.config?.url === "/auth/reset-password";
      if (err.response?.status === 401 && !sessionExpiredFired && !isPublicAuth) {
        document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
        sessionExpiredFired = true;
        window.dispatchEvent(new CustomEvent("auth:session-expired"));
      }
      return Promise.reject(err);
    } else return err;
  }
);

export { axiosInstance };
