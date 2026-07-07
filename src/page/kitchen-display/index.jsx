import React, { useEffect, useCallback, useState } from "react";
// import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { useCookies } from "react-cookie";
import { useSocket } from "@/services/socket";
import { getKitchenOrders, updateOrderItemStatus } from "@/services/kitchen";
import { getAllLocation } from "@/services/location";
import NoStore from "@/components/ui/NoStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";
import {
  Clock,
  ChefHat,
  CheckCircle2,
  Bell,
  CookingPot,
  Utensils,
  ListOrdered
} from "lucide-react";
import AbortController from "@/components/organism/abort-controller";
import StoreFilter from "@/components/ui/StoreFilter";

const statusConfig = {
  pending: {
    label: "Menunggu",
    icon: Clock,
    color: "bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800",
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
    next: "preparing",
    nextLabel: "Ambil"
  },
  preparing: {
    label: "Dimasak",
    icon: CookingPot,
    color: "bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800",
    badge: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    next: "ready",
    nextLabel: "Selesai"
  },
  ready: {
    label: "Siap Saji",
    icon: CheckCircle2,
    color: "bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800",
    badge: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
    next: "served",
    nextLabel: "Sajikan"
  }
};

const statusColumns = ["pending", "preparing", "ready"];

const formatTime = (date) => {
  const d = new Date(date);
  return d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
};

const timeAgo = (date) => {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "baru saja";
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  return `${hours}j ${mins % 60}m`;
};

