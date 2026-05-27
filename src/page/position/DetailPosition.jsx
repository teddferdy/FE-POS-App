import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "react-query";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { getAllPositionTable } from "@/services/position";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/loading";

const DetailPosition = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const positionId = searchParams.get("positionID");

  const { data, isLoading } = useQuery(
    ["position-detail", positionId],
    () => getAllPositionTable({ page: 1, limit: 100, statusRole: "all" }),
    {
      enabled: !!positionId,
      select: (res) => {
        const list = res?.data || [];
        return list.find((p) => String(p.id) === positionId);
      }
    }
  );

  const position = data;

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    try {
      return format(new Date(dateStr), "dd MMM yyyy", { locale: id });
    } catch {
      return "-";
    }
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return "-";
    try {
      return format(new Date(dateStr), "dd MMM yyyy, HH:mm", { locale: id });
    } catch {
      return "-";
    }
  };

  if (!positionId) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground gap-3">
        <span className="material-symbols-outlined text-4xl">badge</span>
        <p>ID posisi tidak ditemukan</p>
        <Button variant="outline" onClick={() => navigate("/position-list")}>
          Kembali
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loading />
      </div>
    );
  }

  if (!position) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground gap-3">
        <span className="material-symbols-outlined text-4xl">badge</span>
        <p>Posisi tidak ditemukan</p>
        <Button variant="outline" onClick={() => navigate("/position-list")}>
          Kembali
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <nav className="flex gap-2 mb-2 text-sm text-muted-foreground">
            <span>Manajemen SDM</span>
            <span>/</span>
            <button
              onClick={() => navigate("/position-list")}
              className="hover:text-primary transition-colors">
              Kelola Posisi
            </button>
            <span>/</span>
            <span className="text-primary font-semibold">Detail Posisi</span>
          </nav>
          <h2 className="text-2xl font-bold text-foreground tracking-tight">{position.name}</h2>
          <p className="text-sm text-muted-foreground mt-1">Informasi detail jabatan dan sistem.</p>
        </div>
        <Button
          onClick={() => navigate(`/edit-position?id=${position.id}`)}
          className="flex items-center gap-2 px-6 py-2.5 rounded-lg shadow-sm">
          <span className="material-symbols-outlined text-lg">edit</span>
          Edit Posisi
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card rounded-xl shadow-sm border border-border p-6">
            <div className="flex items-center gap-3 mb-5 pb-3 border-b border-border">
              <span className="material-symbols-outlined text-primary">badge</span>
              <h3 className="text-base font-semibold text-foreground">Informasi Jabatan</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Nama Jabatan
                </label>
                <p className="text-sm font-semibold text-foreground mt-1">{position.name || "-"}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  ID Jabatan
                </label>
                <p className="text-sm font-semibold text-foreground mt-1 font-mono">
                  #{position.id || "-"}
                </p>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Status
                </label>
                <div>
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 mt-1 rounded-full text-xs font-bold uppercase tracking-tight ${
                      position.status
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800"
                        : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800"
                    }`}>
                    <span className="material-symbols-outlined text-sm">
                      {position.status ? "check_circle" : "cancel"}
                    </span>
                    {position.status ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-5 pt-5 border-t border-border">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Deskripsi
              </label>
              <p className="text-sm text-foreground mt-1">
                {position.description || "Tidak ada deskripsi"}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-card rounded-xl shadow-sm border border-border p-6">
            <div className="flex items-center gap-3 mb-5 pb-3 border-b border-border">
              <span className="material-symbols-outlined text-primary">info</span>
              <h3 className="text-base font-semibold text-foreground">Informasi Sistem</h3>
            </div>
            <div className="space-y-5">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary-fixed flex items-center justify-center shrink-0 mt-0.5">
                  <span className="material-symbols-outlined text-primary text-base">
                    calendar_today
                  </span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Dibuat Pada
                  </p>
                  <p className="text-sm font-semibold text-foreground mt-0.5">
                    {formatDate(position.createdAt)}
                  </p>
                  <p className="text-xs text-muted-foreground">{position.createdBy || "System"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary-fixed flex items-center justify-center shrink-0 mt-0.5">
                  <span className="material-symbols-outlined text-primary text-base">update</span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Diperbarui Pada
                  </p>
                  <p className="text-sm font-semibold text-foreground mt-0.5">
                    {formatDateTime(position.updatedAt)}
                  </p>
                  <p className="text-xs text-muted-foreground">{position.modifiedBy || "System"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailPosition;
