import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { X, Save } from "lucide-react";
import { getExpenseCategories, editExpenseCategory } from "@/services/expense";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card } from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";
import Modal from "@/components/organism/modal";
import AbortController from "@/components/organism/abort-controller";

const formSchema = z.object({
  name: z.string().min(1, "Nama kategori wajib diisi"),
  description: z.string().optional().or(z.literal(""))
});

const EditExpenseCategory = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  const [cancelModal, setCancelModal] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [draftModal, setDraftModal] = useState(false);

  const { data, isLoading, isError, refetch } = useQuery(
    ["expense-categories"],
    () => getExpenseCategories(),
    {
      enabled: !!id
    }
  );

  const categoryItem = useMemo(() => {
    if (!data) return {};
    const list = data?.data || data || [];
    return list.find((item) => item.id === id || item._id === id) || {};
  }, [data, id]);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: ""
    }
  });

  useEffect(() => {
    if (categoryItem?.id) {
      form.reset({
        name: categoryItem.name || "",
        description: categoryItem.description || ""
      });
    }
  }, [categoryItem, form]);

  const updateMutation = useMutation(editExpenseCategory, {
    onSuccess: () => {
      queryClient.invalidateQueries(["expense-categories"]);
      setSuccessModal(true);
    },
    onError: (err) => {
      toast.error(t("page.expenseCategory.edit.fail"), {
        description:
          err?.response?.data?.message || err.message || t("page.expenseCategory.edit.failDesc")
      });
    }
  });

  const onSubmit = (values, saveAsDraft = false) => {
    updateMutation.mutate({
      id,
      ...values,
      status: saveAsDraft ? "draft" : "active"
    });
  };

  if (!id) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">{t("page.expenseCategory.edit.idNotFound")}</p>
      </div>
    );
  }

  if (isError) return <AbortController refetch={refetch} />;

  if (isLoading) {
    return <Loading fullscreen size="lg" label={t("page.expenseCategory.edit.loading")} />;
  }

  if (!categoryItem?.id) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">{t("page.expenseCategory.edit.categoryNotFound")}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="space-y-6">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <button
            onClick={() => navigate("/dashboard-super-admin")}
            className="hover:text-foreground transition-colors">
            {t("page.expenseCategory.edit.breadcrumbDashboard")}
          </button>
          <span className="text-xs">/</span>
          <button
            onClick={() => navigate("/expense-category")}
            className="hover:text-foreground transition-colors">
            {t("page.expenseCategory.edit.breadcrumbList")}
          </button>
          <span className="text-xs">/</span>
          <span className="text-primary font-semibold">
            {t("page.expenseCategory.edit.breadcrumb")}
          </span>
        </nav>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {t("page.expenseCategory.edit.title")}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {t("page.expenseCategory.edit.desc")}
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setCancelModal(true)} className="gap-2">
              <X size={18} />
              {t("page.expenseCategory.edit.cancel")}
            </Button>
            <Button
              variant="outline"
              onClick={() => setDraftModal(true)}
              disabled={updateMutation.isLoading}>
              {t("page.expenseCategory.edit.saveDraft")}
            </Button>
            <Button
              onClick={() => form.handleSubmit((v) => onSubmit(v, false))()}
              disabled={updateMutation.isLoading}
              className="gap-2">
              <Save size={18} />
              {updateMutation.isLoading
                ? t("page.expenseCategory.edit.saving")
                : t("page.expenseCategory.edit.save")}
            </Button>
          </div>
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
                        {t("page.expenseCategory.edit.nameLabel")}{" "}
                        <span className="text-destructive">*</span>
                      </FormLabel>
                      <Input
                        placeholder={t("page.expenseCategory.edit.namePlaceholder")}
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
                      <FormLabel>{t("page.expenseCategory.edit.descriptionLabel")}</FormLabel>
                      <Textarea
                        placeholder={t("page.expenseCategory.edit.descriptionPlaceholder")}
                        rows={3}
                        {...field}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </form>
          </Form>
        </Card>

        <Modal
          type="confirm"
          open={cancelModal}
          onOpenChange={setCancelModal}
          title={t("page.expenseCategory.edit.modalCancelTitle")}
          description={t("page.expenseCategory.edit.modalCancelDesc")}
          confirmText={t("page.expenseCategory.edit.modalCancelConfirm")}
          onConfirm={() => navigate("/expense-category")}
        />
        <Modal
          type="success"
          open={successModal}
          onOpenChange={setSuccessModal}
          title={t("page.expenseCategory.edit.modalSuccessTitle")}
          description={t("page.expenseCategory.edit.modalSuccessDesc")}
          confirmText={t("page.expenseCategory.edit.modalSuccessConfirm")}
          onConfirm={() => navigate("/expense-category")}
        />
        <Modal
          type="confirm"
          open={draftModal}
          onOpenChange={setDraftModal}
          title={t("page.expenseCategory.edit.modalDraftTitle")}
          description={t("page.expenseCategory.edit.modalDraftDesc")}
          confirmText={t("page.expenseCategory.edit.modalDraftConfirm")}
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

export default EditExpenseCategory;
