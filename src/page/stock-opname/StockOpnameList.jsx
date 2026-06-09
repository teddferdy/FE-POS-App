import React, { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { useTranslation } from "react-i18next";
import {
  Plus,
  Search,
  ChevronLeft,
  Eye,
  Edit,
  Trash2,
  FileDown,
  ClipboardList,
  AlertTriangle,
  TrendingUp,
  CheckCircle2,
  X
} from "lucide-react";
import { toast } from "sonner";
import { getStockOpname, deleteStockOpname, exportStockOpnameByIds } from "@/services/stock";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Modal from "@/components/organism/modal";
import DataTable from "@/components/ui/DataTable";
import { canAccess } from "@/utils/permission";

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
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [cookie] = useCookies();
  const user = cookie?.user;
  const MENU_KEY = "/stock-opname";
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [warehouseFilter, setWarehouseFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [noDataModal, setNoDataModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);

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

  useEffect(() => {
    setSelectedItems([]);
  }, [page, search, warehouseFilter, statusFilter]);

  // Remove completed items from selection
  useEffect(() => {
    setSelectedItems((prev) =>
      prev.filter((id) => {
        const item = items.find((it) => (it.id || it._id) === id);
        return item && item.status !== "completed";
      })
    );
  }, [items]);

  const handleExportSelected = useCallback(() => {
    exportStockOpnameByIds(selectedItems)
      .then(() => {
        toast.success("Berhasil", {
          description: `${selectedItems.length} data berhasil diexport`
        });
        setSelectedItems([]);
      })
      .catch((err) => {
        toast.error("Gagal", {
          description: err?.response?.data?.message || err.message || "Gagal export data"
        });
      });
  }, [selectedItems]);

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

  const toastIdRef = React.useRef(null);

  useEffect(() => {
    if (selectedItems.length > 0) {
      if (toastIdRef.current) {
        toast.dismiss(toastIdRef.current);
      }
      toastIdRef.current = toast(
        <div className="flex items-center justify-between gap-4 w-full">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">Export Stock Opname</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {selectedItems.length} data dipilih
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {canAccess(user, MENU_KEY, "export") && (
              <button
                onClick={handleExportSelected}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                <FileDown size={14} />
                Export
              </button>
            )}
            <button
              onClick={() => {
                setSelectedItems([]);
                if (toastIdRef.current) {
                  toast.dismiss(toastIdRef.current);
                  toastIdRef.current = null;
                }
              }}
              className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
              <X size={14} />
            </button>
          </div>
        </div>,
        { duration: Infinity, position: "bottom-center" }
      );
    } else {
      if (toastIdRef.current) {
        toast.dismiss(toastIdRef.current);
        toastIdRef.current = null;
      }
    }
    return () => {
      if (toastIdRef.current) {
        toast.dismiss(toastIdRef.current);
        toastIdRef.current = null;
      }
    };
  }, [selectedItems, handleExportSelected]);

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

  const columns = [
    {
      header: "Tanggal Audit",
      align: "center",
      render: (item) => (
        <span className="font-mono text-xs text-foreground">{item.auditDate || "-"}</span>
      )
    },
    {
      header: "ID Audit",
      align: "center",
      render: (item) => (
        <span className="text-xs font-bold text-primary">{item.opnameNumber || "-"}</span>
      )
    },
    {
      header: "Lokasi Gudang",
      align: "center",
      render: (item) => (
        <span className="text-sm font-medium text-foreground">{item.store?.name || "-"}</span>
      )
    },
    {
      header: "Auditor",
      align: "center",
      render: (item) => (
        <div className="flex items-center justify-center gap-2">
          <div className="w-7 h-7 rounded-full bg-secondary/20 text-secondary flex items-center justify-center text-[10px] font-bold">
            {item.auditor
              ?.split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2) || "NA"}
          </div>
          <span className="text-sm text-foreground">{item.auditor || "-"}</span>
        </div>
      )
    },
    {
      header: "Jumlah Barang",
      align: "center",
      render: (item) => (
        <span className="text-sm font-mono text-foreground">{item.stats?.totalItems ?? "-"}</span>
      )
    },
    {
      header: "Status",
      align: "center",
      render: (item) => {
        const status = item.status || "draft";
        const statusStyle = statusColors[status] || statusColors.draft;
        return (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tight ${statusStyle.bg}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot} mr-1.5`} />
            {statusStyle.label}
          </span>
        );
      }
    },
    {
      header: "Aksi",
      align: "right",
      render: (item) => {
        const isDraft = item.status === "draft";
        return (
          <div className="flex items-center justify-end gap-1">
            {canAccess(user, MENU_KEY, "view") && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-primary"
                onClick={() => navigate(`/stock-opname/detail?id=${item.id || item._id}`)}>
                <Eye size={15} />
              </Button>
            )}
            {isDraft && (
              <>
                {canAccess(user, MENU_KEY, "edit") && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-primary"
                    onClick={() => navigate(`/add-stock-opname?id=${item.id || item._id}`)}>
                    <Edit size={15} />
                  </Button>
                )}
                {canAccess(user, MENU_KEY, "delete") && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={() => setDeleteTarget(item.id || item._id)}>
                    <Trash2 size={15} />
                  </Button>
                )}
              </>
            )}
          </div>
        );
      }
    }
  ];

  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <button
          onClick={() => navigate("/dashboard-super-admin")}
          className="hover:text-foreground transition-colors">
          Dashboard
        </button>
        <span className="text-xs">/</span>
        <span className="text-primary font-semibold">Stock Opname</span>
      </nav>

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("page.stockOpname.list.title")}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("page.stockOpname.list.description")}
          </p>
        </div>
        {canAccess(user, MENU_KEY, "add") && (
          <Button onClick={() => navigate("/add-stock-opname")} className="shrink-0 gap-2">
            <Plus size={16} />
            Tambah Stock Opname Baru
          </Button>
        )}
      </div>

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

      <DataTable
        columns={columns}
        data={filteredItems}
        isLoading={isLoading}
        emptyMessage="Tidak ada data stock opname"
        emptyIcon={ClipboardList}
        selectable
        selectedIds={selectedItems}
        onSelectionChange={setSelectedItems}
        isSelectable={(row) => row.status !== "completed"}
        rowClassName={(row) => {
          const status = row.status || "draft";
          const classes = [];
          if (selectedItems.includes(row.id || row._id)) classes.push("bg-primary/5");
          if (status === "completed") classes.push("bg-green-50/50 dark:bg-green-950/10");
          if (status === "cancelled") classes.push("bg-red-50/50 dark:bg-red-950/10");
          return classes.join(" ");
        }}
        toolbar={
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
        }
        pagination={{
          page,
          totalPages,
          total,
          onPageChange: setPage
        }}
      />

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
