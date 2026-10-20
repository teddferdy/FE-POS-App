import { useQuery } from "react-query";
import { getAuthContext } from "@/services/auth";
import { AUTH_CONTEXT_QUERY_KEY } from "@/hooks/useStoreManagePermission";

export const TENANT_MANAGE_PERMISSION = "tenant.manage";

// UX gate for platform tenant administration, from the canonical
// authorization context (shares the auth-context query with
// useStoreManagePermission). The backend stays authoritative: /tenants
// answers 403 to anyone without tenant.manage.
export function useTenantManagePermission() {
  const query = useQuery(AUTH_CONTEXT_QUERY_KEY, getAuthContext, {
    staleTime: 5 * 60 * 1000,
    // The app default refetchOnMount "always" ignores staleTime, so every
    // Sidebar/page mount refetched /auth/context; honor the 5 min here.
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    retry: false
  });

  const permissions = query.data?.data?.context?.permissions;
  const canManageTenants =
    Array.isArray(permissions) && permissions.includes(TENANT_MANAGE_PERMISSION);

  return {
    canManageTenants,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch
  };
}
