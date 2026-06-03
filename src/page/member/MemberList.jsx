/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Search, Plus, PackageOpen } from "lucide-react";
import { getAllMember, deleteMember } from "@/services/member";
import { getAllMemberTier } from "@/services/member-tier";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loading } from "@/components/ui/loading";
import Modal from "@/components/organism/modal";
import { useTranslation } from "react-i18next";

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
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState(null);
  const [sortBy, setSortBy] = useState("terbaru");
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data: tiersData } = useQuery(["member-tiers-all"], () => getAllMemberTier(), {
    staleTime: 5 * 60 * 1000
  });
  const tiers = tiersData?.data || tiersData?.tiers || [];

  const { data, isLoading } = useQuery(
    ["members", page, limit, search, tierFilter, sortBy],
    () => getAllMember({ page, limit, nameMember: search }),
    { keepPreviousData: true }
  );

  const deleteMutation = useMutation(deleteMember, {
    onSuccess: () => {
      toast.success("Berhasil", { description: "Member berhasil dihapus" });
      queryClient.invalidateQueries(["members"]);
    },
    onError: (err) => {
      toast.error("Gagal", {
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

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <nav className="flex gap-2 mb-2 text-sm text-muted-foreground" aria-label="breadcrumb">
            <span>{t("breadcrumb.home")}</span>
            <span>/</span>
            <span className="text-primary font-semibold">{t("breadcrumb.management")}</span>
            <span>/</span>
            <span className="text-primary font-semibold">{t("page.member.list.title")}</span>
          </nav>
          <h2 className="text-2xl font-bold text-foreground tracking-tight">
            {t("page.member.list.title")}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">{t("page.member.list.description")}</p>
        </div>
        <Button
          onClick={() => navigate("/add-member")}
          className="flex items-center gap-2 px-6 py-2.5 rounded-lg shadow-sm">
          <span className="material-symbols-outlined text-lg">person_add</span>
          {t("breadcrumb.add")}
        </Button>
      </div>

      <div className="bg-card rounded-xl border border-border p-4 flex flex-col md:flex-row gap-3 items-center">
        {tiers.length === 0 ? (
          <div className="flex items-center gap-3 w-full">
            <PackageOpen size={20} className="text-muted-foreground" />
            <span className="text-sm text-muted-foreground flex-1">
              Belum ada tier member. Buat tier terlebih dahulu untuk mengelompokkan member.
            </span>
            <Button
              onClick={() => navigate("/add-member-tier")}
              className="flex items-center gap-2 px-4 py-2 rounded-lg shadow-sm whitespace-nowrap">
              <Plus size={16} />
              Tambah Member Tier
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
                Semua
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
                {t("page.member.list.totalMembers")}: <strong>{total.toLocaleString()}</strong>
              </span>
            </div>
          </>
        )}
      </div>

      <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
        <div className="px-6 py-5 border-b border-border flex justify-between items-center bg-muted/30">
          <h4 className="text-base font-semibold text-foreground">{t("page.member.list.title")}</h4>
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
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

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loading />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/10">
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border">
                    {t("page.member.table.id")}
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border">
                    {t("page.member.table.name")}
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border">
                    {t("page.member.table.phone")}
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border">
                    {t("page.member.table.points")}
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border">
                    {t("page.member.table.level")}
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border text-right">
                    {t("page.member.table.actions")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredMembers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                      <span className="material-symbols-outlined text-4xl block mb-2">groups</span>
                      {t("page.member.list.empty")}
                    </td>
                  </tr>
                ) : (
                  filteredMembers.map((member) => {
                    const matchedTier = tiers.find((t) => Number(t.id) === Number(member.tier));
                    const tierName = matchedTier?.name || "-";
                    const levelStyle = matchedTier
                      ? { bg: "bg-primary/10 text-primary border border-primary/20", icon: "stars" }
                      : defaultLevel;
                    return (
                      <tr
                        key={member.id || member._id}
                        className="hover:bg-muted/20 transition-colors group">
                        <td className="px-6 py-4">
                          <span className="text-sm font-mono font-bold text-primary">
                            {member.memberId || member.code || "-"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-8 h-8 rounded-full ${avatarBg(member.name)} flex items-center justify-center text-xs font-bold`}>
                              {getInitials(member.name)}
                            </div>
                            <span className="text-sm font-semibold text-foreground">
                              {member.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          {member.phone || member.phoneNumber || "-"}
                        </td>
                        <td className="px-6 py-4 text-sm font-mono font-semibold text-foreground">
                          {(member.points ?? member.totalPoints ?? 0).toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${levelStyle.bg}`}>
                            <span
                              className="material-symbols-outlined text-sm"
                              style={{ fontVariationSettings: "'FILL' 1" }}>
                              {levelStyle.icon}
                            </span>
                            {tierName}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => navigate(`/edit-member?id=${member.id || member._id}`)}
                              className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                              title="Edit Member">
                              <span className="material-symbols-outlined text-lg">edit</span>
                            </button>
                            <button
                              className="p-1.5 text-muted-foreground hover:text-tertiary hover:bg-tertiary/10 rounded-lg transition-all"
                              title="Kelola Poin">
                              <span className="material-symbols-outlined text-lg">
                                account_balance_wallet
                              </span>
                            </button>
                            <button
                              onClick={() => handleDelete(member)}
                              className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all"
                              title="Hapus Member">
                              <span className="material-symbols-outlined text-lg">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="px-6 py-4 border-t border-border flex justify-between items-center bg-muted/10">
          <span className="text-xs text-muted-foreground">
            {t("page.member.list.showing", {
              count: filteredMembers.length,
              total: total.toLocaleString()
            })}
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page <= 1}
              className="p-2 rounded-lg hover:bg-muted text-muted-foreground disabled:opacity-30 transition-colors">
              <span className="material-symbols-outlined text-lg">chevron_left</span>
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`w-10 h-10 rounded-lg text-sm font-semibold transition-colors ${
                    page === pageNum
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted text-muted-foreground"
                  }`}>
                  {pageNum}
                </button>
              );
            })}
            {totalPages > 5 && (
              <>
                <span className="px-2 py-2 text-muted-foreground text-sm">...</span>
                <button
                  onClick={() => setPage(totalPages)}
                  className="w-10 h-10 rounded-lg hover:bg-muted text-muted-foreground text-sm font-semibold transition-colors">
                  {totalPages}
                </button>
              </>
            )}
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages}
              className="p-2 rounded-lg hover:bg-muted text-muted-foreground disabled:opacity-30 transition-colors">
              <span className="material-symbols-outlined text-lg">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      <Modal
        type="confirm"
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={t("modal.confirmDelete")}
        confirmText="Ya, Hapus"
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default MemberList;
