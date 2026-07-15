import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useCookies } from "react-cookie";
import { X, Save, Check } from "lucide-react";
import { addTaxConfig } from "@/services/tax-config";
import { getAllLocation } from "@/services/location";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Loading } from "@/components/ui/loading";
import PageHeader from "@/components/ui/PageHeader";
import UserGuide from "@/components/organism/UserGuide";
import { useConfirmSubmit } from "@/hooks/useConfirmSubmit";
import Modal from "@/components/organism/modal";

const taxTypes = [
  { value: "ppn", label: "PPN" },
  { value: "other", label: "PPh" },
  { value: "service_charge", label: "Non-Pajak" }
];

const AddTaxConfig = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [cookie] = useCookies();
  const user = cookie?.user;
  const isSuperAdmin = user?.roleType === "super_admin";

  const { data: locationsData } = useQuery(
    ["allLocations"],
    () => getAllLocation(),
    { enabled: isSuperAdmin }
  );
  const locations = locationsData?.data || [];

  const formSchema = useMemo(() => {
    return z.object({
      name: z.string().min(1, t("page.taxConfig.validation.nameRequired")),
      type: z.string().min(1, t("page.taxConfig.validation.typeRequired")),
      rate: z.coerce
        .number()
        .min(0, t("page.taxConfig.validation.rateNegative"))
        .max(100, t("page.taxConfig.validation.rateMax")),
      description: z.string().optional().or(z.literal("")),
      isActive: z.boolean().default(true),
      store: z.string().optional()
    });
  }, []);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      type: "ppn",
      rate: 11,
      description: "",
      isActive: true,
      store: ""
    }
  });

  const [cancelModal, setCancelModal] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [draftModal, setDraftModal] = useState(false);

  const { handleSubmit: onConfirmSubmit, confirmModal } = useConfirmSubmit(form, (values) =>
    onSubmit(values, false)
  );

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
    const { isActive, store, ...rest } = values;
    createMutation.mutate({
      ...rest,
      store: isSuperAdmin && store ? Number(store) : undefined,
      status: saveAsDraft ? "draft" : isActive ? "active" : "inactive"
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <div>
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
        </div>
      </div>

      <div>
        <div>
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
                  {isSuperAdmin && (
                    <FormField
                      control={form.control}
                      name="store"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("page.taxConfig.form.store")}</FormLabel>
                          <select
                            value={field.value}
                            onChange={field.onChange}
                            className="w-full h-10 px-3 bg-background border border-border rounded-lg text-sm focus:ring-2 focus:ring-ring focus:border-primary outline-none">
                            <option value="">{t("page.taxConfig.form.allStores")}</option>
                            {locations.map((loc) => (
                              <option key={loc.id} value={loc.id}>
                                {loc.name}
                              </option>
                            ))}
                          </select>
                          <p className="text-xs text-muted-foreground">
                            {t("page.taxConfig.form.storeHint")}
                          </p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem>
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
                                {field.value
                                  ? t("page.taxConfig.form.activeDesc")
                                  : t("page.taxConfig.form.inactiveDesc")}
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
                      type="button"
                      variant="outline"
                      onClick={() => setDraftModal(true)}
                      disabled={createMutation.isLoading}
                      className="gap-2">
                      <Save size={18} />
                      {t("common.saveAsDraft")}
                    </Button>
                    <Button
                      type="button"
                      onClick={() => onConfirmSubmit()}
                      disabled={createMutation.isLoading}
                      className="gap-2">
                      <Save size={18} />
                      {createMutation.isLoading ? t("common.saving") : t("common.save")}
                    </Button>
                  </div>
                </div>
              </form>
            </Form>
            <Modal type="confirm" {...confirmModal()} />
          </Card>
        </div>
      </div>

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
        title={t("common.saveAsDraftTitle")}
        description={t("common.saveAsDraftDesc")}
        confirmText={t("common.yesSaveDraft")}
        onConfirm={() => {
          setDraftModal(false);
          const values = form.getValues();
          onSubmit(values, true);
        }}
      />
      {createMutation.isLoading && <Loading fullscreen size="lg" label={t("common.saving")} />}
    </div>
  );
};

export default AddTaxConfig;
