/* eslint-disable react/prop-types */
import { createContext, useContext, useState, useCallback, useMemo } from "react";
import { useCookies } from "react-cookie";
import { useQueryClient } from "react-query";

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [cookies, setCookie] = useCookies();
  const queryClient = useQueryClient();

  const user = cookies?.user;
  const role = user?.roleType || "";
  const isSuperAdmin = role === "super_admin";

  const [activeStoreId, setActiveStoreIdState] = useState(() => {
    if (isSuperAdmin) return null;
    return cookies?.activeStore || null;
  });
  const [activeStoreName, setActiveStoreNameState] = useState(() => {
    if (isSuperAdmin) return "";
    return cookies?.activeStoreName || "";
  });

  const setActiveStore = useCallback(
    (id, name) => {
      // If super_admin, we use the passed ID (could be empty for global, or specific ID)
      // If not super_admin, we use the user's assigned store
      const storeValue = isSuperAdmin ? id : user?.store;

      setCookie("activeStore", storeValue, { path: "/" });
      setCookie("activeStoreName", name || "", { path: "/" });

      // Update user cookie to keep UI in sync if needed
      if (user) {
        setCookie("user", { ...user, store: storeValue, storeName: name }, { path: "/" });
      }

      setActiveStoreIdState(storeValue);
      setActiveStoreNameState(name || "");

      localStorage.setItem("globalStoreFilter", String(storeValue));
      queryClient.invalidateQueries();
    },
    [setCookie, user, queryClient, isSuperAdmin]
  );

  const value = useMemo(
    () => ({
      activeStoreId,
      activeStoreName,
      setActiveStore,
      isSuperAdmin,
      userRole: role
    }),
    [activeStoreId, activeStoreName, setActiveStore, isSuperAdmin, role]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return ctx;
}
