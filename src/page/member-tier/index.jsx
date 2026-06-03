import React, { useState } from "react";
import {
  Award,
  Plus,
  Edit,
  Delete,
  Users,
  TrendingUp,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  PackageOpen
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { toast } from "sonner";
import {
  getAllMemberTier,
  addMemberTier,
  editMemberTier,
  deleteMemberTier
} from "@/services/member-tier";
import AddMemberTier from "./AddMemberTier";
import EditMemberTier from "./EditMemberTier";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/loading";
import Modal from "@/components/organism/modal";

const MemberTier = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTier, setEditingTier] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const itemsPerPage = 5;

  const { data: tiersData, isLoading } = useQuery(["member-tiers"], getAllMemberTier);
  const tiers = tiersData?.data || tiersData?.tiers || [];
  const totalPages = Math.ceil(tiers.length / itemsPerPage);
  const paginatedTiers = tiers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const addMutation = useMutation(addMemberTier, {
    onSuccess: () => {
      toast.success("Berhasil", { description: "Tier berhasil ditambahkan" });
      queryClient.invalidateQueries(["member-tiers"]);
      setShowAddForm(false);
    },
    onError: (err) =>
      toast.error("Gagal", { description: err?.response?.data?.message || err.message })
  });

  const editMutation = useMutation(editMemberTier, {
    onSuccess: () => {
      toast.success("Berhasil", { description: "Tier berhasil diperbarui" });
      queryClient.invalidateQueries(["member-tiers"]);
      setEditingTier(null);
    },
    onError: (err) =>
      toast.error("Gagal", { description: err?.response?.data?.message || err.message })
  });

  const deleteMutation = useMutation(deleteMemberTier, {
    onSuccess: () => {
      toast.success("Berhasil", { description: "Tier berhasil dihapus" });
      queryClient.invalidateQueries(["member-tiers"]);
      setDeleteTarget(null);
    },
    onError: (err) =>
      toast.error("Gagal", { description: err?.response?.data?.message || err.message })
  });

  const handleSaveAdd = (formData) => {
    addMutation.mutate({
      name: formData.tierName,
      minPoints: formData.minPoints === "" ? 0 : Number(formData.minPoints),
      discountPercent: formData.discountPercent === "" ? 0 : Number(formData.discountPercent),
      benefits: formData.perks.map((p) => p.text).filter((t) => t.trim() !== ""),
      status: formData.isActive,
      color: formData.selectedColor
    });
  };

  const handleSaveEdit = (formData) => {
    editMutation.mutate({
      id: editingTier.id,
      name: formData.tierName,
      minPoints: formData.minPoints === "" ? 0 : Number(formData.minPoints),
      discountPercent: formData.discountPercent === "" ? 0 : Number(formData.discountPercent),
      benefits: formData.perks.map((p) => p.text).filter((t) => t.trim() !== ""),
      status: formData.isActive,
      color: formData.selectedColor
    });
  };

  const statusBadge = (status) => {
    const isActive = status === "active" || status === true;
    const styles = isActive
      ? "bg-secondary/10 text-secondary border-secondary/20"
      : "bg-outline-variant/20 text-outline border-outline-variant/30";
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${styles}`}>
        {isActive ? "Active" : "Inactive"}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loading />
      </div>
    );
  }

  return (
    <div>
      {editingTier ? (
        <div className="space-y-4">
          <button
            onClick={() => setEditingTier(null)}
            className="flex items-center gap-2 text-primary hover:underline transition-all">
            <ArrowLeft size={20} />
            <span className="font-medium">Kembali ke Daftar Tier</span>
          </button>
          <EditMemberTier
            tier={editingTier}
            onClose={() => setEditingTier(null)}
            onSave={handleSaveEdit}
            onDelete={(tierId) => setDeleteTarget(tierId)}
          />
        </div>
      ) : showAddForm ? (
        <div className="space-y-4">
          <button
            onClick={() => setShowAddForm(false)}
            className="flex items-center gap-2 text-primary hover:underline transition-all">
            <ArrowLeft size={20} />
            <span className="font-medium">Kembali ke Daftar Tier</span>
          </button>
          <AddMemberTier onClose={() => setShowAddForm(false)} onSave={handleSaveAdd} />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-end">
            <div>
              <nav
                className="flex gap-2 mb-2 text-sm text-muted-foreground"
                aria-label="breadcrumb">
                <span>{t("breadcrumb.home")}</span>
                <span>/</span>
                <span className="text-primary font-semibold">{t("breadcrumb.management")}</span>
                <span>/</span>
                <span className="text-primary font-semibold">
                  {t("page.memberTier.list.title")}
                </span>
              </nav>
              <h2 className="text-2xl font-bold text-foreground tracking-tight">
                {t("page.memberTier.list.title")}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {t("page.memberTier.list.description")}
              </p>
            </div>
            <Button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg shadow-sm">
              <Plus size={18} />
              {t("breadcrumb.add")}
            </Button>
          </div>

          {tiers.length === 0 ? (
            <div className="bg-card rounded-xl border border-border p-12 text-center">
              <PackageOpen size={48} className="mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Belum ada tier member.</p>
              <Button onClick={() => setShowAddForm(true)} className="mt-4">
                <Plus size={16} className="mr-2" />
                Tambah Tier
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-card p-5 rounded-xl shadow-sm border border-border group hover:border-primary/30 transition-all">
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
                    {tiers.filter((t) => t.isActive || t.status === "active").length}{" "}
                    {t("page.memberTier.list.active")}
                  </h3>
                  <div className="mt-3 h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-2/3" />
                  </div>
                </div>
                <div className="bg-card p-5 rounded-xl shadow-sm border border-border group hover:border-primary/30 transition-all">
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
                <div className="bg-card p-5 rounded-xl shadow-sm border border-border group hover:border-primary/30 transition-all">
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

              <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
                <div className="px-6 py-5 border-b border-border flex justify-between items-center bg-muted/30">
                  <h4 className="text-base font-semibold text-foreground">
                    {t("page.memberTier.list.tableTitle")}
                  </h4>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-muted/10">
                        <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border">
                          {t("page.memberTier.table.id")}
                        </th>
                        <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border">
                          {t("page.memberTier.table.name")}
                        </th>
                        <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border">
                          {t("page.memberTier.table.minPoints")}
                        </th>
                        <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border">
                          {t("page.memberTier.table.discount")}
                        </th>
                        <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border">
                          {t("page.memberTier.table.benefits")}
                        </th>
                        <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border">
                          {t("page.memberTier.table.members")}
                        </th>
                        <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border">
                          {t("page.memberTier.table.status")}
                        </th>
                        <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border text-right">
                          {t("page.memberTier.table.actions")}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {paginatedTiers.map((tier) => {
                        return (
                          <tr
                            key={tier.id || tier._id}
                            className="hover:bg-muted/20 transition-colors group">
                            <td className="px-6 py-4 font-mono text-sm text-muted-foreground">
                              {tier.id || tier._id}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-2 h-8 rounded-full"
                                  style={{ backgroundColor: tier.color || "#f59e0b" }}
                                />
                                <span className="font-semibold text-foreground">{tier.name}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 font-mono text-sm text-foreground">
                              {tier.minPoints?.toLocaleString?.() || tier.minPoints || 0}
                            </td>
                            <td className="px-6 py-4 font-mono text-sm text-primary font-semibold">
                              {tier.discount ? `${tier.discount}%` : "-"}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-wrap gap-1">
                                {(tier.benefits || []).map((benefit, idx) => (
                                  <span
                                    key={idx}
                                    className="bg-primary/10 px-2 py-0.5 rounded text-[10px] font-bold text-primary">
                                    {benefit}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="px-6 py-4 font-mono text-sm text-foreground">
                              {tier.members || tier.memberCount || 0}
                            </td>
                            <td className="px-6 py-4">
                              {statusBadge(tier.status ?? tier.isActive)}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => setEditingTier(tier)}
                                  className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                                  title="Edit">
                                  <Edit size={18} />
                                </button>
                                <button
                                  onClick={() => setDeleteTarget(tier)}
                                  className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all"
                                  title="Delete">
                                  <Delete size={18} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="px-6 py-4 border-t border-border flex justify-between items-center bg-muted/10">
                  <span className="text-xs text-muted-foreground">
                    {t("page.memberTier.list.showing", {
                      count: paginatedTiers.length,
                      total: tiers.length
                    })}
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage <= 1}
                      className="p-2 rounded-lg hover:bg-muted text-muted-foreground disabled:opacity-30 transition-colors">
                      <ChevronLeft size={18} />
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = i + 1;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-10 h-10 rounded-lg text-sm font-semibold transition-colors ${
                            currentPage === pageNum
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
                          onClick={() => setCurrentPage(totalPages)}
                          className="w-10 h-10 rounded-lg hover:bg-muted text-muted-foreground text-sm font-semibold transition-colors">
                          {totalPages}
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage >= totalPages}
                      className="p-2 rounded-lg hover:bg-muted text-muted-foreground disabled:opacity-30 transition-colors">
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      <Modal
        type="confirm"
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Hapus Tier?"
        confirmText="Ya, Hapus"
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
