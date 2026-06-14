import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Store, ShoppingBag, Clock, QrCode } from "lucide-react";
import { axiosInstance } from "@/services";

const statusLabel = {
  pending: "Menunggu",
  preparing: "Disiapkan",
  ready: "Siap",
  served: "Tersaji"
};

const statusColor = {
  pending: "text-yellow-600 bg-yellow-50",
  preparing: "text-blue-600 bg-blue-50",
  ready: "text-green-600 bg-green-50",
  served: "text-gray-600 bg-gray-50"
};

const formatCurrency = (val) => `Rp${(val || 0).toLocaleString("id-ID")}`;

const CustomerDisplay = () => {
  const [searchParams] = useSearchParams();
  const tableId = searchParams.get("table");
  const storeId = searchParams.get("store");
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);

  const fetchOrders = useCallback(async () => {
    if (!tableId) return;
    try {
      const res = await axiosInstance.get(
        `/order/get-orders?store=${storeId || ""}&table=${tableId}`
      );
      const activeOrders = (res.data?.data || []).filter(
        o => !["paid", "cancelled", "void"].includes(o.status)
      );
      setOrders(activeOrders);
      setError(null);
    } catch (e) {
      setError(e.message);
    }
  }, [tableId, storeId]);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  if (!tableId) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
        <div className="text-center">
          <QrCode size={64} className="mx-auto mb-4 opacity-50" />
          <p className="text-xl font-bold mb-2">Customer Display</p>
          <p className="text-gray-400">Scan QR di meja untuk melihat pesanan</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
      <header className="max-w-3xl mx-auto mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Store size={28} className="text-orange-400" />
          <h1 className="text-2xl font-bold">Pesanan Saya</h1>
        </div>
        <p className="text-gray-400">Meja #{tableId}</p>
      </header>

      <main className="max-w-3xl mx-auto space-y-6">
        {orders.length === 0 && !error && (
          <div className="text-center py-16">
            <ShoppingBag size={64} className="mx-auto mb-4 text-gray-600" />
            <p className="text-xl text-gray-400">Belum ada pesanan</p>
            <p className="text-sm text-gray-600 mt-2">Pesanan akan muncul di sini</p>
          </div>
        )}

        {error && (
          <div className="bg-red-900/30 border border-red-800 rounded-lg p-4 text-center">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {orders.map(order => (
          <div key={order.id} className="bg-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-400">{order.orderNumber}</p>
                <p className="text-xs text-gray-500">
                  <Clock size={12} className="inline mr-1" />
                  {new Date(order.createdAt).toLocaleTimeString("id-ID")}
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-sm bg-orange-500/20 text-orange-400">
                {order.status === "pending" ? "Berjalan" : order.status}
              </span>
            </div>

            <div className="space-y-3">
              {(order.items || []).map(item => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 bg-gray-700/50 rounded-lg p-3"
                >
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColor[item.status] || "text-gray-400"}`}>
                    {statusLabel[item.status] || item.status}
                  </span>
                  <div className="flex-1">
                    <p className="font-medium">{item.productName}</p>
                    {item.notes && (
                      <p className="text-xs text-gray-400 mt-0.5">Catatan: {item.notes}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">{item.quantity}x</p>
                    <p className="text-xs text-gray-400">{formatCurrency(item.totalPrice)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-700 flex justify-between text-lg font-bold">
              <span>Total</span>
              <span className="text-orange-400">{formatCurrency(order.totalPrice)}</span>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
};

export default CustomerDisplay;
