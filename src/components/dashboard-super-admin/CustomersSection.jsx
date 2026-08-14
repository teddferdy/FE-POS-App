/* eslint-disable react/prop-types */
import React from "react";
import { Users, Crown, TrendingUp, Phone } from "lucide-react";
import SectionCard from "./SectionCard";
import { formatCurrencyRupiah } from "@/utils/formatter-currency";

const TIER_COLORS = ["#6366f1", "#0ea5e9", "#10b981", "#f59e0b", "#f43f5e", "#8b5cf6"];

const CustomersSection = ({ customers }) => {
  const tiers = customers?.tierDistribution || [];
  const topMembers = customers?.topMembers || [];
  const tierTotal = tiers.reduce((s, r) => s + r.count, 0);

  return (
    <SectionCard
      icon={Users}
      title="Pelanggan & Member"
      subtitle="Pertumbuhan member, distribusi tier, dan member teraktif"
      bodyClassName="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-muted/40 rounded-lg p-3">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
            Total Member
          </p>
          <p className="text-lg font-bold text-foreground">{customers?.totalMembers || 0}</p>
        </div>
        <div className="bg-muted/40 rounded-lg p-3">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
            Member Baru
          </p>
          <p className="text-lg font-bold text-emerald-600 flex items-center gap-1.5">
            <TrendingUp size={15} />+{customers?.newMembers || 0}
            <span className="text-xs font-normal text-muted-foreground">
              ({customers?.memberGrowth || 0}%)
            </span>
          </p>
        </div>
      </div>

      <div>
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Crown size={13} className="text-amber-500" />
          Distribusi Tier
        </p>
        {tiers.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-3 bg-muted/30 rounded-lg">
            Belum ada data tier
          </p>
        ) : (
          <div className="space-y-2.5">
            {tiers.map((r, i) => {
              const pct = tierTotal > 0 ? Math.round((r.count / tierTotal) * 100) : 0;
              return (
                <div key={r.tier} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-foreground">{r.tier}</span>
                    <span className="text-xs text-muted-foreground">
                      {r.count} member · {pct}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: TIER_COLORS[i % TIER_COLORS.length]
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div>
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          Member Teraktif (By Spend)
        </p>
        {topMembers.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-3 bg-muted/30 rounded-lg">
            Belum ada transaksi member
          </p>
        ) : (
          <div className="space-y-2">
            {topMembers.map((m, i) => (
              <div
                key={m.id}
                className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold text-primary-foreground shrink-0"
                    style={{
                      backgroundColor: TIER_COLORS[i % TIER_COLORS.length]
                    }}>
                    {i + 1}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{m.name}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Phone size={10} /> {m.phoneNumber || "—"} · {m.orderCount} order
                    </p>
                  </div>
                </div>
                <span className="font-mono text-xs font-semibold shrink-0">
                  {formatCurrencyRupiah(m.totalSpend)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </SectionCard>
  );
};

export default CustomersSection;
