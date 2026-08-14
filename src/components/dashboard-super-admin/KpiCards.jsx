/* eslint-disable react/prop-types */
import React from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  ReceiptText,
  Users,
  PiggyBank,
  Landmark,
  HandCoins
} from "lucide-react";
import { formatCurrencyRupiah } from "@/utils/formatter-currency";

const growthBadge = (growth) => {
  const up = growth >= 0;
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-semibold ${
        up ? "text-green-600 dark:text-green-400" : "text-destructive"
      }`}>
      {up ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
      {growth > 0 ? "+" : ""}
      {growth}%
    </span>
  );
};

const KpiCards = ({ summary }) => {
  const cards = [
    {
      label: "Total Pendapatan",
      value: formatCurrencyRupiah(summary.revenue),
      growth: summary.growth?.revenue,
      icon: DollarSign,
      color: "text-primary",
      sub: `${summary.orders} transaksi`
    },
    {
      label: "Total Order",
      value: String(summary.orders),
      growth: summary.growth?.orders,
      icon: ShoppingCart,
      color: "text-primary"
    },
    {
      label: "Rata-rata Transaksi",
      value: formatCurrencyRupiah(summary.avgOrderValue),
      icon: ReceiptText,
      color: "text-primary"
    },
    {
      label: "Laba Bersih (Net)",
      value: formatCurrencyRupiah(summary.netRevenue),
      icon: PiggyBank,
      color: summary.netRevenue >= 0 ? "text-emerald-600" : "text-destructive",
      sub: `Margin ${summary.netMargin}%`
    },
    {
      label: "Total Pengeluaran",
      value: formatCurrencyRupiah(summary.totalExpense),
      growth: summary.growth?.expense,
      icon: HandCoins,
      color: "text-destructive"
    },
    {
      label: "Member",
      value: String(summary.totalMembers),
      growth: summary.growth?.newMembers,
      icon: Users,
      color: "text-primary",
      sub: `+${summary.newMembers} baru`
    },
    {
      label: "Hutang (AP)",
      value: formatCurrencyRupiah(summary.apOutstanding),
      icon: Landmark,
      color: "text-amber-600"
    },
    {
      label: "Piutang (AR)",
      value: formatCurrencyRupiah(summary.arOutstanding),
      icon: Landmark,
      color: "text-orange-600"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div key={card.label} className="bg-card rounded-xl border border-border p-4 shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                {card.label}
              </p>
              <Icon size={18} className={card.color} />
            </div>
            <h2 className="text-xl font-bold text-foreground leading-tight">{card.value}</h2>
            <div className="flex items-center gap-2 mt-1.5">
              {card.growth !== undefined && growthBadge(card.growth)}
              {card.sub && <span className="text-xs text-muted-foreground">{card.sub}</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default KpiCards;
