import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "react-query";
import { getCategoryById } from "@/services/category";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/loading";

const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "-";
    return (
      d.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
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

const DetailCategory = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const categoryId = searchParams.get("id");

  const { data: categoryData, isLoading } = useQuery(
    ["category-detail", categoryId],
    () => getCategoryById({ id: categoryId }),
    { enabled: !!categoryId }
  );

  const cat = categoryData?.data || categoryData?.category || {};

  if (!categoryId) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground gap-3">
        <span className="material-symbols-outlined text-4xl">category</span>
        <p>ID kategori tidak ditemukan</p>
        <Button variant="outline" onClick={() => navigate("/category-list")}>
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

  if (!cat || !cat.id) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground gap-3">
        <span className="material-symbols-outlined text-4xl">category</span>
        <p>Kategori tidak ditemukan</p>
        <Button variant="outline" onClick={() => navigate("/category-list")}>
          Kembali
        </Button>
      </div>
    );
  }

  const isActive = cat.status ?? cat.isActive ?? true;

  return (
    <div className="space-y-8">
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <button
          onClick={() => navigate("/dashboard-super-admin")}
          className="hover:text-foreground transition-colors">
          Dashboard
        </button>
        <span className="text-xs">/</span>
        <button
          onClick={() => navigate("/category-list")}
          className="hover:text-foreground transition-colors">
          Kelola Kategori
        </button>
        <span className="text-xs">/</span>
        <span className="text-primary font-semibold">{cat.name}</span>
      </nav>

      <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-8 md:p-10">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
              {cat.image && !cat.image.startsWith("http") ? (
                <span className="material-symbols-outlined text-6xl">{cat.image}</span>
              ) : cat.image && cat.image.startsWith("http") ? (
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover rounded-2xl"
                />
              ) : (
                <span className="material-symbols-outlined text-6xl">category</span>
              )}
            </div>
            <div className="text-center md:text-left">
              <div className="flex items-center gap-3 justify-center md:justify-start mb-2">
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">{cat.name}</h1>
                <span
                  className={`inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-bold ${
                    isActive
                      ? "bg-green-100 text-green-700 border border-green-200"
                      : "bg-red-100 text-red-700 border border-red-200"
                  }`}>
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-green-500" : "bg-red-500"}`}
                  />
                  {isActive ? "Aktif" : "Nonaktif"}
                </span>
              </div>
              <p className="text-sm text-muted-foreground max-w-xl">
                {cat.description || "Tidak ada deskripsi"}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border">
          <div className="p-6 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary-fixed flex items-center justify-center text-primary shrink-0">
              <span className="material-symbols-outlined">tag</span>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                ID Kategori
              </p>
              <p className="text-sm font-semibold text-foreground mt-0.5 font-mono">
                {cat.code || cat.idCategory || `#CAT-${String(cat.id).padStart(3, "0")}`}
              </p>
            </div>
          </div>
          <div className="p-6 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-secondary-container flex items-center justify-center text-secondary shrink-0">
              <span className="material-symbols-outlined">inventory_2</span>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Jumlah Produk
              </p>
              <p className="text-sm font-semibold text-foreground mt-0.5">
                {cat.productCount || cat.totalProduct || 0} Item
              </p>
            </div>
          </div>
          <div className="p-6 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary-fixed flex items-center justify-center text-primary shrink-0">
              <span className="material-symbols-outlined">calendar_today</span>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Dibuat
              </p>
              <p className="text-sm font-semibold text-foreground mt-0.5">
                {formatDate(cat.createdAt)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl shadow-sm border border-border p-6">
        <div className="flex items-center gap-3 mb-5 pb-3 border-b border-border">
          <span className="material-symbols-outlined text-primary">info</span>
          <h3 className="text-base font-semibold text-foreground">Informasi Sistem</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                {formatDate(cat.createdAt)}
              </p>
              <p className="text-xs text-muted-foreground">{cat.createdBy || "System"}</p>
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
                {formatDate(cat.updatedAt)}
              </p>
              <p className="text-xs text-muted-foreground">{cat.modifiedBy || "System"}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => navigate("/category-list")} className="gap-2">
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          Kembali ke Daftar
        </Button>
        <Button onClick={() => navigate(`/edit-category?id=${cat.id}`)} className="gap-2 shadow-md">
          <span className="material-symbols-outlined text-lg">edit</span>
          Edit Kategori
        </Button>
      </div>
    </div>
  );
};

export default DetailCategory;
