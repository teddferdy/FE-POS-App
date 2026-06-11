import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { toast } from "sonner";
import { Plus, Search, Edit, Trash2, Tags, Gift } from "lucide-react";
import { getAllDiscount, deleteDiscount } from "@/services/discount";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import Modal from "@/components/organism/modal";
import { useTranslation } from "react-i18next";
import DataTable from "@/components/ui/DataTable";
import { canAccess } from "@/utils/permission";

const PROMO_TYPE_LABELS = {
  bogo: "BOGO",
  bundling: "Bundling",
  happyHour: "Happy Hour",
  category: "Kategori"
};

const getPromoLabel = (item) => {
  const promoType = item.conditions?.promoType;
  if (promoType && PROMO_TYPE_LABELS[promoType]) return PROMO_TYPE_LABELS[promoType];
  return item.type === "Persentase" ? "Persentase" : item.type === "Nominal" ? "Nominal" : item.type || "-";
};
const DiscountList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [cookie] = useCookies();
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);

  const user = cookie?.user;
  const MENU_KEY = "/discount";
  const locationParam = user?.store || "";

  const { data, isLoading } = useQuery(
    ["discounts", page, limit, search],
    () => getAllDiscount({ location: locationParam, page, limit, statusDiscount: "" }),
    { keepPreviousData: true }
  );

  const deleteMutation = useMutation(deleteDiscount, {
    onSuccess: () => {
      toast.success("Berhasil", { description: "Diskon berhasil dihapus" });
      queryClient.invalidateQueries(["discounts"]);
    },
    onError: (err) => {
      toast.error("Gagal", { description: err?.response?.data?.message || err.message });
    }
  });

  const discounts = data?.data || [];
  const pagination = data?.pagination || {};
  const total = pagination?.total || pagination?.totalItems || data?.total || 0;
  const totalPages = pagination?.totalPages || Math.ceil(total / limit) || 1;

  const activeCount = data?.stats?.active ?? discounts.filter((d) => d.status === "active").length;
  const inactiveCount =
    data?.stats?.inactive ?? discounts.filter((d) => d.status !== "active").length;

  const handleDelete = (discount) => {
    setDeleteTarget(discount);
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      deleteMutation.mutate({ id: deleteTarget.id });
      setDeleteTarget(null);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
  };

  const columns = [
    {
      header: t("page.discount.table.name"),
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
            <Tags size={14} />
          </div>
          <span className="font-medium text-foreground">{item.name || "-"}</span>
        </div>
      )
    },
    { header: t("page.discount.table.type"), render: (item) => getPromoLabel(item) },
    {
      header: t("page.discount.table.value"),
      render: (item) =>
        item.type === "Persentase"
          ? `${item.value}%`
          : `Rp${item.value?.toLocaleString("id-ID") || item.value}`
    },
    {
      header: t("page.discount.table.status"),
      render: (item) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            item.status === "active"
              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
              : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
          }`}>
          {item.status === "active" ? "Aktif" : "Tidak Aktif"}
        </span>
      )
    },
    {
      header: t("page.discount.table.validity"),
      render: (item) => `${formatDate(item.startDate)} - ${formatDate(item.endDate)}`
    },
    {
      header: t("page.discount.table.actions"),
      align: "right",
      render: (item) => (
        <div className="flex items-center justify-end gap-1">
          {canAccess(user, MENU_KEY, "edit") && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-primary"
              onClick={() => navigate(`/edit-discount?id=${item.id || item._id}`)}>
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
    <div className="space-y-6">
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <button
          onClick={() => navigate("/dashboard-super-admin")}
          className="hover:text-foreground transition-colors">
          {t("breadcrumb.home")}
        </button>
        <span className="text-xs">/</span>
        <span className="text-primary font-semibold">{t("page.discount.list.title")}</span>
      </nav>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("page.discount.list.title")}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("page.discount.list.description")}
          </p>
        </div>
        {canAccess(user, MENU_KEY, "add") && (
          <Button onClick={() => navigate("/add-discount")} className="gap-2">
            <Plus size={18} />
            {t("page.discount.button.add")}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5">
          <p className="text-sm text-muted-foreground">Total Diskon</p>
          <p className="text-2xl font-bold text-foreground mt-1">{total}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-muted-foreground">Aktif</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{activeCount}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-muted-foreground">Tidak Aktif</p>
          <p className="text-2xl font-bold text-red-600 mt-1">{inactiveCount}</p>
        </Card>
      </div>

      <div className="relative w-full sm:w-72">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          placeholder={t("page.discount.list.search")}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="pl-9 h-10"
        />
      </div>

      <DataTable
        columns={columns}
        data={discounts}
        isLoading={isLoading}
        emptyMessage={t("page.discount.list.empty")}
        emptyIcon={Gift}
        pagination={{ page, totalPages, total, onPageChange: setPage }}
      />

      <Modal
        type="confirm"
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Hapus Diskon?"
        description={`Yakin ingin menghapus diskon ${deleteTarget?.name || ""}?`}
        confirmText="Ya, Hapus"
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default DiscountList;
