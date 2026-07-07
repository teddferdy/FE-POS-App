import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { Plus, Search, Eye, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { canAccess } from "@/utils/permission";
import {
  getTransferHistory,
  receiveStockTransfer,
  cancelStockTransfer
} from "@/services/stock-transfer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DataTable from "@/components/ui/DataTable";
import AbortController from "@/components/organism/abort-controller";
import { getAllLocation } from "@/services/location";
import NoStore from "@/components/ui/NoStore";

const statusCfg = {
  sent: {
    label: "Sent",
    class: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
  },
  received: {
    label: "Received",
    class: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
  },
  cancelled: {
    label: "Cancelled",
    class: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
  },
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

const StockTransferList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [cookie] = useCookies();
  const user = cookie?.user;
  const isSuperAdmin = user?.roleType === "super_admin";
  const store = user?.store || "";
  const MENU_KEY = "/stock-transfer";
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: locData } = useQuery(["locations-stock-transfer"], () => getAllLocation(), {
    staleTime: 5 * 60 * 1000,
    enabled: isSuperAdmin
  });

  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery(
    ["stock-transfers", page, limit, search, statusFilter],
    () =>
      getTransferHistory({
        store,
        page,
        limit,
        search: search || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined
      }),
    { keepPreviousData: true }
  );

  const receiveMutation = useMutation(receiveStockTransfer, {
    onSuccess: () => {
      toast.success(t("page.stockTransfer.list.receiveSuccess"));
      queryClient.invalidateQueries("stock-transfers");
    },
    onError: (err) => toast.error(err.message)
  });

  const cancelMutation = useMutation(cancelStockTransfer, {
    onSuccess: () => {
      toast.success(t("page.stockTransfer.list.cancelSuccess"));
      queryClient.invalidateQueries("stock-transfers");
    },
    onError: (err) => toast.error(err.message)
  });

  const items = data?.data || [];
  const total = data?.pagination?.total || 0;
  const totalPages = data?.pagination?.totalPages || 1;

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
          {item.status === "sent" && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-green-600"
                title={t("page.stockTransfer.list.receive")}
                onClick={() => receiveMutation.mutate(item.id)}>
                <CheckCircle size={15} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-red-600"
                title={t("page.stockTransfer.list.cancel")}
                onClick={() => cancelMutation.mutate(item.id)}>
                <XCircle size={15} />
              </Button>
            </>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-primary"
            onClick={() => navigate(`/stock-transfer/detail?id=${item.id}`)}>
            <Eye size={15} />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {locData && (locData?.data || []).length === 0 ? (
        <div className="space-y-6">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <button
              onClick={() => navigate("/dashboard-super-admin")}
              className="hover:text-foreground transition-colors">
              {t("breadcrumb.home")}
            </button>
            <span className="text-xs">/</span>
            <span className="text-primary font-semibold">{t("page.stockTransfer.list.title")}</span>
          </nav>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
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
          </div>
          <NoStore />
        </div>
      ) : (
        <>
          <div>
            <nav className="flex items-center gap-2 text-sm text-muted-foreground">
              <button
                onClick={() => navigate("/dashboard-super-admin")}
                className="hover:text-foreground transition-colors">
                {t("breadcrumb.home")}
              </button>
              <span className="text-xs">/</span>
              <span className="text-primary font-semibold">
                {t("page.stockTransfer.list.title")}
              </span>
            </nav>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
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
          </div>

          {isError ? (
            <AbortController refetch={refetch} />
          ) : (
            <div>
              <DataTable
                columns={columns}
                  data={items}
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
                        onChange={(e) => {
                          setSearch(e.target.value);
                          setPage(1);
                        }}
                        className="pl-9 h-9 text-sm"
                      />
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
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default StockTransferList;
