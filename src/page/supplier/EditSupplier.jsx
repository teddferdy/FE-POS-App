import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useMutation, useQuery } from "react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  X,
  Save
  // Building2,
  // Loader2
} from "lucide-react";
import { editSupplier, getSupplierById } from "@/services/supplier";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card } from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";
import Modal from "@/components/organism/modal";
import { useTranslation } from "react-i18next";

const formSchema = z.object({
  name: z.string().min(1, "Nama supplier wajib diisi"),
  contactPerson: z.string().optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  email: z.string().email("Format email tidak valid").optional().or(z.literal("")),
  address: z.string().optional().or(z.literal(""))
});

const EditSupplier = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const supplierId = searchParams.get("id");
  const [cancelModal, setCancelModal] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [draftModal, setDraftModal] = useState(false);

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
      address: ""
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
        address: supplier.address || ""
      });
    }
  }, [supplier, form]);

  const updateMutation = useMutation(editSupplier, {
    onSuccess: () => {
      setSuccessModal(true);
    },
    onError: (err) => {
      toast.error(t("common.error"), {
        description:
          err?.response?.data?.message || err.message || t("page.supplier.toast.updateError")
      });
    }
  });

  const onSubmit = (values, saveAsDraft = false) => {
    updateMutation.mutate({
      id: supplierId,
      ...values,
      status: saveAsDraft ? "draft" : "active"
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
          onClick={() => navigate("/supplier")}
          className="hover:text-foreground transition-colors">
          {t("breadcrumb.supplier")}
        </button>
        <span className="text-xs">/</span>
        <span className="text-primary font-semibold">{t("breadcrumb.editSupplier")}</span>
      </nav>

      <div>
        <h1 className="text-2xl font-bold text-foreground">{t("page.supplier.edit.title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t("page.supplier.edit.description")}
        </p>
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
            <div className="flex justify-between items-center gap-4 mt-6 bg-card border border-border rounded-xl p-4">
              <Button variant="outline" onClick={() => setCancelModal(true)} className="gap-2">
                <X size={18} />
                {t("common.cancel")}
              </Button>
              <div className="flex gap-3">
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
        description={t("page.supplier.modal.updateSuccess")}
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

export default EditSupplier;
