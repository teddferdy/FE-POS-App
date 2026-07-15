import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import {
  Plus,
  Package,
  Loader2,
  FolderOpen,
  CheckCircle,
  XCircle,
  FileEdit
} from "lucide-react";
import {
  getAllIngredientCategoryTable,
  deleteIngredientCategory,
  downloadIngredientCategoryTemplate,
  downloadIngredientCategoryExcel
} from "@/services/ingredientCategory";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/loading";
import { SearchInput } from "@/components/ui/SearchInput";
import { Skeleton } from "@/components/ui/skeleton";
import Modal from "@/components/organism/modal";
import UploadExcelModal from "@/components/organism/UploadExcelModal";
import { uploadIngredientCategoryExcel } from "@/services/ingredientCategory";
import DataTable from "@/components/ui/DataTable";
import { TipsCard } from "@/components/ui/tips-card";
import { canAccess } from "@/utils/permission";
import AbortController from "@/components/organism/abort-controller";
import StatCard from "@/components/ui/StatCard";
import NoStore from "@/components/ui/NoStore";
import { getAllLocation } from "@/services/location";

const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "-";
    return (
      d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) +
      " " +
      d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
    );
  } catch {
    return "-";
  }
};

const CategoryList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [cookie] = useCookies();
  const user = cookie?.user;
  const isSuperAdmin = user?.roleType === "super_admin";
  const MENU_KEY = "/ingredient-category";
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [isDownloadingTemplate, setIsDownloadingTemplate] = useState(false);
  const [isDownloadingData, setIsDownloadingData] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: locData, isLoading: isLoadingLocations } = useQuery(["locations-ingredient-categories"], () => getAllLocation(), {
    enabled: isSuperAdmin
  });

  const { data, isLoading, isFetching, isError, refetch } = useQuery(
    ["ingredient-categories", page, search, statusFilter],
    () => getAllIngredientCategoryTable({ page, limit, search, status: statusFilter })
  );

  const deleteMutation = useMutation(deleteIngredientCategory, {
    onSuccess: () => {
      toast.success(t("page.ingredientCategory.list.toastSuccess"), {
        description: t("page.ingredientCategory.list.toastSuccessDesc")
      });
      queryClient.invalidateQueries(["ingredient-categories"]);
    },
    onError: (err) => {
      toast.error(t("page.ingredientCategory.list.toastError"), {
        description: err?.response?.data?.message || err.message
      });
    }
  });

  const categories = data?.data || [];
  const pagination = data?.pagination || {};
  const totalPages = pagination.totalPages || 1;
  const stats = data?.stats || {};
  const draftCount = stats.draft ?? 0;
  const activeCount = stats.active ?? 0;
  const inactiveCount = stats.inactive ?? 0;
  const statsTotal = stats.total ?? 0;

  const columns = [
    {
      header: t("page.ingredientCategory.list.tableKode"),
      render: (item) => (
        <span className="font-mono text-sm text-foreground">{`#ICAT-${String(item.id).padStart(3, "0")}`}</span>
      )
    },
    {
      header: t("page.ingredientCategory.list.tableNama"),
      render: (item) => (
        <span className="text-sm font-semibold text-foreground">{item.name || "-"}</span>
      )
    },

    {
      header: t("page.ingredientCategory.list.tableStatus"),
      render: (item) => (
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
            item.status === "active"
              ? "bg-green-100 text-green-700 border border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800"
              : item.status === "draft"
                ? "bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800"
                : "bg-red-100 text-red-700 border border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800"
          }`}>
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              item.status === "active"
                ? "bg-green-500 dark:bg-green-400"
                : item.status === "draft"
                  ? "bg-amber-500 dark:bg-amber-400"
                  : "bg-red-500 dark:bg-red-400"
            }`}
          />
          {item.status === "active"
            ? t("page.ingredientCategory.list.active")
            : item.status === "draft"
              ? t("common.draft")
              : t("page.ingredientCategory.list.inactive")}
        </span>
      )
    },
    {
      header: t("common.createdBy"),
      render: (item) => (
        <span className="text-sm text-muted-foreground">
          {item.createdByUser?.fullName || item.createdByUser?.userName || item.createdBy || "-"}
        </span>
      )
    },
    {
      header: t("page.ingredientCategory.list.tableDibuat"),
      render: (item) => (
        <span className="text-sm font-mono text-muted-foreground">
          {formatDate(item.createdAt)}
        </span>
      )
    },
    {
      header: t("common.modifiedBy"),
      render: (item) => (
        <span className="text-sm text-muted-foreground">
          {item.modifiedByUser?.fullName || item.modifiedByUser?.userName || item.modifiedBy || "-"}
        </span>
      )
    },
    {
      header: t("common.updatedAt"),
      render: (item) => (
        <span className="text-sm font-mono text-muted-foreground">
          {formatDate(item.updatedAt)}
        </span>
      )
    },
    {
      header: t("page.ingredientCategory.list.tableAksi"),
      align: "right",
      stickyRight: true,
      render: (item) => (
        <div className="flex items-center justify-end gap-1">
          {canAccess(user, MENU_KEY, "view") && (
            <button
              onClick={() => navigate(`/detail-ingredient-category?id=${item.id}`)}
              className="p-1.5 text-muted-foreground hover:text-blue-600 hover:bg-blue-100/50 rounded-lg transition-all"
              title={t("page.ingredientCategory.list.viewTitle")}>
              <span className="material-symbols-outlined text-lg">visibility</span>
            </button>
          )}
          {canAccess(user, MENU_KEY, "edit") && (
            <button
              onClick={() => navigate(`/edit-ingredient-category?id=${item.id}`)}
              className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
              title={t("page.ingredientCategory.list.editTitle")}>
              <span className="material-symbols-outlined text-lg">edit</span>
            </button>
          )}
          {canAccess(user, MENU_KEY, "delete") && (
            <button
              onClick={() => setDeleteTarget(item.id)}
              className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all"
              title={t("page.ingredientCategory.list.deleteTitle")}>
              <span className="material-symbols-outlined text-lg">delete</span>
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <button
            onClick={() => navigate("/dashboard-super-admin")}
            className="hover:text-foreground transition-colors">
            {t("breadcrumb.home")}
          </button>
          <span className="text-xs">/</span>
          <span className="text-primary font-semibold">
            {t("page.ingredientCategory.list.title")}
          </span>
        </nav>
      </div>

      <div>
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-foreground">
              {t("page.ingredientCategory.list.title")}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {t("page.ingredientCategory.list.subtitle")}
            </p>
          </div>
          <div
            className="overflow-x-auto shrink-0"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
            <div className="flex items-center gap-2 flex-nowrap">
              {canAccess(user, MENU_KEY, "export") && (
                <Button
                  variant="outline"
                  disabled={isDownloadingTemplate}
                  onClick={async () => {
                    setIsDownloadingTemplate(true);
                    try {
                      await downloadIngredientCategoryTemplate();
                      toast.success(t("common.success"), {
                        description: t("page.ingredientCategory.toast.templateSuccess")
                      });
                    } catch (err) {
                      toast.error(t("common.error"), {
                        description:
                          err?.response?.data?.message ||
                          err.message ||
                          t("page.ingredientCategory.toast.templateError")
                      });
                    } finally {
                      setIsDownloadingTemplate(false);
                    }
                  }}>
                  {isDownloadingTemplate ? (
                    <Loader2 size={16} className="mr-1 animate-spin" />
                  ) : (
                    <span className="material-symbols-outlined text-lg mr-1">table_rows</span>
                  )}
                  {t("page.ingredientCategory.button.downloadTemplate")}
                </Button>
              )}
              {canAccess(user, MENU_KEY, "export") && (
                <Button
                  variant="outline"
                  disabled={isDownloadingData}
                  onClick={async () => {
                    setIsDownloadingData(true);
                    try {
                      await downloadIngredientCategoryExcel();
                      toast.success(t("common.success"), {
                        description: t("page.ingredientCategory.toast.dataSuccess")
                      });
                    } catch (err) {
                      toast.error(t("common.error"), {
                        description:
                          err?.response?.data?.message ||
                          err.message ||
                          t("page.ingredientCategory.toast.dataError")
                      });
                    } finally {
                      setIsDownloadingData(false);
                    }
                  }}>
                  {isDownloadingData ? (
                    <Loader2 size={16} className="mr-1 animate-spin" />
                  ) : (
                    <span className="material-symbols-outlined text-lg mr-1">download</span>
                  )}
                  {t("page.ingredientCategory.button.downloadData")}
                </Button>
              )}
              {canAccess(user, MENU_KEY, "import") && (
                <Button variant="default" onClick={() => setUploadModalOpen(true)}>
                  <span className="material-symbols-outlined text-lg mr-1">upload</span>
                  {t("page.ingredientCategory.button.upload")}
                </Button>
              )}
              {canAccess(user, MENU_KEY, "create") && (
                <Button onClick={() => navigate("/add-ingredient-category")} className="shadow-md">
                  <Plus size={16} className="mr-1" />
                  {t("page.ingredientCategory.list.addButton")}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {locData && (locData?.data || []).length === 0 ? (
        <NoStore />
      ) : (
        <>
          <div>
            <div>
              {isFetching || isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
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
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                  <StatCard
                    label={t("page.ingredientCategory.list.statTotal")}
                    value={statsTotal}
                    icon={FolderOpen}
                    variant="default"
                  />
                  <StatCard
                    label={t("page.ingredientCategory.list.statActive")}
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
                    label={t("page.ingredientCategory.list.statInactive")}
                    value={inactiveCount}
                    icon={XCircle}
                    variant="inactive"
                  />
                </div>
              )}
            </div>

            {isError ? (
              <AbortController refetch={refetch} />
            ) : (
              <div className="mt-6">
                <DataTable
                  columns={columns}
                  data={categories}
                  isLoading={isLoading || isFetching}
                  emptyMessage={t("page.ingredientCategory.list.emptyText")}
                  emptyIcon={Package}
                  toolbar={
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 w-full">
                      {isLoadingLocations || isLoading || isFetching ? (
                        <>
                          <Skeleton className="h-6 w-32" />
                          <div className="flex items-center gap-3 w-full md:w-auto">
                            <Skeleton className="h-9 w-64 rounded-md" />
                          </div>
                        </>
                      ) : (
                        <>
                          <h4 className="text-base font-semibold text-foreground">
                            {t("page.ingredientCategory.list.title")}
                          </h4>
                          <div className="flex items-center gap-3 w-full md:w-auto">
                            <select
                              value={statusFilter}
                              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                              className="h-9 px-3 bg-background border border-input rounded-lg text-sm focus:ring-2 focus:ring-ring outline-none">
                              <option value="all">{t("common.all")}</option>
                              <option value="active">{t("common.active")}</option>
                              <option value="inactive">{t("common.inactive")}</option>
                              <option value="draft">{t("common.draft")}</option>
                            </select>
                            <SearchInput
                              value={search}
                              onChange={(val) => { setSearch(val); setPage(1); }}
                              placeholder={t("page.ingredientCategory.list.searchPlaceholder")}
                              isLoading={isFetching}
                              resultCount={data?.stats?.total}
                            />
                          </div>
                        </>
                      )}
                    </div>
                  }
                  pagination={{
                    page,
                    totalPages,
                    total: statsTotal,
                    onPageChange: setPage,
                    pageSize: limit,
                    onPageSizeChange: (v) => {
                      setLimit(v);
                      setPage(1);
                    }
                  }}
                />
              </div>
            )}

            <div className="mt-6">
              <TipsCard
                tips={[
                  t("page.ingredientCategory.list.tips.1"),
                  t("page.ingredientCategory.list.tips.2"),
                  t("page.ingredientCategory.list.tips.3"),
                  t("page.ingredientCategory.list.tips.4")
                ]}
              />
            </div>
          </div>
        </>
      )}

      <Modal
        type="confirm"
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title={t("page.ingredientCategory.list.modalDeleteTitle")}
        description={t("page.ingredientCategory.list.modalDeleteDesc")}
        confirmText={t("page.ingredientCategory.list.modalDeleteConfirm")}
        loading={deleteMutation.isLoading}
        onConfirm={() => {
          if (deleteTarget) {
            deleteMutation.mutate(deleteTarget);
            setDeleteTarget(null);
          }
        }}
      />
      {deleteMutation.isLoading && <Loading fullscreen size="lg" label={t("common.loadingData")} />}

      <UploadExcelModal
        open={uploadModalOpen}
        onOpenChange={setUploadModalOpen}
        uploadService={uploadIngredientCategoryExcel}
        queryKey={["ingredient-categories"]}
        title={t("page.ingredientCategory.upload.title")}
        subtitle={t("page.ingredientCategory.upload.subtitle")}
      />
    </div>
  );
};

export default CategoryList;
