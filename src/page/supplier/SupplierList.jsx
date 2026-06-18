import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Plus, Search, Edit, Trash2, Building2, Phone, Mail, Eye, Loader2 } from "lucide-react";
import {
  getAllSupplier,
  deleteSupplier,
  downloadSupplierTemplate,
  downloadSupplierExcel
} from "@/services/supplier";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import Modal from "@/components/organism/modal";
import UploadSupplierModal from "./components/UploadSupplierModal";
import DataTable from "@/components/ui/DataTable";
import { canAccess } from "@/utils/permission";
import AbortController from "@/components/organism/abort-controller";

const SupplierList = () => {
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

  const user = cookie?.user;
  const MENU_KEY = "/supplier";
  const { data, isLoading, isError, refetch } = useQuery(
    ["suppliers", page, limit, search],
    () => getAllSupplier({ page, limit, search }),
    { keepPreviousData: true }
  );

  const deleteMutation = useMutation(deleteSupplier, {
    onSuccess: () => {
      toast.success(t("common.success"), { description: t("page.supplier.toast.success") });
      queryClient.invalidateQueries(["suppliers"]);
    },
    onError: (err) => {
      toast.error(t("common.error"), { description: err?.response?.data?.message || err.message });
    }
  });

  const suppliers = data?.data || [];
  const pagination = data?.pagination || {};
  const total = pagination?.total || pagination?.totalItems || data?.total || 0;
  const totalPages = pagination?.totalPages || Math.ceil(total / limit) || 1;

  const handleDelete = (supplier) => {
    setDeleteTarget(supplier);
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      deleteMutation.mutate({ id: deleteTarget.id });
      setDeleteTarget(null);
    }
  };

  const columns = [
    {
      header: t("page.supplier.form.name"),
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
            {item.name?.charAt(0)?.toUpperCase() || "S"}
          </div>
          <span className="font-medium text-foreground">{item.name || "-"}</span>
        </div>
      )
    },
    { header: t("page.supplier.form.contactPerson"), accessor: "contactPerson" },
    {
      header: t("page.supplier.form.phone"),
      render: (item) => (
        <div className="flex items-center gap-1.5 text-sm">
          <Phone size={14} className="text-muted-foreground" />
          {item.phone || "-"}
        </div>
      )
    },
    {
      header: t("page.supplier.form.email"),
      render: (item) => (
        <div className="flex items-center gap-1.5 text-sm">
          <Mail size={14} className="text-muted-foreground" />
          {item.email || "-"}
        </div>
      )
    },
    {
      header: t("page.supplier.form.address"),
      render: (item) => (
        <span className="text-muted-foreground max-w-[200px] block truncate">
          {item.address || "-"}
        </span>
      )
    },
    {
      header: t("common.status"),
      render: (item) => (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
            item.status === "active" || item.status === true
              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
          }`}>
          <span
            className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
              item.status === "active" || item.status === true ? "bg-green-500" : "bg-red-500"
            }`}
          />
          {item.status === "active" || item.status === true
            ? t("common.active")
            : t("common.inactive")}
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
          {canAccess(user, MENU_KEY, "view") && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground"
              onClick={() => navigate(`/detail-supplier?id=${item.id || item._id}`)}>
              <Eye size={15} />
            </Button>
          )}
          {canAccess(user, MENU_KEY, "edit") && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-primary"
              onClick={() => navigate(`/edit-supplier?id=${item.id || item._id}`)}>
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

  const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.05 } }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
  };

  return (
    <div data-tour="page-supplier" className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <button
          onClick={() => navigate("/dashboard-super-admin")}
          className="hover:text-foreground transition-colors">
          {t("breadcrumb.home")}
        </button>
        <span className="text-xs">/</span>
        <span className="text-primary font-semibold">{t("breadcrumb.supplier")}</span>
      </nav>

      {/* Header */}
      <motion.div
        variants={item}
        initial="hidden"
        animate="show"
        className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("page.supplier.list.title")}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("page.supplier.list.description")}
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
                  await downloadSupplierTemplate();
                  toast.success(t("common.success"), {
                    description: t("page.supplier.toast.templateSuccess")
                  });
                } catch (err) {
                  toast.error(t("common.error"), {
                    description:
                      err?.response?.data?.message ||
                      err.message ||
                      t("page.supplier.toast.templateError")
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
              {t("page.supplier.button.downloadTemplate")}
            </Button>
          )}
          {canAccess(user, MENU_KEY, "export") && (
            <Button
              variant="outline"
              disabled={isDownloadingData}
              onClick={async () => {
                setIsDownloadingData(true);
                try {
                  await downloadSupplierExcel();
                  toast.success(t("common.success"), {
                    description: t("page.supplier.toast.dataSuccess")
                  });
                } catch (err) {
                  toast.error(t("common.error"), {
                    description:
                      err?.response?.data?.message ||
                      err.message ||
                      t("page.supplier.toast.dataError")
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
              {t("page.supplier.button.downloadData")}
            </Button>
          )}
          {canAccess(user, MENU_KEY, "import") && (
            <Button variant="default" onClick={() => setUploadModalOpen(true)}>
              <span className="material-symbols-outlined text-lg mr-1">upload</span>
              {t("page.supplier.button.upload")}
            </Button>
          )}
          {canAccess(user, MENU_KEY, "add") && (
            <Button
              data-tour="supplier-add"
              onClick={() => navigate("/add-supplier")}
              className="gap-2 shadow-md">
              <Plus size={18} />
              {t("page.supplier.button.add")}
            </Button>
          )}
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div variants={item} data-tour="supplier-stat-total">
          <Card className="p-5">
            <p className="text-sm text-muted-foreground">{t("page.supplier.stats.total")}</p>
            <p className="text-2xl font-bold text-foreground mt-1">{total}</p>
          </Card>
        </motion.div>
        <motion.div variants={item} data-tour="supplier-stat-active">
          <Card className="p-5">
            <p className="text-sm text-muted-foreground">{t("common.active")}</p>
            <p className="text-2xl font-bold text-green-600 mt-1">{data?.stats?.active ?? 0}</p>
          </Card>
        </motion.div>
        <motion.div variants={item} data-tour="supplier-stat-inactive">
          <Card className="p-5">
            <p className="text-sm text-muted-foreground">{t("common.inactive")}</p>
            <p className="text-2xl font-bold text-red-600 mt-1">{data?.stats?.inactive ?? 0}</p>
          </Card>
        </motion.div>
      </motion.div>

      {/* Search */}
      <motion.div
        variants={item}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        data-tour="supplier-search"
        className="relative w-full sm:w-72">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          placeholder={t("page.supplier.list.search")}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="pl-9 h-10"
        />
      </motion.div>

      {isError ? (
        <AbortController refetch={refetch} />
      ) : (
        <motion.div
          variants={item}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          data-tour="supplier-table">
          <DataTable
            columns={columns}
            data={suppliers}
            isLoading={isLoading}
            emptyMessage={t("page.supplier.list.empty")}
            emptyIcon={Building2}
            pagination={{ page, totalPages, total, onPageChange: setPage }}
          />
        </motion.div>
      )}

      <Modal
        type="confirm"
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={t("modal.confirmDelete")}
        description={`Yakin ingin menghapus supplier ${deleteTarget?.name || ""}?`}
        confirmText={t("common.delete")}
        onConfirm={confirmDelete}
      />

      <UploadSupplierModal
        open={uploadModalOpen}
        onOpenChange={setUploadModalOpen}
        onUploadSuccess={() => queryClient.invalidateQueries(["suppliers"])}
      />
    </div>
  );
};

export default SupplierList;
