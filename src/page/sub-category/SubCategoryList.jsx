import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { toast } from "sonner";
import { Plus, Search, Edit, Trash2, Layers } from "lucide-react";
import { getAllSubCategory, deleteSubCategory } from "@/services/sub-category";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";
import Modal from "@/components/organism/modal";

const SubCategoryList = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [cookie] = useCookies();
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);

  const user = cookie?.user;
  const locationParam = user?.store || "";

  const { data, isLoading } = useQuery(
    ["sub-categories", locationParam],
    () => getAllSubCategory({ store: locationParam }),
    { enabled: !!locationParam }
  );

  const deleteMutation = useMutation(deleteSubCategory, {
    onSuccess: () => {
      toast.success("Berhasil", { description: "Sub kategori berhasil dihapus" });
      queryClient.invalidateQueries(["sub-categories"]);
    },
    onError: (err) => {
      toast.error("Gagal", { description: err?.response?.data?.message || err.message });
    }
  });

  const allSubCategories = data?.data || data || [];
  const total = allSubCategories.length || 0;

  const filtered = useMemo(() => {
    if (!search.trim()) return allSubCategories;
    const q = search.toLowerCase();
    return allSubCategories.filter(
      (sc) =>
        (sc.name || "").toLowerCase().includes(q) ||
        (sc.category?.name || sc.categoryName || "").toLowerCase().includes(q)
    );
  }, [allSubCategories, search]);

  const handleDelete = (subCategory) => {
    setDeleteTarget(subCategory);
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      deleteMutation.mutate({ id: deleteTarget.id || deleteTarget._id });
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <button
          onClick={() => navigate("/dashboard-super-admin")}
          className="hover:text-foreground transition-colors">
          Dashboard
        </button>
        <span className="text-xs">/</span>
        <span className="text-primary font-semibold">Sub Kategori</span>
      </nav>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Sub Kategori</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Kelola sub kategori produk untuk pengelompokan yang lebih spesifik.
          </p>
        </div>
        <Button onClick={() => navigate("/add-sub-category")} className="gap-2">
          <Plus size={18} />
          Tambah Sub Kategori
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5">
          <p className="text-sm text-muted-foreground">Total Sub Kategori</p>
          <p className="text-2xl font-bold text-foreground mt-1">{total}</p>
        </Card>
      </div>

      <div className="relative w-full sm:w-72">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          placeholder="Cari sub kategori..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-10"
        />
      </div>

      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loading />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50 text-muted-foreground">
                  <th className="text-left px-4 py-3.5 font-semibold text-xs uppercase tracking-wider">
                    Nama Sub Kategori
                  </th>
                  <th className="text-left px-4 py-3.5 font-semibold text-xs uppercase tracking-wider">
                    Kategori Induk
                  </th>
                  <th className="text-left px-4 py-3.5 font-semibold text-xs uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-right px-4 py-3.5 font-semibold text-xs uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-12 text-center text-muted-foreground">
                      <Layers size={40} className="mx-auto mb-3 opacity-30" />
                      <p>Tidak ada sub kategori ditemukan</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((subCategory, index) => (
                    <tr
                      key={subCategory.id || subCategory._id || index}
                      className="hover:bg-accent/30 transition-colors">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                            {subCategory.name?.charAt(0)?.toUpperCase() || "S"}
                          </div>
                          <span className="font-medium text-foreground">
                            {subCategory.name || "-"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-foreground">
                        {subCategory.category?.name || subCategory.categoryName || "-"}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            subCategory.isActive || subCategory.isActive === undefined
                              ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                              : "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                          }`}>
                          {subCategory.isActive || subCategory.isActive === undefined
                            ? "Aktif"
                            : "Tidak Aktif"}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-primary"
                            onClick={() =>
                              navigate(`/edit-sub-category?id=${subCategory.id || subCategory._id}`)
                            }>
                            <Edit size={15} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => handleDelete(subCategory)}>
                            <Trash2 size={15} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal
        type="confirm"
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Hapus Sub Kategori?"
        description={`Yakin ingin menghapus sub kategori ${deleteTarget?.name || ""}?`}
        confirmText="Ya, Hapus"
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default SubCategoryList;
