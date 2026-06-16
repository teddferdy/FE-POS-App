import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { X, Save } from "lucide-react";
import { addExpenseCategory } from "@/services/expense";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card } from "@/components/ui/card";
import Modal from "@/components/organism/modal";
import { useTranslation } from "react-i18next";

const AddExpenseCategory = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [cancelModal, setCancelModal] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [draftModal, setDraftModal] = useState(false);

  const formSchema = z.object({
    name: z.string().min(1, t("page.expenseCategory.add.validation.nameRequired")),
    description: z.string().optional().or(z.literal(""))
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: ""
    }
  });

  const createMutation = useMutation(addExpenseCategory, {
    onSuccess: () => {
      queryClient.invalidateQueries(["expense-categories"]);
      setSuccessModal(true);
    },
    onError: (err) => {
      toast.error(t("page.expenseCategory.add.toast.error"), {
        description:
          err?.response?.data?.message ||
          err.message ||
          t("page.expenseCategory.add.toast.errorDescription")
      });
    }
  });

  const onSubmit = (values, saveAsDraft = false) => {
    createMutation.mutate({
      ...values,
      status: saveAsDraft ? "draft" : "active"
    });
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
          onClick={() => navigate("/expense-category")}
          className="hover:text-foreground transition-colors">
          {t("page.expenseCategory.list.title")}
        </button>
        <span className="text-xs">/</span>
        <span className="text-primary font-semibold">{t("breadcrumb.add")}</span>
      </nav>

      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {t("page.expenseCategory.add.title")}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t("page.expenseCategory.add.description")}
        </p>
      </div>

      <Card className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("page.expenseCategory.add.name")}{" "}
                      <span className="text-destructive">*</span>
                    </FormLabel>
                    <Input placeholder={t("page.expenseCategory.add.namePlaceholder")} {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("page.expenseCategory.add.description")}</FormLabel>
                    <Textarea
                      placeholder={t("page.expenseCategory.add.descriptionPlaceholder")}
                      rows={3}
                      {...field}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex justify-between items-center gap-4 mt-6 bg-card border border-border rounded-xl p-4">
              <Button variant="outline" onClick={() => setCancelModal(true)} className="gap-2">
                <X size={18} />
                {t("common.cancel")}
              </Button>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setDraftModal(true)}
                  disabled={createMutation.isLoading}>
                  {t("page.expenseCategory.add.saveAsDraft")}
                </Button>
                <Button
                  onClick={() => form.handleSubmit((v) => onSubmit(v, false))()}
                  disabled={createMutation.isLoading}
                  className="gap-2">
                  <Save size={18} />
                  {createMutation.isLoading ? t("button.saving") : t("button.save")}
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
        title={t("page.expenseCategory.add.cancelTitle")}
        description={t("page.expenseCategory.add.cancelDescription")}
        confirmText={t("page.expenseCategory.add.cancelConfirm")}
        onConfirm={() => navigate("/expense-category")}
      />
      <Modal
        type="success"
        open={successModal}
        onOpenChange={setSuccessModal}
        title={t("page.expenseCategory.add.successTitle")}
        description={t("page.expenseCategory.add.successDescription")}
        confirmText={t("page.expenseCategory.add.successConfirm")}
        onConfirm={() => navigate("/expense-category")}
      />
      <Modal
        type="confirm"
        open={draftModal}
        onOpenChange={setDraftModal}
        title={t("page.expenseCategory.add.draftTitle")}
        description={t("page.expenseCategory.add.draftDescription")}
        confirmText={t("page.expenseCategory.add.draftConfirm")}
        onConfirm={() => {
          setDraftModal(false);
          const values = form.getValues();
          onSubmit(values, true);
        }}
      />
    </div>
  );
};

export default AddExpenseCategory;
