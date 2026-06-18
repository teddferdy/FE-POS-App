import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Briefcase } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getPositionById, editPosition } from "@/services/position";
import { Toast } from "@/components/organism/toast";

const EditPosition = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    namePosition: "",
    descPosition: ""
  });
  const [errors, setErrors] = useState({});

  const { isLoading } = useQuery(["position", id], () => getPositionById(id), {
    enabled: !!id,
    onSuccess: (res) => {
      const pos = res?.data || res;
      setForm({
        namePosition: pos.namePosition || pos.name || "",
        descPosition: pos.descPosition || pos.description || ""
      });
    }
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const validate = () => {
    const errs = {};
    if (!form.namePosition.trim()) errs.namePosition = t("page.position.nameRequired");
    return errs;
  };

  const mutation = useMutation((data) => editPosition({ ...data, id }), {
    onSuccess: () => {
      queryClient.invalidateQueries("positions");
      Toast.fire({ icon: "success", title: t("page.position.updated") });
      navigate("/position");
    },
    onError: (err) => {
      Toast.fire({
        icon: "error",
        title: err?.response?.data?.message || t("page.position.updateError")
      });
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    mutation.mutate(form);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto p-6">
        <div className="flex items-center gap-3 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate("/position")}>
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-xl font-bold">{t("page.position.editTitle")}</h1>
            <p className="text-sm text-muted-foreground">{t("page.position.editDesc")}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-card border border-border/50 rounded-xl p-6 space-y-5">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Briefcase size={16} />
              {t("page.position.info")}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t("page.position.name")} <span className="text-destructive">*</span>
              </label>
              <Input
                name="namePosition"
                value={form.namePosition}
                onChange={handleChange}
                placeholder={t("page.position.namePlaceholder")}
                className={errors.namePosition ? "border-destructive" : ""}
              />
              {errors.namePosition && (
                <p className="text-xs text-destructive">{errors.namePosition}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">{t("page.position.description")}</label>
              <textarea
                name="descPosition"
                value={form.descPosition}
                onChange={handleChange}
                placeholder={t("page.position.descPlaceholder")}
                rows={3}
                className="w-full rounded-xl bg-accent/50 border border-border/60 px-4 py-2.5 text-sm outline-none focus:border-primary/50 transition-colors resize-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => navigate("/position")}>
              {t("common.cancel")}
            </Button>
            <Button
              type="submit"
              disabled={mutation.isLoading}
              className="relative overflow-hidden group/btn">
              <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary to-primary/90 opacity-90 group-hover/btn:opacity-100 transition-opacity" />
              <span className="relative flex items-center gap-2">
                <Save size={16} />
                {mutation.isLoading ? t("common.saving") : t("common.save")}
              </span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPosition;
