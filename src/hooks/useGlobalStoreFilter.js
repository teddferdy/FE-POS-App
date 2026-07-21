import { useStore } from "@/contexts/StoreContext";

export function useGlobalStoreFilter(defaultValue = "all") {
  const { activeStoreId, isSuperAdmin } = useStore();

  // For super_admin: use the active store filter (or "all" if none selected)
  // For non-super_admin: always filter to their own store
  const storeFilter = isSuperAdmin
    ? String(activeStoreId || defaultValue)
    : String(activeStoreId || defaultValue);

  return [storeFilter, () => {}];
}
