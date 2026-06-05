import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "react-query";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { addDepartment } from "@/services/department";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import Modal from "@/components/organism/modal";

const AddDepartment = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [draftModal, setDraftModal] = useState(false);
  const [errors, setErrors] = useState({});

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

  const validate = () => {
    const errs = {};
    if (!name.trim()) errs.name = "Nama departemen wajib diisi";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e, saveAsDraft = false) => {
    e.preventDefault();
    if (!validate()) return;
    createMutation.mutate({
      name: name.trim(),
      description: description.trim(),
      status: saveAsDraft ? "draft" : isActive ? "active" : "inactive"
    });
  };

  return (
    <div className="space-y-8">
      <div className="mb-xl">
        <nav className="flex gap-2 mb-2 text-sm text-muted-foreground">
          <span>{t("breadcrumb.employee")}</span>
          <span>/</span>
          <button
            onClick={() => navigate("/department-list")}
            className="hover:text-primary transition-colors">
            {t("breadcrumb.department")}
          </button>
          <span>/</span>
          <span className="text-primary font-semibold">{t("page.department.add.title")}</span>
        </nav>
        <h2 className="text-2xl font-bold text-foreground tracking-tight">
          {t("page.department.add.title")}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">{t("page.department.add.description")}</p>
      </div>

      <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
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
              Simpan sebagai Draft
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
      <Modal
        type="confirm"
        open={draftModal}
        onOpenChange={setDraftModal}
        title="Simpan sebagai Draft?"
        description="Data yang belum lengkap bisa dilengkapi nanti"
        confirmText="Ya, Simpan Draft"
        onConfirm={() => {
          setDraftModal(false);
          createMutation.mutate({
            name: name.trim(),
            description: description.trim(),
            status: "draft"
          });
        }}
      />
    </div>
  );
};

export default AddDepartment;
