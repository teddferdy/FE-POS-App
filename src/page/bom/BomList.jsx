import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { useCookies } from "react-cookie";
import { toast } from "sonner";
import { Plus, Search, Eye, Trash2 } from "lucide-react";
import { canAccess } from "@/utils/permission";
import { getAllBom, deleteBom } from "@/services/bom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DataTable from "@/components/ui/DataTable";
import Modal from "@/components/organism/modal";

const BomList = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [cookie] = useCookies();
  const user = cookie?.user;
  const MENU_KEY = "/bom";
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data, isLoading } = useQuery(
    ["bom-list", page, limit, search],
    () => getAllBom({ page, limit, search }),
    { keepPreviousData: true }
  );

  const items = data?.data || [];
  const total = data?.pagination?.total || 0;
  const totalPages = data?.pagination?.totalPages || 1;

  const deleteMut = useMutation(() => deleteBom(deleteTarget), {
    onSuccess: () => {
      toast.success("Berhasil", { description: "BOM dihapus" });
      queryClient.invalidateQueries(["bom-list"]);
      setDeleteTarget(null);
    },
    onError: (err) =>
      toast.error("Gagal", { description: err?.response?.data?.message || err.message })
  });

  const columns = [
    {
      header: "Nama BOM",
      render: (item) => (
        <span className="font-medium text-sm">{item.name || `BOM #${item.id}`}</span>
      )
    },
    {
      header: "Produk",
      render: (item) => (
        <div>
          <p className="text-sm font-medium">{item.productData?.nameProduct || "-"}</p>
          <p className="text-xs text-muted-foreground">{item.productData?.sku || ""}</p>
        </div>
      )
    },
    {
      header: "Total Item",
      align: "center",
      render: (item) => <span className="font-mono text-sm">{item.lines?.length || 0}</span>
    },
    {
      header: "Total Qty",
      align: "center",
      render: (item) => <span className="font-mono text-sm">{item.totalQty || 0}</span>
    },
    {
      header: "Catatan",
      render: (item) => (
        <span className="text-xs text-muted-foreground max-w-[150px] truncate block">
          {item.notes || "-"}
        </span>
      )
    },
    {
      header: "Aksi",
      align: "right",
      render: (item) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-primary"
            onClick={() => navigate(`/bom/detail?id=${item.id}`)}>
            <Eye size={15} />
          </Button>
          {canAccess(user, MENU_KEY, "delete") && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive"
              onClick={() => setDeleteTarget(item.id)}>
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
          className="hover:text-foreground">
          Dashboard
        </button>
        <span className="text-xs">/</span>
        <span className="text-primary font-semibold">BOM</span>
      </nav>
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Bill of Materials</h1>
          <p className="text-sm text-muted-foreground mt-1">Daftar BOM produk</p>
        </div>
        {canAccess(user, MENU_KEY, "add") && (
          <Button onClick={() => navigate("/bom/add")} className="shrink-0 gap-2">
            <Plus size={16} /> Tambah BOM
          </Button>
        )}
      </div>

      <DataTable
        columns={columns}
        data={items}
        isLoading={isLoading}
        emptyMessage="Tidak ada BOM"
        toolbar={
          <div className="relative w-full sm:w-64">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              placeholder="Cari produk..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-9 h-9 text-sm"
            />
          </div>
        }
        pagination={{ page, totalPages, total, onPageChange: setPage }}
      />

      <Modal
        type="confirm"
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Hapus BOM?"
        description="Data yang dihapus tidak dapat dikembalikan."
        confirmText="Ya, Hapus"
        onConfirm={() => deleteMut.mutate()}
      />
    </div>
  );
};

export default BomList;
