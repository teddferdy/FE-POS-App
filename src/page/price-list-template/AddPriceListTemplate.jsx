import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { X, Save, Plus, Trash2 } from "lucide-react";
import { addPriceListTemplate } from "@/services/price-list-template";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import Modal from "@/components/organism/modal";
import { useTranslation } from "react-i18next";

const formSchema = z.object({
  name: z.string().min(1, "Nama template wajib diisi"),
  description: z.string().optional().or(z.literal("")),
  isActive: z.boolean().default(true)
});

const AddPriceListTemplate = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [cancelModal, setCancelModal] = useState(false);
  const [draftModal, setDraftModal] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [tiers, setTiers] = useState([{ id: Date.now(), name: "", price: 0 }]);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", description: "", isActive: true }
  });

  const createMutation = useMutation(addPriceListTemplate, {
    onSuccess: () => {
      setSuccessModal(true);
    },
    onError: (err) => {
      toast.error(t("common.error"), {
        description:
          err?.response?.data?.message || err.message || t("page.priceListTemplate.toast.addError")
      });
    }
  });

  const onSubmit = (values, saveAsDraft = false) => {
    const payload = {
      ...values,
      status: saveAsDraft ? "draft" : values.isActive ? "active" : "inactive",
      tiers: tiers.map(({ name, price }) => ({ name, price }))
    };
    delete payload.isActive;
    createMutation.mutate(payload);
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
        <span className="text-primary font-semibold">{t("breadcrumb.addPriceListTemplate")}</span>
      </nav>

      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {t("page.priceListTemplate.add.title")}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t("page.priceListTemplate.add.description")}
        </p>
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
                                ? "Template ini aktif dan dapat digunakan."
                                : "Template ini tidak aktif."}
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
                    <X size={18} /> {t("common.cancel")}
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
                <Plus size={15} />
                {t("page.priceListTemplate.button.addTier")}
              </Button>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="p-6">
            <h3 className="text-sm font-semibold text-foreground mb-3">
              {t("page.priceListTemplate.form.preview")}
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              {t("page.priceListTemplate.form.previewDescription")}
            </p>
            <div className="space-y-2">
              {tiers.filter((t) => t.name).length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  {t("page.priceListTemplate.form.noTiers")}
                </p>
              ) : (
                tiers
                  .filter((t) => t.name)
                  .map((tier, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-2 bg-muted/30 rounded text-xs">
                      <span className="font-medium text-foreground">{tier.name}</span>
                      <span className="text-muted-foreground">Rp ...</span>
                    </div>
                  ))
              )}
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
        description={t("page.priceListTemplate.modal.addSuccess")}
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

export default AddPriceListTemplate;
