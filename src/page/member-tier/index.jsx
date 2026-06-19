import React, { useState } from "react";
import { Award, Plus, Users, TrendingUp, ArrowLeft, PackageOpen } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { toast } from "sonner";
import { getAllMemberTier, editMemberTier, deleteMemberTier } from "@/services/member-tier";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import EditMemberTier from "./EditMemberTier";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PageHeader from "@/components/ui/PageHeader";
import Modal from "@/components/organism/modal";
import DataTable from "@/components/ui/DataTable";
import { canAccess } from "@/utils/permission";
import AbortController from "@/components/organism/abort-controller";

const MemberTier = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [cookie] = useCookies();
  const user = cookie?.user;
  const MENU_KEY = "/member-tier";
  const [currentPage, setCurrentPage] = useState(1);
  const [editingTier, setEditingTier] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [search, setSearch] = useState("");
  const itemsPerPage = 5;
  const {
    data: tiersData,
    isLoading,
    isError,
    refetch
  } = useQuery(["member-tiers"], getAllMemberTier);
  const tiers = tiersData?.data || tiersData?.tiers || [];
  const activeTierCount =
    tiersData?.activeCount ??
    tiers.filter((t) => t.status === "active" || t.status === true).length;

  const filteredTiers = tiers.filter((tier) =>
    tier.name?.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filteredTiers.length / itemsPerPage);
  const paginatedTiers = filteredTiers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const editMutation = useMutation(editMemberTier, {
    onSuccess: () => {
      toast.success(t("page.memberTier.list.toastUpdateSuccess"), {
        description: t("page.memberTier.list.toastUpdateDesc")
      });
      queryClient.invalidateQueries(["member-tiers"]);
      setEditingTier(null);
    },
    onError: (err) =>
      toast.error(t("page.memberTier.list.toastError"), {
        description: err?.response?.data?.message || err.message
      })
  });

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

  const handleSaveEdit = (formData) => {
    editMutation.mutate({
      id: editingTier.id,
      name: formData.tierName,
      minPoints: formData.minPoints === "" ? 0 : Number(formData.minPoints),
      maxPoints: formData.maxPoints === "" ? 999999 : Number(formData.maxPoints),
      discountPercent: formData.discountPercent === "" ? 0 : Number(formData.discountPercent),
      benefits: formData.perks.map((p) => p.text).filter((t) => t.trim() !== ""),
      status: formData.isActive ? "active" : "inactive",
      color: formData.selectedColor
    });
  };

  const statusBadge = (status) => {
    const isActive = status === "active" || status === true;
    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
          isActive
            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
            : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
        }`}>
        <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-green-500" : "bg-red-500"}`} />
        {isActive ? t("common.active") : t("common.inactive")}
      </span>
    );
  };

  const columns = [
    {
      header: "#",
      render: (tier, idx) => (
        <span className="font-mono text-sm text-muted-foreground">
          {(currentPage - 1) * itemsPerPage + idx + 1}
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
      header: t("page.memberTier.table.discount"),
      render: (tier) => (
        <span className="font-mono text-sm text-primary font-semibold">
          {tier.discount ? `${tier.discount}%` : "-"}
        </span>
      )
    },
    {
      header: t("page.memberTier.table.benefits"),
      render: (tier) => (
        <div className="flex flex-wrap gap-1">
          {(tier.benefits || []).map((benefit, idx) => (
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
      align: "right",
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
                setEditingTier(tier);
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
    <div>
      {editingTier ? (
        <div className="space-y-4">
          <button
            onClick={() => setEditingTier(null)}
            className="flex items-center gap-2 text-primary hover:underline transition-all">
            <ArrowLeft size={20} />
            <span className="font-medium">{t("page.memberTier.list.backToList")}</span>
          </button>
          <EditMemberTier
            tier={editingTier}
            onClose={() => setEditingTier(null)}
            onSave={handleSaveEdit}
            onDelete={(tierId) => setDeleteTarget(tierId)}
          />
        </div>
      ) : (
        <div data-tour="page-member-tier" className="space-y-6">
          <div>
            <div>
              <PageHeader
                breadcrumbs={[
                  { i18nKey: "breadcrumb.home" },
                  { i18nKey: "breadcrumb.management" },
                  { i18nKey: "page.memberTier.list.title" }
                ]}
                title={t("page.memberTier.list.title")}
                description={t("page.memberTier.list.description")}>
                {canAccess(user, MENU_KEY, "add") && (
                  <Button onClick={() => navigate("/add-member-tier")} className="gap-2">
                    <Plus size={18} />
                    {t("page.memberTier.list.addTier")}
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div
                    data-tour="tier-stat-active"
                    className="bg-card p-5 rounded-xl shadow-sm border border-border group hover:border-primary/30 transition-all">
                    <div className="flex justify-between items-start mb-3">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                        <Award size={24} />
                      </div>
                      <span className="text-secondary font-mono flex items-center gap-1">
                        <Award size={16} /> +{tiers.length}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {t("page.memberTier.list.totalTiers")}
                    </p>
                    <h3 className="text-xl font-bold mt-1">
                      {activeTierCount} {t("page.memberTier.list.active")}
                    </h3>
                    <div className="mt-3 h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary w-2/3" />
                    </div>
                  </div>
                  <div
                    data-tour="tier-stat-members"
                    className="bg-card p-5 rounded-xl shadow-sm border border-border group hover:border-primary/30 transition-all">
                    <div className="flex justify-between items-start mb-3">
                      <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary">
                        <Users size={24} />
                      </div>
                      <span className="text-secondary font-mono flex items-center gap-1">
                        <TrendingUp size={16} />
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {t("page.memberTier.list.totalMembers")}
                    </p>
                    <h3 className="text-xl font-bold mt-1">{tiers.length}</h3>
                    <p className="text-xs text-muted-foreground mt-2">
                      {t("page.memberTier.list.acrossTiers")}
                    </p>
                  </div>
                  <div
                    data-tour="tier-stat-growth"
                    className="bg-card p-5 rounded-xl shadow-sm border border-border group hover:border-primary/30 transition-all">
                    <div className="flex justify-between items-start mb-3">
                      <div className="w-12 h-12 rounded-lg bg-tertiary/10 flex items-center justify-center text-tertiary">
                        <TrendingUp size={24} />
                      </div>
                      <span className="text-tertiary font-mono">
                        {tiers.length > 0 ? tiers[0].name?.toUpperCase() : "-"}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {t("page.memberTier.list.highestGrowth")}
                    </p>
                    <h3 className="text-xl font-bold mt-1">{t("page.memberTier.list.members")}</h3>
                    <p className="text-xs text-muted-foreground mt-2">
                      {t("page.memberTier.list.conversions")}
                    </p>
                  </div>
                </div>

                {tiers.length === 0 ? (
                  <div className="bg-card rounded-xl border border-border p-12 text-center mt-6">
                    <PackageOpen size={48} className="mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">{t("page.memberTier.list.noTier")}</p>
                    <Button onClick={() => navigate("/add-member-tier")} className="mt-4">
                      <Plus size={16} className="mr-2" />
                      {t("page.memberTier.list.addTier")}
                    </Button>
                  </div>
                ) : (
                  <div data-tour="tier-table" className="mt-6">
                    <DataTable
                      columns={columns}
                      data={paginatedTiers}
                      isLoading={isLoading}
                      rowClassName={() => "group"}
                      toolbar={
                        <div className="flex items-center justify-between w-full">
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
                      }
                      pagination={{
                        page: currentPage,
                        totalPages,
                        total: filteredTiers.length,
                        onPageChange: setCurrentPage,
                        showingText: `${t("common.showing", {
                          start: (currentPage - 1) * itemsPerPage + 1,
                          end: Math.min(currentPage * itemsPerPage, filteredTiers.length),
                          total: filteredTiers.length
                        })}`
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      <Modal
        type="confirm"
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={t("page.memberTier.list.deleteModalTitle")}
        confirmText={t("page.memberTier.list.deleteModalConfirm")}
        onConfirm={() => {
          if (deleteTarget) {
            deleteMutation.mutate({ id: deleteTarget.id || deleteTarget._id });
          }
        }}
      />
    </div>
  );
};

export default MemberTier;
