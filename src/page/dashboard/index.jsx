import React from "react";

import {
  TrendingUp,
  TrendingDown,
  Download,
  Eye,
  Printer,
  Coffee,
  UtensilsCrossed,
  Package,
  Users,
  AlertTriangle,
  ShoppingCart,
  DollarSign
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { formatCurrencyRupiah } from "@/utils/formatter-currency";

const statusBadge = (status) => {
  const styles = {
    Paid: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    Pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    Cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
  };
  const dotColors = {
    Paid: "bg-green-500",
    Pending: "bg-yellow-500",
    Cancelled: "bg-red-500"
  };
  const d = dotColors[status] || dotColors.Paid;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${styles[status] || styles.Paid}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${d}`} />
      {status}
    </span>
  );
};

const chartData = [
  { day: "Sen", value: 24 },
  { day: "Sel", value: 36 },
  { day: "Rab", value: 32 },
  { day: "Kam", value: 48 },
  { day: "Jum", value: 56 },
  { day: "Sab", value: 64 },
  { day: "Min", value: 40 }
];

const bestSellingData = [
  {
    name: "Nasi Goreng",
    category: "Makanan Utama",
    count: 45,
    icon: UtensilsCrossed
  },
  {
    name: "Es Teh Manis",
    category: "Minuman",
    count: 112,
    icon: Coffee
  },
  {
    name: "Ayam Geprek",
    category: "Makanan Utama",
    count: 38,
    icon: UtensilsCrossed
  },
  {
    name: "Mie Goreng",
    category: "Makanan Utama",
    count: 29,
    icon: UtensilsCrossed
  },
  {
    name: "Ayam Bakar",
    category: "Makanan Utama",
    count: 25,
    icon: UtensilsCrossed
  }
];

const recentOrders = [
  {
    id: "#ORD12345",
    table: "5",
    customer: "John Doe",
    total: 125000,
    status: "Paid",
    time: "12:30"
  },
  {
    id: "#ORD12344",
    table: "2",
    customer: "Sarah Williams",
    total: 84500,
    status: "Paid",
    time: "12:15"
  },
  {
    id: "#ORD12343",
    table: "TA",
    customer: "Dwi Santoso",
    total: 45000,
    status: "Paid",
    time: "11:55"
  },
  {
    id: "#ORD12342",
    table: "8",
    customer: "Budi Hartono",
    total: 210000,
    status: "Pending",
    time: "11:40"
  },
  {
    id: "#ORD12341",
    table: "3",
    customer: "Ani Wijaya",
    total: 67000,
    status: "Paid",
    time: "11:20"
  }
];

const Dashboard = () => {
  const summaryCards = [
    {
      label: "Pendapatan",
      value: "Rp 2.5jt",
      trend: "+15% vs kemarin",
      trendUp: true,
      icon: DollarSign,
      color: "text-primary"
    },
    {
      label: "Pesanan",
      value: "127",
      trend: "+8% mingguan",
      trendUp: true,
      icon: ShoppingCart,
      color: "text-primary"
    },
    {
      label: "Produk Aktif",
      value: "85",
      trend: "+3% item baru",
      trendUp: true,
      icon: Package,
      color: "text-primary"
    },
    {
      label: "Member",
      value: "342",
      trend: "+22% loyalitas",
      trendUp: true,
      icon: Users,
      color: "text-primary"
    },
    {
      label: "Stok Menipis",
      value: "12",
      trend: "Segera restok",
      trendUp: false,
      icon: AlertTriangle,
      color: "text-destructive",
      bg: "bg-destructive/10 border-destructive/20"
    }
  ];

  return (
    <div className="space-y-6">
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
              <h3 className="text-base font-semibold text-foreground">Tren Pendapatan Mingguan</h3>
              <p className="text-sm text-muted-foreground">Laporan per 12 - 18 Juni</p>
            </div>
            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm border border-border rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground">
              <Download size={14} />
              Unduh Report
            </button>
          </div>
          <div className="p-5 h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barCategoryGap="20%">
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: "hsl(var(--muted-foreground))",
                    fontSize: 12
                  }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: "hsl(var(--muted-foreground))",
                    fontSize: 12
                  }}
                  tickFormatter={(v) => `${v}jt`}
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
            <p className="text-sm text-muted-foreground">Top 5 Produk Terlaris</p>
          </div>
          <div className="divide-y divide-border">
            {bestSellingData.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.name}
                  className="flex items-center justify-between p-4 hover:bg-accent/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <Icon size={16} />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-foreground">{item.name}</h4>
                      <p className="text-xs text-muted-foreground">{item.category}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded">
                    {item.count}x
                  </span>
                </div>
              );
            })}
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
              {recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-accent/30 transition-colors">
                  <td className="px-5 py-3.5 font-mono text-xs font-semibold text-primary">
                    {order.id}
                  </td>
                  <td className="px-5 py-3.5">{order.table}</td>
                  <td className="px-5 py-3.5 font-medium text-foreground">{order.customer}</td>
                  <td className="px-5 py-3.5 font-mono text-xs font-semibold">
                    {formatCurrencyRupiah(order.total)}
                  </td>
                  <td className="px-5 py-3.5">{statusBadge(order.status)}</td>
                  <td className="px-5 py-3.5 text-muted-foreground">{order.time}</td>
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
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
