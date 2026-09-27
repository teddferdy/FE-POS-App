import axios, { AxiosError, CanceledError } from "axios";
import { ENDPOINT } from "@/utils/endpoints";
import { hasOwn } from "@/lib/safe-lookup";
import { getToken, getCookie } from "@/utils/cookies";
import { endSession, isSessionEnding, isSessionExemptPath, SESSION_END_REASON } from "./session";

const axiosInstance = axios.create({
  baseURL: ENDPOINT.BASE_URL
});

axiosInstance.interceptors.request.use(
  (req) => {
    // Once the session is ending nothing but the logout revocation itself
    // may leave the tab.
    if (isSessionEnding() && !req.sessionRevocation) {
      throw new CanceledError("Session ended");
    }

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

    // Helper to check if store is already provided in URL/Params/Data.
    // Keys that signal the payload carries its own store scope (multi-store forms
    // like product storePrices or expense allStores must not be overridden).
    const STORE_KEYS = ["store", "stores", "storeId", "storeIds", "storePrices", "selectedStore"];
    const urlHasStore = req.url?.includes("store=") || req.url?.includes("stores=") || false;
    const paramsHaveStore = req.params?.store !== undefined || req.params?.stores !== undefined;

    let dataHasStore = false;
    if (req.data instanceof FormData) {
      dataHasStore = STORE_KEYS.some((k) => req.data.has(k));
    } else if (typeof req.data === "object" && req.data !== null) {
      dataHasStore = STORE_KEYS.some((k) => hasOwn(req.data, k));
    }

    if (isSuperAdmin) {
      // Super Admin: inject the selected store into GETs and mutations, but only
      // when a store is explicitly picked (global view stays store-agnostic) and
      // the payload does not already carry its own store scope.
      if (activeStore && !urlHasStore && !paramsHaveStore && !dataHasStore) {
        if (isGet) {
          req.params = { ...req.params, store: activeStore };
        } else if (isMutation) {
          if (req.data instanceof FormData) {
            req.data.append("store", activeStore);
          } else if (typeof req.data === "object" || !req.data) {
            req.data = { ...(req.data || {}), store: activeStore };
          }
        }
      }
    } else {
      // Non Super Admin: Mandatory activeStore injection.
      // Prefer the user's assigned store (from the decoded login payload in
      // the `user` cookie) over the client-controlled `activeStore` cookie,
      // which could be tampered with in the DOM. Fall back to activeStore only
      // when the user cookie lacks a store.
      const nonAdminStore = user?.store || activeStore;
      if (nonAdminStore && !urlHasStore && !paramsHaveStore && !dataHasStore) {
        if (isGet) {
          req.params = { ...req.params, store: nonAdminStore };
        } else if (isMutation) {
          // Inject into Body for mutations
          if (req.data instanceof FormData) {
            req.data.append("store", nonAdminStore);
          } else if (typeof req.data === "object" || !req.data) {
            req.data = { ...(req.data || {}), store: nonAdminStore };
          }
        }
      }
    }

    return req;
  },
  (err) => Promise.reject(err)
);

const PUBLIC_AUTH_URLS = [
  "/auth/login",
  "/auth/register",
  "/auth/reset-password",
  "/auth/reset-password/request"
];

// A 401 from a protected request means the session is gone: end it once
// (session.js ignores every later call). A 403 is an authorization denial and
// stays with the page that made the request.
axiosInstance.interceptors.response.use(
  (res) => res,
  (err) => {
    if (
      err instanceof AxiosError &&
      err.response?.status === 401 &&
      !PUBLIC_AUTH_URLS.includes(err.config?.url) &&
      !isSessionExemptPath(window.location.pathname)
    ) {
      endSession({ reason: SESSION_END_REASON.EXPIRED });
    }
    return Promise.reject(err);
  }
);

export { axiosInstance };
