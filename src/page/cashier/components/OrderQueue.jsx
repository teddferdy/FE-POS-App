import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { useQuery } from "react-query";
import { Clock, Users, Utensils, ShoppingBag, ChevronRight } from "lucide-react";
import { getOrdersByStore } from "@/services/order";
import { Skeleton } from "@/components/ui/skeleton";

const statusConfig = {
  pending: { color: "bg-amber-500", textColor: "text-amber-600 dark:text-amber-400", label: "Pending" },
  confirmed: { color: "bg-blue-500", textColor: "text-blue-600 dark:text-blue-400", label: "Confirmed" },
  preparing: { color: "bg-blue-500", textColor: "text-blue-600 dark:text-blue-400", label: "Preparing" },
  ready: { color: "bg-emerald-500", textColor: "text-emerald-600 dark:text-emerald-400", label: "Ready" }
};

function timeAgo(dateStr) {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin} minutes ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} hours ago`;
  return `${Math.floor(diffHr / 24)} days ago`;
}

const OrderCard = ({ order, onClick }) => {
  const { t } = useTranslation();
  const status = statusConfig[order.status] || statusConfig.pending;
  const isDineIn = !!order.tableId;
  const itemCount = order.totalQuantity || order.items?.length || 0;

  return (
    <button
      onClick={() => onClick(order)}
      className="shrink-0 w-56 bg-card border border-border/60 rounded-xl p-3.5 hover:border-primary/50 hover:shadow-md hover:shadow-primary/5 transition-all text-left group">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-bold text-foreground">
          #{order.orderNumber?.slice(-5) || order.id}
        </span>
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${status.color} text-white`}>
          {t(`page.cashier.orderQueue.status.${order.status}`, status.label)}
        </span>
      </div>
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
        {isDineIn ? <Utensils size={12} /> : <ShoppingBag size={12} />}
        <span>
          {isDineIn
            ? `${t("page.cashier.orderQueue.dineIn")} / ${t("page.cashier.orderQueue.table")} ${order.tableId}`
            : t("page.cashier.orderQueue.takeaway")}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {itemCount} {t("page.cashier.orderQueue.items")}
        </span>
        <span className="text-[10px] text-muted-foreground/70 flex items-center gap-1">
          <Clock size={10} />
          {timeAgo(order.createdAt)}
        </span>
      </div>
    </button>
  );
};

const OrderQueueSkeleton = () => (
  <div className="flex gap-3 px-4 lg:px-6">
    {[1, 2, 3].map((i) => (
      <div key={i} className="shrink-0 w-56 bg-card border border-border/60 rounded-xl p-3.5 space-y-2">
        <div className="flex justify-between">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-14 rounded-full" />
        </div>
        <Skeleton className="h-3 w-28" />
        <div className="flex justify-between">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
    ))}
  </div>
);

const OrderQueue = ({ store, onLoadOrder }) => {
  const { t } = useTranslation();

  const fetchOrders = async (status) => {
    const res = await getOrdersByStore({ location: store, status, limit: 50 });
    return res?.data || [];
  };

  const { data: pendingOrders, isLoading: pendingLoading } = useQuery(
    ["cashier-orders-pending", store],
    () => fetchOrders("pending"),
    { enabled: !!store, refetchInterval: 30000 }
  );

  const { data: confirmedOrders, isLoading: confirmedLoading } = useQuery(
    ["cashier-orders-confirmed", store],
    () => fetchOrders("confirmed"),
    { enabled: !!store, refetchInterval: 30000 }
  );

  const { data: preparingOrders, isLoading: preparingLoading } = useQuery(
    ["cashier-orders-preparing", store],
    () => fetchOrders("preparing"),
    { enabled: !!store, refetchInterval: 30000 }
  );

  const { data: readyOrders, isLoading: readyLoading } = useQuery(
    ["cashier-orders-ready", store],
    () => fetchOrders("ready"),
    { enabled: !!store, refetchInterval: 30000 }
  );

  const allOrders = useMemo(() => {
    const orders = [
      ...(pendingOrders || []),
      ...(confirmedOrders || []),
      ...(preparingOrders || []),
      ...(readyOrders || [])
    ];
    return orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [pendingOrders, confirmedOrders, preparingOrders, readyOrders]);

  const isLoading = pendingLoading || confirmedLoading || preparingLoading || readyLoading;

  if (!store) return null;

  return (
    <div className="shrink-0">
      {isLoading ? (
        <OrderQueueSkeleton />
      ) : allOrders.length > 0 ? (
        <div className="overflow-x-auto scrollbar-none">
          <div className="flex gap-3 px-4 lg:px-6 pb-1">
            {allOrders.map((order) => (
              <OrderCard key={order.id} order={order} onClick={onLoadOrder} />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
};

OrderQueue.propTypes = {
  store: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onLoadOrder: PropTypes.func.isRequired
};

export default OrderQueue;
