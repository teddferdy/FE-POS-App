import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Plus, Search, Edit, Trash2, Calendar, Users, Clock } from "lucide-react";
import { getReservations, deleteReservation } from "@/services/reservation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Modal from "@/components/organism/modal";
import DataTable from "@/components/ui/DataTable";
import { useTranslation } from "react-i18next";
import { canAccess } from "@/utils/permission";
import { DatePicker } from "@/components/ui/date-picker";
import { format } from "date-fns";

const STATUS_MAP = {
  pending: { label: "Menunggu", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" },
  confirmed: { label: "Dikonfirmasi", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" },
  cancelled: { label: "Dibatalkan", color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" },
  completed: { label: "Selesai", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" },
  no_show: { label: "Tidak Hadir", color: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400" }
};

const ReservationList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [dateFilter, setDateFilter] = useState(undefined);
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data, isLoading } = useQuery(
    ["reservations", page, limit, dateFilter, statusFilter],
    () => getReservations({ page, limit, date: dateFilter ? format(dateFilter, "yyyy-MM-dd") : undefined, status: statusFilter !== "all" ? statusFilter : undefined }),
    { keepPreviousData: true }
  );

  const deleteMutation = useMutation(deleteReservation, {
    onSuccess: () => {
      toast.success("Berhasil", { description: "Reservasi berhasil dihapus" });
      queryClient.invalidateQueries(["reservations"]);
    },
    onError: (err) => toast.error("Gagal", { description: err?.response?.data?.message || err.message })
  });

  const reservations = data?.data || [];
  const total = data?.totalItems || 0;
  const totalPages = data?.totalPages || 1;

  const formatDate = (d) => {
    if (!d) return "-";
    return new Date(d + "T00:00:00").toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
  };

  const formatTime = (t) => t?.slice(0, 5) || "-";

  const columns = [
    {
      header: "Customer",
      render: (item) => (
        <div className="flex flex-col">
          <span className="font-medium text-foreground">{item.customerName}</span>
          {item.customerPhone && <span className="text-xs text-muted-foreground">{item.customerPhone}</span>}
        </div>
      )
    },
    { header: "Tanggal", render: (item) => formatDate(item.reservationDate) },
    {
      header: "Jam",
      render: (item) => (
        <div className="flex items-center gap-1 text-sm">
          <Clock size={14} className="text-muted-foreground" />
          {formatTime(item.startTime)} {item.endTime ? `- ${formatTime(item.endTime)}` : ""}
        </div>
      )
    },
    {
      header: "Tamu",
      render: (item) => (
        <div className="flex items-center gap-1 text-sm">
          <Users size={14} className="text-muted-foreground" />
          {item.guestCount} org
        </div>
      )
    },
    {
      header: "Status",
      render: (item) => {
        const s = STATUS_MAP[item.status] || STATUS_MAP.pending;
        return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${s.color}`}>{s.label}</span>;
      }
    },
    {
      header: "Aksi",
      align: "right",
      render: (item) => (
        <div className="flex items-center justify-end gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-primary"
            onClick={() => navigate(`/edit-reservation?id=${item.id}`)}>
            <Edit size={15} />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"
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
        <button onClick={() => navigate("/dashboard-super-admin")} className="hover:text-foreground transition-colors">
          {t("breadcrumb.home")}
        </button>
        <span className="text-xs">/</span>
        <span className="text-primary font-semibold">Reservasi Meja</span>
      </nav>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reservasi Meja</h1>
          <p className="text-sm text-muted-foreground mt-1">Kelola reservasi meja customer</p>
        </div>
        <Button onClick={() => navigate("/add-reservation")} className="gap-2">
          <Plus size={18} /> Tambah Reservasi
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="w-full sm:w-60">
          <DatePicker date={dateFilter} setDate={(date) => { setDateFilter(date); setPage(1); }} />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="h-10 rounded-lg border border-input bg-background px-3 text-sm">
          <option value="all">Semua Status</option>
          <option value="pending">Menunggu</option>
          <option value="confirmed">Dikonfirmasi</option>
          <option value="cancelled">Dibatalkan</option>
          <option value="completed">Selesai</option>
          <option value="no_show">Tidak Hadir</option>
        </select>
      </div>

      <DataTable
        columns={columns}
        data={reservations}
        isLoading={isLoading}
        emptyMessage="Belum ada reservasi"
        emptyIcon={Calendar}
        pagination={{ page, totalPages, total, onPageChange: setPage }}
      />

      <Modal
        type="confirm"
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Hapus Reservasi?"
        description={`Yakin ingin menghapus reservasi ${deleteTarget?.customerName || ""}?`}
        confirmText="Ya, Hapus"
        onConfirm={() => { deleteMutation.mutate(deleteTarget.id); setDeleteTarget(null); }}
      />
    </div>
  );
};

export default ReservationList;
