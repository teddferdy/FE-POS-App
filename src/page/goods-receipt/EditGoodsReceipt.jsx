import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery, useQueryClient } from "react-query";
import { Save, X, Plus, Trash2, Package, Lightbulb } from "lucide-react";
import { toast } from "sonner";
import { editGoodsReceipt, getGoodsReceiptById } from "@/services/goods-receipt";
import { getAllPurchaseOrder, getPurchaseOrderById } from "@/services/purchase-order";
import { getAllIngredients } from "@/services/ingredient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { DatePicker } from "@/components/ui/date-picker";
import Modal from "@/components/organism/modal";
import AbortController from "@/components/organism/abort-controller";
import PageHeader from "@/components/ui/PageHeader";

const EditGoodsReceipt = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
  const id = searchParams.get("id");

  const [poId, setPoId] = useState("");
  const [receivedDate, setReceivedDate] = useState(new Date());
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cancelModal, setCancelModal] = useState(false);
  const [draftModal, setDraftModal] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [ingredientFocusIdx, setIngredientFocusIdx] = useState(null);

  const {
    data: receiptData,
    isLoading: loadingReceipt,
    isError,
    refetch
  } = useQuery(["goods-receipt-edit", id], () => getGoodsReceiptById(id), { enabled: !!id });

  const { data: poData } = useQuery(["pos-for-gr-edit"], () => getAllPurchaseOrder({ limit: 50 }), {
    
  });
  const purchaseOrders = poData?.data || [];

  const selectedPO = purchaseOrders.find((po) => po.id === parseInt(poId));
  const storeId = selectedPO?.store || receiptData?.data?.store;

  const { data: ingredientsData } = useQuery(
    ["ingredients-gr-edit", storeId],
    () => getAllIngredients({ store: storeId, limit: 999 }),
    { enabled: !!storeId }
  );
  const ingredients = ingredientsData?.data || [];
  const activeIngredients = ingredients.filter((i) => i.status === "active");

  const getFilteredIngredients = (search) =>
    activeIngredients.filter((i) => i.name?.toLowerCase().includes((search || "").toLowerCase()));

  useEffect(() => {
    const receipt = receiptData?.data;
    if (!receipt || loaded) return;
    setPoId(receipt.purchaseOrderId || "");
    setReceivedDate(receipt.receivedDate ? new Date(receipt.receivedDate) : new Date());
    setNotes(receipt.notes || "");
    if (receipt.items) {
      setItems(
        receipt.items.map((item) => ({
          id: item.id,
          ingredient: item.product || null,
          ingredientName: item.ingredientName || item.productData?.nameProduct || "",
          product: item.product || null,
          qty: item.qty || item.qtyReceived || 0,
          unit: item.unit || "pcs",
          qtyReceived: String(item.qtyReceived || 0),
          conditionNotes: item.conditionNotes || "",
          isFromPo: true
        }))
      );
    }
    setLoaded(true);
  }, [receiptData, loaded]);

  const { data: poDetail, isLoading: loadingPo } = useQuery(
    ["po-detail-edit", poId],
    () => getPurchaseOrderById(poId),
    { enabled: !!poId }
  );

  useEffect(() => {
    if (!poDetail?.data?.items) return;
    const poItems = poDetail.data.items;
    if (items.length === 0 && !loaded) {
      setItems(
        poItems.map((item) => ({
          ingredient: item.ingredient || null,
          ingredientName: item.ingredientName || item.ingredientData?.name || "",
          product: item.product || null,
          qty: item.quantity,
          unit: item.unit || "pcs",
          qtyReceived: "0",
          conditionNotes: "",
          isFromPo: true
        }))
      );
    } else if (loaded && items.length > 0) {
      setItems((prev) =>
        prev.map((it) => {
          const poItem = poItems.find(
            (p) =>
              (p.ingredientName || p.ingredientData?.name) === it.ingredientName ||
              (p.ingredient || p.product) === (it.ingredient || it.product)
          );
          return poItem ? { ...it, qty: poItem.quantity } : it;
        })
      );
    }
  }, [poDetail, items.length, loaded]);

  const addItem = () =>
    setItems((prev) => [
      ...prev,
      {
        ingredient: null,
        ingredientName: "",
        product: null,
        qty: 0,
        unit: "pcs",
        qtyReceived: "0",
        conditionNotes: "",
        isFromPo: false
      }
    ]);

  const removeItem = (idx) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateItem = (idx, field, value) => {
    setItems((prev) => prev.map((item, i) => (i !== idx ? item : { ...item, [field]: value })));
  };

  const doSubmit = async (saveAsDraft = false) => {
    if (!poId || items.length === 0) {
      toast.error(t("page.goodsReceipt.edit.toast.validation"), {
        description: t("page.goodsReceipt.edit.toast.poRequired")
      });
      return;
    }
    const validItems = items.filter(
      (it) => parseFloat(it.qtyReceived) > 0 && (it.ingredientName || it.ingredient)
    );
    if (validItems.length === 0) {
      toast.error(t("page.goodsReceipt.edit.toast.validation"), {
        description: t("page.goodsReceipt.edit.toast.itemRequired")
      });
      return;
    }
    setIsSubmitting(true);
    try {
      await editGoodsReceipt(id, {
        receivedDate:
          receivedDate instanceof Date ? receivedDate.toISOString().split("T")[0] : receivedDate,
        notes,
        status: saveAsDraft ? "draft" : "completed",
        items: validItems.map((it) => ({
          ingredient: it.ingredient,
          ingredientName: it.ingredientName,
          product: it.product,
          qtyReceived: parseFloat(it.qtyReceived),
          unit: it.unit,
          conditionNotes: it.conditionNotes
        }))
      });
      toast.success(t("page.goodsReceipt.edit.toast.success"), {
        description: t("page.goodsReceipt.edit.toast.successDesc")
      });
      queryClient.invalidateQueries(["goods-receipts"]);
      navigate("/goods-receipt");
    } catch (err) {
      toast.error(t("page.goodsReceipt.edit.toast.error"), {
        description: err?.response?.data?.message || err.message
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!id) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">{t("page.goodsReceipt.edit.notFound")}</p>
      </div>
    );
  }

  if (isError) return <AbortController refetch={refetch} />;

  if (loadingReceipt) {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <PageHeader
          breadcrumbs={[
            { label: t("breadcrumb.dashboard"), href: "/dashboard-super-admin" },
            { label: t("breadcrumb.goodsReceipt"), href: "/goods-receipt" },
            { label: t("breadcrumb.edit") }
          ]}
          title={t("page.goodsReceipt.edit.title")}
          description={t("page.goodsReceipt.edit.description")}
          backLink="/goods-receipt"
        />
        <div className="bg-card p-6 rounded-xl border border-border space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-16 w-full" />
          </div>
          <div className="flex justify-between pt-4 border-t">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
        <PageHeader
          breadcrumbs={[
            {
              label: t("breadcrumb.dashboard"),
              href: "/dashboard-super-admin",
              i18nKey: "breadcrumb.dashboard"
            },
            {
              label: t("breadcrumb.goodsReceipt"),
              href: "/goods-receipt",
              i18nKey: "breadcrumb.goodsReceipt"
            },
            { label: t("breadcrumb.edit"), i18nKey: "breadcrumb.edit" }
          ]}
          title={t("page.goodsReceipt.edit.title")}
          description={t("page.goodsReceipt.edit.description")}
          backLink="/goods-receipt"
        />

        <form
          onSubmit={(e) => {
            e.preventDefault();
            doSubmit(false);
          }}
          className="bg-card p-6 rounded-xl border border-border space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>
                {t("page.goodsReceipt.edit.form.purchaseOrder")}{" "}
                <span className="text-destructive">*</span>
              </Label>
              <select
                value={poId}
                disabled
                className="w-full h-10 px-3 rounded-md border border-input bg-muted text-sm cursor-not-allowed opacity-70">
                <option value="">{t("page.goodsReceipt.edit.form.selectPO")}</option>
                {purchaseOrders.map((po) => (
                  <option key={po.id} value={po.id}>
                    {po.orderNumber}
                  </option>
                ))}
              </select>
              {selectedPO && (
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-muted-foreground">
                    {t("page.goodsReceipt.edit.form.status")}: {selectedPO.status}
                  </span>
                  <span className="text-xs text-muted-foreground">|</span>
                  <span className="text-xs text-muted-foreground">
                    {t("page.goodsReceipt.edit.form.store")}: {selectedPO.storeData?.name || "-"}
                  </span>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label>{t("page.goodsReceipt.edit.form.receivedDate")}</Label>
              <DatePicker date={receivedDate} setDate={setReceivedDate} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t("page.goodsReceipt.edit.form.items")}</Label>
            {loadingPo ? (
              <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
                {t("page.goodsReceipt.edit.loading.items")}
              </div>
            ) : poId ? (
              <div className="overflow-x-auto border rounded-lg">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/60 border-b">
                      <th className="px-3 py-2 text-left font-semibold text-muted-foreground text-xs">
                        {t("page.goodsReceipt.edit.table.name")}
                      </th>
                      <th className="px-3 py-2 text-center font-semibold text-muted-foreground text-xs">
                        {t("page.goodsReceipt.edit.table.qtyPo")}
                      </th>
                      <th className="px-3 py-2 text-center font-semibold text-muted-foreground text-xs">
                        {t("page.goodsReceipt.edit.table.unit")}
                      </th>
                      <th className="px-3 py-2 text-right font-semibold text-muted-foreground text-xs">
                        {t("page.goodsReceipt.edit.table.qtyReceived")}
                      </th>
                      <th className="px-3 py-2 text-left font-semibold text-muted-foreground text-xs">
                        {t("page.goodsReceipt.edit.table.notes")}
                      </th>
                      <th className="w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, idx) => (
                      <tr key={idx} className="border-b border-muted/20">
                        <td className="px-3 py-2">
                          {item.isFromPo ? (
                            <div className="flex items-center gap-2">
                              <Package size={14} className="text-muted-foreground shrink-0" />
                              <span className="text-sm font-medium">{item.ingredientName}</span>
                            </div>
                          ) : (
                            <div className="relative">
                              <Input
                                type="text"
                                value={item.ingredientName}
                                onChange={(e) => {
                                  updateItem(idx, "ingredientName", e.target.value);
                                  updateItem(idx, "ingredient", null);
                                  setIngredientFocusIdx(idx);
                                }}
                                onFocus={() => setIngredientFocusIdx(idx)}
                                onBlur={() => setTimeout(() => setIngredientFocusIdx(null), 200)}
                                className="h-8 text-xs"
                                placeholder={t("page.goodsReceipt.edit.placeholder.name")}
                              />
                              {ingredientFocusIdx === idx && (
                                <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-card border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                  {getFilteredIngredients(item.ingredientName || "").length > 0 ? (
                                    getFilteredIngredients(item.ingredientName || "").map((ing) => (
                                      <button
                                        key={ing.id}
                                        type="button"
                                        onMouseDown={() => {
                                          updateItem(idx, "ingredientName", ing.name);
                                          updateItem(idx, "ingredient", ing.id);
                                          updateItem(idx, "unit", ing.unit || "pcs");
                                          setIngredientFocusIdx(null);
                                        }}
                                        className="w-full text-left px-3 py-2 text-sm hover:bg-accent/50 transition-colors flex items-center gap-2">
                                        <span>{ing.name}</span>
                                        <span className="text-xs text-muted-foreground ml-auto">
                                          {ing.unit || "pcs"}
                                        </span>
                                      </button>
                                    ))
                                  ) : (
                                    <p className="p-3 text-xs text-muted-foreground text-center">
                                      {t("page.goodsReceipt.edit.placeholder.noIngredient") || "Tidak ada bahan ditemukan"}
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="px-3 py-2 text-center">
                          {item.isFromPo ? (
                            <span className="text-sm text-muted-foreground">{item.qty}</span>
                          ) : (
                            <Input
                              type="text"
                              inputMode="numeric"
                              value={item.qty || ""}
                              onChange={(e) =>
                                updateItem(idx, "qty", e.target.value.replace(/[^0-9]/g, ""))
                              }
                              className="h-8 text-xs text-center w-16 mx-auto"
                              placeholder={t("page.goodsReceipt.edit.placeholder.qty")}
                            />
                          )}
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex justify-center">
                            {item.isFromPo ? (
                              <span className="inline-flex px-2 py-0.5 rounded text-xs bg-muted capitalize">
                                {item.unit}
                              </span>
                            ) : (
                              <select
                                value={item.unit}
                                onChange={(e) => updateItem(idx, "unit", e.target.value)}
                                className="h-8 px-2 rounded border border-input bg-background text-xs">
                                <option value="pcs">{t("unit.pcs")}</option>
                                <option value="buah">{t("unit.buah")}</option>
                                <option value="kg">{t("unit.kg")}</option>
                                <option value="gram">{t("unit.gram")}</option>
                                <option value="liter">{t("unit.liter")}</option>
                                <option value="ml">{t("unit.ml")}</option>
                                <option value="meter">{t("unit.meter")}</option>
                                <option value="cm">{t("unit.cm")}</option>
                                <option value="lusin">{t("unit.lusin")}</option>
                                <option value="box">{t("unit.box")}</option>
                                <option value="pack">{t("unit.pack")}</option>
                                <option value="karton">{t("unit.karton")}</option>
                              </select>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          <Input
                            type="text"
                            inputMode="decimal"
                            value={item.qtyReceived === "0" ? "" : item.qtyReceived}
                            onFocus={(e) => e.target.select()}
                            onChange={(e) =>
                              updateItem(
                                idx,
                                "qtyReceived",
                                e.target.value.replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1")
                              )
                            }
                            className="h-8 text-xs text-right w-24 ml-auto"
                            placeholder={t("page.goodsReceipt.edit.placeholder.qty")}
                          />
                        </td>
                        <td className="px-3 py-2">
                          <Input
                            type="text"
                            value={item.conditionNotes}
                            onChange={(e) => updateItem(idx, "conditionNotes", e.target.value)}
                            className="h-8 text-xs"
                            placeholder={t("page.goodsReceipt.edit.placeholder.condition")}
                          />
                        </td>
                        <td className="px-3 py-2 text-center">
                          {!item.isFromPo && (
                            <button
                              type="button"
                              onClick={() => removeItem(idx)}
                              className="text-muted-foreground/30 hover:text-destructive">
                              <Trash2 size={14} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-sm text-muted-foreground">
                {t("page.goodsReceipt.edit.form.noPO")}
              </div>
            )}
            {poId && (
              <Button type="button" variant="outline" size="sm" onClick={addItem} className="gap-1">
                <Plus size={14} /> {t("page.goodsReceipt.edit.form.addItem")}
              </Button>
            )}
          </div>

          <div className="space-y-2">
            <Label>{t("page.goodsReceipt.edit.form.notesLabel")}</Label>
            <Textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t("page.goodsReceipt.edit.placeholder.notes")}
            />
          </div>

          <div className="flex items-center justify-between gap-4 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setCancelModal(true)}>
              <X size={16} className="mr-1" /> {t("page.goodsReceipt.edit.form.cancel")}
            </Button>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDraftModal(true)}
                disabled={isSubmitting}>
                Simpan sebagai Draft
              </Button>
              <Button type="submit" disabled={isSubmitting || items.length === 0}>
                <Save size={16} className="mr-1" />{" "}
                {isSubmitting
                  ? t("page.goodsReceipt.edit.form.saving")
                  : t("page.goodsReceipt.edit.form.save")}
              </Button>
            </div>
          </div>
        </form>

        {isSubmitting && (
          <Loading fullscreen size="lg" label={t("page.goodsReceipt.edit.form.saving")} />
        )}

        <Modal
          type="confirm"
          open={cancelModal}
          onOpenChange={(o) => !o && setCancelModal(false)}
          title={t("page.goodsReceipt.edit.modal.title")}
          description={t("page.goodsReceipt.edit.modal.description")}
          confirmText={t("page.goodsReceipt.edit.modal.confirm")}
          onConfirm={() => {
            setCancelModal(false);
            navigate("/goods-receipt");
          }}
        />
        <Modal
          type="confirm"
          open={draftModal}
          onOpenChange={setDraftModal}
          title="Simpan sebagai Draft"
          description="Data akan disimpan sebagai draft"
          confirmText="Ya, Simpan"
          onConfirm={() => {
            setDraftModal(false);
            doSubmit(true);
          }}
        />

        <div className="bg-primary/5 border border-primary/20 rounded-xl p-5">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
              <Lightbulb size={16} className="text-primary" />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-semibold text-foreground">
                {t("page.goodsReceipt.edit.tips.title")}
              </p>
              <ul className="space-y-1.5 text-xs text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="w-1 h-1 rounded-full bg-primary mt-1.5 shrink-0" />
                  {t("page.goodsReceipt.edit.tips.1")}
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1 h-1 rounded-full bg-primary mt-1.5 shrink-0" />
                  {t("page.goodsReceipt.edit.tips.2")}
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1 h-1 rounded-full bg-primary mt-1.5 shrink-0" />
                  {t("page.goodsReceipt.edit.tips.3")}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditGoodsReceipt;
