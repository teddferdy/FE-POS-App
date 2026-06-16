import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Plus, Search, Edit, Trash2, Eye, Package, Download, Upload } from "lucide-react";
import {
  getAllIngredients,
  deleteIngredient,
  downloadIngredientTemplate,
  downloadIngredientExcel
} from "@/services/ingredient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import Modal from "@/components/organism/modal";
import DataTable from "@/components/ui/DataTable";
import { TipsCard } from "@/components/ui/tips-card";
import { canAccess } from "@/utils/permission";
import ImportIngredientModal from "./components/ImportIngredientModal";

const statusBadge = {
  active: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  inactive: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
};

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
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
  const total = ingredients.length;

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
          className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge[item.status] || statusBadge.active}`}>
          {item.status === "active"
            ? t("page.ingredient.list.statusActive")
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
      <motion.div variants={fadeInUp} initial="hidden" animate="show">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <button
            onClick={() => navigate("/dashboard-super-admin")}
            className="hover:text-foreground">
            {t("page.ingredient.list.breadcrumbDashboard")}
          </button>
          <span className="text-xs">/</span>
          <span className="text-primary font-semibold">
            {t("page.ingredient.list.breadcrumbIngredient")}
          </span>
        </nav>
      </motion.div>

      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="show"
        className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("page.ingredient.list.title")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t("page.ingredient.list.subtitle")}</p>
        </div>
        {canAccess(user, MENU_KEY, "add") && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              disabled={downloadingTemplate}
              onClick={async () => {
                setDownloadingTemplate(true);
                try {
                  await downloadIngredientTemplate();
                  toast.success(t("page.ingredient.list.toastSuccess"), {
                    description: t("page.ingredient.list.toastTemplateDesc")
                  });
                } catch (err) {
                  toast.error(t("page.ingredient.list.toastError"), {
                    description: err?.response?.data?.message || err.message
                  });
                } finally {
                  setDownloadingTemplate(false);
                }
              }}
              className="gap-2">
              <Download size={16} /> {t("page.ingredient.list.btnTemplate")}
            </Button>
            <Button
              variant="outline"
              disabled={downloadingData}
              onClick={async () => {
                setDownloadingData(true);
                try {
                  await downloadIngredientExcel();
                  toast.success(t("page.ingredient.list.toastSuccess"), {
                    description: t("page.ingredient.list.toastExportDesc")
                  });
                } catch (err) {
                  toast.error(t("page.ingredient.list.toastError"), {
                    description: err?.response?.data?.message || err.message
                  });
                } finally {
                  setDownloadingData(false);
                }
              }}
              className="gap-2">
              <Download size={16} /> {t("page.ingredient.list.btnExport")}
            </Button>
            <Button variant="outline" onClick={() => setImportModal(true)} className="gap-2">
              <Upload size={16} /> {t("page.ingredient.list.btnImport")}
            </Button>
            <Button onClick={() => navigate("/add-ingredient")} className="gap-2">
              <Plus size={18} /> {t("page.ingredient.list.btnAdd")}
            </Button>
          </div>
        )}
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div variants={item}>
          <Card className="p-5">
            <p className="text-sm text-muted-foreground">{t("page.ingredient.list.statTotal")}</p>
            <p className="text-2xl font-bold text-foreground mt-1">{total}</p>
          </Card>
        </motion.div>
        <motion.div variants={item}>
          <Card className="p-5">
            <p className="text-sm text-muted-foreground">{t("page.ingredient.list.statAktif")}</p>
            <p className="text-2xl font-bold text-green-600 mt-1">
              {ingredients.filter((i) => i.status === "active").length}
            </p>
          </Card>
        </motion.div>
        <motion.div variants={item}>
          <Card className="p-5">
            <p className="text-sm text-muted-foreground">
              {t("page.ingredient.list.statStokMenipis")}
            </p>
            <p className="text-2xl font-bold text-destructive mt-1">
              {ingredients.filter((i) => i.stock <= i.minStock).length}
            </p>
          </Card>
        </motion.div>
      </motion.div>

      <motion.div
        variants={fadeInUp}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="space-y-4">
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
      </motion.div>

      <motion.div variants={fadeInUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
        <TipsCard
          tips={[
            t("page.ingredient.list.tips.1"),
            t("page.ingredient.list.tips.2"),
            t("page.ingredient.list.tips.3"),
            t("page.ingredient.list.tips.4")
          ]}
        />
      </motion.div>

      <Modal
        type="confirm"
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title={t("page.ingredient.list.modalDeleteTitle")}
        description={t("page.ingredient.list.modalDeleteDesc")}
        confirmText={t("page.ingredient.list.modalDeleteConfirm")}
        onConfirm={() => deleteMutation.mutate(deleteTarget.id)}
      />

      <ImportIngredientModal
        open={importModal}
        onOpenChange={setImportModal}
        onUploadSuccess={() => queryClient.invalidateQueries(["ingredients"])}
      />
    </div>
  );
};

export default IngredientList;
