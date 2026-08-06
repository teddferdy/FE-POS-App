/* eslint-disable react/prop-types */
import React, { useState, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  Plus,
  Minus,
  Trash2,
  SearchX,
  Ban,
  Search,
  ShoppingBag,
  AlertTriangle
} from "lucide-react";
import { useCookies } from "react-cookie";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import EmptyState from "@/components/ui/EmptyState";
import { getOrderById, getOrdersByStore } from "@/services/order";
import { returnOrder } from "@/services/sales-return";
import { getBatches } from "@/services/inventory";
import Modal from "@/components/organism/modal";

const reasonKeys = [
  "damaged",
  "defective",
  "expired",
  "notAsDescribed",
  "customerRequest",
  "qualityIssue",
  "wrongItem",
  "other"
];

const formatRupiah = (value) => `Rp ${(value || 0).toLocaleString("id-ID")}`;

const CreateSalesReturn = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const [cookie] = useCookies();

  const orderId = searchParams.get("orderId");
  const userId = cookie?.user?.id;

  const [items, setItems] = useState([]);
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [confirmModal, setConfirmModal] = useState(false);

  const {
    data: orderData,
    isLoading: orderLoading,
    isError
  } = useQuery(["order-detail", orderId], () => getOrderById(orderId), {
    enabled: !!orderId,
    retry: false
  });

  const order = orderData?.data;

  const { data: batchData } = useQuery(
    ["sales-return-batches", order?.store],
    () => getBatches({ store: order?.store, status: "active" }),
    { enabled: !!order?.store }
  );

  const todayStr = new Date().toISOString().slice(0, 10);

  const productExpiry = useMemo(() => {
    const map = {};
    (batchData?.data || []).forEach((b) => {
      const id = Number(b.product);
      const date = b.expiryDate;
      if (!id || !date) return;
      if (!map[id] || date < map[id].expiryDate) {
        map[id] = { expiryDate: date, expired: date < todayStr };
      }
    });
    return map;
  }, [batchData, todayStr]);

  const hasExpiredSelected = items.some((i) => productExpiry[Number(i.productId)]?.expired);

  const { data: ordersData, isLoading: ordersLoading } = useQuery(
    ["paid-orders-picker"],
    () => getOrdersByStore({ paymentStatus: "paid", limit: 50 }),
    { enabled: !orderId, retry: false }
  );

  const mutation = useMutation(
    () => returnOrder(orderId, { items, reason, returnedBy: userId, notes }),
    {
      onSuccess: () => {
        toast.success(t("page.salesReturn.create.toast.success"));
        queryClient.invalidateQueries(["sales-returns"]);
        navigate("/sales-return");
      },
      onError: (err) => {
        toast.error(err?.response?.data?.message || t("page.salesReturn.create.toast.error"));
      }
    }
  );

  const addItem = (orderItem) => {
    const existing = items.find((i) => i.orderItemId === orderItem.id);
    if (existing) {
      setItems(items.map((i) => (i.orderItemId === orderItem.id ? { ...i, qty: i.qty + 1 } : i)));
    } else {
      setItems([
        ...items,
        {
          orderItemId: orderItem.id,
          productId: orderItem.product,
          productName: orderItem.productName,
          maxQty: orderItem.quantity,
          qty: 1,
          price: orderItem.totalPrice
            ? Math.floor(orderItem.totalPrice / orderItem.quantity)
            : orderItem.price,
          unit: orderItem.unit || "pcs"
        }
      ]);
    }
  };

  const updateQty = (orderItemId, newQty) => {
    if (newQty <= 0) {
      removeItem(orderItemId);
      return;
    }
    const item = items.find((i) => i.orderItemId === orderItemId);
    if (newQty > item.maxQty) {
      toast.error(t("page.salesReturn.create.maxQty", { max: item.maxQty }));
      return;
    }
    setItems(items.map((i) => (i.orderItemId === orderItemId ? { ...i, qty: newQty } : i)));
  };

  const removeItem = (orderItemId) => {
    setItems(items.filter((i) => i.orderItemId !== orderItemId));
  };

  const totalRefund = useMemo(() => {
    return items.reduce((sum, item) => sum + item.price * item.qty, 0);
  }, [items]);

  const canSubmit = items.length > 0 && reason.trim() !== "" && !mutation.isLoading;

  if (!orderId) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={() => navigate("/sales-return")}>
            <ArrowLeft size={16} />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{t("page.salesReturn.create.title")}</h1>
            <p className="text-sm text-muted-foreground">{t("page.salesReturn.create.subtitle")}</p>
          </div>
        </div>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <ShoppingBag size={22} />
            </div>
            <div>
              <h2 className="text-lg font-semibold">
                {t("page.salesReturn.create.selectOrder.title")}
              </h2>
              <p className="text-sm text-muted-foreground">
                {t("page.salesReturn.create.selectOrder.subtitle")}
              </p>
            </div>
          </div>

          <OrderPicker
            isLoading={ordersLoading}
            orders={ordersData?.data || []}
            onSelect={(o) => navigate(`/sales-return/create?orderId=${o.id}`)}
          />
        </Card>
      </div>
    );
  }

  if (isError || (!orderLoading && !order)) {
    return (
      <EmptyState
        icon={SearchX}
        title={t("page.salesReturn.create.orderNotFound.title")}
        description={t("page.salesReturn.create.orderNotFound.desc")}>
        <Button onClick={() => navigate("/sales-return")}>
          <ArrowLeft size={16} className="mr-2" /> {t("page.salesReturn.create.back")}
        </Button>
      </EmptyState>
    );
  }

  if (orderLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (order?.paymentStatus !== "paid") {
    return (
      <EmptyState
        icon={Ban}
        title={t("page.salesReturn.create.orderNotPaid.title")}
        description={t("page.salesReturn.create.orderNotPaid.desc")}>
        <Button onClick={() => navigate("/sales-return")}>
          <ArrowLeft size={16} className="mr-2" /> {t("page.salesReturn.create.back")}
        </Button>
      </EmptyState>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" onClick={() => navigate("/sales-return")}>
          <ArrowLeft size={16} />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{t("page.salesReturn.create.title")}</h1>
          <p className="text-sm text-muted-foreground">
            {t("page.salesReturn.create.orderLabel")}: {order?.orderNumber}
          </p>
        </div>
      </div>

      {hasExpiredSelected && (
        <div className="bg-destructive/10 border border-destructive/30 text-destructive rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle size={18} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold">{t("page.salesReturn.create.expiry.bannerTitle")}</p>
            <p className="text-sm">{t("page.salesReturn.create.expiry.banner")}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Available Items */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">
              {t("page.salesReturn.create.section.selectItems")}
            </h2>
            <div className="space-y-3">
              {order?.items?.length > 0 ? (
                order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{item.productName}</p>
                      <p className="text-sm text-muted-foreground">
                        {t("page.salesReturn.create.available")}: {item.quantity}{" "}
                        {item.unit || "pcs"}
                      </p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => addItem(item)}>
                      <Plus size={16} className="mr-1" /> {t("page.salesReturn.create.add")}
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">{t("page.salesReturn.create.noItems")}</p>
              )}
            </div>
          </Card>

          {/* Selected Items */}
          {items.length > 0 && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">
                {t("page.salesReturn.create.section.returnItems")}
              </h2>
              <div className="space-y-3">
                {items.map((item) => {
                  const itemTotal = item.price * item.qty;
                  return (
                    <div
                      key={item.orderItemId}
                      className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{item.productName}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatRupiah(item.price)} × {item.qty} = {formatRupiah(itemTotal)}
                        </p>
                        {(() => {
                          const exp = productExpiry[Number(item.productId)];
                          if (!exp) return null;
                          if (exp.expired) {
                            return (
                              <span className="inline-flex items-center gap-1 mt-1 text-xs font-medium text-destructive">
                                <AlertTriangle size={12} />
                                {t("page.salesReturn.create.expiry.expired")}
                              </span>
                            );
                          }
                          return (
                            <span className="block mt-1 text-xs text-muted-foreground">
                              {t("page.salesReturn.create.expiry.date", {
                                date: exp.expiryDate
                              })}
                            </span>
                          );
                        })()}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateQty(item.orderItemId, item.qty - 1)}>
                          <Minus size={14} />
                        </Button>
                        <span className="w-8 text-center font-semibold">{item.qty}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateQty(item.orderItemId, item.qty + 1)}
                          disabled={item.qty >= item.maxQty}>
                          <Plus size={14} />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-500"
                          onClick={() => removeItem(item.orderItemId)}>
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Summary */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4">{t("page.salesReturn.create.summary.title")}</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {t("page.salesReturn.create.summary.items")}:
                </span>
                <span className="font-medium">{items.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {t("page.salesReturn.create.summary.totalQty")}:
                </span>
                <span className="font-medium">{items.reduce((sum, i) => sum + i.qty, 0)}</span>
              </div>
              <div className="border-t pt-2 mt-2 flex justify-between">
                <span className="font-semibold">
                  {t("page.salesReturn.create.summary.refund")}:
                </span>
                <span className="font-semibold text-green-600">{formatRupiah(totalRefund)}</span>
              </div>
            </div>
          </Card>

          {/* Reason */}
          <Card className="p-6 space-y-3">
            <label className="text-sm font-semibold">
              {t("page.salesReturn.create.reasonLabel")} <span className="text-destructive">*</span>
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm bg-background">
              <option value="">{t("page.salesReturn.create.reasonPlaceholder")}</option>
              {reasonKeys.map((k) => (
                <option key={k} value={t(`page.salesReturn.create.reason.${k}`)}>
                  {t(`page.salesReturn.create.reason.${k}`)}
                </option>
              ))}
            </select>
          </Card>

          {/* Notes */}
          <Card className="p-6 space-y-3">
            <label className="text-sm font-semibold">
              {t("page.salesReturn.create.notesLabel")}
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t("page.salesReturn.create.notesPlaceholder")}
              className="w-full px-3 py-2 border rounded-lg text-sm min-h-24 resize-none bg-background"
            />
          </Card>

          {/* Submit */}
          <Button
            onClick={() => setConfirmModal(true)}
            disabled={!canSubmit}
            className="w-full"
            size="lg">
            {t("page.salesReturn.create.submit")}
          </Button>
        </div>
      </div>

      <Modal
        type="confirm"
        open={confirmModal}
        onOpenChange={setConfirmModal}
        title={t("page.salesReturn.create.confirmTitle")}
        description={t("page.salesReturn.create.confirmDesc", {
          count: items.length,
          amount: totalRefund.toLocaleString("id-ID")
        })}
        confirmText={t("page.salesReturn.create.confirmButton")}
        onConfirm={() => {
          mutation.mutate();
          setConfirmModal(false);
        }}
        isLoading={mutation.isLoading}
      />
    </div>
  );
};

const OrderPicker = ({ isLoading, orders, onSelect }) => {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return orders;
    return orders.filter((o) =>
      String(o.orderNumber || "")
        .toLowerCase()
        .includes(q)
    );
  }, [orders, query]);

  return (
    <div>
      <div className="relative mb-4">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("page.salesReturn.create.selectOrder.searchPlaceholder")}
          className="w-full h-10 pl-9 pr-3 border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-sm font-medium text-muted-foreground">
            {query
              ? t("page.salesReturn.create.selectOrder.empty")
              : t("page.salesReturn.create.selectOrder.noOrders")}
          </p>
          {!query && (
            <p className="text-xs text-muted-foreground mt-1">
              {t("page.salesReturn.create.selectOrder.noOrdersDesc")}
            </p>
          )}
        </div>
      ) : (
        <div className="divide-y divide-border border rounded-lg overflow-hidden">
          {filtered.map((o) => (
            <div
              key={o.id}
              className="flex items-center justify-between gap-3 p-3 hover:bg-muted/40 transition-colors">
              <div className="min-w-0">
                <p className="font-mono text-sm font-semibold text-primary">{o.orderNumber}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {o.createdAt
                    ? new Date(o.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      })
                    : "-"}{" "}
                  · {o.items?.length || 0} {t("page.salesReturn.create.selectOrder.items")} ·{" "}
                  {formatRupiah(o.totalPrice)}
                </p>
              </div>
              <Button size="sm" onClick={() => onSelect(o)}>
                {t("page.salesReturn.create.selectOrder.select")}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CreateSalesReturn;
