import React from "react";
import { useNavigate } from "react-router-dom";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Users
} from "lucide-react";

const DashboardStats = ({ summaryCards }) => {
  const navigate = useNavigate();

  return (
    <div
      data-tour="dashboard-stats"
      className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {summaryCards.map((card) => {
        const Icon = card.icon;
        const isLowStock = card.icon === AlertTriangle;
        const isMember = card.icon === Users;
        const isClickable = isLowStock || isMember;
        const trendUp = card.growth !== undefined ? card.growth >= 0 : card.trendUp;
        return (
          <div
            key={card.label}
            onClick={
              isLowStock
                ? () => navigate("/low-stock-all")
                : isMember
                  ? () => navigate("/member-list")
                  : undefined
            }
            style={{
              width: `100%`,
              transition: "width 300ms ease"
            }}
            className={`bg-card rounded-xl border border-border p-4 shadow-sm hover:shadow-md transition-shadow ${
              card.bg || ""
            } ${isClickable ? "cursor-pointer hover:ring-2 hover:ring-primary/30" : ""}`}>
            <div className="flex items-start justify-between mb-3">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                {card.label}
              </p>
              <Icon size={18} className={card.color} />
            </div>
            <h2 className="text-2xl font-bold text-foreground">{card.value}</h2>
            <div
              className={`flex items-center gap-1 mt-1.5 ${
                trendUp ? "text-green-600 dark:text-green-400" : "text-destructive"
              }`}>
              {card.growth !== undefined ? (
                <>
                  {trendUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  <span className="text-xs font-medium">
                    {card.growth > 0 ? "+" : ""}
                    {card.growth}%
                  </span>
                </>
              ) : (
                <>
                  {card.trendUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  <span className="text-xs font-medium">{card.trend}</span>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DashboardStats;
