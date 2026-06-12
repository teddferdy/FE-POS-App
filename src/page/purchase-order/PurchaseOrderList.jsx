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
  Upload,
  Download
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { canAccess } from "@/utils/permission";
import {
  getAllPurchaseOrder,
  getPurchaseOrderById,
  returnPurchaseOrder,
  uploadPurchaseOrderExcel,
  downloadPurchaseOrderTemplate,
  downloadPurchaseOrderExcel
} from "@/services/purchase-order";
import { getAllLocation } from "@/services/location";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import DataTable from "@/components/ui/DataTable";

const statusMap = {
  pending: {
    label: "Menunggu",
    class: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
  },
  ordered: {
    label: "Sebagian",
    class: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
  },
  received: {
    label: "Diterima",
    class: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
  },
  cancelled: {
    label: "Dibatalkan",
    class: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
  }
};

const PurchaseOrderList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [cookie] = useCookies();
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [storeFilter, setStoreFilter] = useState("all");
  const [returModal, setReturModal] = useState(false);
  const [returPo, setReturPo] = useState(null);
  const [returReason, setReturReason] = useState("");
  const [returItems, setReturItems] = useState([]);
  const [importModal, setImportModal] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importLoading, setImportLoading] = useState(false);

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
          returnQty: 0
        }))
      );
    }
  }, [poDetail]);

  const user = cookie?.user;
  const MENU_KEY = "/purchase-order";
  const locationParam = storeFilter !== "all" ? storeFilter : user?.store || "";
  const isSuperAdmin = user?.roleType === "super_admin";

  const { data: locations } = useQuery(["locations-po"], () => getAllLocation(), {
    staleTime: 60000,
    enabled: isSuperAdmin
  });

  const { data, isLoading } = useQuery(
    ["purchase-orders", page, limit, search, storeFilter],
    () => getAllPurchaseOrder({ location: locationParam, page, limit, search }),
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
        toast.success("Berhasil", { description: "Retur Pembelian berhasil diproses" });
        queryClient.invalidateQueries(["purchase-orders"]);
        setReturModal(false);
        setReturPo(null);
        setReturReason("");
        setReturItems([]);
      },
      onError: (err) => {
        toast.error("Gagal", { description: err?.response?.data?.message || err.message });
      }
    }
  );

  const orders = data?.data || [];
  const pagination = data?.pagination || {};

  const handleDownloadTemplate = async () => {
    try {
      await downloadPurchaseOrderTemplate();
      toast.success("Template diunduh");
    } catch (err) {
      toast.error("Gagal mengunduh template", { description: err?.response?.data?.message || err.message });
    }
  };

  const handleDownloadExcel = async () => {
    try {
      await downloadPurchaseOrderExcel();
      toast.success("Data PO diunduh");
    } catch (err) {
      toast.error("Gagal mengunduh", { description: err?.response?.data?.message || err.message });
    }
  };

  const handleImport = async () => {
    if (!importFile) return;
    setImportLoading(true);
    try {
      await uploadPurchaseOrderExcel(importFile);
      toast.success("Import berhasil");
      queryClient.invalidateQueries(["purchase-orders"]);
      setImportModal(false);
      setImportFile(null);
    } catch (err) {
      toast.error("Import gagal", { description: err?.response?.data?.message || err.message });
    } finally {
      setImportLoading(false);
    }
  };
  const total = pagination?.total || pagination?.totalItems || data?.total || 0;
  const totalPages = pagination?.totalPages || Math.ceil(total / limit) || 1;

  const columns = [
    {
      header: "No. PO",
      render: (po) => (
        <span className="font-medium text-foreground">{po.orderNumber || `PO-${po.id}`}</span>
      )
    },
    {
      header: "Supplier",
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
      header: "PIC",
      render: (po) => po.picData?.fullName || "-"
    },
    {
      header: "Tanggal PO",
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
      header: "Jatuh Tempo",
      render: (po) => {
        const isOverdue = po.dueDate && po.status !== "received" && po.status !== "cancelled" && new Date(po.dueDate) < new Date(new Date().toDateString());
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
      header: "Store",
      render: (po) => <span className="text-sm">{po.storeData?.name || "-"}</span>
    },
    {
      header: "Status",
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
      header: "Total",
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
      header: "Pembayaran",
      align: "center",
      render: (po) => {
        const total = po.finalAmount || po.totalAmount || 0;
        const paid = po.totalPaid || 0;
        const remaining = total - paid;
        if (total === 0) return <span className="text-xs text-muted-foreground">-</span>;
        if (paid >= total) {
          return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Lunas</span>;
        }
        if (paid > 0) {
          return (
            <div className="flex flex-col items-center gap-0.5">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">Sebagian</span>
              <span className="text-xs text-muted-foreground">Rp {Number(remaining).toLocaleString("id-ID")}</span>
            </div>
          );
        }
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">Belum</span>;
      }
    },
    {
      header: "Catatan",
      render: (po) => (
        <span
          className="text-muted-foreground text-xs max-w-[150px] block truncate"
          title={po.notes || ""}>
          {po.notes || "-"}
        </span>
      )
    },
    {
      header: "Aksi",
      align: "right",
      render: (po) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground"
            onClick={() => navigate(`/purchase-order/detail?id=${po.id}`)}
            title="Detail PO">
            <Eye size={15} />
          </Button>
          {po.status === "pending" && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-blue-600"
                onClick={() => navigate(`/edit-purchase-order?id=${po.id}`)}
                title="Edit PO">
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
                title="Terima PO">
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
              title="Retur PO">
              <Undo2 size={15} />
            </Button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <button
          onClick={() => navigate("/dashboard-super-admin")}
          className="hover:text-foreground transition-colors">
          {t("breadcrumb.home")}
        </button>
        <span className="text-xs">/</span>
        <span className="text-primary font-semibold">{t("page.purchaseOrder.list.title")}</span>
      </nav>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {t("page.purchaseOrder.list.title")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("page.purchaseOrder.list.description")}
          </p>
        </div>
        {canAccess(user, MENU_KEY, "add") && (
          <Button onClick={() => navigate("/add-purchase-order")} className="gap-2">
            <Plus size={18} />
            {t("breadcrumb.add")}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="p-5">
          <p className="text-sm text-muted-foreground">{t("page.purchaseOrder.list.title")}</p>
          <p className="text-2xl font-bold text-foreground mt-1">{total}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-muted-foreground">{t("common.status")}</p>
          <p className="text-2xl font-bold text-yellow-600 mt-1">{data?.stats?.pending ?? 0}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-muted-foreground">{t("common.active")}</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{data?.stats?.received ?? 0}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-muted-foreground">{t("common.delete")}</p>
          <p className="text-2xl font-bold text-red-600 mt-1">{data?.stats?.cancelled ?? 0}</p>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {isSuperAdmin && (
          <select
            value={storeFilter}
            onChange={(e) => {
              setStoreFilter(e.target.value);
              setPage(1);
            }}
            className="h-10 px-3 rounded-md border border-input bg-background text-sm">
            <option value="all">Semua Store</option>
            {(locations?.data || []).map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name}
              </option>
            ))}
          </select>
        )}
        <div className="relative w-full sm:w-72">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            placeholder="Cari PO..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9 h-10"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={handleDownloadExcel}>
            <Download size={14} />
            Export
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setImportModal(true)}>
            <Upload size={14} />
            Import
          </Button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={orders}
        isLoading={isLoading}
        emptyMessage="Belum ada purchase order"
        emptyIcon={Package}
        pagination={{ page, totalPages, total, onPageChange: setPage }}
      />

      {returModal &&
        returPo &&
        createPortal(
          <div className="fixed inset-0 bg-black/50 z-[80] flex items-center justify-center p-4">
            <div className="bg-card rounded-xl shadow-lg border border-border w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="px-6 py-4 border-b border-border">
                <h3 className="text-lg font-semibold">Retur Pembelian</h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">No. PO</p>
                    <p className="font-medium">{returPo.orderNumber || `PO-${returPo.id}`}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Supplier</p>
                    <p className="font-medium">{returPo.supplierData?.name || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">PIC</p>
                    <p className="font-medium">{returPo.picData?.fullName || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Tanggal PO</p>
                    <p className="font-medium">
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
                    <p className="text-sm text-muted-foreground">Jam PO</p>
                    <p className="font-medium">
                      {returPo.orderDate
                        ? new Date(returPo.orderDate).toLocaleTimeString("id-ID", {
                            hour: "2-digit",
                            minute: "2-digit"
                          })
                        : "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Store</p>
                    <p className="font-medium">{returPo.storeData?.name || "-"}</p>
                  </div>
                </div>

                {returItems.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold text-foreground mb-2">Item</p>
                    <div className="overflow-x-auto border rounded-lg">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-muted/60 border-b">
                            <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground">
                              Item
                            </th>
                            <th className="px-3 py-2 text-center text-xs font-semibold text-muted-foreground">
                              Qty PO
                            </th>
                            <th className="px-3 py-2 text-center text-xs font-semibold text-muted-foreground">
                              Unit
                            </th>
                            <th className="px-3 py-2 text-center text-xs font-semibold text-muted-foreground">
                              Retur
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {returItems.map((item, idx) => (
                            <tr key={item.id || idx} className="border-b border-muted/20">
                              <td className="px-3 py-2 text-sm">
                                {item.productData?.nameProduct || item.ingredientName || "-"}
                              </td>
                              <td className="px-3 py-2 text-center text-sm">
                                {item.quantity || 0}
                              </td>
                              <td className="px-3 py-2 text-center text-sm">
                                {item.unit || "pcs"}
                              </td>
                              <td className="px-3 py-2 text-center">
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
                                  className="w-16 h-8 text-center border border-input rounded bg-background text-sm"
                                  placeholder="0"
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
                  <label className="text-sm text-muted-foreground block mb-1">Alasan Retur</label>
                  <textarea
                    className="w-full h-24 px-3 py-2 border border-border rounded-lg bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Masukkan alasan retur..."
                    value={returReason}
                    onChange={(e) => setReturReason(e.target.value)}
                  />
                </div>
              </div>
              <div className="px-6 py-4 border-t border-border flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setReturModal(false);
                    setReturPo(null);
                    setReturReason("");
                    setReturItems([]);
                  }}>
                  Batal
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
                        notes: ""
                      }));
                    if (itemsToReturn.length === 0) {
                      toast.error("Validasi", { description: "Minimal 1 item harus diretur" });
                      return;
                    }
                    returnMutation.mutate({
                      po: returPo,
                      reason: returReason,
                      items: itemsToReturn
                    });
                  }}
                  disabled={!returReason.trim() || returnMutation.isLoading}>
                  {returnMutation.isLoading ? "Memproses..." : "Konfirmasi Retur"}
                </Button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {importModal && createPortal(
        <div className="fixed inset-0 bg-black/50 z-[80] flex items-center justify-center p-4">
          <div className="bg-card rounded-xl shadow-lg border border-border w-full max-w-md">
            <div className="px-6 py-4 border-b border-border">
              <h3 className="text-lg font-semibold">Import PO</h3>
            </div>
            <div className="p-6 space-y-4">
              <Button variant="outline" className="w-full gap-2" onClick={handleDownloadTemplate}>
                <Download size={15} />
                Download Template Excel
              </Button>
              <div className="border-t border-border pt-4">
                <label className="text-sm font-medium text-foreground block mb-2">
                  Upload File Excel
                </label>
                <Input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={(e) => setImportFile(e.target.files[0])}
                />
                {importFile && (
                  <p className="text-xs text-muted-foreground mt-1">{importFile.name}</p>
                )}
              </div>
            </div>
            <div className="px-6 py-4 border-t border-border flex justify-end gap-2">
              <Button variant="outline" onClick={() => { setImportModal(false); setImportFile(null); }}>
                Batal
              </Button>
              <Button onClick={handleImport} disabled={!importFile || importLoading}>
                {importLoading ? "Mengupload..." : "Import"}
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
