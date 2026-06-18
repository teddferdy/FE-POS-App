import React from "react";
import { useQuery } from "react-query";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, FolderTree, Edit3, Calendar, FileText } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { getCategoryById } from "@/services/category";

const DetailCategory = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();

  const { data, isLoading, isError } = useQuery(["category", id], () => getCategoryById(id), {
    enabled: !!id
  });

  const category = data?.data || data;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (isError || !category) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">{t("page.category.notFound")}</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate("/category")}>
            {t("common.back")}
          </Button>
        </div>
      </div>
    );
  }

  const imageUrl = category.imageCategory || category.image || null;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto p-6">
        <div className="flex items-center gap-3 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate("/category")}>
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-xl font-bold">{category.nameCategory || category.name || "-"}</h1>
            <p className="text-sm text-muted-foreground">{t("page.category.detailDesc")}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="ml-auto"
            onClick={() => navigate(`/category/edit/${id}`)}>
            <Edit3 size={14} />
            {t("common.edit")}
          </Button>
        </div>

        <div className="bg-card border border-border/50 rounded-xl overflow-hidden">
          {imageUrl && (
            <div className="w-full h-48 overflow-hidden bg-muted/30">
              <img
                src={imageUrl || "/placeholder.svg"}
                alt={category.nameCategory || category.name || ""}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="p-6 space-y-5">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <FolderTree size={16} />
              {t("page.category.info")}
            </div>
            <div className="grid gap-4">
              <div>
                <p className="text-xs text-muted-foreground">{t("page.category.name")}</p>
                <p className="font-medium">{category.nameCategory || category.name || "-"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t("page.category.nameEnglish")}</p>
                <p className="font-medium">
                  {category.nameCategoryEnglish || category.nameEnglish || "-"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <FileText size={12} />
                  {t("page.category.description")}
                </p>
                <p className="font-medium">
                  {category.descCategory || category.description || "-"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <FileText size={12} />
                  {t("page.category.descriptionEnglish")}
                </p>
                <p className="font-medium">
                  {category.descCategoryEnglish || category.descEnglish || "-"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar size={12} />
                  {t("common.createdAt")}
                </p>
                <p className="font-medium">
                  {category.createdAt
                    ? new Date(category.createdAt).toLocaleDateString("id-ID", {
                        year: "numeric",
                        month: "long",
                        day: "numeric"
                      })
                    : "-"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailCategory;
