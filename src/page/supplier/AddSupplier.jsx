import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { X, Save } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Switch } from "@/components/ui/switch";
import { addSupplier } from "@/services/supplier";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card } from "@/components/ui/card";
import Modal from "@/components/organism/modal";

const formSchema = z.object({
  name: z.string().min(1, "Nama supplier wajib diisi"),
  contactPerson: z.string().optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  email: z.string().email("Format email tidak valid").optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  isActive: z.boolean().default(true)
});

const AddSupplier = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [cancelModal, setCancelModal] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [draftModal, setDraftModal] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      contactPerson: "",
      phone: "",
      email: "",
      address: "",
      isActive: true
    }
  });

  const createMutation = useMutation(addSupplier, {
    onSuccess: () => {
      setSuccessModal(true);
    },
    onError: (err) => {
      toast.error(t("common.error"), {
        description:
          err?.response?.data?.message || err.message || t("page.supplier.toast.addFailed")
      });
    }
  });

  const onSubmit = (values, saveAsDraft = false) => {
    createMutation.mutate({ ...values, status: saveAsDraft ? false : !!values.isActive });
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
          onClick={() => navigate("/supplier")}
          className="hover:text-foreground transition-colors">
          {t("breadcrumb.supplier")}
        </button>
        <span className="text-xs">/</span>
        <span className="text-primary font-semibold">{t("page.supplier.add.title")}</span>
      </nav>

      <div>
        <h1 className="text-2xl font-bold text-foreground">{t("page.supplier.add.title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t("page.supplier.add.description")}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6 lg:col-span-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t("page.supplier.form.name")} <span className="text-destructive">*</span>
                      </FormLabel>
                      <Input placeholder={t("page.supplier.form.namePlaceholder")} {...field} />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="contactPerson"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("page.supplier.form.contactPerson")}</FormLabel>
                      <Input
                        placeholder={t("page.supplier.form.contactPersonPlaceholder")}
                        {...field}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("page.supplier.form.phone")}</FormLabel>
                      <Input placeholder={t("page.supplier.form.phonePlaceholder")} inputMode="numeric" {...field} onChange={(e) => { const v = e.target.value.replace(/\D/g, ""); field.onChange(v); }} />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("page.supplier.form.email")}</FormLabel>
                      <Input placeholder={t("page.supplier.form.emailPlaceholder")} {...field} />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("page.supplier.form.address")}</FormLabel>
                    <Textarea
                      placeholder={t("page.supplier.form.addressPlaceholder")}
                      rows={3}
                      {...field}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </Card>

        <Card className="p-6">
          <h3 className="text-sm font-semibold text-foreground mb-3">
            {t("page.supplier.form.status")}
          </h3>
          <div
            className={`flex items-center justify-between p-4 rounded-lg transition-all ${
              form.watch("isActive")
                ? "bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800"
                : "bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800"
            }`}>
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  form.watch("isActive")
                    ? "bg-green-600 text-white"
                    : "bg-destructive/10 text-destructive"
                }`}>
                <span className="material-symbols-outlined text-lg">
                  {form.watch("isActive") ? "check" : "close"}
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {form.watch("isActive") ? t("common.active") : t("common.inactive")}
                </p>
                <p className="text-xs text-muted-foreground">
                  {form.watch("isActive")
                    ? t("page.supplier.form.activeDescription")
                    : t("page.supplier.form.inactiveDescription")}
                </p>
              </div>
            </div>
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              )}
            />
          </div>
        </Card>
      </div>

    <div className="flex justify-between items-center gap-4 mt-6 bg-card border border-border rounded-xl p-4">
              <Button variant="outline" onClick={() => setCancelModal(true)} className="gap-2">
                <X size={18} />
                {t("common.cancel")}
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
        title={t("page.supplier.modal.cancelTitle")}
        description={t("page.supplier.modal.cancelDescription")}
        confirmText={t("page.supplier.modal.confirmCancel")}
        onConfirm={() => navigate("/supplier")}
      />
      <Modal
        type="success"
        open={successModal}
        onOpenChange={setSuccessModal}
        title={t("common.success")}
        description={t("page.supplier.toast.addSuccess")}
        confirmText={t("page.supplier.modal.backToList")}
        onConfirm={() => navigate("/supplier")}
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

export default AddSupplier;
