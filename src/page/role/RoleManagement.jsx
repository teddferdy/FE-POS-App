import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Shield } from "lucide-react";
import { getAllRoleTable, deleteRole } from "@/services/role";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/loading";
import Modal from "@/components/organism/modal";
import { useTranslation } from "react-i18next";

const RoleManagement = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data, isLoading } = useQuery(
    ["roles-table", page],
    () => getAllRoleTable({ page, limit: 10 }),
    { keepPreviousData: true }
  );

  const roles = data?.data || [];
  const total = data?.pagination?.total || 0;
  const totalPages = data?.pagination?.totalPages || 1;

  const deleteMutation = useMutation(deleteRole, {
    onSuccess: () => {
      toast.success("Berhasil", { description: "Role berhasil dihapus" });
      queryClient.invalidateQueries(["roles-table"]);
    },
    onError: (err) => {
      toast.error("Gagal", {
        description: err?.response?.data?.message || err.message
      });
    }
  });

  const confirmDelete = () => {
    if (deleteTarget) {
      deleteMutation.mutate({ id: deleteTarget.id });
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <nav className="flex gap-2 mb-2 text-sm text-muted-foreground" aria-label="breadcrumb">
            <span>{t("breadcrumb.home")}</span>
            <span>/</span>
            <span className="text-primary font-semibold">{t("breadcrumb.management")}</span>
            <span>/</span>
            <span className="text-primary font-semibold">Manajemen Role & Izin</span>
          </nav>
          <h2 className="text-2xl font-bold text-foreground tracking-tight">
            Manajemen Role & Izin
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Kelola role dan hak akses pengguna sistem
          </p>
        </div>
        <Button
          onClick={() => navigate("/add-role")}
          className="flex items-center gap-2 px-6 py-2.5 rounded-lg shadow-sm">
          <Plus size={18} />
          Tambah Role
        </Button>
      </div>

      <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
        <div className="px-6 py-5 border-b border-border flex justify-between items-center bg-muted/30">
          <h4 className="text-base font-semibold text-foreground">Daftar Role</h4>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loading />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/10">
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border">
                    Nama Role
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border">
                    Deskripsi
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border">
                    Tipe
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border">
                    Status
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border text-right">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {roles.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                      <Shield size={40} className="mx-auto mb-2 opacity-40" />
                      Belum ada role. Buat role baru untuk mengatur akses pengguna.
                    </td>
                  </tr>
                ) : (
                  roles.map((role) => (
                    <tr key={role.id} className="hover:bg-muted/20 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Shield size={16} className="text-primary" />
                          <span className="text-sm font-semibold text-foreground">{role.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {role.description || "-"}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                            role.roleType === "super_admin"
                              ? "bg-red-100 text-red-700"
                              : role.roleType === "admin"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-gray-100 text-gray-700"
                          }`}>
                          {role.roleType}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                            role.status ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                          }`}>
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${role.status ? "bg-green-700" : "bg-red-700"}`}
                          />
                          {role.status ? "Aktif" : "Nonaktif"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => navigate(`/edit-role/${role.id}`)}
                            className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                            title="Edit Role">
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(role)}
                            className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all"
                            title="Hapus Role">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="px-6 py-4 border-t border-border flex justify-between items-center bg-muted/10">
          <span className="text-xs text-muted-foreground">
            Menampilkan {roles.length} dari {total} Role
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page <= 1}
              className="p-2 rounded-lg hover:bg-muted text-muted-foreground disabled:opacity-30 transition-colors">
              <span className="material-symbols-outlined text-lg">chevron_left</span>
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`w-10 h-10 rounded-lg text-sm font-semibold transition-colors ${
                    page === pageNum
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted text-muted-foreground"
                  }`}>
                  {pageNum}
                </button>
              );
            })}
            {totalPages > 5 && (
              <>
                <span className="px-2 py-2 text-muted-foreground text-sm">...</span>
                <button
                  onClick={() => setPage(totalPages)}
                  className="w-10 h-10 rounded-lg hover:bg-muted text-muted-foreground text-sm font-semibold transition-colors">
                  {totalPages}
                </button>
              </>
            )}
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages}
              className="p-2 rounded-lg hover:bg-muted text-muted-foreground disabled:opacity-30 transition-colors">
              <span className="material-symbols-outlined text-lg">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      <Modal
        type="confirm"
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Hapus Role?"
        confirmText="Ya, Hapus"
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default RoleManagement;
