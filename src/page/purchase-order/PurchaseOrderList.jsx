/* eslint-disable react/prop-types */
import React, { useState, useEffect } from "react";
import { useGlobalStoreFilter } from "@/hooks/useGlobalStoreFilter";
import { createPortal } from "react-dom";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { toast } from "sonner";
import {
  Plus,
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Undo2,
  Eye,
  Wallet,
  Upload,
  Download,
  ShoppingCart,
  CheckCircle,
  ClipboardList,
  FileEdit,
  CircleDollarSign,
  Ban,
  Trash2,
  ChevronRight,
  X,
  Send
} from "lucide-react";
import { useTranslation } from "react-i18next";
import UploadExcelModal from "@/components/organism/UploadExcelModal";
import StatCard from "@/components/ui/StatCard";
import { canAccess } from "@/utils/permission";
import {
  getAllPurchaseOrder,
  getPurchaseOrderById,
  cancelPurchaseOrder,
  deletePurchaseOrder,
  returnPurchaseOrder,
  sendToSupplierPurchaseOrder,
  uploadPurchaseOrderExcel,
  downloadPurchaseOrderExcel
} from "@/services/purchase-order";
import { getAllLocation } from "@/services/location";
import NoStore from "@/components/ui/NoStore";
import { recordPayment } from "@/services/purchase-payment";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Combobox } from "@/components/ui/combobox";
import { SearchInput } from "@/components/ui/SearchInput";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import StoreFilter from "@/components/ui/StoreFilter";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import DataTable from "@/components/ui/DataTable";
import { TipsCard } from "@/components/ui/tips-card";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import AbortController from "@/components/organism/abort-controller";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const IconAction = ({ label, children, ...props }) => (
  <Tooltip delayDuration={0}>
    <TooltipTrigger asChild>
      <Button {...props}>{children}</Button>
    </TooltipTrigger>
    <TooltipContent side="top">{label}</TooltipContent>
  </Tooltip>
);

const SupplierExpandableRow = ({ supplier, renderSupplierItems }) => {
  const [open, setOpen] = useState(false);
  const total = supplier.items.reduce((sum, it) => sum + (it.quantity || 0) * (it.price || 0), 0);
  return (
    <div className="border border-border rounded-xl overflow-hidden bg-card shadow-sm hover:shadow-md transition-shadow">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-5 py-3 text-sm text-foreground hover:bg-accent/20 transition-colors text-left group">
        <div
          className={cn(
            "flex items-center justify-center w-7 h-7 rounded-lg shrink-0 transition-colors",
            open
              ? "bg-primary text-primary-foreground"
              : "bg-primary/10 text-primary group-hover:bg-primary/20"
          )}>
          <ChevronRight
            size={14}
            className={cn("transition-transform duration-200", open && "rotate-90")}
          />
        </div>
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white shrink-0">
            <Package size={14} />
          </div>
          <div className="min-w-0">
            <span className="font-semibold text-foreground">{supplier.supplierName}</span>
            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
              {supplier.items.length} {supplier.items.length > 1 ? "items" : "item"}
            </span>
          </div>
        </div>
        <div className="text-right shrink-0">
          <span className="text-xs text-muted-foreground">Total</span>
          <div className="text-sm font-semibold text-foreground font-mono">
            Rp {total.toLocaleString("id-ID")}
          </div>
        </div>
      </button>
      {open && <div className="px-5 pb-4">{renderSupplierItems(supplier.items)}</div>}
    </div>
  );
};

