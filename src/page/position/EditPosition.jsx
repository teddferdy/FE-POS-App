import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { toast } from "sonner";
import { editPosition, getAllPosition } from "@/services/position";
import { getAllDepartment } from "@/services/department";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Loading } from "@/components/ui/loading";
import PageHeader from "@/components/ui/PageHeader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

const EditPosition = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const positionId = searchParams.get("id");

  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [errors, setErrors] = useState({});

  const { data: allPositionsData, isLoading: positionsLoading } = useQuery(
    ["positions-all"],
    () => getAllPosition(),
    { enabled: !!positionId }
  );
  const allPositions = allPositionsData?.data || allPositionsData?.positions || [];
  const position = allPositions.find((p) => String(p.id) === positionId);

  const { data: departmentsData } = useQuery(["departments-all"], () => getAllDepartment(), {
    staleTime: 5 * 60 * 1000
  });
  const departments = departmentsData?.data || departmentsData?.departments || [];

  useEffect(() => {
    if (position) {
      setName(position.name || "");
      setDepartment(position.department || "");
      setDescription(position.description || "");

      setIsActive(position.isActive ?? true);
    }
  }, [position]);

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

  const validate = () => {
    const errs = {};
    if (!name.trim()) errs.name = t("page.position.validation.nameRequired");
    if (!department) errs.department = t("page.position.validation.departmentRequired");
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    editMutation.mutate({
      id: positionId,
      name: name.trim(),
      department,
      description: description.trim(),
      isActive
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

  if (positionsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loading />
      </div>
    );
  }

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
    <div className="space-y-8">
      <PageHeader
        breadcrumbs={[
          { label: t("breadcrumb.hrm") },
          { label: t("breadcrumb.position"), href: "/position-list" },
          { label: t("breadcrumb.edit") }
        ]}
        title={t("page.position.edit.title")}
        description={t("page.position.edit.description")}
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
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
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-base pointer-events-none">
                  domain
                </span>
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
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/position-list")}
            className="gap-2">
            <span className="material-symbols-outlined text-lg">close</span>
            {t("common.cancel")}
          </Button>
          <Button
            type="submit"
            disabled={editMutation.isLoading}
            className="gap-2 shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined text-lg">save</span>
            {t("page.position.button.saveChanges")}
          </Button>
        </div>
      </form>

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
    </div>
  );
};

export default EditPosition;
