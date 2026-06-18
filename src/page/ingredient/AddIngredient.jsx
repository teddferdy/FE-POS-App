import React, { useState } from "react";
import { useMutation, useQueryClient } from "react-query";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, ClipboardList } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addIngredient } from "@/services/ingredient";
import { Toast } from "@/components/organism/toast";

const AddIngredient = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    nameIngredient: "",
    type: "",
    desc: ""
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const validate = () => {
    const errs = {};
    if (!form.nameIngredient.trim()) errs.nameIngredient = t("page.ingredient.nameRequired");
    return errs;
  };

  const mutation = useMutation((data) => addIngredient(data), {
    onSuccess: () => {
      queryClient.invalidateQueries("ingredients");
      Toast.fire({ icon: "success", title: t("page.ingredient.created") });
      navigate("/ingredient");
    },
    onError: (err) => {
      Toast.fire({
        icon: "error",
        title: err?.response?.data?.message || t("page.ingredient.createError")
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

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto p-6">
        <div className="flex items-center gap-3 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate("/ingredient")}>
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-xl font-bold">{t("page.ingredient.addTitle")}</h1>
            <p className="text-sm text-muted-foreground">{t("page.ingredient.addDesc")}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-card border border-border/50 rounded-xl p-6 space-y-5">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <ClipboardList size={16} />
              {t("page.ingredient.info")}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t("page.ingredient.name")} <span className="text-destructive">*</span>
              </label>
              <Input
                name="nameIngredient"
                value={form.nameIngredient}
                onChange={handleChange}
                placeholder={t("page.ingredient.namePlaceholder")}
                className={errors.nameIngredient ? "border-destructive" : ""}
              />
              {errors.nameIngredient && (
                <p className="text-xs text-destructive">{errors.nameIngredient}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">{t("page.ingredient.type")}</label>
              <Input
                name="type"
                value={form.type}
                onChange={handleChange}
                placeholder={t("page.ingredient.typePlaceholder")}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">{t("page.ingredient.description")}</label>
              <textarea
                name="desc"
                value={form.desc}
                onChange={handleChange}
                placeholder={t("page.ingredient.descPlaceholder")}
                rows={3}
                className="w-full rounded-xl bg-accent/50 border border-border/60 px-4 py-2.5 text-sm outline-none focus:border-primary/50 transition-colors resize-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => navigate("/ingredient")}>
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

export default AddIngredient;
