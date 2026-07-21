import { createContext, useContext, useState, useCallback, useMemo } from "react";
import { useCookies } from "react-cookie";
import { useQueryClient } from "react-query";

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [cookies, setCookie, removeCookie] = useCookies();
  const queryClient = useQueryClient();

  const user = cookies?.user;
  const role = user?.roleType || "";
  const isSuperAdmin = role === "super_admin";

  const [activeStoreId, setActiveStoreIdState] = useState(
    () => cookies?.activeStore || null
  );
  const [activeStoreName, setActiveStoreNameState] = useState(
    () => cookies?.activeStoreName || ""
  );

  const setActiveStore = useCallback(
    (id, name) => {
      setCookie("activeStore", id, { path: "/" });
      setCookie("activeStoreName", name || "", { path: "/" });
      setCookie("user", { ...user, store: id, storeName: name }, { path: "/" });
      setActiveStoreIdState(id);
      setActiveStoreNameState(name || "");

      // Sync localStorage filter for backward compatibility
      localStorage.setItem("globalStoreFilter", String(id));

      // Invalidate all store-scoped queries so fresh data loads
      queryClient.invalidateQueries();
    },
    [setCookie, user, queryClient]
  );

  const value = useMemo(
    () => ({
      activeStoreId,
      activeStoreName,
      setActiveStore,
      isSuperAdmin,
      userRole: role,
    }),
    [activeStoreId, activeStoreName, setActiveStore, isSuperAdmin, role]
  );

  return (
    <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return ctx;
}
