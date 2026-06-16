import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { toast } from "sonner";
import { addPosition } from "@/services/position";
import { getAllDepartment } from "@/services/department";
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
import PageHeader from "@/components/ui/PageHeader";
import UserGuide from "@/components/organism/UserGuide";
import Modal from "@/components/organism/modal";

const AddPosition = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [errors, setErrors] = useState({});
  const [draftModal, setDraftModal] = useState(false);

  const { data: departmentsData } = useQuery(["departments-all"], () => getAllDepartment(), {
    staleTime: 5 * 60 * 1000
  });
  const departments = departmentsData?.data || departmentsData?.departments || [];

  const createMutation = useMutation(addPosition, {
    onSuccess: () => {
      toast.success(t("common.success"), { description: t("page.position.toast.added") });
      queryClient.invalidateQueries(["positions"]);
      navigate("/position-list");
    },
    onError: (err) => {
      toast.error(t("common.error"), {
        description: err?.response?.data?.message || err.message
      });
    }
  });

  const validate = () => {
    const errs = {};
    if (!name.trim()) errs.name = t("page.position.validation.nameRequired");
    if (!department) errs.department = t("page.position.validation.departmentRequired");
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e, saveAsDraft = false) => {
    e.preventDefault();
    if (!validate()) return;
    createMutation.mutate({
      name: name.trim(),
      department,
      description: description.trim(),
      status: saveAsDraft ? "draft" : isActive ? "active" : "inactive"
    });
  };

  return (
    <div className="space-y-8">
      <PageHeader
        breadcrumbs={[
          { i18nKey: "breadcrumb.hrm" },
          { i18nKey: "breadcrumb.position" },
          { i18nKey: "page.position.add.title" }
        ]}
        title={t("page.position.add.title")}
        description={t("page.position.add.description")}>
        <UserGuide guideKey="add-position" />
      </PageHeader>

      <form onSubmit={handleSubmit}>
        <div className="bg-card p-6 rounded-xl shadow-sm border border-border space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {t("page.position.form.name")} <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-base">
                  badge
                </span>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t("page.position.form.namePlaceholder")}
                  className="pl-9"
                />
              </div>
              {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {t("page.position.form.department")} <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                {departments.length === 0 ? (
                  <div className="flex flex-col items-center gap-3 p-6 border-2 border-dashed border-border rounded-lg bg-muted/20">
                    <div className="text-center flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary-fixed/20 flex items-center justify-center">
                        <span
                          className="material-symbols-outlined text-primary text-[28px]"
                          style={{ fontVariationSettings: "'FILL' 1" }}>
                          domain
                        </span>
                      </div>
                      <p className="text-sm font-medium text-foreground">
                        {t("page.position.empty.noDepartments")}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {t("page.position.empty.addDepartmentFirst")}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => navigate("/add-department")}
                      className="gap-2">
                      <span className="material-symbols-outlined text-base">add</span>
                      {t("page.position.button.addDepartment")}
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Select value={department} onValueChange={setDepartment}>
                        <SelectTrigger className="pl-9">
                          <SelectValue
                            placeholder={t("page.position.form.departmentPlaceholder")}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {departments.map((d) => (
                            <SelectItem key={d.id} value={d.name}>
                              {d.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="shrink-0 mt-0.5"
                      onClick={() => navigate("/add-department")}
                      title={t("page.position.button.addDepartmentNew")}>
                      <span className="material-symbols-outlined text-base">add</span>
                    </Button>
                  </div>
                )}
              </div>
              {errors.department && (
                <p className="text-xs text-destructive mt-1">{errors.department}</p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1.5 mb-5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {t("page.position.form.description")}
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("page.position.form.descriptionPlaceholder")}
              rows={4}
              className="resize-none"
            />
          </div>

          <div
            className={`flex items-center justify-between p-4 rounded-lg cursor-pointer transition-all ${
              isActive
                ? "bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800"
                : "bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800"
            }`}>
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  isActive ? "bg-green-600 text-white" : "bg-destructive/10 text-destructive"
                }`}>
                <span className="material-symbols-outlined text-lg">
                  {isActive ? "check" : "close"}
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {t("common.status")} {isActive ? t("common.active") : t("common.inactive")}
                </p>
                <p className="text-xs text-muted-foreground">
                  {isActive
                    ? t("page.position.form.statusActive")
                    : t("page.position.form.statusInactive")}
                </p>
              </div>
            </div>
            <Switch checked={isActive} onCheckedChange={setIsActive} />
          </div>
          <div className="mt-6 p-4 bg-surface-container-low rounded-xl flex items-start gap-3 border-l-4 border-tertiary">
            <span className="material-symbols-outlined text-tertiary shrink-0">info</span>
            <div>
              <h4 className="text-xs font-bold text-tertiary uppercase tracking-wider">
                {t("page.position.add.securityNote")}
              </h4>
              <p className="text-sm text-muted-foreground mt-0.5">
                {t("page.position.add.securityDescription")}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 bg-card border border-border rounded-xl p-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/position-list")}
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
                {t("page.position.button.saveDraft")}
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isLoading}
                className="gap-2 shadow-lg shadow-primary/20">
                <span className="material-symbols-outlined text-lg">save</span>
                {t("page.position.button.save")}
              </Button>
            </div>
          </div>
        </div>
      </form>

      <Modal
        type="confirm"
        open={draftModal}
        onOpenChange={setDraftModal}
        title={t("page.position.add.draftTitle")}
        description={t("page.position.add.draftDescription")}
        confirmText={t("page.position.add.draftConfirm")}
        onConfirm={() => {
          setDraftModal(false);
          createMutation.mutate({
            name: name.trim(),
            department,
            description: description.trim(),
            status: "draft"
          });
        }}
      />
    </div>
  );
};

export default AddPosition;
