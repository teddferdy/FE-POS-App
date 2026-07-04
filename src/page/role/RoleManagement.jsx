import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Eye, Shield } from "lucide-react";
import { getAllRoleTable, deleteRole } from "@/services/role";
import { getAllLocation } from "@/services/location";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/loading";
import Modal from "@/components/organism/modal";
import { useTranslation } from "react-i18next";
import { canAccess } from "@/utils/permission";
import AbortController from "@/components/organism/abort-controller";
import StatCard from "@/components/ui/StatCard";
import NoStore from "@/components/ui/NoStore";

const RoleManagement = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [cookie] = useCookies();
  const user = cookie?.user;
  const isSuperAdmin = user?.roleType === "super_admin";
  const MENU_KEY = "/role-management";

  const { data: locData } = useQuery(["locations-role"], () => getAllLocation(), {
    staleTime: 5 * 60 * 1000,
    enabled: isSuperAdmin
  });
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const PROTECTED_ROLE_NAMES = ["Super Admin", "Admin", "User", "Kasir"];

  const isProtected = (role) => {
    return PROTECTED_ROLE_NAMES.includes(role.name || "");
  };

  const { data, isLoading, isError, refetch } = useQuery(
    ["roles-table", page],
    () => getAllRoleTable({ page, limit: 10 }),
    { keepPreviousData: true }
  );

  const roles = data?.data || [];
  const total = data?.pagination?.total || 0;
  const totalPages = data?.pagination?.totalPages || 1;
  const stats = data?.stats || {};
  const activeCount = stats.active ?? roles.filter((r) => r.status === "active").length;
  const draftCount = stats.draft ?? roles.filter((r) => r.status === "draft").length;
  const inactiveCount = stats.inactive ?? roles.filter((r) => r.status === "inactive").length;

  const deleteMutation = useMutation(deleteRole, {
    onSuccess: () => {
      toast.success(t("common.success"), {
        description: t("page.globalSetting.roleManagement.toast.deleteSuccess")
      });
      queryClient.invalidateQueries(["roles-table"]);
    },
    onError: (err) => {
      toast.error(t("common.error"), {
        description: err?.response?.data?.message || err.message
      });
    }
  });

  const confirmDelete = () => {
    if (deleteTarget) {
      deleteMutation.mutate({ id: deleteTarget.id });
      setDeleteTarget(null);
    }
  };

  return (
    <div data-tour="page-roles" className="space-y-8">
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <button
          onClick={() => navigate("/dashboard-super-admin")}
          className="hover:text-foreground transition-colors">
          {t("breadcrumb.home")}
        </button>
        <span className="text-xs">/</span>
        <span className="text-primary font-semibold">{t("breadcrumb.management")}</span>
      </nav>

      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-2xl font-bold text-foreground tracking-tight">
            {t("page.globalSetting.roleManagement.title")}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {t("page.globalSetting.roleManagement.description")}
          </p>
        </div>
        <div
          className="overflow-x-auto shrink-0"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
          <div className="flex items-center gap-2 flex-nowrap">
            {canAccess(user, MENU_KEY, "add") && (
              <Button
                data-tour="role-add"
                onClick={() => navigate("/add-role")}
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg shadow-sm">
                <Plus size={18} />
                {t("page.globalSetting.roleManagement.button.add")}
              </Button>
            )}
          </div>
        </div>
      </div>

      {locData && (locData?.data || []).length === 0 ? (
        <NoStore />
      ) : (
        <>
          {isError ? (
            <AbortController refetch={refetch} />
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  label={t("page.globalSetting.roleManagement.stats.total")}
                  value={stats.total ?? total}
                  icon="shield"
                  variant="default"
                />
                <StatCard
                  label={t("page.globalSetting.roleManagement.stats.active")}
                  value={activeCount}
                  icon="check_circle"
                  variant="active"
                />
                <StatCard
                  label={t("common.draft")}
                  value={draftCount}
                  icon="edit_note"
                  variant="draft"
                />
                <StatCard
                  label={t("page.globalSetting.roleManagement.stats.inactive")}
                  value={inactiveCount}
                  icon="cancel"
                  variant="red"
                />
              </div>
              <div
                data-tour="role-table"
                className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
                <div className="px-6 py-5 border-b border-border flex justify-between items-center bg-muted/30">
                  <h4 className="text-base font-semibold text-foreground">
                    {t("page.globalSetting.roleManagement.table.title")}
                  </h4>
                </div>

                {isLoading ? (
                  <Loading fullscreen size="lg" label={t("common.loadingData")} />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-muted/10">
                          <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border">
                            {t("page.globalSetting.roleManagement.table.name")}
                          </th>
                          <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border">
                            {t("page.globalSetting.roleManagement.table.description")}
                          </th>
                          <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border">
                            {t("page.globalSetting.roleManagement.table.type")}
                          </th>
                          <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border">
                            {t("common.status")}
                          </th>
                          <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border">
                            {t("common.createdBy")}
                          </th>
                          <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border">
                            {t("common.modifiedBy")}
                          </th>
                          <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border">
                            {t("common.createdAt")}
                          </th>
                          <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border">
                            {t("common.updatedAt")}
                          </th>
                          <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border text-right">
                            {t("page.globalSetting.roleManagement.table.actions")}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {roles.length === 0 ? (
                          <tr>
                            <td
                              colSpan={9}
                              className="px-6 py-12 text-center text-muted-foreground">
                              <Shield size={40} className="mx-auto mb-2 opacity-40" />
                              {t("page.globalSetting.roleManagement.empty")}
                            </td>
                          </tr>
                        ) : (
                          roles.map((role) => (
                            <tr key={role.id} className="hover:bg-muted/20 transition-colors group">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  <Shield size={16} className="text-primary" />
                                  <span className="text-sm font-semibold text-foreground">
                                    {role.name}
                                  </span>
                                  {isProtected(role) && (
                                    <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700 uppercase tracking-wider">
                                      {t("common.default")}
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm text-muted-foreground">
                                {role.description || "-"}
                              </td>
                              <td className="px-6 py-4">
                                <span
                                  className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                                    role.roleType === "super_admin"
                                      ? "bg-red-100 text-red-700"
                                      : role.roleType === "admin"
                                        ? "bg-blue-100 text-blue-700"
                                        : "bg-gray-100 text-gray-700"
                                  }`}>
                                  {role.roleType}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <span
                                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                                    role.status === "active"
                                      ? "bg-green-100 text-green-700"
                                      : role.status === "draft"
                                        ? "bg-amber-100 text-amber-700"
                                        : "bg-red-100 text-red-700"
                                  }`}>
                                  <span
                                    className={`w-1.5 h-1.5 rounded-full ${
                                      role.status === "active"
                                        ? "bg-green-700"
                                        : role.status === "draft"
                                          ? "bg-amber-700"
                                          : "bg-red-700"
                                    }`}
                                  />
                                  {role.status === "active"
                                    ? t("common.active")
                                    : role.status === "draft"
                                      ? t("common.draft")
                                      : t("common.inactive")}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm text-muted-foreground">
                                {role.createdByUser?.fullName ||
                                  role.createdByUser?.userName ||
                                  role.createdBy ||
                                  (isProtected(role) ? t("common.system") : "-")}
                              </td>
                              <td className="px-6 py-4 text-sm text-muted-foreground">
                                {role.modifiedByUser?.fullName ||
                                  role.modifiedByUser?.userName ||
                                  role.modifiedBy ||
                                  (isProtected(role) ? t("common.system") : "-")}
                              </td>
                              <td className="px-6 py-4 text-sm font-mono text-muted-foreground">
                                {role.createdAt
                                  ? new Date(role.createdAt).toLocaleDateString("id-ID", {
                                      day: "numeric",
                                      month: "short",
                                      year: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit"
                                    })
                                  : "-"}
                              </td>
                              <td className="px-6 py-4 text-sm font-mono text-muted-foreground">
                                {role.updatedAt
                                  ? new Date(role.updatedAt).toLocaleDateString("id-ID", {
                                      day: "numeric",
                                      month: "short",
                                      year: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit"
                                    })
                                  : "-"}
                              </td>
                              <td className="px-6 py-4 text-right">
                                <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  {canAccess(user, MENU_KEY, "view") && (
                                    <button
                                      onClick={() => navigate(`/detail-role/${role.id}`)}
                                      className="p-1.5 text-muted-foreground hover:text-blue-600 hover:bg-blue-100/50 rounded-lg transition-all"
                                      title={t("page.globalSetting.roleManagement.tooltip.detail")}>
                                      <Eye size={18} />
                                    </button>
                                  )}
                                  {canAccess(user, MENU_KEY, "edit") && (
                                    <button
                                      onClick={() => navigate(`/edit-role/${role.id}`)}
                                      className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                                      title={t("common.edit")}>
                                      <Edit size={18} />
                                    </button>
                                  )}
                                  {!isProtected(role) && canAccess(user, MENU_KEY, "delete") && (
                                    <button
                                      onClick={() => setDeleteTarget(role)}
                                      className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all"
                                      title={t("common.delete")}>
                                      <Trash2 size={18} />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}

                <div className="px-6 py-4 border-t border-border flex justify-between items-center bg-muted/10">
                  <span className="text-xs text-muted-foreground">
                    {t("page.globalSetting.roleManagement.showing", { count: roles.length, total })}
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page <= 1}
                      className="p-2 rounded-lg hover:bg-muted text-muted-foreground disabled:opacity-30 transition-colors">
                      <span className="material-symbols-outlined text-lg">chevron_left</span>
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = i + 1;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`w-10 h-10 rounded-lg text-sm font-semibold transition-colors ${
                            page === pageNum
                              ? "bg-primary text-primary-foreground"
                              : "hover:bg-muted text-muted-foreground"
                          }`}>
                          {pageNum}
                        </button>
                      );
                    })}
                    {totalPages > 5 && (
                      <>
                        <span className="px-2 py-2 text-muted-foreground text-sm">...</span>
                        <button
                          onClick={() => setPage(totalPages)}
                          className="w-10 h-10 rounded-lg hover:bg-muted text-muted-foreground text-sm font-semibold transition-colors">
                          {totalPages}
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => setPage(Math.min(totalPages, page + 1))}
                      disabled={page >= totalPages}
                      className="p-2 rounded-lg hover:bg-muted text-muted-foreground disabled:opacity-30 transition-colors">
                      <span className="material-symbols-outlined text-lg">chevron_right</span>
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </>
      )}
      <Modal
        type="confirm"
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={t("page.role.modal.deleteTitle")}
        description={t("page.role.modal.deleteDesc", { name: deleteTarget?.name || "" })}
        confirmText={t("page.role.modal.deleteConfirm")}
        loading={deleteMutation.isLoading}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default RoleManagement;
