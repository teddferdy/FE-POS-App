import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useMutation, useQuery } from "react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { X, Save, Plus, Trash2 } from "lucide-react";
import { editPriceListTemplate, getPriceListTemplateById } from "@/services/price-list-template";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Loading } from "@/components/ui/loading";
import Modal from "@/components/organism/modal";
import { useTranslation } from "react-i18next";

const formSchema = z.object({
  name: z.string().min(1, "Nama template wajib diisi"),
  description: z.string().optional().or(z.literal("")),
  isActive: z.boolean().default(true)
});

const EditPriceListTemplate = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const templateId = searchParams.get("id");
  const [cancelModal, setCancelModal] = useState(false);
  const [draftModal, setDraftModal] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [tiers, setTiers] = useState([]);

  const { data: templateData, isLoading } = useQuery(
    ["price-list-template-detail", templateId],
    () => getPriceListTemplateById({ id: templateId }),
    { enabled: !!templateId }
  );

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", description: "", isActive: true }
  });

  const template = templateData?.data || {};

  useEffect(() => {
    if (template?.id) {
      form.reset({
        name: template.name || "",
        description: template.description || "",
        isActive: template.status === "active"
      });
      if (template.tiers) {
        setTiers(template.tiers.map((t) => ({ id: Date.now() + Math.random(), ...t })));
      }
    }
  }, [template, form]);

  const updateMutation = useMutation(editPriceListTemplate, {
    onSuccess: () => {
      setSuccessModal(true);
    },
    onError: (err) => {
      toast.error(t("common.error"), {
        description:
          err?.response?.data?.message ||
          err.message ||
          t("page.priceListTemplate.toast.updateError")
      });
    }
  });

  const onSubmit = (values, saveAsDraft = false) => {
    const payload = {
      id: templateId,
      ...values,
      status: saveAsDraft ? "draft" : values.isActive ? "active" : "inactive",
      tiers: tiers.map(({ name, price }) => ({ name, price }))
    };
    delete payload.isActive;
    updateMutation.mutate(payload);
  };

  const addTier = () => {
    setTiers((prev) => [...prev, { id: Date.now(), name: "", price: 0 }]);
  };

  const updateTier = (id, field, value) => {
    setTiers((prev) => prev.map((t) => (t.id === id ? { ...t, [field]: value } : t)));
  };

  const removeTier = (id) => {
    if (tiers.length <= 1) return;
    setTiers((prev) => prev.filter((t) => t.id !== id));
  };

  if (!templateId) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">{t("page.priceListTemplate.edit.notFound")}</p>
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
          onClick={() => navigate("/price-list-template")}
          className="hover:text-foreground transition-colors">
          {t("breadcrumb.priceListTemplate")}
        </button>
        <span className="text-xs">/</span>
        <span className="text-primary font-semibold">{t("breadcrumb.editPriceListTemplate")}</span>
      </nav>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {t("page.priceListTemplate.edit.title")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("page.priceListTemplate.edit.description")}
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setCancelModal(true)} className="gap-2">
            <X size={18} /> {t("common.cancel")}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t("page.priceListTemplate.form.name")}{" "}
                        <span className="text-destructive">*</span>
                      </FormLabel>
                      <Input
                        placeholder={t("page.priceListTemplate.form.namePlaceholder")}
                        {...field}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("page.priceListTemplate.form.description")}</FormLabel>
                      <Textarea
                        placeholder={t("page.priceListTemplate.form.descriptionPlaceholder")}
                        rows={3}
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
                      <div className="flex items-center gap-3">
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                        <span className="text-sm text-muted-foreground">
                          {field.value ? t("common.active") : t("common.inactive")}
                        </span>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between pb-4 border-b border-border mb-4">
              <div>
                <h3 className="text-base font-semibold text-foreground">
                  {t("page.priceListTemplate.form.priceTier")}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t("page.priceListTemplate.form.priceTierDescription")}
                </p>
              </div>
            </div>
            <div className="space-y-3">
              {tiers.map((tier) => (
                <div key={tier.id} className="flex items-center gap-2 bg-muted/30 rounded-lg p-3">
                  <Input
                    placeholder={t("page.priceListTemplate.form.tierNamePlaceholder")}
                    value={tier.name}
                    onChange={(e) => updateTier(tier.id, "name", e.target.value)}
                    className="h-9 text-sm flex-1"
                  />
                  <Input
                    type="number"
                    placeholder={t("page.priceListTemplate.form.sortOrderPlaceholder")}
                    value={tier.sortOrder ?? ""}
                    onChange={(e) => updateTier(tier.id, "sortOrder", Number(e.target.value))}
                    className="h-9 text-sm w-20"
                  />
                  {tiers.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive shrink-0"
                      onClick={() => removeTier(tier.id)}>
                      <Trash2 size={15} />
                    </Button>
                  )}
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" className="gap-1" onClick={addTier}>
                <Plus size={15} /> {t("page.priceListTemplate.button.addTier")}
              </Button>
            </div>
          </Card>
        </div>
      </div>

      <Modal
        type="confirm"
        open={cancelModal}
        onOpenChange={setCancelModal}
        title={t("page.priceListTemplate.modal.cancelTitle")}
        description={t("page.priceListTemplate.modal.cancelDescription")}
        confirmText={t("page.priceListTemplate.modal.confirmCancel")}
        onConfirm={() => navigate("/price-list-template")}
      />
      <Modal
        type="success"
        open={successModal}
        onOpenChange={setSuccessModal}
        title={t("common.success")}
        description={t("page.priceListTemplate.modal.updateSuccess")}
        confirmText={t("page.priceListTemplate.modal.backToList")}
        onConfirm={() => navigate("/price-list-template")}
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

export default EditPriceListTemplate;
