import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { X, Save } from "lucide-react";
import { addTaxConfig } from "@/services/tax-config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import Modal from "@/components/organism/modal";

const formSchema = z.object({
  name: z.string().min(1, "Nama pajak wajib diisi"),
  type: z.enum(["PPN", "PPh", "Non-Pajak"]),
  rate: z.coerce.number().min(0, "Tarif tidak boleh negatif"),
  description: z.string().optional().or(z.literal("")),
  isActive: z.boolean().default(true)
});

const taxTypes = [
  { value: "PPN", label: "PPN" },
  { value: "PPh", label: "PPh" },
  { value: "Non-Pajak", label: "Non-Pajak" }
];

const AddTaxConfig = () => {
  const navigate = useNavigate();
  const [cancelModal, setCancelModal] = useState(false);
  const [successModal, setSuccessModal] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      type: "PPN",
      rate: 0,
      description: "",
      isActive: true
    }
  });

  const createMutation = useMutation(addTaxConfig, {
    onSuccess: () => {
      setSuccessModal(true);
    },
    onError: (err) => {
      toast.error("Gagal", {
        description: err?.response?.data?.message || err.message || "Gagal menambahkan pajak"
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
          onClick={() => navigate("/tax-list")}
          className="hover:text-foreground transition-colors">
          Pajak
        </button>
        <span className="text-xs">/</span>
        <span className="text-primary font-semibold">Tambah Pajak</span>
      </nav>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Tambah Pajak</h1>
          <p className="text-sm text-muted-foreground mt-1">Tambah konfigurasi tarif pajak baru.</p>
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
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Nama Pajak <span className="text-destructive">*</span>
                    </FormLabel>
                    <Input placeholder="Contoh: PPN 11%" {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Tipe Pajak <span className="text-destructive">*</span>
                    </FormLabel>
                    <select
                      value={field.value}
                      onChange={field.onChange}
                      className="w-full h-10 px-3 bg-background border border-border rounded-lg text-sm focus:ring-2 focus:ring-ring focus:border-primary outline-none">
                      {taxTypes.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="rate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Tarif (%) <span className="text-destructive">*</span>
                    </FormLabel>
                    <Input type="number" min="0" step="0.01" placeholder="Contoh: 11" {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <div className="flex items-center gap-3 h-10">
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                      <span className="text-sm text-muted-foreground">
                        {field.value ? "Aktif" : "Tidak Aktif"}
                      </span>
                    </div>
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
                  <Textarea placeholder="Deskripsi pajak" rows={3} {...field} />
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
        onConfirm={() => navigate("/tax-list")}
      />
      <Modal
        type="success"
        open={successModal}
        onOpenChange={setSuccessModal}
        title="Berhasil!"
        description="Pajak berhasil ditambahkan."
        confirmText="Kembali ke Daftar"
        onConfirm={() => navigate("/tax-list")}
      />
    </div>
  );
};

export default AddTaxConfig;
