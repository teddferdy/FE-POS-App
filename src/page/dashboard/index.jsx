import React from "react";
import { useQuery } from "react-query";
import { useCookies } from "react-cookie";
import {
  TrendingUp,
  TrendingDown,
  Download,
  Eye,
  Printer,
  UtensilsCrossed,
  Package,
  Users,
  AlertTriangle,
  ShoppingCart,
  DollarSign
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { formatCurrencyRupiah } from "@/utils/formatter-currency";
import { getDashboardSummary } from "@/services/dashboard";
import { Loading } from "@/components/ui/loading";

const statusBadge = (status) => {
  const s = (status || "Paid").toLowerCase();
  const styles = {
    paid: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    completed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
  };
  const dotColors = {
    paid: "bg-green-500",
    completed: "bg-green-500",
    pending: "bg-yellow-500",
    cancelled: "bg-red-500"
  };
  const key = Object.keys(styles).find((k) => s.includes(k)) || "paid";
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${styles[key]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColors[key]}`} />
      {status}
    </span>
  );
};

const fallbackChart = [
  { day: "Sen", value: 0 },
  { day: "Sel", value: 0 },
  { day: "Rab", value: 0 },
  { day: "Kam", value: 0 },
  { day: "Jum", value: 0 },
  { day: "Sab", value: 0 },
  { day: "Min", value: 0 }
];

const Dashboard = () => {
  const [cookie] = useCookies();
  const store = cookie?.store;

  const { data: dashData, isLoading } = useQuery(
    ["dashboard-summary", store],
    () => getDashboardSummary({ store }),
    { enabled: !!store }
  );

  const d = dashData?.data || dashData || {};

  const revenue = d.revenue || {};
  const orders = d.orders || {};
  const members = d.members || {};
  const summaryCards = [
    {
      label: "Pendapatan",
      value: formatCurrencyRupiah(revenue.total || 0),
      trend: revenue.trend || "+0% vs kemarin",
      trendUp: (revenue.trend || "").includes("+"),
      icon: DollarSign,
      color: "text-primary"
    },
    {
      label: "Pesanan",
      value: String(orders.total || d.totalOrders || 0),
      trend: orders.trend || "+0% mingguan",
      trendUp: (orders.trend || "").includes("+"),
      icon: ShoppingCart,
      color: "text-primary"
    },
    {
      label: "Produk Aktif",
      value: String(d.activeProducts || d.totalProducts || 0),
      trend: d.productTrend || `${d.activeProducts || 0} item`,
      trendUp: true,
      icon: Package,
      color: "text-primary"
    },
    {
      label: "Member",
      value: String(members.total || d.totalMembers || 0),
      trend: members.trend || "+0% loyalitas",
      trendUp: (members.trend || "").includes("+"),
      icon: Users,
      color: "text-primary"
    },
    {
      label: "Stok Menipis",
      value: String(d.lowStock || d.lowStockCount || 0),
      trend: d.lowStock ? "Segera restok" : "Aman",
      trendUp: !d.lowStock,
      icon: AlertTriangle,
      color: "text-destructive",
      bg: "bg-destructive/10 border-destructive/20"
    }
  ];

  const chartData = d.weeklyRevenue || d.chartData || fallbackChart;
  const bestSelling = d.bestSelling || d.topProducts || [];
  const recentOrders = d.recentOrders || [];

  return (
    <div className="space-y-6">
      {isLoading ? (
        <Loading />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {summaryCards.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.label}
                  className={`bg-card rounded-xl border border-border p-4 shadow-sm hover:shadow-md transition-shadow ${
                    card.bg || ""
                  }`}>
                  <div className="flex items-start justify-between mb-3">
                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                      {card.label}
                    </p>
                    <Icon size={18} className={card.color} />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">{card.value}</h2>
                  <div
                    className={`flex items-center gap-1 mt-1.5 ${
                      card.trendUp ? "text-green-600 dark:text-green-400" : "text-destructive"
                    }`}>
                    {card.trendUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                    <span className="text-xs font-medium">{card.trend}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 bg-card rounded-xl border border-border overflow-hidden shadow-sm">
              <div className="p-5 flex flex-wrap items-center justify-between gap-3 border-b border-border">
                <div>
                  <h3 className="text-base font-semibold text-foreground">
                    Tren Pendapatan Mingguan
                  </h3>
                  <p className="text-sm text-muted-foreground">Laporan 7 hari terakhir</p>
                </div>
                <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm border border-border rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground">
                  <Download size={14} />
                  Unduh Report
                </button>
              </div>
              <div className="p-5 h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} barCategoryGap="20%">
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="hsl(var(--border))"
                    />
                    <XAxis
                      dataKey="day"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        fontSize: "12px"
                      }}
                    />
                    <Bar
                      dataKey="value"
                      fill="hsl(var(--primary))"
                      radius={[4, 4, 0, 0]}
                      opacity={0.8}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="lg:col-span-4 bg-card rounded-xl border border-border overflow-hidden shadow-sm">
              <div className="p-5 border-b border-border">
                <h3 className="text-base font-semibold text-foreground">Best Selling</h3>
                <p className="text-sm text-muted-foreground">Top Produk Terlaris</p>
              </div>
              <div className="divide-y divide-border">
                {bestSelling.length === 0 ? (
                  <div className="p-5 text-sm text-muted-foreground text-center">
                    Belum ada data
                  </div>
                ) : (
                  bestSelling.map((item, i) => {
                    const Icon = item.icon || UtensilsCrossed;
                    return (
                      <div
                        key={item.name || i}
                        className="flex items-center justify-between p-4 hover:bg-accent/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                            <Icon size={16} />
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-foreground">
                              {item.name || item.productName || "-"}
                            </h4>
                            <p className="text-xs text-muted-foreground">{item.category || ""}</p>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded">
                          {item.count || item.quantity || 0}x
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
            <div className="p-5 border-b border-border flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold text-foreground">Recent Orders</h3>
                <p className="text-sm text-muted-foreground">Pesanan terbaru hari ini</p>
              </div>
              <button className="text-sm font-semibold text-primary hover:underline">
                Lihat Semua
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50 text-muted-foreground">
                    <th className="text-left px-5 py-3 font-medium">ID Pesanan</th>
                    <th className="text-left px-5 py-3 font-medium">Meja</th>
                    <th className="text-left px-5 py-3 font-medium">Pelanggan</th>
                    <th className="text-left px-5 py-3 font-medium">Total</th>
                    <th className="text-left px-5 py-3 font-medium">Status</th>
                    <th className="text-left px-5 py-3 font-medium">Waktu</th>
                    <th className="text-left px-5 py-3 font-medium">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {recentOrders.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-5 py-8 text-center text-sm text-muted-foreground">
                        Belum ada pesanan hari ini
                      </td>
                    </tr>
                  ) : (
                    recentOrders.map((order, i) => (
                      <tr key={order.id || i} className="hover:bg-accent/30 transition-colors">
                        <td className="px-5 py-3.5 font-mono text-xs font-semibold text-primary">
                          {order.id || order.invoice || "-"}
                        </td>
                        <td className="px-5 py-3.5">{order.table || order.tableName || "-"}</td>
                        <td className="px-5 py-3.5 font-medium text-foreground">
                          {order.customer || order.memberName || order.customerName || "-"}
                        </td>
                        <td className="px-5 py-3.5 font-mono text-xs font-semibold">
                          {formatCurrencyRupiah(order.total || order.totalPrice || 0)}
                        </td>
                        <td className="px-5 py-3.5">{statusBadge(order.status)}</td>
                        <td className="px-5 py-3.5 text-muted-foreground">
                          {order.time || order.createdAt || "-"}
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            <button className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors">
                              <Eye size={16} />
                            </button>
                            <button className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors">
                              <Printer size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
