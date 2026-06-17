import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { X, Save } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import UserGuide from "@/components/organism/UserGuide";
import { addTypePayment } from "@/services/type-payment";
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
  name: z.string().min(1, "Nama pembayaran wajib diisi"),
  type: z.string().min(1, "Tipe pembayaran wajib dipilih"),
  deskripsi: z.string().optional().or(z.literal("")),
  status: z.boolean().default(true)
});

const AddTypePayment = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [cancelModal, setCancelModal] = useState(false);
  const [successModal, setSuccessModal] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      type: "",
      deskripsi: "",
      status: true
    }
  });

  const createMutation = useMutation(addTypePayment, {
    onSuccess: () => {
      queryClient.invalidateQueries(["type-payments"]);
      queryClient.invalidateQueries(["type-payments-all"]);
      setSuccessModal(true);
    },
    onError: (err) => {
      toast.error(t("common.error"), {
        description:
          err?.response?.data?.message || err.message || t("page.typePayment.toast.addFailed")
      });
    }
  });

  const onSubmit = (values) => {
    const { status, ...rest } = values;
    createMutation.mutate({
      ...rest,
      status
    });
  };

  return (
    <div className="space-y-6">
      <motion.div variants={container} initial="hidden" animate="show">
        <motion.div variants={item}>
          <PageHeader
            breadcrumbs={[
              { i18nKey: "breadcrumb.home", href: "/dashboard-super-admin" },
              { i18nKey: "breadcrumb.payment", href: "/type-payment-list" },
              { i18nKey: "page.typePayment.add.title" }
            ]}
            title={t("page.typePayment.add.title")}
            description={t("page.typePayment.add.description")}>
            <UserGuide guideKey="add-type-payment" />
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
                          {t("page.typePayment.form.name")}{" "}
                          <span className="text-destructive">*</span>
                        </FormLabel>
                        <Input
                          placeholder={t("page.typePayment.form.namePlaceholder")}
                          {...field}
                        />
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
                <div className="flex justify-between items-center gap-4 mt-6 bg-card border border-border rounded-xl p-4">
                  <Button variant="outline" onClick={() => setCancelModal(true)} className="gap-2">
                    <X size={18} />
                    {t("common.cancel")}
                  </Button>
                  <Button
                    onClick={() => form.handleSubmit(onSubmit)()}
                    disabled={createMutation.isLoading}
                    className="gap-2">
                    <Save size={18} />
                    {createMutation.isLoading ? t("common.saving") : t("common.save")}
                  </Button>
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
        onConfirm={() => navigate("/type-payment-list")}
      />
      <Modal
        type="success"
        open={successModal}
        onOpenChange={setSuccessModal}
        title={t("common.success")}
        description={t("page.typePayment.toast.addSuccess")}
        confirmText={t("modal.backToList")}
        onConfirm={() => navigate("/type-payment-list")}
      />
    </div>
  );
};

export default AddTypePayment;
