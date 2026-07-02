import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Calendar, Users, Clock, Check, X, Eye } from "lucide-react";
import { getReservations, deleteReservation, updateReservation } from "@/services/reservation";
import { Button } from "@/components/ui/button";
import Modal from "@/components/organism/modal";
import DataTable from "@/components/ui/DataTable";
import { useTranslation } from "react-i18next";
import { DatePicker } from "@/components/ui/date-picker";
import { format } from "date-fns";
import AbortController from "@/components/organism/abort-controller";
import { getAllLocation } from "@/services/location";
import NoStore from "@/components/ui/NoStore";
import StatCard from "@/components/ui/StatCard";

const ReservationList = () => {
  const { t } = useTranslation();
  const [cookie] = useCookies();
  const user = cookie?.user;
  const isSuperAdmin = user?.roleType === "super_admin";

  const STATUS_MAP = {
    pending: {
      label: t("page.reservation.status.pending"),
      color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
    },
    confirmed: {
      label: t("page.reservation.status.confirmed"),
      color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
    },
    cancelled: {
      label: t("page.reservation.status.cancelled"),
      color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
    },
    completed: {
      label: t("page.reservation.status.completed"),
      color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
    },
    no_show: {
      label: t("page.reservation.status.noShow"),
      color: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
    }
  };
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [dateFilter, setDateFilter] = useState(undefined);
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [confirmTarget, setConfirmTarget] = useState(null);

  const { data: locData } = useQuery(["locations-reservations"], () => getAllLocation(), {
    staleTime: 5 * 60 * 1000,
    enabled: isSuperAdmin
  });
  const storeMap = Object.fromEntries((locData?.data || []).map((s) => [String(s.id), s.name]));

  const statusMutation = useMutation(({ id, status }) => updateReservation({ id, status }), {
    onSuccess: () => {
      queryClient.invalidateQueries(["reservations"]);
      toast.success(t("common.success"));
    },
    onError: (err) =>
      toast.error(t("common.failed"), {
        description: err?.response?.data?.message || err.message
      })
  });

  const { data, isLoading, isError, refetch } = useQuery(
    ["reservations", page, limit, dateFilter, statusFilter],
    () =>
      getReservations({
        page,
        limit,
        date: dateFilter ? format(dateFilter, "yyyy-MM-dd") : undefined,
        status: statusFilter !== "all" ? statusFilter : undefined
      }),
    { keepPreviousData: true }
  );

  const deleteMutation = useMutation(deleteReservation, {
    onSuccess: () => {
      toast.success(t("common.success"), {
        description: t("page.reservation.toast.deleteSuccess")
      });
      queryClient.invalidateQueries(["reservations"]);
    },
    onError: (err) =>
      toast.error(t("common.failed"), { description: err?.response?.data?.message || err.message })
  });

  const reservations = data?.data || [];
  const total = data?.totalItems || 0;
  const totalPages = data?.totalPages || 1;
  const stats = data?.stats || {};

  const formatDate = (d) => {
    if (!d) return "-";
    return new Date(d + "T00:00:00").toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };

  const formatTime = (t) => t?.slice(0, 5) || "-";

  const columns = [
    {
      header: t("page.reservation.columns.customer"),
      render: (item) => (
        <div className="flex flex-col">
          <span className="font-medium text-foreground">{item.customerName}</span>
          {item.customerPhone && (
            <span className="text-xs text-muted-foreground">{item.customerPhone}</span>
          )}
          {item.customerEmail && (
            <span className="text-xs text-muted-foreground">{item.customerEmail}</span>
          )}
        </div>
      )
    },
    {
      header: t("page.reservation.columns.store"),
      render: (item) => storeMap[String(item.store)] || `Store #${item.store}`
    },
    {
      header: t("page.reservation.columns.table"),
      render: (item) =>
        item.tableId ? `${t("page.reservation.tablePrefix")} ${item.tableId}` : "-"
    },
    {
      header: t("page.reservation.columns.date"),
      render: (item) => formatDate(item.reservationDate)
    },
    {
      header: t("page.reservation.columns.time"),
      render: (item) => (
        <div className="flex items-center gap-1 text-sm">
          <Clock size={14} className="text-muted-foreground" />
          {formatTime(item.startTime)} {item.endTime ? `- ${formatTime(item.endTime)}` : ""}
        </div>
      )
    },
    {
      header: t("page.reservation.columns.guests"),
      render: (item) => (
        <div className="flex items-center gap-1 text-sm">
          <Users size={14} className="text-muted-foreground" />
          {item.guestCount} {t("page.reservation.guestSuffix")}
        </div>
      )
    },
    {
      header: t("page.reservation.columns.status"),
      render: (item) => {
        const s = STATUS_MAP[item.status] || STATUS_MAP.pending;
        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${s.color}`}>
            {s.label}
          </span>
        );
      }
    },
    {
      header: t("page.reservation.columns.notes"),
      render: (item) => (
        <span className="text-sm text-muted-foreground max-w-[150px] truncate block">
          {item.notes || "-"}
        </span>
      )
    },
    {
      header: t("page.reservation.columns.actions"),
      align: "right",
      stickyRight: true,
      render: (item) => (
        <div className="flex items-center justify-end gap-1">
          {item.status === "pending" && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-green-600"
                disabled={statusMutation.isLoading}
                onClick={() =>
                  setConfirmTarget({
                    id: item.id,
                    status: "confirmed",
                    customerName: item.customerName
                  })
                }>
                <Check size={15} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-red-600"
                disabled={statusMutation.isLoading}
                onClick={() =>
                  setConfirmTarget({
                    id: item.id,
                    status: "cancelled",
                    customerName: item.customerName
                  })
                }>
                <X size={15} />
              </Button>
            </>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => navigate(`/reservation/${item.id}`)}>
            <Eye size={15} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-primary"
            onClick={() => navigate(`/edit-reservation?id=${item.id}`)}>
            <Edit size={15} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive"
            onClick={() => setDeleteTarget(item)}>
            <Trash2 size={15} />
          </Button>
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
        <span className="text-primary font-semibold">{t("page.reservation.title")}</span>
      </nav>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("page.reservation.title")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t("page.reservation.description")}</p>
        </div>
        <Button onClick={() => navigate("/add-reservation")} className="gap-2">
          <Plus size={18} /> {t("page.reservation.addButton")}
        </Button>
      </div>

      {isError ? (
        <AbortController refetch={refetch} />
      ) : (
        <>
          {locData && (locData?.data || []).length === 0 ? <NoStore /> : (
            <><div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard
              label={t("page.reservation.stats.total")}
              value={stats.total ?? total}
              icon="calendar_month"
              variant="default"
            />
            <StatCard
              label={t("page.reservation.status.confirmed")}
              value={stats.confirmed ?? 0}
              icon="check_circle"
              variant="active"
            />
            <StatCard
              label={t("page.reservation.status.pending")}
              value={stats.pending ?? 0}
              icon="pending"
              variant="draft"
            />
            <StatCard
              label={t("page.reservation.status.cancelled")}
              value={stats.cancelled ?? 0}
              icon="cancel"
              variant="inactive"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="w-full sm:w-60">
              <DatePicker
                date={dateFilter}
                setDate={(date) => {
                  setDateFilter(date);
                  setPage(1);
                }}
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="h-10 rounded-lg border border-input bg-background px-3 text-sm">
              <option value="all">{t("page.reservation.filter.allStatus")}</option>
              <option value="pending">{t("page.reservation.status.pending")}</option>
              <option value="confirmed">{t("page.reservation.status.confirmed")}</option>
              <option value="cancelled">{t("page.reservation.status.cancelled")}</option>
              <option value="completed">{t("page.reservation.status.completed")}</option>
              <option value="no_show">{t("page.reservation.status.noShow")}</option>
            </select>
          </div>

          <div>
            <DataTable
              columns={columns}
              data={reservations}
              isLoading={isLoading}
              emptyMessage={t("page.reservation.empty")}
              emptyIcon={Calendar}
              pagination={{ page, totalPages, total, onPageChange: setPage }}
            />
          </div>
        </>
      )}
        </>
      )}

      <Modal
        type="confirm"
        open={!!confirmTarget}
        onOpenChange={(open) => !open && setConfirmTarget(null)}
        title={
          confirmTarget?.status === "confirmed"
            ? t("page.reservation.confirmTitle")
            : t("page.reservation.cancelTitle")
        }
        description={
          confirmTarget?.status === "confirmed"
            ? t("page.reservation.confirmDesc", { name: confirmTarget?.customerName || "" })
            : t("page.reservation.cancelDesc", { name: confirmTarget?.customerName || "" })
        }
        confirmText={t("common.yes")}
        loading={statusMutation.isLoading}
        onConfirm={() => {
          statusMutation.mutate({ id: confirmTarget.id, status: confirmTarget.status });
          setConfirmTarget(null);
        }}
      />

      <Modal
        type="confirm"
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={t("page.reservation.deleteTitle")}
        description={t("page.reservation.deleteDesc", { name: deleteTarget?.customerName || "" })}
        confirmText={t("page.reservation.deleteConfirm")}
        loading={deleteMutation.isLoading}
        onConfirm={() => {
          deleteMutation.mutate(deleteTarget.id);
          setDeleteTarget(null);
        }}
      />
    </div>
  );
};

export default ReservationList;
