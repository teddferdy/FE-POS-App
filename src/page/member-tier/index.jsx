import React, { useState } from "react";
import {
  Award,
  Plus,
  Filter,
  Download,
  Edit,
  Delete,
  Eye,
  RefreshCw,
  Users,
  TrendingUp,
  ArrowLeft
} from "lucide-react";
import AddMemberTier from "./AddMemberTier";
import EditMemberTier from "./EditMemberTier";

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
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Member Tier Management</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Configure customer loyalty levels and benefit structures.
              </p>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all active:scale-95 shadow-sm">
              <Plus size={18} />
              <span className="font-medium">Tambah Tier Baru</span>
            </button>
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
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Total Tiers
              </p>
              <h3 className="text-xl font-bold mt-1">4 Active</h3>
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
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Total Members
              </p>
              <h3 className="text-xl font-bold mt-1">18,492</h3>
              <p className="text-[11px] text-muted-foreground mt-2">
                Across all active tiers in ecosystem
              </p>
            </div>
            <div className="bg-card p-5 rounded-xl shadow-sm border border-border group hover:border-primary/30 transition-all">
              <div className="flex justify-between items-start mb-3">
                <div className="w-12 h-12 rounded-lg bg-tertiary/10 flex items-center justify-center text-tertiary">
                  <TrendingUp size={24} />
                </div>
                <span className="text-tertiary font-mono">PLATINUM</span>
              </div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Highest Tier Growth
              </p>
              <h3 className="text-xl font-bold mt-1">+420 Members</h3>
              <p className="text-[11px] text-muted-foreground mt-2">
                Platinum conversions this month
              </p>
            </div>
          </div>

          <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex justify-between items-center bg-muted/30">
              <h4 className="text-base font-semibold">Tier Hierarchy & Rules</h4>
              <div className="flex items-center gap-3">
                <button className="text-xs font-medium text-primary flex items-center gap-1 hover:underline">
                  <Filter size={16} /> Filter
                </button>
                <button className="text-xs font-medium text-primary flex items-center gap-1 hover:underline">
                  <Download size={16} /> Export
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-muted/10">
                    <th className="px-5 py-3 text-xs font-medium text-muted-foreground border-b border-border">
                      ID
                    </th>
                    <th className="px-5 py-3 text-xs font-medium text-muted-foreground border-b border-border">
                      Tier Name
                    </th>
                    <th className="px-5 py-3 text-xs font-medium text-muted-foreground border-b border-border">
                      Min. Points
                    </th>
                    <th className="px-5 py-3 text-xs font-medium text-muted-foreground border-b border-border">
                      Discount
                    </th>
                    <th className="px-5 py-3 text-xs font-medium text-muted-foreground border-b border-border">
                      Benefit Summary
                    </th>
                    <th className="px-5 py-3 text-xs font-medium text-muted-foreground border-b border-border">
                      Members
                    </th>
                    <th className="px-5 py-3 text-xs font-medium text-muted-foreground border-b border-border">
                      Status
                    </th>
                    <th className="px-5 py-3 text-xs font-medium text-muted-foreground border-b border-border text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/10">
                  {paginatedTiers.map((tier) => (
                    <tr key={tier.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-5 py-4 font-mono text-sm text-muted-foreground">
                        {tier.id}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2 h-8 rounded-full"
                            style={{ backgroundColor: tier.color }}
                          />
                          <span className="font-medium">{tier.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 font-mono text-sm">{tier.minPoints}</td>
                      <td className="px-5 py-4 font-mono text-sm text-primary font-semibold">
                        {tier.discount}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-1">
                          {tier.benefits.map((benefit, idx) => (
                            <span
                              key={idx}
                              className="bg-muted px-1.5 py-0.5 rounded text-[10px] font-bold text-primary">
                              {benefit}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-5 py-4 font-mono text-sm">{tier.members}</td>
                      <td className="px-5 py-4">{statusBadge(tier.status)}</td>
                      <td className="px-5 py-4 text-right space-x-2">
                        {tier.status === "inactive" ? (
                          <>
                            <button className="w-8 h-8 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all">
                              <Eye size={20} />
                            </button>
                            <button className="w-8 h-8 rounded-full text-muted-foreground hover:text-secondary hover:bg-secondary/10 transition-all">
                              <RefreshCw size={20} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button className="w-8 h-8 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all">
                              <Edit size={20} onClick={() => setEditingTier(tier)} />
                            </button>
                            <button className="w-8 h-8 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all">
                              <Delete size={20} />
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-5 py-4 bg-muted/10 flex justify-between items-center border-t border-border">
              <p className="text-xs text-muted-foreground">
                Showing {paginatedTiers.length} of {tiers.length} tiers available
              </p>
              <div className="flex items-center gap-1">
                <button
                  className="px-3 py-1 border border-border rounded-lg text-xs opacity-50 cursor-not-allowed"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}>
                  Previous
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i}
                      className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${
                        currentPage === i + 1
                          ? "bg-primary text-primary-foreground"
                          : "border border-border hover:bg-muted text-muted-foreground"
                      }`}
                      onClick={() => setCurrentPage(i + 1)}>
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button
                  className="px-3 py-1 border border-border rounded-lg text-xs hover:bg-muted transition-all"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}>
                  Next
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
