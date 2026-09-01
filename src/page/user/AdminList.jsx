import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery } from "react-query";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { toast } from "sonner";
import { getAllUsers, changeUserStatus } from "@/services/user";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/SearchInput";
import TableToolbar from "@/components/ui/TableToolbar";
import TableActions from "@/components/ui/TableActions";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Shield,
  CheckCircle,
  FileEdit,
  Edit,
  Trash2,
  XCircle,
  ShieldCheck,
  UserPlus,
  Download,
  MapPin,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  ShieldAlert,
  Sparkles
} from "lucide-react";
import { canAccess } from "@/utils/permission";
import AbortController from "@/components/organism/abort-controller";
import Modal from "@/components/organism/modal";
import StatCard from "@/components/ui/StatCard";
import TableActionLegend from "@/components/ui/TableActionLegend";

const getStatus = (user, t) => {
  const statusConfig = {
    active: {
      dot: "bg-green-500",
      bg: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800",
      label: t("common.active")
    },
    inactive: {
      dot: "bg-muted-foreground",
      bg: "bg-muted text-muted-foreground border border-border",
      label: t("common.inactive")
    },
    pending: {
      dot: "bg-amber-500",
      bg: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800",
      label: t("common.pending")
    }
  };

  if (user.status === "pending" || user.isActive === null) return statusConfig.pending;
  if (user.isActive || user.status === "active") return statusConfig.active;
  return statusConfig.inactive;
};

const roleColors = {
  super_admin:
    "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border border-purple-200 dark:border-purple-800",
  admin:
    "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800",
  supervisor:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800",
  manager: "bg-muted text-foreground text-xs font-medium"
};

const getRoleClass = (role) => {
  return roleColors[role?.toLowerCase()] || "bg-muted text-muted-foreground border border-border";
};

