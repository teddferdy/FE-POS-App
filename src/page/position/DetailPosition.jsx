import React from "react";
import { useQuery } from "react-query";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Briefcase, Edit3, Calendar, FileText } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { getPositionById } from "@/services/position";

const DetailPosition = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();

  const { data, isLoading, isError } = useQuery(["position", id], () => getPositionById(id), {
    enabled: !!id
  });

  const position = data?.data || data;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (isError || !position) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">{t("page.position.notFound")}</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate("/position")}>
            {t("common.back")}
          </Button>
        </div>
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
            <h1 className="text-xl font-bold">{position.namePosition || position.name || "-"}</h1>
            <p className="text-sm text-muted-foreground">{t("page.position.detailDesc")}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="ml-auto"
            onClick={() => navigate(`/position/edit/${id}`)}>
            <Edit3 size={14} />
            {t("common.edit")}
          </Button>
        </div>

        <div className="bg-card border border-border/50 rounded-xl p-6 space-y-5">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Briefcase size={16} />
            {t("page.position.info")}
          </div>
          <div className="grid gap-4">
            <div>
              <p className="text-xs text-muted-foreground">{t("page.position.name")}</p>
              <p className="font-medium">{position.namePosition || position.name || "-"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <FileText size={12} />
                {t("page.position.description")}
              </p>
              <p className="font-medium">{position.descPosition || position.description || "-"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar size={12} />
                {t("common.createdAt")}
              </p>
              <p className="font-medium">
                {position.createdAt
                  ? new Date(position.createdAt).toLocaleDateString("id-ID", {
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
  );
};

export default DetailPosition;
