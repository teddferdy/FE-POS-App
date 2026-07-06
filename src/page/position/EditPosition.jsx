import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { editPosition, getPositionById } from "@/services/position";
import { getAllDepartment } from "@/services/department";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import PageHeader from "@/components/ui/PageHeader";
import Modal from "@/components/organism/modal";
import AbortController from "@/components/organism/abort-controller";

const EditPosition = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const positionId = searchParams.get("id");
  const [draftModal, setDraftModal] = useState(false);
  const [saveConfirm, setSaveConfirm] = useState(false);

  const formSchema = z.object({
    name: z.string().min(1, t("page.position.validation.nameRequired")),
    department: z.string().min(1, t("page.position.validation.departmentRequired")),
    description: z.string().optional().or(z.literal("")),
    isActive: z.boolean().default(true)
  });

  const { data: positionData, isLoading: positionsLoading, isError, refetch } = useQuery(
    ["position", positionId], () => getPositionById({ id: positionId }), { enabled: !!positionId }
  );
  const position = positionData?.data || positionData;

  const { data: departmentsData } = useQuery(["departments-all"], () => getAllDepartment(), {
    staleTime: 5 * 60 * 1000
  });
  const departments = departmentsData?.data || departmentsData?.departments || [];

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", department: "", description: "", isActive: true }
  });

  useEffect(() => {
    if (position) {
      form.reset({
        name: position.name || "",
        department: String(position.departmentId || position.departmentData?.id || ""),
        description: position.description || "",
        isActive: position.status === "active"
      });
    }
  }, [position, form]);

  const editMutation = useMutation(editPosition, {
    onSuccess: () => {
      toast.success(t("common.success"), { description: t("page.position.toast.updated") });
      queryClient.invalidateQueries(["positions"]);
      navigate("/position-list");
    },
    onError: (err) => {
      toast.error(t("common.error"), {
        description: err?.response?.data?.message || err.message
      });
    }
  });

  const onSubmit = (values, saveAsDraft = false) => {
    editMutation.mutate({
      id: positionId,
      name: sanitizeInput(values.name),
      departmentId: values.department ? Number(values.department) : null,
      description: sanitizeInput(values.description),
      status: saveAsDraft ? "draft" : values.isActive ? "active" : "inactive"
    });
  };

  if (!positionId) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground gap-3">
        <span className="material-symbols-outlined text-4xl">badge</span>
        <p>{t("page.position.edit.idNotFound")}</p>
        <Button variant="outline" onClick={() => navigate("/position-list")}>
          {t("common.cancel")}
        </Button>
      </div>
    );
  }

  if (positionsLoading) return <Loading fullscreen size="lg" label={t("common.loading")} />;
  if (isError) return <AbortController refetch={refetch} />;

  if (!position) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground gap-3">
        <span className="material-symbols-outlined text-4xl">badge</span>
        <p>{t("page.position.edit.notFound")}</p>
        <Button variant="outline" onClick={() => navigate("/position-list")}>
          {t("common.cancel")}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[
          { label: t("breadcrumb.hrm") },
          { label: t("breadcrumb.position"), href: "/position-list" },
          { label: t("breadcrumb.edit") }
        ]}
        title={t("page.position.edit.title")}
        description={t("page.position.edit.description")}
      />

      <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(() => setSaveConfirm(true))} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <FormField control={form.control} name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {t("page.position.form.name")} <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-base">badge</span>
                        <Input {...field} placeholder={t("page.position.form.namePlaceholder")} className="pl-9" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField control={form.control} name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {t("page.position.form.department")} <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      {departments.length === 0 ? (
                        <div className="flex flex-col items-center gap-3 p-6 border-2 border-dashed border-border rounded-lg bg-muted/20">
                          <div className="text-center flex flex-col items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-primary-fixed/20 flex items-center justify-center">
                              <span className="material-symbols-outlined text-primary text-[28px]"
                                style={{ fontVariationSettings: "'FILL' 1" }}>domain</span>
                            </div>
                            <p className="text-sm font-medium text-foreground">{t("page.position.empty.noDepartments")}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{t("page.position.empty.addDepartmentFirst")}</p>
                          </div>
                          <Button type="button" variant="outline" size="sm"
                            onClick={() => navigate("/add-department")} className="gap-2">
                            <span className="material-symbols-outlined text-base">add</span>
                            {t("page.position.button.addDepartment")}
                          </Button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <div className="flex-1 relative">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-base z-10">domain</span>
                            <Select value={field.value} onValueChange={field.onChange}>
                              <SelectTrigger className="pl-9">
                                <SelectValue placeholder={t("page.position.form.departmentPlaceholder")} />
                              </SelectTrigger>
                              <SelectContent>
                                {departments.map((d) => (
                                  <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <Button type="button" variant="outline" size="icon"
                            className="shrink-0 mt-0.5"
                            onClick={() => navigate("/add-department")}
                            title={t("page.position.button.addDepartmentNew")}>
                            <span className="material-symbols-outlined text-base">add</span>
                          </Button>
                        </div>
                      )}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField control={form.control} name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {t("page.position.form.description")}
                  </FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder={t("page.position.form.descriptionPlaceholder")}
                      rows={4} className="resize-none" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField control={form.control} name="isActive"
              render={({ field }) => (
                <FormItem>
                  <div className={`flex items-center justify-between p-4 rounded-lg cursor-pointer transition-all ${
                    field.value
                      ? "bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800"
                      : "bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800"
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        field.value ? "bg-green-600 text-white" : "bg-destructive/10 text-destructive"
                      }`}>
                        <span className="material-symbols-outlined text-lg">
                          {field.value ? "check" : "close"}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {t("common.status")} {field.value ? t("common.active") : t("common.inactive")}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {field.value ? t("page.position.form.statusActive") : t("page.position.form.statusInactive")}
                        </p>
                      </div>
                    </div>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </div>
                </FormItem>
              )}
            />

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button type="button" variant="outline"
                onClick={() => navigate("/position-list")} className="gap-2">
                <span className="material-symbols-outlined text-lg">close</span>
                {t("common.cancel")}
              </Button>
              <div className="flex gap-3">
                <Button type="button" variant="outline"
                  onClick={() => setDraftModal(true)} disabled={editMutation.isLoading}>
                  {t("page.position.button.saveDraft")}
                </Button>
                <Button type="submit" disabled={editMutation.isLoading}
                  className="gap-2 shadow-lg shadow-primary/20">
                  <span className="material-symbols-outlined text-lg">save</span>
                  {t("page.position.button.saveChanges")}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </div>

      <div className="mt-6 p-4 bg-surface-container-low rounded-xl flex items-start gap-3 border-l-4 border-tertiary">
        <span className="material-symbols-outlined text-tertiary shrink-0">info</span>
        <div>
          <h4 className="text-xs font-bold text-tertiary uppercase tracking-wider">
            {t("page.position.edit.securityNote")}
          </h4>
          <p className="text-sm text-muted-foreground mt-0.5">
            {t("page.position.edit.securityDescription")}
          </p>
        </div>
      </div>

      <Modal type="confirm" open={draftModal} onOpenChange={setDraftModal}
        title={t("page.position.edit.draftTitle")}
        description={t("page.position.edit.draftDescription")}
        confirmText={t("page.position.edit.draftConfirm")}
        onConfirm={() => { setDraftModal(false); onSubmit(form.getValues(), true); }}
      />
      <Modal type="confirm" open={saveConfirm} onOpenChange={setSaveConfirm}
        title={t("common.confirmSave")} description={t("common.confirmSaveDesc")}
        confirmText={t("common.yesSave")} onConfirm={() => { setSaveConfirm(false); onSubmit(form.getValues(), false); }}
      />
    </div>
  );
};

export default EditPosition;
