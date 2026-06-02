/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { getAllMember, deleteMember } from "@/services/member";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loading } from "@/components/ui/loading";
import Modal from "@/components/organism/modal";
import { useTranslation } from "react-i18next";

const levelConfig = {
  platinum: {
    bg: "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground border border-primary/20",
    icon: "stars",
    label: "Platinum"
  },
  gold: {
    bg: "bg-tertiary/10 text-tertiary dark:bg-tertiary/20 dark:text-tertiary-foreground border border-tertiary/20",
    icon: "stars",
    label: "Gold"
  },
  silver: {
    bg: "bg-secondary/10 text-secondary dark:bg-secondary/20 dark:text-secondary-foreground border border-secondary/20",
    icon: "stars",
    label: "Silver"
  }
};

const getLevel = (level) => {
  return levelConfig[level?.toLowerCase()] || levelConfig.silver;
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
  const [levelFilter, setLevelFilter] = useState("");
  const [sortBy, setSortBy] = useState("terbaru");
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data, isLoading } = useQuery(
    ["members", page, limit, search, levelFilter, sortBy],
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

  const filteredMembers = levelFilter
    ? members.filter((m) => m.level?.toLowerCase() === levelFilter.toLowerCase())
    : members;

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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-card p-6 rounded-xl border border-border shadow-sm">
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                {t("page.member.list.filter")}
              </label>
              <div className="flex gap-2 flex-wrap">
                {["", "platinum", "gold", "silver"].map((level) => (
                  <button
                    key={level || "all"}
                    onClick={() => {
                      setLevelFilter(level);
                      setPage(1);
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                      levelFilter === level
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-muted/50 text-muted-foreground hover:bg-muted border border-border"
                    }`}>
                    {level ? level.charAt(0).toUpperCase() + level.slice(1) : "Semua Level"}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                {t("page.member.list.sort")}
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 w-full max-w-xs">
                <option value="terbaru">{t("page.member.list.sortNewest")}</option>
                <option value="poin">{t("page.member.list.sortPoints")}</option>
                <option value="nama">{t("page.member.list.sortName")}</option>
              </select>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 bg-primary text-primary-foreground p-6 rounded-xl shadow-md flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider opacity-80">
              {t("page.member.list.totalMembers")}
            </p>
            <p className="text-4xl font-bold leading-tight mt-1">{total.toLocaleString()}</p>
            <p className="text-xs font-semibold mt-2 flex items-center gap-1 text-secondary-foreground">
              <span className="material-symbols-outlined text-sm">trending_up</span>
              {t("page.member.list.growth")}
            </p>
          </div>
          <span className="material-symbols-outlined text-5xl opacity-20">group</span>
        </div>
      </div>

      <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
        <div className="px-6 py-5 border-b border-border flex justify-between items-center bg-muted/30">
          <h4 className="text-base font-semibold text-foreground">{t("page.member.list.title")}</h4>
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
                    const level = getLevel(member.level);
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
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${level.bg}`}>
                            <span
                              className="material-symbols-outlined text-sm"
                              style={{ fontVariationSettings: "'FILL' 1" }}>
                              {level.icon}
                            </span>
                            {level.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
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
