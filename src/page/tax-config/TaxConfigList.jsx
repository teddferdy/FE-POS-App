import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Plus, Search, Edit, Trash2, Percent, Loader2 } from "lucide-react";
import { getAllTaxConfig, deleteTaxConfig, downloadTaxConfigTemplate, downloadTaxConfigExcel } from "@/services/tax-config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import Modal from "@/components/organism/modal";
import UploadTaxConfigModal from "./components/UploadTaxConfigModal";
import DataTable from "@/components/ui/DataTable";
import { canAccess } from "@/utils/permission";

const typeColors = {
  PPN: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  PPh: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  "Non-Pajak": "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
};

const getTaxType = (name) => {
  if (!name) return "Non-Pajak";
  if (name.startsWith("PPN")) return "PPN";
  if (name.startsWith("PPh")) return "PPh";
  return "Non-Pajak";
};

const TaxConfigList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [cookie] = useCookies();
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [isDownloadingTemplate, setIsDownloadingTemplate] = useState(false);
  const [isDownloadingData, setIsDownloadingData] = useState(false);

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
  };

  const user = cookie?.user;
  const MENU_KEY = "/tax-list";
  const locationParam = user?.store || "";

  const { data, isLoading } = useQuery(
    ["tax-configs", page, limit, search],
    () => getAllTaxConfig({ location: locationParam, page, limit, search }),
    { keepPreviousData: true }
  );

  const deleteMutation = useMutation(deleteTaxConfig, {
    onSuccess: () => {
      toast.success(t("common.success"), { description: t("page.taxConfig.toast.deleteSuccess") });
      queryClient.invalidateQueries(["tax-configs"]);
    },
    onError: (err) => {
      toast.error(t("common.error"), { description: err?.response?.data?.message || err.message });
    }
  });

  const items = data?.data || [];
  const total = data?.total || data?.pagination?.total || 0;
  const totalPages = data?.pagination?.totalPages || Math.ceil(total / limit) || 1;

  const handleDelete = (item) => {
    setDeleteTarget(item);
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      deleteMutation.mutate({ id: deleteTarget.id });
      setDeleteTarget(null);
    }
  };

  const columns = [
    { header: t("page.taxConfig.table.name"), accessor: "name" },
    {
      header: t("page.taxConfig.table.type"),
      render: (item) => {
        const taxType = getTaxType(item.name);
        return (
          <span
            className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${typeColors[taxType] || typeColors["Non-Pajak"]}`}>
            {taxType}
          </span>
        );
      }
    },
    {
      header: t("page.taxConfig.table.rate"),
      render: (item) => <span className="font-semibold text-foreground">{item.rate ?? 0}%</span>
    },
    {
      header: t("page.taxConfig.table.description"),
      render: (item) => (
        <span className="text-muted-foreground max-w-[250px] block truncate">
          {item.description || "-"}
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
      header: t("common.actions"),
      align: "right",
      render: (item) => (
        <div className="flex items-center justify-end gap-1">
          {canAccess(user, MENU_KEY, "edit") && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-primary"
              onClick={() => navigate(`/edit-tax?id=${item.id || item._id}`)}>
              <Edit size={15} />
            </Button>
          )}
          {canAccess(user, MENU_KEY, "delete") && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive"
              onClick={() => handleDelete(item)}>
              <Trash2 size={15} />
            </Button>
          )}
        </div>
      )
    }
  ];

  return (
    <motion.div variants={item} initial="hidden" animate="show" className="space-y-6">
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <button
          onClick={() => navigate("/dashboard-super-admin")}
          className="hover:text-foreground transition-colors">
          {t("breadcrumb.home")}
        </button>
        <span className="text-xs">/</span>
        <span className="text-primary font-semibold">{t("page.taxConfig.list.title")}</span>
      </nav>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("page.taxConfig.list.title")}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("page.taxConfig.list.description")}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {canAccess(user, MENU_KEY, "export") && (
            <Button
              variant="outline"
              disabled={isDownloadingTemplate}
              onClick={async () => {
                setIsDownloadingTemplate(true);
                try {
                  await downloadTaxConfigTemplate();
                  toast.success(t("common.success"), {
                    description: t("page.taxConfig.toast.templateSuccess")
                  });
                } catch (err) {
                  toast.error(t("common.error"), {
                    description: err?.response?.data?.message || err.message || t("page.taxConfig.toast.templateError")
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
              {t("page.taxConfig.button.downloadTemplate")}
            </Button>
          )}
          {canAccess(user, MENU_KEY, "export") && (
            <Button
              variant="outline"
              disabled={isDownloadingData}
              onClick={async () => {
                setIsDownloadingData(true);
                try {
                  await downloadTaxConfigExcel();
                  toast.success(t("common.success"), {
                    description: t("page.taxConfig.toast.dataSuccess")
                  });
                } catch (err) {
                  toast.error(t("common.error"), {
                    description: err?.response?.data?.message || err.message || t("page.taxConfig.toast.dataError")
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
              {t("page.taxConfig.button.downloadData")}
            </Button>
          )}
          {canAccess(user, MENU_KEY, "import") && (
            <Button
              variant="default"
              onClick={() => setUploadModalOpen(true)}>
              <span className="material-symbols-outlined text-lg mr-1">upload</span>
              {t("page.taxConfig.button.upload")}
            </Button>
          )}
          {canAccess(user, MENU_KEY, "add") && (
            <Button data-tour="tax-add" onClick={() => navigate("/add-tax")} className="gap-2 shadow-md">
              <Plus size={18} />
              {t("page.taxConfig.button.add")}
            </Button>
          )}
        </div>
      </div>

      <motion.div variants={item} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card data-tour="tax-stat-total" className="p-5">
          <p className="text-sm text-muted-foreground">{t("page.taxConfig.stats.total")}</p>
          <p className="text-2xl font-bold text-foreground mt-1">{total}</p>
        </Card>
        <Card data-tour="tax-stat-active" className="p-5">
          <p className="text-sm text-muted-foreground">{t("common.active")}</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{data?.stats?.active ?? 0}</p>
        </Card>
        <Card data-tour="tax-stat-inactive" className="p-5">
          <p className="text-sm text-muted-foreground">{t("common.inactive")}</p>
          <p className="text-2xl font-bold text-red-600 mt-1">{data?.stats?.inactive ?? 0}</p>
        </Card>
      </motion.div>

      <motion.div variants={item} initial="hidden" whileInView="show" viewport={{ once: true }} className="relative w-full sm:w-72">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          data-tour="tax-search"
          placeholder={t("page.taxConfig.list.search")}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="pl-9 h-10"
        />
      </motion.div>

      <motion.div variants={item} initial="hidden" whileInView="show" viewport={{ once: true }} data-tour="tax-table">
        <DataTable
          columns={columns}
          data={items}
          isLoading={isLoading}
          emptyMessage={t("page.taxConfig.list.empty")}
          emptyIcon={Percent}
          pagination={{ page, totalPages, total, onPageChange: setPage }}
        />
      </motion.div>

      <Modal
        type="confirm"
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={t("modal.deleteTitle")}
        description={t("page.taxConfig.deleteConfirmDescription", {
          name: deleteTarget?.name || ""
        })}
        confirmText={t("modal.yesDelete")}
        onConfirm={confirmDelete}
      />

      <UploadTaxConfigModal
        open={uploadModalOpen}
        onOpenChange={setUploadModalOpen}
        onUploadSuccess={() => queryClient.invalidateQueries(["tax-configs"])}
      />
      </motion.div>
  );
};

export default TaxConfigList;
