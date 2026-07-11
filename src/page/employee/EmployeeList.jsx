import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { toast } from "sonner";
import { getAllEmployee, deleteEmployee } from "@/services/employee";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loading } from "@/components/ui/loading";
import { Skeleton } from "@/components/ui/skeleton";
import Modal from "@/components/organism/modal";
import PageHeader from "@/components/ui/PageHeader";
import { User, Users, CheckCircle, FileEdit, XCircle } from "lucide-react";
import { getAllLocation } from "@/services/location";
import NoStore from "@/components/ui/NoStore";
import { useTranslation } from "react-i18next";
import DataTable from "@/components/ui/DataTable";
import StatCard from "@/components/ui/StatCard";
import { canAccess } from "@/utils/permission";

const positionColors = {
  manager: "bg-primary-fixed text-on-primary-fixed",
  kasir: "bg-surface-variant text-on-surface-variant",
  admin: "bg-surface-variant text-on-surface-variant",
  staff: "bg-surface-variant text-on-surface-variant",
  supervisor: "bg-surface-container-high text-on-surface"
};

const getPositionClass = (position) => {
  const pos = typeof position === "string" ? position.toLowerCase() : "";
  return positionColors[pos] || "bg-surface-variant text-on-surface-variant";
};

const EmployeeList = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [cookie] = useCookies();
  const user = cookie?.user;
  const isSuperAdmin = user?.roleType === "super_admin";
  const MENU_KEY = "/employee-list";
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [positionFilter, setPositionFilter] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const { t } = useTranslation();

  const { data, isLoading } = useQuery(
    ["employees", page, limit, search, locationFilter, positionFilter],
    () =>
      getAllEmployee({ page, limit, search, location: locationFilter, position: positionFilter }),
    {}
  );

  const { data: locData } = useQuery(["locations-employees"], () => getAllLocation(), {
    staleTime: 5 * 60 * 1000,
    enabled: isSuperAdmin
  });

  const deleteMutation = useMutation(deleteEmployee, {
    onSuccess: () => {
      toast.success(t("page.employee.list.toast.success"), {
        description: t("page.employee.list.toast.successDescription")
      });
      queryClient.invalidateQueries(["employees"]);
    },
    onError: (err) => {
      toast.error(t("page.employee.list.toast.error"), {
        description: err?.response?.data?.message || err.message
      });
    }
  });

  const employees = data?.data || data?.employees || [];
  const total = data?.total || data?.pagination?.total || 0;
  const totalPages = data?.pagination?.totalPages || Math.ceil(total / limit) || 1;
  const stats = data?.stats || {};
  const activeCount = stats.active ?? 0;
  const draftCount = stats.draft ?? 0;
  const inactiveCount = stats.inactive ?? 0;

  const handleDelete = (employee) => {
    setDeleteTarget(employee);
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      deleteMutation.mutate({ id: deleteTarget.id || deleteTarget._id });
      setDeleteTarget(null);
    }
  };

  const columns = [
    {
      header: t("page.employee.list.photo"),
      render: (row) => (
        <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted border border-border">
          {row.image ? (
            <img src={row.image} alt={row.fullName} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <User size={16} />
            </div>
          )}
        </div>
      )
    },
    {
      header: t("page.employee.table.id"),
      render: (row) => (
        <span className="text-sm font-mono font-bold text-primary">
          {row.employeeID || row.code || "-"}
        </span>
      )
    },
    {
      header: t("page.employee.table.name"),
      render: (row) => (
        <div>
          <p className="text-sm font-semibold text-foreground">{row.fullName}</p>
          <p className="text-xs text-muted-foreground">{row.email}</p>
        </div>
      )
    },
    {
      header: t("page.employee.form.department"),
      render: (row) => (
        <span className="text-sm">{row.departmentData?.name || row.department || "-"}</span>
      )
    },
    {
      header: t("page.employee.table.position"),
      render: (row) => {
        const position = row.positionData?.name || row.role || "staff";
        return (
          <span
            className={`inline-block px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${getPositionClass(position)}`}>
            {position === "kasir"
              ? t("page.employee.list.kasir")
              : position.charAt(0).toUpperCase() + position.slice(1)}
          </span>
        );
      }
    },
    {
      header: t("page.employee.form.employmentType"),
      render: (row) => (
        <span className="text-sm">
          {row.employmentType ? t(`page.employee.add.${row.employmentType.replace("-", "")}`) : "-"}
        </span>
      )
    },
    {
      header: t("page.employee.form.phoneNumber"),
      render: (row) => <span className="text-sm">{row.phoneNumber || "-"}</span>
    },
    {
      header: t("page.employee.table.branch"),
      render: (row) => (
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-muted-foreground text-base">
            location_on
          </span>
          <span className="text-sm text-muted-foreground">
            {row.storeData?.name || "belum ada penempatan store"}
          </span>
        </div>
      )
    },
    {
      header: t("page.employee.table.status"),
      align: "center",
      render: (row) => (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tight border ${
            row.status === "active"
              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800"
              : row.status === "draft"
                ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800"
                : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800"
          }`}>
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
        <span className="text-sm">
          {row.createdByUser?.fullName || row.createdByUser?.userName || row.createdBy || "-"}
        </span>
      )
    },
    {
      header: t("common.modifiedBy"),
      render: (row) => (
        <span className="text-sm">
          {row.modifiedByUser?.fullName || row.modifiedByUser?.userName || row.modifiedBy || "-"}
        </span>
      )
    },
    {
      header: t("common.createdAt"),
      render: (row) => (
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          {row.createdAt
            ? new Date(row.createdAt).toLocaleDateString("id-ID", {
                year: "numeric",
                month: "short",
                day: "numeric"
              })
            : "-"}
        </span>
      )
    },
    {
      header: t("common.updatedAt"),
      render: (row) => (
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          {row.updatedAt
            ? new Date(row.updatedAt).toLocaleDateString("id-ID", {
                year: "numeric",
                month: "short",
                day: "numeric"
              })
            : "-"}
        </span>
      )
    },
    {
      header: t("page.employee.table.actions"),
      align: "center",
      stickyRight: true,
      render: (row) => (
        <div className="flex items-center justify-center gap-1">
          {canAccess(user, MENU_KEY, "view") && (
            <button
              onClick={() => navigate(`/detail-employee?employeeID=${row.employeeID}`)}
              className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg"
              title={t("page.employee.list.viewDetail")}>
              <span className="material-symbols-outlined text-lg">visibility</span>
            </button>
          )}
          {canAccess(user, MENU_KEY, "edit") && (
            <button
              onClick={() => navigate(`/edit-employee?id=${row.id}`)}
              className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg"
              title={t("page.employee.list.editEmployee")}>
              <span className="material-symbols-outlined text-lg">edit</span>
            </button>
          )}
          {canAccess(user, MENU_KEY, "delete") && (
            <button
              onClick={() => handleDelete(row)}
              className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
              title={t("page.employee.list.deleteEmployee")}>
              <span className="material-symbols-outlined text-lg">delete</span>
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div data-tour="page-employees" className="space-y-6">
      <div>
        <div>
          <PageHeader
            breadcrumbs={[
              { label: t("breadcrumb.management"), i18nKey: "breadcrumb.management" },
              { label: t("page.employee.list.title"), i18nKey: "page.employee.list.title" }
            ]}
            title={t("page.employee.list.title")}
            description={t("page.employee.list.description")}>
            {canAccess(user, MENU_KEY, "add") && (
              <Button
                data-tour="employee-add"
                onClick={() => navigate("/add-employee")}
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg shadow-sm">
                <span className="material-symbols-outlined text-lg">person_add</span>
                {t("page.employee.add.title")}
              </Button>
            )}
          </PageHeader>
        </div>
      </div>

      <div>
        {locData && (locData?.data || []).length === 0 ? (
          <NoStore />
        ) : (
          <>
            <div>
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <StatCard
                    label={t("page.employee.table.total")}
                    value={total.toLocaleString() || "0"}
                    icon={Users}
                    variant="default"
                    subtitle={t("page.employee.list.subtitle")}
                  />
                  <StatCard
                    label={t("page.employee.table.active")}
                    value={activeCount.toLocaleString() || "0"}
                    icon={CheckCircle}
                    variant="active"
                    subtitle={`${total > 0 ? Math.round((activeCount / total) * 100) : 0}% ${t("page.employee.table.activeRate")}`}
                  />
                  <StatCard
                    label={t("page.employee.table.draft")}
                    value={draftCount.toLocaleString()}
                    icon={FileEdit}
                    variant="draft"
                  />
                  <StatCard
                    label={t("page.employee.table.inactive")}
                    value={inactiveCount.toLocaleString()}
                    icon={XCircle}
                    variant="inactive"
                    subtitle={t("page.employee.table.attentionNeeded")}
                  />
                </div>
              )}

              <div data-tour="employee-table" className="mt-6">
                <DataTable
                  columns={columns}
                  data={employees}
                  isLoading={isLoading}
                  emptyMessage={t("page.employee.list.empty")}
                  toolbar={
                    <div className="flex flex-wrap gap-4 items-center justify-between">
                      <div className="flex flex-wrap gap-4 items-center flex-grow">
                        <div className="relative min-w-[260px]">
                          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-base">
                            search
                          </span>
                          <Input
                            placeholder={t("page.employee.list.searchPlaceholder")}
                            value={search}
                            onChange={(e) => {
                              setSearch(e.target.value);
                              setPage(1);
                            }}
                            className="pl-9 h-9 w-full text-sm"
                          />
                        </div>
                        <div className="flex gap-3">
                          <select
                            value={locationFilter}
                            onChange={(e) => {
                              setLocationFilter(e.target.value);
                              setPage(1);
                            }}
                            className="bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20">
                            <option value="">{t("page.employee.list.allStores")}</option>
                            {(locData?.data || []).map((loc) => (
                              <option key={loc.id} value={loc.id}>
                                {loc.name}
                              </option>
                            ))}
                          </select>
                          <select
                            value={positionFilter}
                            onChange={(e) => {
                              setPositionFilter(e.target.value);
                              setPage(1);
                            }}
                            className="bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20">
                            <option value="">{t("page.employee.list.allPositions")}</option>
                            <option value="manager">{t("page.employee.list.manager")}</option>
                            <option value="kasir">{t("page.employee.list.kasir")}</option>
                            <option value="admin">{t("page.employee.list.admin")}</option>
                            <option value="staff">{t("page.employee.list.staff")}</option>
                            <option value="supervisor">{t("page.employee.list.supervisor")}</option>
                          </select>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="gap-2 h-9">
                        <span className="material-symbols-outlined text-base">tune</span>
                        Advanced Filters
                      </Button>
                    </div>
                  }
                  pagination={{
                    page,
                    totalPages,
                    total,
                    onPageChange: setPage,
                    pageSize: limit,
                    onPageSizeChange: (v) => {
                      setLimit(v);
                      setPage(1);
                    }
                  }}
                  rowClassName={() => "group"}
                />
              </div>

              <div className="bg-gradient-to-br from-primary to-primary/90 rounded-xl p-5 flex flex-col text-primary-foreground mt-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined opacity-80">lightbulb</span>
                  <h4 className="text-sm font-bold uppercase tracking-wider opacity-80">Tips</h4>
                </div>
                <ul className="space-y-2">
                  <li className="text-xs leading-relaxed opacity-90 flex items-start gap-2">
                    <span className="text-primary-foreground/60 mt-0.5">•</span>
                    <span>
                      Gunakan filter cabang untuk melihat beban kerja per lokasi secara cepat.
                    </span>
                  </li>
                  <li className="text-xs leading-relaxed opacity-90 flex items-start gap-2">
                    <span className="text-primary-foreground/60 mt-0.5">•</span>
                    <span>
                      Unduh laporan karyawan dalam format Excel melalui menu download data.
                    </span>
                  </li>
                  <li className="text-xs leading-relaxed opacity-90 flex items-start gap-2">
                    <span className="text-primary-foreground/60 mt-0.5">•</span>
                    <span>Pastikan data karyawan selalu diperbarui untuk akurasi penggajian.</span>
                  </li>
                  <li className="text-xs leading-relaxed opacity-90 flex items-start gap-2">
                    <span className="text-primary-foreground/60 mt-0.5">•</span>
                    <span>Gunakan status aktif/nonaktif untuk mengelola akses karyawan.</span>
                  </li>
                </ul>
              </div>
            </div>
          </>
        )}
      </div>

      <Modal
        type="confirm"
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={t("page.employee.modal.deleteTitle")}
        description={t("page.employee.modal.deleteDesc", {
          name: deleteTarget?.fullName || deleteTarget?.name || t("page.employee.list.data")
        })}
        confirmText={t("page.employee.modal.deleteConfirm")}
        loading={deleteMutation.isLoading}
        onConfirm={confirmDelete}
      />
      {deleteMutation.isLoading && <Loading fullscreen size="lg" label={t("common.loadingData")} />}
    </div>
  );
};

export default EmployeeList;
