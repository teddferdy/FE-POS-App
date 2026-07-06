import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { editDepartment, getDepartmentById } from "@/services/department";
import { sanitizeInput } from "@/utils/inputSanitizer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Loading } from "@/components/ui/loading";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormControl
} from "@/components/ui/form";
import PageHeader from "@/components/ui/PageHeader";
import Modal from "@/components/organism/modal";
import AbortController from "@/components/organism/abort-controller";

const EditDepartment = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const departmentId = searchParams.get("id");
  const [draftModal, setDraftModal] = useState(false);
  const [saveConfirm, setSaveConfirm] = useState(false);

  const formSchema = z.object({
    name: z.string().min(1, t("page.department.validation.nameRequired")),
    description: z.string().optional().or(z.literal("")),
    isActive: z.boolean().default(true)
  });

  const {
    data: departmentData,
    isLoading: departmentsLoading,
    isError,
    refetch
  } = useQuery(["department-detail", departmentId], () => getDepartmentById({ id: departmentId }), {
    enabled: !!departmentId
  });
  const department = departmentData?.data || null;

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", description: "", isActive: true }
  });

  useEffect(() => {
    if (department) {
      form.reset({
        name: department.name || "",
        description: department.description || "",
        isActive: department.status === "active"
      });
    }
  }, [department, form]);

  const editMutation = useMutation(editDepartment, {
    onSuccess: () => {
      toast.success(t("common.success"), { description: t("page.department.toast.updateSuccess") });
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
    editMutation.mutate({
      id: departmentId,
      name: sanitizeInput(values.name),
      description: sanitizeInput(values.description),
      status: saveAsDraft ? "draft" : values.isActive ? "active" : "inactive"
    });
  };

  if (!departmentId) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground gap-3">
        <span className="material-symbols-outlined text-4xl">domain</span>
        <p>{t("page.department.detail.idNotFound")}</p>
        <Button variant="outline" onClick={() => navigate("/department-list")}>
          {t("page.department.button.back")}
        </Button>
      </div>
    );
  }

  if (departmentsLoading) return <Loading fullscreen size="lg" label={t("common.loadingData")} />;
  if (isError) return <AbortController refetch={refetch} />;

  if (!department) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground gap-3">
        <span className="material-symbols-outlined text-4xl">domain</span>
        <p>{t("page.department.detail.notFound")}</p>
        <Button variant="outline" onClick={() => navigate("/department-list")}>
          {t("page.department.button.back")}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[
          { label: t("breadcrumb.employee") },
          { label: t("breadcrumb.department"), href: "/department-list" },
          { label: t("page.department.edit.title") }
        ]}
        title={t("page.department.edit.title")}
        description={t("page.department.edit.description")}
      />

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
                    className={`flex items-center justify-between p-4 rounded-lg cursor-pointer transition-all mb-5 ${
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

            <div className="flex items-center justify-end gap-3 pt-2">
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
                  disabled={editMutation.isLoading}>
                  {t("common.saveAsDraft")}
                </Button>
                <Button
                  type="submit"
                  disabled={editMutation.isLoading}
                  className="gap-2 shadow-lg shadow-primary/20">
                  <span className="material-symbols-outlined text-lg">save</span>
                  {t("page.department.button.saveChanges")}
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

export default EditDepartment;