const PurchaseOrderList = () => {
  const { t } = useTranslation();

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
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [cookie] = useCookies();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [storeFilter, setGlobalStoreFilter] = useGlobalStoreFilter();
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState(undefined);
  const [showFilters, setShowFilters] = useState(false);
  const [returModal, setReturModal] = useState(false);
  const [returPo, setReturPo] = useState(null);
  const [returReason, setReturReason] = useState("");
  const [returItems, setReturItems] = useState([]);
  const [importModal, setImportModal] = useState(false);
  const [payModal, setPayModal] = useState(false);
  const [cancelModal, setCancelModal] = useState(false);
  const [cancelPoId, setCancelPoId] = useState(null);
  const [sendModal, setSendModal] = useState(false);
  const [sendPoId, setSendPoId] = useState(null);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deletePoId, setDeletePoId] = useState(null);
  const [payPo, setPayPo] = useState(null);
  const [payForm, setPayForm] = useState({
    amount: "",
    paymentDate: undefined,
    paymentMethod: "cash",
    reference: "",
    notes: ""
  });

  const payMutation = useMutation(recordPayment, {
    onSuccess: () => {
      toast.success(t("page.purchaseOrder.detail.toast.paymentRecorded"));
      queryClient.invalidateQueries(["purchase-orders"]);
      setPayModal(false);
      setPayPo(null);
      setPayForm({
        amount: "",
        paymentDate: undefined,
        paymentMethod: "cash",
        reference: "",
        notes: ""
      });
    },
    onError: (err) => {
      toast.error(t("page.purchaseOrder.detail.toast.paymentRecordFailed"), {
        description: err?.response?.data?.message || err.message
      });
    }
  });

  const { data: poDetail, isLoading: loadingReturPo } = useQuery(
    ["po-detail", returPo?.id],
    () => getPurchaseOrderById(returPo.id),
    { enabled: !!returPo }
  );

  useEffect(() => {
    if (poDetail?.data?.items) {
      setReturItems(
        poDetail.data.items.map((item) => ({
          ...item,
          returnQty: 0,
          notes: ""
        }))
      );
    }
  }, [poDetail]);

  const user = cookie?.user;
  const MENU_KEY = "/purchase-order";
  const isSuperAdmin = user?.roleType === "super_admin";
  const locationParam = storeFilter !== "all" ? storeFilter : isSuperAdmin ? "" : user?.store || "";

  const { data: locData } = useQuery(["locations-purchase-orders"], () => getAllLocation(), {
    enabled: isSuperAdmin
  });

  const { data, isLoading, isFetching, isError, refetch } = useQuery(
    ["purchase-orders", page, limit, search, storeFilter, statusFilter],
    () =>
      getAllPurchaseOrder({ location: locationParam, page, limit, search, status: statusFilter }),
    { keepPreviousData: true }
  );

  const returnMutation = useMutation(
    ({ po, reason, items }) =>
      returnPurchaseOrder(po.id, {
        reason,
        items,
        returnedBy: user?.id
      }),
    {
      onSuccess: () => {
        toast.success(t("common.success"), {
          description: t("page.purchaseOrder.detail.toast.returnSuccess")
        });
        queryClient.invalidateQueries(["purchase-orders"]);
        setReturModal(false);
        setReturPo(null);
        setReturReason("");
        setReturItems([]);
      },
      onError: (err) => {
        toast.error(t("common.failed"), {
          description: err?.response?.data?.message || err.message
        });
      }
    }
  );

  const cancelMutation = useMutation(cancelPurchaseOrder, {
    onSuccess: () => {
      toast.success(t("common.success"));
      queryClient.invalidateQueries(["purchase-orders"]);
      setCancelModal(false);
      setCancelPoId(null);
    },
    onError: (err) => {
      toast.error(t("common.failed"), {
        description: err?.response?.data?.message || err.message
      });
    }
  });

  const sendMutation = useMutation(sendToSupplierPurchaseOrder, {
    onSuccess: () => {
      toast.success(t("page.purchaseOrder.list.sendSuccess"));
      queryClient.invalidateQueries(["purchase-orders"]);
      setSendModal(false);
      setSendPoId(null);
    },
    onError: (err) => {
      toast.error(t("common.failed"), {
        description: err?.response?.data?.message || err.message
      });
    }
  });

  const deleteMutation = useMutation(deletePurchaseOrder, {
    onSuccess: () => {
      toast.success(t("common.success"));
      queryClient.invalidateQueries(["purchase-orders"]);
      setDeleteModal(false);
      setDeletePoId(null);
    },
    onError: (err) => {
      toast.error(t("common.failed"), {
        description: err?.response?.data?.message || err.message
      });
    }
  });

  const orders = data?.data || [];
  const pagination = data?.pagination || {};

  const renderSupplierItems = (items) => {
    if (items.length === 0) return null;
    const grandTotal = items.reduce((sum, it) => sum + (it.quantity || 0) * (it.price || 0), 0);
    return (
      <div className="rounded-xl border border-border">
        <table className="w-full text-sm table-fixed">
          <colgroup>
            <col className="w-[44%]" />
            <col className="w-[12%]" />
            <col className="w-[12%]" />
            <col className="w-[16%]" />
            <col className="w-[16%]" />
          </colgroup>
          <thead>
            <tr className="bg-gradient-to-r from-slate-50 to-blue-50/30 dark:from-slate-900 dark:to-blue-950/20">
              <th className="text-left px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Item
              </th>
              <th className="text-center px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Qty
              </th>
              <th className="text-center px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Satuan
              </th>
              <th className="text-right px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Harga
              </th>
              <th className="text-right px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Subtotal
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {items.map((it, i) => {
              const subtotal = (it.quantity || 0) * (it.price || 0);
              return (
                <tr
                  key={it.id || i}
                  className={cn(
                    "transition-colors",
                    i % 2 === 0
                      ? "bg-white dark:bg-slate-950"
                      : "bg-slate-50/50 dark:bg-slate-900/50",
                    "hover:bg-blue-50/50 dark:hover:bg-blue-950/20"
                  )}>
                  <td
                    className="px-4 py-2.5 font-medium text-foreground truncate"
                    title={it.ingredientName || "-"}>
                    {it.ingredientName || "-"}
                  </td>
                  <td className="px-4 py-2.5 text-center font-medium text-foreground">
                    {it.quantity || 0}
                  </td>
                  <td className="px-4 py-2.5 text-center text-muted-foreground">
                    {it.unit || "pcs"}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono text-muted-foreground">
                    Rp {Number(it.price).toLocaleString("id-ID")}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono font-semibold text-foreground">
                    Rp {Number(subtotal).toLocaleString("id-ID")}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="bg-gradient-to-r from-slate-100 to-blue-50/40 dark:from-slate-800 dark:to-blue-950/30 border-t-2 border-border">
              <td
                colSpan={4}
                className="px-4 py-2.5 text-right text-sm font-semibold text-foreground">
                Grand Total
              </td>
              <td className="px-4 py-2.5 text-right font-mono text-sm font-bold text-foreground">
                Rp {Number(grandTotal).toLocaleString("id-ID")}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    );
  };

  const handleDownloadExcel = async () => {
    try {
      await downloadPurchaseOrderExcel();
      toast.success(t("page.purchaseOrder.detail.toast.excelDownloaded"));
    } catch (err) {
      toast.error(t("page.purchaseOrder.detail.toast.excelDownloadFailed"), {
        description: err?.response?.data?.message || err.message
      });
    }
  };

  const total = pagination?.total || pagination?.totalItems || data?.total || 0;
  const totalPages = pagination?.totalPages || Math.ceil(total / limit) || 1;

  const columns = [
    {
      header: t("page.purchaseOrder.list.columns.poNumber"),
      width: 150,
      stickyLeft: true,
      stickyLeftOffset: 40,
      render: (po) => (
        <span
          className="font-medium text-foreground truncate block"
          title={po.orderNumber || `PO-${po.id}`}>
          {po.orderNumber || `PO-${po.id}`}
        </span>
      )
    },
    {
      header: t("page.purchaseOrder.list.columns.supplier"),
      width: 200,
      render: (po) => (
        <div className="truncate" title={po.supplierNames || "-"}>
          <span className="font-medium">{po.supplierNames || "-"}</span>
        </div>
      )
    },
    {
      header: t("page.purchaseOrder.list.columns.pic"),
      width: 130,
      render: (po) => (
        <span className="truncate block" title={po.picData?.fullName || "-"}>
          {po.picData?.fullName || "-"}
        </span>
      )
    },
    {
      header: t("page.purchaseOrder.list.columns.poDate"),
      render: (po) => (
        <span className="text-muted-foreground">
          {po.orderDate
            ? new Date(po.orderDate).toLocaleDateString("id-ID", {
                year: "numeric",
                month: "short",
                day: "numeric"
              })
            : "-"}
        </span>
      )
    },
    {
      header: t("page.purchaseOrder.list.columns.dueDate"),
      render: (po) => {
        if (!po.dueDate) return <span className="text-muted-foreground">-</span>;
        const due = new Date(po.dueDate);
        const today = new Date(new Date().toDateString());
        const diffDays = Math.ceil((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
        const isOverdue = po.status !== "received" && po.status !== "cancelled" && diffDays > 0;
        return (
          <div className="flex items-center gap-2">
            <span className={isOverdue ? "text-red-600 font-medium" : "text-muted-foreground"}>
              {due.toLocaleDateString("id-ID", {
                year: "numeric",
                month: "short",
                day: "numeric"
              })}
            </span>
            {isOverdue && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                +{diffDays} {t("page.purchaseOrder.list.overdueDays")}
              </span>
            )}
          </div>
        );
      }
    },
    {
      header: t("page.purchaseOrder.list.columns.store"),
      render: (po) => <span className="text-sm">{po.storeData?.name || "-"}</span>
    },
    {
      header: t("page.purchaseOrder.list.columns.paymentMethod"),
      render: (po) => {
        const isCredit = po.paymentMethod === "credit";
        const dpAmount = isCredit
          ? (Number(po.dpPercent || 0) / 100) * Number(po.finalAmount || po.totalAmount || 0)
          : 0;
        const dpPaid = isCredit ? (po.totalPaid || 0) >= dpAmount : false;
        return (
          <div className="flex flex-col gap-0.5">
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium w-fit ${
                isCredit
                  ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                  : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              }`}>
              {isCredit ? "Kredit" : "Tunai"}
            </span>
            {isCredit && (
              <span className="text-[10px] text-muted-foreground">
                DP {po.dpPercent}%{dpPaid ? " (lunas)" : ""}
              </span>
            )}
          </div>
        );
      }
    },
    {
      header: t("page.purchaseOrder.list.columns.total"),
      align: "right",
      render: (po) => (
        <span className="font-medium">
          {po.finalAmount || po.totalAmount
            ? `Rp ${Number(po.finalAmount || po.totalAmount).toLocaleString("id-ID")}`
            : "-"}
        </span>
      )
    },
    {
      header: t("page.purchaseOrder.list.columns.payment"),
      align: "center",
      render: (po) => {
        const total = po.finalAmount || po.totalAmount || 0;
        const paid = po.totalPaid || 0;
        const remaining = total - paid;
        if (total === 0) return <span className="text-xs text-muted-foreground">-</span>;
        if (paid >= total) {
          return (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
              {t("page.purchaseOrder.list.paymentStatus.paid")}
            </span>
          );
        }
        if (paid > 0) {
          return (
            <div className="flex flex-col items-center gap-0.5">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                {t("page.purchaseOrder.list.paymentStatus.partial")}
              </span>
              <span className="text-xs text-muted-foreground">
                Rp {Number(remaining).toLocaleString("id-ID")}
              </span>
            </div>
          );
        }
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
            {t("page.purchaseOrder.list.paymentStatus.unpaid")}
          </span>
        );
      }
    },
    {
      header: t("page.purchaseOrder.list.columns.notes"),
      width: 150,
      render: (po) => (
        <span className="text-muted-foreground text-xs truncate block" title={po.notes || ""}>
          {po.notes || "-"}
        </span>
      )
    },
    {
      header: t("page.purchaseOrder.list.columns.status"),
      render: (po) => {
        const st = statusMap[po.status] || statusMap.pending;
        return (
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
        );
      }
    },
    {
      header: t("common.createdBy"),
      render: (item) => (
        <span className="text-sm text-muted-foreground">
          {item.createdByUser?.fullName || item.createdByUser?.userName || item.createdBy || "-"}
        </span>
      )
    },
    {
      header: t("common.createdAt"),
      render: (po) => {
        if (!po.createdAt) return <span className="text-sm text-muted-foreground">-</span>;
        const d = new Date(po.createdAt);
        if (isNaN(d.getTime())) return <span className="text-sm text-muted-foreground">-</span>;
        return (
          <span className="text-sm font-mono text-muted-foreground">
            {d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}{" "}
            {d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
          </span>
        );
      }
    },
    {
      header: t("common.modifiedBy"),
      render: (item) => (
        <span className="text-sm text-muted-foreground">
          {item.modifiedByUser?.fullName || item.modifiedByUser?.userName || item.modifiedBy || "-"}
        </span>
      )
    },
    {
      header: t("common.updatedAt"),
      render: (po) => {
        if (!po.updatedAt) return <span className="text-sm text-muted-foreground">-</span>;
        const d = new Date(po.updatedAt);
        if (isNaN(d.getTime())) return <span className="text-sm text-muted-foreground">-</span>;
        return (
          <span className="text-sm font-mono text-muted-foreground">
            {d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}{" "}
            {d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
          </span>
        );
      }
    },
    {
      header: t("page.purchaseOrder.list.columns.actions"),
      align: "right",
      stickyRight: true,
      render: (po) => (
        <div className="flex items-center justify-end gap-1">
          <IconAction
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground"
            onClick={() => navigate(`/purchase-order/detail?id=${po.id}`)}
            label={t("page.purchaseOrder.list.action.detail")}>
            <Eye size={18} />
          </IconAction>
          {po.status !== "cancelled" &&
            po.status !== "draft" &&
            (po.totalPaid || 0) < (po.finalAmount || po.totalAmount || 0) &&
            (po.paymentMethod === "credit" &&
            (po.totalPaid || 0) <
              (Number(po.dpPercent || 0) / 100) * Number(po.finalAmount || po.totalAmount || 0) ? (
              <IconAction
                variant="default"
                size="sm"
                className="h-8 gap-1.5 bg-purple-600 hover:bg-purple-700 text-white"
                onClick={() => {
                  setPayPo(po);
                  setPayForm({
                    amount: String(
                      (Number(po.dpPercent || 0) / 100) *
                        Number(po.finalAmount || po.totalAmount || 0) -
                        (po.totalPaid || 0)
                    ),
                    paymentDate: undefined,
                    paymentMethod: "cash",
                    reference: "",
                    notes: ""
                  });
                  setPayModal(true);
                }}
                label={t("page.purchaseOrder.list.action.payDP")}>
                <Wallet size={16} />
                <span className="text-xs font-semibold">DP</span>
              </IconAction>
            ) : (
              <IconAction
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-green-600"
                onClick={() => {
                  setPayPo(po);
                  const remaining =
                    Number(po.finalAmount || po.totalAmount || 0) - (po.totalPaid || 0);
                  setPayForm({
                    amount: String(remaining),
                    paymentDate: undefined,
                    paymentMethod: "cash",
                    reference: "",
                    notes: ""
                  });
                  setPayModal(true);
                }}
                label={t("page.purchaseOrder.list.action.pay")}>
                <Wallet size={18} />
              </IconAction>
            ))}
          {po.status === "draft" && (
            <IconAction
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-blue-600"
              onClick={() => navigate(`/edit-purchase-order?id=${po.id}`)}
              label={t("page.purchaseOrder.list.action.edit")}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round">
                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                <path d="m15 5 4 4" />
              </svg>
            </IconAction>
          )}
          {(po.status === "draft" || po.status === "pending") && (
            <IconAction
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-red-600"
              onClick={() => {
                setCancelPoId(po.id);
                setCancelModal(true);
              }}
              label={t("page.purchaseOrder.list.action.cancel")}>
              <XCircle size={18} />
            </IconAction>
          )}
          {(po.status === "draft" || po.status === "cancelled") && (
            <IconAction
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-red-600"
              onClick={() => {
                setDeletePoId(po.id);
                setDeleteModal(true);
              }}
              label={t("page.purchaseOrder.list.action.delete")}>
              <Trash2 size={18} />
            </IconAction>
          )}
          {po.status === "pending" && (
            <>
              <IconAction
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-amber-600"
                onClick={() => {
                  setSendPoId(po.id);
                  setSendModal(true);
                }}
                label={t("page.purchaseOrder.list.action.sendToSupplier")}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round">
                  <path d="M22 2 11 13" />
                  <path d="m22 2-7 20-4-9-9-4Z" />
                </svg>
              </IconAction>
              <IconAction
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-blue-600"
                onClick={() => navigate(`/edit-purchase-order?id=${po.id}`)}
                label={t("page.purchaseOrder.list.action.edit")}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round">
                  <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                  <path d="m15 5 4 4" />
                </svg>
              </IconAction>
              <IconAction
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-green-600"
                onClick={() => navigate(`/add-goods-receipt?poId=${po.id}`)}
                label={t("page.purchaseOrder.list.action.receive")}>
                <RefreshCw size={18} />
              </IconAction>
            </>
          )}
          {(po.status === "ordered" || po.status === "received") && (
            <IconAction
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-amber-600"
              onClick={() => {
                setReturPo(po);
                setReturReason("");
                setReturModal(true);
              }}
              label={t("page.purchaseOrder.list.action.return")}>
              <Undo2 size={18} />
            </IconAction>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <button
            onClick={() => navigate("/dashboard-super-admin")}
            className="hover:text-foreground transition-colors">
            {t("breadcrumb.home")}
          </button>
          <span className="text-xs">/</span>
          <span className="text-primary font-semibold">{t("page.purchaseOrder.list.title")}</span>
        </nav>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {t("page.purchaseOrder.list.title")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("page.purchaseOrder.list.description")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={handleDownloadExcel}>
            <Download size={14} />
            {t("page.purchaseOrder.list.export")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => setImportModal(true)}>
            <Upload size={14} />
            {t("page.purchaseOrder.list.import")}
          </Button>
          {canAccess(user, MENU_KEY, "add") && (
            <Button onClick={() => navigate("/add-purchase-order")} className="gap-2">
              <Plus size={18} />
              {t("breadcrumb.add")}
            </Button>
          )}
        </div>
      </div>

      {locData && (locData?.data || []).length === 0 ? (
        <NoStore />
      ) : (
        <>
          <div className="space-y-6">
            <h3>Status Order :</h3>
            {isFetching || isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-card rounded-xl border border-border p-4">
                    <div className="flex items-start justify-between mb-3">
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-4 w-4 rounded" />
                    </div>
                    <Skeleton className="h-8 w-28 mb-2" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <StatCard
                  label={t("page.purchaseOrder.list.title")}
                  value={total}
                  icon={ShoppingCart}
                  variant="default"
                />
                <StatCard
                  label={t("page.purchaseOrder.status.received")}
                  value={data?.stats?.received ?? 0}
                  icon={CheckCircle}
                  variant="active"
                />
                <StatCard
                  label={t("page.purchaseOrder.status.ordered")}
                  value={data?.stats?.ordered ?? 0}
                  icon={Clock}
                  variant="blue"
                />
                <StatCard
                  label={t("page.purchaseOrder.status.draft")}
                  value={data?.stats?.draft ?? 0}
                  icon={ClipboardList}
                  variant="gray"
                />
                <StatCard
                  label={t("page.purchaseOrder.status.pending")}
                  value={data?.stats?.pending ?? 0}
                  icon={FileEdit}
                  variant="yellow"
                />
                <StatCard
                  label={t("page.purchaseOrder.status.cancelled")}
                  value={data?.stats?.cancelled ?? 0}
                  icon={XCircle}
                  variant="red"
                />
              </div>
            )}
          </div>

          <div className="space-y-6">
            <h3>Status Payment :</h3>
            {isFetching || isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-card rounded-xl border border-border p-4">
                    <div className="flex items-start justify-between mb-3">
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-4 w-4 rounded" />
                    </div>
                    <Skeleton className="h-8 w-28 mb-2" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <StatCard
                  label={t("page.purchaseOrder.list.paymentStatus.paid")}
                  value={data?.paymentStats?.paid ?? 0}
                  icon={CircleDollarSign}
                  variant="active"
                />
                <StatCard
                  label={t("page.purchaseOrder.list.paymentStatus.unpaid")}
                  value={data?.paymentStats?.unpaid ?? 0}
                  icon={Ban}
                  variant="yellow"
                />
                <StatCard
                  label={t("page.purchaseOrder.list.paymentStatus.partial")}
                  value={data?.paymentStats?.partial ?? 0}
                  icon={Wallet}
                  variant="blue"
                />
              </div>
            )}
          </div>

          {isError ? (
            <AbortController refetch={refetch} />
          ) : (
            <TooltipProvider>
              <div data-tour="purchase-order-table" className="mt-6">
                <DataTable
                  columns={columns}
                  data={orders}
                  isLoading={isLoading || isFetching}
                  emptyMessage={t("page.purchaseOrder.list.empty")}
                  emptyIcon={Package}
                  toolbar={
                    <div className="flex flex-col gap-4 w-full">
                      <div className="flex items-center justify-between gap-3">
                        <h4 className="text-base font-semibold text-foreground shrink-0">
                          {t("page.purchaseOrder.list.title")}
                        </h4>
                        <Button
                          variant={showFilters ? "default" : "outline"}
                          size="sm"
                          className="gap-2 h-9 lg:hidden"
                          onClick={() => setShowFilters(!showFilters)}>
                          <span className="material-symbols-outlined text-base">filter_list</span>
                          Filter
                        </Button>
                      </div>
                      <div
                        className={`${showFilters ? "flex" : "hidden"} lg:flex flex-col sm:flex-row sm:items-end gap-3 w-full`}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 flex-1 w-full">
                          {isSuperAdmin && (
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                                Store
                              </label>
                              <StoreFilter
                                locations={locData?.data || []}
                                value={storeFilter}
                                onChange={(v) => {
                                  setGlobalStoreFilter(v);
                                  setPage(1);
                                }}
                                isSuperAdmin={isSuperAdmin}
                                t={t}
                              />
                            </div>
                          )}
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                              {t("page.purchaseOrder.list.columns.status")}
                            </label>
                            <Combobox
                              options={[
                                { value: "all", label: t("common.all") },
                                { value: "draft", label: t("page.purchaseOrder.status.draft") },
                                { value: "pending", label: t("page.purchaseOrder.status.pending") },
                                { value: "ordered", label: t("page.purchaseOrder.status.ordered") },
                                {
                                  value: "received",
                                  label: t("page.purchaseOrder.status.received")
                                },
                                {
                                  value: "cancelled",
                                  label: t("page.purchaseOrder.status.cancelled")
                                }
                              ]}
                              value={statusFilter}
                              onChange={(val) => {
                                setStatusFilter(val);
                                setPage(1);
                              }}
                              placeholder={t("common.all")}
                              searchPlaceholder={t("common.all")}
                            />
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                              {t("page.purchaseOrder.list.columns.poDate")}
                            </label>
                            <DatePicker
                              date={dateFilter}
                              setDate={(date) => {
                                setDateFilter(date);
                                setPage(1);
                              }}
                            />
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                              Cari
                            </label>
                            <SearchInput
                              value={search}
                              onChange={(val) => {
                                setSearch(val);
                                setPage(1);
                              }}
                              placeholder={t("page.purchaseOrder.list.searchPlaceholder")}
                              isLoading={isFetching}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  }
                  pagination={{
                    page,
                    totalPages,
                    total,
                    onPageChange: setPage,
                    pageSize: limit,
                    onPageSizeChange: (v) => {
                      setLimit(v);
                      setPage(1);
                    }
                  }}
                  renderExpandedRow={(po) => {
                    const items = po.items || [];
                    const supplierMap = {};
                    items.forEach((it) => {
                      const sid = it.supplier;
                      if (!sid) return;
                      if (!supplierMap[sid]) {
                        supplierMap[sid] = {
                          supplierId: sid,
                          supplierName: it.supplierData?.name || `Supplier #${sid}`,
                          items: []
                        };
                      }
                      supplierMap[sid].items.push(it);
                    });
                    const suppliers = Object.values(supplierMap);

                    if (suppliers.length === 0) {
                      return (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          Tidak ada item
                        </p>
                      );
                    }

                    return (
                      <div className="space-y-2">
                        {suppliers.map((sup) => (
                          <SupplierExpandableRow
                            key={sup.supplierId}
                            supplier={sup}
                            renderSupplierItems={renderSupplierItems}
                          />
                        ))}
                      </div>
                    );
                  }}
                  getRowCanExpand={(po) => (po.items || []).length > 0}
                />
              </div>

              <div className="mt-4 rounded-xl border border-border bg-card p-4">
                <h4 className="text-sm font-semibold text-foreground mb-1">
                  {t("page.purchaseOrder.list.legend.title")}
                </h4>
                <p className="text-xs text-muted-foreground mb-3">
                  {t("page.purchaseOrder.list.legend.description")}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                  {[
                    { icon: <Eye size={15} />, label: t("page.purchaseOrder.list.legend.detail") },
                    { icon: <Wallet size={15} />, label: t("page.purchaseOrder.list.legend.pay") },
                    {
                      icon: <Wallet size={15} className="text-purple-600" />,
                      label: t("page.purchaseOrder.list.legend.payDP")
                    },
                    {
                      icon: <Undo2 size={15} />,
                      label: t("page.purchaseOrder.list.legend.return")
                    },
                    {
                      icon: <RefreshCw size={15} />,
                      label: t("page.purchaseOrder.list.legend.receive")
                    },
                    {
                      icon: <XCircle size={15} />,
                      label: t("page.purchaseOrder.list.legend.cancel")
                    },
                    {
                      icon: <Trash2 size={15} />,
                      label: t("page.purchaseOrder.list.legend.delete")
                    },
                    {
                      icon: <Send size={15} />,
                      label: t("page.purchaseOrder.list.legend.sendToSupplier")
                    },
                    {
                      icon: <FileEdit size={15} />,
                      label: t("page.purchaseOrder.list.legend.edit")
                    }
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border/60 bg-muted/40 text-xs text-muted-foreground">
                      <span className="shrink-0">{item.icon}</span>
                      <span>{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </TooltipProvider>
          )}

          <div>
            <TipsCard
              tips={[
                t("page.purchaseOrder.list.tips.1"),
                t("page.purchaseOrder.list.tips.2"),
                t("page.purchaseOrder.list.tips.3"),
                t("page.purchaseOrder.list.tips.4")
              ]}
            />
          </div>
        </>
      )}

      {returModal &&
        returPo &&
        createPortal(
          <div className="fixed inset-0 bg-black/50 z-[80] flex items-center justify-center p-4">
            <div className="bg-card rounded-xl shadow-lg border border-border w-full max-w-[80vw] max-h-[90vh] overflow-y-auto">
              <div className="px-6 py-4 border-b border-border flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center">
                  <Package size={18} className="text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">
                    {t("page.purchaseOrder.detail.returModalTitle")}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {returPo.orderNumber || `PO-${returPo.id}`}
                  </p>
                </div>
              </div>
              <div className="p-6 space-y-5">
                {loadingReturPo ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className={i === 4 ? "col-span-2" : ""}>
                          <Skeleton className="h-3 w-16 mb-1" />
                          <Skeleton className="h-4 w-28" />
                        </div>
                      ))}
                    </div>
                    <Skeleton className="h-4 w-24 mt-4" />
                    <div className="space-y-2">
                      <Skeleton className="h-8 w-full" />
                      <Skeleton className="h-8 w-full" />
                    </div>
                    <Skeleton className="h-16 w-full" />
                  </div>
                ) : (
                  <>
                    <div className="bg-muted/30 rounded-lg p-4">
                      <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                        <div>
                          <p className="text-xs text-muted-foreground">
                            {t("page.purchaseOrder.list.returInfo.supplier")}
                          </p>
                          <p className="text-sm font-medium">
                            {returPo.supplierNames ||
                              returPo.supplierData?.name ||
                              returPo.items
                                ?.map((i) => i.supplierData?.name)
                                .filter(Boolean)
                                .filter((v, idx, arr) => arr.indexOf(v) === idx)
                                .join(", ") ||
                              "-"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">
                            {t("page.purchaseOrder.list.returInfo.pic")}
                          </p>
                          <p className="text-sm font-medium">{returPo.picData?.fullName || "-"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">
                            {t("page.purchaseOrder.list.returInfo.poDate")}
                          </p>
                          <p className="text-sm font-medium">
                            {returPo.orderDate
                              ? new Date(returPo.orderDate).toLocaleDateString("id-ID", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric"
                                })
                              : "-"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">
                            {t("page.purchaseOrder.list.returInfo.poTime")}
                          </p>
                          <p className="text-sm font-medium">
                            {returPo.orderDate
                              ? new Date(returPo.orderDate).toLocaleTimeString("id-ID", {
                                  hour: "2-digit",
                                  minute: "2-digit"
                                })
                              : "-"}
                          </p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-xs text-muted-foreground">
                            {t("page.purchaseOrder.list.returInfo.store")}
                          </p>
                          <p className="text-sm font-medium">{returPo.storeData?.name || "-"}</p>
                        </div>
                      </div>
                    </div>

                    {returItems.length > 0 && (
                      <div>
                        <p className="text-sm font-semibold text-foreground mb-2">
                          {t("page.purchaseOrder.list.returInfo.itemTitle")}
                        </p>
                        <div className="overflow-x-auto border border-border rounded-lg">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="bg-muted/50 border-b border-border">
                                <th className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground">
                                  {t("page.purchaseOrder.list.returInfo.itemHeader")}
                                </th>
                                <th className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground min-w-32">
                                  {t("page.purchaseOrder.list.returInfo.supplier")}
                                </th>
                                <th className="px-3 py-2.5 text-center text-xs font-semibold text-muted-foreground w-16">
                                  {t("page.purchaseOrder.list.returInfo.qtyPo")}
                                </th>
                                <th className="px-3 py-2.5 text-center text-xs font-semibold text-muted-foreground w-14">
                                  {t("page.purchaseOrder.list.returInfo.unit")}
                                </th>
                                <th className="px-3 py-2.5 text-center text-xs font-semibold text-muted-foreground w-20">
                                  {t("page.purchaseOrder.list.returInfo.return")}
                                </th>
                                <th className="px-3 py-2.5 text-center text-xs font-semibold text-muted-foreground w-16">
                                  {t("page.purchaseOrder.list.returInfo.remaining")}
                                </th>
                                <th className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground w-40">
                                  {t("page.purchaseOrder.list.returInfo.notes")}
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                              {returItems.map((item, idx) => (
                                <tr
                                  key={item.id || idx}
                                  className="hover:bg-muted/20 transition-colors">
                                  <td className="px-3 py-2.5 text-sm font-medium">
                                    {item.productData?.nameProduct || item.ingredientName || "-"}
                                  </td>
                                  <td className="px-3 py-2.5 text-sm text-muted-foreground">
                                    {item.supplierData?.name || "-"}
                                  </td>
                                  <td className="px-3 py-2.5 text-center text-sm text-muted-foreground">
                                    {item.quantity || 0}
                                  </td>
                                  <td className="px-3 py-2.5 text-center text-sm text-muted-foreground">
                                    {item.unit || "pcs"}
                                  </td>
                                  <td className="px-3 py-2.5 text-center">
                                    <input
                                      type="text"
                                      inputMode="numeric"
                                      value={item.returnQty ?? ""}
                                      onChange={(e) => {
                                        const raw = e.target.value;
                                        if (!/^[0-9]*\.?[0-9]*$/.test(raw)) return;
                                        const maxQty = item.quantity || 0;
                                        const val = parseFloat(raw);
                                        const capped =
                                          !isNaN(val) && val > maxQty ? String(maxQty) : raw;
                                        const normalized = capped
                                          .replace(/^0+(\d)/, "$1")
                                          .replace(/^0+(\.)/, "0$1")
                                          .replace(/^0+$/, "0");
                                        setReturItems((prev) =>
                                          prev.map((it, i) =>
                                            i === idx ? { ...it, returnQty: normalized } : it
                                          )
                                        );
                                      }}
                                      className={`w-16 h-8 text-center border rounded bg-background text-sm transition-colors ${
                                        parseFloat(item.returnQty) > 0
                                          ? "border-amber-300 ring-1 ring-amber-200 dark:border-amber-700"
                                          : "border-input"
                                      }`}
                                      placeholder="0"
                                    />
                                  </td>
                                  <td className="px-3 py-2.5 text-center text-sm font-semibold">
                                    {Math.max(
                                      0,
                                      (item.quantity || 0) - (parseFloat(item.returnQty) || 0)
                                    )}
                                  </td>
                                  <td className="px-3 py-2.5">
                                    <input
                                      type="text"
                                      value={item.notes ?? ""}
                                      onChange={(e) =>
                                        setReturItems((prev) =>
                                          prev.map((it, i) =>
                                            i === idx ? { ...it, notes: e.target.value } : it
                                          )
                                        )
                                      }
                                      className="w-full h-8 px-2 text-sm border rounded bg-background transition-colors border-input"
                                      placeholder={t(
                                        "page.purchaseOrder.list.returInfo.notesPlaceholder"
                                      )}
                                    />
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="text-sm font-medium text-foreground block mb-1.5">
                        {t("page.purchaseOrder.list.returInfo.reasonLabel")}{" "}
                        <span className="text-destructive">*</span>
                      </label>
                      <textarea
                        className="w-full min-h-[100px] px-3 py-2.5 border border-border rounded-lg bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary transition-shadow"
                        placeholder={t("page.purchaseOrder.list.returInfo.reasonPlaceholder")}
                        value={returReason}
                        onChange={(e) => setReturReason(e.target.value)}
                      />
                    </div>
                  </>
                )}
              </div>
              <div className="px-6 py-4 border-t border-border flex items-center justify-between gap-2 bg-muted/20">
                <p className="text-xs text-muted-foreground">
                  {returItems.filter((it) => parseFloat(it.returnQty) > 0).length} item dipilih
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setReturModal(false);
                      setReturPo(null);
                      setReturReason("");
                      setReturItems([]);
                    }}>
                    {t("common.cancel")}
                  </Button>
                  <Button
                    className="bg-amber-600 hover:bg-amber-700 text-white"
                    onClick={() => {
                      const itemsToReturn = returItems
                        .filter((it) => {
                          const q = parseFloat(it.returnQty);
                          return !isNaN(q) && q > 0;
                        })
                        .map((it) => ({
                          productId: it.product,
                          ingredient: it.ingredient,
                          ingredientName: it.ingredientName || null,
                          qty: parseFloat(it.returnQty),
                          unit: it.unit || "pcs",
                          notes: it.notes || ""
                        }));
                      if (itemsToReturn.length === 0) {
                        toast.error(t("page.purchaseOrder.list.returInfo.validationTitle"), {
                          description: t("page.purchaseOrder.list.returInfo.validationDesc")
                        });
                        return;
                      }
                      returnMutation.mutate({
                        po: returPo,
                        reason: returReason,
                        items: itemsToReturn
                      });
                    }}
                    disabled={!returReason.trim() || returnMutation.isLoading}>
                    {returnMutation.isLoading
                      ? t("common.processing")
                      : t("page.purchaseOrder.list.returInfo.confirmButton")}
                  </Button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}

      <UploadExcelModal
        open={importModal}
        onOpenChange={setImportModal}
        uploadService={uploadPurchaseOrderExcel}
        queryKey={["purchase-orders"]}
        title={t("page.purchaseOrder.list.importModalTitle")}
      />

      {payModal &&
        payPo &&
        createPortal(
          (() => {
            const isCredit = payPo.paymentMethod === "credit";
            const dpTotal = isCredit
              ? (Number(payPo.dpPercent || 0) / 100) *
                Number(payPo.finalAmount || payPo.totalAmount || 0)
              : 0;
            const isDpPayment = isCredit && (payPo.totalPaid || 0) < dpTotal;

            return (
              <div className="fixed inset-0 bg-black/50 z-[80] flex items-center justify-center p-4">
                <div className="bg-card rounded-xl shadow-lg border border-border w-full max-w-[80vw] max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
                  <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                    <h3 className="text-base font-bold">
                      {t("page.purchaseOrder.detail.recordPaymentTitle")}
                    </h3>
                    <div className="flex items-center gap-2">
                      {isDpPayment ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-600 text-white">
                          DP {payPo.dpPercent}%
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border border-green-300 text-green-600 bg-green-50 dark:bg-green-950/30 dark:border-green-700">
                          {t("page.purchaseOrder.add.paymentMethodCash")}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setPayModal(false);
                          setPayPo(null);
                        }}
                        className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                        <X size={18} />
                      </button>
                    </div>
                  </div>
                  <div className="p-6 space-y-5">
                    <div className="bg-muted/40 rounded-xl p-4 border border-border/50">
                      <div className="grid grid-cols-2 gap-y-4">
                        <div>
                          <p className="text-xs text-muted-foreground mb-0.5">
                            {t("page.purchaseOrder.list.payInfo.poNumber")}
                          </p>
                          <p className="text-sm font-semibold">
                            {payPo.orderNumber || `PO-${payPo.id}`}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-0.5">
                            {t("page.purchaseOrder.list.payInfo.supplier")}
                          </p>
                          <p className="text-sm font-semibold">
                            {payPo.supplierNames || payPo.items?.[0]?.supplierData?.name || "-"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-0.5">
                            {t("page.purchaseOrder.list.payInfo.total")}
                          </p>
                          <p className="text-sm font-semibold">
                            Rp{" "}
                            {Number(payPo.finalAmount || payPo.totalAmount || 0).toLocaleString(
                              "id-ID"
                            )}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-0.5">
                            {t("page.purchaseOrder.list.payInfo.remaining")}
                          </p>
                          <p className="text-sm font-semibold text-red-500">
                            Rp{" "}
                            {Number(
                              (payPo.finalAmount || payPo.totalAmount || 0) - (payPo.totalPaid || 0)
                            ).toLocaleString("id-ID")}
                          </p>
                        </div>
                      </div>
                    </div>

                    {isDpPayment && (
                      <div className="bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-xl p-4 space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-purple-200 dark:bg-purple-700 flex items-center justify-center">
                            <span className="text-xs font-bold text-purple-700 dark:text-purple-200">
                              DP
                            </span>
                          </div>
                          <p className="text-sm font-medium text-purple-700 dark:text-purple-300">
                            {t("page.purchaseOrder.detail.dpPaymentTitle")}
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs text-purple-600 dark:text-purple-400">
                          <div>
                            <span className="text-purple-500 dark:text-purple-500">
                              DP {payPo.dpPercent}%
                            </span>
                            <p className="font-semibold text-purple-700 dark:text-purple-300">
                              Rp {Number(dpTotal).toLocaleString("id-ID")}
                            </p>
                          </div>
                          <div>
                            <span className="text-purple-500 dark:text-purple-500">
                              {t("page.purchaseOrder.detail.remainingBill")}
                            </span>
                            <p className="font-semibold text-purple-700 dark:text-purple-300">
                              Rp{" "}
                              {Number(
                                Number(payPo.finalAmount || payPo.totalAmount || 0) - dpTotal
                              ).toLocaleString("id-ID")}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {Array.isArray(payPo.items) && payPo.items.length > 0 && (
                      <div>
                        <p className="text-sm font-semibold text-foreground mb-2">
                          {t("page.purchaseOrder.list.returInfo.itemTitle")}
                        </p>
                        <div className="overflow-x-auto border border-border rounded-lg">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="bg-muted/50 border-b border-border">
                                <th className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground w-10">
                                  No
                                </th>
                                <th className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground min-w-40">
                                  {t("page.purchaseOrder.list.returInfo.itemHeader")}
                                </th>
                                <th className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground min-w-32">
                                  {t("page.purchaseOrder.list.returInfo.supplier")}
                                </th>
                                <th className="px-3 py-2.5 text-center text-xs font-semibold text-muted-foreground">
                                  {t("page.purchaseOrder.list.returInfo.qtyPo")}
                                </th>
                                <th className="px-3 py-2.5 text-center text-xs font-semibold text-muted-foreground">
                                  {t("page.purchaseOrder.list.returInfo.unit")}
                                </th>
                                <th className="px-3 py-2.5 text-right text-xs font-semibold text-muted-foreground">
                                  {t("page.purchaseOrder.detail.price")}
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                              {payPo.items.map((item, idx) => (
                                <tr
                                  key={item.id || idx}
                                  className="hover:bg-muted/20 transition-colors">
                                  <td className="px-3 py-2.5 text-sm text-muted-foreground">
                                    {idx + 1}
                                  </td>
                                  <td className="px-3 py-2.5 text-sm font-medium">
                                    {item.ingredientName || "-"}
                                  </td>
                                  <td className="px-3 py-2.5 text-sm text-muted-foreground">
                                    {item.supplierData?.name || "-"}
                                  </td>
                                  <td className="px-3 py-2.5 text-center text-sm text-muted-foreground">
                                    {item.quantity ?? 0}
                                  </td>
                                  <td className="px-3 py-2.5 text-center text-sm text-muted-foreground">
                                    {item.unit || "pcs"}
                                  </td>
                                  <td className="px-3 py-2.5 text-right text-sm text-muted-foreground">
                                    Rp {Number(item.price || 0).toLocaleString("id-ID")}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    <div className="bg-background rounded-xl border border-border p-4 space-y-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium flex items-center gap-1">
                          {isDpPayment
                            ? t("page.purchaseOrder.detail.dpPaymentAmount")
                            : t("page.purchaseOrder.detail.paymentAmount")}
                          <span className="text-destructive">*</span>
                        </Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium z-10">
                            Rp
                          </span>
                          <Input
                            type="text"
                            inputMode="numeric"
                            placeholder="0"
                            disabled
                            value={
                              payForm.amount ? Number(payForm.amount).toLocaleString("id-ID") : ""
                            }
                            onChange={(e) => {
                              const raw = e.target.value.replace(/[^0-9]/g, "");
                              setPayForm({ ...payForm, amount: raw ? Number(raw) : "" });
                            }}
                            className="pl-10 h-12 text-base bg-muted/50 cursor-not-allowed"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">
                            {t("page.purchaseOrder.detail.paymentDate")}
                          </Label>
                          <DatePicker
                            date={payForm.paymentDate}
                            setDate={(date) => setPayForm({ ...payForm, paymentDate: date })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">
                            {t("page.purchaseOrder.detail.paymentMethod")}
                          </Label>
                          <Select
                            value={payForm.paymentMethod}
                            onValueChange={(value) =>
                              setPayForm({ ...payForm, paymentMethod: value })
                            }>
                            <SelectTrigger className="h-11">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="z-[90]">
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

                      <hr className="border-t border-border -mx-4" />

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">
                            {t("page.purchaseOrder.detail.reference")}
                          </Label>
                          <Input
                            placeholder={t("page.purchaseOrder.detail.referencePlaceholder")}
                            value={payForm.reference}
                            onChange={(e) => setPayForm({ ...payForm, reference: e.target.value })}
                            className="h-11"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">
                            {t("page.purchaseOrder.detail.notes")}
                          </Label>
                          <Input
                            placeholder={t("page.purchaseOrder.detail.notesPlaceholder")}
                            value={payForm.notes}
                            onChange={(e) => setPayForm({ ...payForm, notes: e.target.value })}
                            className="h-11"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="px-6 py-4 border-t border-border flex justify-between gap-3">
                    <Button
                      variant="outline"
                      className="h-11 px-6 min-w-[120px]"
                      onClick={() => {
                        setPayModal(false);
                        setPayPo(null);
                      }}>
                      {t("common.cancel")}
                    </Button>
                    <Button
                      className="h-11 px-6 min-w-[120px]"
                      onClick={() => {
                        if (!payForm.amount || Number(payForm.amount) <= 0) {
                          toast.error(t("page.purchaseOrder.detail.validation.paymentRequired"));
                          return;
                        }
                        payMutation.mutate({
                          purchaseOrder: payPo.id,
                          supplier: payPo.items?.[0]?.supplier,
                          amount: Number(payForm.amount),
                          paymentDate: payForm.paymentDate
                            ? format(payForm.paymentDate, "yyyy-MM-dd")
                            : format(new Date(), "yyyy-MM-dd"),
                          paymentMethod: payForm.paymentMethod,
                          reference: payForm.reference,
                          notes: payForm.notes
                        });
                      }}
                      disabled={payMutation.isLoading}>
                      {payMutation.isLoading ? (
                        <span className="flex items-center gap-2">
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          {t("common.processing")}
                        </span>
                      ) : (
                        t("page.purchaseOrder.detail.pay")
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })(),
          document.body
        )}

      {cancelModal &&
        createPortal(
          <div className="fixed inset-0 bg-black/50 z-[80] flex items-center justify-center p-4">
            <div className="bg-card rounded-xl shadow-lg border border-border w-full max-w-sm">
              <div className="px-6 py-4 border-b border-border">
                <h3 className="text-lg font-semibold">
                  {t("page.purchaseOrder.list.cancelConfirmTitle")}
                </h3>
              </div>
              <div className="p-6">
                <p className="text-muted-foreground">
                  {t("page.purchaseOrder.list.cancelConfirmBody")}
                </p>
              </div>
              <div className="px-6 py-4 border-t border-border flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setCancelModal(false);
                    setCancelPoId(null);
                  }}>
                  {t("common.no")}
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => cancelMutation.mutate(cancelPoId)}
                  disabled={cancelMutation.isLoading}>
                  {cancelMutation.isLoading ? t("common.processing") : t("common.yes")}
                </Button>
              </div>
            </div>
          </div>,
          document.body
        )}
      {sendModal &&
        createPortal(
          <div className="fixed inset-0 bg-black/50 z-[80] flex items-center justify-center p-4">
            <div className="bg-card rounded-xl shadow-lg border border-border w-full max-w-sm">
              <div className="px-6 py-4 border-b border-border">
                <h3 className="text-lg font-semibold">
                  {t("page.purchaseOrder.list.sendConfirmTitle")}
                </h3>
              </div>
              <div className="p-6">
                <p className="text-muted-foreground">
                  {t("page.purchaseOrder.list.sendConfirmBody")}
                </p>
              </div>
              <div className="px-6 py-4 border-t border-border flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSendModal(false);
                    setSendPoId(null);
                  }}>
                  {t("common.no")}
                </Button>
                <Button
                  variant="default"
                  className="bg-amber-600 hover:bg-amber-700"
                  onClick={() => sendMutation.mutate(sendPoId)}
                  disabled={sendMutation.isLoading}>
                  {sendMutation.isLoading ? t("common.processing") : t("common.yes")}
                </Button>
              </div>
            </div>
          </div>,
          document.body
        )}
      {deleteModal &&
        createPortal(
          <div className="fixed inset-0 bg-black/50 z-[80] flex items-center justify-center p-4">
            <div className="bg-card rounded-xl shadow-lg border border-border w-full max-w-sm">
              <div className="px-6 py-4 border-b border-border">
                <h3 className="text-lg font-semibold">
                  {t("page.purchaseOrder.list.deleteConfirmTitle")}
                </h3>
              </div>
              <div className="p-6">
                <p className="text-muted-foreground">
                  {t("page.purchaseOrder.list.deleteConfirmBody")}
                </p>
              </div>
              <div className="px-6 py-4 border-t border-border flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setDeleteModal(false);
                    setDeletePoId(null);
                  }}>
                  {t("common.no")}
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => deleteMutation.mutate(deletePoId)}
                  disabled={deleteMutation.isLoading}>
                  {deleteMutation.isLoading ? t("common.processing") : t("common.yes")}
                </Button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default PurchaseOrderList;
