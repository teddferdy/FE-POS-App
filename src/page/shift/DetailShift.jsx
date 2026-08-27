import React, { useMemo } from "react";
import { useQuery } from "react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  Edit3,
  Calendar,
  Clock,
  Users,
  Store,
  Briefcase,
  Building2,
  BadgeCheck,
  Hash,
  User,
  RefreshCcw
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getShiftById } from "@/services/shift";
import { getAllEmployee } from "@/services/employee";
import { getAllLocation } from "@/services/location";
import { resolveKaryawan, groupKaryawanByStore, splitKaryawanByStore } from "./shiftMembers";
import { cn } from "@/lib/utils";

const statusBadge = (status, t) => {
  if (status === "active" || status === true || status === 1)
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800">
        <span className="w-1.5 h-1.5 rounded-full bg-green-500 dark:bg-green-400" />
        {t("common.active")}
      </span>
    );
  if (status === "draft")
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 dark:bg-amber-400" />
        {t("common.draft")}
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800">
      <span className="w-1.5 h-1.5 rounded-full bg-red-500 dark:bg-red-400" />
      {t("common.inactive")}
    </span>
  );
};

const typeBadge = (type) => (
  <span
    className={cn(
      "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold capitalize",
      type === "mingguan"
        ? "bg-violet-100 text-violet-700 border border-violet-200 dark:bg-violet-900/30 dark:text-violet-400 dark:border-violet-800"
        : "bg-sky-100 text-sky-700 border border-sky-200 dark:bg-sky-900/30 dark:text-sky-400 dark:border-sky-800"
    )}>
    <RefreshCcw size={11} />
    {type || "harian"}
  </span>
);

const fmtDate = (d, withTime = false) =>
  d
    ? new Date(d).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
        ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {})
      })
    : "-";

const InfoRow = ({ icon: Icon, label, children, iconClass }) => (
  <div>
    <p className="text-xs text-muted-foreground mb-1.5">{label}</p>
    <div
      className={cn(
        "flex items-center gap-2 text-sm font-medium rounded-lg border border-border/60 bg-background px-3 py-2.5",
        iconClass
      )}>
      <Icon size={14} className={iconClass || "text-muted-foreground"} />
      {children}
    </div>
  </div>
);

