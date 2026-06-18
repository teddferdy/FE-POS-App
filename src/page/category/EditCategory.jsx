import React, { useState, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, FolderTree, Image, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getCategoryById, editCategory } from "@/services/category";
import { Toast } from "@/components/organism/toast";

const EditCategory = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  const [form, setForm] = useState({
    nameCategory: "",
    nameCategoryEnglish: "",
    descCategory: "",
    descCategoryEnglish: ""
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [existingImage, setExistingImage] = useState(null);
  const [errors, setErrors] = useState({});

  const { isLoading } = useQuery(["category", id], () => getCategoryById(id), {
    enabled: !!id,
    onSuccess: (res) => {
      const cat = res?.data || res;
      setForm({
        nameCategory: cat.nameCategory || cat.name || "",
        nameCategoryEnglish: cat.nameCategoryEnglish || cat.nameEnglish || "",
        descCategory: cat.descCategory || cat.description || "",
        descCategoryEnglish: cat.descCategoryEnglish || cat.descEnglish || ""
      });
      setExistingImage(cat.imageCategory || cat.image || null);
    }
  });

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
    setExistingImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const validate = () => {
    const errs = {};
    if (!form.nameCategory.trim()) errs.nameCategory = t("page.category.nameRequired");
    return errs;
  };

  const mutation = useMutation((data) => editCategory({ ...data, id }), {
    onSuccess: () => {
      queryClient.invalidateQueries("categories");
      Toast.fire({ icon: "success", title: t("page.category.updated") });
      navigate("/category");
    },
    onError: (err) => {
      Toast.fire({
        icon: "error",
        title: err?.response?.data?.message || t("page.category.updateError")
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
    formData.append("nameCategory", form.nameCategory);
    formData.append("nameCategoryEnglish", form.nameCategoryEnglish);
    formData.append("descCategory", form.descCategory);
    formData.append("descCategoryEnglish", form.descCategoryEnglish);
    if (image) formData.append("imageCategory", image);
    mutation.mutate(formData);
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
          <Button variant="ghost" size="icon" onClick={() => navigate("/category")}>
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-xl font-bold">{t("page.category.editTitle")}</h1>
            <p className="text-sm text-muted-foreground">{t("page.category.editDesc")}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-card border border-border/50 rounded-xl p-6 space-y-5">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <FolderTree size={16} />
              {t("page.category.info")}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t("page.category.name")} <span className="text-destructive">*</span>
              </label>
              <Input
                name="nameCategory"
                value={form.nameCategory}
                onChange={handleChange}
                placeholder={t("page.category.namePlaceholder")}
                className={errors.nameCategory ? "border-destructive" : ""}
              />
              {errors.nameCategory && (
                <p className="text-xs text-destructive">{errors.nameCategory}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">{t("page.category.nameEnglish")}</label>
              <Input
                name="nameCategoryEnglish"
                value={form.nameCategoryEnglish}
                onChange={handleChange}
                placeholder={t("page.category.nameEnglishPlaceholder")}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">{t("page.category.description")}</label>
              <textarea
                name="descCategory"
                value={form.descCategory}
                onChange={handleChange}
                placeholder={t("page.category.descPlaceholder")}
                rows={3}
                className="w-full rounded-xl bg-accent/50 border border-border/60 px-4 py-2.5 text-sm outline-none focus:border-primary/50 transition-colors resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">{t("page.category.descriptionEnglish")}</label>
              <textarea
                name="descCategoryEnglish"
                value={form.descCategoryEnglish}
                onChange={handleChange}
                placeholder={t("page.category.descEnglishPlaceholder")}
                rows={3}
                className="w-full rounded-xl bg-accent/50 border border-border/60 px-4 py-2.5 text-sm outline-none focus:border-primary/50 transition-colors resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">{t("page.category.image")}</label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="relative border-2 border-dashed border-border/60 rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 transition-colors">
                {imagePreview || existingImage ? (
                  <div className="relative inline-block">
                    <img
                      src={imagePreview || existingImage || "/placeholder.svg"}
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
                      {t("page.category.clickToUpload")}
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
            <Button type="button" variant="outline" onClick={() => navigate("/category")}>
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

export default EditCategory;
