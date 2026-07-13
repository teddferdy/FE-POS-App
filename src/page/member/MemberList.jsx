/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { useGlobalStoreFilter } from "@/hooks/useGlobalStoreFilter";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useCookies } from "react-cookie";
import { toast } from "sonner";
import { Users, CheckCircle, FileEdit, XCircle } from "lucide-react";
import StatCard from "@/components/ui/StatCard";
import { getAllMember, deleteMember } from "@/services/member";
import { getAllMemberTier } from "@/services/member-tier";
import { getAllLocation } from "@/services/location";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import UserGuide from "@/components/organism/UserGuide";
import AbortController from "@/components/organism/abort-controller";
import { Loading } from "@/components/ui/loading";
import { Skeleton } from "@/components/ui/skeleton";
import Modal from "@/components/organism/modal";
import DataTable from "@/components/ui/DataTable";
import NoStore from "@/components/ui/NoStore";
import StoreFilter from "@/components/ui/StoreFilter";
import { useTranslation } from "react-i18next";
import { canAccess } from "@/utils/permission";

const defaultLevel = {
  bg: "bg-muted/30 text-muted-foreground border border-border",
  icon: "stars"
};

const getInitials = (name) => {
  if (!name) return "?";
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const avatarBg = (name) => {
  const colors = [
    "bg-blue-100 text-blue-700",
    "bg-green-100 text-green-700",
    "bg-purple-100 text-purple-700",
    "bg-amber-100 text-amber-700",
    "bg-pink-100 text-pink-700",
    "bg-cyan-100 text-cyan-700"
  ];
  let hash = 0;
  for (let i = 0; i < (name || "").length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

const MemberList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const [cookie] = useCookies();
  const user = cookie?.user;
  const isSuperAdmin = user?.roleType === "super_admin";
  const MENU_KEY = "/member-list";
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);
  const [sortBy, setSortBy] = useState("terbaru");
  const [storeFilter, setGlobalStoreFilter] = useGlobalStoreFilter();
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data: locData, isLoading: isLoadingLocations } = useQuery(["locations-members"], () => getAllLocation(), {
    enabled: isSuperAdmin
  });

  const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.05 } }
  };
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  const { data: tiersData, isLoading: tiersLoading } = useQuery(
    ["member-tiers-active"],
    () => getAllMemberTier({ status: "active" }),
    {}
  );
  const tiers = tiersData?.data || tiersData?.tiers || [];

  const store = storeFilter !== "all" ? storeFilter : undefined;
  const { data, isLoading, isError, refetch } = useQuery(
    ["members", page, limit, search, tierFilter, statusFilter, sortBy, store, storeFilter],
    () =>
      getAllMember({
        page,
        limit,
        nameMember: search,
        store,
        tier: tierFilter != null ? tierFilter : undefined,
        statusMember: statusFilter || undefined
      }),
    {}
  );

  const deleteMutation = useMutation(deleteMember, {
    onSuccess: () => {
      toast.success(t("common.success"), {
        description: t("page.member.list.deleteSuccess") || "Member berhasil dihapus"
      });
      queryClient.invalidateQueries(["members"]);
      setDeleteTarget(null);
    },
    onError: (err) => {
      toast.error(t("common.error"), { description: err.message });
      setDeleteTarget(null);
    }
  });

  const members = data?.data || data?.members || [];
  const total = data?.total || data?.pagination?.total || 0;
  const totalPages = data?.pagination?.totalPages || Math.ceil(total / limit) || 1;
  const stats = data?.stats || { total: 0, active: 0, draft: 0, inactive: 0 };

  const handleDelete = (member) => {
    setDeleteTarget(member);
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      deleteMutation.mutate({ id: deleteTarget.id || deleteTarget._id });
    }
  };

  const columns = [
    {
      header: "#",
      render: (member, idx) => (
        <span className="text-sm font-mono text-muted-foreground">
          {(page - 1) * limit + idx + 1}
        </span>
      )
    },
    {
      header: t("page.member.table.name"),
      render: (member) => (
        <div className="flex items-center gap-3">
          <div
            className={`w-8 h-8 rounded-full ${avatarBg(member.name)} flex items-center justify-center text-xs font-bold`}>
            {getInitials(member.name)}
          </div>
          <span className="text-sm font-semibold text-foreground">{member.name}</span>
        </div>
      )
    },
    {
      header: t("page.member.table.phone"),
      render: (member) => (
        <span className="text-sm text-muted-foreground">
          {member.phone || member.phoneNumber || "-"}
        </span>
      )
    },
    {
      header: t("page.member.table.points"),
      render: (member) => (
        <span className="text-sm font-mono font-semibold text-foreground">
          {(member.points ?? member.totalPoints ?? 0).toLocaleString()}
        </span>
      )
    },
    {
      header: t("page.member.table.level"),
      render: (member) => {
        const pts = member.totalPoints || member.points || 0;
        const activeTiers = tiers.filter((t) => t.status === "active");
        const exact = activeTiers.find((t) => pts >= t.minPoints && pts <= t.maxPoints);
        const matchedTier =
          exact ||
          activeTiers
            .filter((t) => t.minPoints <= pts)
            .sort((a, b) => b.minPoints - a.minPoints)[0] ||
          null;
        const tierName = matchedTier?.name || "-";
        const color = matchedTier?.color;
        return (
          <span
            className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold"
            style={
              color
                ? {
                    backgroundColor: color + "20",
                    color,
                    border: `1px solid ${color}40`
                  }
                : {
                    backgroundColor: "rgb(0 0 0 / 0.03)",
                    color: "rgb(0 0 0 / 0.5)",
                    border: "1px solid rgb(0 0 0 / 0.08)"
                  }
            }>
            {matchedTier && (
              <span
                className="material-symbols-outlined text-sm"
                style={{ fontVariationSettings: "'FILL' 1" }}>
                stars
              </span>
            )}
            {tierName}
          </span>
        );
      }
    },
    {
      header: t("page.member.table.status"),
      render: (member) => {
        const status = member.status || "active";
        const isActive = status === "active";
        const isInactive = status === "inactive";
        const isDraft = status === "draft";
        const badgeClass = isActive
          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
          : isInactive
            ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
            : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400";
        const icon = isActive ? "check_circle" : isInactive ? "cancel" : "drafts";
        return (
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${badgeClass}`}>
            <span
              className="material-symbols-outlined text-sm"
              style={{ fontVariationSettings: "'FILL' 1" }}>
              {icon}
            </span>
            {isActive ? t("common.active") : isInactive ? t("common.inactive") : t("common.draft")}
          </span>
        );
      }
    },
    {
      header: t("common.createdBy"),
      render: (item) => (
        <span className="text-sm text-muted-foreground">
          {item.createdByUser?.fullName || item.createdByUser?.userName || item.createdBy || "-"}
        </span>
      )
    },
    {
      header: t("page.member.table.createdAt"),
      render: (item) => (
        <span className="text-sm text-muted-foreground">
          {item.createdAt
            ? new Date(item.createdAt).toLocaleString("id-ID", {
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
      header: t("common.modifiedBy"),
      render: (item) => (
        <span className="text-sm text-muted-foreground">
          {item.modifiedByUser?.fullName || item.modifiedByUser?.userName || item.modifiedBy || "-"}
        </span>
      )
    },
    {
      header: t("page.member.table.updatedAt"),
      render: (item) => (
        <span className="text-sm text-muted-foreground">
          {item.updatedAt
            ? new Date(item.updatedAt).toLocaleString("id-ID", {
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
      header: t("page.member.table.actions"),
      align: "center",
      stickyRight: true,
      render: (member) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/detail-member?id=${member.id || member._id}`);
            }}
            className="p-1.5 text-muted-foreground hover:text-blue-600 hover:bg-blue-100/50 rounded-lg transition-all"
            title={t("page.member.list.detailTitle")}>
            <span className="material-symbols-outlined text-lg">visibility</span>
          </button>
          {canAccess(user, MENU_KEY, "edit") && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/edit-member?id=${member.id || member._id}`);
              }}
              className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
              title={t("page.member.list.editTitle")}>
              <span className="material-symbols-outlined text-lg">edit</span>
            </button>
          )}
          {canAccess(user, MENU_KEY, "edit") && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/member-point-history?id=${member.id || member._id}`);
              }}
              className="p-1.5 text-muted-foreground hover:text-tertiary hover:bg-tertiary/10 rounded-lg transition-all"
              title={t("page.member.list.managePoints")}>
              <span className="material-symbols-outlined text-lg">account_balance_wallet</span>
            </button>
          )}
          {canAccess(user, MENU_KEY, "delete") && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(member);
              }}
              className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all"
              title={t("page.member.list.deleteTitle")}>
              <span className="material-symbols-outlined text-lg">delete</span>
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div data-tour="page-member" className="space-y-6">
      <div>
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <button
            onClick={() => navigate("/dashboard-super-admin")}
            className="hover:text-foreground transition-colors">
            {t("breadcrumb.home")}
          </button>
          <span className="text-xs">/</span>
          <span className="text-primary font-semibold">{t("page.member.list.title")}</span>
        </nav>
      </div>

      <div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{t("page.member.list.title")}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {t("page.member.list.description")}
            </p>
          </div>
          {canAccess(user, MENU_KEY, "add") && (
            <Button
              data-tour="member-add"
              onClick={() => navigate("/add-member")}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg shadow-sm">
              <span className="material-symbols-outlined text-lg">person_add</span>
              {t("breadcrumb.add")}
            </Button>
          )}
        </div>
      </div>

      {locData && (locData?.data || []).length === 0 ? (
        <NoStore />
      ) : (
        <>
          {!isError &&
            (isLoading ? (
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
                  label={t("page.member.list.totalMembers")}
                  value={stats.total}
                  icon={Users}
                  variant="default"
                />
                <StatCard
                  label={t("common.active")}
                  value={stats.active}
                  icon={CheckCircle}
                  variant="active"
                />
                <StatCard
                  label={t("common.draft")}
                  value={stats.draft}
                  icon={FileEdit}
                  variant="draft"
                />
                <StatCard
                  label={t("common.inactive")}
                  value={stats.inactive}
                  icon={XCircle}
                  variant="red"
                />
              </div>
            ))}

          {isError ? (
            <AbortController refetch={refetch} />
          ) : (
            <div>
              <div>
                <div
                  data-tour="member-search"
                  className="bg-card rounded-xl border border-border p-5">
                  {tiersLoading ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-4 rounded" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {[...Array(4)].map((_, i) => (
                          <Skeleton key={i} className="h-8 w-20 rounded-lg" />
                        ))}
                      </div>
                    </div>
                  ) : (
                    tiers.length > 0 && (
                      <>
                        <div className="flex items-center gap-2 mb-4">
                          <span className="material-symbols-outlined text-primary text-lg">
                            filter_alt
                          </span>
                          <h3 className="text-sm font-semibold text-foreground">
                            {t("page.member.list.filter")}
                          </h3>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          {[
                            { key: null, label: t("common.all"), icon: "group" },
                            { key: "draft", label: t("common.draft"), icon: "edit_note" },
                            { key: "inactive", label: t("common.inactive"), icon: "cancel" }
                          ].map(({ key, label, icon }) => (
                            <button
                              key={key ?? "all"}
                              onClick={() => {
                                setStatusFilter(key);
                                setPage(1);
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
                        </div>

                        {tiers.length > 0 && (
                          <>
                            <div className="border-t border-border my-4" />
                            <div className="flex flex-wrap items-center gap-2">
                              {tiers.map((tier) => (
                                <button
                                  key={tier.id || tier._id}
                                  onClick={() => {
                                    setTierFilter(tierFilter === tier.id ? null : tier.id);
                                    setPage(1);
                                  }}
                                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                    tierFilter === tier.id
                                      ? "text-white shadow-sm"
                                      : "bg-muted/50 text-muted-foreground hover:bg-muted border border-border"
                                  }`}
                                  style={
                                    tierFilter === tier.id
                                      ? { backgroundColor: tier.color || "#6366f1" }
                                      : undefined
                                  }>
                                  <span
                                    className="w-2 h-2 rounded-full"
                                    style={{ backgroundColor: tier.color || "#6366f1" }}
                                  />
                                  {tier.name}
                                </button>
                              ))}
                            </div>
                          </>
                        )}

                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-muted-foreground text-sm">
                              sort
                            </span>
                            <span className="text-xs text-muted-foreground hidden sm:inline">
                              {t("page.member.list.sort")}
                            </span>
                            <select
                              value={sortBy}
                              onChange={(e) => {
                                setSortBy(e.target.value);
                                setPage(1);
                              }}
                              className="h-8 px-2 bg-background border border-border rounded-lg text-xs focus:ring-2 focus:ring-primary focus:border-primary outline-none">
                              <option value="terbaru">{t("page.member.list.sortNewest")}</option>
                              <option value="poin">{t("page.member.list.sortPoints")}</option>
                              <option value="nama">{t("page.member.list.sortName")}</option>
                            </select>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-muted-foreground text-sm">
                              people
                            </span>
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {t("page.member.list.totalMembers")}:{" "}
                              <strong>{total.toLocaleString()}</strong>
                            </span>
                          </div>
                        </div>
                      </>
                    )
                  )}
                </div>

                <div data-tour="member-table" className="mt-6">
                  <DataTable
                    columns={columns}
                    data={members}
                    isLoading={isLoading}
                    emptyMessage={t("page.member.list.empty")}
                    toolbar={
                      isLoadingLocations ? (
                        <div className="flex items-center justify-between w-full">
                          <Skeleton className="h-6 w-32" />
                          <Skeleton className="h-9 w-48 rounded-md" />
                          <Skeleton className="h-9 w-72 rounded-md" />
                        </div>
                      ) : (
                        <div className="flex items-center justify-between w-full">
                          <h4 className="text-base font-semibold text-foreground">
                            {t("page.member.list.title")}
                          </h4>
                          {isSuperAdmin && (
                            <StoreFilter
                              locations={locData?.data || []}
                              value={storeFilter}
                              onChange={(v) => {
                                setGlobalStoreFilter(v);
                                setPage(1);
                              }}
                              isSuperAdmin={isSuperAdmin}
                              t={t}
                            />
                          )}
                          <div className="relative">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-base">
                              search
                            </span>
                            <Input
                              placeholder={t("page.member.list.search")}
                              value={search}
                              onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1);
                              }}
                              className="pl-9 h-9 w-72 text-sm"
                            />
                          </div>
                        </div>
                      )
                    }
                    pagination={{
                      page,
                      totalPages,
                      total,
                      onPageChange: setPage,
                      pageSize: limit,
                      onPageSizeChange: (v) => {
                        setLimit(v);
                        setPage(1);
                      }
                    }}
                    rowClassName={() => "group"}
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
        title={t("page.member.modal.deleteTitle")}
        description={t("page.member.modal.deleteDesc")}
        confirmText={t("page.member.modal.deleteConfirm")}
        loading={deleteMutation.isLoading}
        onConfirm={confirmDelete}
      />
      {deleteMutation.isLoading && <Loading fullscreen size="lg" label={t("common.loadingData")} />}
    </div>
  );
};

export default MemberList;
