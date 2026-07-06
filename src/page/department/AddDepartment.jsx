import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { addDepartment } from "@/services/department";
import { sanitizeInput } from "@/utils/inputSanitizer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormControl
} from "@/components/ui/form";
import PageHeader from "@/components/ui/PageHeader";
import UserGuide from "@/components/organism/UserGuide";
import Modal from "@/components/organism/modal";

const AddDepartment = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [draftModal, setDraftModal] = useState(false);
  const [saveConfirm, setSaveConfirm] = useState(false);

  const formSchema = z.object({
    name: z.string().min(1, t("page.department.validation.nameRequired")),
    description: z.string().optional().or(z.literal("")),
    isActive: z.boolean().default(true)
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", description: "", isActive: true }
  });

  const createMutation = useMutation(addDepartment, {
    onSuccess: () => {
      toast.success(t("common.success"), { description: t("page.department.toast.addSuccess") });
      queryClient.invalidateQueries(["departments"]);
      navigate("/department-list");
    },
    onError: (err) => {
      toast.error(t("common.error"), {
        description: err?.response?.data?.message || err.message
      });
    }
  });

  const onSubmit = (values, saveAsDraft = false) => {
    createMutation.mutate({
      name: sanitizeInput(values.name),
      description: sanitizeInput(values.description),
      status: saveAsDraft ? "draft" : values.isActive ? "active" : "inactive"
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[
          { i18nKey: "breadcrumb.employee" },
          { i18nKey: "breadcrumb.department" },
          { i18nKey: "page.department.add.title" }
        ]}
        title={t("page.department.add.title")}
        description={t("page.department.add.description")}>
        <UserGuide guideKey="add-department" />
      </PageHeader>

      <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(() => setSaveConfirm(true))} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {t("page.department.form.name")} <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-base">
                          domain
                        </span>
                        <Input
                          {...field}
                          placeholder={t("page.department.form.namePlaceholder")}
                          className="pl-9"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {t("page.department.form.description")}
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder={t("page.department.form.descPlaceholder")}
                      rows={4}
                      className="resize-none"
                    />
                  </FormControl>
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
                          {field.value
                            ? t("page.department.form.statusActive")
                            : t("page.department.form.statusInactive")}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {field.value
                            ? t("page.department.form.activeDesc")
                            : t("page.department.form.inactiveDesc")}
                        </p>
                      </div>
                    </div>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </div>
                </FormItem>
              )}
            />

            <div className="flex items-center justify-between gap-4 bg-card border border-border rounded-xl p-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/department-list")}
                className="gap-2">
                <span className="material-symbols-outlined text-lg">close</span>
                {t("common.cancel")}
              </Button>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDraftModal(true)}
                  disabled={createMutation.isLoading}>
                  {t("common.saveAsDraft")}
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isLoading}
                  className="gap-2 shadow-lg shadow-primary/20">
                  <span className="material-symbols-outlined text-lg">save</span>
                  {t("page.department.button.save")}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </div>

      <Modal type="confirm" open={draftModal} onOpenChange={setDraftModal}
        title={t("common.saveAsDraftTitle")} description={t("common.saveAsDraftDesc")}
        confirmText={t("common.yesSaveDraft")}
        onConfirm={() => { setDraftModal(false); onSubmit(form.getValues(), true); }}
      />
      <Modal type="confirm" open={saveConfirm} onOpenChange={setSaveConfirm}
        title={t("common.confirmSave")} description={t("common.confirmSaveDesc")}
        confirmText={t("common.yesSave")}
        onConfirm={() => { setSaveConfirm(false); onSubmit(form.getValues(), false); }}
      />
    </div>
  );
};

export default AddDepartment;
