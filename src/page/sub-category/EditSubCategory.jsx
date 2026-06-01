import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useMutation, useQuery } from "react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { X, Save } from "lucide-react";
import { useCookies } from "react-cookie";
import { getAllSubCategory, editSubCategory } from "@/services/sub-category";
import { getAllCategoryTable } from "@/services/category";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Combobox } from "@/components/ui/combobox";
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card } from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";
import Modal from "@/components/organism/modal";

const formSchema = z.object({
  idParentCategory: z.string().min(1, "Kategori induk wajib dipilih"),
  name: z.string().min(1, "Nama sub kategori wajib diisi"),
  description: z.string().optional().or(z.literal("")),
  isActive: z.boolean().default(true)
});

const EditSubCategory = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const subCategoryId = searchParams.get("id");
  const [cookie] = useCookies();
  const [cancelModal, setCancelModal] = useState(false);
  const [successModal, setSuccessModal] = useState(false);

  const user = cookie?.user;
  const locationParam = user?.store || "";

  const { data: subCategoriesData, isLoading: isLoadingSubCategories } = useQuery(
    ["sub-categories-edit", locationParam],
    () => getAllSubCategory({ store: locationParam }),
    { enabled: !!locationParam && !!subCategoryId }
  );

  const { data: categoriesData } = useQuery(
    ["categories-dropdown", locationParam],
    () => getAllCategoryTable({ location: locationParam, page: 1, limit: 100 }),
    { enabled: !!locationParam }
  );

  const categories = categoriesData?.data || categoriesData?.categories || [];
  const allSubCategories = subCategoriesData?.data || subCategoriesData || [];

  const subCategory = useMemo(() => {
    if (!subCategoryId || !allSubCategories.length) return null;
    return allSubCategories.find((sc) => String(sc.id || sc._id) === subCategoryId) || null;
  }, [subCategoryId, allSubCategories]);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      idParentCategory: "",
      name: "",
      description: "",
      isActive: true
    }
  });

  useEffect(() => {
    if (subCategory) {
      const parentCategoryId = String(
        subCategory.idParentCategory || subCategory.category?.id || subCategory.category?._id || ""
      );
      form.reset({
        idParentCategory: parentCategoryId,
        name: subCategory.name || "",
        description: subCategory.description || "",
        isActive: subCategory.isActive ?? true
      });
    }
  }, [subCategory, form]);

  const updateMutation = useMutation(editSubCategory, {
    onSuccess: () => {
      setSuccessModal(true);
    },
    onError: (err) => {
      toast.error("Gagal", {
        description: err?.response?.data?.message || err.message || "Gagal mengupdate sub kategori"
      });
    }
  });

  const onSubmit = (values) => {
    updateMutation.mutate({ id: subCategoryId, ...values });
  };

  if (!subCategoryId) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">ID sub kategori tidak ditemukan</p>
      </div>
    );
  }

  if (isLoadingSubCategories) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loading />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <button
          onClick={() => navigate("/dashboard-super-admin")}
          className="hover:text-foreground transition-colors">
          Dashboard
        </button>
        <span className="text-xs">/</span>
        <button
          onClick={() => navigate("/sub-category-list")}
          className="hover:text-foreground transition-colors">
          Sub Kategori
        </button>
        <span className="text-xs">/</span>
        <span className="text-primary font-semibold">Edit Sub Kategori</span>
      </nav>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Edit Sub Kategori</h1>
          <p className="text-sm text-muted-foreground mt-1">Edit sub kategori produk.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setCancelModal(true)} className="gap-2">
            <X size={18} />
            Batal
          </Button>
          <Button
            onClick={form.handleSubmit(onSubmit)}
            disabled={updateMutation.isLoading}
            className="gap-2">
            <Save size={18} />
            {updateMutation.isLoading ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
      </div>

      <Card className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="idParentCategory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Kategori Induk <span className="text-destructive">*</span>
                    </FormLabel>
                    <Combobox
                      options={categories.map((c) => ({
                        value: String(c.id || c._id),
                        label: c.name
                      }))}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Pilih kategori induk"
                      searchPlaceholder="Cari kategori..."
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Nama Sub Kategori <span className="text-destructive">*</span>
                    </FormLabel>
                    <Input placeholder="Masukkan nama sub kategori" {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deskripsi</FormLabel>
                  <Textarea placeholder="Deskripsi sub kategori" rows={3} {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Status</FormLabel>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </Card>

      <Modal
        type="confirm"
        open={cancelModal}
        onOpenChange={setCancelModal}
        title="Batalkan?"
        description="Perubahan yang belum disimpan akan hilang."
        confirmText="Ya, Batalkan"
        onConfirm={() => navigate("/sub-category-list")}
      />
      <Modal
        type="success"
        open={successModal}
        onOpenChange={setSuccessModal}
        title="Berhasil!"
        description="Sub kategori berhasil diupdate."
        confirmText="Kembali ke Daftar"
        onConfirm={() => navigate("/sub-category-list")}
      />
    </div>
  );
};

export default EditSubCategory;
