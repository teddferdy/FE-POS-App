import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit,
  Trash2,
  FileDown,
  ClipboardList,
  AlertTriangle,
  TrendingUp,
  CheckCircle2
} from "lucide-react";
import { toast } from "sonner";
import { getStockOpname, deleteStockOpname, exportStockOpnameExcel } from "@/services/stock";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";
import Modal from "@/components/organism/modal";

const statusColors = {
  draft: {
    bg: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800",
    dot: "bg-yellow-500",
    label: "Draft"
  },
  completed: {
    bg: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800",
    dot: "bg-green-500",
    label: "Completed"
  },
  cancelled: {
    bg: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800",
    dot: "bg-red-500",
    label: "Cancelled"
  }
};

const StockOpnameList = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [warehouseFilter, setWarehouseFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [noDataModal, setNoDataModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data, isLoading } = useQuery(
    ["stockOpname", page, limit, warehouseFilter, statusFilter],
    () =>
      getStockOpname({
        page,
        limit,
        location: warehouseFilter !== "all" ? warehouseFilter : undefined,
        status: statusFilter !== "all" ? statusFilter : undefined
      }),
    { keepPreviousData: true }
  );

  const items = data?.data || data?.stockOpname || [];
  const total = data?.pagination?.total || data?.total || 0;
  const totalPages = data?.pagination?.totalPages || Math.ceil(total / limit) || 1;

  const filteredItems = items.filter((item) => {
    if (search) {
      const q = search.toLowerCase();
      if (
        !item.auditId?.toLowerCase().includes(q) &&
        !item.warehouse?.toLowerCase().includes(q) &&
        !item.auditor?.toLowerCase().includes(q)
      ) {
        return false;
      }
    }
    return true;
  });

  const deleteMutation = useMutation(deleteStockOpname, {
    onSuccess: () => {
      toast.success("Berhasil", { description: "Stock opname berhasil dihapus" });
      queryClient.invalidateQueries(["stockOpname"]);
      setDeleteTarget(null);
    },
    onError: (err) => {
      toast.error("Gagal", {
        description: err?.response?.data?.message || err.message
      });
    }
  });

  const confirmDelete = () => {
    if (deleteTarget) {
      deleteMutation.mutate(deleteTarget);
    }
  };

  const stats = [
    {
      label: "Total Audit",
      value: data?.stats?.total ?? total ?? 0,
      icon: ClipboardList,
      color: "text-primary",
      bg: "bg-primary/10",
      trend: "+12% vs Bulan lalu",
      trendIcon: TrendingUp,
      trendColor: "text-green-600"
    },
    {
      label: "Draft",
      value: data?.stats?.draft ?? 0,
      icon: Edit,
      color: "text-secondary",
      bg: "bg-secondary/10",
      sub: "Menunggu penyelesaian"
    },
    {
      label: "Completed",
      value: data?.stats?.completed ?? 0,
      icon: CheckCircle2,
      color: "text-green-600 dark:text-green-400",
      bg: "bg-green-100 dark:bg-green-900/30",
      sub: "Telah diverifikasi"
    },
    {
      label: "Cancelled",
      value: data?.stats?.cancelled ?? 0,
      icon: AlertTriangle,
      color: "text-red-600 dark:text-red-400",
      bg: "bg-red-100 dark:bg-red-900/30",
      sub: "Dibatalkan"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <button
          onClick={() => navigate("/dashboard-super-admin")}
          className="hover:text-foreground transition-colors">
          Dashboard
        </button>
        <span className="text-xs">/</span>
        <span className="text-primary font-semibold">Stock Opname</span>
      </nav>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Riwayat Pemeriksaan Stok</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Kelola dan pantau hasil rekonsiliasi stok gudang secara real-time.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="shrink-0 gap-2"
            onClick={() => {
              if (total === 0) {
                setNoDataModal(true);
                return;
              }
              exportStockOpnameExcel()
                .then(() => toast.success("Berhasil", { description: "Data berhasil diexport" }))
                .catch((err) => {
                  toast.error("Gagal", {
                    description: err?.response?.data?.message || err.message || "Gagal export data"
                  });
                });
            }}>
            <FileDown size={16} />
            Export Excel
          </Button>
          <Button onClick={() => navigate("/add-stock-opname")} className="shrink-0 gap-2">
            <Plus size={16} />
            Tambah Stock Opname Baru
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="bg-card p-5 rounded-xl border border-border shadow-sm hover:border-primary/50 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 ${stat.bg} rounded-lg ${stat.color}`}>
                <stat.icon size={20} />
              </div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                {stat.label}
              </span>
            </div>
            <p className="text-2xl font-bold text-foreground">{stat.value.toLocaleString()}</p>
            {stat.trend ? (
              <div className="flex items-center gap-1 mt-1 text-xs">
                <stat.trendIcon size={14} className={stat.trendColor} />
                <span className={`font-semibold ${stat.trendColor}`}>{stat.trend}</span>
              </div>
            ) : stat.sub ? (
              <p className="text-xs text-muted-foreground mt-1 italic">{stat.sub}</p>
            ) : null}
          </div>
        ))}
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        {/* Filters */}
        <div className="p-4 border-b border-border flex flex-col gap-3 bg-muted/30">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <select
                  value={warehouseFilter}
                  onChange={(e) => {
                    setWarehouseFilter(e.target.value);
                    setPage(1);
                  }}
                  className="h-9 px-3 pr-8 rounded-md border border-input bg-background text-sm appearance-none cursor-pointer">
                  <option value="all">Semua Gudang</option>
                  <option value="utama-jkt">Gudang Utama - JKT</option>
                  <option value="bsd">Gudang BSD</option>
                  <option value="dc">Distribution Center</option>
                </select>
                <ChevronLeft
                  size={14}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none rotate-90"
                />
              </div>
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                  className="h-9 px-3 pr-8 rounded-md border border-input bg-background text-sm appearance-none cursor-pointer">
                  <option value="all">Semua Status</option>
                  <option value="draft">Draft</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <ChevronLeft
                  size={14}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none rotate-90"
                />
              </div>
            </div>
            <div className="relative w-full sm:w-64">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                placeholder="Cari ID Audit, Gudang, Auditor..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 text-sm"
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Menampilkan 1-{Math.min(limit, filteredItems.length)} dari {total} hasil
            </p>
            <div className="flex items-center border border-border rounded-md overflow-hidden">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page <= 1}
                className="p-1.5 hover:bg-accent transition-colors disabled:opacity-30">
                <ChevronLeft size={16} />
              </button>
              <div className="w-px h-5 bg-border" />
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page >= totalPages}
                className="p-1.5 hover:bg-accent transition-colors disabled:opacity-30">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Table Body */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loading />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50 text-muted-foreground">
                  <th className="text-left px-4 py-3.5 font-semibold text-xs uppercase tracking-wider w-12">
                    <input
                      type="checkbox"
                      className="rounded border-input text-primary focus:ring-primary"
                    />
                  </th>
                  <th className="text-left px-4 py-3.5 font-semibold text-xs uppercase tracking-wider">
                    Tanggal Audit
                  </th>
                  <th className="text-left px-4 py-3.5 font-semibold text-xs uppercase tracking-wider">
                    ID Audit
                  </th>
                  <th className="text-left px-4 py-3.5 font-semibold text-xs uppercase tracking-wider">
                    Lokasi Gudang
                  </th>
                  <th className="text-left px-4 py-3.5 font-semibold text-xs uppercase tracking-wider">
                    Auditor
                  </th>
                  <th className="text-left px-4 py-3.5 font-semibold text-xs uppercase tracking-wider">
                    Jumlah Barang
                  </th>
                  <th className="text-left px-4 py-3.5 font-semibold text-xs uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-right px-4 py-3.5 font-semibold text-xs uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">
                      Tidak ada data stock opname
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item, index) => {
                    const status = item.status || "draft";
                    const statusStyle = statusColors[status] || statusColors.draft;
                    const isDraft = status === "draft";
                    const isCompleted = status === "completed";

                    return (
                      <tr
                        key={item.id || item._id || index}
                        className={`hover:bg-accent/30 transition-colors group ${
                          isCompleted ? "bg-green-50/50 dark:bg-green-950/10" : ""
                        } ${status === "cancelled" ? "bg-red-50/50 dark:bg-red-950/10" : ""}`}>
                        <td className="px-4 py-4">
                          <input
                            type="checkbox"
                            className="rounded border-input text-primary focus:ring-primary"
                          />
                        </td>
                        <td className="px-4 py-4">
                          <span className="font-mono text-xs text-foreground">
                            {item.auditDate || "-"}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-xs font-bold text-primary">
                            {item.auditId || "-"}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-sm font-medium text-foreground">
                            {item.store?.name || "-"}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-secondary/20 text-secondary flex items-center justify-center text-[10px] font-bold">
                              {item.auditor
                                ?.split(" ")
                                .map((n) => n[0])
                                .join("")
                                .slice(0, 2) || "NA"}
                            </div>
                            <span className="text-sm text-foreground">{item.auditor || "-"}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm font-mono text-foreground">
                          {item.stats?.totalItems ?? "-"}
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tight ${statusStyle.bg}`}>
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot} mr-1.5`}
                            />
                            {statusStyle.label}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-primary"
                              onClick={() =>
                                navigate(`/stock-opname/detail?id=${item.id || item._id}`)
                              }>
                              <Eye size={15} />
                            </Button>
                            {isDraft && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-primary"
                                onClick={() =>
                                  navigate(`/add-stock-opname?id=${item.id || item._id}`)
                                }>
                                <Edit size={15} />
                              </Button>
                            )}
                            {isDraft && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive"
                                onClick={() => setDeleteTarget(item.id || item._id)}>
                                <Trash2 size={15} />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        <div className="px-4 py-3 border-t border-border bg-muted/30 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-3">
            <p className="text-xs text-muted-foreground">Hasil per halaman:</p>
            <select
              className="bg-background border border-border rounded px-2 py-1 text-xs"
              value={limit}
              disabled>
              <option>10</option>
              <option>25</option>
              <option>50</option>
            </select>
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => setPage(1)}
              disabled={page <= 1}
              className="w-8 h-8 flex items-center justify-center rounded text-xs text-muted-foreground hover:bg-accent disabled:opacity-30 transition-colors">
              <ChevronLeft size={14} className="mr-0.5" />
              <ChevronLeft size={14} className="-ml-2" />
            </button>
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page <= 1}
              className="w-8 h-8 flex items-center justify-center rounded text-xs text-muted-foreground hover:bg-accent disabled:opacity-30 transition-colors">
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`w-8 h-8 flex items-center justify-center rounded text-xs font-medium border transition-colors ${
                    page === pageNum
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border hover:bg-accent text-muted-foreground"
                  }`}>
                  {pageNum}
                </button>
              );
            })}
            {totalPages > 5 && (
              <span className="w-8 h-8 flex items-center justify-center text-xs text-muted-foreground">
                ...
              </span>
            )}
            {totalPages > 5 && (
              <button
                onClick={() => setPage(totalPages)}
                className={`w-8 h-8 flex items-center justify-center rounded text-xs font-medium border transition-colors ${
                  page === totalPages
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border hover:bg-accent text-muted-foreground"
                }`}>
                {totalPages}
              </button>
            )}
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages}
              className="w-8 h-8 flex items-center justify-center rounded text-xs text-muted-foreground hover:bg-accent disabled:opacity-30 transition-colors">
              <ChevronRight size={14} />
            </button>
            <button
              onClick={() => setPage(totalPages)}
              disabled={page >= totalPages}
              className="w-8 h-8 flex items-center justify-center rounded text-xs text-muted-foreground hover:bg-accent disabled:opacity-30 transition-colors">
              <ChevronRight size={14} className="mr-0.5" />
              <ChevronRight size={14} className="-ml-2" />
            </button>
          </div>
        </div>
      </Card>

      <Modal
        type="confirm"
        open={noDataModal}
        onOpenChange={setNoDataModal}
        title="Belum Ada Data Stock Opname"
        description="Belum ada data stock opname. Silakan tambah stock opname terlebih dahulu sebelum melakukan export."
        confirmText="Tambah Stock Opname"
        onConfirm={() => navigate("/add-stock-opname")}
      />

      <Modal
        type="confirm"
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Hapus Stock Opname?"
        description="Data yang dihapus tidak dapat dikembalikan."
        confirmText="Ya, Hapus"
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default StockOpnameList;
