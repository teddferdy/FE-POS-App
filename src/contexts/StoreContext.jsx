import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
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
    if (!isSuperAdmin) return user?.store;
    const cookieStore = cookies?.activeStore;
    return cookieStore && cookieStore !== "undefined" ? cookieStore : null;
  });
  const [activeStoreName, setActiveStoreNameState] = useState(() => {
    return cookies?.user?.storeName || cookies?.activeStoreName || "";
  });

  useEffect(() => {
    if (!isSuperAdmin) {
      setCookie("activeStore", user?.store || "", { path: "/" });
      setCookie("activeStoreName", user?.storeName || "", { path: "/" });
    }
    // Normalisasi sekali saat mount: refresh HP tidak ikut larut dalam
    // stale activeStore/activeStoreName bekas sesi super admin.
  }, []);

  const setActiveStore = useCallback(
    (id, name) => {
      // If super_admin, we use the passed ID (could be empty for global, or specific ID)
      // If not super_admin, we force the user's assigned store name so the UI never
      // shows a stale store from a previous session.
      const storeValue = isSuperAdmin ? id : user?.store || "";
      const storeNameValue = isSuperAdmin ? name || "" : user?.storeName || name || "";

      setCookie("activeStore", storeValue, { path: "/" });
      setCookie("activeStoreName", storeNameValue || "", { path: "/" });

      // Update user cookie to keep UI in sync if needed
      if (user) {
        setCookie("user", { ...user, store: storeValue, storeName: storeNameValue }, { path: "/" });
      }

      setActiveStoreIdState(storeValue);
      setActiveStoreNameState(storeNameValue);

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
