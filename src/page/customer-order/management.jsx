import React, { useState, useEffect, useCallback } from "react";
import { useGlobalStoreFilter } from "@/hooks/useGlobalStoreFilter";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import { Clock, ChefHat, User, Store, Loader2, Utensils } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/SearchInput";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { axiosInstance } from "@/services";
import { useQuery } from "react-query";
import StoreFilter from "@/components/ui/StoreFilter";
import { Skeleton } from "@/components/ui/skeleton";
import { getAllLocation } from "@/services/location";
import NoStore from "@/components/ui/NoStore";

const CustomerOrderManagement = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [cookie] = useCookies();
  const user = cookie?.user;
  const isSuperAdmin = user?.roleType === "super_admin";
  const store = cookie?.activeStore || cookie.user?.store;
  const [storeFilter, setGlobalStoreFilter] = useGlobalStoreFilter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [acceptingId, setAcceptingId] = useState(null);

  const { data: locData, isLoading: isLoadingLocations } = useQuery(["locations-customer-orders"], () => getAllLocation("all"), {
    
    enabled: isSuperAdmin
  });

  const fetchOrders = useCallback(() => {
    const effectiveStore = isSuperAdmin
      ? storeFilter === "all"
        ? ""
        : storeFilter || store
      : store;
    if (!isSuperAdmin && !effectiveStore) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const params = new URLSearchParams({ source: "qr", status: "pending", limit: "100" });
    if (effectiveStore) params.set("store", effectiveStore);
    axiosInstance
      .get(`/order/get-orders?${params.toString()}`)
      .then((res) => setOrders(res.data?.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [store, storeFilter, isSuperAdmin]);

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
      toast.success(t("page.customerOrder.accepted", { orderNumber: order.orderNumber }));
      setOrders((prev) => prev.filter((o) => o.id !== order.id));
    } catch (e) {
      toast.error(e?.response?.data?.message || t("page.customerOrder.acceptFailed"));
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
    <div className="space-y-6">
      <div>
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <button
            onClick={() => navigate("/dashboard-super-admin")}
            className="hover:text-foreground transition-colors">
            {t("breadcrumb.home")}
          </button>
          <span className="text-xs">/</span>
          <span className="text-primary font-semibold">{t("sidebar.customerOrder")}</span>
        </nav>
      </div>

      <div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{t("sidebar.customerOrder")}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {t("page.customerOrder.pendingDesc", { count: orders.length })}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchOrders} disabled={loading}>
            {loading ? <Loader2 size={14} className="animate-spin mr-1" /> : null}
            {t("page.customerOrder.refresh")}
          </Button>
        </div>
      </div>

      {locData && (locData?.data || []).length === 0 ? (
        <NoStore />
      ) : (
        <>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
            {isLoadingLocations ? (
              <>
                <Skeleton className="h-9 w-48 rounded-md" />
                <Skeleton className="h-9 w-full md:w-64 rounded-md" />
              </>
            ) : (
              <>
                {isSuperAdmin && (
                  <StoreFilter
                    locations={(locData?.data || []).filter((l) => l.status === "active")}
                    value={storeFilter}
                    onChange={(v) => setGlobalStoreFilter(v)}
                    isSuperAdmin={isSuperAdmin}
                    t={t}
                  />
                )}
                <SearchInput
                  value={search}
                  onChange={setSearch}
                  placeholder={t("page.customerOrder.searchOrders")}
                  isLoading={loading}
                />
              </>
            )}
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-32 rounded-xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <Card className="p-12 text-center text-muted-foreground">
              {search ? t("page.customerOrder.noMatching") : t("page.customerOrder.noPending")}
            </Card>
          ) : (
            <div className="grid gap-3">
              {filtered.map((order) => {
                // const itemCount = order.items?.length || 0;
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
                              {t("page.customerOrder.table")} {order.table.name}
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
                                {Number(
                                  item.totalPrice || item.price * item.quantity
                                ).toLocaleString("id-ID")}
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
                          {t("page.customerOrder.accept")}
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CustomerOrderManagement;
