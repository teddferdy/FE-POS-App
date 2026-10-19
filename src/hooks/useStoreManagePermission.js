import { useQuery } from "react-query";
import { getAuthContext } from "@/services/auth";

export const AUTH_CONTEXT_QUERY_KEY = ["auth-context"];
export const STORE_MANAGE_PERMISSION = "store.manage";

// UX gate for W3 store configuration, from the canonical authorization
// context (never roleType/user.store/activeStore). One shared query serves
// the Sidebar and the W3 pages. The backend stays authoritative: a W3 403 is
// still handled by the page that receives it.
export function useStoreManagePermission() {
  const query = useQuery(AUTH_CONTEXT_QUERY_KEY, getAuthContext, {
    staleTime: 5 * 60 * 1000,
    // The app default refetchOnMount "always" ignores staleTime, so every
    // Sidebar/page mount refetched /auth/context; honor the 5 min here.
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    retry: false
  });

  const permissions = query.data?.data?.context?.permissions;
  const canManageStores =
    Array.isArray(permissions) && permissions.includes(STORE_MANAGE_PERMISSION);

  return {
    canManageStores,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch
  };
}
