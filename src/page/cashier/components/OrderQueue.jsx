import React, { useCallback, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { useQuery, useQueryClient } from "react-query";
import { Clock, Utensils, ShoppingBag, Wallet } from "lucide-react";
import { getOrdersByStore } from "@/services/order";
import { getCurrentCashRegister } from "@/services/cash-register";
import { useSocket } from "@/services/socket";
import { Skeleton } from "@/components/ui/skeleton";
import ScrollRail from "@/components/ui/ScrollRail";

const statusConfig = {
  pending: {
    color: "bg-amber-500",
    textColor: "text-amber-600 dark:text-amber-400",
    label: "Pending"
  },
  confirmed: {
    color: "bg-blue-500",
    textColor: "text-blue-600 dark:text-blue-400",
    label: "Confirmed"
  },
  preparing: {
    color: "bg-blue-500",
    textColor: "text-blue-600 dark:text-blue-400",
    label: "Preparing"
  },
  ready: {
    color: "bg-emerald-500",
    textColor: "text-emerald-600 dark:text-emerald-400",
    label: "Ready"
  },
  served: {
    color: "bg-purple-500",
    textColor: "text-purple-600 dark:text-purple-400",
    label: "Served"
  }
};

const paymentStatusConfig = {
  paid: {
    color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
  },
  partial: {
    color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
  },
  unpaid: {
    color: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30"
  },
  refunded: {
    color: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/30"
  }
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

// Phase 39 Batch 6B: `readOnly` is set only for a PREVIOUS-register order
// whose payment is already finalized (paymentStatus === "paid" — the same
// definition canCollectPayment already used to know nothing is left to
// collect). It never applies to the current register or to unassigned/
// self-orders, which stay fully actionable regardless of payment state,
// per spec. `registerId` is purely a display label (order.cashRegisterId,
// nothing invented) shown only outside the current-register bucket.
const OrderCard = ({ order, onClick, onCollectPayment, readOnly = false, registerId = null }) => {
  const { t } = useTranslation();
  const status = statusConfig[order.status] || statusConfig.pending;
  const payCfg = paymentStatusConfig[order.paymentStatus] || paymentStatusConfig.unpaid;
  const isDineIn = !!order.tableId;
  const itemCount = order.totalQuantity || order.items?.length || 0;
  // F4-01: every order this queue lists is, by construction, not yet paid
  // (a POS-created order is created already status:'paid' and never appears
  // here) — so "Collect Payment" is offered whenever the caller wired it up,
  // regardless of the order's kitchen-progress status.
  const canCollectPayment =
    !readOnly && typeof onCollectPayment === "function" && order.paymentStatus !== "paid";

  const cardBody = (
    <>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-bold text-foreground">
          #{order.orderNumber?.slice(-5) || order.id}
        </span>
        <span
          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${status.color} text-white`}>
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
      <div className="flex flex-wrap items-center gap-1 mb-1.5">
        {order.paymentStatus && (
          <span
            className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full border ${payCfg.color}`}>
            {t(`page.cashier.orderQueue.paymentStatus.${order.paymentStatus}`, order.paymentStatus)}
          </span>
        )}
        {order.source && order.source !== "pos" && (
          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full border border-border/60 text-muted-foreground uppercase">
            {t(`page.delivery.source.${order.source}`, order.source)}
          </span>
        )}
        {registerId != null && (
          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full border border-border/60 text-muted-foreground">
            {t("page.cashier.orderQueue.registerLabel", { id: registerId })}
          </span>
        )}
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
    </>
  );

  return (
    <div
      className={`shrink-0 w-56 bg-card border border-border/60 rounded-xl p-3.5 transition-all group space-y-2.5 ${readOnly ? "opacity-80" : "hover:border-primary/50 hover:shadow-md hover:shadow-primary/5"}`}>
      {readOnly ? (
        <div className="w-full text-left" aria-label={t("page.cashier.orderQueue.readOnly")}>
          {cardBody}
        </div>
      ) : (
        <button onClick={() => onClick(order)} className="w-full text-left">
          {cardBody}
        </button>
      )}
      {canCollectPayment && (
        <button
          type="button"
          aria-label={t("page.cashier.orderQueue.collectPayment")}
          onClick={(e) => {
            e.stopPropagation();
            onCollectPayment(order);
          }}
          className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
          <Wallet size={12} />
          {t("page.cashier.orderQueue.collectPayment")}
        </button>
      )}
    </div>
  );
};

