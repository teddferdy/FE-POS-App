import React, { useState } from "react";
import { useTranslation } from "react-i18next";
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
import PageHeader from "@/components/ui/PageHeader";
import UserGuide from "@/components/organism/UserGuide";
import Modal from "@/components/organism/modal";
import { motion } from "framer-motion";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

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

const AddTaxConfig = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [cancelModal, setCancelModal] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [draftModal, setDraftModal] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      rate: 11,
      description: "",
      isActive: true
    }
  });

  const createMutation = useMutation(addTaxConfig, {
    onSuccess: () => {
      setSuccessModal(true);
    },
    onError: (err) => {
      toast.error(t("common.error"), {
        description:
          err?.response?.data?.message || err.message || t("page.taxConfig.toast.addFailed")
      });
    }
  });

  const onSubmit = (values, saveAsDraft = false) => {
    const { isActive, ...rest } = values;
    createMutation.mutate({
      ...rest,
      type: "percentage",
      status: saveAsDraft ? "draft" : isActive ? "active" : "inactive"
    });
  };

  return (
    <div className="space-y-6">
      <motion.div variants={container} initial="hidden" animate="show">
        <motion.div variants={item}>
          <PageHeader
            breadcrumbs={[
              { i18nKey: "breadcrumb.home", href: "/dashboard-super-admin" },
              { i18nKey: "breadcrumb.tax", href: "/tax-list" },
              { i18nKey: "page.taxConfig.add.title" }
            ]}
            title={t("page.taxConfig.add.title")}
            description={t("page.taxConfig.add.description")}>
            <UserGuide guideKey="add-tax" />
          </PageHeader>
        </motion.div>
      </motion.div>

      <motion.div variants={container} initial="hidden" animate="show">
        <motion.div variants={item}>
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
                          {t("page.taxConfig.form.name")}{" "}
                          <span className="text-destructive">*</span>
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
                          {t("page.taxConfig.form.type")}{" "}
                          <span className="text-destructive">*</span>
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
                          {t("page.taxConfig.form.rate")}{" "}
                          <span className="text-destructive">*</span>
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
                                {field.value ? t("common.active") : t("common.inactive")}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {field.value
                                  ? "Pajak ini aktif dan dapat digunakan."
                                  : "Pajak ini tidak aktif."}
                              </p>
                            </div>
                          </div>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
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
        </motion.div>
      </motion.div>

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
        description={t("page.taxConfig.toast.addSuccess")}
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
  );
};

export default AddTaxConfig;
