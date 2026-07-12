import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getPurchaseOrderById } from "../../services/purchase-order";
import { getPaymentsByPO, deletePayment, recordPayment } from "../../services/purchase-payment";
import { getReturnsByPO } from "../../services/purchase-return";
import { returnPurchaseOrder } from "../../services/purchase-order";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "../../components/ui/select";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "../../components/ui/dialog";
import { Skeleton } from "../../components/ui/skeleton";
import {
  ArrowLeft,
  FileText,
  ShoppingBag,
  Plus,
  Undo2,
  Clock,
  CreditCard,
  Receipt,
  Building2,
  User,
  Store,
  CalendarDays,
  Trash2,
  CheckCircle2,
  XCircle,
  Phone,
  Banknote,
  ShoppingCart
} from "lucide-react";

export default function DetailPurchaseOrder() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  const navigate = useNavigate();

  const [po, setPo] = useState(null);
  const [payments, setPayments] = useState([]);
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);

  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [payAmount, setPayAmount] = useState("");
  const [payMethod, setPayMethod] = useState("cash");
  const [payDate, setPayDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [payRef, setPayRef] = useState("");
  const [paySubmitting, setPaySubmitting] = useState(false);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState(null);

  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [returnItems, setReturnItems] = useState([]);
  const [returnReason, setReturnReason] = useState("");
  const [returnedByName, setReturnedByName] = useState("");
  const [returnSubmitting, setReturnSubmitting] = useState(false);

  const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const remaining = (po?.finalAmount || 0) - totalPaid;

  const statusMap = {
    draft: {
      label: t("page.purchaseOrder.status.draft"),
      class: "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
    },
    pending: {
      label: t("page.purchaseOrder.status.pending"),
      class: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
    },
    ordered: {
      label: t("page.purchaseOrder.status.ordered"),
      class: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
    },
    received: {
      label: t("page.purchaseOrder.status.received"),
      class: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
    },
    cancelled: {
      label: t("page.purchaseOrder.status.cancelled"),
      class: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [poRes, paymentRes, returnRes] = await Promise.all([
        getPurchaseOrderById(id),
        getPaymentsByPO(id),
        getReturnsByPO(id)
      ]);
      setPo(poRes.data);
      setPayments(paymentRes.data || []);
      setReturns(returnRes.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load purchase order");
    } finally {
      setLoading(false);
    }
  };

  const handleRecordPayment = async () => {
    if (!payAmount || Number(payAmount) <= 0) {
      return toast.error(t("page.purchaseOrder.detail.paymentAmountRequired"));
    }
    try {
      setPaySubmitting(true);
      await recordPayment({
        purchaseOrder: po.id,
        supplier: po.supplier,
        amount: Number(payAmount),
        paymentDate: payDate || new Date().toISOString(),
        paymentMethod: payMethod,
        reference: payRef || null
      });
      toast.success(t("page.purchaseOrder.detail.toast.paymentRecorded"));
      setPaymentModalOpen(false);
      setPayAmount("");
      setPayRef("");
      loadData();
    } catch (err) {
      toast.error(
        err.response?.data?.message || t("page.purchaseOrder.detail.toast.paymentRecordFailed")
      );
    } finally {
      setPaySubmitting(false);
    }
  };

  const handleDeletePayment = async () => {
    try {
      await deletePayment(paymentToDelete.id);
      toast.success(t("page.purchaseOrder.detail.paymentDeleted"));
      setDeleteModalOpen(false);
      setPaymentToDelete(null);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete payment");
    }
  };

  const openReturnModal = () => {
    setReturnItems(
      po.items.map((item) => ({
        id: item.ingredient || item.product,
        ingredient: item.ingredient,
        product: item.product,
        name: item.ingredientData?.name || item.productData?.nameProduct || item.ingredientName,
        maxQty: (item.quantity || 0) - (item.returnedQty || 0),
        qty: 0,
        unit: item.unit
      }))
    );
    setReturnReason("");
    setReturnedByName("");
    setReturnModalOpen(true);
  };

  const handleCreateReturn = async () => {
    const selected = returnItems.filter((i) => i.qty > 0);
    if (selected.length === 0) {
      return toast.error("Pilih minimal 1 item");
    }
    try {
      setReturnSubmitting(true);
      await returnPurchaseOrder(po.id, {
        items: selected.map((i) => ({
          productId: i.product,
          ingredient: i.ingredient,
          qty: Number(i.qty),
          unit: i.unit
        })),
        reason: returnReason || null,
        returnedBy: returnedByName || null
      });
      toast.success(t("page.purchaseOrder.detail.toast.returnSuccess"));
      setReturnModalOpen(false);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal membuat retur");
    } finally {
      setReturnSubmitting(false);
    }
  };

  if (!po && !loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-muted-foreground">{t("page.purchaseOrder.detail.notFound")}</p>
        <Button variant="outline" onClick={() => navigate("/purchase-order")}>
          <ArrowLeft size={16} className="mr-1" />
          {t("page.purchaseOrder.detail.back")}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={() => navigate("/purchase-order")}>
            <ArrowLeft size={16} />
          </Button>
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <ShoppingCart size={24} />
          </div>
          <div>
            {loading ? (
              <>
                <Skeleton className="h-7 w-48 mb-2" />
                <Skeleton className="h-4 w-64" />
              </>
            ) : (
              <>
                <h1 className="text-2xl font-bold">{po?.orderNumber || "-"}</h1>
                <p className="text-sm text-muted-foreground">Purchase Order Detail</p>
              </>
            )}
          </div>
        </div>
        {!loading &&
          po &&
          (() => {
            const st = statusMap[po.status] || statusMap.pending;
            const StatusIcon =
              po.status === "received"
                ? CheckCircle2
                : po.status === "cancelled"
                  ? XCircle
                  : Clock;
            return (
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${st.class}`}>
                <StatusIcon size={14} />
                {st.label}
              </span>
            );
          })()}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            <Card className="p-5 space-y-4">
              <Skeleton className="h-4 w-32" />
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Skeleton className="h-3 w-16" /><Skeleton className="h-4 w-32" /></div>
                <div className="space-y-2"><Skeleton className="h-3 w-16" /><Skeleton className="h-4 w-24" /></div>
                <div className="col-span-2 space-y-2"><Skeleton className="h-3 w-20" /><Skeleton className="h-4 w-48" /></div>
                <div className="space-y-2"><Skeleton className="h-3 w-16" /><Skeleton className="h-5 w-16 rounded-full" /></div>
              </div>
            </Card>
          </div>
          <div className="space-y-4">
            <Card className="p-5 space-y-3"><Skeleton className="h-4 w-24" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-3/4" /></Card>
            <Card className="p-5 space-y-3"><Skeleton className="h-4 w-24" /><Skeleton className="h-4 w-40" /></Card>
          </div>
        </div>
      ) : (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* PO Info Card */}
          <Card className="p-6">
            <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <FileText size={16} className="text-muted-foreground" />
              {t("page.purchaseOrder.detail.info")}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Building2 size={14} className="text-muted-foreground shrink-0" />
                <span className="text-muted-foreground">
                  {t("page.purchaseOrder.detail.supplier")}:
                </span>
                <span className="font-medium">{po.supplierData?.name || "-"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Store size={14} className="text-muted-foreground shrink-0" />
                <span className="text-muted-foreground">
                  {t("page.purchaseOrder.detail.store")}:
                </span>
                <span className="font-medium">{po.storeData?.name || "-"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <User size={14} className="text-muted-foreground shrink-0" />
                <span className="text-muted-foreground">{t("page.purchaseOrder.detail.pic")}:</span>
                <span className="font-medium">{po.picData?.fullName || "-"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <User size={14} className="text-muted-foreground shrink-0" />
                <span className="text-muted-foreground">
                  {t("page.purchaseOrder.detail.createdBy")}:
                </span>
                <span className="font-medium">{po.createdByUser?.fullName || "-"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CalendarDays size={14} className="text-muted-foreground shrink-0" />
                <span className="text-muted-foreground">
                  {t("page.purchaseOrder.detail.poDate")}:
                </span>
                <span className="font-medium">
                  {po.orderDate ? format(new Date(po.orderDate), "dd MMM yyyy") : "-"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CalendarDays size={14} className="text-muted-foreground shrink-0" />
                <span className="text-muted-foreground">
                  {t("page.purchaseOrder.detail.dueDate")}:
                </span>
                <span className="font-medium">
                  {po.dueDate ? format(new Date(po.dueDate), "dd MMM yyyy") : "-"}
                </span>
              </div>
              {po.supplierData?.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone size={14} className="text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground">Telp:</span>
                  <span className="font-medium">{po.supplierData.phone}</span>
                </div>
              )}
              {po.receivedDate && (
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 size={14} className="text-green-500 shrink-0" />
                  <span className="text-muted-foreground">
                    {t("page.purchaseOrder.detail.date")} Received:
                  </span>
                  <span className="font-medium">
                    {format(new Date(po.receivedDate), "dd MMM yyyy, HH:mm", { locale: localeId })}
                  </span>
                </div>
              )}
            </div>
            {po.notes && (
              <div className="mt-4 p-3 bg-muted/30 rounded-lg text-sm">
                <p className="text-muted-foreground mb-1">
                  {t("page.purchaseOrder.detail.notes")}:
                </p>
                <p className="whitespace-pre-wrap">{po.notes}</p>
              </div>
            )}
          </Card>

          {/* Items Card */}
          <Card className="p-6">
            <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <ShoppingBag size={16} className="text-muted-foreground" />
              {t("page.purchaseOrder.detail.items")}
            </h2>
            <div className="overflow-x-auto border border-border rounded-lg">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50 uppercase text-xs text-muted-foreground">
                    <th className="text-left py-3 px-4 font-medium">
                      {t("page.purchaseOrder.detail.product")}
                    </th>
                    <th className="text-right py-3 px-4 font-medium">
                      {t("page.purchaseOrder.detail.qty")}
                    </th>
                    <th className="text-right py-3 px-4 font-medium">
                      {t("page.purchaseOrder.detail.price")}
                    </th>
                    <th className="text-right py-3 px-4 font-medium">
                      {t("page.purchaseOrder.detail.total")}
                    </th>
                    <th className="text-right py-3 px-4 font-medium">
                      {t("page.purchaseOrder.detail.receivedCol")}
                    </th>
                    <th className="text-right py-3 px-4 font-medium">
                      {t("page.purchaseOrder.detail.returnedCol")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {po.items?.map((item) => (
                    <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4">
                        <p className="font-medium">
                          {item.ingredientData?.name ||
                            item.productData?.nameProduct ||
                            item.ingredientName ||
                            "-"}
                        </p>
                      </td>
                      <td className="py-3 px-4 text-right font-mono">
                        {item.quantity || 0}
                        <span className="text-xs text-muted-foreground ml-1">
                          {item.unit || ""}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        Rp {Number(item.price || 0).toLocaleString("id-ID")}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold">
                        Rp {Number(item.total || 0).toLocaleString("id-ID")}
                      </td>
                      <td className="py-3 px-4 text-right font-mono">
                        <span
                          className={
                            item.receivedQuantity >= item.quantity
                              ? "text-green-600"
                              : "text-yellow-600"
                          }>
                          {item.receivedQuantity || 0} / {item.quantity || 0}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono">
                        {item.returnedQty > 0 ? (
                          <span className="text-red-500">{item.returnedQty}</span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Payment Card */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <CreditCard size={16} className="text-muted-foreground" />
                {t("page.purchaseOrder.detail.payment")}
              </h2>
              {remaining > 0 && po.status !== "cancelled" && (
                <Button size="sm" variant="outline" onClick={() => setPaymentModalOpen(true)}>
                  <Banknote size={14} className="mr-1" />
                  {t("page.purchaseOrder.detail.pay")}
                </Button>
              )}
            </div>
            {payments.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                {t("page.purchaseOrder.detail.noPayment")}
              </p>
            ) : (
              <div className="overflow-x-auto max-h-64 overflow-y-auto border border-border rounded-lg">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50 uppercase text-xs text-muted-foreground">
                      <th className="text-left py-3 px-4 font-medium">
                        {t("page.purchaseOrder.detail.date")}
                      </th>
                      <th className="text-left py-3 px-4 font-medium">
                        {t("page.purchaseOrder.detail.paymentMethod")}
                      </th>
                      <th className="text-left py-3 px-4 font-medium">
                        {t("page.purchaseOrder.detail.reference")}
                      </th>
                      <th className="text-right py-3 px-4 font-medium">
                        {t("page.purchaseOrder.detail.amount")}
                      </th>
                      <th className="text-right py-3 px-4 font-medium w-10" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {payments.map((payment) => (
                      <tr key={payment.id} className="hover:bg-muted/30 transition-colors">
                        <td className="py-3 px-4">
                          {payment.paymentDate
                            ? format(new Date(payment.paymentDate), "dd MMM yyyy, HH:mm", {
                                locale: localeId
                              })
                            : "-"}
                        </td>
                        <td className="py-3 px-4 capitalize">{payment.paymentMethod || "-"}</td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {payment.reference || "-"}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold">
                          Rp {Number(payment.amount || 0).toLocaleString("id-ID")}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() => {
                              setPaymentToDelete(payment);
                              setDeleteModalOpen(true);
                            }}>
                            <Trash2 size={14} />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          {/* Returns Card */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Undo2 size={16} className="text-muted-foreground" />
                {t("page.purchaseOrder.detail.returns")}
              </h2>
              {po.status === "received" && (
                <Button size="sm" variant="outline" onClick={openReturnModal}>
                  <Plus size={14} className="mr-1" />
                  {t("page.purchaseOrder.detail.addReturn")}
                </Button>
              )}
            </div>
            {returns.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                {t("page.purchaseOrder.detail.noReturn")}
              </p>
            ) : (
              <div className="overflow-x-auto max-h-64 overflow-y-auto border border-border rounded-lg">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50 uppercase text-xs text-muted-foreground">
                      <th className="text-left py-3 px-4 font-medium">
                        {t("page.purchaseOrder.detail.returnNo")}
                      </th>
                      <th className="text-left py-3 px-4 font-medium">
                        {t("page.purchaseOrder.detail.date")}
                      </th>
                      <th className="text-left py-3 px-4 font-medium">
                        {t("page.purchaseOrder.detail.status")}
                      </th>
                      <th className="text-left py-3 px-4 font-medium">
                        {t("page.purchaseOrder.detail.returnedBy")}
                      </th>
                      <th className="text-right py-3 px-4 font-medium">
                        {t("page.purchaseOrder.detail.returnAmount")}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {returns.map((r) => (
                      <tr
                        key={r.id}
                        className="hover:bg-muted/30 transition-colors cursor-pointer"
                        onClick={() => navigate(`/purchase-return/detail?id=${r.id}`)}>
                        <td className="py-3 px-4 font-medium">{r.returnNumber || "-"}</td>
                        <td className="py-3 px-4">
                          {r.createdAt
                            ? format(new Date(r.createdAt), "dd MMM yyyy, HH:mm", {
                                locale: localeId
                              })
                            : "-"}
                        </td>
                        <td className="py-3 px-4">
                          {(() => {
                            const cls =
                              r.status === "approved"
                                ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                                : r.status === "rejected"
                                  ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                                  : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
                            return (
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cls}`}>
                                {r.status}
                              </span>
                            );
                          })()}
                        </td>
                        <td className="py-3 px-4">{r.returnedBy?.name || "-"}</td>
                        <td className="py-3 px-4 text-right font-mono">
                          Rp {Number(r.totalAmount || r.amount || 0).toLocaleString("id-ID")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        {/* Right Column: Summary & System */}
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <Receipt size={16} className="text-muted-foreground" />
              {t("page.purchaseOrder.detail.summary")}
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {t("page.purchaseOrder.detail.total")}
                </span>
                <span className="font-medium">
                  Rp {Number(po.totalAmount || 0).toLocaleString("id-ID")}
                </span>
              </div>
              {po.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {t("page.purchaseOrder.detail.discount")}
                  </span>
                  <span className="font-medium text-red-500">
                    - Rp {Number(po.discount).toLocaleString("id-ID")}
                  </span>
                </div>
              )}
              <div className="border-t border-border pt-3 flex justify-between text-sm font-bold">
                <span>{t("page.purchaseOrder.detail.grandTotal")}</span>
                <span>Rp {Number(po.finalAmount || 0).toLocaleString("id-ID")}</span>
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
              {remaining > 0 ? (
                <div className="flex justify-between text-sm border-t border-border pt-3">
                  <span className="text-muted-foreground font-medium">
                    {t("page.purchaseOrder.detail.remaining")}
                  </span>
                  <span className="font-bold text-red-500">
                    Rp {Number(remaining).toLocaleString("id-ID")}
                  </span>
                </div>
              ) : totalPaid > 0 ? (
                <div className="flex justify-between text-sm border-t border-border pt-3">
                  <span className="text-muted-foreground font-medium">
                    {t("page.purchaseOrder.detail.paid")}
                  </span>
                  <span className="font-bold text-green-600">
                    {t("page.purchaseOrder.detail.paid")}
                  </span>
                </div>
              ) : null}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <Clock size={16} className="text-muted-foreground" />
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
                      ? format(new Date(po.createdAt), "dd MMM yyyy, HH:mm", { locale: localeId })
                      : "-"}
                  </td>
                </tr>
                <tr>
                  <td className="py-2 text-muted-foreground">
                    {t("page.purchaseOrder.detail.updated")}
                  </td>
                  <td className="py-2 text-right">
                    {po.updatedAt
                      ? format(new Date(po.updatedAt), "dd MMM yyyy, HH:mm", { locale: localeId })
                      : "-"}
                  </td>
                </tr>
                {po.receivedDate && (
                  <tr>
                    <td className="py-2 text-muted-foreground">
                      {t("page.purchaseOrder.detail.receivedCol")}
                    </td>
                    <td className="py-2 text-right">
                      {format(new Date(po.receivedDate), "dd MMM yyyy, HH:mm", {
                        locale: localeId
                      })}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </Card>
        </div>
      </div>
      )}

      {/* Payment Modal */}
      <Dialog open={paymentModalOpen} onOpenChange={setPaymentModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("page.purchaseOrder.detail.recordPaymentTitle")}</DialogTitle>
            <DialogDescription>
              {t("page.purchaseOrder.detail.remainingBill")}: Rp{" "}
              {Number(remaining).toLocaleString("id-ID")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>{t("page.purchaseOrder.detail.paymentAmount")}</Label>
              <Input
                type="number"
                min={1}
                max={remaining}
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
                placeholder="Rp"
              />
            </div>
            <div className="space-y-2">
              <Label>{t("page.purchaseOrder.detail.paymentMethod")}</Label>
              <Select value={payMethod} onValueChange={setPayMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="transfer">Transfer</SelectItem>
                  <SelectItem value="credit_card">Credit Card</SelectItem>
                  <SelectItem value="debit_card">Debit Card</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t("page.purchaseOrder.detail.paymentDate")}</Label>
              <Input type="date" value={payDate} onChange={(e) => setPayDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>{t("page.purchaseOrder.detail.reference")}</Label>
              <Input
                value={payRef}
                onChange={(e) => setPayRef(e.target.value)}
                placeholder={t("page.purchaseOrder.detail.referencePlaceholder")}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentModalOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button onClick={handleRecordPayment} disabled={paySubmitting}>
              {paySubmitting ? "..." : t("page.purchaseOrder.detail.pay")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Payment Confirmation */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("page.purchaseOrder.detail.deletePaymentTitle")}</DialogTitle>
            <DialogDescription>
              {t("page.purchaseOrder.detail.deletePaymentDesc", {
                amount: Number(paymentToDelete?.amount || 0).toLocaleString("id-ID")
              })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button variant="destructive" onClick={handleDeletePayment}>
              {t("page.purchaseOrder.detail.deletePaymentConfirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Return Modal */}
      <Dialog open={returnModalOpen} onOpenChange={setReturnModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("page.purchaseOrder.detail.returModalTitle")}</DialogTitle>
            <DialogDescription>{t("page.purchaseOrder.detail.returnAmount")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto py-2">
            {returnItems.map(
              (item, idx) =>
                item.maxQty > 0 && (
                  <div
                    key={item.id || idx}
                    className="flex items-center gap-3 p-3 border border-border rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Max: {item.maxQty} {item.unit}
                      </p>
                    </div>
                    <Input
                      type="number"
                      min={0}
                      max={item.maxQty}
                      value={item.qty || ""}
                      onChange={(e) => {
                        const val = Math.min(Math.max(0, Number(e.target.value)), item.maxQty);
                        const next = [...returnItems];
                        next[idx].qty = val;
                        setReturnItems(next);
                      }}
                      className="w-20 text-right"
                      placeholder="0"
                    />
                  </div>
                )
            )}
            {returnItems.every((i) => i.maxQty <= 0) && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Semua item sudah diretur maksimal
              </p>
            )}
            <div className="space-y-2">
              <Label>{t("page.purchaseOrder.detail.notes")}</Label>
              <Input
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                placeholder="Alasan retur"
              />
            </div>
            <div className="space-y-2">
              <Label>{t("page.purchaseOrder.detail.returnedBy")}</Label>
              <Input
                value={returnedByName}
                onChange={(e) => setReturnedByName(e.target.value)}
                placeholder="Nama pengembali"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReturnModalOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button onClick={handleCreateReturn} disabled={returnSubmitting}>
              {returnSubmitting ? "..." : t("page.purchaseOrder.detail.addReturn")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
