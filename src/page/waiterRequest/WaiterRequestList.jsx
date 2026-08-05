import React, { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { useCookies } from "react-cookie";
import { useTranslation } from "react-i18next";
import { useGlobalStoreFilter } from "@/hooks/useGlobalStoreFilter";
import { useSocket } from "@/services/socket";
import { getAllLocation } from "@/services/location";
import { Bell, Check, X, CheckCheck, Clock, HandPlatter, MapPin, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { getWaiterRequestList, updateWaiterRequestStatus } from "@/services/waiterRequest";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import DataTable from "@/components/ui/DataTable";
import StatCard from "@/components/ui/StatCard";
import PageHeader from "@/components/ui/PageHeader";
import TableToolbar from "@/components/ui/TableToolbar";
import StoreFilter from "@/components/ui/StoreFilter";
import Modal from "@/components/organism/modal";
import AbortController from "@/components/organism/abort-controller";

const statusOptions = [
  { value: "all", label: "Semua" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "done", label: "Done" }
];

const typeMeta = {
  sendok: { label: "Sendok", icon: "🥄" },
  tisu: { label: "Tisu", icon: "🧻" },
  refill: { label: "Refill", icon: "🥤" },
  bill: { label: "Bill", icon: "🧾" },
  call: { label: "Panggil Pelayan", icon: "🧑‍🍳" }
};

const statusBadge = (status) => {
  const map = {
    pending:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800",
    approved:
      "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800",
    rejected:
      "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800",
    done:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800"
  };
  return map[status] || "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
};

const WaiterRequestList = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [cookie] = useCookies();
  const { socket } = useSocket();
  const [storeFilter, setGlobalStoreFilter] = useGlobalStoreFilter();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [approveTarget, setApproveTarget] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [doneTarget, setDoneTarget] = useState(null);

  const user = cookie?.user;
  const isSuperAdmin = user?.roleType === "super_admin";
  const storeId = isSuperAdmin
    ? storeFilter && storeFilter !== "all"
      ? storeFilter
      : ""
    : cookie?.activeStore || cookie?.user?.store;

  const { data: locData } = useQuery(["locations-waiter-request"], () => getAllLocation(), {
    enabled: isSuperAdmin,
    retry: 1
  });

  const isFiltered = storeFilter !== "all" || statusFilter !== "all";

  const resetFilters = () => {
    setGlobalStoreFilter("all");
    setStatusFilter("pending");
    setPage(1);
  };

  const { data, isLoading, isFetching, isError, refetch } = useQuery(
    ["waiter-request-list", page, limit, storeId, statusFilter],
    () =>
      getWaiterRequestList({
        store: storeId,
        page,
        limit,
        status: statusFilter
      }),
    {
      retry: 1,
      keepPreviousData: true,
      enabled: !!storeId || storeId === ""
    }
  );

  const { data: allData } = useQuery(
    ["waiter-request-all", storeId],
    () =>
      getWaiterRequestList({
        store: storeId,
        page: 1,
        limit: 1,
        status: "all"
      }),
    {
      retry: 1,
      enabled: !!storeId || storeId === ""
    }
  );

  const { data: pendingData } = useQuery(
    ["waiter-request-pending", storeId],
    () =>
      getWaiterRequestList({
        store: storeId,
        page: 1,
        limit: 1,
        status: "pending"
      }),
    {
      retry: 1,
      enabled: !!storeId || storeId === ""
    }
  );

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries(["waiter-request-list"]);
    queryClient.invalidateQueries(["waiter-request-all"]);
    queryClient.invalidateQueries(["waiter-request-pending"]);
  }, [queryClient]);

  useEffect(() => {
    if (socket && storeId) {
      socket.emit("join-store", storeId);
      const onNew = (req) => {
        if (req?.status === "pending") {
          toast.success("Permintaan Pelayan Baru", {
            description: `${typeMeta[req.type]?.label || req.type} dari meja ${
              req.table?.name || req.tableId || "-"
            }`
          });
        }
        invalidate();
      };
      const onChanged = () => invalidate();
      socket.on("waiter-request:new", onNew);
      socket.on("waiter-request:statusChanged", onChanged);
      return () => {
        socket.off("waiter-request:new", onNew);
        socket.off("waiter-request:statusChanged", onChanged);
      };
    }
  }, [socket, storeId, invalidate]);

  const statusMutation = useMutation(
    ({ id, status, notes }) => updateWaiterRequestStatus(id, { status, notes }),
    {
      onSuccess: () => {
        toast.success(t("common.success"));
        setApproveTarget(null);
        setRejectTarget(null);
        setDoneTarget(null);
        invalidate();
      },
      onError: (err) => {
        toast.error(t("common.error"), {
          description: err?.response?.data?.message || err.message
        });
      }
    }
  );

  const rows = data?.data || [];
  const totalAll = allData?.pagination?.total || 0;
  const totalPending = pendingData?.pagination?.total || 0;

  const columns = [
    {
      header: "No. Request",
      accessorKey: "requestNumber",
      cell: ({ row }) => (
        <span className="font-mono font-semibold text-foreground">{row.original.requestNumber}</span>
      )
    },
    {
      header: "Permintaan",
      accessorKey: "type",
      cell: ({ row }) => {
        const meta = typeMeta[row.original.type] || { label: row.original.type, icon: "🧑‍🍳" };
        return (
          <div className="flex items-center gap-2">
            <span className="text-lg">{meta.icon}</span>
            <span className="font-medium text-foreground">{meta.label}</span>
          </div>
        );
      }
    },
    {
      header: "Meja",
      accessorKey: "table",
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5 text-sm">
          <MapPin size={14} className="text-muted-foreground" />
          <span>{row.original.table?.name || (row.original.tableId ? `Meja ${row.original.tableId}` : "-")}</span>
        </div>
      )
    },
    {
      header: "Keterangan",
      accessorKey: "notes",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground line-clamp-1 max-w-[220px]">
          {row.original.notes || "-"}
        </span>
      )
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: ({ row }) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadge(row.original.status)}`}>
          {row.original.status?.toUpperCase()}
        </span>
      )
    },
    {
      header: "Waktu",
      accessorKey: "createdAt",
      cell: ({ row }) => {
        const d = new Date(row.original.createdAt);
        return (
          <div className="text-sm text-muted-foreground">
            {d.toLocaleDateString("id-ID", { day: "numeric", month: "short" })},{" "}
            {d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
          </div>
        );
      }
    },
    {
      header: t("common.action"),
      accessorKey: "actions",
      legend: [
        { icon: Check, label: t("common.approve") },
        { icon: X, label: t("common.reject") },
        { icon: CheckCheck, label: t("common.completed") }
      ],
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex items-center gap-1">
            {item.status === "pending" && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-green-600"
                  title="Setujui"
                  onClick={() => setApproveTarget(item)}>
                  <Check size={16} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-red-600"
                  title="Tolak"
                  onClick={() => setRejectTarget(item)}>
                  <X size={16} />
                </Button>
              </>
            )}
            {item.status === "approved" && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-blue-600"
                title="Tandai Selesai"
                onClick={() => setDoneTarget(item)}>
                <CheckCheck size={16} />
              </Button>
            )}
          </div>
        );
      }
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[
          {
            href:
              user?.roleType === "super_admin"
                ? "/dashboard-super-admin"
                : user?.roleType === "admin"
                  ? "/dashboard-admin"
                  : "/home",
            i18nKey: "breadcrumb.home"
          },
          { i18nKey: "sidebar.waiterRequest" }
        ]}
        title="Permintaan Pelayan"
        description="Kelola permintaan pelayan dari pelanggan (call waiter, sendok, tisu, bill, dll).">
        <Button variant="outline" size="sm" className="gap-2" onClick={() => refetch()}>
          <RefreshCw size={16} className={isFetching ? "animate-spin" : ""} />
          Refresh
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Total Permintaan"
          value={totalAll}
          icon={HandPlatter}
          loading={isLoading}
        />
        <StatCard
          title="Menunggu"
          value={totalPending}
          icon={Bell}
          loading={isLoading}
          className="border-yellow-200 dark:border-yellow-800"
        />
        <StatCard
          title="Menunggu Approval"
          value={totalPending}
          icon={Clock}
          loading={isLoading}
          className="border-blue-200 dark:border-blue-800"
        />
      </div>

      {isError ? (
        <AbortController refetch={refetch} />
      ) : (
        <div className="bg-card rounded-xl border border-border p-4">
          <DataTable
            columns={columns}
            data={rows}
            loading={isLoading}
            isFetching={isFetching}
          toolbar={
            <TableToolbar
              title="Daftar Permintaan Pelayan"
              onReset={resetFilters}
              isFiltered={isFiltered}>
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
                  Filter Status
                </label>
                <Combobox
                  options={statusOptions}
                  value={statusFilter}
                  onChange={(val) => {
                    setStatusFilter(val);
                    setPage(1);
                  }}
                  placeholder="Filter Status"
                  searchPlaceholder="Cari..."
                />
              </div>
            </TableToolbar>
          }
          pagination={data?.pagination}
          onPageChange={setPage}
          onLimitChange={setLimit}
          emptyMessage="Belum ada permintaan pelayan."
        />
        </div>
      )}

      {/* Approve Modal */}
      <Modal
        type="confirm"
        open={!!approveTarget}
        onOpenChange={(open) => !open && setApproveTarget(null)}
        title="Setujui Permintaan"
        description={`Setujui permintaan "${typeMeta[approveTarget?.type]?.label || approveTarget?.type}" dari meja ${
          approveTarget?.table?.name || approveTarget?.tableId || "-"
        }?`}
        confirmText="Setujui"
        onConfirm={() =>
          statusMutation.mutate({ id: approveTarget?.id, status: "approved" })
        }
        isLoading={statusMutation.isLoading}
      />

      {/* Reject Modal */}
      <Modal
        type="confirm"
        open={!!rejectTarget}
        onOpenChange={(open) => !open && setRejectTarget(null)}
        title="Tolak Permintaan"
        description={`Tolak permintaan "${typeMeta[rejectTarget?.type]?.label || rejectTarget?.type}" dari meja ${
          rejectTarget?.table?.name || rejectTarget?.tableId || "-"
        }?`}
        confirmText="Tolak"
        confirmVariant="destructive"
        onConfirm={() =>
          statusMutation.mutate({ id: rejectTarget?.id, status: "rejected" })
        }
        isLoading={statusMutation.isLoading}
      />

      {/* Done Modal */}
      <Modal
        type="confirm"
        open={!!doneTarget}
        onOpenChange={(open) => !open && setDoneTarget(null)}
        title="Tandai Selesai"
        description={`Tandai permintaan "${typeMeta[doneTarget?.type]?.label || doneTarget?.type}" dari meja ${
          doneTarget?.table?.name || doneTarget?.tableId || "-"
        } sebagai selesai?`}
        confirmText="Selesai"
        onConfirm={() => statusMutation.mutate({ id: doneTarget?.id, status: "done" })}
        isLoading={statusMutation.isLoading}
      />
    </div>
  );
};

export default WaiterRequestList;
