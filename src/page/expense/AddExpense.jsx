import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { X, Save } from "lucide-react";
import { addExpense, getExpenseCategories } from "@/services/expense";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card } from "@/components/ui/card";
import Modal from "@/components/organism/modal";
import { useTranslation } from "react-i18next";
import { DatePicker } from "@/components/ui/date-picker";
import { format } from "date-fns";

const formSchema = z.object({
  categoryId: z.string().min(1, "Kategori wajib dipilih"),
  description: z.string().min(1, "Deskripsi wajib diisi"),
  amount: z.coerce.number().min(1, "Jumlah wajib diisi"),
  date: z.date({ required_error: "Tanggal wajib diisi" }),
  notes: z.string().optional().or(z.literal(""))
});

const AddExpense = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [cancelModal, setCancelModal] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [draftModal, setDraftModal] = useState(false);

  const { data: categoriesData } = useQuery(["expense-categories"], getExpenseCategories);
  const categories = categoriesData?.data || categoriesData || [];

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      categoryId: "",
      description: "",
      amount: "",
      date: new Date(),
      notes: ""
    }
  });

  const createMutation = useMutation(addExpense, {
    onSuccess: () => {
      setSuccessModal(true);
    },
    onError: (err) => {
      toast.error("Gagal", {
        description: err?.response?.data?.message || err.message || "Gagal menambahkan biaya"
      });
    }
  });

  const onSubmit = (values, saveAsDraft = false) => {
    const payload = { ...values, date: values.date ? format(values.date, "yyyy-MM-dd") : "", status: saveAsDraft ? "draft" : "active" };
    createMutation.mutate(payload);
  };

  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <button
          onClick={() => navigate("/dashboard-super-admin")}
          className="hover:text-foreground transition-colors">
          {t("breadcrumb.home")}
        </button>
        <span className="text-xs">/</span>
        <button
          onClick={() => navigate("/expense")}
          className="hover:text-foreground transition-colors">
          {t("breadcrumb.management")}
        </button>
        <span className="text-xs">/</span>
        <span className="text-primary font-semibold">{t("breadcrumb.add")}</span>
      </nav>

      <div>
        <h1 className="text-2xl font-bold text-foreground">{t("page.expense.add.title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t("page.expense.add.description")}</p>
      </div>

      <Card className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Kategori <span className="text-destructive">*</span>
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih kategori" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.length === 0 ? (
                          <SelectItem value="__none" disabled>
                            Tidak ada kategori
                          </SelectItem>
                        ) : (
                          categories.map((cat) => (
                            <SelectItem key={cat.id || cat._id} value={cat.id || cat._id}>
                              {cat.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Deskripsi <span className="text-destructive">*</span>
                    </FormLabel>
                    <Input placeholder="Masukkan deskripsi biaya" {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Jumlah <span className="text-destructive">*</span>
                    </FormLabel>
                    <Input
                      type="number"
                      placeholder="Masukkan jumlah biaya"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e.target.value === "" ? "" : Number(e.target.value));
                      }}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Tanggal <span className="text-destructive">*</span>
                    </FormLabel>
                    <DatePicker date={field.value} setDate={field.onChange} />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Catatan</FormLabel>
                  <Textarea placeholder="Catatan tambahan" rows={3} {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-between items-center gap-4 mt-6 bg-card border border-border rounded-xl p-4">
              <Button variant="outline" onClick={() => setCancelModal(true)} className="gap-2">
                <X size={18} />
                Batal
              </Button>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setDraftModal(true)}
                  disabled={createMutation.isLoading}>
                  Simpan sebagai Draft
                </Button>
                <Button
                  onClick={() => form.handleSubmit((v) => onSubmit(v, false))()}
                  disabled={createMutation.isLoading}
                  className="gap-2">
                  <Save size={18} />
                  {createMutation.isLoading ? "Menyimpan..." : "Simpan"}
                </Button>
              </div>
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
        onConfirm={() => navigate("/expense")}
      />
      <Modal
        type="success"
        open={successModal}
        onOpenChange={setSuccessModal}
        title="Berhasil!"
        description="Biaya berhasil ditambahkan."
        confirmText="Kembali ke Daftar"
        onConfirm={() => navigate("/expense")}
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

export default AddExpense;
