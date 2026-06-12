import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "react-query";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Clock, CheckCircle2, XCircle, Package } from "lucide-react";
import { getPurchaseOrderById } from "@/services/purchase-order";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";

const statusMap = {
  pending: { label: "Menunggu", class: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400", icon: Clock },
  received: { label: "Diterima", class: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400", icon: CheckCircle2 },
  cancelled: { label: "Dibatalkan", class: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400", icon: XCircle }
};

const DetailPurchaseOrder = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");

  const { data, isLoading } = useQuery(
    ["purchase-order-detail", id],
    () => getPurchaseOrderById(id),
    { enabled: !!id }
  );

  const po = data?.data || {};
  const st = statusMap[po.status] || statusMap.pending;
  const StatusIcon = st.icon;

  if (!id) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">ID tidak ditemukan</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loading />
      </div>
    );
  }

  if (!po.id) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Package className="w-12 h-12 text-muted-foreground" />
        <p className="text-muted-foreground">Purchase Order tidak ditemukan</p>
        <Button variant="outline" onClick={() => navigate("/purchase-order")}>
          <ArrowLeft size={16} className="mr-2" />Kembali
        </Button>
      </div>
    );
  }

  const items = po.items || [];
  const totalAmount = items.reduce((sum, item) => sum + (item.quantity || 0) * (item.price || 0), 0) || po.totalAmount || 0;
  const discount = po.discount || 0;
  const finalAmount = po.finalAmount || totalAmount - discount;

  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <button onClick={() => navigate("/dashboard-super-admin")} className="hover:text-foreground transition-colors">
          {t("breadcrumb.home")}
        </button>
        <span className="text-xs">/</span>
        <button onClick={() => navigate("/purchase-order")} className="hover:text-foreground transition-colors">
          {t("page.purchaseOrder.list.title")}
        </button>
        <span className="text-xs">/</span>
        <span className="text-primary font-semibold">Detail PO</span>
      </nav>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={() => navigate("/purchase-order")}>
            <ArrowLeft size={18} />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {po.orderNumber || po.poNumber || `PO-${po.id}`}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Detail Purchase Order</p>
          </div>
        </div>
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${st.class}`}>
          <StatusIcon size={14} />
          {st.label}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <h3 className="text-sm font-semibold text-foreground mb-4">Informasi PO</h3>
            <table className="w-full text-sm">
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="py-2.5 text-muted-foreground w-36">Supplier</td>
                  <td className="py-2.5 font-medium">{po.supplierData?.name || po.supplier?.name || "-"}</td>
                </tr>
                <tr>
                  <td className="py-2.5 text-muted-foreground">PIC</td>
                  <td className="py-2.5 font-medium">{po.picData?.fullName || "-"}</td>
                </tr>
                <tr>
                  <td className="py-2.5 text-muted-foreground">Tanggal PO</td>
                  <td className="py-2.5 font-medium">
                    {po.orderDate
                      ? new Date(po.orderDate).toLocaleDateString("id-ID", {
                          weekday: "long", year: "numeric", month: "long", day: "numeric",
                          hour: "2-digit", minute: "2-digit"
                        })
                      : "-"}
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 text-muted-foreground">Catatan</td>
                  <td className="py-2.5">{po.notes || "-"}</td>
                </tr>
              </tbody>
            </table>
          </Card>

          <Card className="p-6">
            <h3 className="text-sm font-semibold text-foreground mb-4">Item Barang</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-2 text-muted-foreground font-medium w-8">#</th>
                    <th className="text-left py-2 px-2 text-muted-foreground font-medium">Nama Barang</th>
                    <th className="text-right py-2 px-2 text-muted-foreground font-medium">Qty</th>
                    <th className="text-center py-2 px-2 text-muted-foreground font-medium">Unit</th>
                    <th className="text-right py-2 px-2 text-muted-foreground font-medium">Harga</th>
                    <th className="text-right py-2 px-2 text-muted-foreground font-medium">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-muted/20">
                      <td className="py-2 px-2 text-muted-foreground">{idx + 1}</td>
                      <td className="py-2 px-2 font-medium">{item.ingredientName || item.productData?.nameProduct || "-"}</td>
                      <td className="py-2 px-2 text-right">{item.quantity}</td>
                      <td className="py-2 px-2 text-center">{item.unit || "pcs"}</td>
                      <td className="py-2 px-2 text-right">Rp {Number(item.price).toLocaleString("id-ID")}</td>
                      <td className="py-2 px-2 text-right font-medium">Rp {Number(item.quantity * item.price).toLocaleString("id-ID")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-sm font-semibold text-foreground mb-4">Ringkasan</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total</span>
                <span className="font-medium">Rp {Number(totalAmount).toLocaleString("id-ID")}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Diskon</span>
                  <span className="font-medium text-red-500">- Rp {Number(discount).toLocaleString("id-ID")}</span>
                </div>
              )}
              <div className="border-t border-border pt-3 flex justify-between text-sm font-bold">
                <span>Grand Total</span>
                <span>Rp {Number(finalAmount).toLocaleString("id-ID")}</span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-sm font-semibold text-foreground mb-4">Sistem</h3>
            <table className="w-full text-sm">
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="py-2 text-muted-foreground">Dibuat</td>
                  <td className="py-2 text-right">
                    {po.createdAt ? new Date(po.createdAt).toLocaleDateString("id-ID", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "-"}
                  </td>
                </tr>
                <tr>
                  <td className="py-2 text-muted-foreground">Diubah</td>
                  <td className="py-2 text-right">
                    {po.updatedAt ? new Date(po.updatedAt).toLocaleDateString("id-ID", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "-"}
                  </td>
                </tr>
              </tbody>
            </table>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DetailPurchaseOrder;
