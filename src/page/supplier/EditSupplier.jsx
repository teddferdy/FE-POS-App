import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { X, Save } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { editSupplier, getSupplierById } from "@/services/supplier";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card } from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";
import PageHeader from "@/components/ui/PageHeader";
import Modal from "@/components/organism/modal";
import { useTranslation } from "react-i18next";
import UserGuide from "@/components/organism/UserGuide";
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

const EditSupplier = () => {
  const { t } = useTranslation();

  const formSchema = z.object({
    name: z.string().min(1, t("page.supplier.validation.nameRequired")),
    contactPerson: z.string().optional().or(z.literal("")),
    phone: z.string().optional().or(z.literal("")),
    email: z.string().email(t("page.supplier.validation.emailInvalid")).optional().or(z.literal("")),
    address: z.string().optional().or(z.literal("")),
    isActive: z.boolean().default(true)
  });
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const supplierId = searchParams.get("id");
  const [cancelModal, setCancelModal] = useState(false);
  const [successModal, setSuccessModal] = useState(false);

  const { data: supplierData, isLoading } = useQuery(
    ["supplier-detail", supplierId],
    () => getSupplierById({ id: supplierId }),
    { enabled: !!supplierId }
  );

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

  const supplier = supplierData?.data || {};

  useEffect(() => {
    if (supplier?.id) {
      form.reset({
        name: supplier.name || "",
        contactPerson: supplier.contactPerson || "",
        phone: supplier.phone || "",
        email: supplier.email || "",
        address: supplier.address || "",
        isActive: supplier.status === "active" || supplier.status === true
      });
    }
  }, [supplier, form]);

  const updateMutation = useMutation(editSupplier, {
    onSuccess: () => {
      queryClient.invalidateQueries(["suppliers"]);
      setSuccessModal(true);
    },
    onError: (err) => {
      toast.error(t("common.error"), {
        description:
          err?.response?.data?.message || err.message || t("page.supplier.toast.updateError")
      });
    }
  });

  const onSubmit = (values) => {
    updateMutation.mutate({
      id: supplierId,
      ...values,
      status: !!values.isActive
    });
  };

  if (!supplierId) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">{t("page.supplier.edit.notFound")}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <Loading fullscreen size="lg" label={t("common.loading")} />
    );
  }

  return (
    <div className="space-y-6">
      <motion.div variants={container} initial="hidden" animate="show">
        <motion.div variants={item}>
          <PageHeader
            breadcrumbs={[
              { label: t("breadcrumb.home"), href: "/dashboard-super-admin", i18nKey: "breadcrumb.home" },
              { label: t("breadcrumb.supplier"), href: "/supplier", i18nKey: "breadcrumb.supplier" },
              { label: t("breadcrumb.editSupplier"), i18nKey: "breadcrumb.editSupplier" }
            ]}
            title={t("page.supplier.edit.title")}
            description={t("page.supplier.edit.description")}>
            <UserGuide guideKey="add-supplier" />
          </PageHeader>
        </motion.div>
      </motion.div>

      <motion.div variants={container} initial="hidden" animate="show">
        <motion.div variants={item}>
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

        <div className="bg-muted/50 p-4 rounded-xl flex items-start gap-3">
          <span className="material-symbols-outlined text-primary text-base mt-0.5">info</span>
          <div>
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wide">
              {t("page.supplier.form.tipsTitle")}
            </h4>
            <p className="text-xs text-muted-foreground mt-1">
              {t("page.supplier.form.tipsContent")}
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center gap-4 bg-card border border-border rounded-xl p-4">
        <Button variant="outline" onClick={() => setCancelModal(true)} className="gap-2">
          <X size={18} />
          {t("common.cancel")}
        </Button>
        <Button
            onClick={() => form.handleSubmit(onSubmit)()}
            disabled={updateMutation.isLoading}
            className="gap-2">
            <Save size={18} />
            {updateMutation.isLoading ? t("common.saving") : t("common.save")}
          </Button>
        </div>
      </motion.div>
    </motion.div>

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
        description={t("page.supplier.modal.updateSuccess")}
        confirmText={t("page.supplier.modal.backToList")}
        onConfirm={() => navigate("/supplier")}
      />

    </div>
  );
};

export default EditSupplier;
