import React, { useState } from "react";
import { useGlobalStoreFilter } from "@/hooks/useGlobalStoreFilter";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useCookies } from "react-cookie";
import { toast } from "sonner";
import { Loader2, FolderOpen, CheckCircle, XCircle, FileEdit } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  getAllCategoryTable,
  deleteCategory,
  downloadTemplate,
  downloadExcel
} from "@/services/category";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loading } from "@/components/ui/loading";
import { Skeleton } from "@/components/ui/skeleton";
import Modal from "@/components/organism/modal";
import UploadExcelModal from "@/components/organism/UploadExcelModal";
import { uploadExcel } from "@/services/category";
import PageHeader from "@/components/ui/PageHeader";
import DataTable from "@/components/ui/DataTable";
import { canAccess } from "@/utils/permission";
import StatCard from "@/components/ui/StatCard";
import StoreFilter from "@/components/ui/StoreFilter";
import { getAllLocation } from "@/services/location";
import NoStore from "@/components/ui/NoStore";

const categoryIcon = {
  "makanan utama": "restaurant",
  "minuman dingin": "local_bar",
  "snack & dessert": "cookie",
  "kopi & teh panas": "coffee"
};

const getCategoryIcon = (name) => {
  const key = (name || "").toLowerCase();
  return categoryIcon[key] || "category";
};

const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "-";
    return (
      d.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric"
      }) +
      " " +
      d.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit"
      })
    );
  } catch {
    return "-";
  }
};

