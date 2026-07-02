import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import {
  ShoppingCart,
  Clock,
  ChefHat,
  CheckCircle2,
  Phone,
  User,
  Store,
  QrCode,
  Search,
  ArrowRight,
  Loader2,
  Utensils
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { axiosInstance } from "@/services";

const CustomerOrderManagement = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [cookie] = useCookies();
  const store = cookie?.activeStore || cookie.user?.store;
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [acceptingId, setAcceptingId] = useState(null);

  const fetchOrders = useCallback(() => {
    if (!store) {
      setLoading(false);
      return;
    }
    setLoading(true);
    axiosInstance
      .get(`/order/get-orders?store=${store}&source=qr&status=pending&limit=100`)
      .then((res) => setOrders(res.data?.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [store]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const acceptOrder = async (order) => {
    setAcceptingId(order.id);
    try {
      await axiosInstance.put("/order/update-status", {
        id: order.id,
        store,
        status: "preparing",
        changedBy: cookie.user?.id,
        changedByName: cookie.user?.fullName || cookie.user?.userName
      });
      toast.success(`Order #${order.orderNumber} accepted → Kitchen`);
      setOrders((prev) => prev.filter((o) => o.id !== order.id));
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to accept order");
    } finally {
      setAcceptingId(null);
    }
  };

  const filtered = orders.filter((o) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      o.orderNumber?.toLowerCase().includes(q) ||
      o.customerName?.toLowerCase().includes(q) ||
      o.items?.some((i) => i.productName?.toLowerCase().includes(q))
    );
  });

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <QrCode className="text-primary" size={24} />
            {t("sidebar.customerOrder")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {orders.length} pending {orders.length === 1 ? "order" : "orders"} — review & accept to
            send to kitchen
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchOrders} disabled={loading}>
          {loading ? <Loader2 size={14} className="animate-spin mr-1" /> : null}
          Refresh
        </Button>
      </div>

      <Input
        placeholder="Search by order number, customer name, or item..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-md"
      />

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-32 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="p-12 text-center text-muted-foreground">
          {search ? "No matching orders" : "No pending QR orders"}
        </Card>
      ) : (
        <div className="grid gap-3">
          {filtered.map((order) => {
            const itemCount = order.items?.length || 0;
            return (
              <Card key={order.id} className="p-4 border-l-4 border-l-primary">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm">{order.orderNumber}</span>
                      <Badge variant="secondary" className="text-[10px]">
                        <Clock size={10} className="mr-1" />
                        {new Date(order.createdAt).toLocaleTimeString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                      {order.customerName && (
                        <span className="flex items-center gap-1">
                          <User size={12} />
                          {order.customerName}
                        </span>
                      )}
                      {order.table && (
                        <span className="flex items-center gap-1">
                          <Store size={12} />
                          Table {order.table.name}
                        </span>
                      )}
                    </div>
                    <div className="mt-2 space-y-0.5">
                      {order.items?.map((item) => (
                        <div key={item.id} className="flex items-center gap-2 text-sm">
                          <Utensils size={12} className="text-muted-foreground shrink-0" />
                          <span className="font-medium">{item.quantity}x</span>
                          <span className="truncate">{item.productName}</span>
                          <span className="text-muted-foreground ml-auto">
                            Rp
                            {Number(item.totalPrice || item.price * item.quantity).toLocaleString(
                              "id-ID"
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className="font-bold text-primary">
                      Rp{Number(order.totalPrice).toLocaleString("id-ID")}
                    </span>
                    <Button
                      onClick={() => acceptOrder(order)}
                      disabled={acceptingId === order.id}
                      className="bg-primary hover:bg-primary/90"
                      size="sm">
                      {acceptingId === order.id ? (
                        <Loader2 size={14} className="animate-spin mr-1" />
                      ) : (
                        <ChefHat size={14} className="mr-1" />
                      )}
                      Accept
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CustomerOrderManagement;
