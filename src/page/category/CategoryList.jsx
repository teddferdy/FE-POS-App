import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
  getAllCategoryTable,
  deleteCategory,
  downloadTemplate,
  downloadExcel
} from "@/services/category";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loading } from "@/components/ui/loading";
import Modal from "@/components/organism/modal";
import UploadCategoryModal from "@/page/category/components/UploadCategoryModal";
import PageHeader from "@/components/ui/PageHeader";

const categoryIcon = {
  "makanan utama": "restaurant",
  "minuman dingin": "local_bar",
  "snack & dessert": "cookie",
  "kopi & teh panas": "coffee"
};

const getCategoryIcon = (name) => {
  const key = (name || "").toLowerCase();
  return categoryIcon[key] || "category";
};

const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "-";
    return (
      d.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric"
      }) +
      " " +
      d.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit"
      })
    );
  } catch {
    return "-";
  }
};

const CategoryList = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [isDownloadingTemplate, setIsDownloadingTemplate] = useState(false);
  const [isDownloadingData, setIsDownloadingData] = useState(false);

  const locationParam = searchParams.get("location");

  const { data, isLoading } = useQuery(
    ["categories", page, limit, search, statusFilter, locationParam],
    () =>
      getAllCategoryTable({
        location: locationParam || "",
        page,
        limit,
        statusCategory: statusFilter || "all"
      }),
    { keepPreviousData: true }
  );

  const deleteMutation = useMutation(deleteCategory, {
    onSuccess: () => {
      toast.success("Success", { description: "Kategori berhasil dihapus" });
      queryClient.invalidateQueries(["categories"]);
    },
    onError: (err) => {
      toast.error("Failed", { description: err?.response?.data?.message || err.message });
    }
  });

  const categories = data?.data || data?.categories || [];
  const total = data?.total || data?.pagination?.total || 0;
  const totalPages = data?.pagination?.totalPages || Math.ceil(total / limit) || 1;

  // Extract stats from BE response if available, otherwise calculate from current page data
  const statsFromBE = data?.stats || {};
  const hasBEStats =
    statsFromBE.total !== undefined ||
    statsFromBE.active !== undefined ||
    statsFromBE.inactive !== undefined;

  const statsTotal = hasBEStats ? statsFromBE.total || total : total;
  const activeCount = hasBEStats
    ? statsFromBE.active || 0
    : categories.filter((cat) => cat.status === "active" || cat.isActive).length;
  const inactiveCount = hasBEStats
    ? statsFromBE.inactive || 0
    : categories.filter((cat) => cat.status === "inactive" || !cat.isActive).length;

  const handleDelete = (id) => {
    setDeleteTarget(id);
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      deleteMutation.mutate({ id: deleteTarget });
      setDeleteTarget(null);
    }
  };

  const filtered = categories.filter((cat) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (cat.name || "").toLowerCase().includes(q) ||
      (cat.code || cat.idCategory || "").toLowerCase().includes(q)
    );
  });

  const stats = [
    {
      icon: "category",
      label: "Total Kategori",
      value: statsTotal,
      badge: `${categories.length} ditampilkan`,
      iconBg: "bg-primary/10",
      iconColor: "text-primary"
    },
    {
      icon: "check_circle",
      label: "Kategori Aktif",
      value: activeCount,
      badge: `${statsTotal > 0 ? Math.round((activeCount / statsTotal) * 100) : 0}%`,
      iconBg: "bg-green-100 dark:bg-green-900/40",
      iconColor: "text-green-700 dark:text-green-300"
    },
    {
      icon: "cancel",
      label: "Kategori Nonaktif",
      value: inactiveCount,
      badge: `${statsTotal > 0 ? Math.round((inactiveCount / statsTotal) * 100) : 0}%`,
      iconBg: "bg-red-100 dark:bg-red-900/40",
      iconColor: "text-red-700 dark:text-red-300",
      danger: true
    }
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        breadcrumbs={[{ label: "Admin Console" }, { label: "Kelola Kategori" }]}
        title="Daftar Kategori"
        description="Kelola pengelompokan produk dan inventaris toko Anda.">
        <Button
          variant="outline"
          disabled={isDownloadingTemplate}
          onClick={async () => {
            setIsDownloadingTemplate(true);
            try {
              await downloadTemplate();
              toast.success("Berhasil", { description: "Template berhasil di-download" });
            } catch (err) {
              toast.error("Gagal", {
                description:
                  err?.response?.data?.message || err.message || "Gagal download template"
              });
            } finally {
              setIsDownloadingTemplate(false);
            }
          }}>
          {isDownloadingTemplate ? (
            <Loader2 size={16} className="mr-1 animate-spin" />
          ) : (
            <span className="material-symbols-outlined text-lg mr-1">table_rows</span>
          )}
          {isDownloadingTemplate ? "Download..." : "Download Template"}
        </Button>
        <Button
          variant="outline"
          disabled={isDownloadingData}
          onClick={async () => {
            setIsDownloadingData(true);
            try {
              await downloadExcel();
              toast.success("Berhasil", { description: "Data berhasil di-download" });
            } catch (err) {
              toast.error("Gagal", {
                description: err?.response?.data?.message || err.message || "Gagal download data"
              });
            } finally {
              setIsDownloadingData(false);
            }
          }}>
          {isDownloadingData ? (
            <Loader2 size={16} className="mr-1 animate-spin" />
          ) : (
            <span className="material-symbols-outlined text-lg mr-1">download</span>
          )}
          {isDownloadingData ? "Download..." : "Download Data"}
        </Button>
        <span className="w-px h-7 bg-border mx-1" />
        <Button variant="default" onClick={() => setUploadModalOpen(true)}>
          <span className="material-symbols-outlined text-lg">upload</span>
          Upload Excel
        </Button>
        <Button onClick={() => navigate("/add-category")} className="shadow-md">
          <span className="material-symbols-outlined text-lg">add</span>
          Tambah Kategori Baru
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`${stat.danger ? "bg-red-600 dark:bg-red-900" : "bg-card border border-border"} p-6 rounded-xl shadow-sm flex justify-between items-start flex-col transition-colors`}>
            <div className="flex justify-between items-start w-full mb-4">
              <div
                className={`p-3 ${stat.danger ? "bg-red-700 dark:bg-red-950" : stat.iconBg} rounded-lg`}>
                <span
                  className={`material-symbols-outlined ${stat.danger ? "text-white" : stat.iconColor}`}>
                  {stat.icon}
                </span>
              </div>
              <span
                className={`text-xs font-semibold px-2 py-1 rounded ${stat.danger ? "bg-red-500/30 text-red-100" : "bg-muted text-muted-foreground"}`}>
                {stat.badge}
              </span>
            </div>
            <p
              className={`text-xs font-semibold uppercase tracking-wider mb-1 ${stat.danger ? "text-red-100" : "text-muted-foreground"}`}>
              {stat.label}
            </p>
            <h3 className={`text-3xl font-bold ${stat.danger ? "text-white" : "text-foreground"}`}>
              {stat.value}
            </h3>
          </div>
        ))}
      </div>

      <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
        <div className="px-6 py-5 border-b border-border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-muted/30">
          <h4 className="text-base font-semibold text-foreground">Semua Kategori</h4>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-base">
                search
              </span>
              <Input
                placeholder="Cari kategori..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-9 h-9 text-sm"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="h-9 px-3 bg-background border border-input rounded-lg text-sm focus:ring-2 focus:ring-ring outline-none">
              <option value="">Semua Status</option>
              <option value="active">Aktif</option>
              <option value="inactive">Nonaktif</option>
            </select>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 h-9"
              onClick={() => setStatusFilter("")}>
              <span className="material-symbols-outlined text-base">filter_list</span>
              Filter
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loading />
          </div>
        ) : filtered.length === 0 ? (
          <div className="px-6 py-12 text-center text-muted-foreground">
            <span className="material-symbols-outlined text-4xl block mb-2">category</span>
            Tidak ada kategori ditemukan
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/10">
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border">
                    ID Kategori
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border">
                    Nama Kategori
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border">
                    Jumlah Produk
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border">
                    Status
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border">
                    Tanggal Dibuat
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border">
                    Diperbarui
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((cat) => {
                  const isActive = cat.status || cat.isActive;
                  return (
                    <tr
                      key={cat.id || cat._id}
                      className="hover:bg-muted/20 transition-colors group">
                      <td className="px-6 py-4 font-mono text-sm text-foreground">
                        {cat.code ||
                          cat.idCategory ||
                          `#CAT-${String(cat.id || cat._id).padStart(3, "0")}`}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                            {cat.image ? (
                              cat.image.startsWith("http") ? (
                                <img
                                  src={cat.image}
                                  alt={cat.name}
                                  className="w-full h-full object-cover rounded-lg"
                                />
                              ) : (
                                <span className="material-symbols-outlined text-primary">
                                  {cat.image}
                                </span>
                              )
                            ) : (
                              <span className="material-symbols-outlined text-primary">
                                {getCategoryIcon(cat.name)}
                              </span>
                            )}
                          </div>
                          <span className="text-sm font-semibold text-foreground">{cat.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {cat.productCount || cat.totalProduct || 0} Item
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                            isActive
                              ? "bg-green-100 text-green-700 border border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800"
                              : "bg-red-100 text-red-700 border border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800"
                          }`}>
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isActive
                                ? "bg-green-500 dark:bg-green-400"
                                : "bg-red-500 dark:bg-red-400"
                            }`}
                          />
                          {isActive ? "Aktif" : "Nonaktif"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-mono text-muted-foreground">
                        {formatDate(cat.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-sm font-mono text-muted-foreground">
                        {formatDate(cat.updatedAt)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => navigate(`/detail-category?id=${cat.id || cat._id}`)}
                            className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                            title="Detail">
                            <span className="material-symbols-outlined text-lg">visibility</span>
                          </button>
                          <button
                            onClick={() => navigate(`/edit-category?id=${cat.id || cat._id}`)}
                            className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                            title="Edit">
                            <span className="material-symbols-outlined text-lg">edit</span>
                          </button>
                          <button
                            onClick={() => handleDelete(cat.id || cat._id)}
                            className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all">
                            <span className="material-symbols-outlined text-lg">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="px-6 py-4 border-t border-border flex justify-between items-center bg-muted/10">
          <span className="text-xs text-muted-foreground">
            Menampilkan {filtered.length} dari {total} kategori
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
            <span>
              Gunakan nama kategori yang singkat dan jelas untuk memudahkan pencarian produk.
            </span>
          </li>
          <li className="text-xs leading-relaxed opacity-90 flex items-start gap-2">
            <span className="text-primary-foreground/60 mt-0.5">•</span>
            <span>Atur status kategori untuk mengontrol visibilitas di toko.</span>
          </li>
          <li className="text-xs leading-relaxed opacity-90 flex items-start gap-2">
            <span className="text-primary-foreground/60 mt-0.5">•</span>
            <span>Manfaatkan ikon untuk mempermudah identifikasi kategori oleh pelanggan.</span>
          </li>
          <li className="text-xs leading-relaxed opacity-90 flex items-start gap-2">
            <span className="text-primary-foreground/60 mt-0.5">•</span>
            <span>Download template untuk menambahkan banyak kategori sekaligus.</span>
          </li>
        </ul>
      </div>

      <Modal
        type="confirm"
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Hapus Kategori?"
        confirmText="Ya, Hapus"
        onConfirm={confirmDelete}
      />
      <UploadCategoryModal
        open={uploadModalOpen}
        onOpenChange={setUploadModalOpen}
        onUploadSuccess={() => queryClient.invalidateQueries(["categories"])}
      />
    </div>
  );
};

export default CategoryList;