const KitchenDisplay = () => {
  const { t } = useTranslation();
  // const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [cookie] = useCookies();
  const { socket } = useSocket();
  const user = cookie?.user;
  const isSuperAdmin = user?.roleType === "super_admin";
  const [storeFilter, setStoreFilter] = useState("all");
  const storeId = isSuperAdmin
    ? storeFilter && storeFilter !== "all"
      ? storeFilter
      : ""
    : cookie?.activeStore || cookie?.user?.store;

  const { data: locData } = useQuery(["locations-kitchen"], () => getAllLocation(), {
    staleTime: 5 * 60 * 1000,
    enabled: isSuperAdmin
  });

  const { data, isLoading, isError, refetch } = useQuery(
    ["kitchen-orders", storeId],
    () => getKitchenOrders(storeId ? { store: storeId } : {}),
    { enabled: !!storeId || storeId === "", refetchInterval: 15000, keepPreviousData: true }
  );
  const orders = data?.data || [];

  useEffect(() => {
    if (socket && storeId) {
      socket.emit("join-kitchen", storeId);
      return () => socket.emit("leave-kitchen", storeId);
    } else if (socket && storeId === "") {
      socket.emit("join-kitchen", "all");
      return () => socket.emit("leave-kitchen", "all");
    }
  }, [socket, storeId]);

  const playNotificationSound = useCallback(() => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 800;
      osc.type = "sine";
      gain.gain.value = 0.3;
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
      setTimeout(() => {
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.frequency.value = 1000;
        osc2.type = "sine";
        gain2.gain.value = 0.3;
        osc2.start();
        osc2.stop(ctx.currentTime + 0.15);
      }, 200);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (!socket) return;
    const handleNewOrder = () => {
      queryClient.invalidateQueries(["kitchen-orders"]);
      playNotificationSound();
    };
    const handleUpdate = () => queryClient.invalidateQueries(["kitchen-orders"]);

    socket.on("new-order", handleNewOrder);
    socket.on("order-updated", handleUpdate);
    socket.on("item-status-updated", handleUpdate);

    return () => {
      socket.off("new-order", handleNewOrder);
      socket.off("order-updated", handleUpdate);
      socket.off("item-status-updated", handleUpdate);
    };
  }, [socket, queryClient, playNotificationSound]);

  const updateMut = useMutation(
    ({ orderId, itemId, status }) => updateOrderItemStatus(orderId, itemId, status),
    { onSuccess: () => queryClient.invalidateQueries(["kitchen-orders"]) }
  );

  const getOrdersByStatus = (status) =>
    orders.filter((o) => o.items?.some((i) => i.status === status));

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ChefHat className="text-primary" /> {t("page.kitchenDisplay.title")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{t("page.kitchenDisplay.subtitle")}</p>
        </div>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Bell size={16} />
          <span>{orders.reduce((s, o) => s + (o.items?.length || 0), 0)} item</span>
        </div>
      </div>

      {isSuperAdmin && (
        <div className="mb-4">
          <StoreFilter
            locations={locData?.data || []}
            value={storeFilter}
            onChange={(v) => setStoreFilter(v)}
            isSuperAdmin={isSuperAdmin}
            t={t}
          />
        </div>
      )}

      {locData && (locData?.data || []).length === 0 ? (
        <NoStore />
      ) : (
        <>
          {isError ? (
            <AbortController refetch={refetch} />
          ) : isLoading ? (
            <div className="grid grid-cols-3 gap-4 shrink-0">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="h-10 w-32" />
                  <Skeleton className="h-40 w-full" />
                  <Skeleton className="h-40 w-full" />
                </div>
              ))}
            </div>
          ) : (
            // ponytail: flex-1 min-h-0 fills remaining space instead of hardcoded calc — tips card now lives above
            <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-3 gap-4">
              {statusColumns.map((colStatus) => {
                const cfg = statusConfig[colStatus];
                const Icon = cfg.icon;
                const colOrders = getOrdersByStatus(colStatus);

                return (
                  <div key={colStatus} className="flex flex-col h-full">
                    <div
                      className={`flex items-center justify-between px-4 py-3 rounded-t-xl border ${cfg.color}`}>
                      <div className="flex items-center gap-2 font-semibold">
                        <Icon size={18} />
                        {t(`page.kitchenDisplay.status.${colStatus}`)}
                      </div>
                      <Badge className={cfg.badge}>{colOrders.length}</Badge>
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-3 p-3 border-x border-b rounded-b-xl bg-card">
                      {colOrders.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-32 text-muted-foreground text-sm">
                          <ListOrdered size={32} className="mb-2 opacity-30" />
                          {t("page.kitchenDisplay.noOrders")}
                        </div>
                      ) : (
                        colOrders.map((order) => {
                          const colItems = (order.items || []).filter(
                            (i) => i.status === colStatus
                          );
                          return (
                            <div
                              key={order.id}
                              className="bg-muted/30 rounded-lg p-3 border border-border">
                              <div className="flex items-center justify-between mb-2">
                                <div>
                                  <span className="font-bold text-sm">
                                    #{order.orderNumber || order.id}
                                  </span>
                                  {order.table && (
                                    <span className="ml-2 text-xs text-muted-foreground">
                                      <Utensils size={12} className="inline mr-0.5" />
                                      {order.table.name}
                                    </span>
                                  )}
                                </div>
                                <span className="text-[10px] text-muted-foreground">
                                  {timeAgo(order.createdAt)}
                                </span>
                              </div>
                              <div className="space-y-1.5">
                                {colItems.map((item) => (
                                  <div
                                    key={item.id}
                                    className="flex items-center justify-between bg-background rounded-md px-3 py-2 text-sm">
                                    <div className="flex-1 min-w-0">
                                      <p className="font-medium truncate">
                                        {item.productName}
                                        {item.quantity > 1 && (
                                          <span className="ml-1 text-muted-foreground">
                                            x{item.quantity}
                                          </span>
                                        )}
                                      </p>
                                      {item.notes && (
                                        <p className="text-[11px] text-muted-foreground truncate">
                                          {t("page.kitchenDisplay.notesLabel")}: {item.notes}
                                        </p>
                                      )}
                                      {item.modifiers?.length > 0 && (
                                        <p className="text-[11px] text-muted-foreground truncate">
                                          {item.modifiers.map((m) => m.name || m).join(", ")}
                                        </p>
                                      )}
                                    </div>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="ml-2 shrink-0 h-7 text-xs"
                                      onClick={() =>
                                        updateMut.mutate({
                                          orderId: order.id,
                                          itemId: item.id,
                                          status: cfg.next
                                        })
                                      }>
                                      {t(`page.kitchenDisplay.nextLabel.${colStatus}`)}
                                    </Button>
                                  </div>
                                ))}
                              </div>
                              <div className="mt-2 text-[10px] text-muted-foreground text-right">
                                {formatTime(order.createdAt)}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default KitchenDisplay;
