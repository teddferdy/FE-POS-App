import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { getAllCategoryTable, deleteCategory, downloadExcel } from "@/services/category";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loading } from "@/components/ui/loading";
import Modal from "@/components/organism/modal";

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

const CategoryList = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);

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

  const handleDelete = (id) => {
    setDeleteTarget(id);
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      deleteMutation.mutate({ id: deleteTarget });
      setDeleteTarget(null);
    }
  };

  const handleExport = () => {
    downloadExcel();
  };

  const filtered = categories.filter((cat) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (cat.name || "").toLowerCase().includes(q) ||
      (cat.code || cat.idCategory || "").toLowerCase().includes(q)
    );
  });

  const activeCount = categories.filter((cat) => cat.status === "active" || cat.isActive).length;
  const inactiveCount = categories.filter(
    (cat) => cat.status === "inactive" || !cat.isActive
  ).length;

  const stats = [
    {
      icon: "category",
      label: "Total Kategori",
      value: total,
      badge: `${categories.length} ditampilkan`,
      iconBg: "bg-primary/10",
      iconColor: "text-primary"
    },
    {
      icon: "check_circle",
      label: "Kategori Aktif",
      value: activeCount,
      badge: `${total > 0 ? Math.round((activeCount / total) * 100) : 0}%`,
      iconBg: "bg-green-100",
      iconColor: "text-green-700"
    },
    {
      icon: "cancel",
      label: "Kategori Nonaktif",
      value: inactiveCount,
      badge: "Perlu Ditinjau",
      iconBg: "bg-red-100",
      iconColor: "text-red-700"
    }
  ];

  return (
    <div className="space-y-8">
      <div>
        <nav className="flex gap-2 mb-2 text-sm text-muted-foreground">
          <span>Admin Console</span>
          <span>/</span>
          <span className="text-primary font-semibold">Kelola Kategori</span>
        </nav>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground tracking-tight">Daftar Kategori</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Kelola pengelompokan produk dan inventaris toko Anda.
            </p>
          </div>
          <Button
            onClick={() => navigate("/add-category")}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg shadow-sm">
            <span className="material-symbols-outlined text-lg">add</span>
            Tambah Kategori Baru
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-card p-6 rounded-xl shadow-sm border border-border">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 ${stat.iconBg} rounded-lg`}>
                <span className={`material-symbols-outlined ${stat.iconColor}`}>{stat.icon}</span>
              </div>
              <span className="text-xs font-semibold bg-muted text-muted-foreground px-2 py-1 rounded">
                {stat.badge}
              </span>
            </div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
              {stat.label}
            </p>
            <h3 className="text-3xl font-bold text-foreground">{stat.value}</h3>
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
            <Button variant="outline" size="sm" className="gap-2 h-9" onClick={handleExport}>
              <span className="material-symbols-outlined text-base">file_download</span>
              Ekspor
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
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((cat) => {
                  const isActive = cat.status === "active" || cat.isActive;
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
                            <span className="material-symbols-outlined text-primary">
                              {getCategoryIcon(cat.name)}
                            </span>
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
                              ? "bg-green-100 text-green-700 border border-green-200"
                              : "bg-red-100 text-red-700 border border-red-200"
                          }`}>
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isActive ? "bg-green-500" : "bg-red-500"
                            }`}
                          />
                          {isActive ? "Aktif" : "Nonaktif"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => navigate(`/edit-category?id=${cat.id || cat._id}`)}
                            className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all">
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

      <Modal
        type="confirm"
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Hapus Kategori?"
        confirmText="Ya, Hapus"
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default CategoryList;
