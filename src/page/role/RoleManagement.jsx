import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Eye, Shield, CheckCircle, FileEdit, XCircle } from "lucide-react";
import { getAllRoleTable, deleteRole } from "@/services/role";
import { getAllLocation } from "@/services/location";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/loading";
import { Skeleton } from "@/components/ui/skeleton";
import DataTable from "@/components/ui/DataTable";
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
    enabled: isSuperAdmin
  });
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const PROTECTED_ROLE_NAMES = ["Super Admin", "Admin", "User", "Kasir"];

  const isProtected = (role) => {
    return PROTECTED_ROLE_NAMES.includes(role.name || "");
  };

  const { data, isLoading, isError, refetch } = useQuery(["roles-table", page], () =>
    getAllRoleTable({ page, limit: 10 })
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
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-card rounded-xl border border-border p-4">
                      <div className="flex items-start justify-between mb-3">
                        <Skeleton className="h-3 w-24" />
                        <Skeleton className="h-4 w-4 rounded" />
                      </div>
                      <Skeleton className="h-8 w-28 mb-2" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard
                    label={t("page.globalSetting.roleManagement.stats.total")}
                    value={stats.total ?? total}
                    icon={Shield}
                    variant="default"
                  />
                  <StatCard
                    label={t("page.globalSetting.roleManagement.stats.active")}
                    value={activeCount}
                    icon={CheckCircle}
                    variant="active"
                  />
                  <StatCard
                    label={t("common.draft")}
                    value={draftCount}
                    icon={FileEdit}
                    variant="draft"
                  />
                  <StatCard
                    label={t("page.globalSetting.roleManagement.stats.inactive")}
                    value={inactiveCount}
                    icon={XCircle}
                    variant="red"
                  />
                </div>
              )}
              <div data-tour="role-table">
                <DataTable
                  columns={[
                    {
                      header: t("page.globalSetting.roleManagement.table.name"),
                      render: (row) => (
                        <div className="flex items-center gap-2">
                          <Shield size={16} className="text-primary" />
                          <span className="text-sm font-semibold text-foreground">{row.name}</span>
                          {isProtected(row) && (
                            <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700 uppercase tracking-wider">
                              {t("common.default")}
                            </span>
                          )}
                        </div>
                      )
                    },
                    {
                      header: t("page.globalSetting.roleManagement.table.description"),
                      render: (row) => (
                        <span className="text-sm text-muted-foreground">{row.description || "-"}</span>
                      )
                    },
                    {
                      header: t("page.globalSetting.roleManagement.table.type"),
                      render: (row) => (
                        <span
                          className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                            row.roleType === "super_admin"
                              ? "bg-red-100 text-red-700"
                              : row.roleType === "admin"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-gray-100 text-gray-700"
                          }`}>
                          {row.roleType}
                        </span>
                      )
                    },
                    {
                      header: t("common.status"),
                      render: (row) => (
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                            row.status === "active"
                              ? "bg-green-100 text-green-700"
                              : row.status === "draft"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-red-100 text-red-700"
                          }`}>
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              row.status === "active"
                                ? "bg-green-700"
                                : row.status === "draft"
                                  ? "bg-amber-700"
                                  : "bg-red-700"
                            }`}
                          />
                          {row.status === "active"
                            ? t("common.active")
                            : row.status === "draft"
                              ? t("common.draft")
                              : t("common.inactive")}
                        </span>
                      )
                    },
                    {
                      header: t("common.createdBy"),
                      render: (row) => (
                        <span className="text-sm text-muted-foreground">
                          {row.createdByUser?.fullName ||
                            row.createdByUser?.userName ||
                            row.createdBy ||
                            (isProtected(row) ? t("common.system") : "-")}
                        </span>
                      )
                    },
                    {
                      header: t("common.modifiedBy"),
                      render: (row) => (
                        <span className="text-sm text-muted-foreground">
                          {row.modifiedByUser?.fullName ||
                            row.modifiedByUser?.userName ||
                            row.modifiedBy ||
                            (isProtected(row) ? t("common.system") : "-")}
                        </span>
                      )
                    },
                    {
                      header: t("common.createdAt"),
                      render: (row) => (
                        <span className="text-sm font-mono text-muted-foreground">
                          {row.createdAt
                            ? new Date(row.createdAt).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit"
                              })
                            : "-"}
                        </span>
                      )
                    },
                    {
                      header: t("common.updatedAt"),
                      render: (row) => (
                        <span className="text-sm font-mono text-muted-foreground">
                          {row.updatedAt
                            ? new Date(row.updatedAt).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit"
                              })
                            : "-"}
                        </span>
                      )
                    },
                    {
                      header: t("page.globalSetting.roleManagement.table.actions"),
                      align: "right",
                      stickyRight: true,
                      render: (row) => (
                        <div className="flex justify-end gap-1">
                          {canAccess(user, MENU_KEY, "view") && (
                            <button
                              onClick={() => navigate(`/detail-role/${row.id}`)}
                              className="p-1.5 text-muted-foreground hover:text-blue-600 hover:bg-blue-100/50 rounded-lg transition-all"
                              title={t("page.globalSetting.roleManagement.tooltip.detail")}>
                              <Eye size={18} />
                            </button>
                          )}
                          {canAccess(user, MENU_KEY, "edit") && (
                            <button
                              onClick={() => navigate(`/edit-role/${row.id}`)}
                              className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                              title={t("common.edit")}>
                              <Edit size={18} />
                            </button>
                          )}
                          {!isProtected(row) && canAccess(user, MENU_KEY, "delete") && (
                            <button
                              onClick={() => setDeleteTarget(row)}
                              className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all"
                              title={t("common.delete")}>
                              <Trash2 size={18} />
                            </button>
                          )}
                        </div>
                      )
                    }
                  ]}
                  data={roles}
                  isLoading={isLoading}
                  emptyIcon={Shield}
                  emptyMessage={t("page.globalSetting.roleManagement.empty")}
                  toolbar={
                    <h4 className="text-base font-semibold text-foreground">
                      {t("page.globalSetting.roleManagement.table.title")}
                    </h4>
                  }
                  pagination={{
                    page,
                    totalPages,
                    total,
                    onPageChange: setPage,
                    showingText: t("page.globalSetting.roleManagement.showing", {
                      count: roles.length,
                      total
                    })
                  }}
                />
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
      {deleteMutation.isLoading && <Loading fullscreen size="lg" label={t("common.loadingData")} />}
    </div>
  );
};

export default RoleManagement;
