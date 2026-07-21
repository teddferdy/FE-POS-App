import axios, { AxiosError } from "axios";
import { ENDPOINT } from "@/utils/endpoints";
import { getToken, getCookie } from "@/utils/cookies";

const axiosInstance = axios.create({
  baseURL: ENDPOINT.BASE_URL
});

axiosInstance.interceptors.request.use(
  (req) => {
    const token = getToken();
    if (token) {
      req.headers.Authorization = `Bearer ${token}`;
    }

    const userRaw = getCookie("user");
    const user = userRaw ? JSON.parse(decodeURIComponent(userRaw)) : null;
    const isSuperAdmin = user?.roleType === "super_admin";
    const urlHasStore = req.url?.includes("store=") || false;
    const isGet = req.method?.toUpperCase() === "GET";

    if (isGet) {
      if (isSuperAdmin) {
        if (urlHasStore) {
          req.url = req.url.replace(/store=[^&]*/g, "store=");
        } else {
          req.params = { ...req.params, store: "" };
        }
      } else if (!req.params?.store && !urlHasStore) {
        const activeStore = getCookie("activeStore");
        if (activeStore) {
          req.params = { ...req.params, store: activeStore };
        }
      }
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
    }
    return Promise.reject(err);
  }
);

export const resetSessionExpired = () => {
  sessionExpiredFired = false;
};
export { axiosInstance };
