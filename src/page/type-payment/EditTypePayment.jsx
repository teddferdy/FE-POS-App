import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useMutation, useQuery } from "react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { X, Save } from "lucide-react";
import { getTypePaymentById, editTypePayment } from "@/services/type-payment";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { motion } from "framer-motion";
import AbortController from "@/components/organism/abort-controller";

const formSchema = z.object({
  name: z.string().min(1, "Nama pembayaran wajib diisi"),
  type: z.string().min(1, "Tipe pembayaran wajib dipilih"),
  deskripsi: z.string().optional().or(z.literal("")),
  status: z.boolean().default(true)
});

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

// const item = {
//   hidden: { opacity: 0, y: 20 },
//   show: { opacity: 1, y: 0 }
// };

const EditTypePayment = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const paymentId = searchParams.get("id");
  const [cancelModal, setCancelModal] = useState(false);
  const [successModal, setSuccessModal] = useState(false);

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
      deskripsi: "",
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
        type: item.type || item.tipe || "",
        deskripsi: item.deskripsi || "",
        status: statusValue
      });
    }
  }, [item, form]);

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

  const onSubmit = (values) => {
    const { status, ...rest } = values;
    updateMutation.mutate({
      id: paymentId,
      ...rest,
      status
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
    return <Loading fullscreen size="lg" label="Memuat data..." />;
  }

  if (isError) {
    return <AbortController refetch={refetch} />;
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
            onClick={() => navigate("/type-payment-list")}
            className="hover:text-foreground transition-colors">
            {t("breadcrumb.payment")}
          </button>
          <span className="text-xs">/</span>
          <span className="text-primary font-semibold">{t("page.typePayment.edit.title")}</span>
        </nav>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {t("page.typePayment.edit.title")}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {t("page.typePayment.edit.description")}
            </p>
          </div>
          <div className="flex gap-3">
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
                          <SelectItem value="Tunai">Tunai</SelectItem>
                          <SelectItem value="Non-Tunai">Non-Tunai</SelectItem>
                          <SelectItem value="Transfer">Transfer</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="deskripsi"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("page.typePayment.form.description")}</FormLabel>
                    <Textarea
                      placeholder={t("page.typePayment.form.descriptionPlaceholder")}
                      rows={3}
                      {...field}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <div
                      className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
                        field.value
                          ? "bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800"
                          : "bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800"
                      }`}>
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
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </div>
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
      </div>
    </motion.div>
  );
};

export default EditTypePayment;
