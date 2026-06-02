import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { editDepartment, getAllDepartment } from "@/services/department";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Loading } from "@/components/ui/loading";
import PageHeader from "@/components/ui/PageHeader";

const EditDepartment = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const departmentId = searchParams.get("id");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [errors, setErrors] = useState({});

  const { data: allDepartmentsData, isLoading: departmentsLoading } = useQuery(
    ["departments-all"],
    () => getAllDepartment(),
    { enabled: !!departmentId }
  );
  const allDepartments = allDepartmentsData?.data || allDepartmentsData?.departments || [];
  const department = allDepartments.find((d) => String(d.id) === departmentId);

  useEffect(() => {
    if (department) {
      setName(department.name || "");
      setDescription(department.description || "");
      setIsActive(department.isActive ?? true);
    }
  }, [department]);

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

  const validate = () => {
    const errs = {};
    if (!name.trim()) errs.name = "Nama departemen wajib diisi";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    editMutation.mutate({
      id: departmentId,
      name: name.trim(),
      description: description.trim(),
      isActive
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

  if (departmentsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loading />
      </div>
    );
  }

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
    <div className="space-y-8">
      <PageHeader
        breadcrumbs={[
          { label: t("breadcrumb.employee") },
          { label: t("breadcrumb.department"), href: "/department-list" },
          { label: t("page.department.edit.title") }
        ]}
        title={t("page.department.edit.title")}
        description={t("page.department.edit.description")}
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {t("page.department.form.name")} <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-base">
                  domain
                </span>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t("page.department.form.namePlaceholder")}
                  className="pl-9"
                />
              </div>
              {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
            </div>
          </div>

          <div className="flex flex-col gap-1.5 mb-5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {t("page.department.form.description")}
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("page.department.form.descPlaceholder")}
              rows={4}
              className="resize-none"
            />
          </div>

          <div
            className={`flex items-center justify-between p-4 rounded-lg cursor-pointer transition-all mb-5 ${
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
                  {isActive
                    ? t("page.department.form.statusActive")
                    : t("page.department.form.statusInactive")}
                </p>
                <p className="text-xs text-muted-foreground">
                  {isActive
                    ? t("page.department.form.activeDesc")
                    : t("page.department.form.inactiveDesc")}
                </p>
              </div>
            </div>
            <Switch checked={isActive} onCheckedChange={setIsActive} />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/department-list")}
            className="gap-2">
            <span className="material-symbols-outlined text-lg">close</span>
            {t("common.cancel")}
          </Button>
          <Button
            type="submit"
            disabled={editMutation.isLoading}
            className="gap-2 shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined text-lg">save</span>
            {t("page.department.button.saveChanges")}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditDepartment;
