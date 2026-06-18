import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Percent } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getDiscountById, editDiscount } from "@/services/discount";
import { Toast } from "@/components/organism/toast";

const EditDiscount = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    nameDiscount: "",
    type: "percentage",
    value: "",
    startDate: "",
    endDate: "",
    desc: ""
  });
  const [errors, setErrors] = useState({});

  const { isLoading } = useQuery(["discount", id], () => getDiscountById(id), {
    enabled: !!id,
    onSuccess: (res) => {
      const d = res?.data || res;
      setForm({
        nameDiscount: d.nameDiscount || d.name || "",
        type: d.type || "percentage",
        value: d.value?.toString() || "",
        startDate: d.startDate ? new Date(d.startDate).toISOString().split("T")[0] : "",
        endDate: d.endDate ? new Date(d.endDate).toISOString().split("T")[0] : "",
        desc: d.desc || d.description || ""
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
    if (!form.nameDiscount.trim()) errs.nameDiscount = t("page.discount.nameRequired");
    if (!form.value || Number(form.value) <= 0) errs.value = t("page.discount.valueRequired");
    if (!form.startDate) errs.startDate = t("page.discount.startDateRequired");
    if (!form.endDate) errs.endDate = t("page.discount.endDateRequired");
    if (form.startDate && form.endDate && new Date(form.startDate) >= new Date(form.endDate)) {
      errs.endDate = t("page.discount.endDateAfterStart");
    }
    if (form.type === "percentage" && (Number(form.value) > 100 || Number(form.value) < 0)) {
      errs.value = t("page.discount.percentageRange");
    }
    return errs;
  };

  const mutation = useMutation((data) => editDiscount({ ...data, id }), {
    onSuccess: () => {
      queryClient.invalidateQueries("discounts");
      Toast.fire({ icon: "success", title: t("page.discount.updated") });
      navigate("/discount");
    },
    onError: (err) => {
      Toast.fire({
        icon: "error",
        title: err?.response?.data?.message || t("page.discount.updateError")
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
    const payload = {
      nameDiscount: form.nameDiscount,
      type: form.type,
      value: Number(form.value),
      startDate: form.startDate,
      endDate: form.endDate,
      desc: form.desc
    };
    mutation.mutate(payload);
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
          <Button variant="ghost" size="icon" onClick={() => navigate("/discount")}>
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-xl font-bold">{t("page.discount.editTitle")}</h1>
            <p className="text-sm text-muted-foreground">{t("page.discount.editDesc")}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-card border border-border/50 rounded-xl p-6 space-y-5">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Percent size={16} />
              {t("page.discount.info")}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t("page.discount.name")} <span className="text-destructive">*</span>
              </label>
              <Input
                name="nameDiscount"
                value={form.nameDiscount}
                onChange={handleChange}
                placeholder={t("page.discount.namePlaceholder")}
                className={errors.nameDiscount ? "border-destructive" : ""}
              />
              {errors.nameDiscount && (
                <p className="text-xs text-destructive">{errors.nameDiscount}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">{t("page.discount.type")}</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, type: "percentage" }))}
                  className={`flex-1 p-3 rounded-xl border text-sm font-medium transition-all ${
                    form.type === "percentage"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border/50 bg-card hover:border-border text-muted-foreground"
                  }`}>
                  {t("page.discount.percentage")}
                </button>
                <button
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, type: "nominal" }))}
                  className={`flex-1 p-3 rounded-xl border text-sm font-medium transition-all ${
                    form.type === "nominal"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border/50 bg-card hover:border-border text-muted-foreground"
                  }`}>
                  {t("page.discount.nominal")}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                {form.type === "percentage"
                  ? t("page.discount.percentageValue")
                  : t("page.discount.nominalValue")}{" "}
                <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                {form.type === "nominal" && (
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                    Rp
                  </span>
                )}
                <Input
                  name="value"
                  type="number"
                  value={form.value}
                  onChange={handleChange}
                  placeholder={
                    form.type === "percentage"
                      ? t("page.discount.percentagePlaceholder")
                      : t("page.discount.nominalPlaceholder")
                  }
                  className={`${form.type === "nominal" ? "pl-10" : ""} ${
                    errors.value ? "border-destructive" : ""
                  }`}
                />
                {form.type === "percentage" && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                    %
                  </span>
                )}
              </div>
              {errors.value && <p className="text-xs text-destructive">{errors.value}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {t("page.discount.startDate")} <span className="text-destructive">*</span>
                </label>
                <Input
                  name="startDate"
                  type="date"
                  value={form.startDate}
                  onChange={handleChange}
                  className={errors.startDate ? "border-destructive" : ""}
                />
                {errors.startDate && <p className="text-xs text-destructive">{errors.startDate}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {t("page.discount.endDate")} <span className="text-destructive">*</span>
                </label>
                <Input
                  name="endDate"
                  type="date"
                  value={form.endDate}
                  onChange={handleChange}
                  className={errors.endDate ? "border-destructive" : ""}
                />
                {errors.endDate && <p className="text-xs text-destructive">{errors.endDate}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">{t("page.discount.description")}</label>
              <textarea
                name="desc"
                value={form.desc}
                onChange={handleChange}
                placeholder={t("page.discount.descPlaceholder")}
                rows={3}
                className="w-full rounded-xl bg-accent/50 border border-border/60 px-4 py-2.5 text-sm outline-none focus:border-primary/50 transition-colors resize-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => navigate("/discount")}>
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

export default EditDiscount;
