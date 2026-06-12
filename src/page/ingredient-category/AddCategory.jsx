import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { toast } from "sonner";
import { Save, X } from "lucide-react";
import {
  addIngredientCategory,
  getIngredientCategoryById,
  editIngredientCategory,
} from "@/services/ingredientCategory";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import Modal from "@/components/organism/modal";
import { Loading } from "@/components/ui/loading";

const AddCategory = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("id");
  const isEdit = !!editId;

  const [form, setForm] = useState({ name: "", isActive: true });
  const [showCancel, setShowCancel] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const { isLoading: loadingData } = useQuery(
    ["ingredient-category", editId],
    () => getIngredientCategoryById(editId),
    {
      enabled: isEdit,
      onSuccess: (res) => {
        const d = res.data;
        setForm({
          name: d.name || "",
          isActive: d.status !== "inactive",
        });
      },
      onError: () => {
        toast.error("Gagal", { description: "Gagal memuat data kategori" });
        navigate("/ingredient-category");
      },
    }
  );

  const createMutation = useMutation(addIngredientCategory, {
    onSuccess: () => {
      queryClient.invalidateQueries(["ingredient-categories"]);
      setShowSuccess(true);
    },
    onError: (err) => {
      toast.error("Gagal", {
        description: err?.response?.data?.message || err.message,
      });
    },
  });

  const editMutation = useMutation(editIngredientCategory, {
    onSuccess: () => {
      queryClient.invalidateQueries(["ingredient-categories"]);
      setShowSuccess(true);
    },
    onError: (err) => {
      toast.error("Gagal", {
        description: err?.response?.data?.message || err.message,
      });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Validasi", { description: "Nama kategori wajib diisi" });
      return;
    }
    const payload = {
      name: form.name.trim(),
      status: form.isActive,
    };
    if (isEdit) {
      editMutation.mutate({ ...payload, id: editId });
    } else {
      createMutation.mutate(payload);
    }
  };

  const isSubmitting = createMutation.isLoading || editMutation.isLoading;

  return (
    <div>
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <nav className="flex gap-2 mb-2 text-sm text-muted-foreground">
            <span>Pengaturan</span>
            <span>/</span>
            <button
              onClick={() => navigate("/ingredient-category")}
              className="hover:text-primary transition-colors"
            >
              Kategori Bahan Baku
            </button>
            <span>/</span>
            <span className="text-primary font-semibold">
              {isEdit ? "Edit Kategori" : "Tambah Kategori"}
            </span>
          </nav>
          <h2 className="text-2xl font-bold text-foreground tracking-tight">
            {isEdit ? "Edit Kategori" : "Tambah Kategori"} Bahan Baku
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {isEdit
              ? "Ubah data kategori bahan baku"
              : "Buat kategori baru untuk bahan baku"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="bg-card p-6 rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-border overflow-hidden">
          <div className="max-w-xl space-y-6">
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Nama Kategori <span className="text-destructive">*</span>
              </Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Contoh: Bahan Kering, Bumbu Dapur"
                className="h-12"
              />
            </div>

            <div
              className={`flex items-center justify-between p-4 rounded-lg cursor-pointer transition-all ${
                form.isActive
                  ? "bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800"
                  : "bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800"
              }`}
              onClick={() => setForm((f) => ({ ...f, isActive: !f.isActive }))}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    form.isActive
                      ? "bg-green-600 text-white"
                      : "bg-destructive/10 text-destructive"
                  }`}
                >
                  <span className="material-symbols-outlined text-lg">
                    {form.isActive ? "check" : "close"}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {form.isActive ? "Aktif" : "Nonaktif"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {form.isActive
                      ? "Kategori dapat digunakan pada bahan baku"
                      : "Kategori tidak akan muncul di pilihan"}
                  </p>
                </div>
              </div>
              <Switch
                checked={form.isActive}
                onCheckedChange={(v) => setForm((f) => ({ ...f, isActive: v }))}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center gap-4 mt-6 bg-card border border-border rounded-xl p-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowCancel(true)}
          >
            <X size={16} className="mr-1" />
            Batal
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            <Save size={16} className="mr-1" />
            {isSubmitting
              ? "Menyimpan..."
              : isEdit
              ? "Simpan Perubahan"
              : "Simpan"}
          </Button>
        </div>
      </form>

      {(isSubmitting || loadingData) && (
        <Loading fullscreen size="lg" label="Memproses..." />
      )}

      <Modal
        type="success"
        open={showSuccess}
        onOpenChange={setShowSuccess}
        title={isEdit ? "Kategori Diperbarui" : "Kategori Berhasil Dibuat"}
        onConfirm={() => {
          queryClient.invalidateQueries(["ingredient-categories"]);
          navigate("/ingredient-category");
        }}
      />

      <Modal
        type="confirm"
        open={showCancel}
        onOpenChange={setShowCancel}
        title="Batalkan?"
        description="Perubahan yang belum disimpan akan hilang"
        confirmText="Ya, Batalkan"
        onConfirm={() => navigate("/ingredient-category")}
      />
    </div>
  );
};

export default AddCategory;
