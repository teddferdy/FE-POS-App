import { useQuery } from "react-query";
import { getAuthContext } from "@/services/auth";
import { AUTH_CONTEXT_QUERY_KEY } from "@/hooks/useStoreManagePermission";
import { useUserSession } from "@/hooks/useUserSession";
import { hasExplicitMenuAccess } from "@/utils/permission";
import { bypassesMenuPermissions } from "@/utils/role";

export const TENANT_MANAGE_PERMISSION = "tenant.manage";
export const TENANT_MENU_HREF = "/tenant";

// UX gate for platform tenant administration, from the canonical
// authorization context (shares the auth-context query with
// useStoreManagePermission). A menu-scoped role (e.g. bakso_admin) may also
// be granted /tenant explicitly in its accessMenu; that opt-in is honored so
// Add Location can name the target tenant. The backend stays authoritative:
// /tenants answers 403 without tenant.manage.
export function useTenantManagePermission() {
  const query = useQuery(AUTH_CONTEXT_QUERY_KEY, getAuthContext, {
    staleTime: 5 * 60 * 1000,
    // The app default refetchOnMount "always" ignores staleTime, so every
    // Sidebar/page mount refetched /auth/context; honor the 5 min here.
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    retry: false
  });

  const user = useUserSession();
  const permissions = query.data?.data?.context?.permissions;
  const hasCanonicalPermission =
    Array.isArray(permissions) && permissions.includes(TENANT_MANAGE_PERMISSION);
  // Never let the super_admin roleType bypass grant this on its own: a
  // platform super_admin still needs tenant.manage from the auth context.
  const hasAccessMenuGrant =
    !bypassesMenuPermissions(user) && hasExplicitMenuAccess(user, TENANT_MENU_HREF, ["view"]);
  const canManageTenants = hasCanonicalPermission || hasAccessMenuGrant;

  return {
    canManageTenants,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch
  };
}
