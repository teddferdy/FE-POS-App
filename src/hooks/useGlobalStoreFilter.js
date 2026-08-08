import { useStore } from "@/contexts/StoreContext";

export function useGlobalStoreFilter(defaultValue = "all") {
  const { activeStoreId, setActiveStore } = useStore();

  const storeFilter = String(activeStoreId || defaultValue);

  const setStoreFilter = (value) => {
    if (value === "all") {
      setActiveStore("", "");
    } else {
      setActiveStore(value, "");
    }
  };

  return [storeFilter, setStoreFilter];
}
