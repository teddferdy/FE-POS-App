import { useQuery } from "react-query";
import { getAuthContext } from "@/services/auth";
import { AUTH_CONTEXT_QUERY_KEY } from "@/hooks/useStoreManagePermission";
import { useUserSession } from "@/hooks/useUserSession";
import { hasExplicitMenuAccess } from "@/utils/permission";
import { bypassesMenuPermissions } from "@/utils/role";

export const TENANT_MANAGE_PERMISSION = "tenant.manage";
export const TENANT_MENU_HREF = "/tenant";

// UX gate for tenant administration, from the canonical authorization
// context (shares the auth-context query with useStoreManagePermission).
// The backend stays authoritative: /tenants answers 403 outside its scope.
//
// - canManageTenants: platform tenant.manage. Also unlocks the store form's
//   target-tenant field, so it never comes from accessMenu.
// - ownTenantsOnly: the BE says tenantAdministration "own" (a client's own
//   super admin, e.g. bakso_admin: its tenants only, no suspend/resume). A
//   menu-scoped account must also carry /tenant in its accessMenu — that is
//   the owner's switch for showing the menu.
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
  const context = query.data?.data?.context;
  const permissions = context?.permissions;
  const canManageTenants =
    Array.isArray(permissions) && permissions.includes(TENANT_MANAGE_PERMISSION);
  const isMenuControlled =
    Array.isArray(user?.accessMenu) && user.accessMenu.length > 0 && !bypassesMenuPermissions(user);
  const menuAllows = !isMenuControlled || hasExplicitMenuAccess(user, TENANT_MENU_HREF, ["view"]);
  const ownTenantsOnly = !canManageTenants && context?.tenantAdministration === "own" && menuAllows;
  const canAdministerTenants = canManageTenants || ownTenantsOnly;

  return {
    canManageTenants,
    canAdministerTenants,
    ownTenantsOnly,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch
  };
}
