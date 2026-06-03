import React, { useState } from "react";
import {
  Award,
  Plus,
  Edit,
  Delete,
  Eye,
  RefreshCw,
  Users,
  TrendingUp,
  ArrowLeft,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import AddMemberTier from "./AddMemberTier";
import EditMemberTier from "./EditMemberTier";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

const initialTiers = [
  {
    id: "#T-004",
    name: "Platinum",
    minPoints: "50,000 pts",
    discount: "20%",
    benefits: ["15% DISC", "FREE SHIP", "VIP LOUNGE"],
    members: "1,204",
    status: "active",
    color: "#E5E4E2"
  },
  {
    id: "#T-003",
    name: "Gold",
    minPoints: "20,000 pts",
    discount: "15%",
    benefits: ["10% DISC", "FREE SHIP"],
    members: "4,582",
    status: "active",
    color: "#FFD700"
  },
  {
    id: "#T-002",
    name: "Silver",
    minPoints: "5,000 pts",
    discount: "10%",
    benefits: ["5% DISC"],
    members: "8,930",
    status: "active",
    color: "#C0C0C0"
  },
  {
    id: "#T-001",
    name: "Bronze",
    minPoints: "0 pts",
    discount: "5%",
    benefits: ["BASIC REWARDS"],
    members: "3,776",
    status: "active",
    color: "#CD7F32"
  },
  {
    id: "#T-000",
    name: "Legacy",
    minPoints: "N/A",
    discount: "-",
    benefits: [],
    members: "0",
    status: "inactive",
    color: "#727785"
  }
];

const MemberTier = () => {
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTier, setEditingTier] = useState(null);
  const [tiers, setTiers] = useState(initialTiers);
  const itemsPerPage = 5;
  const totalPages = Math.ceil(tiers.length / itemsPerPage);

  const paginatedTiers = tiers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const statusBadge = (status) => {
    const styles = {
      active: "bg-secondary/10 text-secondary border-secondary/20",
      inactive: "bg-outline-variant/20 text-outline border-outline-variant/30"
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${styles[status]}`}>
        {status === "active" ? "Active" : "Inactive"}
      </span>
    );
  };

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
            onSave={(updated) => {
              const minPts = updated.minPoints === "" ? 0 : Number(updated.minPoints);
              const disc = updated.discountPercent === "" ? 0 : Number(updated.discountPercent);
              setTiers(
                tiers.map((t) =>
                  t.id === editingTier.id
                    ? {
                        ...t,
                        name: updated.tierName,
                        minPoints: `${minPts.toLocaleString("id-ID")} pts`,
                        discount: `${disc}%`,
                        benefits: updated.perks
                          .map((p) => p.text)
                          .filter((text) => text.trim() !== ""),
                        status: updated.isActive ? "active" : "inactive",
                        color: updated.selectedColor
                      }
                    : t
                )
              );
              setEditingTier(null);
            }}
            onDelete={(tierId) => {
              setTiers(tiers.filter((t) => t.id !== tierId));
              setEditingTier(null);
            }}
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
          <AddMemberTier
            onClose={() => setShowAddForm(false)}
            onSave={(newTier) => {
              const minPts = newTier.minPoints === "" ? 0 : Number(newTier.minPoints);
              const disc = newTier.discountPercent === "" ? 0 : Number(newTier.discountPercent);
              const tierWithId = {
                id: `#T-${String(tiers.length + 1).padStart(3, "0")}`,
                name: newTier.tierName,
                minPoints: `${minPts.toLocaleString("id-ID")} pts`,
                discount: `${disc}%`,
                benefits: newTier.perks.map((p) => p.text).filter((text) => text.trim() !== ""),
                members: "0",
                status: newTier.isActive ? "active" : "inactive",
                color: newTier.selectedColor
              };
              setTiers([tierWithId, ...tiers]);
              setShowAddForm(false);
            }}
          />
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-card p-5 rounded-xl shadow-sm border border-border group hover:border-primary/30 transition-all">
              <div className="flex justify-between items-start mb-3">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <Award size={24} />
                </div>
                <span className="text-secondary font-mono flex items-center gap-1">
                  <Award size={16} /> +2
                </span>
              </div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {t("page.memberTier.list.totalTiers")}
              </p>
              <h3 className="text-xl font-bold mt-1">
                {tiers.filter((t) => t.status === "active").length}{" "}
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
                  <TrendingUp size={16} /> 12.5%
                </span>
              </div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {t("page.memberTier.list.totalMembers")}
              </p>
              <h3 className="text-xl font-bold mt-1">
                {tiers
                  .reduce((sum, t) => sum + (parseInt(t.members?.replace(/,/g, "")) || 0), 0)
                  .toLocaleString()}
              </h3>
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
              <h3 className="text-xl font-bold mt-1">
                +
                {tiers
                  .reduce((sum, t) => sum + (parseInt(t.members?.replace(/,/g, "")) || 0), 0)
                  .toLocaleString()}{" "}
                {t("page.memberTier.list.members")}
              </h3>
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
                  {paginatedTiers.map((tier) => (
                    <tr key={tier.id} className="hover:bg-muted/20 transition-colors group">
                      <td className="px-6 py-4 font-mono text-sm text-muted-foreground">
                        {tier.id}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2 h-8 rounded-full"
                            style={{ backgroundColor: tier.color }}
                          />
                          <span className="font-semibold text-foreground">{tier.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-sm text-foreground">
                        {tier.minPoints}
                      </td>
                      <td className="px-6 py-4 font-mono text-sm text-primary font-semibold">
                        {tier.discount}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {tier.benefits.map((benefit, idx) => (
                            <span
                              key={idx}
                              className="bg-primary/10 px-2 py-0.5 rounded text-[10px] font-bold text-primary">
                              {benefit}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-sm text-foreground">
                        {tier.members}
                      </td>
                      <td className="px-6 py-4">{statusBadge(tier.status)}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {tier.status === "inactive" ? (
                            <>
                              <button
                                className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                                title="View">
                                <Eye size={18} />
                              </button>
                              <button
                                className="p-1.5 text-muted-foreground hover:text-secondary hover:bg-secondary/10 rounded-lg transition-all"
                                title="Activate">
                                <RefreshCw size={18} />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => setEditingTier(tier)}
                                className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                                title="Edit">
                                <Edit size={18} />
                              </button>
                              <button
                                className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all"
                                title="Delete">
                                <Delete size={18} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
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
        </div>
      )}
    </div>
  );
};

export default MemberTier;
