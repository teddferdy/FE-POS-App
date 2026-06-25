import React from "react";
import { useQuery } from "react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Briefcase, Edit3, Calendar, Building2, User } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";
import { getPositionById } from "@/services/position";

const statusBadge = (status, t) => {
  if (status === "active")
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800">
        <span className="w-1.5 h-1.5 rounded-full bg-green-500 dark:bg-green-400" />
        {t("common.active")}
      </span>
    );
  if (status === "draft")
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 dark:bg-amber-400" />
        {t("common.draft")}
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800">
      <span className="w-1.5 h-1.5 rounded-full bg-red-500 dark:bg-red-400" />
      {t("common.inactive")}
    </span>
  );
};

const DetailPosition = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const positionID = searchParams.get("positionID");

  const { data, isLoading, isError, refetch } = useQuery(
    ["position", positionID],
    () => getPositionById({ id: positionID }),
    { enabled: !!positionID }
  );

  const position = data?.data || data;

  if (!positionID)
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">{t("page.position.detail.notFound")}</p>
      </div>
    );

  if (isLoading) return <Loading fullscreen size="lg" label={t("common.loading")} />;

  if (isError)
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-muted-foreground">{t("page.position.detail.notFound")}</p>
        <Button variant="outline" onClick={() => refetch()}>
          {t("common.retry")}
        </Button>
        <Button variant="ghost" onClick={() => navigate("/position-list")}>
          {t("common.back")}
        </Button>
      </div>
    );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <button onClick={() => navigate("/")} className="hover:text-foreground transition-colors">
          {t("breadcrumb.dashboard")}
        </button>
        <span className="text-xs">/</span>
        <button
          onClick={() => navigate("/position-list")}
          className="hover:text-foreground transition-colors">
          {t("breadcrumb.position")}
        </button>
        <span className="text-xs">/</span>
        <span className="text-primary font-semibold">{position.name || "Detail"}</span>
      </nav>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={() => navigate("/position-list")}>
            <ArrowLeft size={16} />
          </Button>
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Briefcase size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{position.name || "-"}</h1>
            <p className="text-sm text-muted-foreground">{t("page.position.detail.description")}</p>
          </div>
        </div>
        <Button variant="outline" onClick={() => navigate(`/edit-position?id=${positionID}`)}>
          <Edit3 size={14} className="mr-1.5" />
          {t("common.edit")}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5 col-span-1 md:col-span-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-5">
            <Briefcase size={16} />
            {t("page.position.detail.jobInfo")}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6 text-sm">
            <div>
              <p className="text-xs text-muted-foreground mb-1">
                {t("page.position.detail.positionName")}
              </p>
              <p className="font-medium">{position.name || "-"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">
                {t("page.position.detail.positionId")}
              </p>
              <p className="font-mono text-sm">#{position.id}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">
                {t("page.position.detail.department")}
              </p>
              <p className="font-medium">
                {position.departmentData?.name || position.department || "-"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">
                {t("page.position.detail.status")}
              </p>
              {statusBadge(position.status, t)}
            </div>
            <div className="md:col-span-2">
              <p className="text-xs text-muted-foreground mb-1">
                {t("page.position.form.description")}
              </p>
              <p className="font-medium">{position.description || "-"}</p>
            </div>
          </div>
          <div className="border-t border-border/50 mt-5 pt-4 grid grid-cols-2 gap-2.5 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <User size={13} className="shrink-0" />
              <span>
                {t("common.createdBy")}: {position.createdBy || "-"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <User size={13} className="shrink-0" />
              <span>
                {t("common.modifiedBy")}: {position.modifiedBy || "-"}
              </span>
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="p-5">
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              <Calendar size={14} />
              {t("page.position.detail.createdAt")}
            </div>
            <p className="text-sm font-medium">
              {position.createdAt
                ? new Date(position.createdAt).toLocaleDateString("id-ID", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                  })
                : "-"}
            </p>
            <div className="mt-3 pt-3 border-t border-border/50">
              <p className="text-xs text-muted-foreground mb-1">
                {t("page.position.detail.updatedAt")}
              </p>
              <p className="text-sm font-medium">
                {position.updatedAt
                  ? new Date(position.updatedAt).toLocaleDateString("id-ID", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit"
                    })
                  : "-"}
              </p>
            </div>
          </Card>
          {position.store && (
            <Card className="p-5">
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                <Building2 size={14} />
                {t("page.position.detail.store")}
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Building2 size={14} className="shrink-0 text-muted-foreground" />
                <span>{position.store}</span>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default DetailPosition;