const getInitials = (name) => {
  if (!name) return "?";
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const avatarBg = (name) => {
  const colors = [
    "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
    "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
    "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    "bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300",
    "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300"
  ];
  let hash = 0;
  for (let i = 0; i < (name || "").length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

const AdminList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [cookie] = useCookies();
  const user = cookie?.user;
  const MENU_KEY = "/user-list";
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");

  const isFiltered = search !== "";

  const resetFilters = () => {
    setSearch("");
    setPage(1);
  };

  const [statusModal, setStatusModal] = useState(null);

  const statusMutation = useMutation(changeUserStatus, {
    onSuccess: () => {
      toast.success("Berhasil", { description: "Status user berhasil diubah" });
      refetch();
    },
    onError: (err) => {
      toast.error("Gagal", {
        description: err?.response?.data?.message || err.message || "Gagal mengubah status user"
      });
    }
  });

  const handleConfirmStatus = () => {
    if (!statusModal) return;
    statusMutation.mutate({ id: statusModal.id, status: statusModal.status });
    setStatusModal(null);
  };

  const { data, isLoading, isFetching, isError, refetch } = useQuery(
    ["admins", page, limit, search],
    () => getAllUsers({ page, limit, search }),
    {}
  );

  const users = data?.data || data?.users || [];
  const total = data?.total || data?.pagination?.total || 0;
  const totalPages = data?.pagination?.totalPages || Math.ceil(total / limit) || 1;

  return (
    <div>
      <div className="space-y-8">
        <div className="flex justify-between items-end">
          <div>
            <nav className="flex gap-2 mb-2 text-sm text-muted-foreground">
              <span>{t("breadcrumb.management")}</span>
              <span>/</span>
              <span className="text-primary font-semibold">{t("page.user.adminList.title")}</span>
            </nav>
            <h2 className="text-2xl font-bold text-foreground tracking-tight">
              {t("page.user.adminList.pageTitle")}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {t("page.user.adminList.description")}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* 
          <Button variant="outline" onClick={() => navigate("/role-management")} className="gap-2">
            <ShieldCheck size={20} className="text-lg" />
            {t("page.user.adminList.roleManagement")}
          </Button>
          */}
            {canAccess(user, MENU_KEY, "add") && (
              <Button
                variant="success"
                onClick={() => navigate("/add-user")}
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg shadow-sm">
                <UserPlus size={20} className="text-lg" />
                {t("page.user.button.add")}
              </Button>
            )}
          </div>
        </div>

        {isError ? (
          <AbortController refetch={refetch} />
        ) : (
          <>
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                  label={t("page.user.adminList.statsTotal")}
                  value={data?.stats?.total || total || 0}
                  icon={Shield}
                  variant="default"
                  subtitle={t("page.user.adminList.statsTotalBadge")}
                />
                <StatCard
                  label={t("page.user.adminList.statsActive")}
                  value={data?.stats?.active || 0}
                  icon={CheckCircle}
                  variant="active"
                  subtitle={`${total > 0 ? Math.round(((data?.stats?.active || 0) / (data?.stats?.total || total || 1)) * 100) : 0}${t("page.user.adminList.statsActivePercent")}`}
                />
                <StatCard
                  label={t("page.user.adminList.statsPending")}
                  value={data?.stats?.pending || 0}
                  icon={FileEdit}
                  variant="draft"
                  subtitle={t("page.user.adminList.statsPendingBadge")}
                />
              </div>
            )}

            <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
              <div className="px-6 py-5 border-b border-border bg-muted/30">
                <div className="flex justify-between items-center gap-3">
                  <h4 className="text-base font-semibold text-foreground">
                    {t("page.user.adminList.tableTitle")}
                  </h4>
                  <div className="flex gap-3">
                    {canAccess(user, MENU_KEY, "export") && (
                      <Button variant="general" size="sm" className="gap-2 h-9">
                        <Download size={18} className="text-base" />
                        {t("page.user.adminList.exportCsv")}
                      </Button>
                    )}
                  </div>
                </div>
                <div className="mt-4">
                  <TableToolbar onReset={resetFilters} isFiltered={isFiltered}>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Cari
                      </label>
                      <SearchInput
                        value={search}
                        onChange={(val) => {
                          setSearch(val);
                          setPage(1);
                        }}
                        placeholder={t("page.user.adminList.search")}
                        isLoading={isFetching}
                      />
                    </div>
                  </TableToolbar>
                </div>
              </div>

              {isLoading ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-muted/10">
                        <th className="px-6 py-4 border-b border-border">
                          <Skeleton className="h-3 w-24" />
                        </th>
                        <th className="px-6 py-4 border-b border-border">
                          <Skeleton className="h-3 w-16" />
                        </th>
                        <th className="px-6 py-4 border-b border-border">
                          <Skeleton className="h-3 w-12" />
                        </th>
                        <th className="px-6 py-4 border-b border-border">
                          <Skeleton className="h-3 w-14" />
                        </th>
                        <th className="px-6 py-4 border-b border-border text-right">
                          <Skeleton className="h-3 w-16 ml-auto" />
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {[...Array(6)].map((_, i) => (
                        <tr key={i}>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <Skeleton className="w-10 h-10 rounded-full" />
                              <div>
                                <Skeleton className="h-4 w-28 mb-1" />
                                <Skeleton className="h-3 w-36" />
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <Skeleton className="h-4 w-4" />
                              <Skeleton className="h-4 w-24" />
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <Skeleton className="h-5 w-20 rounded-full" />
                          </td>
                          <td className="px-6 py-4">
                            <Skeleton className="h-5 w-20 rounded-full" />
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Skeleton className="h-8 w-16 rounded ml-auto" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-muted/10">
                        <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border">
                          {t("page.user.adminList.tableAdmin")}
                        </th>
                        <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border">
                          {t("page.user.adminList.tableStore")}
                        </th>
                        <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border">
                          {t("page.user.adminList.tableRole")}
                        </th>
                        <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border">
                          {t("common.status")}
                        </th>
                        <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border text-right">
                          {t("common.actions")}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {users.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                            <ShieldCheck size={36} className="text-4xl block mb-2" />
                            {t("page.user.adminList.empty")}
                          </td>
                        </tr>
                      ) : (
                        users.map((user) => {
                          const status = getStatus(user, t);
                          const role = user.roleType || "admin";
                          return (
                            <tr
                              key={user.id || user._id}
                              className="hover:bg-muted/20 transition-colors group">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div
                                    className={`w-10 h-10 rounded-full ${avatarBg(user.name || user.username)} flex items-center justify-center text-sm font-bold`}>
                                    {getInitials(user.name || user.username)}
                                  </div>
                                  <div>
                                    <p className="text-sm font-semibold text-foreground">
                                      {user.name || user.username}
                                    </p>
                                    <p className="text-xs text-muted-foreground">{user.email}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  <MapPin size={18} className="text-muted-foreground text-base" />
                                  <span className="text-sm text-muted-foreground">
                                    {user.storeName || user.locationName || "-"}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span
                                  className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getRoleClass(role)}`}>
                                  {role.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <span
                                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${status.bg}`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                                  {status.label}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                {user.status === "pending" || user.isActive === null ? (
                                  <div className="flex justify-end items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        setStatusModal({ id: user.id, status: "active" })
                                      }
                                      className="h-8 text-xs gap-1 bg-primary text-primary-foreground hover:brightness-110 border-0">
                                      {t("page.user.adminList.activate")}
                                    </Button>
                                    <TableActions
                                      align="right"
                                      visible={2}
                                      items={[
                                        {
                                          label: t("common.deactivate"),
                                          iconName: "close",
                                          danger: true,
                                          onClick: () =>
                                            setStatusModal({ id: user.id, status: "inactive" })
                                        }
                                      ]}
                                    />
                                  </div>
                                ) : (
                                  <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                    <TableActions
                                      align="right"
                                      items={[
                                        {
                                          label: t("common.edit"),
                                          iconName: "edit",
                                          hidden: !canAccess(user, MENU_KEY, "edit")
                                        },
                                        {
                                          label: t("common.delete"),
                                          iconName: "delete",
                                          danger: true,
                                          hidden: !canAccess(user, MENU_KEY, "delete")
                                        }
                                      ]}
                                    />
                                  </div>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="px-6 py-4 border-t border-border flex justify-between items-center bg-muted/10">
                <span className="text-xs text-muted-foreground">
                  {t("page.user.adminList.showing", { count: users.length, total })}
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page <= 1}
                    className="p-2 rounded-lg hover:bg-muted text-muted-foreground disabled:opacity-30 transition-colors">
                    <ChevronLeft size={20} className="text-lg" />
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
                    <ChevronRight size={20} className="text-lg" />
                  </button>
                </div>
              </div>
            </div>

            <TableActionLegend
              className="mt-4"
              items={[
                { icon: Edit, label: t("common.edit") },
                { icon: Trash2, label: t("common.delete") },
                { icon: XCircle, label: t("common.deactivate") }
              ]}
            />

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              <div className="lg:col-span-3 p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20 border border-blue-200 dark:border-blue-800 relative overflow-hidden group">
                <div className="relative z-10 max-w-md">
                  <h5 className="text-xl font-semibold text-foreground mb-3">
                    {t("page.user.adminList.securityTitle")}
                  </h5>
                  <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                    {t("page.user.adminList.securityDesc")}
                  </p>
                  <Button variant="link" className="gap-2 p-0 h-auto text-primary font-semibold">
                    {t("page.user.adminList.learnSecurity")}
                    <ArrowRight size={20} className="text-lg" />
                  </Button>
                </div>
                <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-colors" />
                <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden md:block opacity-10 group-hover:opacity-20 transition-opacity">
                  <ShieldAlert size={120} className="text-[120px] text-primary" />
                </div>
              </div>
              <div className="lg:col-span-2 p-8 rounded-2xl bg-foreground text-background border border-border flex flex-col justify-between">
                <div>
                  <Sparkles size={36} className="text-4xl mb-4 opacity-80" />
                  <h5 className="text-lg font-semibold mb-2">
                    {t("page.user.adminList.quickHelp")}
                  </h5>
                  <p className="text-sm opacity-70 leading-snug">
                    {t("page.user.adminList.quickHelpDesc")}
                  </p>
                </div>
                <button className="mt-6 w-full py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors text-sm font-semibold">
                  {t("page.user.adminList.contactSuccess")}
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <Modal
        type="confirm"
        open={!!statusModal}
        onOpenChange={(v) => {
          if (!v) setStatusModal(null);
        }}
        title={
          statusModal?.status === "active"
            ? t("page.user.adminList.activateConfirmTitle")
            : t("page.user.adminList.deactivateConfirmTitle")
        }
        description={
          statusModal?.status === "active"
            ? t("page.user.adminList.activateConfirmDesc")
            : t("page.user.adminList.deactivateConfirmDesc")
        }
        confirmText={t("common.confirm")}
        onConfirm={handleConfirmStatus}
      />
    </div>
  );
};

export default AdminList;
