import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getPurchaseOrderById } from "../../services/purchase-order";
import { getPaymentsByPO, deletePayment } from "../../services/purchase-payment";
import { getReturnsByPO } from "../../services/purchase-return";
import { format } from "date-fns";
// import { id } from "date-fns/locale";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "../../components/ui/dialog";
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
  Hash,
  Trash2,
  CheckCircle2,
  XCircle
} from "lucide-react";

export default function DetailPurchaseOrder() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();

  const [po, setPo] = useState(null);
  const [payments, setPayments] = useState([]);
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState(null);

  const totalAmount = po?.purchaseOrderItems?.reduce(
    (sum, item) => sum + Number(item.totalPrice || 0),
    0
  );
  const discount = po?.purchaseOrderItems?.reduce(
    (sum, item) => sum + Number(item.discount || 0),
    0
  );
  const finalAmount = totalAmount - discount;
  const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const remaining = finalAmount - totalPaid;

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!po) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-muted-foreground">{t("page.purchaseOrder.detail.notFound")}</p>
        <Button variant="outline" onClick={() => navigate("/purchase-orders")}>
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
          <Link
            to="/purchase-orders"
            className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-foreground">
              {po.name || `PO-${po.invoiceNumber || po.id}`}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t("page.purchaseOrder.detail.created")}:{" "}
              {po.createdAt
                ? format(new Date(po.createdAt), "dd MMM yyyy, HH:mm", {
                    locale: id
                  })
                : "-"}
            </p>
          </div>
        </div>
        {(() => {
          const st = statusMap[po.status] || statusMap.pending;
          const StatusIcon =
            po.status === "received" ? CheckCircle2 : po.status === "cancelled" ? XCircle : Clock;
          return (
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${st.class}`}>
              <StatusIcon size={14} />
              {st.label}
            </span>
          );
        })()}
      </div>

      {/* Two-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Info, Items, Payment, Returns */}
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
                <span className="font-medium">{po.supplier?.name || "-"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <User size={14} className="text-muted-foreground shrink-0" />
                <span className="text-muted-foreground">
                  {t("page.purchaseOrder.detail.warehouse")}:
                </span>
                <span className="font-medium">{po.warehouse?.name || "-"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Store size={14} className="text-muted-foreground shrink-0" />
                <span className="text-muted-foreground">
                  {t("page.purchaseOrder.detail.createdBy")}:
                </span>
                <span className="font-medium">{po.createdByUser?.name || "-"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CalendarDays size={14} className="text-muted-foreground shrink-0" />
                <span className="text-muted-foreground">
                  {t("page.purchaseOrder.detail.date")}:
                </span>
                <span className="font-medium">
                  {po.orderDate ? format(new Date(po.orderDate), "dd MMM yyyy") : "-"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Hash size={14} className="text-muted-foreground shrink-0" />
                <span className="text-muted-foreground">
                  {t("page.purchaseOrder.detail.invoice")}:
                </span>
                <span className="font-medium">{po.invoiceNumber || "-"}</span>
              </div>
            </div>
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
                      {t("page.purchaseOrder.detail.discount")}
                    </th>
                    <th className="text-right py-3 px-4 font-medium">
                      {t("page.purchaseOrder.detail.total")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {po.purchaseOrderItems?.map((item) => (
                    <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div>
                            <p className="font-medium">
                              {item.product?.name || item.ingredient?.name || "-"}
                            </p>
                            {item.notes && (
                              <p className="text-xs text-muted-foreground">{item.notes}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-mono">
                        {item.qty || 0}
                        <span className="text-xs text-muted-foreground ml-1">
                          {item.product?.uom || item.ingredient?.uom || ""}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        Rp {Number(item.price || 0).toLocaleString("id-ID")}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {item.discount > 0 ? (
                          <span className="text-red-500">
                            - Rp {Number(item.discount).toLocaleString("id-ID")}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold">
                        Rp {Number(item.totalPrice || 0).toLocaleString("id-ID")}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-muted/30">
                    <td colSpan={4} className="py-3 px-4" />
                    <td className="py-3 px-4 text-right text-muted-foreground text-sm">
                      {t("page.purchaseOrder.detail.total")}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold">
                      Rp {Number(totalAmount).toLocaleString("id-ID")}
                    </td>
                  </tr>
                </tfoot>
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
              {remaining > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate(`/purchase-orders/${id}/pay`)}>
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
                          {payment.createdAt
                            ? format(new Date(payment.createdAt), "dd MMM yyyy, HH:mm", {
                                locale: id
                              })
                            : "-"}
                        </td>
                        <td className="py-3 px-4 capitalize">{payment.paymentMethod || "-"}</td>
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
              {po.status !== "draft" && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate(`/purchase-orders/${id}/return`)}>
                  <Plus size={14} className="mr-1" />
                  {t("page.purchaseOrder.detail.addReturn")}
                </Button>
              )}
            </div>
            {returns.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                {t("page.purchaseOrder.detail.noReturns")}
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
                        {t("page.purchaseOrder.detail.status")}
                      </th>
                      <th className="text-left py-3 px-4 font-medium">
                        {t("page.purchaseOrder.detail.returnedBy")}
                      </th>
                      <th className="text-right py-3 px-4 font-medium">
                        {t("page.purchaseOrder.detail.amount")}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {returns.map((r) => (
                      <tr
                        key={r.id}
                        className="hover:bg-muted/30 transition-colors cursor-pointer"
                        onClick={() => navigate(`/purchase-returns/${r.id}`)}>
                        <td className="py-3 px-4">
                          {r.createdAt
                            ? format(new Date(r.createdAt), "dd MMM yyyy, HH:mm", { locale: id })
                            : "-"}
                        </td>
                        <td className="py-3 px-4">
                          {(() => {
                            const returnStatusMap = {
                              pending:
                                "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
                              approved:
                                "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
                              rejected:
                                "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                            };
                            const cls = returnStatusMap[r.status] || returnStatusMap.pending;
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
                      ? format(new Date(po.createdAt), "dd MMM yyyy, HH:mm", {
                          locale: id
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
                      ? format(new Date(po.updatedAt), "dd MMM yyyy, HH:mm", {
                          locale: id
                        })
                      : "-"}
                  </td>
                </tr>
              </tbody>
            </table>
          </Card>
        </div>
      </div>

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
              {t("page.purchaseOrder.detail.deletePaymentCancel")}
            </Button>
            <Button variant="destructive" onClick={handleDeletePayment}>
              {t("page.purchaseOrder.detail.deletePaymentConfirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
