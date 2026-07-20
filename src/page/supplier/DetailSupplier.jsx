import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import {
  ArrowLeft,
  Building2,
  Phone,
  Mail,
  MapPin,
  User,
  Plus,
  Edit3,
  Lightbulb,
  ShoppingCart,
  Package
} from "lucide-react";
import { useCookies } from "react-cookie";
import AbortController from "@/components/organism/abort-controller";
import { useTranslation } from "react-i18next";
import { getSupplierById } from "@/services/supplier";
import { getPaymentsBySupplier, recordPayment } from "@/services/purchase-payment";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import DataTable from "@/components/ui/DataTable";
import Modal from "@/components/organism/modal";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { DatePicker } from "@/components/ui/date-picker";
import { format } from "date-fns";
const statusMap = {
  pending: { class: "bg-yellow-100 text-yellow-800" },
  ordered: { class: "bg-blue-100 text-blue-800" },
  received: { class: "bg-green-100 text-green-800" },
  cancelled: { class: "bg-red-100 text-red-800" }
};
const statusKeys = {
  pending: "pending",
  ordered: "ordered",
  received: "received",
  cancelled: "cancelled"
};

const DetailSupplier = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  const [cookie] = useCookies();
  const user = cookie?.user;
  const isSuperAdmin = user?.roleType === "super_admin";

  const [paymentModal, setPaymentModal] = useState(false);
  const [payAmount, setPayAmount] = useState("");
  const [payDate, setPayDate] = useState(new Date());
  const [payMethod, setPayMethod] = useState("cash");
  const [payRef, setPayRef] = useState("");
  const [payNotes, setPayNotes] = useState("");

  const {
    data: supplierData,
    isLoading,
    isError,
    refetch
  } = useQuery(["supplier-detail", id], () => getSupplierById({ id }), { enabled: !!id });
  const supplier = supplierData?.data || {};

  const { data: paymentData, isLoading: loadingPayments } = useQuery(
    ["supplier-payments", id],
    () => getPaymentsBySupplier(id),
    { enabled: !!id }
  );
  const { purchaseOrders = [], summary = {} } = paymentData?.data || {};

  const recordMutation = useMutation(recordPayment, {
    onSuccess: () => {
      toast.success(t("page.supplier.detail.toast.success"), {
        description: t("page.supplier.detail.toast.paymentSuccessDesc")
      });
      queryClient.invalidateQueries(["supplier-payments", id]);
      setPaymentModal(false);
      setPayAmount("");
    },
    onError: (err) =>
      toast.error(t("page.supplier.detail.toast.error"), {
        description: err?.response?.data?.message || err.message
      })
  });

  if (!id) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">{t("page.supplier.detail.noId")}</p>
      </div>
    );
  }

  if (isError) return <AbortController refetch={refetch} />;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <Skeleton className="h-12 w-12 rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-5 col-span-1 md:col-span-2 space-y-4">
            <Skeleton className="h-4 w-32" />
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-4 w-32" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="col-span-2 space-y-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-4 w-48" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
            </div>
          </Card>
          <div className="space-y-4">
            <Card className="p-5 space-y-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </Card>
            <Card className="p-5 space-y-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-40" />
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const poColumns = [
    {
      header: t("page.supplier.detail.table.noPo"),
      render: (po) => <span className="font-medium">{po.orderNumber || `PO-${po.id}`}</span>
    },
    {
      header: t("page.supplier.detail.table.date"),
      render: (po) => (po.orderDate ? new Date(po.orderDate).toLocaleDateString("id") : "-")
    },
    {
      header: t("page.supplier.detail.table.total"),
      align: "right",
      render: (po) => `Rp ${(po.finalAmount || 0).toLocaleString("id-ID")}`
    },
    {
      header: t("page.supplier.detail.table.status"),
      render: (po) => {
        const st = statusMap[po.status] || statusMap.pending;
        const stKey = statusKeys[po.status] || "pending";
        return (
          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-bold ${st.class}`}>
            {t(`page.supplier.detail.status.${stKey}`)}
          </span>
        );
      }
    },
    {
      header: t("page.supplier.detail.table.terbayar"),
      align: "right",
      render: (po) => {
        const paid = (po.payments || []).reduce((s, p) => s + Number(p.amount || 0), 0);
        const left = (po.finalAmount || 0) - paid;
        return (
          <div className="text-right">
            <p className="text-xs text-green-600">
              {t("page.supplier.detail.table.rpPrefix")} {paid.toLocaleString("id-ID")}
            </p>
            {left > 0 && (
              <p className="text-xs text-red-500">
                {t("page.supplier.detail.table.sisa")} Rp {left.toLocaleString("id-ID")}
              </p>
            )}
          </div>
        );
      }
    },
    {
      header: t("page.supplier.detail.table.aksi"),
      render: (po) =>
        po.status !== "cancelled" && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs text-primary"
            onClick={() => navigate(`/purchase-order/detail?id=${po.id}`)}>
            {t("page.supplier.detail.table.detail")}
          </Button>
        )
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <button onClick={() => navigate("/")} className="hover:text-foreground">
          {t("page.supplier.detail.breadcrumb.dashboard")}
        </button>
        <span className="text-xs">/</span>
        <button onClick={() => navigate("/supplier")} className="hover:text-foreground">
          {t("page.supplier.detail.breadcrumb.list")}
        </button>
        <span className="text-xs">/</span>
        <span className="text-primary font-semibold">
          {isLoading ? "..." : supplier.name || "Detail"}
        </span>
      </nav>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={() => navigate("/supplier")}>
            <ArrowLeft size={16} />
          </Button>
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Building2 size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{supplier.name || "-"}</h1>
            <p className="text-sm text-muted-foreground">{t("page.supplier.detail.subtitle")}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(`/edit-supplier?id=${id}`)}>
            <Edit3 size={14} className="mr-1.5" />
            {t("page.supplier.detail.editSupplier")}
          </Button>
          {supplier.status !== "inactive" && supplier.status !== "draft" && (
            <Button onClick={() => setPaymentModal(true)} className="gap-1.5">
              <Plus size={18} /> {t("page.supplier.detail.catatPembayaran")}
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-5 col-span-1 md:col-span-2">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            {t("page.supplier.detail.section.informasiSupplier")}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-sm">
            <div className="flex items-center gap-2">
              <Building2 size={18} className="text-muted-foreground shrink-0" />
              <span className="font-medium">{supplier.name}</span>
            </div>
            {supplier.contactPerson && (
              <div className="flex items-center gap-2">
                <User size={18} className="text-muted-foreground shrink-0" />
                <span>{supplier.contactPerson}</span>
              </div>
            )}
            {supplier.phone && (
              <div className="flex items-center gap-2">
                <Phone size={18} className="text-muted-foreground shrink-0" />
                <span>{supplier.phone}</span>
              </div>
            )}
            {supplier.email && (
              <div className="flex items-center gap-2">
                <Mail size={18} className="text-muted-foreground shrink-0" />
                <span>{supplier.email}</span>
              </div>
            )}
            {supplier.address && (
              <div className="flex items-start gap-2 md:col-span-2">
                <MapPin size={18} className="text-muted-foreground mt-0.5 shrink-0" />
                <span>{supplier.address}</span>
              </div>
            )}
          </div>
          <div className="border-t pt-3 mt-3 grid grid-cols-2 gap-2.5 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <User size={13} className="shrink-0" />
              <span>
                {t("common.createdBy")}:{" "}
                {supplier.createdByUser?.fullName ||
                  supplier.createdByUser?.userName ||
                  supplier.createdBy ||
                  "-"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <User size={13} className="shrink-0" />
              <span>
                {t("common.modifiedBy")}:{" "}
                {supplier.modifiedByUser?.fullName ||
                  supplier.modifiedByUser?.userName ||
                  supplier.modifiedBy ||
                  "-"}
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-5 text-center flex flex-col">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            {t("page.supplier.detail.card.totalPesanan")}
          </h3>
          <div className="flex-1 flex flex-col items-center justify-center">
            <p className="text-2xl font-bold text-foreground">
              Rp {(summary.totalOrdered || 0).toLocaleString("id-ID")}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {purchaseOrders.length} {t("page.supplier.detail.card.transaksi")}
            </p>
          </div>
        </Card>

        <Card className="p-5 text-center flex flex-col">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            {t("page.supplier.detail.card.sisaHutang")}
          </h3>
          <div className="flex-1 flex flex-col items-center justify-center">
            <p
              className={`text-2xl font-bold ${(summary.balance || 0) > 0 ? "text-red-600" : "text-green-600"}`}>
              Rp {(summary.balance || 0).toLocaleString("id-ID")}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {t("page.supplier.detail.card.terbayar")}: Rp{" "}
              {(summary.totalPaid || 0).toLocaleString("id-ID")}
            </p>
          </div>
        </Card>
      </div>

      {isSuperAdmin && supplier.products && supplier.products.length > 0 && (
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            {t("page.supplier.products.availableProducts")}
          </h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("page.supplier.products.table.name")}</TableHead>
                <TableHead className="text-right">{t("page.supplier.products.price")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {supplier.products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell className="text-right">
                    {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(
                      product.price
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {isSuperAdmin && supplier.products && supplier.products.length === 0 && (
        <Card className="p-8 text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-muted/50 flex items-center justify-center">
              <Package size={24} className="text-muted-foreground/60" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                {t("page.supplier.products.noProducts")}
              </p>
            </div>
          </div>
        </Card>
      )}

      {loadingPayments ? (
        <div className="space-y-3">
          <Skeleton className="h-4 w-64" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : purchaseOrders.length === 0 ? (
        <div className="space-y-4">
          <Card className="p-8 text-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-muted/50 flex items-center justify-center">
                <ShoppingCart size={24} className="text-muted-foreground/60" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {t("page.supplier.detail.emptyTitle")}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {t("page.supplier.detail.emptyDesc")}
                </p>
              </div>
              <Button
                size="sm"
                className="mt-1"
                onClick={() => navigate(`/add-purchase-order?supplier=${id}`)}>
                <Plus size={14} className="mr-1" />
                {t("page.supplier.detail.createPo")}
              </Button>
            </div>
          </Card>
          <Card className="p-5 bg-primary/5 border-primary/20">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <Lightbulb size={16} className="text-primary" />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-semibold text-foreground">
                  {t("page.supplier.detail.tips.title")}
                </p>
                <ul className="space-y-1.5 text-xs text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="w-1 h-1 rounded-full bg-primary mt-1.5 shrink-0" />
                    {t("page.supplier.detail.tips.1")}
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1 h-1 rounded-full bg-primary mt-1.5 shrink-0" />
                    {t("page.supplier.detail.tips.2")}
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1 h-1 rounded-full bg-primary mt-1.5 shrink-0" />
                    {t("page.supplier.detail.tips.3")}
                  </li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      ) : (
        <DataTable
          columns={poColumns}
          data={purchaseOrders}
          isLoading={false}
          emptyMessage={t("page.supplier.detail.emptyMessage")}
          emptyIcon={Building2}
        />
      )}

      <Modal
        type="form"
        open={paymentModal}
        onOpenChange={(o) => !o && setPaymentModal(false)}
        title={t("page.supplier.detail.modal.title")}
        confirmText={t("page.supplier.detail.modal.confirm")}
        onConfirm={() => {
          if (!payAmount || parseFloat(payAmount) <= 0) {
            toast.error(t("page.supplier.detail.modal.validation"), {
              description: t("page.supplier.detail.modal.validationDesc")
            });
            return;
          }
          recordMutation.mutate({
            purchaseOrder: null,
            supplier: parseInt(id),
            amount: parseFloat(payAmount),
            paymentDate: format(payDate, "yyyy-MM-dd"),
            paymentMethod: payMethod,
            reference: payRef,
            notes: payNotes
          });
        }}
        loading={recordMutation.isLoading}>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>{t("page.supplier.detail.modal.amountLabel")}</Label>
            <Input
              type="text"
              inputMode="numeric"
              value={payAmount}
              onChange={(e) => setPayAmount(e.target.value.replace(/[^0-9]/g, ""))}
              placeholder={t("page.supplier.detail.modal.amountPlaceholder")}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t("page.supplier.detail.modal.paymentDateLabel")}</Label>
              <DatePicker date={payDate} setDate={setPayDate} />
            </div>
            <div className="space-y-2">
              <Label>{t("page.supplier.detail.modal.methodLabel")}</Label>
              <select
                value={payMethod}
                onChange={(e) => setPayMethod(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm">
                <option value="cash">{t("page.supplier.detail.modal.methodCash")}</option>
                <option value="transfer">{t("page.supplier.detail.modal.methodTransfer")}</option>
                <option value="cheque">{t("page.supplier.detail.modal.methodCheque")}</option>
                <option value="credit">{t("page.supplier.detail.modal.methodCredit")}</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>{t("page.supplier.detail.modal.referenceLabel")}</Label>
            <Input
              value={payRef}
              onChange={(e) => setPayRef(e.target.value)}
              placeholder={t("page.supplier.detail.modal.referencePlaceholder")}
            />
          </div>
          <div className="space-y-2">
            <Label>{t("page.supplier.detail.modal.notesLabel")}</Label>
            <Input
              value={payNotes}
              onChange={(e) => setPayNotes(e.target.value)}
              placeholder={t("page.supplier.detail.modal.notesPlaceholder")}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default DetailSupplier;
