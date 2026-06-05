import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useMutation, useQuery } from "react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { X, Save } from "lucide-react";
import { getExpenseCategories, editExpenseCategory } from "@/services/expense";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card } from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";
import Modal from "@/components/organism/modal";

const formSchema = z.object({
  name: z.string().min(1, "Nama kategori wajib diisi"),
  description: z.string().optional().or(z.literal(""))
});

const EditExpenseCategory = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  const [cancelModal, setCancelModal] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [draftModal, setDraftModal] = useState(false);

  const { data, isLoading } = useQuery(["expense-categories"], () => getExpenseCategories(), {
    enabled: !!id
  });

  const categoryItem = useMemo(() => {
    if (!data) return {};
    const list = data?.data || data || [];
    return list.find((item) => item.id === id || item._id === id) || {};
  }, [data, id]);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: ""
    }
  });

  useEffect(() => {
    if (categoryItem?.id) {
      form.reset({
        name: categoryItem.name || "",
        description: categoryItem.description || ""
      });
    }
  }, [categoryItem, form]);

  const updateMutation = useMutation(editExpenseCategory, {
    onSuccess: () => {
      setSuccessModal(true);
    },
    onError: (err) => {
      toast.error("Gagal", {
        description:
          err?.response?.data?.message || err.message || "Gagal mengupdate kategori biaya"
      });
    }
  });

  const onSubmit = (values, saveAsDraft = false) => {
    updateMutation.mutate({
      id,
      ...values,
      status: saveAsDraft ? "draft" : "active"
    });
  };

  if (!id) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">ID kategori tidak ditemukan</p>
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

  if (!categoryItem?.id) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Kategori biaya tidak ditemukan</p>
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
          onClick={() => navigate("/expense-category")}
          className="hover:text-foreground transition-colors">
          Kategori Biaya
        </button>
        <span className="text-xs">/</span>
        <span className="text-primary font-semibold">Edit Kategori</span>
      </nav>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Edit Kategori Biaya</h1>
          <p className="text-sm text-muted-foreground mt-1">Edit data kategori biaya.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setCancelModal(true)} className="gap-2">
            <X size={18} />
            Batal
          </Button>
          <Button
            variant="outline"
            onClick={() => setDraftModal(true)}
            disabled={updateMutation.isLoading}>
            Simpan sebagai Draft
          </Button>
          <Button
            onClick={() => form.handleSubmit((v) => onSubmit(v, false))()}
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
            <div className="grid grid-cols-1 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Nama Kategori <span className="text-destructive">*</span>
                    </FormLabel>
                    <Input placeholder="Masukkan nama kategori" {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deskripsi</FormLabel>
                    <Textarea placeholder="Deskripsi kategori biaya" rows={3} {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
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
        onConfirm={() => navigate("/expense-category")}
      />
      <Modal
        type="success"
        open={successModal}
        onOpenChange={setSuccessModal}
        title="Berhasil!"
        description="Kategori biaya berhasil diupdate."
        confirmText="Kembali ke Daftar"
        onConfirm={() => navigate("/expense-category")}
      />
      <Modal
        type="confirm"
        open={draftModal}
        onOpenChange={setDraftModal}
        title="Simpan sebagai Draft?"
        description="Data yang belum lengkap bisa dilengkapi nanti"
        confirmText="Ya, Simpan Draft"
        onConfirm={() => {
          setDraftModal(false);
          const values = form.getValues();
          onSubmit(values, true);
        }}
      />
    </div>
  );
};

export default EditExpenseCategory;
