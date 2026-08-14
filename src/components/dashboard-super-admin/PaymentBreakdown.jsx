/* eslint-disable react/prop-types */
import React from "react";
import { CreditCard } from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import SectionCard from "./SectionCard";
import { formatCurrencyRupiah } from "@/utils/formatter-currency";
import { safeGet } from "@/lib/safe-lookup";

const BUCKET_META = {
  cash: { label: "Tunai", color: "#10b981" },
  ewallet: { label: "E-Wallet / QRIS", color: "#6366f1" },
  bank: { label: "Transfer / Bank", color: "#0ea5e9" },
  card: { label: "Kartu", color: "#f59e0b" },
  other: { label: "Lainnya", color: "#94a3b8" }
};

const bucketMeta = (type) => safeGet(BUCKET_META, type, BUCKET_META.other);

const PaymentBreakdown = ({ paymentBreakdown }) => {
  const byType = (paymentBreakdown?.byType || []).map((r) => ({
    ...r,
    label: bucketMeta(r.type).label,
    color: bucketMeta(r.type).color
  }));
  const byMethod = paymentBreakdown?.byMethod || [];
  const total = paymentBreakdown?.totalPayments || 0;

  return (
    <SectionCard
      icon={CreditCard}
      title="Breakdown Pembayaran"
      subtitle="Distribusi metode pembayaran pada periode ini"
      className="lg:col-span-4"
      bodyClassName="flex flex-col">
      <div className="h-[180px] shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={byType}
              dataKey="amount"
              nameKey="label"
              innerRadius={48}
              outerRadius={75}
              paddingAngle={3}
              strokeWidth={0}>
              {byType.map((entry) => (
                <Cell key={entry.type} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: "12px"
              }}
              formatter={(value, name) => [formatCurrencyRupiah(value), name]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-2.5 mt-3">
        {byType.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            Belum ada data pembayaran
          </p>
        )}
        {byType.map((r) => {
          const pct = total > 0 ? Math.round((r.amount / total) * 100) : 0;
          return (
            <div key={r.type} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="inline-flex items-center gap-2 font-medium text-foreground">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: r.color }} />
                  {r.label}
                </span>
                <span className="font-mono text-xs font-semibold">
                  {pct}% · {formatCurrencyRupiah(r.amount)}
                </span>
              </div>
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${pct}%`, backgroundColor: r.color }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {byMethod.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Rincian Metode
          </p>
          <div className="flex flex-wrap gap-1.5">
            {byMethod.map((m) => (
              <span
                key={m.method}
                className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted text-xs text-foreground">
                {m.method}
                <span className="font-mono font-semibold text-muted-foreground">{m.count}x</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </SectionCard>
  );
};

export default PaymentBreakdown;
