import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  XCircle,
  Package,
  Wallet,
  Trash2,
  Plus
} from "lucide-react";
import { format } from "date-fns";
import { DatePicker } from "@/components/ui/date-picker";
import { getPurchaseOrderById } from "@/services/purchase-order";
import { getPaymentsByPO, recordPayment, deletePayment } from "@/services/purchase-payment";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";
import Modal from "@/components/organism/modal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

const statusMap = {
  pending: {
    label: "Menunggu",
    class: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
    icon: Clock
  },
  ordered: {
    label: "Sebagian",
    class: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
    icon: Clock
  },
  received: {
    label: "Diterima",
    class: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
    icon: CheckCircle2
  },
  cancelled: {
    label: "Dibatalkan",
    class: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
    icon: XCircle
  }
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

  const items = po.items || [];
  const totalAmount =
    items.reduce((sum, item) => sum + (item.quantity || 0) * (item.price || 0), 0) ||
    po.totalAmount ||
    0;
  const discount = po.discount || 0;
  const finalAmount = po.finalAmount || totalAmount - discount;

  const queryClient = useQueryClient();
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    paymentDate: undefined,
    paymentMethod: "cash",
    reference: "",
    notes: ""
  });

  const { data: paymentsData } = useQuery(["po-payments", id], () => getPaymentsByPO(id), {
    enabled: !!id
  });
  const payments = paymentsData?.data || [];
  const totalPaid = payments.reduce((s, p) => s + Number(p.amount || 0), 0);
  const remaining = Math.max(0, finalAmount - totalPaid);

  const recordMutation = useMutation(recordPayment, {
    onSuccess: () => {
      toast.success("Pembayaran berhasil dicatat");
      queryClient.invalidateQueries(["po-payments", id]);
      queryClient.invalidateQueries(["purchase-order-detail", id]);
      setPaymentModalOpen(false);
      setPaymentForm({
        amount: "",
        paymentDate: undefined,
        paymentMethod: "cash",
        reference: "",
        notes: ""
      });
    },
    onError: (err) => {
      toast.error("Gagal mencatat pembayaran", {
        description: err?.response?.data?.message || err.message
      });
    }
  });

  const deletePaymentMutation = useMutation(deletePayment, {
    onSuccess: () => {
      toast.success("Pembayaran dihapus");
      queryClient.invalidateQueries(["po-payments", id]);
    },
    onError: (err) => {
      toast.error("Gagal menghapus pembayaran", {
        description: err?.response?.data?.message || err.message
      });
    }
  });

  const handleRecordPayment = () => {
    if (!paymentForm.amount || Number(paymentForm.amount) <= 0) {
      toast.error("Jumlah pembayaran harus diisi");
      return;
    }
    recordMutation.mutate({
      purchaseOrder: po.id,
      supplier: po.supplier,
      amount: Number(paymentForm.amount),
      paymentDate: paymentForm.paymentDate ? format(paymentForm.paymentDate, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
      paymentMethod: paymentForm.paymentMethod,
      reference: paymentForm.reference,
      notes: paymentForm.notes
    });
  };

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
          <ArrowLeft size={16} className="mr-2" />
          Kembali
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <button
          onClick={() => navigate("/dashboard-super-admin")}
          className="hover:text-foreground transition-colors">
          {t("breadcrumb.home")}
        </button>
        <span className="text-xs">/</span>
        <button
          onClick={() => navigate("/purchase-order")}
          className="hover:text-foreground transition-colors">
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
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${st.class}`}>
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
                  <td className="py-2.5 font-medium">
                    {po.supplierData?.name || po.supplier?.name || "-"}
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 text-muted-foreground">PIC</td>
                  <td className="py-2.5 font-medium">{po.picData?.fullName || "-"}</td>
                </tr>
                <tr>
                  <td className="py-2.5 text-muted-foreground">Store</td>
                  <td className="py-2.5 font-medium">{po.storeData?.name || "-"}</td>
                </tr>
                <tr>
                  <td className="py-2.5 text-muted-foreground">Tanggal PO</td>
                  <td className="py-2.5 font-medium">
                    {po.orderDate
                      ? new Date(po.orderDate).toLocaleDateString("id-ID", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })
                      : "-"}
                  </td>
                </tr>
                {po.dueDate && (
                  <tr>
                    <td className="py-2.5 text-muted-foreground">Jatuh Tempo</td>
                    <td className="py-2.5 font-medium">
                      {new Date(po.dueDate).toLocaleDateString("id-ID", {
                        year: "numeric",
                        month: "long",
                        day: "numeric"
                      })}
                    </td>
                  </tr>
                )}
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
                    <th className="text-left py-2 px-2 text-muted-foreground font-medium">
                      Nama Barang
                    </th>
                    <th className="text-right py-2 px-2 text-muted-foreground font-medium">Qty</th>
                    <th className="text-center py-2 px-2 text-muted-foreground font-medium">
                      Unit
                    </th>
                    <th className="text-right py-2 px-2 text-muted-foreground font-medium">
                      Harga
                    </th>
                    <th className="text-right py-2 px-2 text-muted-foreground font-medium">
                      Subtotal
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-muted/20">
                      <td className="py-2 px-2 text-muted-foreground">{idx + 1}</td>
                      <td className="py-2 px-2 font-medium">
                        {item.ingredientName || item.productData?.nameProduct || "-"}
                      </td>
                      <td className="py-2 px-2 text-right">{item.quantity}</td>
                      <td className="py-2 px-2 text-center">{item.unit || "pcs"}</td>
                      <td className="py-2 px-2 text-right">
                        Rp {Number(item.price).toLocaleString("id-ID")}
                      </td>
                      <td className="py-2 px-2 text-right font-medium">
                        Rp {Number(item.quantity * item.price).toLocaleString("id-ID")}
                      </td>
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
                <span className="font-medium">
                  Rp {Number(totalAmount).toLocaleString("id-ID")}
                </span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Diskon</span>
                  <span className="font-medium text-red-500">
                    - Rp {Number(discount).toLocaleString("id-ID")}
                  </span>
                </div>
              )}
              <div className="border-t border-border pt-3 flex justify-between text-sm font-bold">
                <span>Grand Total</span>
                <span>Rp {Number(finalAmount).toLocaleString("id-ID")}</span>
              </div>
              {totalPaid > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Terbayar</span>
                  <span className="font-medium text-green-600">
                    Rp {Number(totalPaid).toLocaleString("id-ID")}
                  </span>
                </div>
              )}
              {remaining > 0 && (
                <div className="flex justify-between text-sm border-t border-border pt-3">
                  <span className="text-muted-foreground font-medium">Sisa</span>
                  <span className="font-bold text-red-500">
                    Rp {Number(remaining).toLocaleString("id-ID")}
                  </span>
                </div>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-foreground">Pembayaran</h3>
              {remaining > 0 && (
                <Button size="sm" variant="outline" onClick={() => setPaymentModalOpen(true)}>
                  <Plus size={14} className="mr-1" />
                  Bayar
                </Button>
              )}
            </div>
            {payments.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Belum ada pembayaran</p>
            ) : (
              <div className="overflow-x-auto max-h-64 overflow-y-auto">
                <table className="w-full text-sm text-center">
                  <thead className="text-muted-foreground text-xs sticky top-0 bg-background">
                    <tr className="border-b border-border">
                      <th className="py-2 px-2 font-medium">Tanggal</th>
                      <th className="py-2 px-2 font-medium">Metode</th>
                      <th className="py-2 px-2 font-medium">Jumlah</th>
                      <th className="py-2 px-2 font-medium">Referensi</th>
                      <th className="py-2 px-2 font-medium w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {payments.map((p) => (
                      <tr key={p.id} className="hover:bg-muted/20">
                        <td className="py-2.5 px-2">
                          {p.paymentDate
                            ? new Date(p.paymentDate).toLocaleDateString("id-ID")
                            : "-"}
                        </td>
                        <td className="py-2.5 px-2 capitalize">{p.paymentMethod || "-"}</td>
                        <td className="py-2.5 px-2 font-medium">
                          Rp {Number(p.amount).toLocaleString("id-ID")}
                        </td>
                        <td className="py-2.5 px-2 text-muted-foreground">{p.reference || "-"}</td>
                        <td className="py-2.5 px-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                            onClick={() => {
                              if (window.confirm("Hapus pembayaran ini?")) {
                                deletePaymentMutation.mutate(p.id);
                              }
                            }}>
                            <Trash2 size={13} />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          <Card className="p-6">
            <h3 className="text-sm font-semibold text-foreground mb-4">Sistem</h3>
            <table className="w-full text-sm">
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="py-2 text-muted-foreground">Dibuat</td>
                  <td className="py-2 text-right">
                    {po.createdAt
                      ? new Date(po.createdAt).toLocaleDateString("id-ID", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })
                      : "-"}
                  </td>
                </tr>
                <tr>
                  <td className="py-2 text-muted-foreground">Diubah</td>
                  <td className="py-2 text-right">
                    {po.updatedAt
                      ? new Date(po.updatedAt).toLocaleDateString("id-ID", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })
                      : "-"}
                  </td>
                </tr>
              </tbody>
            </table>
          </Card>
        </div>
      </div>

      <Modal
        open={paymentModalOpen}
        onOpenChange={setPaymentModalOpen}
        type="form"
        title="Catat Pembayaran"
        confirmText="Simpan"
        onConfirm={handleRecordPayment}>
        <div className="space-y-5">
          {remaining > 0 && (
            <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800/40 rounded-lg px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-orange-700 dark:text-orange-400">
                <Wallet size={18} />
                <span>Sisa tagihan</span>
              </div>
              <span className="font-bold text-orange-700 dark:text-orange-400">
                Rp {Number(remaining).toLocaleString("id-ID")}
              </span>
            </div>
          )}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Jumlah Pembayaran <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">
                Rp
              </span>
              <Input
                type="text"
                inputMode="numeric"
                placeholder="0"
                value={paymentForm.amount ? Number(paymentForm.amount).toLocaleString("id-ID") : ""}
                onChange={(e) => {
                  const raw = e.target.value.replace(/[^0-9]/g, "");
                  setPaymentForm({ ...paymentForm, amount: raw ? Number(raw) : "" });
                }}
                className="pl-10 h-11 text-base"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Tanggal Bayar</Label>
              <DatePicker date={paymentForm.paymentDate} setDate={(date) => setPaymentForm({...paymentForm, paymentDate: date})} />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Metode Pembayaran</Label>
              <Select
                value={paymentForm.paymentMethod}
                onValueChange={(value) => setPaymentForm({ ...paymentForm, paymentMethod: value })}>
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-[70]">
                  <SelectItem value="cash">Tunai</SelectItem>
                  <SelectItem value="transfer">Transfer</SelectItem>
                  <SelectItem value="giro">Giro</SelectItem>
                  <SelectItem value="other">Lainnya</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <hr className="border-t border-border" />
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Referensi</Label>
              <Input
                placeholder="No. invoice / referensi"
                value={paymentForm.reference}
                onChange={(e) => setPaymentForm({ ...paymentForm, reference: e.target.value })}
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Catatan</Label>
              <Input
                placeholder="Catatan tambahan"
                value={paymentForm.notes}
                onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                className="h-11"
              />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default DetailPurchaseOrder;
