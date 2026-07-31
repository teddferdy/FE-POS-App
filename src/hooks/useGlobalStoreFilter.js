import { useStore } from "@/contexts/StoreContext";

export function useGlobalStoreFilter(defaultValue = "all") {
  const { activeStoreId, isSuperAdmin, setActiveStore } = useStore();

  const storeFilter = isSuperAdmin
    ? String(activeStoreId || defaultValue)
    : String(activeStoreId || defaultValue);

  const setStoreFilter = (value) => {
    if (value === "all") {
      setActiveStore("", "");
    } else {
      setActiveStore(value, "");
    }
  };

  return [storeFilter, setStoreFilter];
}
