import React, { useState, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { toast } from "sonner";
import { ArrowLeft, Plus, Minus, Trash2 } from "lucide-react";
import { useCookies } from "react-cookie";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { returnOrder } from "@/services/sales-return";
import Modal from "@/components/organism/modal";

const reasonOptions = [
  "Damaged",
  "Defective",
  "Not as described",
  "Customer request",
  "Quality issue",
  "Wrong item",
  "Other"
];

const CreateSalesReturn = () => {
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
  } = useQuery(
    ["order-detail", orderId],
    async () => {
      const res = await fetch(`/api/order/${orderId}`);
      if (!res.ok) throw new Error("Order not found");
      return res.json();
    },
    { enabled: !!orderId }
  );

  const order = orderData?.data;

  const mutation = useMutation(
    () => returnOrder(orderId, { items, reason, returnedBy: userId, notes }),
    {
      onSuccess: () => {
        toast.success("Sales return created successfully");
        queryClient.invalidateQueries(["sales-returns"]);
        navigate("/sales-return");
      },
      onError: (err) => {
        toast.error(err?.response?.data?.message || "Failed to create return");
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
          price: orderItem.price,
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
      toast.error(`Maximum qty is ${item.maxQty}`);
      return;
    }
    setItems(items.map((i) => (i.orderItemId === orderItemId ? { ...i, qty: newQty } : i)));
  };

  const removeItem = (orderItemId) => {
    setItems(items.filter((i) => i.orderItemId !== orderItemId));
  };

  const totalRefund = useMemo(() => {
    return items.reduce((sum, item) => {
      const pricePerUnit = Math.floor(item.price / item.maxQty);
      return sum + pricePerUnit * item.qty;
    }, 0);
  }, [items]);

  const canSubmit = items.length > 0 && reason.trim() !== "" && !mutation.isLoading;

  if (isError || (!orderLoading && !order)) {
    return (
      <div className="p-6">
        <p className="text-destructive">Order not found</p>
        <Button onClick={() => navigate("/sales-return")} className="mt-4">
          Back to Returns
        </Button>
      </div>
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
      <div className="p-6">
        <p className="text-destructive">Only paid orders can be returned</p>
        <Button onClick={() => navigate("/sales-return")} className="mt-4">
          Back to Returns
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" onClick={() => navigate("/sales-return")}>
          <ArrowLeft size={16} />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Create Sales Return</h1>
          <p className="text-sm text-muted-foreground">Order: {order?.orderNumber}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Available Items */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Select Items to Return</h2>
            <div className="space-y-3">
              {order?.items?.length > 0 ? (
                order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{item.productName}</p>
                      <p className="text-sm text-muted-foreground">
                        Available: {item.quantity} {item.unit || "pcs"}
                      </p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => addItem(item)}>
                      <Plus size={16} className="mr-1" /> Add
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">No items in order</p>
              )}
            </div>
          </Card>

          {/* Selected Items */}
          {items.length > 0 && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Return Items</h2>
              <div className="space-y-3">
                {items.map((item) => {
                  const pricePerUnit = Math.floor(item.price / item.maxQty);
                  const itemTotal = pricePerUnit * item.qty;
                  return (
                    <div
                      key={item.orderItemId}
                      className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{item.productName}</p>
                        <p className="text-sm text-muted-foreground">
                          Rp {pricePerUnit.toLocaleString("id-ID")} × {item.qty} = Rp{" "}
                          {itemTotal.toLocaleString("id-ID")}
                        </p>
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
            <h3 className="font-semibold mb-4">Return Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Items:</span>
                <span className="font-medium">{items.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Qty:</span>
                <span className="font-medium">{items.reduce((sum, i) => sum + i.qty, 0)}</span>
              </div>
              <div className="border-t pt-2 mt-2 flex justify-between">
                <span className="font-semibold">Refund Amount:</span>
                <span className="font-semibold text-green-600">
                  Rp {totalRefund.toLocaleString("id-ID")}
                </span>
              </div>
            </div>
          </Card>

          {/* Reason */}
          <Card className="p-6 space-y-3">
            <label className="text-sm font-semibold">Return Reason *</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm">
              <option value="">Select reason...</option>
              {reasonOptions.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </Card>

          {/* Notes */}
          <Card className="p-6 space-y-3">
            <label className="text-sm font-semibold">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes..."
              className="w-full px-3 py-2 border rounded-lg text-sm min-h-24 resize-none"
            />
          </Card>

          {/* Submit */}
          <Button
            onClick={() => setConfirmModal(true)}
            disabled={!canSubmit}
            className="w-full"
            size="lg">
            Create Return Request
          </Button>
        </div>
      </div>

      <Modal
        type="confirm"
        open={confirmModal}
        onOpenChange={setConfirmModal}
        title="Confirm Return Request"
        description={`Create return for ${items.length} item(s)? Refund: Rp ${totalRefund.toLocaleString(
          "id-ID"
        )}`}
        confirmText="Create"
        onConfirm={() => {
          mutation.mutate();
          setConfirmModal(false);
        }}
        isLoading={mutation.isLoading}
      />
    </div>
  );
};

export default CreateSalesReturn;
