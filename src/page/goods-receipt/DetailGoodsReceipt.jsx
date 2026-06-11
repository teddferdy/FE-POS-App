import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "react-query";
import {
  ArrowLeft,
  FileText
  //  CheckCircle,
  //  XCircle
} from "lucide-react";
import { getGoodsReceiptById } from "@/services/goods-receipt";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const statusDetail = {
  draft: { label: "Draft", class: "bg-yellow-100 text-yellow-800" },
  completed: { label: "Completed", class: "bg-green-100 text-green-800" },
  cancelled: { label: "Cancelled", class: "bg-red-100 text-red-800" }
};

const DetailGoodsReceipt = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");

  const { data, isLoading } = useQuery(
    ["goods-receipt-detail", id],
    () => getGoodsReceiptById(id),
    { enabled: !!id }
  );

  const receipt = data?.data;

  if (isLoading) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!receipt) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Goods receipt tidak ditemukan</p>
        <Button variant="outline" onClick={() => navigate("/goods-receipt")} className="mt-4">
          <ArrowLeft size={16} className="mr-1" /> Kembali
        </Button>
      </div>
    );
  }

  const st = statusDetail[receipt.status] || statusDetail.draft;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <button
          onClick={() => navigate("/dashboard-super-admin")}
          className="hover:text-foreground">
          Dashboard
        </button>
        <span className="text-xs">/</span>
        <button onClick={() => navigate("/goods-receipt")} className="hover:text-foreground">
          Goods Receipt
        </button>
        <span className="text-xs">/</span>
        <span className="text-primary font-semibold">Detail</span>
      </nav>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Detail Goods Receipt</h1>
          <p className="text-sm text-muted-foreground mt-1">{receipt.receiptNumber}</p>
        </div>
        <Button variant="outline" onClick={() => navigate("/goods-receipt")}>
          <ArrowLeft size={16} className="mr-1" /> Kembali
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card p-6 rounded-xl border border-border">
            <h2 className="text-lg font-semibold mb-4">Informasi Penerimaan</h2>
            <table className="w-full text-sm">
              <tbody>
                {[
                  ["No. Receipt", receipt.receiptNumber],
                  ["PO Reference", receipt.purchaseOrderData?.orderNumber || "-"],
                  ["Store", receipt.storeData?.name || "-"],
                  [
                    "Tanggal Terima",
                    receipt.receivedDate
                      ? new Date(receipt.receivedDate).toLocaleDateString("id")
                      : "-"
                  ],
                  ["Catatan", receipt.notes || "-"]
                ].map(([label, value]) => (
                  <tr key={label} className="border-b border-muted/30">
                    <td className="py-2 pr-4 text-muted-foreground w-40">{label}</td>
                    <td className="py-2 font-medium">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-card p-6 rounded-xl border border-border">
            <h2 className="text-lg font-semibold mb-4">Items Diterima</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-2">Produk</th>
                  <th className="pb-2 text-right">Qty</th>
                  <th className="pb-2 text-center">Unit</th>
                  <th className="pb-2">Catatan</th>
                </tr>
              </thead>
              <tbody>
                {receipt.items?.length > 0 ? (
                  receipt.items.map((item, i) => (
                    <tr key={i} className="border-b border-muted/20">
                      <td className="py-2">{item.productData?.nameProduct || "-"}</td>
                      <td className="py-2 text-right font-mono">{item.qtyReceived}</td>
                      <td className="py-2 text-center">{item.unit || "pcs"}</td>
                      <td className="py-2">{item.conditionNotes || "-"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-muted-foreground">
                      Tidak ada item
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {receipt.purchaseOrderItems?.length > 0 && (
            <div className="bg-card p-6 rounded-xl border border-border">
              <h2 className="text-lg font-semibold mb-4">PO Items</h2>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-2">Product</th>
                    <th className="pb-2 text-right">Qty PO</th>
                    <th className="pb-2 text-right">Qty Received</th>
                  </tr>
                </thead>
                <tbody>
                  {receipt.purchaseOrderItems.map((poItem, i) => (
                    <tr key={i} className="border-b border-muted/20">
                      <td className="py-2">{poItem.product || poItem.ingredientName || "-"}</td>
                      <td className="py-2 text-right font-mono">{poItem.quantity}</td>
                      <td className="py-2 text-right font-mono">{poItem.receivedQuantity || 0}</td>
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
              <FileText size={14} /> {st.label}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailGoodsReceipt;
