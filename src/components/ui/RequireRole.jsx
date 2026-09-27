import React from "react";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import { ShieldAlert, ArrowLeft, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getRoleDashboard } from "@/utils/role";
import { endSession, SESSION_END_REASON } from "@/services/session";

const roleLabels = {
  super_admin: "Super Admin",
  admin: "Admin",
  kasir: "Kasir",
  cashier: "Kasir",
  user: "User"
};

export const AccessDenied = () => {
  const navigate = useNavigate();
  const [cookie] = useCookies();
  const user = cookie?.user;

  const handleLogout = () => {
    endSession({ reason: SESSION_END_REASON.LOGOUT, revoke: true });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 text-center px-4">
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl border bg-muted/60 text-destructive shadow-sm">
        <ShieldAlert className="h-10 w-10" strokeWidth={1.5} />
      </div>
      <p className="text-2xl font-bold text-foreground">Akses Ditolak</p>
      <p className="max-w-md text-sm text-muted-foreground leading-relaxed">
        Anda tidak memiliki izin untuk mengakses halaman ini.
        {user?.roleType ? ` (Role: ${roleLabels[user.roleType] || user.roleType})` : ""}
      </p>
      <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
        <Button variant="danger" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft size={15} className="mr-1.5" /> Kembali
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(getRoleDashboard(user?.roleType))}>
          Ke Dashboard Saya
        </Button>
        <Button variant="ghost" size="sm" className="text-destructive" onClick={handleLogout}>
          <LogOut size={15} className="mr-1.5" /> Logout
        </Button>
      </div>
    </div>
  );
};

/**
 * Route guard that restricts a page to specific roles.
 *
 * Usage:
 *   <Route path="/accounting" element={<RequireRole roles={["super_admin"]}><AccountingPage /></RequireRole>} />
 *
 * super_admin is always allowed through unless `excludeSuperAdmin` is set.
 * Users without access get an AccessDenied screen instead of silently redirecting.
 */
export const RequireRole = ({ roles = [], children, excludeSuperAdmin = false }) => {
  const [cookie] = useCookies();
  const user = cookie?.user;
  const role = user?.roleType;

  const allowed =
    roles.length === 0 || (role === "super_admin" && !excludeSuperAdmin) || roles.includes(role);

  if (!allowed) {
    return <AccessDenied />;
  }
  return children;
};

export default RequireRole;
