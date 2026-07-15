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
import { getTypePaymentById, editTypePayment } from "@/services/type-payment";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card } from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";
import Modal from "@/components/organism/modal";
import { useConfirmSubmit } from "@/hooks/useConfirmSubmit";
import AbortController from "@/components/organism/abort-controller";

const EditTypePayment = () => {
  const { t } = useTranslation();
  const formSchema = z.object({
    name: z.string().min(1, t("page.typePayment.validation.nameRequired")),
    type: z.string().min(1, t("page.typePayment.validation.typeRequired")),
    status: z.boolean().default(true)
  });
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const paymentId = searchParams.get("id");
  const [cancelModal, setCancelModal] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [draftModal, setDraftModal] = useState(false);

  const {
    data: detailData,
    isLoading,
    isError,
    refetch
  } = useQuery(["type-payment-detail", paymentId], () => getTypePaymentById(paymentId), {
    enabled: !!paymentId
  });

  const item = detailData?.data || {};

  useEffect(() => {
    if (item?.isSystem) {
      navigate("/type-payment-list");
    }
  }, [item, navigate]);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      type: "",
      status: true
    }
  });

  useEffect(() => {
    if (item?.id) {
      const statusValue =
        item.status === "Aktif" ||
        item.status === true ||
        item.status === "active" ||
        item.isActive === true
          ? true
          : false;
      form.reset({
        name: item.name || "",
        type: item.type || "",
        status: statusValue
      });
    }
  }, [item, form]);

  const { handleSubmit: onConfirmSubmit, confirmModal } = useConfirmSubmit(form, (values) =>
    onSubmit(values)
  );

  const updateMutation = useMutation(editTypePayment, {
    onSuccess: () => {
      setSuccessModal(true);
    },
    onError: (err) => {
      toast.error(t("common.error"), {
        description:
          err?.response?.data?.message || err.message || t("page.typePayment.toast.updateFailed")
      });
    }
  });

  const onSubmit = (values, saveAsDraft = false) => {
    const { status, ...rest } = values;
    updateMutation.mutate({
      id: paymentId,
      ...rest,
      status: saveAsDraft ? "draft" : status
    });
  };

  if (!paymentId) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">{t("page.typePayment.edit.notFound")}</p>
      </div>
    );
  }

  if (isLoading) {
    return <Loading fullscreen size="lg" label={t("common.loadingData")} />;
  }

  if (isError) {
    return <AbortController refetch={refetch} />;
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
              label: t("breadcrumb.payment"),
              href: "/type-payment-list",
              i18nKey: "breadcrumb.payment"
            },
            { label: t("page.typePayment.edit.title"), i18nKey: "page.typePayment.edit.title" }
          ]}
          title={t("page.typePayment.edit.title")}
          description={t("page.typePayment.edit.description")}
          backLink="/type-payment-list">
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
                        {t("page.typePayment.form.name")}{" "}
                        <span className="text-destructive">*</span>
                      </FormLabel>
                      <Input placeholder={t("page.typePayment.form.namePlaceholder")} {...field} />
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
                        {t("page.typePayment.form.type")}{" "}
                        <span className="text-destructive">*</span>
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder={t("page.typePayment.form.typePlaceholder")} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cash">Tunai</SelectItem>
                          <SelectItem value="debit">Non-Tunai</SelectItem>
                          <SelectItem value="credit">Kartu Kredit</SelectItem>
                          <SelectItem value="e-wallet">E-Wallet</SelectItem>
                          <SelectItem value="other">Lainnya</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <div className="pt-2 flex items-center justify-between bg-muted/30 p-4 rounded-lg">
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
                            {t("common.status")}{" "}
                            {field.value ? t("common.active") : t("common.inactive")}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {field.value
                              ? t("page.typePayment.form.statusActive")
                              : t("page.typePayment.form.statusInactive")}
                          </p>
                        </div>
                      </div>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </div>
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
          onConfirm={() => navigate("/type-payment-list")}
        />
        <Modal
          type="success"
          open={successModal}
          onOpenChange={setSuccessModal}
          title={t("common.success")}
          description={t("page.typePayment.toast.updateSuccess")}
          confirmText={t("modal.backToList")}
          onConfirm={() => navigate("/type-payment-list")}
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

export default EditTypePayment;
