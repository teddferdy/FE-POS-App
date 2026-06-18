import React from "react";
import PropTypes from "prop-types";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "react-query";
import { useTranslation } from "react-i18next";
import { Award, Coins, Gift, Tag, Calendar, Users } from "lucide-react";
import { getDetailMemberTier } from "@/services/member-tier";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import AbortController from "@/components/organism/abort-controller";

const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "-";
    return (
      d.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric"
      }) +
      " " +
      d.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit"
      })
    );
  } catch {
    return "-";
  }
};

const DetailRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3">
    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
      <Icon size={16} className="text-primary" />
    </div>
    <div>
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        {label}
      </p>
      <p className="text-sm font-semibold text-foreground mt-0.5">{value || "-"}</p>
    </div>
  </div>
);

DetailRow.propTypes = {
  icon: PropTypes.elementType.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.string
};

const DetailMemberTier = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tierId = searchParams.get("id");

  const {
    data: tierData,
    isLoading,
    isError,
    refetch
  } = useQuery(["member-tier-detail", tierId], () => getDetailMemberTier(tierId), {
    enabled: !!tierId
  });

  const tier = tierData?.data || {};

  if (!tierId) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground gap-3">
        <Award size={48} className="text-muted-foreground/40" />
        <p>ID tier tidak ditemukan</p>
        <Button variant="outline" onClick={() => navigate("/member-tier")}>
          Kembali
        </Button>
      </div>
    );
  }

  if (isError) return <AbortController refetch={refetch} />;

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-28" />
        </div>
        <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-8 md:p-10">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <Skeleton className="w-24 h-24 md:w-28 md:h-28 rounded-2xl shrink-0" />
              <div className="text-center md:text-left space-y-3 flex-1">
                <div className="flex items-center gap-3 justify-center md:justify-start">
                  <Skeleton className="h-8 w-48" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-border">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="p-6 flex items-center gap-4">
                <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
                <div className="space-y-2">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-card rounded-xl shadow-sm border border-border p-6">
            <div className="flex items-center gap-3 mb-5 pb-3 border-b border-border">
              <Skeleton className="h-5 w-5 rounded" />
              <Skeleton className="h-5 w-20" />
            </div>
            <div className="space-y-2">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
            </div>
          </div>
          <div className="bg-card rounded-xl shadow-sm border border-border p-6">
            <div className="flex items-center gap-3 mb-5 pb-3 border-b border-border">
              <Skeleton className="h-5 w-5 rounded" />
              <Skeleton className="h-5 w-20" />
            </div>
            <div className="space-y-4">
              {[0, 1].map((i) => (
                <div key={i} className="flex items-start gap-3">
                  <Skeleton className="w-9 h-9 rounded-lg shrink-0 mt-0.5" />
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <Skeleton className="h-10 w-28 rounded-lg" />
          <Skeleton className="h-10 w-24 rounded-lg" />
        </div>
      </div>
    );
  }

  if (!tier || !tier.id) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground gap-3">
        <Award size={48} className="text-muted-foreground/40" />
        <p>Tier tidak ditemukan</p>
        <Button variant="outline" onClick={() => navigate("/member-tier")}>
          Kembali
        </Button>
      </div>
    );
  }

  const isActive = tier.status === "active" || tier.status === true;

  return (
    <div>
      <div className="space-y-8">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <button
            onClick={() => navigate("/dashboard-super-admin")}
            className="hover:text-foreground transition-colors">
            Home
          </button>
          <span className="text-xs">/</span>
          <button
            onClick={() => navigate("/member-tier")}
            className="hover:text-foreground transition-colors">
            Member Tier
          </button>
          <span className="text-xs">/</span>
          <span className="text-primary font-semibold">{tier.name}</span>
        </nav>

        <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
          <div
            className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-8 md:p-10"
            style={
              tier.color
                ? {
                    background: `linear-gradient(to right, ${tier.color}15, ${tier.color}08, transparent)`
                  }
                : undefined
            }>
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div
                className="w-24 h-24 md:w-28 md:h-28 rounded-2xl flex items-center justify-center text-white shrink-0 text-4xl font-bold shadow-lg"
                style={{ backgroundColor: tier.color || "#f59e0b" }}>
                <Award size={48} />
              </div>
              <div className="text-center md:text-left">
                <div className="flex items-center gap-3 justify-center md:justify-start mb-2">
                  <h1 className="text-2xl md:text-3xl font-bold text-foreground">{tier.name}</h1>
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-bold ${
                      isActive
                        ? "bg-green-100 text-green-700 border border-green-200"
                        : "bg-red-100 text-red-700 border border-red-200"
                    }`}>
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-green-500" : "bg-red-500"}`}
                    />
                    {isActive ? "Aktif" : "Non-Active"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-border">
            <div className="p-6 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <Coins size={20} />
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {t("page.memberTier.detail.minPoints")}
                </p>
                <p className="text-sm font-semibold text-foreground mt-0.5">
                  {tier.minPoints?.toLocaleString?.() || 0}
                </p>
              </div>
            </div>
            <div className="p-6 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <Coins size={20} />
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {t("page.memberTier.detail.maxPoints")}
                </p>
                <p className="text-sm font-semibold text-foreground mt-0.5">
                  {tier.maxPoints?.toLocaleString?.() || "~"}
                </p>
              </div>
            </div>
            <div className="p-6 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <Tag size={20} />
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Diskon
                </p>
                <p className="text-sm font-semibold text-foreground mt-0.5">
                  {tier.discountPercent || 0}%
                </p>
              </div>
            </div>
            <div className="p-6 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <Users size={20} />
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Member
                </p>
                <p className="text-sm font-semibold text-foreground mt-0.5">
                  {tier.memberCount || 0} Member
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-card rounded-xl shadow-sm border border-border p-6">
            <div className="flex items-center gap-3 mb-5 pb-3 border-b border-border">
              <Gift size={18} className="text-primary" />
              <h3 className="text-base font-semibold text-foreground">Benefits</h3>
            </div>
            {tier.benefits?.length > 0 ? (
              <ul className="space-y-2">
                {tier.benefits.map((b, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-foreground">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: tier.color || "#f59e0b" }}
                    />
                    {b}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground italic">Tidak ada benefits</p>
            )}
          </div>

          <div className="bg-card rounded-xl shadow-sm border border-border p-6">
            <div className="flex items-center gap-3 mb-5 pb-3 border-b border-border">
              <Calendar size={18} className="text-primary" />
              <h3 className="text-base font-semibold text-foreground">
                {t("page.memberTier.detail.systemInfo")}
              </h3>
            </div>
            <div className="space-y-4">
              <DetailRow icon={Calendar} label="Created At" value={formatDate(tier.createdAt)} />
              <DetailRow icon={Calendar} label="Updated At" value={formatDate(tier.updatedAt)} />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => navigate("/member-tier")} className="gap-2">
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            Kembali
          </Button>
          <Button
            onClick={() => navigate(`/edit-member-tier?id=${tier.id}`)}
            className="gap-2 shadow-md">
            <span className="material-symbols-outlined text-lg">edit</span>
            Edit Tier
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DetailMemberTier;
