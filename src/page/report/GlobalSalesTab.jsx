/* eslint-disable react/prop-types */
import { formatCurrency, formatNumber, periods } from "@/utils/reportUtils";

const GlobalSalesTab = ({ t, period, setPeriod, data, isLoading }) => {
  const salesChart = data?.salesChart || [];
  const stores = data?.stores || [];
  const maxSales = Math.max(...salesChart.map((s) => Number(s.sales) || 0), 1);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-card border border-border rounded-lg p-1 flex">
            {periods.map((p) => (
              <button
                key={p.label}
                onClick={() => setPeriod(p.label)}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                  period === p.label
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}>
                {t(`page.report.sales.${p.label.toLowerCase()}`)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            icon: "payments",
            iconBg: "bg-blue-100",
            iconColor: "text-blue-600",
            labelKey: "page.report.sales.kpi.totalSales",
            value: formatCurrency(data?.totalSales || 0)
          },
          {
            icon: "receipt_long",
            iconBg: "bg-blue-50",
            iconColor: "text-blue-500",
            labelKey: "page.report.sales.kpi.avgTransaction",
            value: formatCurrency(data?.avgTransaction || 0)
          },
          {
            icon: "group",
            iconBg: "bg-indigo-100",
            iconColor: "text-indigo-600",
            labelKey: "page.report.sales.kpi.totalCustomers",
            value: formatNumber(data?.totalCustomers || 0)
          },
          {
            icon: "storefront",
            iconBg: "bg-sky-100",
            iconColor: "text-sky-600",
            labelKey: "page.report.sales.kpi.totalOutlets",
            value: formatNumber(data?.totalStores || 0)
          }
        ].map((kpi) => (
          <div
            key={kpi.labelKey}
            className="bg-card p-4 rounded-xl border-l-4 border-blue-500 border border-border shadow-sm">
            <div className="flex justify-between items-start mb-3">
              <div className={`p-2 ${kpi.iconBg} rounded-lg`}>
                <span className={`material-symbols-outlined ${kpi.iconColor}`}>{kpi.icon}</span>
              </div>
            </div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
              {t(kpi.labelKey)}
            </p>
            <p className="text-xl font-bold text-foreground">{kpi.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <div className="w-8 h-1 bg-blue-500 rounded-full mb-2" />
            <h3 className="text-base font-semibold text-foreground">
              {t("page.report.sales.revenueTrend")}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t("page.report.sales.revenueTrendDesc")}
            </p>
          </div>
        </div>
        <div className="relative h-[300px] w-full bg-muted/30 rounded-lg overflow-hidden">
          {salesChart.length > 0 ? (
            <div className="absolute inset-0 flex items-end px-4 pb-4 gap-2">
              {salesChart.map((item, i) => {
                const h = maxSales > 0 ? (Number(item.sales) / maxSales) * 100 : 0;
                return (
                  <div key={i} className="flex-1 relative group">
                    <div
                      className="w-full rounded-t-lg transition-all duration-300 bg-blue-500/20 hover:bg-blue-500"
                      style={{ height: `${Math.max(h, 1)}%` }}>
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-foreground text-background px-2 py-0.5 rounded text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                        {formatCurrency(item.sales)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
              Belum ada data penjualan
            </div>
          )}
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex justify-between items-center">
          <h3 className="text-base font-semibold text-foreground">
            {t("page.report.sales.storePerformance")}
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-muted/30">
                <th className="px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {t("page.report.sales.table.storeName")}
                </th>
                <th className="px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {t("page.report.sales.table.location")}
                </th>
                <th className="px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">
                  {t("page.report.sales.table.totalSales")}
                </th>
                <th className="px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">
                  {t("page.report.sales.table.transactions")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {stores.length > 0 ? (
                stores.map((store) => (
                  <tr key={store.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 text-sm font-bold">
                          {store.name?.charAt(0) || "S"}
                        </div>
                        <p className="text-sm font-semibold text-foreground">{store.name}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{store.city || "-"}</td>
                    <td className="px-6 py-4 text-sm font-mono font-semibold text-foreground text-right">
                      {formatCurrency(store.sales)}
                    </td>
                    <td className="px-6 py-4 text-sm font-mono font-semibold text-foreground text-right">
                      {formatNumber(store.transactions)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-sm text-muted-foreground">
                    Belum ada data toko
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

export default GlobalSalesTab;