const OrderQueueSkeleton = () => (
  <div className="flex gap-3 px-4 mt-6 lg:px-6">
    {[1, 2, 3].map((i) => (
      <div
        key={i}
        className="shrink-0 w-56 bg-card border border-border/60 rounded-xl p-3.5 space-y-2">
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

const OrderQueue = ({ store, onLoadOrder, onCollectPayment }) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  // Defensive fallback (`|| {}`): unlike KDS/WaiterRequestList, several
  // existing OrderQueue tests render this component with no SocketProvider
  // in the tree at all, so useSocket() legitimately returns null there.
  const { socket, connected } = useSocket() || {};
  const fetchOrders = async (status) => {
    const res = await getOrdersByStore({ location: store, status, limit: 50 });
    return res?.data || [];
  };

  // Phase 39 Batch 6B: register-session awareness for display/actionability
  // ONLY — none of the 5 fetch calls above gain a cashRegisterId filter, and
  // this query never changes what gets requested from them. Reuses the
  // existing getCurrentCashRegister mechanism (same one CashRegisterCurrent
  // uses) rather than inferring "current" from any date/time heuristic.
  const { data: currentRegisterData, isLoading: currentRegisterLoading } = useQuery(
    ["order-queue-current-register", store],
    () => getCurrentCashRegister(store),
    { enabled: !!store }
  );
  const currentRegister = currentRegisterData?.data?.register || currentRegisterData?.data || null;
  const currentRegisterId = currentRegister?.id ?? null;
  // Until this resolves, we genuinely don't know which orders are
  // "current" — bucketing must not guess (see allOrders below).
  const currentRegisterKnown = !currentRegisterLoading;

  // Phase 20 Batch 2: realtime-first with polling fallback, mirroring the
  // exact pattern already established by kitchen-display/index.jsx and
  // WaiterRequestList.jsx. Branch on `connected` (not `socket` truthiness) —
  // a socket.io client object exists as soon as it's constructed, well
  // before (or even if never) it actually connects.
  //
  // Only 4 of the 5 statuses have a real backend event to react to (see the
  // socket effect below for exactly which ones and why) — 'confirmed' has no
  // corresponding emit anywhere in BE-POS-App today (order.js's
  // updateOrderItemStatus cascade only ever targets pending/preparing/ready/
  // served), so its poll stays unconditionally on rather than silently going
  // stale forever once connected. This is a real, audited backend contract
  // gap, not an oversight — see the Phase 20 Batch 2 report.
  const pollFallback = connected ? false : 30000;

  const { data: pendingOrders, isLoading: pendingLoading } = useQuery(
    ["cashier-orders-pending", store],
    () => fetchOrders("pending"),
    { enabled: !!store, refetchInterval: pollFallback }
  );

  const { data: confirmedOrders, isLoading: confirmedLoading } = useQuery(
    ["cashier-orders-confirmed", store],
    () => fetchOrders("confirmed"),
    { enabled: !!store, refetchInterval: 30000 }
  );

  const { data: preparingOrders, isLoading: preparingLoading } = useQuery(
    ["cashier-orders-preparing", store],
    () => fetchOrders("preparing"),
    { enabled: !!store, refetchInterval: pollFallback }
  );

  const { data: readyOrders, isLoading: readyLoading } = useQuery(
    ["cashier-orders-ready", store],
    () => fetchOrders("ready"),
    { enabled: !!store, refetchInterval: pollFallback }
  );

  // P5-03: a served QR order must stay reachable in the queue for payment —
  // it has the same payment/collect-payment semantics as every other
  // unpaid order listed here.
  const { data: servedOrders, isLoading: servedLoading } = useQuery(
    ["cashier-orders-served", store],
    () => fetchOrders("served"),
    { enabled: !!store, refetchInterval: pollFallback }
  );

  const invalidatePending = useCallback(() => {
    queryClient.invalidateQueries(["cashier-orders-pending", store]);
  }, [queryClient, store]);

  // Covers exactly the statuses updateOrderItemStatus's cascade can produce
  // (api/controller/order.js: statusMap = {pending, preparing, ready,
  // served}) — deliberately excludes 'confirmed', which that cascade never
  // targets, so this event can never make it stale.
  const invalidateKitchenCascade = useCallback(() => {
    queryClient.invalidateQueries(["cashier-orders-pending", store]);
    queryClient.invalidateQueries(["cashier-orders-preparing", store]);
    queryClient.invalidateQueries(["cashier-orders-ready", store]);
    queryClient.invalidateQueries(["cashier-orders-served", store]);
  }, [queryClient, store]);

  useEffect(() => {
    if (!socket || !store) return;
    // BE-POS-App's emitNewOrder/emitItemStatusUpdate (api/service/socket.js)
    // broadcast to the `kitchen-${storeId}` room — the same room
    // kitchen-display already joins. Room membership is verified
    // server-side against the caller's own JWT `store` claim
    // (canJoinStore), so this can never receive another store's events.
    socket.emit("join-kitchen", store);

    const handleNewOrder = () => invalidatePending();
    const handleItemStatusUpdate = () => invalidateKitchenCascade();
    // A disconnect/reconnect window can silently miss domain events that
    // fired while offline — reconcile everything on every (re)connect,
    // matching WaiterRequestList/KitchenDisplay's own reconnect handling.
    const handleReconnect = () => {
      invalidatePending();
      invalidateKitchenCascade();
    };

    socket.on("new-order", handleNewOrder);
    socket.on("item-status-updated", handleItemStatusUpdate);
    socket.on("connect", handleReconnect);

    return () => {
      socket.off("new-order", handleNewOrder);
      socket.off("item-status-updated", handleItemStatusUpdate);
      socket.off("connect", handleReconnect);
      socket.emit("leave-kitchen", store);
    };
  }, [socket, store, invalidatePending, invalidateKitchenCascade]);

  const allOrders = useMemo(() => {
    // statuses are disjoint server-side, but guard against the same order
    // leaking into two results during a transition — key by id (the served
    // entry wins, being last) so no order is ever rendered twice.
    const byId = new Map();
    const push = (list) =>
      (list || []).forEach((o) => {
        if (o && o.id != null) byId.set(String(o.id), o);
      });
    push(pendingOrders);
    push(confirmedOrders);
    push(preparingOrders);
    push(readyOrders);
    push(servedOrders);
    return Array.from(byId.values()).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [pendingOrders, confirmedOrders, preparingOrders, readyOrders, servedOrders]);

  // Phase 39 Batch 6B: classify by order.cashRegisterId vs. the current
  // register's id — never by date/createdAt/openedAt/calendar day. null
  // specifically means unassigned/self-order, never "previous register".
  // While currentRegisterKnown is false, bucketing is skipped entirely
  // (everything renders in the single flat "current" list exactly as
  // before Batch 6B) so a valid current-register order can never be
  // transiently mislabeled previous-register while this query is still
  // loading.
  const buckets = useMemo(() => {
    if (!currentRegisterKnown) {
      return { current: allOrders, previous: [], unassigned: [] };
    }
    const current = [];
    const previous = [];
    const unassigned = [];
    for (const order of allOrders) {
      if (order.cashRegisterId == null) {
        unassigned.push(order);
      } else if (currentRegisterId != null && order.cashRegisterId === currentRegisterId) {
        current.push(order);
      } else {
        previous.push(order);
      }
    }
    return { current, previous, unassigned };
  }, [allOrders, currentRegisterId, currentRegisterKnown]);

  // Only previous-register orders that are fully paid become read-only —
  // the same "nothing left to collect" definition canCollectPayment already
  // used. Unpaid/pending previous-register orders, and every unassigned/
  // self-order regardless of payment state, stay fully actionable.
  const isFinalized = (order) => order.paymentStatus === "paid";

  // The common case (no previous/unassigned orders at all) renders exactly
  // as it did before Batch 6B — one flat rail, no section headers — so nothing
  // changes visually for a store that has never had a stale/self-order.
  const hasMultipleBuckets = buckets.previous.length > 0 || buckets.unassigned.length > 0;

  const isLoading =
    pendingLoading || confirmedLoading || preparingLoading || readyLoading || servedLoading;

  if (!store) return null;

  // Phase 39 Batch 6B: a section is one ScrollRail. The current-register
  // rail always keeps the original testid/fade-prefix ("order-queue-rail" /
  // "order-queue") and the original "mt-6" gutter spacing — both proven by
  // pre-existing tests — so the common single-bucket case is byte-for-byte
  // unaffected. Extra sections only ever appear alongside it, never in its
  // place.
  const sectionMeta = {
    current: {
      railTestId: "order-queue-rail",
      fadeTestIdPrefix: "order-queue",
      labelKey: "page.cashier.orderQueue.currentRegister"
    },
    previous: {
      railTestId: "order-queue-rail-previous",
      fadeTestIdPrefix: "order-queue-previous",
      labelKey: "page.cashier.orderQueue.previousRegister"
    },
    unassigned: {
      railTestId: "order-queue-rail-unassigned",
      fadeTestIdPrefix: "order-queue-unassigned",
      labelKey: "page.cashier.orderQueue.unassignedOrders"
    }
  };

  const renderSection = (bucketKey, orders, { sectionReadOnly = false, showLabel = false }) => {
    if (orders.length === 0) return null;
    const meta = sectionMeta[bucketKey];
    return (
      <div key={meta.railTestId}>
        {showLabel && (
          <div className="px-4 lg:px-6 mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            {t(meta.labelKey)}
          </div>
        )}
        <ScrollRail
          leftLabel={t("page.cashier.orderQueue.scrollLeft")}
          rightLabel={t("page.cashier.orderQueue.scrollRight")}
          railTestId={meta.railTestId}
          fadeTestIdPrefix={meta.fadeTestIdPrefix}
          gutterClassName={`${showLabel ? "" : "mt-6 "}flex items-center gap-2 px-4 lg:px-6`}
          railClassName="pb-1">
          <div className="flex gap-3">
            {orders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onClick={onLoadOrder}
                onCollectPayment={onCollectPayment}
                readOnly={sectionReadOnly && isFinalized(order)}
                registerId={bucketKey === "previous" ? order.cashRegisterId : null}
              />
            ))}
          </div>
        </ScrollRail>
      </div>
    );
  };

  return (
    <div className="shrink-0">
      {isLoading ? (
        <OrderQueueSkeleton />
      ) : allOrders.length > 0 ? (
        hasMultipleBuckets ? (
          <div className="mt-6 space-y-4">
            {renderSection("current", buckets.current, { showLabel: true })}
            {renderSection("previous", buckets.previous, {
              sectionReadOnly: true,
              showLabel: true
            })}
            {renderSection("unassigned", buckets.unassigned, { showLabel: true })}
          </div>
        ) : (
          // Common case: nothing outside the current-register bucket —
          // render exactly as before Batch 6B, no section headers.
          renderSection("current", buckets.current, {})
        )
      ) : null}
    </div>
  );
};

OrderQueue.propTypes = {
  store: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onLoadOrder: PropTypes.func.isRequired,
  onCollectPayment: PropTypes.func
};

export default OrderQueue;
