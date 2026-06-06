import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  getAllCategoryTable,
  deleteCategory,
  downloadTemplate,
  downloadExcel
} from "@/services/category";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Modal from "@/components/organism/modal";
import UploadCategoryModal from "@/page/category/components/UploadCategoryModal";
import PageHeader from "@/components/ui/PageHeader";
import DataTable from "@/components/ui/DataTable";

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
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [isDownloadingTemplate, setIsDownloadingTemplate] = useState(false);
  const [isDownloadingData, setIsDownloadingData] = useState(false);

  const locationParam = searchParams.get("location");

  const { data, isLoading } = useQuery(
    ["categories", page, limit, search, statusFilter, locationParam],
    () =>
      getAllCategoryTable({
        location: locationParam || "",
        page,
        limit,
        statusCategory: statusFilter || "all"
      }),
    { keepPreviousData: true }
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

  const handleDelete = (id) => {
    setDeleteTarget(id);
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      deleteMutation.mutate({ id: deleteTarget });
      setDeleteTarget(null);
    }
  };

  const filtered = categories.filter((cat) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (cat.name || "").toLowerCase().includes(q) ||
      (cat.code || cat.idCategory || "").toLowerCase().includes(q)
    );
  });

  const stats = [
    {
      dataTour: "category-stat-total",
      icon: "category",
      label: t("page.category.list.statsTotal"),
      value: statsTotal,
      badge: t("page.category.list.statsTotalBadge", { count: categories.length }),
      iconBg: "bg-primary/10",
      iconColor: "text-primary"
    },
    {
      dataTour: "category-stat-active",
      icon: "check_circle",
      label: t("page.category.list.statsActive"),
      value: activeCount,
      badge: `${statsTotal > 0 ? Math.round((activeCount / statsTotal) * 100) : 0}%`,
      iconBg: "bg-green-100 dark:bg-green-900/40",
      iconColor: "text-green-700 dark:text-green-300"
    },
    {
      dataTour: "category-stat-inactive",
      icon: "cancel",
      label: t("page.category.list.statsInactive"),
      value: inactiveCount,
      badge: `${statsTotal > 0 ? Math.round((inactiveCount / statsTotal) * 100) : 0}%`,
      iconBg: "bg-red-100 dark:bg-red-900/40",
      iconColor: "text-red-700 dark:text-red-300",
      danger: true
    }
  ];

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
        const isActive = cat.status || cat.isActive;
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
      render: (cat) => (
        <span className="text-sm font-mono text-muted-foreground">{formatDate(cat.updatedAt)}</span>
      )
    },
    {
      header: t("page.category.table.actions"),
      align: "right",
      render: (cat) => (
        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/detail-category?id=${cat.id || cat._id}`);
            }}
            className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
            title={t("common.view")}>
            <span className="material-symbols-outlined text-lg">visibility</span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/edit-category?id=${cat.id || cat._id}`);
            }}
            className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
            title={t("common.edit")}>
            <span className="material-symbols-outlined text-lg">edit</span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(cat.id || cat._id);
            }}
            className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all">
            <span className="material-symbols-outlined text-lg">delete</span>
          </button>
        </div>
      )
    }
  ];

  return (
    <div data-tour="page-category" className="space-y-8">
      <PageHeader
        breadcrumbs={[{ label: t("breadcrumb.adminConsole") }, { label: t("breadcrumb.category") }]}
        title={t("page.category.list.title")}
        description={t("page.category.list.description")}>
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
                  err?.response?.data?.message || err.message || t("page.category.toast.dataError")
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
        <span className="w-px h-7 bg-border mx-1" />
        <Button
          data-tour="category-upload"
          variant="default"
          onClick={() => setUploadModalOpen(true)}>
          <span className="material-symbols-outlined text-lg">upload</span>
          {t("page.category.button.upload")}
        </Button>
        <Button
          data-tour="category-add"
          onClick={() => navigate("/add-category")}
          className="shadow-md">
          <span className="material-symbols-outlined text-lg">add</span>
          {t("page.category.button.add")}
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            data-tour={stat.dataTour}
            className={`${stat.danger ? "bg-red-600 dark:bg-red-900" : "bg-card border border-border"} p-6 rounded-xl shadow-sm flex justify-between items-start flex-col transition-colors`}>
            <div className="flex justify-between items-start w-full mb-4">
              <div
                className={`p-3 ${stat.danger ? "bg-red-700 dark:bg-red-950" : stat.iconBg} rounded-lg`}>
                <span
                  className={`material-symbols-outlined ${stat.danger ? "text-white" : stat.iconColor}`}>
                  {stat.icon}
                </span>
              </div>
              <span
                className={`text-xs font-semibold px-2 py-1 rounded ${stat.danger ? "bg-red-500/30 text-red-100" : "bg-muted text-muted-foreground"}`}>
                {stat.badge}
              </span>
            </div>
            <p
              className={`text-xs font-semibold uppercase tracking-wider mb-1 ${stat.danger ? "text-red-100" : "text-muted-foreground"}`}>
              {stat.label}
            </p>
            <h3 className={`text-3xl font-bold ${stat.danger ? "text-white" : "text-foreground"}`}>
              {stat.value}
            </h3>
          </div>
        ))}
      </div>

      <div data-tour="category-table">
        <DataTable
          columns={columns}
          data={filtered}
          isLoading={isLoading}
          emptyMessage={t("page.category.list.empty")}
        toolbar={
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 w-full">
            <h4 className="text-base font-semibold text-foreground">
              {t("page.category.list.sectionTitle")}
            </h4>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
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
              <Button
                variant="outline"
                size="sm"
                className="gap-2 h-9"
                onClick={() => setStatusFilter("")}>
                <span className="material-symbols-outlined text-base">filter_list</span>
                {t("page.category.button.filter")}
              </Button>
            </div>
          </div>
        }
        pagination={{ page, totalPages, total, onPageChange: setPage }}
        rowClassName={() => "group"}
      />
      </div>

      <div className="bg-gradient-to-br from-primary to-primary/90 rounded-xl p-5 flex flex-col text-primary-foreground">
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

      <Modal
        type="confirm"
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={t("page.category.modal.deleteTitle")}
        confirmText={t("page.category.modal.confirmDelete")}
        onConfirm={confirmDelete}
      />
      <UploadCategoryModal
        open={uploadModalOpen}
        onOpenChange={setUploadModalOpen}
        onUploadSuccess={() => queryClient.invalidateQueries(["categories"])}
      />
    </div>
  );
};

export default CategoryList;
