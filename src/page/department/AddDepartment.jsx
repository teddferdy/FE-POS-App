import React, { useState, useRef } from "react";
import { useMutation, useQueryClient } from "react-query";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Building2, Image, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addDepartment } from "@/services/department";
import { Toast } from "@/components/organism/toast";

const AddDepartment = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  const [form, setForm] = useState({
    nameDepartment: "",
    nameDepartmentEnglish: "",
    descDepartment: "",
    descDepartmentEnglish: ""
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreview(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const validate = () => {
    const errs = {};
    if (!form.nameDepartment.trim()) errs.nameDepartment = t("page.department.nameRequired");
    return errs;
  };

  const mutation = useMutation((data) => addDepartment(data), {
    onSuccess: () => {
      queryClient.invalidateQueries("departments");
      Toast.fire({ icon: "success", title: t("page.department.created") });
      navigate("/department");
    },
    onError: (err) => {
      Toast.fire({
        icon: "error",
        title: err?.response?.data?.message || t("page.department.createError")
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
    const formData = new FormData();
    formData.append("nameDepartment", form.nameDepartment);
    formData.append("nameDepartmentEnglish", form.nameDepartmentEnglish);
    formData.append("descDepartment", form.descDepartment);
    formData.append("descDepartmentEnglish", form.descDepartmentEnglish);
    if (image) formData.append("imageDepartment", image);
    mutation.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto p-6">
        <div className="flex items-center gap-3 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate("/department")}>
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-xl font-bold">{t("page.department.addTitle")}</h1>
            <p className="text-sm text-muted-foreground">{t("page.department.addDesc")}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-card border border-border/50 rounded-xl p-6 space-y-5">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Building2 size={16} />
              {t("page.department.info")}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t("page.department.name")} <span className="text-destructive">*</span>
              </label>
              <Input
                name="nameDepartment"
                value={form.nameDepartment}
                onChange={handleChange}
                placeholder={t("page.department.namePlaceholder")}
                className={errors.nameDepartment ? "border-destructive" : ""}
              />
              {errors.nameDepartment && (
                <p className="text-xs text-destructive">{errors.nameDepartment}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">{t("page.department.nameEnglish")}</label>
              <Input
                name="nameDepartmentEnglish"
                value={form.nameDepartmentEnglish}
                onChange={handleChange}
                placeholder={t("page.department.nameEnglishPlaceholder")}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">{t("page.department.description")}</label>
              <textarea
                name="descDepartment"
                value={form.descDepartment}
                onChange={handleChange}
                placeholder={t("page.department.descPlaceholder")}
                rows={3}
                className="w-full rounded-xl bg-accent/50 border border-border/60 px-4 py-2.5 text-sm outline-none focus:border-primary/50 transition-colors resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t("page.department.descriptionEnglish")}
              </label>
              <textarea
                name="descDepartmentEnglish"
                value={form.descDepartmentEnglish}
                onChange={handleChange}
                placeholder={t("page.department.descEnglishPlaceholder")}
                rows={3}
                className="w-full rounded-xl bg-accent/50 border border-border/60 px-4 py-2.5 text-sm outline-none focus:border-primary/50 transition-colors resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">{t("page.department.image")}</label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="relative border-2 border-dashed border-border/60 rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 transition-colors">
                {imagePreview ? (
                  <div className="relative inline-block">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="max-h-40 rounded-lg object-cover"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage();
                      }}
                      className="absolute -top-2 -right-2 p-1 rounded-full bg-destructive text-destructive-foreground shadow-md">
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center">
                      <Image size={24} className="text-muted-foreground/50" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {t("page.department.clickToUpload")}
                    </p>
                    <p className="text-xs text-muted-foreground/60">PNG, JPG, WEBP</p>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => navigate("/department")}>
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

export default AddDepartment;
