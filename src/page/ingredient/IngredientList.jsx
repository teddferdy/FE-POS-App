import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Plus, Search, Edit, Trash2, Eye, Package, Download, Upload, Loader2 } from "lucide-react";
import {
  getAllIngredients,
  deleteIngredient,
  downloadIngredientTemplate,
  downloadIngredientExcel
} from "@/services/ingredient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import StatCard from "@/components/ui/StatCard";
import Modal from "@/components/organism/modal";
import DataTable from "@/components/ui/DataTable";
import PageHeader from "@/components/ui/PageHeader";
import { TipsCard } from "@/components/ui/tips-card";
import { canAccess } from "@/utils/permission";
import UploadExcelModal from "@/components/organism/UploadExcelModal";
import { uploadIngredientExcel } from "@/services/ingredient";

const statusBadge = {
  active: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  draft: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  inactive: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
};

const IngredientList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [cookie] = useCookies();
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [importModal, setImportModal] = useState(false);
  const [downloadingTemplate, setDownloadingTemplate] = useState(false);
  const [downloadingData, setDownloadingData] = useState(false);

  const user = cookie?.user;
  const MENU_KEY = "/ingredient";

  const { data, isLoading } = useQuery(
    ["ingredients", search],
    () => getAllIngredients({ store: user?.store, search }),
    { keepPreviousData: true }
  );

  const deleteMutation = useMutation(deleteIngredient, {
    onSuccess: () => {
      toast.success(t("page.ingredient.list.toastSuccess"), {
        description: t("page.ingredient.list.toastDeleteDesc")
      });
      queryClient.invalidateQueries(["ingredients"]);
      setDeleteTarget(null);
    },
    onError: (err) => {
      toast.error(t("page.ingredient.list.toastError"), {
        description: err?.response?.data?.message || err.message
      });
    }
  });

  const ingredients = data?.data || [];
  const stats = data?.stats || {};
  const total = stats.total ?? ingredients.length;
  const activeCount = stats.active ?? ingredients.filter((i) => i.status === "active").length;
  const draftCount = stats.draft ?? ingredients.filter((i) => i.status === "draft").length;
  const inactiveCount = stats.inactive ?? ingredients.filter((i) => i.status === "inactive").length;

  const fmtDate = (date) =>
    date
      ? new Date(date).toLocaleDateString("id-ID", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        })
      : "-";

  const columns = [
    {
      header: t("page.ingredient.list.tableNama"),
      render: (item) => <span className="font-medium">{item.name}</span>
    },
    {
      header: t("page.ingredient.list.tableKategori"),
      render: (item) => (
        <span className="text-sm text-muted-foreground">{item.categoryData?.name || "-"}</span>
      )
    },
    {
      header: t("page.ingredient.list.tableSupplier"),
      render: (item) => (
        <span className="text-sm text-muted-foreground">{item.supplierData?.name || "-"}</span>
      )
    },
    {
      header: t("page.ingredient.list.tableUnit"),
      render: (item) => <span className="text-sm capitalize">{item.unit || "pcs"}</span>
    },
    {
      header: t("page.ingredient.list.tableKonversi"),
      className: "min-w-[200px]",
      render: (item) => {
        const base = item.baseUnit || item.unit || "pcs";
        const factor = item.conversionFactor || 1;
        return (
          <span className="text-xs text-muted-foreground">
            1 {item.unit || "pcs"} = {factor} {base}
          </span>
        );
      }
    },
    {
      header: t("page.ingredient.list.tableStok"),
      align: "right",
      render: (item) => (
        <span
          className={`font-mono ${item.stock <= item.minStock ? "text-destructive font-semibold" : ""}`}>
          {item.stock}
        </span>
      )
    },
    {
      header: t("page.ingredient.list.tableMinStok"),
      align: "right",
      className: "min-w-[120px]",
      render: (item) => <span className="font-mono text-muted-foreground">{item.minStock}</span>
    },
    {
      header: t("page.ingredient.list.tableHargaBeli"),
      align: "right",
      className: "min-w-[160px]",
      render: (item) => (
        <span className="font-medium">
          Rp {Number(item.costPrice || 0).toLocaleString("id-ID")}
        </span>
      )
    },
    {
      header: t("page.ingredient.list.tableStatus"),
      render: (item) => (
        <span
          className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge[item.status] || statusBadge.draft}`}>
          {item.status === "active"
            ? t("page.ingredient.list.statusActive")
            : item.status === "draft"
              ? t("common.draft")
              : t("page.ingredient.list.statusInactive")}
        </span>
      )
    },
    {
      header: t("page.ingredient.list.tableDibuat"),
      className: "min-w-[180px]",
      render: (item) => (
        <span className="text-xs text-muted-foreground">{fmtDate(item.createdAt)}</span>
      )
    },
    {
      header: t("page.ingredient.list.tableDiubah"),
      className: "min-w-[180px]",
      render: (item) => (
        <span className="text-xs text-muted-foreground">{fmtDate(item.updatedAt)}</span>
      )
    },
    {
      header: t("common.createdBy"),
      render: (item) => (
        <span className="text-xs text-muted-foreground">
          {item.createdByUser?.fullName || item.createdByUser?.userName || item.createdBy || "-"}
        </span>
      )
    },
    {
      header: t("common.modifiedBy"),
      render: (item) => (
        <span className="text-xs text-muted-foreground">
          {item.modifiedByUser?.fullName || item.modifiedByUser?.userName || item.modifiedBy || "-"}
        </span>
      )
    },
    {
      header: t("page.ingredient.list.tableAksi"),
      align: "right",
      stickyRight: true,
      render: (item) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground"
            onClick={() => navigate(`/detail-ingredient?id=${item.id}`)}>
            <Eye size={15} />
          </Button>
          {canAccess(user, MENU_KEY, "edit") && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-primary"
              onClick={() => navigate(`/edit-ingredient?id=${item.id}`)}>
              <Edit size={15} />
            </Button>
          )}
          {canAccess(user, MENU_KEY, "delete") && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive"
              onClick={() => setDeleteTarget(item)}>
              <Trash2 size={15} />
            </Button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[
          {
            label: t("breadcrumb.home"),
            href: "/dashboard-super-admin",
            i18nKey: "breadcrumb.home"
          },
          {
            label: t("page.ingredient.list.title"),
            i18nKey: "page.ingredient.list.breadcrumbIngredient"
          }
        ]}
        title={t("page.ingredient.list.title")}
        description={t("page.ingredient.list.subtitle")}>
        {canAccess(user, MENU_KEY, "export") && (
          <Button
            variant="outline"
            disabled={downloadingTemplate}
            onClick={async () => {
              setDownloadingTemplate(true);
              try {
                await downloadIngredientTemplate();
                toast.success(t("common.success"), {
                  description: t("page.ingredient.list.toastTemplateDesc")
                });
              } catch (err) {
                toast.error(t("common.error"), {
                  description:
                    err?.response?.data?.message ||
                    err.message ||
                    t("page.ingredient.list.toastError")
                });
              } finally {
                setDownloadingTemplate(false);
              }
            }}>
            {downloadingTemplate ? (
              <Loader2 size={16} className="mr-1 animate-spin" />
            ) : (
              <Download size={16} className="mr-1" />
            )}
            {t("page.ingredient.list.btnTemplate")}
          </Button>
        )}
        {canAccess(user, MENU_KEY, "export") && (
          <Button
            variant="outline"
            disabled={downloadingData}
            onClick={async () => {
              setDownloadingData(true);
              try {
                await downloadIngredientExcel();
                toast.success(t("common.success"), {
                  description: t("page.ingredient.list.toastExportDesc")
                });
              } catch (err) {
                toast.error(t("common.error"), {
                  description:
                    err?.response?.data?.message ||
                    err.message ||
                    t("page.ingredient.list.toastError")
                });
              } finally {
                setDownloadingData(false);
              }
            }}>
            {downloadingData ? (
              <Loader2 size={16} className="mr-1 animate-spin" />
            ) : (
              <Download size={16} className="mr-1" />
            )}
            {t("page.ingredient.list.btnExport")}
          </Button>
        )}
        {canAccess(user, MENU_KEY, "import") && (
          <Button variant="outline" onClick={() => setImportModal(true)}>
            <Upload size={16} className="mr-1" />
            {t("page.ingredient.list.btnImport")}
          </Button>
        )}
        {canAccess(user, MENU_KEY, "add") && (
          <Button onClick={() => navigate("/add-ingredient")} className="gap-2 shadow-md">
            <Plus size={18} /> {t("page.ingredient.list.btnAdd")}
          </Button>
        )}
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard
          label={t("page.ingredient.list.statTotal")}
          value={total}
          icon="nutrition"
          variant="default"
        />
        <StatCard
          label={t("common.active")}
          value={activeCount}
          icon="check_circle"
          variant="active"
        />
        <StatCard label={t("common.draft")} value={draftCount} icon="edit_note" variant="draft" />
        <StatCard
          label={t("common.inactive")}
          value={inactiveCount}
          icon="cancel"
          variant="inactive"
        />
      </div>

      <div className="space-y-4">
        <div className="relative w-full sm:w-72">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            placeholder={t("page.ingredient.list.searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10"
          />
        </div>

        <DataTable
          columns={columns}
          data={ingredients}
          isLoading={isLoading}
          emptyMessage={t("page.ingredient.list.emptyMessage")}
          emptyIcon={Package}
        />
      </div>

      <div>
        <TipsCard
          tips={[
            t("page.ingredient.list.tips.1"),
            t("page.ingredient.list.tips.2"),
            t("page.ingredient.list.tips.3"),
            t("page.ingredient.list.tips.4")
          ]}
        />
      </div>

      <Modal
        type="confirm"
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title={t("page.ingredient.list.modalDeleteTitle")}
        description={t("page.ingredient.list.modalDeleteDesc")}
        confirmText={t("page.ingredient.list.modalDeleteConfirm")}
        loading={deleteMutation.isLoading}
        onConfirm={() => deleteMutation.mutate(deleteTarget.id)}
      />

      <UploadExcelModal
        open={importModal}
        onOpenChange={setImportModal}
        uploadService={(file) => {
          const fd = new FormData();
          fd.append("file", file);
          return uploadIngredientExcel(fd);
        }}
        queryKey={["ingredients"]}
        title={t("page.ingredient.import.title")}
        subtitle={t("page.ingredient.import.subtitle")}
      />
    </div>
  );
};

export default IngredientList;
