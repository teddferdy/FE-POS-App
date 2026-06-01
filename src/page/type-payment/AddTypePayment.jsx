import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { X, Save } from "lucide-react";
import { addTypePayment } from "@/services/type-payment";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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

const formSchema = z.object({
  namaPembayaran: z.string().min(1, "Nama pembayaran wajib diisi"),
  tipe: z.string().min(1, "Tipe pembayaran wajib dipilih"),
  deskripsi: z.string().optional().or(z.literal("")),
  status: z.boolean().default(true)
});

const AddTypePayment = () => {
  const navigate = useNavigate();
  const [cancelModal, setCancelModal] = useState(false);
  const [successModal, setSuccessModal] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      namaPembayaran: "",
      tipe: "",
      deskripsi: "",
      status: true
    }
  });

  const createMutation = useMutation(addTypePayment, {
    onSuccess: () => {
      setSuccessModal(true);
    },
    onError: (err) => {
      toast.error("Gagal", {
        description:
          err?.response?.data?.message || err.message || "Gagal menambahkan tipe pembayaran"
      });
    }
  });

  const onSubmit = (values) => {
    createMutation.mutate(values);
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
        <button
          onClick={() => navigate("/type-payment")}
          className="hover:text-foreground transition-colors">
          Tipe Pembayaran
        </button>
        <span className="text-xs">/</span>
        <span className="text-primary font-semibold">Tambah Tipe Pembayaran</span>
      </nav>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Tambah Tipe Pembayaran</h1>
          <p className="text-sm text-muted-foreground mt-1">Tambah metode pembayaran baru.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setCancelModal(true)} className="gap-2">
            <X size={18} />
            Batal
          </Button>
          <Button
            onClick={form.handleSubmit(onSubmit)}
            disabled={createMutation.isLoading}
            className="gap-2">
            <Save size={18} />
            {createMutation.isLoading ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
      </div>

      <Card className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="namaPembayaran"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Nama Pembayaran <span className="text-destructive">*</span>
                    </FormLabel>
                    <Input placeholder="Masukkan nama pembayaran" {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tipe"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Tipe <span className="text-destructive">*</span>
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih tipe" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Tunai">Tunai</SelectItem>
                        <SelectItem value="Non-Tunai">Non-Tunai</SelectItem>
                        <SelectItem value="Transfer">Transfer</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="deskripsi"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deskripsi</FormLabel>
                  <Textarea
                    placeholder="Deskripsi tipe pembayaran (opsional)"
                    rows={3}
                    {...field}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <div
                    className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
                      field.value
                        ? "bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800"
                        : "bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800"
                    }`}>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        Status {field.value ? "Aktif" : "Tidak Aktif"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {field.value
                          ? "Tipe pembayaran aktif dan dapat digunakan"
                          : "Tipe pembayaran tidak aktif"}
                      </p>
                    </div>
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
        onConfirm={() => navigate("/type-payment")}
      />
      <Modal
        type="success"
        open={successModal}
        onOpenChange={setSuccessModal}
        title="Berhasil!"
        description="Tipe pembayaran berhasil ditambahkan."
        confirmText="Kembali ke Daftar"
        onConfirm={() => navigate("/type-payment")}
      />
    </div>
  );
};

export default AddTypePayment;
