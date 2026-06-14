import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "react-query";
import { useCookies } from "react-cookie";
import { ArrowLeft, Building2, User, Calendar, Clock, DollarSign, ShoppingCart, Receipt, FileText, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getOrdersByStore } from "@/services/order";

const formatIDR = (num) => {
  if (!num && num !== 0) return "-";
  return "Rp " + Number(num).toLocaleString("id-ID");
};

const statusCfg = {
  open: { label: "Buka", class: "bg-green-100 text-green-800" },
  closed: { label: "Tutup", class: "bg-gray-100 text-gray-800" }
};

const orderStatusBadge = (status) => {
  const map = {
    paid: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
    void: "bg-red-100 text-red-800",
    pending: "bg-yellow-100 text-yellow-800",
    confirmed: "bg-blue-100 text-blue-800",
    preparing: "bg-purple-100 text-purple-800",
    ready: "bg-teal-100 text-teal-800",
    served: "bg-gray-100 text-gray-800"
  };
  return map[status] || "bg-gray-100 text-gray-800";
};

const getDateOnly = (dateStr) => {
  const d = new Date(dateStr);
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
};

const CashRegisterDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [cookie] = useCookies();
  const item = location.state?.item;

  const sc = statusCfg[item?.status] || statusCfg.closed;
  const registerDate = item?.openedAt ? getDateOnly(item.openedAt) : null;
  const storeId = item?.store || cookie?.activeStore;

  const { data: ordersData, isLoading: ordersLoading } = useQuery(
    ["daily-orders", storeId, registerDate],
    () => getOrdersByStore({ location: storeId, date: registerDate, limit: 100 }),
    { enabled: !!storeId && !!registerDate }
  );

  const orders = ordersData?.data || [];

  if (!item) {
    return (
      <div className="space-y-6">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <button onClick={() => navigate("/dashboard-super-admin")} className="hover:text-foreground">Dashboard</button>
          <span className="text-xs">/</span>
          <button onClick={() => navigate("/cash-register/current")} className="hover:text-foreground">Kasir</button>
          <span className="text-xs">/</span>
          <button onClick={() => navigate("/cash-register/history")} className="hover:text-foreground">Riwayat</button>
          <span className="text-xs">/</span>
          <span className="text-primary font-semibold">Detail</span>
        </nav>
        <div className="bg-card p-12 rounded-xl border border-border text-center">
          <Receipt size={48} className="mx-auto text-muted-foreground/40 mb-3" />
          <p className="text-muted-foreground">Data tidak ditemukan</p>
          <Button onClick={() => navigate("/cash-register/history")} className="mt-4">
            <ArrowLeft size={16} className="mr-1" /> Kembali ke Riwayat
          </Button>
        </div>
      </div>
    );
  }

  const leftCol = [
    { icon: Building2, label: "Toko", value: item.storeData?.name || "-" },
    { icon: User, label: "Dibuka Oleh", value: item.userData?.fullName || "-" },
    { icon: Calendar, label: "Tanggal Buka", value: new Date(item.openedAt).toLocaleDateString("id") },
    { icon: Clock, label: "Jam Buka", value: new Date(item.openedAt).toTimeString().slice(0, 8) },
    { icon: Calendar, label: "Tanggal Tutup", value: item.closedAt ? new Date(item.closedAt).toLocaleDateString("id") : "-" },
    { icon: Clock, label: "Jam Tutup", value: item.closedAt ? new Date(item.closedAt).toTimeString().slice(0, 8) : "-" }
  ];

  const rightCol = [
    { icon: DollarSign, label: "Saldo Awal", value: formatIDR(item.openingBalance), mono: true },
    { icon: ShoppingCart, label: "Total Penjualan", value: formatIDR(item.totalSales), mono: true },
    { icon: Receipt, label: "Total Pengeluaran", value: formatIDR(item.totalExpenses), mono: true },
    { icon: Coins, label: "Saldo Akhir", value: formatIDR(item.closingBalance), mono: true },
    { icon: FileText, label: "Catatan", value: item.notes || "-" }
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <button onClick={() => navigate("/dashboard-super-admin")} className="hover:text-foreground">Dashboard</button>
        <span className="text-xs">/</span>
        <button onClick={() => navigate("/cash-register/current")} className="hover:text-foreground">Kasir</button>
        <span className="text-xs">/</span>
        <button onClick={() => navigate("/cash-register/history")} className="hover:text-foreground">Riwayat</button>
        <span className="text-xs">/</span>
        <span className="text-primary font-semibold">Detail</span>
      </nav>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Detail Kasir</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {new Date(item.openedAt).toLocaleDateString("id")}
          </p>
        </div>
        <div className="flex gap-2">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase ${sc.class}`}>
            {sc.label}
          </span>
          <Button variant="outline" onClick={() => navigate("/cash-register/history")}>
            <ArrowLeft size={16} className="mr-1" /> Kembali
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="bg-muted/30 px-6 py-3 border-b border-border">
            <h2 className="text-sm font-semibold">Informasi Kasir</h2>
          </div>
          <div className="p-6">
            <table className="w-full text-sm">
              <tbody>
                {leftCol.map((r) => (
                  <tr key={r.label} className="border-b border-muted/30 last:border-b-0">
                    <td className="py-2.5 pr-4 w-40">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <r.icon size={14} />
                        <span>{r.label}</span>
                      </div>
                    </td>
                    <td className="py-2.5 font-medium">{r.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="bg-muted/30 px-6 py-3 border-b border-border">
            <h2 className="text-sm font-semibold">Ringkasan Keuangan</h2>
          </div>
          <div className="p-6">
            <table className="w-full text-sm">
              <tbody>
                {rightCol.map((r) => (
                  <tr key={r.label} className="border-b border-muted/30 last:border-b-0">
                    <td className="py-2.5 pr-4 w-40">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <r.icon size={14} />
                        <span>{r.label}</span>
                      </div>
                    </td>
                    <td className={`py-2.5 ${r.mono ? "font-mono font-semibold" : "font-medium"}`}>{r.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="bg-muted/30 px-6 py-3 border-b border-border flex items-center justify-between">
          <h2 className="text-sm font-semibold">Riwayat Transaksi Hari Itu</h2>
          <span className="text-xs text-muted-foreground">{orders.length} transaksi</span>
        </div>
        <div className="overflow-x-auto">
          {ordersLoading ? (
            <div className="p-6 space-y-3">
              {[1,2,3].map((i) => <Skeleton key={i} className="h-6 w-full" />)}
            </div>
          ) : orders.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              <Receipt size={32} className="mx-auto text-muted-foreground/40 mb-2" />
              Tidak ada transaksi
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50 text-muted-foreground">
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-left">No</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-left">Invoice</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-left">Kasir</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-left">Jam</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-right">Total</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-center">Status</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-center">Pembayaran</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orders.map((o, i) => (
                  <tr key={o.id} className="hover:bg-accent/30 transition-colors">
                    <td className="px-4 py-3 text-muted-foreground">{i + 1}</td>
                    <td className="px-4 py-3 font-medium">{o.orderNumber || "-"}</td>
                    <td className="px-4 py-3">{o.cashierName || o.createdBy || "-"}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(o.createdAt).toTimeString().slice(0, 5)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono">{formatIDR(o.totalPrice)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${orderStatusBadge(o.status)}`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">{o.paymentMethod || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default CashRegisterDetail;
