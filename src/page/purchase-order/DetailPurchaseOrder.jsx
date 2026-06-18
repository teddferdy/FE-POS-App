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
import AbortController from "@/components/organism/abort-controller";
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
const DetailPurchaseOrder = () => {
  const { t } = useTranslation();

  const statusMap = {
    pending: {
      label: t("page.purchaseOrder.status.pending"),
      class: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
      icon: Clock
    },
    ordered: {
      label: t("page.purchaseOrder.status.ordered"),
      class: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
      icon: Clock
    },
    received: {
      label: t("page.purchaseOrder.status.received"),
      class: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
      icon: CheckCircle2
    },
    cancelled: {
      label: t("page.purchaseOrder.status.cancelled"),
      class: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
      icon: XCircle
    }
  };
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  const { data, isLoading, isError, refetch } = useQuery(
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
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState(null);
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
      toast.success(t("page.purchaseOrder.detail.paymentRecorded"));
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
      toast.error(t("page.purchaseOrder.detail.paymentRecordFailed"), {
        description: err?.response?.data?.message || err.message
      });
    }
  });

  const deletePaymentMutation = useMutation(deletePayment, {
    onSuccess: () => {
      toast.success(t("page.purchaseOrder.detail.paymentDeleted"));
      queryClient.invalidateQueries(["po-payments", id]);
    },
    onError: (err) => {
      toast.error(t("page.purchaseOrder.detail.paymentDeleteFailed"), {
        description: err?.response?.data?.message || err.message
      });
    }
  });

  const handleRecordPayment = () => {
    if (!paymentForm.amount || Number(paymentForm.amount) <= 0) {
      toast.error(t("page.purchaseOrder.detail.paymentAmountRequired"));
      return;
    }
    recordMutation.mutate({
      purchaseOrder: po.id,
      supplier: po.supplier,
      amount: Number(paymentForm.amount),
      paymentDate: paymentForm.paymentDate
        ? format(paymentForm.paymentDate, "yyyy-MM-dd")
        : format(new Date(), "yyyy-MM-dd"),
      paymentMethod: paymentForm.paymentMethod,
      reference: paymentForm.reference,
      notes: paymentForm.notes
    });
  };

  if (!id) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">{t("page.purchaseOrder.detail.idNotFound")}</p>
      </div>
    );
  }

  if (isError) return <AbortController refetch={refetch} />;
  if (isLoading) {
    return <Loading fullscreen size="lg" label={t("common.loading")} />;
  }

  if (!po.id) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Package className="w-12 h-12 text-muted-foreground" />
        <p className="text-muted-foreground">{t("page.purchaseOrder.detail.notFound")}</p>
        <Button variant="outline" onClick={() => navigate("/purchase-order")}>
          <ArrowLeft size={16} className="mr-2" />
          {t("common.back")}
        </Button>
      </div>
    );
  }

  return (
    <>
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
          <span className="text-primary font-semibold">{t("page.purchaseOrder.detail.title")}</span>
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
              <p className="text-sm text-muted-foreground mt-1">
                {t("page.purchaseOrder.detail.pageDesc")}
              </p>
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
              <h3 className="text-sm font-semibold text-foreground mb-4">
                {t("page.purchaseOrder.detail.poInfo")}
              </h3>
              <table className="w-full text-sm">
                <tbody className="divide-y divide-border">
                  <tr>
                    <td className="py-2.5 text-muted-foreground w-36">
                      {t("page.purchaseOrder.detail.supplier")}
                    </td>
                    <td className="py-2.5 font-medium">
                      {po.supplierData?.name || po.supplier?.name || "-"}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 text-muted-foreground">
                      {t("page.purchaseOrder.detail.pic")}
                    </td>
                    <td className="py-2.5 font-medium">{po.picData?.fullName || "-"}</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 text-muted-foreground">
                      {t("page.purchaseOrder.detail.store")}
                    </td>
                    <td className="py-2.5 font-medium">{po.storeData?.name || "-"}</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 text-muted-foreground">
                      {t("page.purchaseOrder.detail.poDate")}
                    </td>
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
                      <td className="py-2.5 text-muted-foreground">
                        {t("page.purchaseOrder.detail.dueDate")}
                      </td>
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
                    <td className="py-2.5 text-muted-foreground">
                      {t("page.purchaseOrder.detail.notes")}
                    </td>
                    <td className="py-2.5">{po.notes || "-"}</td>
                  </tr>
                </tbody>
              </table>
            </Card>

            <Card className="p-6">
              <h3 className="text-sm font-semibold text-foreground mb-4">
                {t("page.purchaseOrder.detail.items")}
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 px-2 text-muted-foreground font-medium w-8">
                        #
                      </th>
                      <th className="text-left py-2 px-2 text-muted-foreground font-medium">
                        {t("page.purchaseOrder.detail.itemName")}
                      </th>
                      <th className="text-right py-2 px-2 text-muted-foreground font-medium">
                        {t("page.purchaseOrder.detail.qty")}
                      </th>
                      <th className="text-center py-2 px-2 text-muted-foreground font-medium">
                        {t("page.purchaseOrder.detail.unit")}
                      </th>
                      <th className="text-right py-2 px-2 text-muted-foreground font-medium">
                        {t("page.purchaseOrder.detail.price")}
                      </th>
                      <th className="text-right py-2 px-2 text-muted-foreground font-medium">
                        {t("page.purchaseOrder.detail.subtotal")}
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
              <h3 className="text-sm font-semibold text-foreground mb-4">
                {t("page.purchaseOrder.detail.summary")}
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {t("page.purchaseOrder.detail.total")}
                  </span>
                  <span className="font-medium">
                    Rp {Number(totalAmount).toLocaleString("id-ID")}
                  </span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {t("page.purchaseOrder.detail.discount")}
                    </span>
                    <span className="font-medium text-red-500">
                      - Rp {Number(discount).toLocaleString("id-ID")}
                    </span>
                  </div>
                )}
                <div className="border-t border-border pt-3 flex justify-between text-sm font-bold">
                  <span>{t("page.purchaseOrder.detail.grandTotal")}</span>
                  <span>Rp {Number(finalAmount).toLocaleString("id-ID")}</span>
                </div>
                {totalPaid > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {t("page.purchaseOrder.detail.paid")}
                    </span>
                    <span className="font-medium text-green-600">
                      Rp {Number(totalPaid).toLocaleString("id-ID")}
                    </span>
                  </div>
                )}
                {remaining > 0 && (
                  <div className="flex justify-between text-sm border-t border-border pt-3">
                    <span className="text-muted-foreground font-medium">
                      {t("page.purchaseOrder.detail.remaining")}
                    </span>
                    <span className="font-bold text-red-500">
                      Rp {Number(remaining).toLocaleString("id-ID")}
                    </span>
                  </div>
                )}
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-foreground">
                  {t("page.purchaseOrder.detail.payment")}
                </h3>
                {remaining > 0 && (
                  <Button size="sm" variant="outline" onClick={() => setPaymentModalOpen(true)}>
                    <Plus size={14} className="mr-1" />
                    {t("page.purchaseOrder.detail.pay")}
                  </Button>
                )}
              </div>
              {payments.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  {t("page.purchaseOrder.detail.noPayment")}
                </p>
              ) : (
                <div className="overflow-x-auto max-h-64 overflow-y-auto">
                  <table className="w-full text-sm text-center">
                    <thead className="text-muted-foreground text-xs sticky top-0 bg-background">
                      <tr className="border-b border-border">
                        <th className="py-2 px-2 font-medium">
                          {t("page.purchaseOrder.detail.date")}
                        </th>
                        <th className="py-2 px-2 font-medium">
                          {t("page.purchaseOrder.detail.method")}
                        </th>
                        <th className="py-2 px-2 font-medium">
                          {t("page.purchaseOrder.detail.amount")}
                        </th>
                        <th className="py-2 px-2 font-medium">
                          {t("page.purchaseOrder.detail.reference")}
                        </th>
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
                          <td className="py-2.5 px-2 text-muted-foreground">
                            {p.reference || "-"}
                          </td>
                          <td className="py-2.5 px-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-destructive"
                              onClick={() => {
                                setPaymentToDelete(p);
                                setDeleteModalOpen(true);
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
              <h3 className="text-sm font-semibold text-foreground mb-4">
                {t("page.purchaseOrder.detail.system")}
              </h3>
              <table className="w-full text-sm">
                <tbody className="divide-y divide-border">
                  <tr>
                    <td className="py-2 text-muted-foreground">
                      {t("page.purchaseOrder.detail.created")}
                    </td>
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
                    <td className="py-2 text-muted-foreground">
                      {t("page.purchaseOrder.detail.updated")}
                    </td>
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
          open={deleteModalOpen}
          onOpenChange={setDeleteModalOpen}
          type="confirm"
          title={t("page.purchaseOrder.detail.deletePaymentTitle")}
          description={t("page.purchaseOrder.detail.deletePaymentDesc", {
            amount: Number(paymentToDelete?.amount || 0).toLocaleString("id-ID")
          })}
          confirmText={t("page.purchaseOrder.detail.deletePaymentConfirm")}
          confirmVariant="destructive"
          onConfirm={() => {
            if (paymentToDelete) deletePaymentMutation.mutate(paymentToDelete.id);
          }}
        />

        <Modal
          open={paymentModalOpen}
          onOpenChange={setPaymentModalOpen}
          type="form"
          title={t("page.purchaseOrder.detail.recordPaymentTitle")}
          confirmText={t("common.save")}
          onConfirm={handleRecordPayment}>
          <div className="space-y-5">
            {remaining > 0 && (
              <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800/40 rounded-lg px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-orange-700 dark:text-orange-400">
                  <Wallet size={18} />
                  <span>{t("page.purchaseOrder.detail.remainingBill")}</span>
                </div>
                <span className="font-bold text-orange-700 dark:text-orange-400">
                  Rp {Number(remaining).toLocaleString("id-ID")}
                </span>
              </div>
            )}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                {t("page.purchaseOrder.detail.paymentAmount")}{" "}
                <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">
                  Rp
                </span>
                <Input
                  type="text"
                  inputMode="numeric"
                  placeholder="0"
                  value={
                    paymentForm.amount ? Number(paymentForm.amount).toLocaleString("id-ID") : ""
                  }
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
                <Label className="text-sm font-medium">
                  {t("page.purchaseOrder.detail.paymentDate")}
                </Label>
                <DatePicker
                  date={paymentForm.paymentDate}
                  setDate={(date) => setPaymentForm({ ...paymentForm, paymentDate: date })}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  {t("page.purchaseOrder.detail.paymentMethod")}
                </Label>
                <Select
                  value={paymentForm.paymentMethod}
                  onValueChange={(value) =>
                    setPaymentForm({ ...paymentForm, paymentMethod: value })
                  }>
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="z-[70]">
                    <SelectItem value="cash">
                      {t("page.purchaseOrder.paymentMethod.cash")}
                    </SelectItem>
                    <SelectItem value="transfer">
                      {t("page.purchaseOrder.paymentMethod.transfer")}
                    </SelectItem>
                    <SelectItem value="giro">
                      {t("page.purchaseOrder.paymentMethod.giro")}
                    </SelectItem>
                    <SelectItem value="other">
                      {t("page.purchaseOrder.paymentMethod.other")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <hr className="border-t border-border" />
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  {t("page.purchaseOrder.detail.reference")}
                </Label>
                <Input
                  placeholder={t("page.purchaseOrder.detail.referencePlaceholder")}
                  value={paymentForm.reference}
                  onChange={(e) => setPaymentForm({ ...paymentForm, reference: e.target.value })}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  {t("page.purchaseOrder.detail.notes")}
                </Label>
                <Input
                  placeholder={t("page.purchaseOrder.detail.notesPlaceholder")}
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                  className="h-11"
                />
              </div>
            </div>
          </div>
        </Modal>
      </div>
    </>
  );
};

export default DetailPurchaseOrder;
