import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { X, Save } from "lucide-react";
import { useTranslation } from "react-i18next";
import { addShift } from "@/services/shift";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card } from "@/components/ui/card";
import Modal from "@/components/organism/modal";

const formSchema = z.object({
  nama_shift: z.string().min(1, "Nama shift wajib diisi"),
  jam_mulai: z.string().min(1, "Jam mulai wajib diisi"),
  jam_selesai: z.string().min(1, "Jam selesai wajib diisi"),
  deskripsi: z.string().optional().or(z.literal("")),
  status: z.boolean().default(true)
});

const AddShift = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [cancelModal, setCancelModal] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [draftModal, setDraftModal] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nama_shift: "",
      jam_mulai: "",
      jam_selesai: "",
      deskripsi: "",
      status: true
    }
  });

  const createMutation = useMutation(addShift, {
    onSuccess: () => {
      setSuccessModal(true);
    },
    onError: (err) => {
      toast.error("Gagal", {
        description: err?.response?.data?.message || err.message || "Gagal menambahkan shift"
      });
    }
  });

  const onSubmit = (values, saveAsDraft = false) => {
    const { status, ...rest } = values;
    createMutation.mutate({
      ...rest,
      status: saveAsDraft ? "draft" : status ? "active" : "inactive"
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
          onClick={() => navigate("/shift")}
          className="hover:text-foreground transition-colors">
          {t("page.shift.list.title")}
        </button>
        <span className="text-xs">/</span>
        <span className="text-primary font-semibold">{t("page.shift.add.title")}</span>
      </nav>

      <div>
        <h1 className="text-2xl font-bold text-foreground">{t("page.shift.add.title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t("page.shift.list.description")}</p>
      </div>

      <Card className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="nama_shift"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Nama Shift <span className="text-destructive">*</span>
                    </FormLabel>
                    <Input placeholder="Masukkan nama shift" {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div />
              <FormField
                control={form.control}
                name="jam_mulai"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Jam Mulai <span className="text-destructive">*</span>
                    </FormLabel>
                    <input
                      type="time"
                      className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      {...field}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="jam_selesai"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Jam Selesai <span className="text-destructive">*</span>
                    </FormLabel>
                    <input
                      type="time"
                      className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      {...field}
                    />
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
                  <Textarea placeholder="Deskripsi shift" rows={3} {...field} />
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
                            ? "Shift ini aktif dan dapat digunakan."
                            : "Shift ini tidak aktif."}
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
                  disabled={createMutation.isLoading}
                  className="gap-2">
                  <Save size={18} />
                  Simpan sebagai Draft
                </Button>
                <Button
                  onClick={() => form.handleSubmit((v) => onSubmit(v, false))()}
                  disabled={createMutation.isLoading}
                  className="gap-2">
                  <Save size={18} />
                  {createMutation.isLoading ? t("common.saving") : t("common.save")}
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
        onConfirm={() => navigate("/shift")}
      />
      <Modal
        type="success"
        open={successModal}
        onOpenChange={setSuccessModal}
        title="Berhasil!"
        description="Shift berhasil ditambahkan."
        confirmText="Kembali ke Daftar"
        onConfirm={() => navigate("/shift")}
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

export default AddShift;
