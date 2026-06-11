import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "react-query";
import { ArrowLeft, ClipboardList, Clock, Play, CheckCircle, XCircle } from "lucide-react";
import { getProductionOrderById } from "@/services/production-order";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const statusDetail = {
  draft: { label: "Draft", class: "bg-yellow-100 text-yellow-800", icon: Clock },
  planned: { label: "Planned", class: "bg-blue-100 text-blue-800", icon: ClipboardList },
  in_progress: { label: "In Progress", class: "bg-indigo-100 text-indigo-800", icon: Play },
  completed: { label: "Completed", class: "bg-green-100 text-green-800", icon: CheckCircle },
  cancelled: { label: "Cancelled", class: "bg-red-100 text-red-800", icon: XCircle }
};

const DetailProductionOrder = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");

  const { data, isLoading } = useQuery(
    ["production-order-detail", id],
    () => getProductionOrderById(id),
    { enabled: !!id }
  );

  const order = data?.data;

  if (isLoading) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Production order tidak ditemukan</p>
        <Button variant="outline" onClick={() => navigate("/production-order")} className="mt-4">
          <ArrowLeft size={16} className="mr-1" /> Kembali
        </Button>
      </div>
    );
  }

  const st = statusDetail[order.status] || statusDetail.draft;
  const StatusIcon = st.icon;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <button
          onClick={() => navigate("/dashboard-super-admin")}
          className="hover:text-foreground">
          Dashboard
        </button>
        <span className="text-xs">/</span>
        <button onClick={() => navigate("/production-order")} className="hover:text-foreground">
          Production Order
        </button>
        <span className="text-xs">/</span>
        <span className="text-primary font-semibold">Detail</span>
      </nav>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Detail Production Order</h1>
          <p className="text-sm text-muted-foreground mt-1">{order.productionNo}</p>
        </div>
        <Button variant="outline" onClick={() => navigate("/production-order")}>
          <ArrowLeft size={16} className="mr-1" /> Kembali
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card p-6 rounded-xl border border-border">
            <h2 className="text-lg font-semibold mb-4">Informasi Produksi</h2>
            <table className="w-full text-sm">
              <tbody>
                {[
                  ["No. Produksi", order.productionNo],
                  ["Produk", order.productData?.nameProduct || "-"],
                  ["SKU", order.productData?.sku || "-"],
                  ["Jumlah Rencana", order.plannedQty],
                  ["Jumlah Hasil", order.producedQty || 0],
                  ["Store", order.storeData?.name || "-"],
                  [
                    "Tanggal Jadwal",
                    order.scheduledDate
                      ? new Date(order.scheduledDate).toLocaleDateString("id")
                      : "-"
                  ],
                  [
                    "Tanggal Selesai",
                    order.completedDate
                      ? new Date(order.completedDate).toLocaleDateString("id")
                      : "-"
                  ],
                  ["Catatan", order.notes || "-"]
                ].map(([label, value]) => (
                  <tr key={label} className="border-b border-muted/30">
                    <td className="py-2 pr-4 text-muted-foreground w-40">{label}</td>
                    <td className="py-2 font-medium">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {order.bomComponents?.length > 0 && (
            <div className="bg-card p-6 rounded-xl border border-border">
              <h2 className="text-lg font-semibold mb-4">BOM Components</h2>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-2">Bahan</th>
                    <th className="pb-2">Qty per Unit</th>
                    <th className="pb-2">Unit</th>
                    <th className="pb-2">Total Dibutuhkan</th>
                  </tr>
                </thead>
                <tbody>
                  {order.bomComponents.map((c, i) => (
                    <tr key={i} className="border-b border-muted/20">
                      <td className="py-2">{c.ingredientName || c.name}</td>
                      <td className="py-2">{c.qty}</td>
                      <td className="py-2">{c.unit || "pcs"}</td>
                      <td className="py-2 font-mono">
                        {(parseFloat(c.qty) || 0) * order.plannedQty}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-card p-6 rounded-xl border border-border">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Status
            </h2>
            <div
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${st.class}`}>
              <StatusIcon size={14} /> {st.label}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailProductionOrder;
