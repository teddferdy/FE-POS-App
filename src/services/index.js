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
    const activeStoreRaw = getCookie("activeStore");
    const activeStore = activeStoreRaw && activeStoreRaw !== "undefined" ? activeStoreRaw : null;

    const method = req.method?.toUpperCase();
    const isGet = method === "GET";
    const isMutation = ["POST", "PUT", "PATCH", "DELETE"].includes(method);

    // Helper to check if store is already provided in URL/Params/Data
    const urlHasStore = req.url?.includes("store=") || req.url?.includes("stores=") || false;
    const paramsHaveStore = req.params?.store !== undefined || req.params?.stores !== undefined;

    let dataHasStore = false;
    if (req.data instanceof FormData) {
      dataHasStore = req.data.has("store") || req.data.has("stores");
    } else if (typeof req.data === "object" && req.data !== null) {
      dataHasStore = req.data.store !== undefined || req.data.stores !== undefined;
    }

    if (isSuperAdmin) {
      // Super Admin: only inject store if one is explicitly set
      if (activeStore && !urlHasStore && !paramsHaveStore && !dataHasStore && isGet) {
        req.params = { ...req.params, store: activeStore };
      }
    } else {
      // Non Super Admin: Mandatory activeStore injection
      if (activeStore && !urlHasStore && !paramsHaveStore && !dataHasStore) {
        if (isGet) {
          req.params = { ...req.params, store: activeStore };
        } else if (isMutation) {
          // Inject into Body for mutations
          if (req.data instanceof FormData) {
            req.data.append("store", activeStore);
          } else if (typeof req.data === "object" || !req.data) {
            req.data = { ...(req.data || {}), store: activeStore };
          }
        }
      }
    }

    return req;
  },
  (err) => Promise.reject(err)
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
