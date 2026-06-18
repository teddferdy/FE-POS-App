import React, { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  ChevronLeft,
  Eye,
  Edit,
  Trash2,
  FileDown,
  ClipboardList,
  AlertTriangle,
  TrendingUp,
  CheckCircle2,
  X
} from "lucide-react";
import { toast } from "sonner";
import { getStockOpname, deleteStockOpname, exportStockOpnameByIds } from "@/services/stock";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Modal from "@/components/organism/modal";
import DataTable from "@/components/ui/DataTable";
import { canAccess } from "@/utils/permission";
import AbortController from "@/components/organism/abort-controller";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

const StockOpnameList = () => {
  const { t } = useTranslation();

  const statusColors = {
    draft: {
      bg: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800",
      dot: "bg-yellow-500",
      label: t("page.stockOpname.status.draft")
    },
    completed: {
      bg: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800",
      dot: "bg-green-500",
      label: t("page.stockOpname.status.completed")
    },
    cancelled: {
      bg: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800",
      dot: "bg-red-500",
      label: t("page.stockOpname.status.cancelled")
    }
  };
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [cookie] = useCookies();
  const user = cookie?.user;
  const MENU_KEY = "/stock-opname";
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [warehouseFilter, setWarehouseFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [noDataModal, setNoDataModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);

  const { data, isLoading, isError, refetch } = useQuery(
    ["stockOpname", page, limit, warehouseFilter, statusFilter],
    () =>
      getStockOpname({
        page,
        limit,
        location: warehouseFilter !== "all" ? warehouseFilter : undefined,
        status: statusFilter !== "all" ? statusFilter : undefined
      }),
    { keepPreviousData: true }
  );

  const items = data?.data || data?.stockOpname || [];
  const total = data?.pagination?.total || data?.total || 0;
  const totalPages = data?.pagination?.totalPages || Math.ceil(total / limit) || 1;

  const filteredItems = items.filter((item) => {
    if (search) {
      const q = search.toLowerCase();
      if (
        !item.auditId?.toLowerCase().includes(q) &&
        !item.warehouse?.toLowerCase().includes(q) &&
        !item.auditor?.toLowerCase().includes(q)
      ) {
        return false;
      }
    }
    return true;
  });

  useEffect(() => {
    setSelectedItems([]);
  }, [page, search, warehouseFilter, statusFilter]);

  // Remove completed items from selection
  useEffect(() => {
    setSelectedItems((prev) =>
      prev.filter((id) => {
        const item = items.find((it) => (it.id || it._id) === id);
        return item && item.status !== "completed";
      })
    );
  }, [items]);

  const handleExportSelected = useCallback(() => {
    exportStockOpnameByIds(selectedItems)
      .then(() => {
        toast.success(t("common.success"), {
          description: t("page.stockOpname.list.exportSuccess", { count: selectedItems.length })
        });
        setSelectedItems([]);
      })
      .catch((err) => {
        toast.error(t("common.failed"), {
          description:
            err?.response?.data?.message || err.message || t("page.stockOpname.list.exportFailed")
        });
      });
  }, [selectedItems]);

  const deleteMutation = useMutation(deleteStockOpname, {
    onSuccess: () => {
      toast.success(t("common.success"), { description: t("page.stockOpname.list.deleteSuccess") });
      queryClient.invalidateQueries(["stockOpname"]);
      setDeleteTarget(null);
    },
    onError: (err) => {
      toast.error(t("common.failed"), {
        description: err?.response?.data?.message || err.message
      });
    }
  });

  const confirmDelete = () => {
    if (deleteTarget) {
      deleteMutation.mutate(deleteTarget);
    }
  };

  const toastIdRef = React.useRef(null);

  useEffect(() => {
    if (selectedItems.length > 0) {
      if (toastIdRef.current) {
        toast.dismiss(toastIdRef.current);
      }
      toastIdRef.current = toast(
        <div className="flex items-center justify-between gap-4 w-full">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">
              {t("page.stockOpname.list.exportTitle")}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t("page.stockOpname.list.exportSelected", { count: selectedItems.length })}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {canAccess(user, MENU_KEY, "export") && (
              <button
                onClick={handleExportSelected}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                <FileDown size={14} />
                {t("page.stockOpname.list.export")}
              </button>
            )}
            <button
              onClick={() => {
                setSelectedItems([]);
                if (toastIdRef.current) {
                  toast.dismiss(toastIdRef.current);
                  toastIdRef.current = null;
                }
              }}
              className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
              <X size={14} />
            </button>
          </div>
        </div>,
        { duration: Infinity, position: "bottom-center" }
      );
    } else {
      if (toastIdRef.current) {
        toast.dismiss(toastIdRef.current);
        toastIdRef.current = null;
      }
    }
    return () => {
      if (toastIdRef.current) {
        toast.dismiss(toastIdRef.current);
        toastIdRef.current = null;
      }
    };
  }, [selectedItems, handleExportSelected]);

  const stats = [
    {
      label: t("page.stockOpname.stats.totalAudit"),
      value: data?.stats?.total ?? total ?? 0,
      icon: ClipboardList,
      color: "text-primary",
      bg: "bg-primary/10",
      trend: t("page.stockOpname.stats.trend"),
      trendIcon: TrendingUp,
      trendColor: "text-green-600"
    },
    {
      label: t("page.stockOpname.status.draft"),
      value: data?.stats?.draft ?? 0,
      icon: Edit,
      color: "text-secondary",
      bg: "bg-secondary/10",
      sub: t("page.stockOpname.stats.draftSub")
    },
    {
      label: t("page.stockOpname.status.completed"),
      value: data?.stats?.completed ?? 0,
      icon: CheckCircle2,
      color: "text-green-600 dark:text-green-400",
      bg: "bg-green-100 dark:bg-green-900/30",
      sub: t("page.stockOpname.stats.completedSub")
    },
    {
      label: t("page.stockOpname.status.cancelled"),
      value: data?.stats?.cancelled ?? 0,
      icon: AlertTriangle,
      color: "text-red-600 dark:text-red-400",
      bg: "bg-red-100 dark:bg-red-900/30",
      sub: t("page.stockOpname.stats.cancelledSub")
    }
  ];

  const columns = [
    {
      header: t("page.stockOpname.list.columns.auditDate"),
      align: "center",
      render: (item) => (
        <span className="font-mono text-xs text-foreground">{item.auditDate || "-"}</span>
      )
    },
    {
      header: t("page.stockOpname.list.columns.auditId"),
      align: "center",
      render: (item) => (
        <span className="text-xs font-bold text-primary">{item.opnameNumber || "-"}</span>
      )
    },
    {
      header: t("page.stockOpname.list.columns.warehouse"),
      align: "center",
      render: (item) => (
        <span className="text-sm font-medium text-foreground">{item.store?.name || "-"}</span>
      )
    },
    {
      header: t("page.stockOpname.list.columns.auditor"),
      align: "center",
      render: (item) => (
        <div className="flex items-center justify-center gap-2">
          <div className="w-7 h-7 rounded-full bg-secondary/20 text-secondary flex items-center justify-center text-[10px] font-bold">
            {item.auditor
              ?.split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2) || "NA"}
          </div>
          <span className="text-sm text-foreground">{item.auditor || "-"}</span>
        </div>
      )
    },
    {
      header: t("page.stockOpname.list.columns.totalItems"),
      align: "center",
      render: (item) => (
        <span className="text-sm font-mono text-foreground">{item.stats?.totalItems ?? "-"}</span>
      )
    },
    {
      header: t("page.stockOpname.list.columns.status"),
      align: "center",
      render: (item) => {
        const status = item.status || "draft";
        const statusStyle = statusColors[status] || statusColors.draft;
        return (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tight ${statusStyle.bg}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot} mr-1.5`} />
            {statusStyle.label}
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
      header: t("common.modifiedBy"),
      render: (item) => (
        <span className="text-sm text-muted-foreground">
          {item.modifiedByUser?.fullName || item.modifiedByUser?.userName || item.modifiedBy || "-"}
        </span>
      )
    },
    {
      header: t("page.stockOpname.list.columns.actions"),
      align: "right",
      render: (item) => {
        const isDraft = item.status === "draft";
        return (
          <div className="flex items-center justify-end gap-1">
            {canAccess(user, MENU_KEY, "view") && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-primary"
                onClick={() => navigate(`/stock-opname/detail?id=${item.id || item._id}`)}>
                <Eye size={15} />
              </Button>
            )}
            {isDraft && (
              <>
                {canAccess(user, MENU_KEY, "edit") && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-primary"
                    onClick={() => navigate(`/add-stock-opname?id=${item.id || item._id}`)}>
                    <Edit size={15} />
                  </Button>
                )}
                {canAccess(user, MENU_KEY, "delete") && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={() => setDeleteTarget(item.id || item._id)}>
                    <Trash2 size={15} />
                  </Button>
                )}
              </>
            )}
          </div>
        );
      }
    }
  ];

  return (
    <div className="space-y-6">
      <motion.div variants={fadeInUp} initial="hidden" animate="show">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <button
            onClick={() => navigate("/dashboard-super-admin")}
            className="hover:text-foreground transition-colors">
            {t("breadcrumb.home")}
          </button>
          <span className="text-xs">/</span>
          <span className="text-primary font-semibold">{t("page.stockOpname.list.title")}</span>
        </nav>
      </motion.div>

      <motion.div variants={fadeInUp} initial="hidden" animate="show">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {t("page.stockOpname.list.title")}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {t("page.stockOpname.list.description")}
            </p>
          </div>
          {canAccess(user, MENU_KEY, "add") && (
            <Button onClick={() => navigate("/add-stock-opname")} className="shrink-0 gap-2">
              <Plus size={16} />
              {t("page.stockOpname.list.addButton")}
            </Button>
          )}
        </div>
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <motion.div
            key={idx}
            variants={item}
            className="bg-card p-5 rounded-xl border border-border shadow-sm hover:border-primary/50 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 ${stat.bg} rounded-lg ${stat.color}`}>
                <stat.icon size={20} />
              </div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                {stat.label}
              </span>
            </div>
            <p className="text-2xl font-bold text-foreground">{stat.value.toLocaleString()}</p>
            {stat.trend ? (
              <div className="flex items-center gap-1 mt-1 text-xs">
                <stat.trendIcon size={14} className={stat.trendColor} />
                <span className={`font-semibold ${stat.trendColor}`}>{stat.trend}</span>
              </div>
            ) : stat.sub ? (
              <p className="text-xs text-muted-foreground mt-1 italic">{stat.sub}</p>
            ) : null}
          </motion.div>
        ))}
      </motion.div>

      {isError ? (
        <AbortController refetch={refetch} />
      ) : (
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}>
          <DataTable
            columns={columns}
            data={filteredItems}
            isLoading={isLoading}
            emptyMessage={t("page.stockOpname.list.empty")}
            emptyIcon={ClipboardList}
            selectable
            selectedIds={selectedItems}
            onSelectionChange={setSelectedItems}
            isSelectable={(row) => row.status !== "completed"}
            rowClassName={(row) => {
              const status = row.status || "draft";
              const classes = [];
              if (selectedItems.includes(row.id || row._id)) classes.push("bg-primary/5");
              if (status === "completed") classes.push("bg-green-50/50 dark:bg-green-950/10");
              if (status === "cancelled") classes.push("bg-red-50/50 dark:bg-red-950/10");
              return classes.join(" ");
            }}
            toolbar={
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="relative">
                    <select
                      value={warehouseFilter}
                      onChange={(e) => {
                        setWarehouseFilter(e.target.value);
                        setPage(1);
                      }}
                      className="h-9 px-3 pr-8 rounded-md border border-input bg-background text-sm appearance-none cursor-pointer">
                      <option value="all">{t("page.stockOpname.list.allWarehouse")}</option>
                      <option value="utama-jkt">{t("page.stockOpname.list.warehouseUtama")}</option>
                      <option value="bsd">{t("page.stockOpname.list.warehouseBsd")}</option>
                      <option value="dc">{t("page.stockOpname.list.warehouseDc")}</option>
                    </select>
                    <ChevronLeft
                      size={14}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none rotate-90"
                    />
                  </div>
                  <div className="relative">
                    <select
                      value={statusFilter}
                      onChange={(e) => {
                        setStatusFilter(e.target.value);
                        setPage(1);
                      }}
                      className="h-9 px-3 pr-8 rounded-md border border-input bg-background text-sm appearance-none cursor-pointer">
                      <option value="all">{t("page.stockOpname.list.allStatus")}</option>
                      <option value="draft">{t("page.stockOpname.status.draft")}</option>
                      <option value="completed">{t("page.stockOpname.status.completed")}</option>
                      <option value="cancelled">{t("page.stockOpname.status.cancelled")}</option>
                    </select>
                    <ChevronLeft
                      size={14}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none rotate-90"
                    />
                  </div>
                </div>
                <div className="relative w-full sm:w-64">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <Input
                    placeholder={t("page.stockOpname.list.searchPlaceholder")}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 h-9 text-sm"
                  />
                </div>
              </div>
            }
            pagination={{
              page,
              totalPages,
              total,
              onPageChange: setPage
            }}
          />
        </motion.div>
      )}

      <Modal
        type="confirm"
        open={noDataModal}
        onOpenChange={setNoDataModal}
        title={t("page.stockOpname.list.noDataTitle")}
        description={t("page.stockOpname.list.noDataDesc")}
        confirmText={t("page.stockOpname.list.addButton")}
        onConfirm={() => navigate("/add-stock-opname")}
      />

      <Modal
        type="confirm"
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={t("page.stockOpname.list.deleteTitle")}
        description={t("page.stockOpname.list.deleteDesc")}
        confirmText={t("page.stockOpname.list.deleteConfirm")}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default StockOpnameList;
