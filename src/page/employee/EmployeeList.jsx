import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getAllEmployee, deleteEmployee } from "@/services/employee";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loading } from "@/components/ui/loading";
import Modal from "@/components/organism/modal";
import PageHeader from "@/components/ui/PageHeader";
import { User } from "lucide-react";
import { getAllLocationTable } from "@/services/location";
import { useTranslation } from "react-i18next";

const positionColors = {
  manager: "bg-primary-fixed text-on-primary-fixed",
  kasir: "bg-surface-variant text-on-surface-variant",
  admin: "bg-surface-variant text-on-surface-variant",
  staff: "bg-surface-variant text-on-surface-variant",
  supervisor: "bg-surface-container-high text-on-surface"
};

const getPositionClass = (position) => {
  const pos = typeof position === "string" ? position.toLowerCase() : "";
  return positionColors[pos] || "bg-surface-variant text-on-surface-variant";
};

const EmployeeList = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [positionFilter, setPositionFilter] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const { t } = useTranslation();

  const { data, isLoading } = useQuery(
    ["employees", page, limit, search, locationFilter, positionFilter],
    () =>
      getAllEmployee({ page, limit, search, location: locationFilter, position: positionFilter }),
    { keepPreviousData: true }
  );

  const { data: locationData } = useQuery(
    ["all-locations"],
    () => getAllLocationTable({ page: 1, limit: 100, statusLocation: "all" }),
    { select: (res) => res?.data?.filter((loc) => loc.isActive) || [] }
  );

  const deleteMutation = useMutation(deleteEmployee, {
    onSuccess: () => {
      toast.success("Berhasil", { description: "Karyawan berhasil dihapus" });
      queryClient.invalidateQueries(["employees"]);
    },
    onError: (err) => {
      toast.error("Gagal", {
        description: err?.response?.data?.message || err.message
      });
    }
  });

  const employees = data?.data || data?.employees || [];
  const total = data?.total || data?.pagination?.total || 0;
  const totalPages = data?.pagination?.totalPages || Math.ceil(total / limit) || 1;
  const stats = data?.stats || {};
  const activeCount = stats.active ?? 0;
  const inactiveCount = stats.inactive ?? 0;

  const handleDelete = (employee) => {
    setDeleteTarget(employee);
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      deleteMutation.mutate({ id: deleteTarget.id || deleteTarget._id });
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        breadcrumbs={[
          { label: t("breadcrumb.management"), i18nKey: "breadcrumb.management" },
          { label: t("page.employee.list.title"), i18nKey: "page.employee.list.title" }
        ]}
        title={t("page.employee.list.title")}
        description={t("page.employee.list.description")}>
        <Button
          onClick={() => navigate("/add-employee")}
          className="flex items-center gap-2 px-6 py-2.5 rounded-lg shadow-sm">
          <span className="material-symbols-outlined text-lg">person_add</span>
          {t("page.employee.add.title")}
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card p-6 rounded-xl shadow-sm border border-border flex justify-between items-center group hover:shadow-md transition-shadow">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
              {t("page.employee.table.total")}
            </p>
            <h3 className="text-3xl font-bold text-foreground">{total.toLocaleString() || "0"}</h3>
            <p className="text-xs font-semibold text-secondary flex items-center gap-1 mt-1">
              <span className="material-symbols-outlined text-sm">trending_up</span>
              +12% vs bulan lalu
            </p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-primary-fixed flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-3xl">groups</span>
          </div>
        </div>
        <div className="bg-card p-6 rounded-xl shadow-sm border border-border flex justify-between items-center group hover:shadow-md transition-shadow">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
              {t("page.employee.table.active")}
            </p>
            <h3 className="text-3xl font-bold text-foreground">
              {activeCount.toLocaleString() || "0"}
            </h3>
            <p className="text-xs font-semibold text-secondary flex items-center gap-1 mt-1">
              <span className="material-symbols-outlined text-sm">check_circle</span>
              {total > 0 ? Math.round((activeCount / total) * 100) : 0}%{" "}
              {t("page.employee.table.activeRate")}
            </p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-secondary-container flex items-center justify-center text-on-secondary-container group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-3xl">how_to_reg</span>
          </div>
        </div>
        <div className="bg-red-600 dark:bg-red-900 p-6 rounded-xl shadow-sm flex justify-between items-center group hover:bg-red-700 dark:hover:bg-red-800 transition-colors hover:shadow-md">
          <div>
            <p className="text-xs font-semibold text-red-100 uppercase tracking-wider mb-1">
              {t("page.employee.table.inactive")}
            </p>
            <h3 className="text-3xl font-bold text-white">{inactiveCount.toLocaleString()}</h3>
            <p className="text-xs font-semibold text-red-100 flex items-center gap-1 mt-1">
              <span className="material-symbols-outlined text-sm">cancel</span>
              {t("page.employee.table.attentionNeeded")}
            </p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-red-700 dark:bg-red-950 flex items-center justify-center text-white group-hover:bg-red-800 dark:group-hover:bg-red-950/80 transition-colors group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-3xl">cancel</span>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
        <div className="p-5 border-b border-border flex flex-wrap gap-4 items-center justify-between bg-muted/30">
          <div className="flex flex-wrap gap-4 items-center flex-grow">
            <div className="relative min-w-[260px]">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-base">
                search
              </span>
              <Input
                placeholder="Cari nama, ID, atau email..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-9 h-9 w-full text-sm"
              />
            </div>
            <div className="flex gap-3">
              <select
                value={locationFilter}
                onChange={(e) => {
                  setLocationFilter(e.target.value);
                  setPage(1);
                }}
                className="bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20">
                <option value="">Semua Toko/Cabang</option>
                {locationData?.map((loc) => (
                  <option key={loc.id} value={loc.id.replace("loc-", "")}>
                    {loc.name}
                  </option>
                ))}
              </select>
              <select
                value={positionFilter}
                onChange={(e) => {
                  setPositionFilter(e.target.value);
                  setPage(1);
                }}
                className="bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20">
                <option value="">Semua Jabatan</option>
                <option value="manager">Manager</option>
                <option value="kasir">Kasir</option>
                <option value="admin">Admin</option>
                <option value="staff">Staff</option>
                <option value="supervisor">Supervisor</option>
              </select>
            </div>
          </div>
          <Button variant="outline" size="sm" className="gap-2 h-9">
            <span className="material-symbols-outlined text-base">tune</span>
            Advanced Filters
          </Button>
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
                    Foto
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border">
                    {t("page.employee.table.id")}
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border">
                    {t("page.employee.table.name")}
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border">
                    {t("page.employee.table.position")}
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border">
                    {t("page.employee.table.branch")}
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border text-center">
                    {t("page.employee.table.status")}
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border text-right">
                    {t("page.employee.table.actions")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {employees.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                      <span className="material-symbols-outlined text-4xl block mb-2">badge</span>
                      Tidak ada karyawan ditemukan
                    </td>
                  </tr>
                ) : (
                  employees.map((employee) => {
                    const position = employee.positionData?.name || employee.role || "staff";
                    return (
                      <tr
                        key={employee.id || employee._id}
                        className="hover:bg-muted/20 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted border border-border">
                            {employee.image ? (
                              <img
                                src={employee.image}
                                alt={employee.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                <User size={16} />
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-mono font-bold text-primary">
                            {employee.employeeID || employee.code || "-"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div>
                              <p className="text-sm font-semibold text-foreground">
                                {employee.fullName}
                              </p>
                              <p className="text-xs text-muted-foreground">{employee.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-block px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${getPositionClass(position)}`}>
                            {position === "kasir"
                              ? "Kasir"
                              : position.charAt(0).toUpperCase() + position.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-muted-foreground text-base">
                              location_on
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {employee.storeData?.name || "belum ada penempatan store"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tight ${
                              employee.statusActive === true
                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800"
                                : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800"
                            }`}>
                            {employee.statusActive === true ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-1">
                            <button
                              onClick={() =>
                                navigate(`/detail-employee?employeeID=${employee.employeeID}`)
                              }
                              className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                              title="Lihat Detail">
                              <span className="material-symbols-outlined text-lg">visibility</span>
                            </button>
                            <button
                              onClick={() => navigate(`/edit-employee?id=${employee.id}`)}
                              className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                              title="Edit Karyawan">
                              <span className="material-symbols-outlined text-lg">edit</span>
                            </button>
                            <button
                              onClick={() => handleDelete(employee)}
                              className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all"
                              title="Hapus Karyawan">
                              <span className="material-symbols-outlined text-lg">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="px-6 py-4 border-t border-border flex justify-between items-center bg-muted/10">
          <span className="text-xs text-muted-foreground">
            Menampilkan {employees.length} dari {total.toLocaleString()} Karyawan
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

      <div className="bg-gradient-to-br from-primary to-primary/90 rounded-xl p-5 flex flex-col text-primary-foreground">
        <div className="flex items-center gap-2 mb-3">
          <span className="material-symbols-outlined opacity-80">lightbulb</span>
          <h4 className="text-sm font-bold uppercase tracking-wider opacity-80">Tips</h4>
        </div>
        <ul className="space-y-2">
          <li className="text-xs leading-relaxed opacity-90 flex items-start gap-2">
            <span className="text-primary-foreground/60 mt-0.5">•</span>
            <span>Gunakan filter cabang untuk melihat beban kerja per lokasi secara cepat.</span>
          </li>
          <li className="text-xs leading-relaxed opacity-90 flex items-start gap-2">
            <span className="text-primary-foreground/60 mt-0.5">•</span>
            <span>Unduh laporan karyawan dalam format Excel melalui menu download data.</span>
          </li>
          <li className="text-xs leading-relaxed opacity-90 flex items-start gap-2">
            <span className="text-primary-foreground/60 mt-0.5">•</span>
            <span>Pastikan data karyawan selalu diperbarui untuk akurasi penggajian.</span>
          </li>
          <li className="text-xs leading-relaxed opacity-90 flex items-start gap-2">
            <span className="text-primary-foreground/60 mt-0.5">•</span>
            <span>Gunakan status aktif/nonaktif untuk mengelola akses karyawan.</span>
          </li>
        </ul>
      </div>

      <Modal
        type="confirm"
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={`Hapus ${deleteTarget?.name || "Data"}?`}
        confirmText="Ya, Hapus"
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default EmployeeList;
