import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "react-query";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { getAllPositionTable } from "@/services/position";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/loading";
import PageHeader from "@/components/ui/PageHeader";

const DetailPosition = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const positionId = searchParams.get("positionID");

  const { data, isLoading } = useQuery(
    ["position-detail", positionId],
    () => getAllPositionTable({ page: 1, limit: 100, statusRole: "all" }),
    {
      enabled: !!positionId,
      select: (res) => {
        const list = res?.data || [];
        return list.find((p) => String(p.id) === positionId);
      }
    }
  );

  const position = data;

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    try {
      return format(new Date(dateStr), "dd MMM yyyy", { locale: id });
    } catch {
      return "-";
    }
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return "-";
    try {
      return format(new Date(dateStr), "dd MMM yyyy, HH:mm", { locale: id });
    } catch {
      return "-";
    }
  };

  if (!positionId) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground gap-3">
        <span className="material-symbols-outlined text-4xl">badge</span>
        <p>{t("page.position.detail.idNotFound")}</p>
        <Button variant="outline" onClick={() => navigate("/position-list")}>
          {t("common.cancel")}
        </Button>
      </div>
    );
  }

  if (isLoading) {
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
        <p>{t("page.position.detail.notFound")}</p>
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
          { label: position.name }
        ]}
        title={position.name}
        description={t("page.position.detail.description")}>
        <Button
          onClick={() => navigate(`/edit-position?id=${position.id}`)}
          className="flex items-center gap-2 px-6 py-2.5 rounded-lg shadow-sm">
          <span className="material-symbols-outlined text-lg">edit</span>
          {t("page.position.button.edit")}
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card rounded-xl shadow-sm border border-border p-6">
            <div className="flex items-center gap-3 mb-5 pb-3 border-b border-border">
              <span className="material-symbols-outlined text-primary">badge</span>
              <h3 className="text-base font-semibold text-foreground">
                {t("page.position.detail.jobInfo")}
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {t("page.position.detail.positionName")}
                </label>
                <p className="text-sm font-semibold text-foreground mt-1">{position.name || "-"}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {t("page.position.detail.positionId")}
                </label>
                <p className="text-sm font-semibold text-foreground mt-1 font-mono">
                  #{position.id || "-"}
                </p>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {t("common.status")}
                </label>
                <div>
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 mt-1 rounded-full text-xs font-bold uppercase tracking-tight ${
                      position.status === "active"
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800"
                        : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800"
                    }`}>
                    <span className="material-symbols-outlined text-sm">
                      {position.status === "active" ? "check_circle" : "cancel"}
                    </span>
                    {position.status === "active" ? t("common.active") : t("common.inactive")}
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-5 pt-5 border-t border-border">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {t("page.position.detail.description")}
              </label>
              <p className="text-sm text-foreground mt-1">
                {position.description || t("page.position.detail.noDescription")}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-card rounded-xl shadow-sm border border-border p-6">
            <div className="flex items-center gap-3 mb-5 pb-3 border-b border-border">
              <span className="material-symbols-outlined text-primary">info</span>
              <h3 className="text-base font-semibold text-foreground">
                {t("page.position.detail.systemInfo")}
              </h3>
            </div>
            <div className="space-y-5">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary-fixed flex items-center justify-center shrink-0 mt-0.5">
                  <span className="material-symbols-outlined text-primary text-base">
                    calendar_today
                  </span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {t("page.position.detail.createdAt")}
                  </p>
                  <p className="text-sm font-semibold text-foreground mt-0.5">
                    {formatDate(position.createdAt)}
                  </p>
                  <p className="text-xs text-muted-foreground">{position.createdBy || "System"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary-fixed flex items-center justify-center shrink-0 mt-0.5">
                  <span className="material-symbols-outlined text-primary text-base">update</span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {t("page.position.detail.updatedAt")}
                  </p>
                  <p className="text-sm font-semibold text-foreground mt-0.5">
                    {formatDateTime(position.updatedAt)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {position.modifiedBy || t("common.system")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailPosition;