const DetailShift = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");

  const { data, isLoading, isError, refetch } = useQuery(
    ["shifts-detail", id],
    () => getShiftById(id),
    { enabled: !!id }
  );

  const shift = data?.data;

  const { data: empQuery } = useQuery(
    ["employees-shift-detail"],
    () => getAllEmployee({ limit: 100 }),
    {
      enabled: !!shift
    }
  );
  const employee = useMemo(() => empQuery?.data || empQuery?.employees || [], [empQuery]);
  const memberRows = useMemo(
    () => resolveKaryawan(shift?.karyawan, employee),
    [shift?.karyawan, employee]
  );
  const { matching, mismatch } = useMemo(
    () => splitKaryawanByStore(memberRows, shift?.store),
    [memberRows, shift?.store]
  );
  const storeGroups = useMemo(() => groupKaryawanByStore(matching), [matching]);
  const mismatchGroups = useMemo(() => groupKaryawanByStore(mismatch), [mismatch]);
  const resolvedCount = matching.filter((r) => r.emp).length;

  const { data: locQuery } = useQuery(["locations-shift-detail"], () => getAllLocation("active"));
  const locationName = useMemo(
    () => locQuery?.data?.find((l) => String(l.id) === String(shift?.store))?.name || null,
    [locQuery?.data, shift?.store]
  );

  if (!id)
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">ID shift tidak ditemukan</p>
      </div>
    );

  if (isLoading)
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-sm">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-4 w-28" />
            </div>
          </div>
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-5 col-span-1 md:col-span-2 space-y-4">
            <Skeleton className="h-6 w-32" />
            <div className="grid grid-cols-2 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
          </Card>
          <div className="space-y-4">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </div>
    );

  if (isError || !shift)
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-muted-foreground">Data shift tidak ditemukan</p>
        <Button variant="outline" onClick={() => refetch()}>
          {t("common.retry")}
        </Button>
        <Button variant="ghost" onClick={() => navigate("/shift-list")}>
          {t("common.back")}
        </Button>
      </div>
    );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <button
          onClick={() => navigate("/dashboard-super-admin")}
          className="hover:text-foreground transition-colors">
          {t("breadcrumb.home")}
        </button>
        <span className="text-xs">/</span>
        <button
          onClick={() => navigate("/shift-list")}
          className="hover:text-foreground transition-colors">
          {t("page.shift.list.title")}
        </button>
        <span className="text-xs">/</span>
        <span className="text-primary font-semibold">{shift.nama_shift || "Detail"}</span>
      </nav>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3.5">
          <Button
            variant="outline"
            size="icon"
            className="shrink-0"
            onClick={() => navigate("/shift-list")}>
            <ArrowLeft size={16} />
          </Button>
          <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <CalendarDays size={26} />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl font-bold">{shift.nama_shift || "-"}</h1>
              {typeBadge(shift.tipe_shift)}
            </div>
            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
              <Store size={13} />
              {locationName || `Toko #${shift.store || "-"}`}
              <span className="text-muted-foreground/50">•</span>
              {statusBadge(shift.status, t)}
            </div>
          </div>
        </div>
        <Button variant="outline" onClick={() => navigate(`/edit-shift?id=${id}`)}>
          <Edit3 size={14} className="mr-1.5" />
          {t("common.edit")}
        </Button>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Info Card */}
        <Card className="p-5 col-span-1 md:col-span-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-5">
            <BadgeCheck size={16} />
            Informasi Shift
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">
            <InfoRow icon={Hash} label="ID">
              <span className="font-mono">#{shift.id}</span>
            </InfoRow>
            <InfoRow icon={Store} label="Toko" iconClass="text-primary">
              {locationName || `Toko #${shift.store || "Semua"}`}
            </InfoRow>
            <InfoRow icon={CalendarDays} label={t("page.shift.table.name")}>
              {shift.nama_shift || "-"}
            </InfoRow>
            <InfoRow icon={RefreshCcw} label="Tipe Shift">
              <span className="capitalize">{shift.tipe_shift || "harian"}</span>
            </InfoRow>
            <InfoRow icon={BadgeCheck} label={t("page.shift.table.status")}>
              {statusBadge(shift.status, t)}
            </InfoRow>
            <InfoRow icon={Calendar} label="Tanggal Mulai">
              {fmtDate(shift.tanggal_mulai)}
            </InfoRow>
            <InfoRow icon={Calendar} label="Tanggal Selesai">
              {fmtDate(shift.tanggal_selesai)}
            </InfoRow>
          </div>
        </Card>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Schedule */}
          <Card className="p-5">
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3.5">
              <Clock size={14} />
              Jadwal Waktu
            </div>
            <div className="relative">
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-primary/5 rounded-lg p-3.5">
                  <p className="text-xs text-muted-foreground mb-1">Jam Mulai</p>
                  <p className="text-2xl font-bold font-mono text-primary">
                    {shift.jam_mulai?.slice(0, 5) || "-"}
                  </p>
                </div>
                <div className="h-10 w-8 flex items-center justify-center text-xl text-muted-foreground/40">
                  →
                </div>
                <div className="flex-1 bg-primary/5 rounded-lg p-3.5">
                  <p className="text-xs text-muted-foreground mb-1">Jam Selesai</p>
                  <p className="text-2xl font-bold font-mono text-primary">
                    {shift.jam_selesai?.slice(0, 5) || "-"}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Karyawan */}
          <Card className="p-5">
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3.5">
              <Users size={14} />
              Karyawan
              <span className="ml-auto inline-flex items-center justify-center h-6 min-w-6 px-1.5 rounded-full bg-primary/10 text-primary text-sm font-bold">
                {matching.length}
              </span>
            </div>
            {storeGroups.length > 0 ? (
              <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
                {storeGroups.map((g) => (
                  <div key={g.key}>
                    <div className="flex items-center gap-1.5 mb-2">
                      {g.iconType === "missing" ? (
                        <User size={12} className="shrink-0 text-muted-foreground" />
                      ) : (
                        <Store size={12} className="shrink-0 text-primary" />
                      )}
                      <p className="flex-1 min-w-0 truncate text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                        {g.label}
                      </p>
                      <span className="shrink-0 inline-flex items-center justify-center h-5 min-w-5 px-1 rounded-md bg-muted text-[10px] font-bold text-muted-foreground">
                        {g.members.length}
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      {g.members.map(({ key, emp }) =>
                        emp ? (
                          <div
                            key={key}
                            className="flex items-center gap-2.5 rounded-lg border border-border/60 p-2">
                            {emp.image ? (
                              <img
                                src={emp.image}
                                alt={emp.fullName || emp.name}
                                className="w-8 h-8 rounded-full object-cover shrink-0"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                <span className="text-xs font-bold text-primary">
                                  {(emp.fullName || emp.name || "?")[0]}
                                </span>
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">
                                {emp.fullName || emp.name || "-"}
                              </p>
                              <div className="flex items-center gap-2 text-[11px] text-muted-foreground flex-wrap">
                                {emp.positionData?.name && (
                                  <span className="inline-flex items-center gap-1 min-w-0">
                                    <Briefcase size={10} className="shrink-0" />
                                    <span className="truncate">{emp.positionData.name}</span>
                                  </span>
                                )}
                                {emp.departmentData?.name && (
                                  <span className="inline-flex items-center gap-1 min-w-0">
                                    <Building2 size={10} className="shrink-0" />
                                    <span className="truncate">{emp.departmentData.name}</span>
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div
                            key={key}
                            className="flex items-center gap-2.5 rounded-lg border border-dashed border-border/70 p-2 text-muted-foreground">
                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                              <User size={13} className="opacity-50" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground/70">
                                Karyawan #{key}
                              </p>
                              <p className="text-[11px]">Tidak ditemukan di daftar karyawan</p>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Tidak ada karyawan</p>
            )}
            {mismatch.length > 0 && (
              <div className="mt-3 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/10 px-3 py-2.5">
                <p className="text-[11px] font-medium text-amber-800 dark:text-amber-300 flex items-start gap-1.5">
                  <Store size={11} className="shrink-0 mt-0.5" />
                  <span>
                    {mismatch.length} karyawan tidak sesuai dengan toko shift ini (
                    {mismatchGroups.map((g) => g.label || "Tidak ditemukan").join(", ")}
                    ). Sesuaikan anggota shift melalui halaman edit.
                  </span>
                </p>
              </div>
            )}
            {resolvedCount > 0 && resolvedCount < matching.length && (
              <p className="mt-3 pt-3 border-t border-border/60 text-[11px] text-muted-foreground">
                {resolvedCount} dari {matching.length} karyawan ditemukan.
              </p>
            )}
          </Card>

          {/* Metadata */}
          <Card className="p-5">
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3.5">
              <BadgeCheck size={14} />
              Riwayat
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Users size={11} className="shrink-0" />
                <span className="whitespace-nowrap">
                  Dibuat Oleh:{" "}
                  <span className="text-foreground/70 font-medium">
                    {shift.createdByUser?.fullName || shift.createdByUser?.userName || "-"}
                  </span>
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <RefreshCcw size={11} className="shrink-0" />
                <span className="whitespace-nowrap">
                  Diubah Oleh:{" "}
                  <span className="text-foreground/70 font-medium">
                    {shift.modifiedByUser?.fullName || shift.modifiedByUser?.userName || "-"}
                  </span>
                </span>
              </div>
            </div>
            <div className="mt-4 space-y-2 pt-3 border-t border-border/60">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  {t("page.shift.table.createdAt") || "Dibuat"}
                </span>
                <span className="font-medium">{fmtDate(shift.createdAt, true)}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Diubah</span>
                <span className="font-medium">{fmtDate(shift.updatedAt, true)}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DetailShift;
