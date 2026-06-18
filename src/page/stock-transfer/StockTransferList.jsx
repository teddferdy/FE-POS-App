import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { toast } from "sonner";
import { Plus, Search, Eye, Trash2, CheckCircle, XCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { canAccess } from "@/utils/permission";
import {
  getTransferHistory,
  deleteStockTransfer,
  approveStockTransfer,
  rejectStockTransfer
} from "@/services/stock-transfer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DataTable from "@/components/ui/DataTable";
import Modal from "@/components/organism/modal";
import AbortController from "@/components/organism/abort-controller";

const statusCfg = {
  pending: {
    label: "Pending",
    class: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
  },
  approved: {
    label: "Approved",
    class: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
  },
  rejected: {
    label: "Rejected",
    class: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
  }
};

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

const StockTransferList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [cookie] = useCookies();
  const user = cookie?.user;
  const store = user?.store || "";
  const MENU_KEY = "/stock-transfer";
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data, isLoading, isError, refetch } = useQuery(
    ["stock-transfers", page, limit, statusFilter],
    () =>
      getTransferHistory({
        store,
        page,
        limit,
        status: statusFilter !== "all" ? statusFilter : undefined
      }),
    { keepPreviousData: true }
  );

  const items = data?.data || [];
  const total = data?.pagination?.total || 0;
  const totalPages = data?.pagination?.totalPages || 1;

  const filteredItems = items.filter((item) => {
    if (search) {
      const q = search.toLowerCase();
      if (!item.transferNumber?.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const deleteMut = useMutation(() => deleteStockTransfer(deleteTarget, store), {
    onSuccess: () => {
      toast.success(t("page.stockTransfer.list.toast.success"), {
        description: t("page.stockTransfer.list.toast.deleteDesc")
      });
      queryClient.invalidateQueries(["stock-transfers"]);
      setDeleteTarget(null);
    },
    onError: (err) =>
      toast.error(t("page.stockTransfer.list.toast.error"), {
        description: err?.response?.data?.message || err.message
      })
  });

  const approveMut = useMutation((id) => approveStockTransfer(id), {
    onSuccess: () => {
      toast.success(t("page.stockTransfer.list.toast.success"), {
        description: t("page.stockTransfer.list.toast.approveDesc")
      });
      queryClient.invalidateQueries(["stock-transfers"]);
    },
    onError: (err) =>
      toast.error(t("page.stockTransfer.list.toast.error"), {
        description: err?.response?.data?.message || err.message
      })
  });

  const rejectMut = useMutation((id) => rejectStockTransfer(id), {
    onSuccess: () => {
      toast.success(t("page.stockTransfer.list.toast.success"), {
        description: t("page.stockTransfer.list.toast.rejectDesc")
      });
      queryClient.invalidateQueries(["stock-transfers"]);
    },
    onError: (err) =>
      toast.error(t("page.stockTransfer.list.toast.error"), {
        description: err?.response?.data?.message || err.message
      })
  });

  const columns = [
    {
      header: t("page.stockTransfer.list.header.transferNo"),
      render: (item) => (
        <span className="font-mono text-xs font-bold text-primary">{item.transferNumber}</span>
      )
    },
    {
      header: t("page.stockTransfer.list.header.from"),
      render: (item) => <span className="text-sm">{item.fromStoreData?.name || "-"}</span>
    },
    {
      header: t("page.stockTransfer.list.header.to"),
      render: (item) => <span className="text-sm">{item.toStoreData?.name || "-"}</span>
    },
    {
      header: t("page.stockTransfer.list.header.items"),
      align: "center",
      render: (item) => <span className="font-mono text-sm">{item.items?.length || 0}</span>
    },
    {
      header: t("page.stockTransfer.list.header.notes"),
      render: (item) => (
        <span className="text-xs text-muted-foreground max-w-[150px] truncate block">
          {item.notes || "-"}
        </span>
      )
    },
    {
      header: t("page.stockTransfer.list.header.transferredBy"),
      render: (item) => (
        <span className="text-sm">{item.transferredBy || item.transferredByData?.name || "-"}</span>
      )
    },
    {
      header: t("page.stockTransfer.list.header.status"),
      align: "center",
      render: (item) => {
        const sc = statusCfg[item.status] || statusCfg.pending;
        return (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${sc.class}`}>
            {sc.label}
          </span>
        );
      }
    },
    {
      header: t("page.stockTransfer.list.header.aksi"),
      align: "right",
      render: (item) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-primary"
            onClick={() => navigate(`/stock-transfer/detail?id=${item.id}`)}>
            <Eye size={15} />
          </Button>
          {item.status === "pending" && canAccess(user, MENU_KEY, "delete") && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive"
              onClick={() => setDeleteTarget(item.id)}>
              <Trash2 size={15} />
            </Button>
          )}
          {item.status === "pending" && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-green-600"
                title={t("page.stockTransfer.list.approveTitle")}
                onClick={() => approveMut.mutate(item.id)}>
                <CheckCircle size={15} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive"
                title={t("page.stockTransfer.list.rejectTitle")}
                onClick={() => rejectMut.mutate(item.id)}>
                <XCircle size={15} />
              </Button>
            </>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <motion.div variants={fadeInUp} initial="hidden" animate="show">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <button
            onClick={() => navigate("/dashboard-super-admin")}
            className="hover:text-foreground">
            {t("page.stockTransfer.list.breadcrumb.dashboard")}
          </button>
          <span className="text-xs">/</span>
          <span className="text-primary font-semibold">{t("page.stockTransfer.list.title")}</span>
        </nav>
      </motion.div>
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="show"
        className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t("page.stockTransfer.list.title")}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("page.stockTransfer.list.subtitle")}
          </p>
        </div>
        {canAccess(user, MENU_KEY, "add") && (
          <Button onClick={() => navigate("/add-stock-transfer")} className="shrink-0 gap-2">
            <Plus size={16} /> {t("page.stockTransfer.list.addButton")}
          </Button>
        )}
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
            emptyMessage={t("page.stockTransfer.list.emptyMessage")}
            toolbar={
              <div className="flex items-center gap-3">
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                  className="h-9 px-3 rounded-md border border-input bg-background text-sm">
                  <option value="all">{t("page.stockTransfer.list.filter.allStatus")}</option>
                  {Object.entries(statusCfg).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v.label}
                    </option>
                  ))}
                </select>
                <div className="relative w-full sm:w-64">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <Input
                    placeholder={t("page.stockTransfer.list.placeholder.search")}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 h-9 text-sm"
                  />
                </div>
              </div>
            }
            pagination={{ page, totalPages, total, onPageChange: setPage }}
          />
        </motion.div>
      )}

      <Modal
        type="confirm"
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title={t("page.stockTransfer.list.modal.deleteTitle")}
        description={t("page.stockTransfer.list.modal.deleteDesc")}
        confirmText={t("page.stockTransfer.list.modal.deleteConfirm")}
        onConfirm={() => deleteMut.mutate()}
      />
    </div>
  );
};

export default StockTransferList;
