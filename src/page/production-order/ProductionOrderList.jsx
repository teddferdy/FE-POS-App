import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { toast } from "sonner";
import {
  Plus,
  Search,
  Eye,
  Trash2,
  Play,
  CheckCircle2,
  ClipboardList,
  Clock,
  // AlertTriangle,
  CheckCircle,
  XCircle
} from "lucide-react";
import { canAccess } from "@/utils/permission";
import {
  getAllProductionOrder,
  deleteProductionOrder,
  // changeProductionOrderStatus,
  startProduction,
  completeProduction
} from "@/services/production-order";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DataTable from "@/components/ui/DataTable";
import Modal from "@/components/organism/modal";

const statusConfig = {
  draft: {
    label: "Draft",
    icon: Clock,
    class: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
  },
  planned: {
    label: "Planned",
    icon: ClipboardList,
    class: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
  },
  in_progress: {
    label: "In Progress",
    icon: Play,
    class: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400"
  },
  completed: {
    label: "Completed",
    icon: CheckCircle,
    class: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
  },
  cancelled: {
    label: "Cancelled",
    icon: XCircle,
    class: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
  }
};

const ProductionOrderList = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [cookie] = useCookies();
  const user = cookie?.user;
  const MENU_KEY = "/production-order";
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [startTarget, setStartTarget] = useState(null);
  const [completeTarget, setCompleteTarget] = useState(null);
  const [completeQty, setCompleteQty] = useState("");

  const { data, isLoading } = useQuery(
    ["production-orders", page, limit, statusFilter],
    () =>
      getAllProductionOrder({
        page,
        limit,
        status: statusFilter !== "all" ? statusFilter : undefined
      }),
    { keepPreviousData: true }
  );

  const items = data?.data || [];
  const total = data?.pagination?.total || 0;
  const totalPages = data?.pagination?.totalPages || 1;
  const stats = data?.stats || {};

  const filteredItems = items.filter((item) => {
    if (search) {
      const q = search.toLowerCase();
      if (
        !item.productionNo?.toLowerCase().includes(q) &&
        !item.productData?.nameProduct?.toLowerCase().includes(q)
      )
        return false;
    }
    return true;
  });

  const deleteMutation = useMutation(deleteProductionOrder, {
    onSuccess: () => {
      toast.success("Berhasil", { description: "Production order berhasil dihapus" });
      queryClient.invalidateQueries(["production-orders"]);
      setDeleteTarget(null);
    },
    onError: (err) =>
      toast.error("Gagal", { description: err?.response?.data?.message || err.message })
  });

  const startMutation = useMutation(startProduction, {
    onSuccess: () => {
      toast.success("Berhasil", { description: "Produksi dimulai, bahan baku telah dikurangi" });
      queryClient.invalidateQueries(["production-orders"]);
      setStartTarget(null);
    },
    onError: (err) =>
      toast.error("Gagal", { description: err?.response?.data?.message || err.message })
  });

  const completeMutation = useMutation(
    (payload) =>
      completeProduction(completeTarget, { producedQty: parseInt(payload.producedQty) || 0 }),
    {
      onSuccess: () => {
        toast.success("Berhasil", {
          description: "Produksi selesai, barang jadi ditambahkan ke stok"
        });
        queryClient.invalidateQueries(["production-orders"]);
        setCompleteTarget(null);
        setCompleteQty("");
      },
      onError: (err) =>
        toast.error("Gagal", { description: err?.response?.data?.message || err.message })
    }
  );

  const columns = [
    {
      header: "No. Produksi",
      render: (item) => (
        <span className="font-mono text-xs font-bold text-primary">{item.productionNo || "-"}</span>
      )
    },
    {
      header: "Produk",
      render: (item) => <span className="text-sm">{item.productData?.nameProduct || "-"}</span>
    },
    {
      header: "Qty Rencana",
      align: "center",
      render: (item) => <span className="font-mono text-sm">{item.plannedQty}</span>
    },
    {
      header: "Qty Hasil",
      align: "center",
      render: (item) => <span className="font-mono text-sm">{item.producedQty || 0}</span>
    },
    {
      header: "Tgl. Jadwal",
      align: "center",
      render: (item) => (
        <span className="text-xs">
          {item.scheduledDate ? new Date(item.scheduledDate).toLocaleDateString("id") : "-"}
        </span>
      )
    },
    {
      header: "Store",
      render: (item) => <span className="text-sm">{item.storeData?.name || "-"}</span>
    },
    {
      header: "Status",
      align: "center",
      render: (item) => {
        const cfg = statusConfig[item.status] || statusConfig.draft;
        return (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${cfg.class}`}>
            {cfg.label}
          </span>
        );
      }
    },
    {
      header: "Aksi",
      align: "right",
      render: (item) => (
        <div className="flex items-center justify-end gap-1">
          {canAccess(user, MENU_KEY, "view") && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-primary"
              onClick={() => navigate(`/production-order/detail?id=${item.id}`)}>
              <Eye size={15} />
            </Button>
          )}
          {item.status === "planned" && canAccess(user, MENU_KEY, "edit") && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-indigo-500"
              onClick={() => setStartTarget(item.id)}>
              <Play size={15} />
            </Button>
          )}
          {item.status === "in_progress" && canAccess(user, MENU_KEY, "edit") && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-green-500"
              onClick={() => {
                setCompleteTarget(item.id);
                setCompleteQty(String(item.plannedQty));
              }}>
              <CheckCircle2 size={15} />
            </Button>
          )}
          {(item.status === "draft" || item.status === "cancelled") &&
            canAccess(user, MENU_KEY, "delete") && (
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
        <span className="text-primary font-semibold">Production Order</span>
      </nav>

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Production Order</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Kelola production order dan proses produksi
          </p>
        </div>
        {canAccess(user, MENU_KEY, "add") && (
          <Button onClick={() => navigate("/add-production-order")} className="shrink-0 gap-2">
            <Plus size={16} /> Tambah Production Order
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          {
            label: "Total",
            value: stats.total ?? total,
            color: "text-primary",
            bg: "bg-primary/10"
          },
          {
            label: "Draft",
            value: stats.draft ?? 0,
            color: "text-yellow-600",
            bg: "bg-yellow-100"
          },
          {
            label: "Planned",
            value: stats.planned ?? 0,
            color: "text-blue-600",
            bg: "bg-blue-100"
          },
          {
            label: "In Progress",
            value: stats.inProgress ?? 0,
            color: "text-indigo-600",
            bg: "bg-indigo-100"
          },
          {
            label: "Completed",
            value: stats.completed ?? 0,
            color: "text-green-600",
            bg: "bg-green-100"
          }
        ].map((s, i) => (
          <div key={i} className="bg-card p-4 rounded-xl border border-border">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">{s.label}</p>
            <p className={`text-xl font-bold ${s.color}`}>{s.value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={filteredItems}
        isLoading={isLoading}
        emptyMessage="Tidak ada data production order"
        emptyIcon={ClipboardList}
        toolbar={
          <div className="flex items-center gap-3">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="h-9 px-3 rounded-md border border-input bg-background text-sm">
              <option value="all">Semua Status</option>
              {Object.entries(statusConfig).map(([k, v]) => (
                <option key={k} value={k}>
                  {v.label}
                </option>
              ))}
            </select>
            <div className="relative w-full sm:w-64">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                placeholder="Cari No. Produksi, Produk..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 text-sm"
              />
            </div>
          </div>
        }
        pagination={{ page, totalPages, total, onPageChange: setPage }}
      />

      <Modal
        type="confirm"
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Hapus Production Order?"
        description="Data yang dihapus tidak dapat dikembalikan."
        confirmText="Ya, Hapus"
        onConfirm={() => deleteMutation.mutate(deleteTarget)}
      />

      <Modal
        type="confirm"
        open={!!startTarget}
        onOpenChange={(o) => !o && setStartTarget(null)}
        title="Mulai Produksi?"
        description="Bahan baku berdasarkan BOM akan dikurangi dari stok. Lanjutkan?"
        confirmText="Ya, Mulai"
        onConfirm={() => startMutation.mutate(startTarget)}
      />

      <Modal
        type="form"
        open={!!completeTarget}
        onOpenChange={(o) => {
          if (!o) {
            setCompleteTarget(null);
            setCompleteQty("");
          }
        }}
        title="Selesaikan Produksi"
        description="Masukkan jumlah barang jadi yang dihasilkan">
        <div className="space-y-3">
          <label className="text-sm font-medium">Jumlah Hasil Produksi</label>
          <Input
            type="number"
            min="1"
            value={completeQty}
            onChange={(e) => setCompleteQty(e.target.value)}
            placeholder="Masukkan jumlah"
          />
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button
            variant="outline"
            onClick={() => {
              setCompleteTarget(null);
              setCompleteQty("");
            }}>
            Batal
          </Button>
          <Button
            onClick={() => completeMutation.mutate({ producedQty: parseInt(completeQty) || 0 })}>
            Selesaikan
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default ProductionOrderList;
