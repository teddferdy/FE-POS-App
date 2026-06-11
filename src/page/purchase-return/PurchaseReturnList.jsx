import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { toast } from "sonner";
import { Search, Eye, CheckCircle, XCircle } from "lucide-react";
import { canAccess } from "@/utils/permission";
import {
  getAllPurchaseReturn,
  approvePurchaseReturn,
  rejectPurchaseReturn
} from "@/services/purchase-return";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DataTable from "@/components/ui/DataTable";
import Modal from "@/components/organism/modal";

const statusCfg = {
  pending: {
    label: "Pending",
    class: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
  },
  approved: {
    label: "Approved",
    class: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
  },
  rejected: {
    label: "Rejected",
    class: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
  }
};

const PurchaseReturnList = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [cookie] = useCookies();
  const user = cookie?.user;
  const MENU_KEY = "/purchase-return";
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [actionTarget, setActionTarget] = useState(null);
  const [actionType, setActionType] = useState(null);

  const { data, isLoading } = useQuery(
    ["purchase-returns", page, limit, statusFilter],
    () =>
      getAllPurchaseReturn({
        page,
        limit,
        status: statusFilter !== "all" ? statusFilter : undefined
      }),
    { keepPreviousData: true }
  );

  const items = data?.data || [];
  const total = data?.pagination?.total || 0;
  const totalPages = data?.pagination?.totalPages || 1;

  const filteredItems = items.filter((item) => {
    if (search) {
      const q = search.toLowerCase();
      if (!item.returnNumber?.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const approveMut = useMutation(approvePurchaseReturn, {
    onSuccess: () => {
      toast.success("Berhasil", { description: "Purchase return disetujui" });
      queryClient.invalidateQueries(["purchase-returns"]);
      setActionTarget(null);
    },
    onError: (err) =>
      toast.error("Gagal", { description: err?.response?.data?.message || err.message })
  });

  const rejectMut = useMutation(rejectPurchaseReturn, {
    onSuccess: () => {
      toast.success("Berhasil", { description: "Purchase return ditolak" });
      queryClient.invalidateQueries(["purchase-returns"]);
      setActionTarget(null);
    },
    onError: (err) =>
      toast.error("Gagal", { description: err?.response?.data?.message || err.message })
  });

  const columns = [
    {
      header: "Return No",
      render: (item) => (
        <span className="font-mono text-xs font-bold text-primary">{item.returnNumber}</span>
      )
    },
    {
      header: "Store",
      render: (item) => <span className="text-sm">{item.storeData?.name || "-"}</span>
    },
    {
      header: "Items",
      align: "center",
      render: (item) => <span className="font-mono text-sm">{item.items?.length || 0}</span>
    },
    {
      header: "Reason",
      render: (item) => (
        <span className="text-xs text-muted-foreground max-w-[200px] truncate block">
          {item.reason || "-"}
        </span>
      )
    },
    {
      header: "Returned By",
      render: (item) => (
        <span className="text-sm">{item.returnedBy || item.returnedByData?.name || "-"}</span>
      )
    },
    {
      header: "Status",
      align: "center",
      render: (item) => {
        const sc = statusCfg[item.status] || statusCfg.pending;
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
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-primary"
            onClick={() => navigate(`/purchase-return/detail?id=${item.id}`)}>
            <Eye size={15} />
          </Button>
          {item.status === "pending" && canAccess(user, MENU_KEY, "edit") && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-green-500"
                onClick={() => {
                  setActionTarget(item.id);
                  setActionType("approve");
                }}>
                <CheckCircle size={15} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-red-500"
                onClick={() => {
                  setActionTarget(item.id);
                  setActionType("reject");
                }}>
                <XCircle size={15} />
              </Button>
            </>
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
        <span className="text-primary font-semibold">Purchase Return</span>
      </nav>
      <div>
        <h1 className="text-2xl font-bold">Purchase Return</h1>
        <p className="text-sm text-muted-foreground mt-1">Kelola retur pembelian</p>
      </div>

      <DataTable
        columns={columns}
        data={filteredItems}
        isLoading={isLoading}
        emptyMessage="Tidak ada data purchase return"
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
              {Object.entries(statusCfg).map(([k, v]) => (
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
                placeholder="Cari Return No..."
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
        open={!!actionTarget}
        onOpenChange={(o) => !o && setActionTarget(null)}
        title={actionType === "approve" ? "Setujui Purchase Return?" : "Tolak Purchase Return?"}
        description={
          actionType === "approve"
            ? "Retur akan disetujui."
            : "Retur akan ditolak dan stok akan dikembalikan."
        }
        confirmText={actionType === "approve" ? "Ya, Setujui" : "Ya, Tolak"}
        confirmVariant={actionType === "approve" ? "default" : "destructive"}
        onConfirm={() => {
          if (actionType === "approve") approveMut.mutate(actionTarget);
          else rejectMut.mutate(actionTarget);
        }}
      />
    </div>
  );
};

export default PurchaseReturnList;
