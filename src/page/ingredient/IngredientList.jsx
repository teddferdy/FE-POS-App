import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Plus, Search, Edit, Trash2, Eye, Package } from "lucide-react";
import { getAllIngredients, deleteIngredient } from "@/services/ingredient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import Modal from "@/components/organism/modal";
import DataTable from "@/components/ui/DataTable";
import { canAccess } from "@/utils/permission";

const statusBadge = {
  active: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  inactive: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
};

const IngredientList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [cookie] = useCookies();
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);

  const user = cookie?.user;
  const MENU_KEY = "/ingredient";

  const { data, isLoading } = useQuery(
    ["ingredients", search],
    () => getAllIngredients({ store: user?.store, search }),
    { keepPreviousData: true }
  );

  const deleteMutation = useMutation(deleteIngredient, {
    onSuccess: () => {
      toast.success("Berhasil", { description: "Bahan baku berhasil dihapus" });
      queryClient.invalidateQueries(["ingredients"]);
      setDeleteTarget(null);
    },
    onError: (err) => {
      toast.error("Gagal", { description: err?.response?.data?.message || err.message });
    }
  });

  const ingredients = data?.data || [];
  const total = ingredients.length;

  const fmtDate = (date) =>
    date ? new Date(date).toLocaleDateString("id-ID", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "-";

  const columns = [
    { header: "Nama", render: (item) => <span className="font-medium">{item.name}</span> },
    {
      header: "Kategori",
      render: (item) => <span className="text-sm text-muted-foreground">{item.categoryData?.name || "-"}</span>
    },
    {
      header: "Supplier",
      render: (item) => <span className="text-sm text-muted-foreground">{item.supplierData?.name || "-"}</span>
    },
    {
      header: "Unit",
      render: (item) => (
        <span className="text-sm capitalize">{item.unit || "pcs"}</span>
      )
    },
    {
      header: "Konversi",
      className: "min-w-[200px]",
      render: (item) => {
        const base = item.baseUnit || item.unit || "pcs";
        const factor = item.conversionFactor || 1;
        if (factor === 1 && base === (item.unit || "pcs")) return <span className="text-muted-foreground text-xs">-</span>;
        return (
          <span className="text-xs text-muted-foreground">
            1 {item.unit} = {factor} {base}
          </span>
        );
      }
    },
    {
      header: "Stok",
      align: "right",
      render: (item) => (
        <span className={`font-mono ${item.stock <= item.minStock ? "text-destructive font-semibold" : ""}`}>
          {item.stock}
        </span>
      )
    },
    {
      header: "Min Stok",
      align: "right",
      className: "min-w-[120px]",
      render: (item) => <span className="font-mono text-muted-foreground">{item.minStock}</span>
    },
    {
      header: "Harga Beli",
      align: "right",
      className: "min-w-[160px]",
      render: (item) => (
        <span className="font-medium">Rp {Number(item.costPrice || 0).toLocaleString("id-ID")}</span>
      )
    },
    {
      header: "Status",
      render: (item) => (
        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge[item.status] || statusBadge.active}`}>
          {item.status === "active" ? "Aktif" : "Nonaktif"}
        </span>
      )
    },
    {
      header: "Dibuat",
      className: "min-w-[180px]",
      render: (item) => <span className="text-xs text-muted-foreground">{fmtDate(item.createdAt)}</span>
    },
    {
      header: "Diubah",
      className: "min-w-[180px]",
      render: (item) => <span className="text-xs text-muted-foreground">{fmtDate(item.updatedAt)}</span>
    },
    {
      header: "Aksi",
      align: "right",
      stickyRight: true,
      render: (item) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground"
            onClick={() => navigate(`/detail-ingredient?id=${item.id}`)}>
            <Eye size={15} />
          </Button>
          {canAccess(user, MENU_KEY, "edit") && (
            <Button
              variant="ghost" size="icon" className="h-8 w-8 text-primary"
              onClick={() => navigate(`/edit-ingredient?id=${item.id}`)}>
              <Edit size={15} />
            </Button>
          )}
          {canAccess(user, MENU_KEY, "delete") && (
            <Button
              variant="ghost" size="icon" className="h-8 w-8 text-destructive"
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
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <button onClick={() => navigate("/dashboard-super-admin")} className="hover:text-foreground">Dashboard</button>
        <span className="text-xs">/</span>
        <span className="text-primary font-semibold">Bahan Baku</span>
      </nav>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Bahan Baku</h1>
          <p className="text-sm text-muted-foreground mt-1">Kelola bahan baku & material</p>
        </div>
        {canAccess(user, MENU_KEY, "add") && (
          <Button onClick={() => navigate("/add-ingredient")} className="gap-2">
            <Plus size={18} /> Tambah Bahan Baku
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5">
          <p className="text-sm text-muted-foreground">Total</p>
          <p className="text-2xl font-bold text-foreground mt-1">{total}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-muted-foreground">Aktif</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{ingredients.filter((i) => i.status === "active").length}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-muted-foreground">Stok Menipis</p>
          <p className="text-2xl font-bold text-destructive mt-1">{ingredients.filter((i) => i.stock <= i.minStock).length}</p>
        </Card>
      </div>

      <div className="relative w-full sm:w-72">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Cari bahan baku..." value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-10"
        />
      </div>

      <DataTable
        columns={columns}
        data={ingredients}
        isLoading={isLoading}
        emptyMessage="Belum ada bahan baku"
        emptyIcon={Package}
      />

      <Modal
        type="confirm"
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Hapus Bahan Baku?"
        description="Data yang dihapus tidak dapat dikembalikan."
        confirmText="Ya, Hapus"
        onConfirm={() => deleteMutation.mutate(deleteTarget.id)}
      />

    </div>
  );
};

export default IngredientList;
