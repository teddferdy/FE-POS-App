import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Plus, Search, Eye, Edit, Trash2, CreditCard } from "lucide-react";
import {
  getAllTypePaymentListActive,
  getAllTypePayment,
  deleteTypePayment
} from "@/services/type-payment";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import DataTable from "@/components/ui/DataTable";
import Modal from "@/components/organism/modal";
import { canAccess } from "@/utils/permission";

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

const TypePaymentList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [cookie] = useCookies();
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
  };

  const user = cookie?.user;
  const MENU_KEY = "/type-payment-list";

  const { data, isLoading } = useQuery(
    ["type-payments", page, limit, search],
    () => getAllTypePaymentListActive({ page, limit, statusPayment: "all" }),
    { keepPreviousData: true }
  );

  const { data: allData } = useQuery(["type-payments-all"], () => getAllTypePayment({}));

  const deleteMutation = useMutation(deleteTypePayment, {
    onSuccess: () => {
      toast.success(t("common.success"), {
        description: t("page.typePayment.toast.deleteSuccess")
      });
      queryClient.invalidateQueries(["type-payments"]);
      queryClient.invalidateQueries(["type-payments-all"]);
    },
    onError: (err) => {
      toast.error(t("common.error"), { description: err?.response?.data?.message || err.message });
    }
  });

  const payments = data?.data || [];
  const allPayments = allData?.data || [];
  const pagination = data?.pagination || {};
  const total = pagination?.total || pagination?.totalItems || data?.total || 0;
  const totalPages = pagination?.totalPages || Math.ceil(total / limit) || 1;
  const activeCount = allPayments.filter(
    (item) =>
      item.status === "Aktif" ||
      item.status === true ||
      item.status === "active" ||
      item.isActive === true
  ).length;
  const inactiveCount = allPayments.length - activeCount;

  const handleDelete = (item) => {
    setDeleteTarget(item);
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      deleteMutation.mutate({ id: deleteTarget.id });
      setDeleteTarget(null);
    }
  };

  const getStatusBadge = (item) => {
    const isActive =
      item.status === "Aktif" ||
      item.status === true ||
      item.status === "active" ||
      item.isActive === true;
    return (
      <span
        className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
          isActive
            ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
            : "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"
        }`}>
        {isActive ? t("common.active") : t("common.inactive")}
      </span>
    );
  };

  const columns = [
    {
      header: t("page.typePayment.table.name"),
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
            {row.name?.charAt(0)?.toUpperCase() || "P"}
          </div>
          <span className="font-medium text-foreground">{row.name || "-"}</span>
        </div>
      )
    },
    { header: t("page.typePayment.table.type"), accessor: "type" },
    {
      header: t("common.status"),
      render: (row) => getStatusBadge(row)
    },
    {
      header: t("page.typePayment.table.createdDate"),
      render: (row) => (
        <span className="text-sm font-mono text-muted-foreground">{formatDate(row.createdAt)}</span>
      )
    },
    {
      header: t("page.typePayment.table.updatedDate"),
      render: (row) => (
        <span className="text-sm font-mono text-muted-foreground">{formatDate(row.updatedAt)}</span>
      )
    },
    {
      header: t("common.actions"),
      align: "right",
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          {canAccess(user, MENU_KEY, "detail") && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-primary"
              onClick={() => navigate(`/detail-type-payment?id=${row.id || row._id}`)}>
              <Eye size={15} />
            </Button>
          )}
          {canAccess(user, MENU_KEY, "edit") && !row.isSystem && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-primary"
              onClick={() => navigate(`/edit-type-payment?id=${row.id || row._id}`)}>
              <Edit size={15} />
            </Button>
          )}
          {canAccess(user, MENU_KEY, "delete") && !row.isSystem && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive"
              onClick={() => handleDelete(row)}>
              <Trash2 size={15} />
            </Button>
          )}
        </div>
      )
    }
  ];

  return (
    <motion.div variants={item} initial="hidden" animate="show" className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <button
          onClick={() => navigate("/dashboard-super-admin")}
          className="hover:text-foreground transition-colors">
          {t("breadcrumb.home")}
        </button>
        <span className="text-xs">/</span>
        <span className="text-primary font-semibold">{t("page.typePayment.list.title")}</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("page.typePayment.list.title")}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("page.typePayment.list.description")}
          </p>
        </div>
        {canAccess(user, MENU_KEY, "add") && (
          <Button onClick={() => navigate("/add-type-payment")} className="gap-2">
            <Plus size={18} />
            {t("page.typePayment.button.add")}
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <motion.div variants={item} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5">
          <p className="text-sm text-muted-foreground">{t("page.typePayment.stats.total")}</p>
          <p className="text-2xl font-bold text-foreground mt-1">{total}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-muted-foreground">{t("common.active")}</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{activeCount}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-muted-foreground">{t("common.inactive")}</p>
          <p className="text-2xl font-bold text-red-600 mt-1">{inactiveCount}</p>
        </Card>
      </motion.div>

      {/* Search */}
      <motion.div variants={item} initial="hidden" whileInView="show" viewport={{ once: true }} className="relative w-full sm:w-72">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          placeholder={t("page.typePayment.list.search")}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="pl-9 h-10"
        />
      </motion.div>

      {/* Table */}
      <motion.div variants={item} initial="hidden" whileInView="show" viewport={{ once: true }}>
      <DataTable
        columns={columns}
        data={payments}
        isLoading={isLoading}
        emptyIcon={CreditCard}
        emptyMessage={t("page.typePayment.list.empty")}
        pagination={{ page, totalPages, total, onPageChange: setPage }}
      />
      </motion.div>

      <Modal
        type="confirm"
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={t("modal.deleteTitle")}
        description={t("page.typePayment.deleteConfirmDescription", {
          name: deleteTarget?.name || ""
        })}
        confirmText={t("modal.yesDelete")}
        onConfirm={confirmDelete}
      />
      </motion.div>
  );
};

export default TypePaymentList;