const CategoryList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const locationParam = searchParams.get("location");
  const queryClient = useQueryClient();
  const [cookie] = useCookies();
  const user = cookie?.user;
  const isSuperAdmin = user?.roleType === "super_admin";
  const MENU_KEY = "/category-list";
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [isDownloadingTemplate, setIsDownloadingTemplate] = useState(false);
  const [isDownloadingData, setIsDownloadingData] = useState(false);
  const [storeFilter, setGlobalStoreFilter] = useGlobalStoreFilter();
  const [showFilters, setShowFilters] = useState(false);

  const { data: locData } = useQuery(["locations-cat"], () => getAllLocation(), {
    staleTime: 5 * 60 * 1000,
    enabled: isSuperAdmin
  });

  const { data, isLoading } = useQuery(
    ["categories", page, limit, search, statusFilter, storeFilter],
    () =>
      getAllCategoryTable({
        page,
        limit,
        search: search || undefined,
        statusCategory: statusFilter || "all",
        location:
          locationParam ||
          (isSuperAdmin
            ? storeFilter && storeFilter !== "all"
              ? storeFilter
              : ""
            : user?.store || "")
      }),
    { staleTime: 3 * 60 * 1000 }
  );

  const deleteMutation = useMutation(deleteCategory, {
    onSuccess: () => {
      toast.success(t("common.success"), { description: t("page.category.toast.deleteSuccess") });
      queryClient.invalidateQueries(["categories"]);
    },
    onError: (err) => {
      toast.error(t("common.error"), { description: err?.response?.data?.message || err.message });
    }
  });

  const categories = data?.data || data?.categories || [];
  const total = data?.total || data?.pagination?.total || 0;
  const totalPages = data?.pagination?.totalPages || Math.ceil(total / limit) || 1;

  const statsFromBE = data?.stats || {};
  const hasBEStats =
    statsFromBE.total !== undefined ||
    statsFromBE.active !== undefined ||
    statsFromBE.inactive !== undefined;

  const statsTotal = hasBEStats ? statsFromBE.total || total : total;
  const activeCount = hasBEStats
    ? statsFromBE.active || 0
    : categories.filter((cat) => cat.status === "active" || cat.isActive).length;
  const inactiveCount = hasBEStats
    ? statsFromBE.inactive || 0
    : categories.filter((cat) => cat.status === "inactive" || !cat.isActive).length;
  const draftCount = hasBEStats
    ? statsFromBE.draft || 0
    : categories.filter((cat) => cat.status === "draft").length;

  const handleDelete = (id) => {
    setDeleteTarget(id);
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      deleteMutation.mutate({ id: deleteTarget });
      setDeleteTarget(null);
    }
  };

  const columns = [
    {
      header: t("page.category.table.id"),
      render: (cat) => (
        <span className="font-mono text-sm text-foreground">
          {cat.code || cat.idCategory || `#CAT-${String(cat.id || cat._id).padStart(3, "0")}`}
        </span>
      )
    },
    {
      header: t("page.category.table.name"),
      render: (cat) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
            {cat.image ? (
              cat.image.startsWith("http") ? (
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <span className="material-symbols-outlined text-primary">{cat.image}</span>
              )
            ) : (
              <span className="material-symbols-outlined text-primary">
                {getCategoryIcon(cat.name)}
              </span>
            )}
          </div>
          <span className="text-sm font-semibold text-foreground">{cat.name}</span>
        </div>
      )
    },
    {
      header: t("page.category.table.store"),
      render: (cat) => (
        <span className="text-sm text-muted-foreground">
          {Array.isArray(cat.store) && cat.store.length > 0
            ? cat.store.map((s) => s.name || `Store #${s.id}`).join(", ")
            : t("page.category.form.storeSection.allStores")}
        </span>
      )
    },
    {
      header: t("page.category.table.productCount"),
      render: (cat) => (
        <span className="text-sm text-muted-foreground">
          {cat.productCount || cat.totalProduct || 0} Item
        </span>
      )
    },
    {
      header: t("page.category.table.status"),
      render: (cat) => {
        const s = cat.status || "";
        if (s === "draft") {
          return (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 dark:bg-amber-400" />
              {t("common.draft")}
            </span>
          );
        }
        const isActive = s === "active" || cat.isActive === true;
        return (
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
              isActive
                ? "bg-green-100 text-green-700 border border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800"
                : "bg-red-100 text-red-700 border border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800"
            }`}>
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isActive ? "bg-green-500 dark:bg-green-400" : "bg-red-500 dark:bg-red-400"
              }`}
            />
            {isActive ? t("common.active") : t("common.inactive")}
          </span>
        );
      }
    },
    {
      header: t("page.category.table.createdDate"),
      render: (cat) => (
        <span className="text-sm font-mono text-muted-foreground">{formatDate(cat.createdAt)}</span>
      )
    },
    {
      header: t("page.category.table.updatedDate"),
      hideOn: "lg",
      render: (cat) => (
        <span className="text-sm font-mono text-muted-foreground">{formatDate(cat.updatedAt)}</span>
      )
    },
    {
      header: t("common.createdBy"),
      hideOn: "lg",
      render: (cat) => (
        <span className="text-sm text-muted-foreground">
          {cat.createdByUser?.fullName || cat.createdByUser?.userName || cat.createdBy || "-"}
        </span>
      )
    },
    {
      header: t("common.modifiedBy"),
      hideOn: "lg",
      render: (cat) => (
        <span className="text-sm text-muted-foreground">
          {cat.modifiedByUser?.fullName || cat.modifiedByUser?.userName || cat.modifiedBy || "-"}
        </span>
      )
    },
    {
      header: t("page.category.table.actions"),
      align: "center",
      stickyRight: true,
      render: (cat) => (
        <div className="flex items-center justify-end gap-1 transition-opacity">
          {canAccess(user, MENU_KEY, "view") && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/detail-category?id=${cat.id || cat._id}`);
              }}
              className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
              title={t("common.view")}>
              <span className="material-symbols-outlined text-lg">visibility</span>
            </button>
          )}
          {canAccess(user, MENU_KEY, "edit") && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/edit-category?id=${cat.id || cat._id}`);
              }}
              className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
              title={t("common.edit")}>
              <span className="material-symbols-outlined text-lg">edit</span>
            </button>
          )}
          {canAccess(user, MENU_KEY, "delete") && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(cat.id || cat._id);
              }}
              className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all">
              <span className="material-symbols-outlined text-lg">delete</span>
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div data-tour="page-category" className="space-y-6">
      <div>
        <div>
          <PageHeader
            breadcrumbs={[
              { label: t("breadcrumb.adminConsole") },
              { label: t("breadcrumb.category") }
            ]}
            title={t("page.category.list.title")}
            description={t("page.category.list.description")}>
            {canAccess(user, MENU_KEY, "export") && (
              <Button
                data-tour="category-download-template"
                variant="outline"
                disabled={isDownloadingTemplate}
                onClick={async () => {
                  setIsDownloadingTemplate(true);
                  try {
                    await downloadTemplate();
                    toast.success(t("common.success"), {
                      description: t("page.category.toast.templateSuccess")
                    });
                  } catch (err) {
                    toast.error(t("common.error"), {
                      description:
                        err?.response?.data?.message ||
                        err.message ||
                        t("page.category.toast.templateError")
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
                {isDownloadingTemplate
                  ? t("page.category.button.downloading")
                  : t("page.category.button.downloadTemplate")}
              </Button>
            )}
            {canAccess(user, MENU_KEY, "export") && (
              <Button
                data-tour="category-download-data"
                variant="outline"
                disabled={isDownloadingData}
                onClick={async () => {
                  setIsDownloadingData(true);
                  try {
                    await downloadExcel();
                    toast.success(t("common.success"), {
                      description: t("page.category.toast.dataSuccess")
                    });
                  } catch (err) {
                    toast.error(t("common.error"), {
                      description:
                        err?.response?.data?.message ||
                        err.message ||
                        t("page.category.toast.dataError")
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
                {isDownloadingData
                  ? t("page.category.button.downloading")
                  : t("page.category.button.downloadData")}
              </Button>
            )}
            {canAccess(user, MENU_KEY, "import") && <span className="w-px h-7 bg-border mx-1" />}
            {canAccess(user, MENU_KEY, "import") && (
              <Button
                data-tour="category-upload"
                variant="default"
                onClick={() => setUploadModalOpen(true)}>
                <span className="material-symbols-outlined text-lg">upload</span>
                {t("page.category.button.upload")}
              </Button>
            )}
            {canAccess(user, MENU_KEY, "add") && (
              <Button
                data-tour="category-add"
                onClick={() => navigate("/add-category")}
                className="shadow-md">
                <span className="material-symbols-outlined text-lg">add</span>
                {t("page.category.button.add")}
              </Button>
            )}
          </PageHeader>
        </div>
      </div>

      <div>
        <div>
          {locData && (locData?.data || []).length === 0 ? (
            <NoStore />
          ) : (
            <>
              {isLoading ? (
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
                    label={t("page.category.list.statsTotal")}
                    value={statsTotal}
                    icon={FolderOpen}
                    variant="default"
                    subtitle={t("page.category.list.statsTotalBadge", { count: categories.length })}
                  />
                  <StatCard
                    label={t("page.category.list.statsActive")}
                    value={activeCount}
                    icon={CheckCircle}
                    variant="active"
                    subtitle={`${statsTotal > 0 ? Math.round((activeCount / statsTotal) * 100) : 0}%`}
                  />
                  <StatCard
                    label={t("page.category.list.statsInactive")}
                    value={inactiveCount}
                    icon={XCircle}
                    variant="inactive"
                    subtitle={`${statsTotal > 0 ? Math.round((inactiveCount / statsTotal) * 100) : 0}%`}
                  />
                  <StatCard
                    label={t("common.draft")}
                    value={draftCount}
                    icon={FileEdit}
                    variant="draft"
                    subtitle={`${statsTotal > 0 ? Math.round((draftCount / statsTotal) * 100) : 0}%`}
                  />
                </div>
              )}

              <div data-tour="category-table" className="mt-6">
                <DataTable
                  columns={columns}
                  data={categories}
                  isLoading={isLoading}
                  emptyMessage={t("page.category.list.empty")}
                  toolbar={
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 w-full">
                      <div className="flex items-center justify-between lg:justify-start lg:gap-4">
                        <h4 className="text-base font-semibold text-foreground shrink-0">
                          {t("page.category.list.sectionTitle")}
                        </h4>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2 h-9 lg:hidden"
                          onClick={() => setShowFilters(!showFilters)}>
                          <span className="material-symbols-outlined text-base">filter_list</span>
                          {showFilters ? "Tutup" : "Filter"}
                        </Button>
                      </div>
                      <div
                        className={`${showFilters ? "flex" : "hidden"} lg:flex flex-wrap items-center gap-2`}>
                        {isSuperAdmin && (
                          <StoreFilter
                            locations={locData?.data || []}
                            value={storeFilter}
                            onChange={(v) => {
                              setGlobalStoreFilter(v);
                              setPage(1);
                            }}
                            isSuperAdmin={isSuperAdmin}
                            t={t}
                          />
                        )}
                        <div className="relative min-w-0 flex-[1_1_180px]">
                          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-base">
                            search
                          </span>
                          <Input
                            placeholder={t("page.category.list.search")}
                            value={search}
                            onChange={(e) => {
                              setSearch(e.target.value);
                              setPage(1);
                            }}
                            className="pl-9 h-9 text-sm"
                          />
                        </div>
                        <select
                          value={statusFilter}
                          onChange={(e) => {
                            setStatusFilter(e.target.value);
                            setPage(1);
                          }}
                          className="h-9 px-3 bg-background border border-input rounded-lg text-sm focus:ring-2 focus:ring-ring outline-none">
                          <option value="">{t("page.category.list.statusAll")}</option>
                          <option value="active">{t("common.active")}</option>
                          <option value="inactive">{t("common.inactive")}</option>
                        </select>
                      </div>
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
                  rowClassName={() => ""}
                />
              </div>

              <div className="bg-gradient-to-br from-primary to-primary/90 rounded-xl p-5 flex flex-col text-primary-foreground mt-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined opacity-80">lightbulb</span>
                  <h4 className="text-sm font-bold uppercase tracking-wider opacity-80">
                    {t("page.category.tips.title")}
                  </h4>
                </div>
                <ul className="space-y-2">
                  <li className="text-xs leading-relaxed opacity-90 flex items-start gap-2">
                    <span className="text-primary-foreground/60 mt-0.5">•</span>
                    <span>{t("page.category.tips.1")}</span>
                  </li>
                  <li className="text-xs leading-relaxed opacity-90 flex items-start gap-2">
                    <span className="text-primary-foreground/60 mt-0.5">•</span>
                    <span>{t("page.category.tips.2")}</span>
                  </li>
                  <li className="text-xs leading-relaxed opacity-90 flex items-start gap-2">
                    <span className="text-primary-foreground/60 mt-0.5">•</span>
                    <span>{t("page.category.tips.3")}</span>
                  </li>
                  <li className="text-xs leading-relaxed opacity-90 flex items-start gap-2">
                    <span className="text-primary-foreground/60 mt-0.5">•</span>
                    <span>{t("page.category.tips.4")}</span>
                  </li>
                </ul>
              </div>
            </>
          )}
        </div>
      </div>

      <Modal
        type="confirm"
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={t("page.category.modal.deleteTitle")}
        confirmText={t("page.category.modal.confirmDelete")}
        loading={deleteMutation.isLoading}
        onConfirm={confirmDelete}
      />
      {deleteMutation.isLoading && <Loading fullscreen size="lg" label={t("common.loadingData")} />}
      <UploadExcelModal
        open={uploadModalOpen}
        onOpenChange={setUploadModalOpen}
        uploadService={(file) => {
          const fd = new FormData();
          fd.append("file", file);
          return uploadExcel(fd);
        }}
        queryKey={["categories"]}
        title={t("page.category.upload.title")}
        subtitle={t("page.category.upload.subtitle")}
      />
    </div>
  );
};

export default CategoryList;
