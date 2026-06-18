import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { Plus, Package, Loader2 } from "lucide-react";
import {
  getAllIngredientCategory,
  deleteIngredientCategory,
  downloadIngredientCategoryTemplate,
  downloadIngredientCategoryExcel
} from "@/services/ingredientCategory";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Modal from "@/components/organism/modal";
import UploadIngredientCategoryModal from "./components/UploadIngredientCategoryModal";
import DataTable from "@/components/ui/DataTable";
import PageHeader from "@/components/ui/PageHeader";
import { TipsCard } from "@/components/ui/tips-card";
import { canAccess } from "@/utils/permission";
import AbortController from "@/components/organism/abort-controller";

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
  const MENU_KEY = "/ingredient-category";
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [isDownloadingTemplate, setIsDownloadingTemplate] = useState(false);
  const [isDownloadingData, setIsDownloadingData] = useState(false);

  const { data, isLoading, isError, refetch } = useQuery(
    ["ingredient-categories"],
    () => getAllIngredientCategory(),
    {}
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
  const statsTotal = categories.length;
  const activeCount = categories.filter((c) => c.status === "active").length;
  const inactiveCount = categories.filter((c) => c.status === "inactive").length;

  const filtered = search
    ? categories.filter((cat) => (cat.name || "").toLowerCase().includes(search.toLowerCase()))
    : categories;

  const stats = [
    {
      icon: Package,
      label: t("page.ingredientCategory.list.statTotal"),
      value: statsTotal,
      iconBg: "bg-primary/10",
      iconColor: "text-primary"
    },
    {
      icon: Package,
      label: t("page.ingredientCategory.list.statActive"),
      value: activeCount,
      iconBg: "bg-green-100 dark:bg-green-900/40",
      iconColor: "text-green-700 dark:text-green-300"
    },
    {
      icon: Package,
      label: t("page.ingredientCategory.list.statInactive"),
      value: inactiveCount,
      iconBg: "bg-red-100 dark:bg-red-900/40",
      iconColor: "text-red-700 dark:text-red-300"
    }
  ];

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
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${item.status === "active" ? "bg-green-100 text-green-700 border border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800" : "bg-red-100 text-red-700 border border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800"}`}>
          <span
            className={`w-1.5 h-1.5 rounded-full ${item.status === "active" ? "bg-green-500 dark:bg-green-400" : "bg-red-500 dark:bg-red-400"}`}
          />
          {item.status === "active"
            ? t("page.ingredientCategory.list.active")
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
      header: t("common.modifiedBy"),
      render: (item) => (
        <span className="text-sm text-muted-foreground">
          {item.modifiedByUser?.fullName || item.modifiedByUser?.userName || item.modifiedBy || "-"}
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
      header: t("page.ingredientCategory.list.tableAksi"),
      align: "right",
      render: (item) => (
        <div className="flex items-center justify-end gap-1">
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
        <div>
          <PageHeader
            breadcrumbs={[
              { i18nKey: "page.ingredientCategory.list.breadcrumbSettings" },
              { i18nKey: "page.ingredientCategory.list.breadcrumbCategory" }
            ]}
            title={t("page.ingredientCategory.list.title")}
            description={t("page.ingredientCategory.list.subtitle")}>
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
          </PageHeader>
        </div>
      </div>

      <div>
        <div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="bg-card p-6 rounded-xl border border-border shadow-sm">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl ${stat.iconBg} flex items-center justify-center ${stat.iconColor}`}>
                    <stat.icon size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {isError ? (
          <AbortController refetch={refetch} />
        ) : (
          <div className="mt-6">
            <DataTable
              columns={columns}
              data={filtered}
              isLoading={isLoading}
              emptyMessage={t("page.ingredientCategory.list.emptyText")}
              emptyIcon={Package}
              toolbar={
                <div className="p-4 pb-0">
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={t("page.ingredientCategory.list.searchPlaceholder")}
                    className="max-w-xs h-10"
                  />
                </div>
              }
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

      <Modal
        type="confirm"
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title={t("page.ingredientCategory.list.modalDeleteTitle")}
        description={t("page.ingredientCategory.list.modalDeleteDesc")}
        confirmText={t("page.ingredientCategory.list.modalDeleteConfirm")}
        onConfirm={() => {
          if (deleteTarget) {
            deleteMutation.mutate(deleteTarget);
            setDeleteTarget(null);
          }
        }}
      />

      <UploadIngredientCategoryModal
        open={uploadModalOpen}
        onOpenChange={setUploadModalOpen}
        onUploadSuccess={() => queryClient.invalidateQueries(["ingredient-categories"])}
      />
    </div>
  );
};

export default CategoryList;
