/* eslint-disable react/prop-types */
import React from "react";
import { formatCurrency, formatNumber } from "@/utils/reportUtils";

const BestSellerTab = ({ t, data }) => {
  const bestSellers = data?.bestSellers || [];
  const summary = data?.summary || {};
  const maxSold = Math.max(...bestSellers.map((p) => p.sold || 0), 1);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="w-12 h-1 bg-amber-500 rounded-full mb-3" />
          <h3 className="text-lg font-semibold text-foreground">
            {t("page.report.bestSeller.title")}
          </h3>
          <p className="text-sm text-muted-foreground">{t("page.report.bestSeller.description")}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          {
            icon: "shopping_bag",
            iconColor: "text-amber-600",
            iconBg: "bg-amber-100",
            labelKey: "page.report.bestSeller.kpi.unitsSold",
            value: formatNumber(summary.totalUnitsSold || 0)
          },
          {
            icon: "payments",
            iconColor: "text-orange-600",
            iconBg: "bg-orange-100",
            labelKey: "page.report.bestSeller.kpi.productRevenue",
            value: formatCurrency(summary.totalRevenue || 0)
          },
          {
            icon: "inventory_2",
            iconColor: "text-yellow-600",
            iconBg: "bg-yellow-100",
            labelKey: "page.report.bestSeller.kpi.activeProducts",
            value: formatNumber(summary.activeProducts || 0)
          },
          {
            icon: "assignment_return",
            iconColor: "text-red-600",
            iconBg: "bg-red-100",
            labelKey: "page.report.bestSeller.kpi.returnRate",
            value: "0%"
          }
        ].map((kpi) => (
          <div
            key={kpi.labelKey}
            className="bg-card p-4 rounded-xl border-l-4 border-amber-500 border border-border shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-semibold text-muted-foreground">{t(kpi.labelKey)}</span>
              <div className={`p-1.5 ${kpi.iconBg} rounded-lg`}>
                <span className={`material-symbols-outlined text-lg ${kpi.iconColor}`}>
                  {kpi.icon}
                </span>
              </div>
            </div>
            <p className="text-xl font-bold text-foreground">{kpi.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card p-6 rounded-xl border border-border shadow-sm">
          <div className="w-8 h-1 bg-amber-500 rounded-full mb-2" />
          <h3 className="text-base font-semibold text-foreground mb-6">
            {t("page.report.bestSeller.top10Visualization")}
          </h3>
          {bestSellers.length > 0 ? (
            <div className="space-y-4">
              {bestSellers.slice(0, 5).map((item) => (
                <div key={item.id} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-foreground">{item.name}</span>
                    <span className="font-mono text-muted-foreground">
                      {formatNumber(item.sold)} unit
                    </span>
                  </div>
                  <div className="w-full bg-muted h-3 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-500 h-full rounded-full transition-all"
                      style={{ width: `${(item.sold / maxSold) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              Belum ada data produk terlaris
            </p>
          )}
        </div>

        {bestSellers[0] && (
          <div className="bg-gradient-to-br from-amber-600 to-orange-700 text-white rounded-xl p-6 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute -right-10 -top-10 opacity-10">
              <span className="material-symbols-outlined text-[200px]">auto_awesome</span>
            </div>
            <div className="relative z-10">
              <span className="bg-white/20 text-white border border-white/30 px-3 py-1 rounded-full text-xs font-semibold mb-4 inline-block">
                {t("page.report.bestSeller.productSpotlight")}
              </span>
              <h4 className="text-lg font-semibold mb-2">{bestSellers[0].name}</h4>
              <p className="text-sm text-white/70 mb-6">
                Produk terlaris dengan penjualan tertinggi
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/10 p-3 rounded-lg">
                  <p className="text-[10px] text-white/60 uppercase tracking-widest">
                    {t("page.report.bestSeller.share")}
                  </p>
                  <p className="text-lg font-bold">
                    {summary.totalUnitsSold > 0
                      ? `${Math.round((bestSellers[0].sold / summary.totalUnitsSold) * 100)}%`
                      : "0%"}
                  </p>
                </div>
                <div className="bg-white/10 p-3 rounded-lg">
                  <p className="text-[10px] text-white/60 uppercase tracking-widest">
                    {t("common.status")}
                  </p>
                  <p className="text-lg font-bold">{t("page.report.bestSeller.lead")}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex justify-between items-center">
          <h3 className="text-base font-semibold text-foreground">
            {t("page.report.bestSeller.productPerformanceTable")}
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-amber-50 border-b border-border">
                <th className="px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {t("page.report.bestSeller.table.rank")}
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {t("page.report.bestSeller.table.productName")}
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {t("page.report.bestSeller.table.totalSold")}
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {t("page.report.bestSeller.table.revenue")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {bestSellers.length > 0 ? (
                bestSellers.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-amber-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-mono font-bold text-amber-600">
                      #{idx + 1}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-8 h-8 rounded object-cover"
                          />
                        )}
                        <span className="text-sm font-semibold text-foreground">{item.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm font-mono text-foreground">
                      {formatNumber(item.sold)} unit
                    </td>
                    <td className="px-4 py-4 text-sm font-mono text-foreground">
                      {formatCurrency(item.revenue)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-sm text-muted-foreground">
                    Belum ada data
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BestSellerTab;
