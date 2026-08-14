/* eslint-disable react/prop-types */
import React from "react";
import { Wallet, ArrowDownRight, Building2, CalendarClock } from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";
import SectionCard from "./SectionCard";
import { formatCurrencyRupiah } from "@/utils/formatter-currency";
import { safeGet } from "@/lib/safe-lookup";

const fmtShort = (val) => {
  if (val >= 1000000) return `Rp${(val / 1000000).toFixed(1)}Jt`;
  if (val >= 1000) return `Rp${(val / 1000).toFixed(0)}K`;
  return `Rp${val}`;
};

const miniAmount = (val) =>
  val >= 1000000 ? `${(val / 1000000).toFixed(1)}Jt` : `${(val / 1000).toFixed(0)}K`;

const FinanceSection = ({ finance, summary }) => {
  const cashFlow = (finance?.cashFlow || []).map((d) => ({
    ...d,
    label: new Date(`${d.date}T00:00:00`).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short"
    })
  }));

  const expenseCat = finance?.expenseByCategory || [];
  const expenseTotal = expenseCat.reduce((s, r) => s + r.amount, 0);
  const arCustomers = finance?.arByCustomer || [];
  const apPOs = finance?.apOutstandingPOs || [];

  const statBlock = (label, value, sub, color = "text-foreground") => (
    <div className="bg-muted/40 rounded-lg p-3">
      <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
        {label}
      </p>
      <p className={`text-lg font-bold ${color}`}>{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  );

  return (
    <>
      <SectionCard
        icon={Wallet}
        title="Keuangan"
        subtitle="Arus kas, hutang-piutang, dan pengeluaran per kategori"
        bodyClassName="space-y-5">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-8">
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={cashFlow}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="hsl(var(--border))"
                  />
                  <XAxis
                    dataKey="label"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                    minTickGap={16}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                    tickFormatter={fmtShort}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "12px"
                    }}
                    formatter={(value, name) => {
                      const labels = {
                        inflow: "Pemasukan",
                        outflow: "Pengeluaran",
                        net: "Selisih"
                      };
                      return [formatCurrencyRupiah(value), safeGet(labels, name, name)];
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "12px" }} />
                  <Area
                    type="monotone"
                    dataKey="inflow"
                    name="inflow"
                    stackId="1"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.18}
                  />
                  <Area
                    type="monotone"
                    dataKey="outflow"
                    name="outflow"
                    stackId="1"
                    stroke="#f43f5e"
                    fill="#f43f5e"
                    fillOpacity={0.18}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="lg:col-span-4 grid grid-cols-2 gap-3 content-start">
            {statBlock(
              "Pendapatan",
              formatCurrencyRupiah(summary.revenue),
              `Diskon ${miniAmount(summary.discount)} · Pajak ${miniAmount(summary.tax)}`
            )}
            {statBlock(
              "Pengeluaran",
              formatCurrencyRupiah(summary.totalExpense),
              `${expenseCat.length} kategori`,
              "text-destructive"
            )}
            {statBlock(
              "Laba Bersih",
              formatCurrencyRupiah(summary.netRevenue),
              `Margin ${summary.netMargin}%`,
              summary.netRevenue >= 0 ? "text-emerald-600" : "text-destructive"
            )}
            {statBlock(
              "Hutang (AP)",
              formatCurrencyRupiah(finance?.ap?.outstanding || 0),
              `${finance?.ap?.count || 0} PO belum lunas`,
              "text-amber-600"
            )}
            {statBlock(
              "Piutang (AR)",
              formatCurrencyRupiah(finance?.ar?.outstanding || 0),
              `${finance?.ar?.count || 0} faktur`,
              "text-orange-600"
            )}
            {statBlock(
              "Bayar AP Periode Ini",
              formatCurrencyRupiah(finance?.ap?.paidInRange || 0),
              "Pembayaran ke supplier",
              "text-emerald-600"
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 pt-5 border-t border-border">
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <ArrowDownRight size={13} className="text-emerald-600" />
              Pengeluaran per Kategori
            </p>
            <div className="space-y-2.5">
              {expenseCat.length === 0 && (
                <p className="text-sm text-muted-foreground">Belum ada pengeluaran</p>
              )}
              {expenseCat.map((r) => {
                const pct = expenseTotal > 0 ? Math.round((r.amount / expenseTotal) * 100) : 0;
                return (
                  <div key={r.category} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-foreground">{r.category}</span>
                      <span className="font-mono text-xs font-semibold">
                        {pct}% · {formatCurrencyRupiah(r.amount)}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-destructive/70"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Building2 size={13} className="text-orange-600" />
              Piutang per Pelanggan
            </p>
            <div className="space-y-2">
              {arCustomers.length === 0 && (
                <p className="text-sm text-muted-foreground">Tidak ada piutang</p>
              )}
              {arCustomers.map((r) => (
                <div
                  key={r.customer}
                  className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2">
                  <div>
                    <p className="text-sm font-medium text-foreground">{r.customer}</p>
                    <p className="text-xs text-muted-foreground">{r.count} faktur</p>
                  </div>
                  <span className="font-mono text-xs font-semibold text-orange-600">
                    {formatCurrencyRupiah(r.outstanding)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <CalendarClock size={13} className="text-amber-600" />
              Hutang ke Supplier
            </p>
            <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1">
              {apPOs.length === 0 && (
                <p className="text-sm text-muted-foreground">Tidak ada hutang tertunggak</p>
              )}
              {apPOs.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2">
                  <div>
                    <p className="text-sm font-medium text-foreground font-mono">{r.orderNumber}</p>
                    <p className="text-xs text-muted-foreground">
                      {r.storeName || "—"}
                      {r.dueDate
                        ? ` · Jatuh tempo ${new Date(r.dueDate).toLocaleDateString("id-ID")}`
                        : ""}
                    </p>
                  </div>
                  <span className="font-mono text-xs font-semibold text-amber-600">
                    {formatCurrencyRupiah(r.outstanding)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SectionCard>
    </>
  );
};

export default FinanceSection;
