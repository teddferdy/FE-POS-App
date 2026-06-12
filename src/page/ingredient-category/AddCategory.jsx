import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Save, X } from "lucide-react";
import {
  addIngredientCategory,
  getIngredientCategoryById,
  editIngredientCategory,
} from "@/services/ingredientCategory";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Form, FormField, FormItem, FormLabel, FormMessage
} from "@/components/ui/form";
import Modal from "@/components/organism/modal";
import { Loading } from "@/components/ui/loading";

const formSchema = z.object({
  name: z.string().min(1, "Nama kategori wajib diisi"),
  isActive: z.boolean()
});

const AddCategory = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("id");
  const isEdit = !!editId;

  const [showCancel, setShowCancel] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", isActive: true }
  });

  const { isLoading: loadingData } = useQuery(
    ["ingredient-category", editId],
    () => getIngredientCategoryById(editId),
    {
      enabled: isEdit,
      onSuccess: (res) => {
        const d = res.data;
        form.reset({
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

  const onSubmit = (values) => {
    const payload = {
      name: values.name.trim(),
      status: values.isActive,
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

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="bg-card p-6 rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-border overflow-hidden">
            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-12 lg:col-span-8">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Nama Kategori <span className="text-destructive">*</span>
                      </FormLabel>
                      <Input
                        {...field}
                        placeholder="Contoh: Bahan Kering, Bumbu Dapur"
                        className="h-12"
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="col-span-12 lg:col-span-4">
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</FormLabel>
                      <div
                        className={`flex items-center justify-between p-4 rounded-lg cursor-pointer transition-all ${
                          form.watch("isActive")
                            ? "bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800"
                            : "bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              form.watch("isActive")
                                ? "bg-green-600 text-white"
                                : "bg-destructive/10 text-destructive"
                            }`}
                          >
                            <span className="material-symbols-outlined text-lg">
                              {form.watch("isActive") ? "check" : "close"}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground">
                              {form.watch("isActive") ? "Aktif" : "Tidak Aktif"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {form.watch("isActive")
                                ? "Kategori dapat digunakan"
                                : "Tidak muncul di pilihan"}
                            </p>
                          </div>
                        </div>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="col-span-12">
                <div className="bg-primary/5 rounded-xl p-4 border border-primary/10">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="material-symbols-outlined text-primary text-base">info</span>
                    <span className="text-sm font-semibold text-primary">Tips Penamaan Kategori</span>
                  </div>
                  <div className="space-y-3 text-xs text-muted-foreground leading-relaxed">
                    <p>Gunakan nama kategori yang <span className="text-foreground font-medium">spesifik dan deskriptif</span>, contoh: <span className="text-foreground font-medium">&quot;Bumbu Dapur&quot;</span> atau <span className="text-foreground font-medium">&quot;Bahan Kering&quot;</span>.</p>
                    <p>Kelompokkan bahan baku yang <span className="text-foreground font-medium">sejenis</span> untuk memudahkan pencarian dan pengelolaan stok.</p>
                    <p>Kategori yang <span className="text-foreground font-medium">nonaktif</span> tidak akan muncul di pilihan saat menambah atau mengedit bahan baku.</p>
                  </div>
                </div>
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
      </Form>

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
