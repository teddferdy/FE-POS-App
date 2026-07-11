import React, { useState } from "react";
import { Plus, Award, CheckCircle, FileEdit, XCircle } from "lucide-react";
import StatCard from "@/components/ui/StatCard";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { toast } from "sonner";
import { getAllMemberTier, deleteMemberTier } from "@/services/member-tier";
import { getAllLocation } from "@/services/location";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loading } from "@/components/ui/loading";
import { Skeleton } from "@/components/ui/skeleton";
import Modal from "@/components/organism/modal";
import DataTable from "@/components/ui/DataTable";
import NoStore from "@/components/ui/NoStore";
import { canAccess } from "@/utils/permission";
import AbortController from "@/components/organism/abort-controller";

const MemberTier = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [cookie] = useCookies();
  const user = cookie?.user;
  const isSuperAdmin = user?.roleType === "super_admin";
  const MENU_KEY = "/member-tier";
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(null);
  const [limit, setLimit] = useState(5);

  const { data: locData } = useQuery(["locations-member-tier"], () => getAllLocation(), {
    staleTime: 5 * 60 * 1000,
    enabled: isSuperAdmin
  });

  const {
    data: tiersData,
    isLoading,
    isFetching,
    isError,
    refetch
  } = useQuery(["member-tiers"], getAllMemberTier, { staleTime: 30000 });
  const tiers = tiersData?.data || tiersData?.tiers || [];
  const normalizeStatus = (s) => {
    const v = String(s ?? "").toLowerCase();
    if (v === "true" || v === "active") return "active";
    if (v === "false" || v === "inactive") return "inactive";
    return "draft";
  };
  const activeTierCount =
    tiersData?.activeCount ?? tiers.filter((t) => normalizeStatus(t.status) === "active").length;
  const draftTierCount = tiers.filter((t) => normalizeStatus(t.status) === "draft").length;
  const inactiveTierCount = tiers.filter((t) => normalizeStatus(t.status) === "inactive").length;

  const filteredTiers = tiers.filter((tier) => {
    const matchesSearch = tier.name?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !statusFilter || normalizeStatus(tier.status) === statusFilter;
    return matchesSearch && matchesStatus;
  });
  const totalPages = Math.ceil(filteredTiers.length / limit);
  const paginatedTiers = filteredTiers.slice((currentPage - 1) * limit, currentPage * limit);

  const deleteMutation = useMutation(deleteMemberTier, {
    onSuccess: () => {
      toast.success(t("page.memberTier.list.toastDeleteSuccess"), {
        description: t("page.memberTier.list.toastDeleteDesc")
      });
      queryClient.invalidateQueries(["member-tiers"]);
      setDeleteTarget(null);
    },
    onError: (err) =>
      toast.error(t("page.memberTier.list.toastError"), {
        description: err?.response?.data?.message || err.message
      })
  });

  const statusBadge = (status) => {
    const ns = normalizeStatus(status);
    const isActive = ns === "active";
    const isInactive = ns === "inactive";
    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
          isActive
            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
            : isInactive
              ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
              : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
        }`}>
        <span
          className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-green-500" : isInactive ? "bg-red-500" : "bg-amber-500"}`}
        />
        {isActive ? t("common.active") : isInactive ? t("common.inactive") : t("common.draft")}
      </span>
    );
  };

  const columns = [
    {
      header: "#",
      render: (tier, idx) => (
        <span className="font-mono text-sm text-muted-foreground">
          {(currentPage - 1) * limit + idx + 1}
        </span>
      )
    },
    {
      header: t("page.memberTier.table.name"),
      render: (tier) => (
        <div className="flex items-center gap-2">
          <div
            className="w-2 h-8 rounded-full"
            style={{ backgroundColor: tier.color || "#f59e0b" }}
          />
          <span className="font-semibold text-foreground">{tier.name}</span>
        </div>
      )
    },
    {
      header: t("page.memberTier.table.minPoints"),
      render: (tier) => (
        <span className="font-mono text-sm text-foreground">
          {tier.minPoints?.toLocaleString?.() || tier.minPoints || 0}
        </span>
      )
    },
    {
      header: t("page.memberTier.table.maxPoints"),
      render: (tier) => (
        <span className="font-mono text-sm text-foreground">
          {tier.maxPoints?.toLocaleString?.() || tier.maxPoints || "-"}
        </span>
      )
    },
    {
      header: t("page.memberTier.table.discount"),
      render: (tier) => (
        <span className="font-mono text-sm text-primary font-semibold">
          {tier.discountPercent ? `${tier.discountPercent}%` : "-"}
        </span>
      )
    },
    {
      header: t("page.memberTier.table.benefits"),
      render: (tier) => (
        <div className="flex flex-wrap gap-1">
          {(Array.isArray(tier.benefits)
            ? tier.benefits
            : (tier.benefits || "").split("\n").filter(Boolean)
          ).map((benefit, idx) => (
            <span
              key={idx}
              className="bg-primary/10 px-2 py-0.5 rounded text-[10px] font-bold text-primary">
              {benefit}
            </span>
          ))}
        </div>
      )
    },
    {
      header: t("page.memberTier.table.members"),
      render: (tier) => (
        <span className="font-mono text-sm text-foreground">
          {tier.members || tier.memberCount || 0}
        </span>
      )
    },
    {
      header: t("page.memberTier.table.status"),
      render: (tier) => statusBadge(tier.status ?? tier.isActive)
    },
    {
      header: t("page.memberTier.table.createdAt"),
      render: (tier) => (
        <span className="text-sm text-muted-foreground">
          {tier.createdAt
            ? new Date(tier.createdAt).toLocaleString("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
              })
            : "-"}
        </span>
      )
    },
    {
      header: t("page.memberTier.table.updatedAt"),
      render: (tier) => (
        <span className="text-sm text-muted-foreground">
          {tier.updatedAt
            ? new Date(tier.updatedAt).toLocaleString("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
              })
            : "-"}
        </span>
      )
    },
    {
      header: t("page.memberTier.table.createdBy"),
      render: (tier) => (
        <span className="text-sm text-muted-foreground">
          {tier.createdByUser?.fullName || tier.createdBy || "-"}
        </span>
      )
    },
    {
      header: t("page.memberTier.table.modifiedBy"),
      render: (tier) => (
        <span className="text-sm text-muted-foreground">
          {tier.modifiedByUser?.fullName || tier.modifiedBy || "-"}
        </span>
      )
    },
    {
      header: t("page.memberTier.table.actions"),
      align: "center",
      stickyRight: true,
      render: (tier) => (
        <div className="flex justify-end gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/detail-member-tier?id=${tier.id}`);
            }}
            className="p-1.5 text-muted-foreground hover:text-blue-600 hover:bg-blue-100/50 rounded-lg transition-all"
            title={t("page.memberTier.list.detailTitle")}>
            <span className="material-symbols-outlined text-lg">visibility</span>
          </button>
          {canAccess(user, MENU_KEY, "edit") && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/edit-member-tier/${tier.id}`);
              }}
              className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
              title={t("page.memberTier.list.editTitle")}>
              <span className="material-symbols-outlined text-lg">edit</span>
            </button>
          )}
          {canAccess(user, MENU_KEY, "delete") && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setDeleteTarget(tier);
              }}
              className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all"
              title={t("page.memberTier.list.deleteTitle")}>
              <span className="material-symbols-outlined text-lg">delete</span>
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div data-tour="page-member-tier" className="space-y-6">
      <div>
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <button
            onClick={() => navigate("/dashboard-super-admin")}
            className="hover:text-foreground transition-colors">
            {t("breadcrumb.home")}
          </button>
          <span className="text-xs">/</span>
          <span className="text-primary font-semibold">{t("page.memberTier.list.title")}</span>
        </nav>
      </div>

      <div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {t("page.memberTier.list.title")}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {t("page.memberTier.list.description")}
            </p>
          </div>
          {canAccess(user, MENU_KEY, "add") && (
            <Button onClick={() => navigate("/add-member-tier")} className="gap-2">
              <Plus size={18} />
              {t("page.memberTier.list.addTier")}
            </Button>
          )}
        </div>
      </div>

      {locData && (locData?.data || []).length === 0 ? (
        <NoStore />
      ) : (
        <>
          {isError ? (
            <AbortController refetch={refetch} />
          ) : (
            <div>
              <div>
                {isFetching || isLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="bg-card rounded-xl border border-border p-4">
                        <div className="flex items-start justify-between mb-3">
                          <Skeleton className="h-3 w-24" />
                          <Skeleton className="h-4 w-4 rounded" />
                        </div>
                        <Skeleton className="h-8 w-28 mb-2" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <StatCard
                      label={t("page.memberTier.list.totalTiers")}
                      value={tiers.length}
                      icon={Award}
                      variant="default"
                    />
                    <StatCard
                      label={t("common.active")}
                      value={activeTierCount}
                      icon={CheckCircle}
                      variant="active"
                    />
                    <StatCard
                      label={t("common.draft")}
                      value={draftTierCount}
                      icon={FileEdit}
                      variant="draft"
                    />
                    <StatCard
                      label={t("common.inactive")}
                      value={inactiveTierCount}
                      icon={XCircle}
                      variant="red"
                    />
                  </div>
                )}

                <div data-tour="tier-table" className="mt-6">
                  <DataTable
                    columns={columns}
                    data={paginatedTiers}
                    isLoading={isLoading || isFetching}
                    rowClassName={() => "group"}
                    toolbar={
                      <div className="flex flex-col gap-3 w-full">
                        <div className="flex items-center justify-between">
                          <h4 className="text-base font-semibold text-foreground">
                            {t("page.memberTier.list.tableTitle")}
                          </h4>
                          <div className="relative">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-base">
                              search
                            </span>
                            <Input
                              data-tour="tier-search"
                              placeholder={t("common.search")}
                              value={search}
                              onChange={(e) => {
                                setSearch(e.target.value);
                                setCurrentPage(1);
                              }}
                              className="pl-9 h-9 w-72 text-sm"
                            />
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          {[
                            { key: null, label: t("common.all"), icon: "group" },
                            { key: "active", label: t("common.active"), icon: "check_circle" },
                            { key: "draft", label: t("common.draft"), icon: "edit_note" },
                            { key: "inactive", label: t("common.inactive"), icon: "cancel" }
                          ].map(({ key, label, icon }) => (
                            <button
                              key={key ?? "all"}
                              onClick={() => {
                                setStatusFilter(key);
                                setCurrentPage(1);
                              }}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                statusFilter === key
                                  ? "bg-primary text-primary-foreground shadow-sm"
                                  : "bg-muted/50 text-muted-foreground hover:bg-muted border border-border"
                              }`}>
                              <span className="material-symbols-outlined text-sm">{icon}</span>
                              {label}
                            </button>
                          ))}
                          <span className="text-xs text-muted-foreground ml-auto">
                            {t("common.showing", {
                              start: filteredTiers.length > 0 ? (currentPage - 1) * limit + 1 : 0,
                              end: Math.min(currentPage * limit, filteredTiers.length),
                              total: filteredTiers.length
                            })}
                          </span>
                        </div>
                      </div>
                    }
                    pagination={{
                      page: currentPage,
                      totalPages,
                      total: filteredTiers.length,
                      onPageChange: setCurrentPage,
                      pageSize: limit,
                      onPageSizeChange: (v) => {
                        setLimit(v);
                        setCurrentPage(1);
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </>
      )}

      <Modal
        type="confirm"
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={t("page.memberTier.list.deleteModalTitle")}
        description={t("page.memberTier.list.deleteModalDescription")}
        confirmText={t("page.memberTier.list.deleteModalConfirm")}
        onConfirm={() => {
          if (deleteTarget) {
            deleteMutation.mutate({ id: deleteTarget.id || deleteTarget._id });
          }
        }}
      />
      {deleteMutation.isLoading && <Loading fullscreen size="lg" label={t("common.loadingData")} />}
    </div>
  );
};

export default MemberTier;
