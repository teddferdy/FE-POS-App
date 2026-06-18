/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useCookies } from "react-cookie";
import { toast } from "sonner";
import { Plus, PackageOpen } from "lucide-react";
import { getAllMember, deleteMember } from "@/services/member";
import { getAllMemberTier } from "@/services/member-tier";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PageHeader from "@/components/ui/PageHeader";
import UserGuide from "@/components/organism/UserGuide";
import AbortController from "@/components/organism/abort-controller";
import Modal from "@/components/organism/modal";
import DataTable from "@/components/ui/DataTable";
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
  const MENU_KEY = "/member-list";
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState(null);
  const [sortBy, setSortBy] = useState("terbaru");
  const [deleteTarget, setDeleteTarget] = useState(null);

  const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.05 } }
  };
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  const { data: tiersData } = useQuery(["member-tiers-all"], () => getAllMemberTier(), {
    staleTime: 5 * 60 * 1000
  });
  const tiers = tiersData?.data || tiersData?.tiers || [];

  const { data, isLoading, isError, refetch } = useQuery(
    ["members", page, limit, search, tierFilter, sortBy],
    () => getAllMember({ page, limit, nameMember: search }),
    { keepPreviousData: true }
  );

  const deleteMutation = useMutation(deleteMember, {
    onSuccess: () => {
      toast.success(t("page.member.list.toastSuccess"), {
        description: t("page.member.list.toastSuccessDesc")
      });
      queryClient.invalidateQueries(["members"]);
    },
    onError: (err) => {
      toast.error(t("page.member.list.toastError"), {
        description: err?.response?.data?.message || err.message
      });
    }
  });

  const members = data?.data || data?.members || [];
  const total = data?.total || data?.pagination?.total || 0;
  const totalPages = data?.pagination?.totalPages || Math.ceil(total / limit) || 1;

  const filteredMembers =
    tierFilter != null ? members.filter((m) => Number(m.tier) === tierFilter) : members;

  const handleDelete = (member) => {
    setDeleteTarget(member);
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      deleteMutation.mutate({ id: deleteTarget.id || deleteTarget._id });
      setDeleteTarget(null);
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
        const matchedTier = tiers.find((t) => Number(t.id) === Number(member.tier));
        const tierName = matchedTier?.name || "-";
        const levelStyle = matchedTier
          ? { bg: "bg-primary/10 text-primary border border-primary/20", icon: "stars" }
          : defaultLevel;
        return (
          <span
            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${levelStyle.bg}`}>
            <span
              className="material-symbols-outlined text-sm"
              style={{ fontVariationSettings: "'FILL' 1" }}>
              {levelStyle.icon}
            </span>
            {tierName}
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
      header: t("common.modifiedBy"),
      render: (item) => (
        <span className="text-sm text-muted-foreground">
          {item.modifiedByUser?.fullName || item.modifiedByUser?.userName || item.modifiedBy || "-"}
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
      align: "right",
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
        <div>
          <PageHeader
            breadcrumbs={[{ i18nKey: "breadcrumb.home" }, { i18nKey: "page.member.list.title" }]}
            title={t("page.member.list.title")}
            description={t("page.member.list.description")}>
            {canAccess(user, MENU_KEY, "add") && (
              <Button
                data-tour="member-add"
                onClick={() => navigate("/add-member")}
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg shadow-sm">
                <span className="material-symbols-outlined text-lg">person_add</span>
                {t("breadcrumb.add")}
              </Button>
            )}
          </PageHeader>
        </div>
      </div>

      {isError ? (
        <AbortController refetch={refetch} />
      ) : (
        <div>
          <div>
            <div
              data-tour="member-search"
              className="bg-card rounded-xl border border-border p-4 flex flex-col md:flex-row gap-3 items-center">
              {tiers.length === 0 ? (
                <div className="flex items-center gap-3 w-full">
                  <PackageOpen size={20} className="text-muted-foreground" />
                  <span className="text-sm text-muted-foreground flex-1">
                    {t("page.member.list.noTier")}
                  </span>
                  <Button
                    onClick={() => navigate("/add-member-tier")}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg shadow-sm whitespace-nowrap">
                    <Plus size={16} />
                    {t("page.member.list.addMemberTier")}
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 flex-1 flex-wrap">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mr-1 whitespace-nowrap">
                      {t("page.member.list.filter")}
                    </span>
                    <button
                      onClick={() => {
                        setTierFilter(null);
                        setPage(1);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        tierFilter == null
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "bg-muted/50 text-muted-foreground hover:bg-muted border border-border"
                      }`}>
                      {t("common.all")}
                    </button>
                    {tiers.map((tier) => (
                      <button
                        key={tier.id || tier._id}
                        onClick={() => {
                          setTierFilter(tier.id);
                          setPage(1);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                          tierFilter === tier.id
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "bg-muted/50 text-muted-foreground hover:bg-muted border border-border"
                        }`}>
                        {tier.name}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 w-full md:w-auto">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="flex-1 md:w-40 h-9 px-3 bg-background border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none">
                      <option value="terbaru">{t("page.member.list.sortNewest")}</option>
                      <option value="poin">{t("page.member.list.sortPoints")}</option>
                      <option value="nama">{t("page.member.list.sortName")}</option>
                    </select>
                    <span className="text-xs text-muted-foreground whitespace-nowrap hidden md:block">
                      {t("page.member.list.totalMembers")}:{" "}
                      <strong>{total.toLocaleString()}</strong>
                    </span>
                  </div>
                </>
              )}
            </div>

            <div data-tour="member-table" className="mt-6">
              <DataTable
                columns={columns}
                data={filteredMembers}
                isLoading={isLoading}
                emptyMessage={t("page.member.list.empty")}
                toolbar={
                  <div className="flex items-center justify-between w-full">
                    <h4 className="text-base font-semibold text-foreground">
                      {t("page.member.list.title")}
                    </h4>
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
                }
                pagination={{ page, totalPages, total, onPageChange: setPage }}
                rowClassName={() => "group"}
              />
            </div>
          </div>
        </div>
      )}

      <Modal
        type="confirm"
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={t("modal.confirmDelete")}
        confirmText={t("page.member.list.deleteConfirm")}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default MemberList;
