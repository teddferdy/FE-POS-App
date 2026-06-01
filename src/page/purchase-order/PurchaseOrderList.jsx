import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { toast } from "sonner";
import {
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCw
} from "lucide-react";
import { getAllPurchaseOrder, receivePurchaseOrder } from "@/services/purchase-order";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";

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
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [cookie] = useCookies();
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");

  const user = cookie?.user;
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

  const orders = data?.data || [];
  const pagination = data?.pagination || {};
  const total = pagination?.total || pagination?.totalItems || data?.total || 0;
  const totalPages = pagination?.totalPages || Math.ceil(total / limit) || 1;

  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <button
          onClick={() => navigate("/dashboard-super-admin")}
          className="hover:text-foreground transition-colors">
          Dashboard
        </button>
        <span className="text-xs">/</span>
        <span className="text-primary font-semibold">Purchase Order</span>
      </nav>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Purchase Order</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Kelola pemesanan pembelian barang ke supplier.
          </p>
        </div>
        <Button onClick={() => navigate("/add-purchase-order")} className="gap-2">
          <Plus size={18} />
          Buat PO
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="p-5">
          <p className="text-sm text-muted-foreground">Total PO</p>
          <p className="text-2xl font-bold text-foreground mt-1">{total}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-muted-foreground">Menunggu</p>
          <p className="text-2xl font-bold text-yellow-600 mt-1">{data?.stats?.pending ?? 0}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-muted-foreground">Diterima</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{data?.stats?.received ?? 0}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-muted-foreground">Dibatalkan</p>
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

      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loading />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50 text-muted-foreground">
                  <th className="text-left px-4 py-3.5 font-semibold text-xs uppercase tracking-wider">
                    No. PO
                  </th>
                  <th className="text-left px-4 py-3.5 font-semibold text-xs uppercase tracking-wider">
                    Supplier
                  </th>
                  <th className="text-left px-4 py-3.5 font-semibold text-xs uppercase tracking-wider">
                    Tanggal
                  </th>
                  <th className="text-left px-4 py-3.5 font-semibold text-xs uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-right px-4 py-3.5 font-semibold text-xs uppercase tracking-wider">
                    Total
                  </th>
                  <th className="text-right px-4 py-3.5 font-semibold text-xs uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                      <Package size={40} className="mx-auto mb-3 opacity-30" />
                      <p>Belum ada purchase order</p>
                    </td>
                  </tr>
                ) : (
                  orders.map((po, index) => {
                    const st = statusMap[po.status] || statusMap.pending;
                    return (
                      <tr
                        key={po.id || po._id || index}
                        className="hover:bg-accent/30 transition-colors">
                        <td className="px-4 py-4 font-medium text-foreground">
                          {po.poNumber || po.code || `PO-${po.id}`}
                        </td>
                        <td className="px-4 py-4">{po.supplier?.name || po.supplierName || "-"}</td>
                        <td className="px-4 py-4 text-muted-foreground">
                          {po.date || po.createdAt
                            ? new Date(po.date || po.createdAt).toLocaleDateString("id-ID")
                            : "-"}
                        </td>
                        <td className="px-4 py-4">
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
                        </td>
                        <td className="px-4 py-4 text-right font-medium">
                          {po.total ? `Rp ${Number(po.total).toLocaleString("id-ID")}` : "-"}
                        </td>
                        <td className="px-4 py-4 text-right">
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
      </Card>

      <div className="flex flex-col md:flex-row justify-between items-center gap-3">
        <p className="text-xs text-muted-foreground">
          Menampilkan 1-{Math.min(limit, orders.length)} dari {total} PO
        </p>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page <= 1}
            className="w-9 h-9 flex items-center justify-center border border-border rounded-lg text-muted-foreground hover:bg-accent transition-colors disabled:opacity-30">
            <ChevronLeft size={16} />
          </button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const p = i + 1;
            return (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium border transition-colors ${page === p ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:bg-accent"}`}>
                {p}
              </button>
            );
          })}
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages}
            className="w-9 h-9 flex items-center justify-center border border-border rounded-lg text-muted-foreground hover:bg-accent transition-colors disabled:opacity-30">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PurchaseOrderList;
