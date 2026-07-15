import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useMutation, useQuery } from "react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { X, Save, Check } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import { editTaxConfig, getTaxConfigById } from "@/services/tax-config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Loading } from "@/components/ui/loading";
import Modal from "@/components/organism/modal";
import { useConfirmSubmit } from "@/hooks/useConfirmSubmit";
import AbortController from "@/components/organism/abort-controller";

const taxTypes = [
  { value: "ppn", label: "PPN" },
  { value: "other", label: "PPh" },
  { value: "service_charge", label: "Non-Pajak" }
];

const EditTaxConfig = () => {
  const { t } = useTranslation();
  const formSchema = z.object({
    name: z.string().min(1, t("page.taxConfig.validation.nameRequired")),
    type: z.string().min(1, t("page.taxConfig.validation.typeRequired")),
    rate: z.coerce.number().min(0, t("page.taxConfig.validation.rateNegative")),
    description: z.string().optional().or(z.literal("")),
    isActive: z.boolean().default(true)
  });
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

  const { handleSubmit: onConfirmSubmit, confirmModal } = useConfirmSubmit(form, (values) =>
    onSubmit(values)
  );

  const tax = taxData?.data || {};

  useEffect(() => {
    if (tax?.id) {
      form.reset({
        name: tax.name || "",
        type: tax.type || "ppn",
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
    return <Loading fullscreen size="lg" label={t("common.loadingData")} />;
  }

  return (
    <div>
      <div className="space-y-6">
        <PageHeader
          breadcrumbs={[
            {
              label: t("breadcrumb.home"),
              href: "/dashboard-super-admin",
              i18nKey: "breadcrumb.home"
            },
            {
              label: t("breadcrumb.tax"),
              href: "/tax-list",
              i18nKey: "breadcrumb.tax"
            },
            { label: t("page.taxConfig.edit.title"), i18nKey: "page.taxConfig.edit.title" }
          ]}
          title={t("page.taxConfig.edit.title")}
          description={t("page.taxConfig.edit.description")}
          backLink="/tax-list">
        </PageHeader>

        <div className="flex items-center justify-between">
          <div></div>
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
              {t("common.saveAsDraft")}
            </Button>
            <Button
              onClick={() => onConfirmSubmit()}
              disabled={updateMutation.isLoading}
              className="gap-2">
              <Save size={18} />
              {updateMutation.isLoading ? t("common.saving") : t("common.save")}
            </Button>
          </div>
        </div>

        <Card className="p-6">
          <Form {...form}>
            <form onSubmit={onConfirmSubmit} className="space-y-6">
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
                      <div className={`pt-2 flex items-center justify-between p-4 rounded-lg ${
                        field.value
                          ? "bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800"
                          : "bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800"
                      }`}>
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              field.value
                                ? "bg-green-600 text-secondary"
                                : "bg-destructive/10 text-destructive"
                            }`}>
                            {field.value ? (
                              <Check size={20} />
                            ) : (
                              <span className="text-lg font-bold">⏻</span>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground">
                              {field.value ? t("common.active") : t("common.inactive")}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {field.value ? t("common.active") : t("common.inactive")}
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
            </form>
          </Form>
          <Modal type="confirm" {...confirmModal()} />
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
          title={t("common.saveAsDraftTitle")}
          description={t("common.saveAsDraftDesc")}
          confirmText={t("common.yesSaveDraft")}
          onConfirm={() => {
            setDraftModal(false);
            const values = form.getValues();
            onSubmit(values, true);
          }}
        />
      </div>
    </div>
  );
};

export default EditTaxConfig;
