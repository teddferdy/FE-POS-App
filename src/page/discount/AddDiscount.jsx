import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { X, Save } from "lucide-react";
import { addDiscount } from "@/services/discount";
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
import { useTranslation } from "react-i18next";

const formSchema = z.object({
  name: z.string().min(1, "Nama diskon wajib diisi"),
  type: z.string().min(1, "Tipe diskon wajib dipilih"),
  value: z.coerce.number().min(1, "Nilai diskon wajib diisi"),
  startDate: z.string().min(1, "Tanggal mulai wajib diisi"),
  endDate: z.string().optional().or(z.literal("")),
  minPurchase: z.coerce.number().min(0).optional().or(z.literal("")),
  description: z.string().optional().or(z.literal("")),
  isActive: z.boolean().default(true)
});

const AddDiscount = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [draftModal, setDraftModal] = useState(false);
  const [cancelModal, setCancelModal] = useState(false);
  const [successModal, setSuccessModal] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      type: "",
      value: "",
      startDate: "",
      endDate: "",
      minPurchase: "",
      description: "",
      isActive: true
    }
  });

  const createMutation = useMutation(addDiscount, {
    onSuccess: () => {
      setSuccessModal(true);
    },
    onError: (err) => {
      toast.error("Gagal", {
        description: err?.response?.data?.message || err.message || "Gagal menambahkan diskon"
      });
    }
  });

  const onSubmit = (values, saveAsDraft = false) => {
    createMutation.mutate({
      ...values,
      status: saveAsDraft ? "draft" : values.isActive ? "active" : "inactive"
    });
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
          onClick={() => navigate("/discount")}
          className="hover:text-foreground transition-colors">
          {t("breadcrumb.management")}
        </button>
        <span className="text-xs">/</span>
        <span className="text-primary font-semibold">{t("breadcrumb.add")}</span>
      </nav>

      <div>
        <h1 className="text-2xl font-bold text-foreground">{t("breadcrumb.add")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t("page.discount.add.description")}</p>
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
                      Nama Diskon <span className="text-destructive">*</span>
                    </FormLabel>
                    <Input placeholder="Masukkan nama diskon" {...field} />
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
                      Tipe Diskon <span className="text-destructive">*</span>
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih tipe diskon" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Persentase">Persentase</SelectItem>
                        <SelectItem value="Nominal">Nominal</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Nilai <span className="text-destructive">*</span>
                    </FormLabel>
                    <Input
                      type="number"
                      placeholder="Masukkan nilai diskon"
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
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Tanggal Mulai <span className="text-destructive">*</span>
                    </FormLabel>
                    <Input type="date" {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tanggal Berakhir</FormLabel>
                    <Input type="date" {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="minPurchase"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimal Belanja</FormLabel>
                    <Input
                      type="number"
                      placeholder="0"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e.target.value === "" ? "" : Number(e.target.value));
                      }}
                    />
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
                  <Textarea placeholder="Deskripsi diskon" rows={3} {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem>
                  <div
                    className={`flex items-center justify-between p-4 rounded-lg cursor-pointer transition-all ${
                      field.value
                        ? "bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800"
                        : "bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800"
                    }`}>
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          field.value
                            ? "bg-green-600 text-white"
                            : "bg-destructive/10 text-destructive"
                        }`}>
                        <span className="material-symbols-outlined text-lg">
                          {field.value ? "check" : "close"}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {field.value ? "Aktif" : "Tidak Aktif"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {field.value
                            ? "Diskon ini aktif dan dapat digunakan."
                            : "Diskon ini tidak aktif."}
                        </p>
                      </div>
                    </div>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-between items-center gap-4 mt-6 bg-card border border-border rounded-xl p-4">
              <Button variant="outline" onClick={() => setCancelModal(true)} className="gap-2">
                <X size={18} />
                {t("breadcrumb.back")}
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
                  {createMutation.isLoading ? t("button.saving") : t("button.save")}
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
        onConfirm={() => navigate("/discount")}
      />
      <Modal
        type="success"
        open={successModal}
        onOpenChange={setSuccessModal}
        title="Berhasil!"
        description="Diskon berhasil ditambahkan."
        confirmText="Kembali ke Daftar"
        onConfirm={() => navigate("/discount")}
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

export default AddDiscount;
