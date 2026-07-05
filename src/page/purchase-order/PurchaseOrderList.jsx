import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { toast } from "sonner";
import {
  Plus,
  Search,
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Undo2,
  Eye,
  Wallet,
  Upload,
  Download
} from "lucide-react";
import { useTranslation } from "react-i18next";
import UploadExcelModal from "@/components/organism/UploadExcelModal";
import StatCard from "@/components/ui/StatCard";
import { canAccess } from "@/utils/permission";
import {
  getAllPurchaseOrder,
  getPurchaseOrderById,
  returnPurchaseOrder,
  uploadPurchaseOrderExcel,
  downloadPurchaseOrderExcel
} from "@/services/purchase-order";
import { getAllLocation } from "@/services/location";
import NoStore from "@/components/ui/NoStore";
import { recordPayment } from "@/services/purchase-payment";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import AbortController from "@/components/organism/abort-controller";

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
  const [storeFilter, setStoreFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [returModal, setReturModal] = useState(false);
  const [returPo, setReturPo] = useState(null);
  const [returReason, setReturReason] = useState("");
  const [returItems, setReturItems] = useState([]);
  const [importModal, setImportModal] = useState(false);
  const [payModal, setPayModal] = useState(false);
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

  const { data: poDetail } = useQuery(
    ["po-detail", returPo?.id],
    () => getPurchaseOrderById(returPo.id),
    { enabled: !!returPo, staleTime: 0 }
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
  const locationParam = storeFilter !== "all" ? storeFilter : user?.store || "";
  const isSuperAdmin = user?.roleType === "super_admin";

  const { data: locData } = useQuery(["locations-purchase-orders"], () => getAllLocation(), {
    staleTime: 5 * 60 * 1000,
    enabled: isSuperAdmin
  });

  const { data, isLoading, isError, refetch } = useQuery(
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

  const orders = data?.data || [];
  const pagination = data?.pagination || {};

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
      render: (po) => (
        <span className="font-medium text-foreground">{po.orderNumber || `PO-${po.id}`}</span>
      )
    },
    {
      header: t("page.purchaseOrder.list.columns.supplier"),
      render: (po) => (
        <div>
          <p className="font-medium">{po.supplierData?.name || "-"}</p>
          {po.supplierData?.phone && (
            <p className="text-xs text-muted-foreground">{po.supplierData.phone}</p>
          )}
        </div>
      )
    },
    {
      header: t("page.purchaseOrder.list.columns.pic"),
      render: (po) => po.picData?.fullName || "-"
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
        const isOverdue =
          po.dueDate &&
          po.status !== "received" &&
          po.status !== "cancelled" &&
          new Date(po.dueDate) < new Date(new Date().toDateString());
        return (
          <span className={isOverdue ? "text-red-600 font-medium" : "text-muted-foreground"}>
            {po.dueDate
              ? new Date(po.dueDate).toLocaleDateString("id-ID", {
                  year: "numeric",
                  month: "short",
                  day: "numeric"
                })
              : "-"}
            {isOverdue && " ⚠️"}
          </span>
        );
      }
    },
    {
      header: t("page.purchaseOrder.list.columns.store"),
      render: (po) => <span className="text-sm">{po.storeData?.name || "-"}</span>
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
      render: (po) => (
        <span
          className="text-muted-foreground text-xs max-w-[150px] block truncate"
          title={po.notes || ""}>
          {po.notes || "-"}
        </span>
      )
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
      header: t("common.modifiedBy"),
      render: (item) => (
        <span className="text-sm text-muted-foreground">
          {item.modifiedByUser?.fullName || item.modifiedByUser?.userName || item.modifiedBy || "-"}
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
      render: (po) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground"
            onClick={() => navigate(`/purchase-order/detail?id=${po.id}`)}
            title={t("page.purchaseOrder.list.action.detail")}>
            <Eye size={15} />
          </Button>
          {po.status !== "cancelled" &&
            (po.totalPaid || 0) < (po.finalAmount || po.totalAmount || 0) && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-green-600"
                onClick={() => {
                  setPayPo(po);
                  setPayForm({
                    amount: "",
                    paymentDate: undefined,
                    paymentMethod: "cash",
                    reference: "",
                    notes: ""
                  });
                  setPayModal(true);
                }}
                title={t("page.purchaseOrder.list.action.pay")}>
                <Wallet size={15} />
              </Button>
            )}
          {po.status === "draft" && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-blue-600"
              onClick={() => navigate(`/edit-purchase-order?id=${po.id}`)}
              title={t("page.purchaseOrder.list.action.edit")}>
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
            </Button>
          )}
          {po.status === "pending" && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-blue-600"
                onClick={() => navigate(`/edit-purchase-order?id=${po.id}`)}
                title={t("page.purchaseOrder.list.action.edit")}>
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
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-green-600"
                onClick={() => navigate(`/add-goods-receipt?poId=${po.id}`)}
                title={t("page.purchaseOrder.list.action.receive")}>
                <RefreshCw size={15} />
              </Button>
            </>
          )}
          {po.status === "received" && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-amber-600"
              onClick={() => {
                setReturPo(po);
                setReturReason("");
                setReturModal(true);
              }}
              title={t("page.purchaseOrder.list.action.return")}>
              <Undo2 size={15} />
            </Button>
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

      {locData && (locData?.data || []).length === 0 ? <NoStore /> : (
        <>
      <div className="space-y-6">
          <h3>Status Order :</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard
            label={t("page.purchaseOrder.list.title")}
            value={total}
            icon="shopping_cart"
            variant="default"
          />
          <StatCard
            label={t("page.purchaseOrder.status.received")}
            value={data?.stats?.received ?? 0}
            icon="check_circle"
            variant="active"
          />
          <StatCard
            label={t("page.purchaseOrder.status.ordered")}
            value={data?.stats?.ordered ?? 0}
            icon="schedule"
            variant="blue"
          />
          <StatCard
            label={t("page.purchaseOrder.status.draft")}
            value={data?.stats?.draft ?? 0}
            icon="description"
            variant="gray"
          />
          <StatCard
            label={t("page.purchaseOrder.status.pending")}
            value={data?.stats?.pending ?? 0}
            icon="edit_note"
            variant="yellow"
          />
          <StatCard
            label={t("page.purchaseOrder.status.cancelled")}
            value={data?.stats?.cancelled ?? 0}
            icon="cancel"
            variant="red"
          />
        </div>
      </div>

      <div className="space-y-6">
        <h3>Status Payment :</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard
            label={t("page.purchaseOrder.list.paymentStatus.paid")}
            value={data?.paymentStats?.paid ?? 0}
            icon="paid"
            variant="active"
          />
          <StatCard
            label={t("page.purchaseOrder.list.paymentStatus.unpaid")}
            value={data?.paymentStats?.unpaid ?? 0}
            icon="money_off"
            variant="yellow"
          />
          <StatCard
            label={t("page.purchaseOrder.list.paymentStatus.partial")}
            value={data?.paymentStats?.partial ?? 0}
            icon="payments"
            variant="blue"
          />
        </div>
      </div>

      {isError ? (
        <AbortController refetch={refetch} />
      ) : (
        <div data-tour="purchase-order-table" className="mt-6">
          <DataTable
            columns={columns}
            data={orders}
            isLoading={isLoading}
            emptyMessage={t("page.purchaseOrder.list.empty")}
            emptyIcon={Package}
            toolbar={
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 w-full">
                <div className="flex items-center justify-between lg:justify-start lg:gap-4">
                  <h4 className="text-base font-semibold text-foreground shrink-0">
                    {t("page.purchaseOrder.list.title")}
                  </h4>
                  <Button variant="outline" size="sm" className="gap-2 h-9 lg:hidden" onClick={() => setShowFilters(!showFilters)}>
                    <span className="material-symbols-outlined text-base">filter_list</span>
                    {showFilters ? "Tutup" : "Filter"}
                  </Button>
                </div>
                <div className={`${showFilters ? 'flex' : 'hidden'} lg:flex flex-wrap items-center gap-2`}>
                  {isSuperAdmin && (
                    <StoreFilter
                      locations={locData?.data || []}
                      value={storeFilter}
                      onChange={(v) => { setStoreFilter(v); setPage(1); }}
                      isSuperAdmin={isSuperAdmin}
                      t={t}
                    />
                  )}
                  <select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      setPage(1);
                    }}
                    className="h-9 px-3 rounded-md border border-input bg-background text-sm">
                    <option value="all">{t("common.all")}</option>
                    <option value="draft">{t("page.purchaseOrder.status.draft")}</option>
                    <option value="pending">{t("page.purchaseOrder.status.pending")}</option>
                    <option value="ordered">{t("page.purchaseOrder.status.ordered")}</option>
                    <option value="received">{t("page.purchaseOrder.status.received")}</option>
                    <option value="cancelled">{t("page.purchaseOrder.status.cancelled")}</option>
                  </select>
                  <div className="relative min-w-0 flex-[1_1_180px]">
                    <Search
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    />
                    <Input
                      placeholder={t("page.purchaseOrder.list.searchPlaceholder")}
                      value={search}
                      onChange={(e) => {
                        setSearch(e.target.value);
                        setPage(1);
                      }}
                      className="pl-9 h-9 text-sm"
                    />
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
              onPageSizeChange: (v) => { setLimit(v); setPage(1); }
            }}
          />
        </div>
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
            <div className="bg-card rounded-xl shadow-lg border border-border w-full max-w-xl max-h-[90vh] overflow-y-auto">
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
                <div className="bg-muted/30 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                    <div>
                      <p className="text-xs text-muted-foreground">
                        {t("page.purchaseOrder.list.returInfo.supplier")}
                      </p>
                      <p className="text-sm font-medium">{returPo.supplierData?.name || "-"}</p>
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
                            <th className="px-3 py-2.5 text-center text-xs font-semibold text-muted-foreground w-16">
                              {t("page.purchaseOrder.list.returInfo.qtyPo")}
                            </th>
                            <th className="px-3 py-2.5 text-center text-xs font-semibold text-muted-foreground w-14">
                              {t("page.purchaseOrder.list.returInfo.unit")}
                            </th>
                            <th className="px-3 py-2.5 text-center text-xs font-semibold text-muted-foreground w-20">
                              {t("page.purchaseOrder.list.returInfo.return")}
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
          <div className="fixed inset-0 bg-black/50 z-[80] flex items-center justify-center p-4">
            <div className="bg-card rounded-xl shadow-lg border border-border w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="px-6 py-4 border-b border-border">
                <h3 className="text-lg font-semibold">
                  {t("page.purchaseOrder.detail.recordPaymentTitle")}
                </h3>
              </div>
              <div className="p-6 space-y-5">
                <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {t("page.purchaseOrder.list.payInfo.poNumber")}
                    </p>
                    <p className="font-medium">{payPo.orderNumber || `PO-${payPo.id}`}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {t("page.purchaseOrder.list.payInfo.supplier")}
                    </p>
                    <p className="font-medium">{payPo.supplierData?.name || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {t("page.purchaseOrder.list.payInfo.total")}
                    </p>
                    <p className="font-medium">
                      Rp{" "}
                      {Number(payPo.finalAmount || payPo.totalAmount || 0).toLocaleString("id-ID")}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {t("page.purchaseOrder.list.payInfo.remaining")}
                    </p>
                    <p className="font-medium text-red-500">
                      Rp{" "}
                      {Number(
                        (payPo.finalAmount || payPo.totalAmount || 0) - (payPo.totalPaid || 0)
                      ).toLocaleString("id-ID")}
                    </p>
                  </div>
                </div>
                <hr className="border-t border-border" />
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
                      value={payForm.amount ? Number(payForm.amount).toLocaleString("id-ID") : ""}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/[^0-9]/g, "");
                        setPayForm({ ...payForm, amount: raw ? Number(raw) : "" });
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
                      onValueChange={(value) => setPayForm({ ...payForm, paymentMethod: value })}>
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
                <hr className="border-t border-border" />
                <div className="grid grid-cols-2 gap-4">
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
              <div className="px-6 py-4 border-t border-border flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setPayModal(false);
                    setPayPo(null);
                  }}>
                  {t("common.cancel")}
                </Button>
                <Button
                  onClick={() => {
                    if (!payForm.amount || Number(payForm.amount) <= 0) {
                      toast.error(t("page.purchaseOrder.detail.validation.paymentRequired"));
                      return;
                    }
                    payMutation.mutate({
                      purchaseOrder: payPo.id,
                      supplier: payPo.supplier,
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
                  {payMutation.isLoading ? t("common.processing") : t("common.save")}
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
