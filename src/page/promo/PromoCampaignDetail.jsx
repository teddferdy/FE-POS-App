import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { useCookies } from "react-cookie";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { getCampaignById, updateCampaignStatus } from "@/services/promo";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import PageHeader from "@/components/ui/PageHeader";
import Modal from "@/components/organism/modal";
import {
  Calendar,
  Clock,
  Tag,
  Percent,
  Users,
  TrendingUp,
  Edit,
  Play,
  Pause,
  CheckCircle,
  XCircle
} from "lucide-react";

const PromoCampaignDetail = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  const queryClient = useQueryClient();
  const [cookie] = useCookies();
  const user = cookie?.user;
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [statusAction, setStatusAction] = useState(null);

  const { data: campaign, isLoading } = useQuery(["promo-campaign", id], () => getCampaignById(id), {
    enabled: !!id
  });

  const statusMutation = useMutation(
    ({ status }) => updateCampaignStatus(id, { status }),
    {
      onSuccess: () => {
        toast.success(t("common.success"), {
          description: t("page.promo.toast.statusUpdated")
        });
        queryClient.invalidateQueries(["promo-campaigns"]);
        queryClient.invalidateQueries(["promo-campaign", id]);
        setStatusModalOpen(false);
      },
      onError: (err) => {
        toast.error(t("common.error"), {
          description: err?.response?.data?.message || err.message
        });
      }
    }
  );

  const handleStatusChange = (action) => {
    setStatusAction(action);
    setStatusModalOpen(true);
  };

  const confirmStatusChange = () => {
    const newStatus = statusAction === "activate" ? "active" : "paused";
    statusMutation.mutate({ status: newStatus });
  };

  const getStatusBadge = (status) => {
    const styles = {
      active: "bg-green-100 text-green-800",
      paused: "bg-yellow-100 text-yellow-800",
      draft: "bg-gray-100 text-gray-800",
      expired: "bg-red-100 text-red-800"
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || styles.draft}`}>
        {status?.charAt(0).toUpperCase() + status?.slice(1)}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-48" />
            <Skeleton className="h-64" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-32" />
            <Skeleton className="h-48" />
          </div>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="space-y-6">
        <PageHeader
          breadcrumbs={[
            {
              href:
                user?.roleType === "super_admin"
                  ? "/dashboard-super-admin"
                  : user?.roleType === "admin"
                    ? "/dashboard-admin"
                    : "/home",
              i18nKey: "breadcrumb.home"
            },
            {
              href: "/promo-list",
              i18nKey: "sidebar.promo"
            },
            { i18nKey: "page.promo.detail.title" }
          ]}
          title={t("page.promo.detail.title")}
          description={t("page.promo.detail.description")}
        />
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <p className="text-muted-foreground">{t("page.promo.detail.notFound")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[
          {
            href:
              user?.roleType === "super_admin"
                ? "/dashboard-super-admin"
                : user?.roleType === "admin"
                  ? "/dashboard-admin"
                  : "/home",
            i18nKey: "breadcrumb.home"
          },
          {
            href: "/promo-list",
            i18nKey: "sidebar.promo"
          },
          { i18nKey: "page.promo.detail.title" }
        ]}
        title={campaign.name}
        description={campaign.description || t("page.promo.detail.description")}>
        <div className="flex gap-2">
          {campaign.status === "active" ? (
            <Button
              variant="outline"
              onClick={() => handleStatusChange("pause")}
              disabled={statusMutation?.isLoading}>
              <Pause size={16} className="mr-1" />
              {t("page.promo.detail.pause")}
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={() => handleStatusChange("activate")}
              disabled={statusMutation?.isLoading}>
              <Play size={16} className="mr-1" />
              {t("page.promo.detail.activate")}
            </Button>
          )}
          <Button onClick={() => navigate(`/edit-promo-campaign?id=${id}`)}>
            <Edit size={16} className="mr-1" />
            {t("common.edit")}
          </Button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Campaign Info */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="font-semibold text-foreground mb-4">{t("page.promo.detail.campaignInfo")}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Tag size={16} className="text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">{t("page.promo.form.code")}</p>
                  <p className="text-sm font-medium text-foreground">{campaign.code || "-"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <TrendingUp size={16} className="text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">{t("page.promo.form.type")}</p>
                  <p className="text-sm font-medium text-foreground capitalize">
                    {campaign.type?.replace(/_/g, " ")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Percent size={16} className="text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">{t("page.promo.form.discountType")}</p>
                  <p className="text-sm font-medium text-foreground capitalize">
                    {campaign.discountType?.replace(/_/g, " ")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Users size={16} className="text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">{t("page.promo.form.applicableTo")}</p>
                  <p className="text-sm font-medium text-foreground capitalize">
                    {campaign.applicableTo?.replace(/_/g, " ")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Schedule */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="font-semibold text-foreground mb-4">{t("page.promo.detail.schedule")}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Calendar size={16} className="text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">{t("page.promo.form.startDate")}</p>
                  <p className="text-sm font-medium text-foreground">{formatDate(campaign.startDate)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar size={16} className="text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">{t("page.promo.form.endDate")}</p>
                  <p className="text-sm font-medium text-foreground">{formatDate(campaign.endDate)}</p>
                </div>
              </div>
              {campaign.type === "happy_hour" && campaign.startTime && (
                <>
                  <div className="flex items-center gap-3">
                    <Clock size={16} className="text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">{t("page.promo.form.startTime")}</p>
                      <p className="text-sm font-medium text-foreground">{campaign.startTime}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock size={16} className="text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">{t("page.promo.form.endTime")}</p>
                      <p className="text-sm font-medium text-foreground">{campaign.endTime}</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Rules */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="font-semibold text-foreground mb-4">{t("page.promo.detail.rules")}</h3>
            {campaign.rules?.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("page.promo.form.noRules")}</p>
            ) : (
              <div className="space-y-3">
                {campaign.rules?.map((rule, index) => (
                  <div key={index} className="p-3 bg-background rounded-lg border border-border">
                    <div className="flex items-center gap-2">
                      <CheckCircle size={14} className="text-green-600" />
                      <span className="text-sm font-medium text-foreground capitalize">
                        {rule.ruleType?.replace(/_/g, " ")}
                      </span>
                    </div>
                    {rule.condition && Object.keys(rule.condition).length > 0 && (
                      <p className="text-xs text-muted-foreground mt-1 ml-5">
                        {JSON.stringify(rule.condition)}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Rewards */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="font-semibold text-foreground mb-4">{t("page.promo.detail.rewards")}</h3>
            {campaign.rewards?.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("page.promo.form.noRewards")}</p>
            ) : (
              <div className="space-y-3">
                {campaign.rewards?.map((reward, index) => (
                  <div key={index} className="p-3 bg-background rounded-lg border border-border">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle size={14} className="text-green-600" />
                        <span className="text-sm font-medium text-foreground capitalize">
                          {reward.rewardType?.replace(/_/g, " ")}
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-foreground">
                        {reward.rewardValue}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h4 className="text-sm font-semibold text-foreground mb-3">{t("page.promo.detail.status")}</h4>
            {getStatusBadge(campaign.status)}
          </div>

          {/* Discount Settings */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h4 className="text-sm font-semibold text-foreground mb-3">{t("page.promo.detail.discountSettings")}</h4>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground">{t("page.promo.form.discountValue")}</p>
                <p className="text-sm font-medium text-foreground">{campaign.discountValue || 0}</p>
              </div>
              {campaign.maxDiscount && (
                <div>
                  <p className="text-xs text-muted-foreground">{t("page.promo.form.maxDiscount")}</p>
                  <p className="text-sm font-medium text-foreground">{campaign.maxDiscount}</p>
                </div>
              )}
              {campaign.minPurchase > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground">{t("page.promo.form.minPurchase")}</p>
                  <p className="text-sm font-medium text-foreground">{campaign.minPurchase}</p>
                </div>
              )}
            </div>
          </div>

          {/* Usage Limits */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h4 className="text-sm font-semibold text-foreground mb-3">{t("page.promo.detail.usageLimits")}</h4>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground">{t("page.promo.form.maxUsageTotal")}</p>
                <p className="text-sm font-medium text-foreground">
                  {campaign.maxUsageTotal || t("common.unlimited")}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t("page.promo.form.maxUsagePerMember")}</p>
                <p className="text-sm font-medium text-foreground">
                  {campaign.maxUsagePerMember || t("common.unlimited")}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t("page.promo.detail.currentUsage")}</p>
                <p className="text-sm font-medium text-foreground">{campaign.currentUsage || 0}</p>
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h4 className="text-sm font-semibold text-foreground mb-3">{t("page.promo.detail.settings")}</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {campaign.isCombinable ? (
                  <CheckCircle size={14} className="text-green-600" />
                ) : (
                  <XCircle size={14} className="text-muted-foreground" />
                )}
                <span className="text-sm text-foreground">{t("page.promo.form.isCombinable")}</span>
              </div>
              <div className="flex items-center gap-2">
                {campaign.autoActivate ? (
                  <CheckCircle size={14} className="text-green-600" />
                ) : (
                  <XCircle size={14} className="text-muted-foreground" />
                )}
                <span className="text-sm text-foreground">{t("page.promo.form.autoActivate")}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal
        type="confirm"
        open={statusModalOpen}
        onOpenChange={setStatusModalOpen}
        title={
          statusAction === "activate"
            ? t("page.promo.modal.activateTitle")
            : t("page.promo.modal.pauseTitle")
        }
        description={
          statusAction === "activate"
            ? t("page.promo.modal.activateDescription")
            : t("page.promo.modal.pauseDescription")
        }
        confirmText={
          statusAction === "activate"
            ? t("page.promo.modal.confirmActivate")
            : t("page.promo.modal.confirmPause")
        }
        onConfirm={confirmStatusChange}
      />
    </div>
  );
};

export default PromoCampaignDetail;