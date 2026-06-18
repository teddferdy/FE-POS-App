import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useMutation, useQuery } from "react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { X, Save } from "lucide-react";
import { editTaxConfig, getTaxConfigById } from "@/services/tax-config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Loading } from "@/components/ui/loading";
import Modal from "@/components/organism/modal";
import { motion } from "framer-motion";
import AbortController from "@/components/organism/abort-controller";

const formSchema = z.object({
  name: z.string().min(1, "Nama pajak wajib diisi"),
  rate: z.coerce.number().min(0, "Tarif tidak boleh negatif"),
  description: z.string().optional().or(z.literal("")),
  isActive: z.boolean().default(true)
});

const taxTypes = [
  { value: "PPN", label: "PPN" },
  { value: "PPh", label: "PPh" },
  { value: "Non-Pajak", label: "Non-Pajak" }
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const EditTaxConfig = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const taxId = searchParams.get("id");
  const [cancelModal, setCancelModal] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [draftModal, setDraftModal] = useState(false);

  const {
    data: taxData,
    isLoading,
    isError,
    refetch
  } = useQuery(["tax-config-detail", taxId], () => getTaxConfigById({ id: taxId }), {
    enabled: !!taxId
  });

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

  const tax = taxData?.data || {};

  useEffect(() => {
    if (tax?.id) {
      form.reset({
        name: tax.name || "",
        rate: tax.rate || 0,
        description: tax.description || "",
        isActive: tax.status === "active"
      });
    }
  }, [tax, form]);

  const updateMutation = useMutation(editTaxConfig, {
    onSuccess: () => {
      setSuccessModal(true);
    },
    onError: (err) => {
      toast.error(t("common.error"), {
        description:
          err?.response?.data?.message || err.message || t("page.taxConfig.toast.updateFailed")
      });
    }
  });

  const onSubmit = (values, saveAsDraft = false) => {
    const { isActive, ...rest } = values;
    updateMutation.mutate({
      id: taxId,
      ...rest,
      type: "percentage",
      status: saveAsDraft ? "draft" : isActive ? "active" : "inactive"
    });
  };

  if (!taxId) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">{t("page.taxConfig.edit.notFound")}</p>
      </div>
    );
  }

  if (isError) return <AbortController refetch={refetch} />;

  if (isLoading) {
    return <Loading fullscreen size="lg" label="Memuat data..." />;
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show">
      <div className="space-y-6">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <button
            onClick={() => navigate("/dashboard-super-admin")}
            className="hover:text-foreground transition-colors">
            {t("breadcrumb.home")}
          </button>
          <span className="text-xs">/</span>
          <button
            onClick={() => navigate("/tax-list")}
            className="hover:text-foreground transition-colors">
            {t("breadcrumb.tax")}
          </button>
          <span className="text-xs">/</span>
          <span className="text-primary font-semibold">{t("page.taxConfig.edit.title")}</span>
        </nav>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{t("page.taxConfig.edit.title")}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {t("page.taxConfig.edit.description")}
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setCancelModal(true)} className="gap-2">
              <X size={18} />
              {t("common.cancel")}
            </Button>
            <Button
              variant="outline"
              onClick={() => setDraftModal(true)}
              disabled={updateMutation.isLoading}
              className="gap-2">
              <Save size={18} />
              Simpan sebagai Draft
            </Button>
            <Button
              onClick={() => form.handleSubmit((v) => onSubmit(v, false))()}
              disabled={updateMutation.isLoading}
              className="gap-2">
              <Save size={18} />
              {updateMutation.isLoading ? t("common.saving") : t("common.save")}
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
                        {t("page.taxConfig.form.name")} <span className="text-destructive">*</span>
                      </FormLabel>
                      <Input placeholder={t("page.taxConfig.form.namePlaceholder")} {...field} />
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
                        {t("page.taxConfig.form.type")} <span className="text-destructive">*</span>
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
                        {t("page.taxConfig.form.rate")} <span className="text-destructive">*</span>
                      </FormLabel>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder={t("page.taxConfig.form.ratePlaceholder")}
                        {...field}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("common.status")}</FormLabel>
                      <div className="flex items-center gap-3 h-10">
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                        <span className="text-sm text-muted-foreground">
                          {field.value ? t("common.active") : t("common.inactive")}
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
                    <FormLabel>{t("page.taxConfig.form.description")}</FormLabel>
                    <Textarea
                      placeholder={t("page.taxConfig.form.descriptionPlaceholder")}
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

        <Modal
          type="confirm"
          open={cancelModal}
          onOpenChange={setCancelModal}
          title={t("modal.cancelTitle")}
          description={t("modal.cancelDescription")}
          confirmText={t("modal.yesCancel")}
          onConfirm={() => navigate("/tax-list")}
        />
        <Modal
          type="success"
          open={successModal}
          onOpenChange={setSuccessModal}
          title={t("common.success")}
          description={t("page.taxConfig.toast.updateSuccess")}
          confirmText={t("modal.backToList")}
          onConfirm={() => navigate("/tax-list")}
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
    </motion.div>
  );
};

export default EditTaxConfig;
