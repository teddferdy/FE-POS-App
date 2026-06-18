import React from "react";
import { useQuery } from "react-query";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Building2, Edit3, Calendar, FileText } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { getDepartmentById } from "@/services/department";

const DetailDepartment = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();

  const { data, isLoading, isError } = useQuery(["department", id], () => getDepartmentById(id), {
    enabled: !!id
  });

  const department = data?.data || data;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (isError || !department) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">{t("page.department.notFound")}</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate("/department")}>
            {t("common.back")}
          </Button>
        </div>
      </div>
    );
  }

  const imageUrl = department.imageDepartment || department.image || null;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto p-6">
        <div className="flex items-center gap-3 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate("/department")}>
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-xl font-bold">
              {department.nameDepartment || department.name || "-"}
            </h1>
            <p className="text-sm text-muted-foreground">{t("page.department.detailDesc")}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="ml-auto"
            onClick={() => navigate(`/department/edit/${id}`)}>
            <Edit3 size={14} />
            {t("common.edit")}
          </Button>
        </div>

        <div className="bg-card border border-border/50 rounded-xl overflow-hidden">
          {imageUrl && (
            <div className="w-full h-48 overflow-hidden bg-muted/30">
              <img
                src={imageUrl || "/placeholder.svg"}
                alt={department.nameDepartment || department.name || ""}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="p-6 space-y-5">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Building2 size={16} />
              {t("page.department.info")}
            </div>
            <div className="grid gap-4">
              <div>
                <p className="text-xs text-muted-foreground">{t("page.department.name")}</p>
                <p className="font-medium">{department.nameDepartment || department.name || "-"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t("page.department.nameEnglish")}</p>
                <p className="font-medium">
                  {department.nameDepartmentEnglish || department.nameEnglish || "-"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <FileText size={12} />
                  {t("page.department.description")}
                </p>
                <p className="font-medium">
                  {department.descDepartment || department.description || "-"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <FileText size={12} />
                  {t("page.department.descriptionEnglish")}
                </p>
                <p className="font-medium">
                  {department.descDepartmentEnglish || department.descEnglish || "-"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar size={12} />
                  {t("common.createdAt")}
                </p>
                <p className="font-medium">
                  {department.createdAt
                    ? new Date(department.createdAt).toLocaleDateString("id-ID", {
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

export default DetailDepartment;
