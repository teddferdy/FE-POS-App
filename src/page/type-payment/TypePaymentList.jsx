import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { toast } from "sonner";
import { Plus, Search, Edit, Trash2, CreditCard } from "lucide-react";
import { getAllTypePaymentListActive, deleteTypePayment } from "@/services/type-payment";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import DataTable from "@/components/ui/DataTable";
import Modal from "@/components/organism/modal";

const TypePaymentList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [cookie] = useCookies();
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);

  const user = cookie?.user;
  const locationParam = user?.store || "";

  const { data, isLoading } = useQuery(
    ["type-payments", page, limit, search],
    () => getAllTypePaymentListActive({ store: locationParam, page, limit, statusPayment: "all" }),
    { keepPreviousData: true }
  );

  const deleteMutation = useMutation(deleteTypePayment, {
    onSuccess: () => {
      toast.success(t("common.success"), {
        description: t("page.typePayment.toast.deleteSuccess")
      });
      queryClient.invalidateQueries(["type-payments"]);
    },
    onError: (err) => {
      toast.error(t("common.error"), { description: err?.response?.data?.message || err.message });
    }
  });

  const payments = data?.data || [];
  const pagination = data?.pagination || {};
  const total = pagination?.total || pagination?.totalItems || data?.total || 0;
  const totalPages = pagination?.totalPages || Math.ceil(total / limit) || 1;

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
    const isActive = item.status === "Aktif" || item.status === true || item.isActive === true;
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
            {row.namaPembayaran?.charAt(0)?.toUpperCase() || "P"}
          </div>
          <span className="font-medium text-foreground">{row.namaPembayaran || "-"}</span>
        </div>
      )
    },
    { header: t("page.typePayment.table.type"), accessor: "tipe" },
    {
      header: t("common.status"),
      render: (row) => getStatusBadge(row)
    },
    {
      header: t("common.actions"),
      align: "right",
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-primary"
            onClick={() => navigate(`/edit-type-payment?id=${row.id || row._id}`)}>
            <Edit size={15} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive"
            onClick={() => handleDelete(row)}>
            <Trash2 size={15} />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
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
        <Button onClick={() => navigate("/add-type-payment")} className="gap-2">
          <Plus size={18} />
          {t("page.typePayment.button.add")}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5">
          <p className="text-sm text-muted-foreground">{t("page.typePayment.stats.total")}</p>
          <p className="text-2xl font-bold text-foreground mt-1">{total}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-muted-foreground">{t("common.active")}</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{data?.stats?.active ?? 0}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-muted-foreground">{t("common.inactive")}</p>
          <p className="text-2xl font-bold text-red-600 mt-1">{data?.stats?.inactive ?? 0}</p>
        </Card>
      </div>

      {/* Search */}
      <div className="relative w-full sm:w-72">
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
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={payments}
        isLoading={isLoading}
        emptyIcon={CreditCard}
        emptyMessage={t("page.typePayment.list.empty")}
        pagination={{ page, totalPages, total, onPageChange: setPage }}
      />

      <Modal
        type="confirm"
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={t("modal.deleteTitle")}
        description={t("page.typePayment.deleteConfirmDescription", {
          name: deleteTarget?.namaPembayaran || ""
        })}
        confirmText={t("modal.yesDelete")}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default TypePaymentList;
