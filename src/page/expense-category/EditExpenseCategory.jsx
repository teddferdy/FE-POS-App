import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { X, Save, CheckCircle2, XCircle } from "lucide-react";
import { getExpenseCategories, editExpenseCategory } from "@/services/expense";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card } from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";
import Modal from "@/components/organism/modal";
import AbortController from "@/components/organism/abort-controller";
import { useConfirmSubmit } from "@/hooks/useConfirmSubmit";

const formSchema = z.object({
  name: z.string().min(1, "Nama kategori wajib diisi"),
  description: z.string().optional().or(z.literal("")),
  isActive: z.boolean()
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
    return list.find((item) => String(item.id) === id || String(item._id) === id) || {};
  }, [data, id]);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      isActive: true
    }
  });

  const { handleSubmit, confirmModal } = useConfirmSubmit(form, onSubmit);

  useEffect(() => {
    if (categoryItem?.id) {
      form.reset({
        name: categoryItem.name || "",
        description: categoryItem.description || "",
        isActive: categoryItem.status === "active"
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
      name: values.name,
      description: values.description,
      status: saveAsDraft ? "draft" : values.isActive ? "active" : "inactive"
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
            {t("breadcrumb.home")}
          </button>
          <span className="text-xs">/</span>
          <button
            onClick={() => navigate("/expense-category")}
            className="hover:text-foreground transition-colors">
            {t("page.expenseCategory.list.title")}
          </button>
          <span className="text-xs">/</span>
          <span className="text-primary font-semibold">{t("breadcrumb.edit")}</span>
        </nav>

        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {t("page.expenseCategory.edit.title")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("page.expenseCategory.edit.description")}
          </p>
        </div>

        <Card className="p-6">
          <Form {...form}>
            <form onSubmit={handleSubmit} className="space-y-6">
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
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem>
                    <div
                      className={`flex items-center justify-between p-4 rounded-lg cursor-pointer transition-all ${field.value ? "bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800" : "bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800"}`}>
                      <div className="flex items-center gap-3">
                        {field.value ? (
                          <CheckCircle2 size={20} className="text-green-600" />
                        ) : (
                          <XCircle size={20} className="text-red-600" />
                        )}
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            {field.value ? t("common.active") : t("common.inactive")}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {field.value
                              ? "Kategori aktif dan dapat digunakan"
                              : "Kategori tidak aktif"}
                          </p>
                        </div>
                      </div>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </div>
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
                    disabled={updateMutation.isLoading}>
                    {t("page.expenseCategory.add.saveAsDraft")}
                  </Button>
                  <Button
                    type="submit"
                    disabled={updateMutation.isLoading}
                    className="gap-2">
                    <Save size={18} />
                    {updateMutation.isLoading ? t("button.saving") : t("button.save")}
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
        <Modal type="confirm" {...confirmModal()} />
      </div>
    </div>
  );
};

export default EditExpenseCategory;
