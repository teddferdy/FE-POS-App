import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { toast } from "sonner";
import {
  Plus,
  Search,
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Undo2
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { canAccess } from "@/utils/permission";
import {
  getAllPurchaseOrder,
  receivePurchaseOrder,
  returnPurchaseOrder
} from "@/services/purchase-order";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import DataTable from "@/components/ui/DataTable";

const statusMap = {
  pending: {
    label: "Menunggu",
    class: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
  },
  received: {
    label: "Diterima",
    class: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
  },
  cancelled: {
    label: "Dibatalkan",
    class: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
  }
};

const PurchaseOrderList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [cookie] = useCookies();
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [returModal, setReturModal] = useState(false);
  const [returPo, setReturPo] = useState(null);
  const [returReason, setReturReason] = useState("");

  const user = cookie?.user;
  const MENU_KEY = "/purchase-order";
  const locationParam = user?.store || "";

  const { data, isLoading } = useQuery(
    ["purchase-orders", page, limit, search],
    () => getAllPurchaseOrder({ location: locationParam, page, limit, search }),
    { keepPreviousData: true }
  );

  const receiveMutation = useMutation(receivePurchaseOrder, {
    onSuccess: () => {
      toast.success("Berhasil", { description: "Purchase Order telah diterima" });
      queryClient.invalidateQueries(["purchase-orders"]);
    },
    onError: (err) => {
      toast.error("Gagal", { description: err?.response?.data?.message || err.message });
    }
  });

  const returnMutation = useMutation(
    ({ po, reason }) => returnPurchaseOrder(po.id, { reason, notes: reason, items: po.items }),
    {
      onSuccess: () => {
        toast.success("Berhasil", { description: "Retur Pembelian berhasil diproses" });
        queryClient.invalidateQueries(["purchase-orders"]);
        setReturModal(false);
        setReturPo(null);
        setReturReason("");
      },
      onError: (err) => {
        toast.error("Gagal", { description: err?.response?.data?.message || err.message });
      }
    }
  );

  const orders = data?.data || [];
  const pagination = data?.pagination || {};
  const total = pagination?.total || pagination?.totalItems || data?.total || 0;
  const totalPages = pagination?.totalPages || Math.ceil(total / limit) || 1;

  const columns = [
    {
      header: "No. PO",
      render: (po) => (
        <span className="font-medium text-foreground">
          {po.poNumber || po.code || `PO-${po.id}`}
        </span>
      )
    },
    {
      header: "Supplier",
      render: (po) => po.supplier?.name || po.supplierName || "-"
    },
    {
      header: "Tanggal",
      render: (po) => (
        <span className="text-muted-foreground">
          {po.date || po.createdAt
            ? new Date(po.date || po.createdAt).toLocaleDateString("id-ID")
            : "-"}
        </span>
      )
    },
    {
      header: "Status",
      render: (po) => {
        const st = statusMap[po.status] || statusMap.pending;
        return (
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${st.class}`}>
            {po.status === "received" ? (
              <CheckCircle2 size={12} />
            ) : po.status === "cancelled" ? (
              <XCircle size={12} />
            ) : (
              <Clock size={12} />
            )}
            {st.label}
          </span>
        );
      }
    },
    {
      header: "Total",
      align: "right",
      render: (po) => (
        <span className="font-medium">
          {po.total ? `Rp ${Number(po.total).toLocaleString("id-ID")}` : "-"}
        </span>
      )
    },
    {
      header: "Aksi",
      align: "right",
      render: (po) => (
        <div className="flex items-center justify-end gap-1">
          {po.status === "pending" && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-green-600"
              onClick={() => receiveMutation.mutate(po.id)}
              title="Terima PO">
              <RefreshCw size={15} />
            </Button>
          )}
          {po.status === "received" && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-amber-600"
              onClick={() => {
                setReturPo(po);
                setReturReason("");
                setReturModal(true);
              }}
              title="Retur PO">
              <Undo2 size={15} />
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
        <span className="text-primary font-semibold">{t("page.purchaseOrder.list.title")}</span>
      </nav>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {t("page.purchaseOrder.list.title")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("page.purchaseOrder.list.description")}
          </p>
        </div>
        {canAccess(user, MENU_KEY, "add") && (
          <Button onClick={() => navigate("/add-purchase-order")} className="gap-2">
            <Plus size={18} />
            {t("breadcrumb.add")}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="p-5">
          <p className="text-sm text-muted-foreground">{t("page.purchaseOrder.list.title")}</p>
          <p className="text-2xl font-bold text-foreground mt-1">{total}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-muted-foreground">{t("common.status")}</p>
          <p className="text-2xl font-bold text-yellow-600 mt-1">{data?.stats?.pending ?? 0}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-muted-foreground">{t("common.active")}</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{data?.stats?.received ?? 0}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-muted-foreground">{t("common.delete")}</p>
          <p className="text-2xl font-bold text-red-600 mt-1">{data?.stats?.cancelled ?? 0}</p>
        </Card>
      </div>

      <div className="relative w-full sm:w-72">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          placeholder="Cari PO..."
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
        data={orders}
        isLoading={isLoading}
        emptyMessage="Belum ada purchase order"
        emptyIcon={Package}
        pagination={{ page, totalPages, total, onPageChange: setPage }}
      />

      {returModal && returPo && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-xl shadow-lg border border-border w-full max-w-md">
            <div className="px-6 py-4 border-b border-border">
              <h3 className="text-lg font-semibold">Retur Pembelian</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">No. PO</p>
                <p className="font-medium">
                  {returPo.poNumber || returPo.code || `PO-${returPo.id}`}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Supplier</p>
                <p className="font-medium">
                  {returPo.supplier?.name || returPo.supplierName || "-"}
                </p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground block mb-1">Alasan Retur</label>
                <textarea
                  className="w-full h-24 px-3 py-2 border border-border rounded-lg bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Masukkan alasan retur..."
                  value={returReason}
                  onChange={(e) => setReturReason(e.target.value)}
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-border flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setReturModal(false);
                  setReturPo(null);
                  setReturReason("");
                }}>
                Batal
              </Button>
              <Button
                className="bg-amber-600 hover:bg-amber-700 text-white"
                onClick={() => returnMutation.mutate({ po: returPo, reason: returReason })}
                disabled={!returReason.trim() || returnMutation.isLoading}>
                {returnMutation.isLoading ? "Memproses..." : "Konfirmasi Retur"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseOrderList;
