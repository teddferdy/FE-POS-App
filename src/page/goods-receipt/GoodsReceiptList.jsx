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
  FileText,
  Download
} from "lucide-react";
import { canAccess } from "@/utils/permission";
import { getAllGoodsReceipt, deleteGoodsReceipt, exportGoodsReceipt } from "@/services/goods-receipt";
import { getAllLocation } from "@/services/location";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DataTable from "@/components/ui/DataTable";
import Modal from "@/components/organism/modal";
import * as XLSX from "xlsx";

const statusColors = {
  draft: {
    label: "Draft",
    class: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
  },
  completed: {
    label: "Completed",
    class: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
  },
  cancelled: {
    label: "Cancelled",
    class: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
  }
};

const GoodsReceiptList = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [cookie] = useCookies();
  const user = cookie?.user;
  const MENU_KEY = "/goods-receipt";
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [storeFilter, setStoreFilter] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [exportLoading, setExportLoading] = useState(false);
  const isSuperAdmin = user?.roleType === "super_admin";

  const { data: locations } = useQuery(["locations-gr"], () => getAllLocation(), {
    staleTime: 60000,
    enabled: isSuperAdmin
  });

  const { data, isLoading } = useQuery(
    ["goods-receipts", page, limit, statusFilter, storeFilter],
    () =>
      getAllGoodsReceipt({
        page,
        limit,
        status: statusFilter !== "all" ? statusFilter : undefined,
        store: storeFilter !== "all" ? storeFilter : undefined
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
        !item.receiptNumber?.toLowerCase().includes(q) &&
        !item.purchaseOrderData?.orderNumber?.toLowerCase().includes(q)
      )
        return false;
    }
    return true;
  });

  const handleExport = async () => {
    setExportLoading(true);
    try {
      const result = await exportGoodsReceipt({
        status: statusFilter !== "all" ? statusFilter : undefined,
        store: storeFilter !== "all" ? storeFilter : undefined
      });
      const rows = result?.data || [];
      const xlsData = rows.map((r, i) => ({
        No: i + 1,
        "No. Receipt": r.receiptNumber || "",
        "PO Reference": r.purchaseOrderData?.orderNumber || "",
        "Tanggal Terima": r.receivedDate
          ? new Date(r.receivedDate).toLocaleDateString("id")
          : "",
        Store: r.storeData?.name || "",
        Status: r.status || "",
        "Jumlah Item": r.items?.length || 0
      }));
      const ws = XLSX.utils.json_to_sheet(xlsData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "GoodsReceipt");
      XLSX.writeFile(wb, `goods-receipt-${Date.now()}.xlsx`);
      toast.success("Berhasil", { description: "Data berhasil di-export" });
    } catch (err) {
      toast.error("Gagal", {
        description: err?.response?.data?.message || err.message
      });
    } finally {
      setExportLoading(false);
    }
  };

  const deleteMutation = useMutation(deleteGoodsReceipt, {
    onSuccess: () => {
      toast.success("Berhasil", { description: "Goods receipt berhasil dihapus" });
      queryClient.invalidateQueries(["goods-receipts"]);
      setDeleteTarget(null);
    },
    onError: (err) =>
      toast.error("Gagal", { description: err?.response?.data?.message || err.message })
  });

  const columns = [
    {
      header: "No. Receipt",
      render: (item) => (
        <span className="font-mono text-xs font-bold text-primary">
          {item.receiptNumber || "-"}
        </span>
      )
    },
    {
      header: "PO Reference",
      render: (item) => (
        <span className="text-xs">{item.purchaseOrderData?.orderNumber || "-"}</span>
      )
    },
    {
      header: "Tanggal Terima",
      align: "center",
      render: (item) => (
        <span className="text-xs">
          {item.receivedDate ? new Date(item.receivedDate).toLocaleDateString("id") : "-"}
        </span>
      )
    },
    {
      header: "Jumlah Item",
      align: "center",
      render: (item) => <span className="font-mono text-sm">{item.items?.length || 0}</span>
    },
    {
      header: "Store",
      render: (item) => <span className="text-sm">{item.storeData?.name || "-"}</span>
    },
    {
      header: "Status",
      align: "center",
      render: (item) => {
        const sc = statusColors[item.status] || statusColors.draft;
        return (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${sc.class}`}>
            {sc.label}
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
              onClick={() => navigate(`/goods-receipt/detail?id=${item.id}`)}>
              <Eye size={15} />
            </Button>
          )}
          {item.status === "draft" && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-blue-600"
              onClick={() => navigate(`/edit-goods-receipt?id=${item.id}`)}
              title="Edit GR">
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
            </Button>
          )}
          {item.status === "draft" && canAccess(user, MENU_KEY, "delete") && (
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
        <span className="text-primary font-semibold">Goods Receipt</span>
      </nav>

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Goods Receipt</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Kelola penerimaan barang dari purchase order
          </p>
        </div>
        {canAccess(user, MENU_KEY, "add") && (
          <Button onClick={() => navigate("/add-goods-receipt")} className="shrink-0 gap-2">
            <Plus size={16} /> Tambah Goods Receipt
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total", value: stats.total ?? total, color: "text-primary" },
          { label: "Draft", value: stats.draft ?? 0, color: "text-yellow-600" },
          { label: "Completed", value: stats.completed ?? 0, color: "text-green-600" },
          { label: "Cancelled", value: stats.cancelled ?? 0, color: "text-red-600" }
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
        emptyMessage="Tidak ada data goods receipt"
        emptyIcon={FileText}
        toolbar={
          <div className="flex items-center gap-3">
            {isSuperAdmin && (
              <select
                value={storeFilter}
                onChange={(e) => { setStoreFilter(e.target.value); setPage(1); }}
                className="h-9 px-3 rounded-md border border-input bg-background text-sm">
                <option value="all">Semua Store</option>
                {(locations?.data || []).map((loc) => (
                  <option key={loc.id} value={loc.id}>{loc.name}</option>
                ))}
              </select>
            )}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="h-9 px-3 rounded-md border border-input bg-background text-sm">
              <option value="all">Semua Status</option>
              {Object.entries(statusColors).map(([k, v]) => (
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
                placeholder="Cari No. Receipt, PO..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 text-sm"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              disabled={exportLoading}
              className="gap-1.5">
              <Download size={14} />
              {exportLoading ? "..." : "Export"}
            </Button>
          </div>
        }
        pagination={{ page, totalPages, total, onPageChange: setPage }}
      />

      <Modal
        type="confirm"
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Hapus Goods Receipt?"
        description="Data yang dihapus tidak dapat dikembalikan."
        confirmText="Ya, Hapus"
        onConfirm={() => deleteMutation.mutate(deleteTarget)}
      />
    </div>
  );
};

export default GoodsReceiptList;
