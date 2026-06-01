import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useMutation, useQuery } from "react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useCookies } from "react-cookie";
import { X, Save } from "lucide-react";
import { getAllExpenses, editExpense, getExpenseCategories } from "@/services/expense";
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
import { Loading } from "@/components/ui/loading";
import Modal from "@/components/organism/modal";

const formSchema = z.object({
  categoryId: z.string().min(1, "Kategori wajib dipilih"),
  description: z.string().min(1, "Deskripsi wajib diisi"),
  amount: z.coerce.number().min(1, "Jumlah wajib diisi"),
  date: z.string().min(1, "Tanggal wajib diisi"),
  notes: z.string().optional().or(z.literal(""))
});

const EditExpense = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  const [cookie] = useCookies();
  const [cancelModal, setCancelModal] = useState(false);
  const [successModal, setSuccessModal] = useState(false);

  const user = cookie?.user;
  const locationParam = user?.store || "";

  const { data: categoriesData } = useQuery(["expense-categories"], getExpenseCategories);
  const categories = categoriesData?.data || categoriesData || [];

  const { data, isLoading } = useQuery(
    ["expenses-all", locationParam],
    () => getAllExpenses({ location: locationParam, page: 1, limit: 9999 }),
    { enabled: !!id }
  );

  const expenseItem = useMemo(() => {
    if (!data?.data) return {};
    return data.data.find((item) => item.id === id || item._id === id) || {};
  }, [data, id]);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      categoryId: "",
      description: "",
      amount: "",
      date: "",
      notes: ""
    }
  });

  useEffect(() => {
    if (expenseItem?.id) {
      form.reset({
        categoryId:
          expenseItem.categoryId || expenseItem.category?.id || expenseItem.category?._id || "",
        description: expenseItem.description || "",
        amount: expenseItem.amount ?? "",
        date: expenseItem.date ? expenseItem.date.split("T")[0] : "",
        notes: expenseItem.notes || ""
      });
    }
  }, [expenseItem, form]);

  const updateMutation = useMutation(editExpense, {
    onSuccess: () => {
      setSuccessModal(true);
    },
    onError: (err) => {
      toast.error("Gagal", {
        description: err?.response?.data?.message || err.message || "Gagal mengupdate biaya"
      });
    }
  });

  const onSubmit = (values) => {
    updateMutation.mutate({ id, ...values });
  };

  if (!id) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">ID biaya tidak ditemukan</p>
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

  if (!expenseItem?.id) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Biaya tidak ditemukan</p>
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
          onClick={() => navigate("/expense")}
          className="hover:text-foreground transition-colors">
          Biaya
        </button>
        <span className="text-xs">/</span>
        <span className="text-primary font-semibold">Edit Biaya</span>
      </nav>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Edit Biaya</h1>
          <p className="text-sm text-muted-foreground mt-1">Edit data pengeluaran.</p>
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
                          <SelectItem value="" disabled>
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
                    <Input type="date" {...field} />
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
        description="Biaya berhasil diupdate."
        confirmText="Kembali ke Daftar"
        onConfirm={() => navigate("/expense")}
      />
    </div>
  );
};

export default EditExpense;
