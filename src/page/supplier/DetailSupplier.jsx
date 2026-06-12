import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useCookies } from "react-cookie";
import { toast } from "sonner";
import {
  ArrowLeft,
  Building2,
  Phone,
  Mail,
  MapPin,
  User,
  CreditCard,
  Wallet,
  Plus,
  Trash2
} from "lucide-react";
import { getSupplierById } from "@/services/supplier";
import { getPaymentsBySupplier, recordPayment, deletePayment } from "@/services/purchase-payment";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import DataTable from "@/components/ui/DataTable";
import Modal from "@/components/organism/modal";
import { Loading } from "@/components/ui/loading";

const statusMap = {
  pending: { label: "Menunggu", class: "bg-yellow-100 text-yellow-800" },
  ordered: { label: "Sebagian", class: "bg-blue-100 text-blue-800" },
  received: { label: "Diterima", class: "bg-green-100 text-green-800" },
  cancelled: { label: "Dibatalkan", class: "bg-red-100 text-red-800" }
};

const DetailSupplier = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  const [cookie] = useCookies();
  const user = cookie?.user;

  const [paymentModal, setPaymentModal] = useState(false);
  const [payAmount, setPayAmount] = useState("");
  const [payDate, setPayDate] = useState(new Date().toISOString().split("T")[0]);
  const [payMethod, setPayMethod] = useState("cash");
  const [payRef, setPayRef] = useState("");
  const [payNotes, setPayNotes] = useState("");

  const { data: supplierData, isLoading } = useQuery(
    ["supplier-detail", id],
    () => getSupplierById({ id }),
    { enabled: !!id }
  );
  const supplier = supplierData?.data || {};

  const { data: paymentData, isLoading: loadingPayments } = useQuery(
    ["supplier-payments", id],
    () => getPaymentsBySupplier(id),
    { enabled: !!id }
  );
  const { purchaseOrders = [], summary = {} } = paymentData?.data || {};

  const recordMutation = useMutation(recordPayment, {
    onSuccess: () => {
      toast.success("Berhasil", { description: "Pembayaran berhasil dicatat" });
      queryClient.invalidateQueries(["supplier-payments", id]);
      setPaymentModal(false);
      setPayAmount("");
    },
    onError: (err) =>
      toast.error("Gagal", { description: err?.response?.data?.message || err.message })
  });

  const deleteMutation = useMutation(deletePayment, {
    onSuccess: () => {
      toast.success("Berhasil", { description: "Pembayaran dihapus" });
      queryClient.invalidateQueries(["supplier-payments", id]);
    },
    onError: (err) =>
      toast.error("Gagal", { description: err?.response?.data?.message || err.message })
  });

  if (!id) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">ID supplier tidak ditemukan</p>
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

  const poColumns = [
    { header: "No. PO", render: (po) => <span className="font-medium">{po.orderNumber || `PO-${po.id}`}</span> },
    { header: "Tanggal", render: (po) => po.orderDate ? new Date(po.orderDate).toLocaleDateString("id") : "-" },
    { header: "Total", align: "right", render: (po) => `Rp ${(po.finalAmount || 0).toLocaleString("id-ID")}` },
    {
      header: "Status",
      render: (po) => {
        const st = statusMap[po.status] || statusMap.pending;
        return <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-bold ${st.class}`}>{st.label}</span>;
      }
    },
    {
      header: "Terbayar",
      align: "right",
      render: (po) => {
        const paid = (po.payments || []).reduce((s, p) => s + Number(p.amount || 0), 0);
        const left = (po.finalAmount || 0) - paid;
        return (
          <div className="text-right">
            <p className="text-xs text-green-600">Rp {paid.toLocaleString("id-ID")}</p>
            {left > 0 && <p className="text-xs text-red-500">Sisa Rp {left.toLocaleString("id-ID")}</p>}
          </div>
        );
      }
    },
    {
      header: "Aksi",
      render: (po) =>
        po.status !== "cancelled" && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs text-primary"
            onClick={() => navigate(`/purchase-order/detail?id=${po.id}`)}>
            Detail
          </Button>
        )
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <button onClick={() => navigate("/")} className="hover:text-foreground">Dashboard</button>
        <span className="text-xs">/</span>
        <button onClick={() => navigate("/supplier")} className="hover:text-foreground">Supplier</button>
        <span className="text-xs">/</span>
        <span className="text-primary font-semibold">{supplier.name || "Detail"}</span>
      </nav>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={() => navigate("/supplier")}>
            <ArrowLeft size={16} />
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Building2 size={24} className="text-primary" /> {supplier.name || "-"}
            </h1>
            <p className="text-sm text-muted-foreground">Detail supplier & riwayat pembelian</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(`/edit-supplier?id=${id}`)}>
            Edit Supplier
          </Button>
          <Button onClick={() => setPaymentModal(true)} className="gap-1.5">
            <Plus size={15} /> Catat Pembayaran
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-5 col-span-1 md:col-span-2">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Informasi Supplier</h3>
          <div className="space-y-2.5 text-sm">
            <div className="flex items-center gap-2"><Building2 size={15} className="text-muted-foreground" /><span className="font-medium">{supplier.name}</span></div>
            {supplier.contactPerson && <div className="flex items-center gap-2"><User size={15} className="text-muted-foreground" /><span>{supplier.contactPerson}</span></div>}
            {supplier.phone && <div className="flex items-center gap-2"><Phone size={15} className="text-muted-foreground" /><span>{supplier.phone}</span></div>}
            {supplier.email && <div className="flex items-center gap-2"><Mail size={15} className="text-muted-foreground" /><span>{supplier.email}</span></div>}
            {supplier.address && <div className="flex items-start gap-2"><MapPin size={15} className="text-muted-foreground mt-0.5" /><span>{supplier.address}</span></div>}
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Total Pesanan</h3>
          <p className="text-2xl font-bold text-foreground">
            Rp {(summary.totalOrdered || 0).toLocaleString("id-ID")}
          </p>
          <p className="text-xs text-muted-foreground mt-1">{purchaseOrders.length} transaksi</p>
        </Card>

        <Card className="p-5">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Sisa Hutang</h3>
          <p className={`text-2xl font-bold ${(summary.balance || 0) > 0 ? "text-red-600" : "text-green-600"}`}>
            Rp {(summary.balance || 0).toLocaleString("id-ID")}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Terbayar: Rp {(summary.totalPaid || 0).toLocaleString("id-ID")}
          </p>
        </Card>
      </div>

      {loadingPayments ? (
        <div className="flex items-center justify-center py-12"><Loading /></div>
      ) : (
        <DataTable
          columns={poColumns}
          data={purchaseOrders}
          isLoading={false}
          emptyMessage="Belum ada purchase order untuk supplier ini"
          emptyIcon={Building2}
        />
      )}

      <Modal
        type="form"
        open={paymentModal}
        onOpenChange={(o) => !o && setPaymentModal(false)}
        title="Catat Pembayaran"
        confirmText="Simpan"
        onConfirm={() => {
          if (!payAmount || parseFloat(payAmount) <= 0) {
            toast.error("Validasi", { description: "Jumlah pembayaran harus diisi" });
            return;
          }
          recordMutation.mutate({
            purchaseOrder: null,
            supplier: parseInt(id),
            amount: parseFloat(payAmount),
            paymentDate: payDate,
            paymentMethod: payMethod,
            reference: payRef,
            notes: payNotes
          });
        }}
        loading={recordMutation.isLoading}>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Jumlah Pembayaran *</Label>
            <Input
              type="text"
              inputMode="numeric"
              value={payAmount}
              onChange={(e) => setPayAmount(e.target.value.replace(/[^0-9]/g, ""))}
              placeholder="0"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tanggal Bayar</Label>
              <Input type="date" value={payDate} onChange={(e) => setPayDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Metode</Label>
              <select
                value={payMethod}
                onChange={(e) => setPayMethod(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm">
                <option value="cash">Tunai</option>
                <option value="transfer">Transfer</option>
                <option value="cheque">Cek / Giro</option>
                <option value="credit">Kartu Kredit</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Referensi (No. Invoice/Transfer)</Label>
            <Input value={payRef} onChange={(e) => setPayRef(e.target.value)} placeholder="Opsional" />
          </div>
          <div className="space-y-2">
            <Label>Catatan</Label>
            <Input value={payNotes} onChange={(e) => setPayNotes(e.target.value)} placeholder="Opsional" />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default DetailSupplier;
