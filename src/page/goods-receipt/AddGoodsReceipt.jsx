import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery, useQueryClient } from "react-query";
import { Save, X, Plus, Trash2, Package } from "lucide-react";
import { toast } from "sonner";
import { addGoodsReceipt } from "@/services/goods-receipt";
import { getAllPurchaseOrder, getPurchaseOrderById } from "@/services/purchase-order";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import Modal from "@/components/organism/modal";
import { Loading } from "@/components/ui/loading";
import { motion } from "framer-motion";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

const AddGoodsReceipt = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();

  const [poId, setPoId] = useState(searchParams.get("poId") || "");
  const [receivedDate, setReceivedDate] = useState(new Date());
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cancelModal, setCancelModal] = useState(false);

  const { data: poData } = useQuery(["pos-for-gr"], () => getAllPurchaseOrder({ limit: 50 }), {
    staleTime: 60000
  });
  const purchaseOrders = poData?.data || [];

  const { data: poDetail, isLoading: loadingPo } = useQuery(
    ["po-detail", poId],
    () => getPurchaseOrderById(poId),
    { enabled: !!poId }
  );

  useEffect(() => {
    if (poDetail?.data?.items) {
      const poItems = poDetail.data.items;
      const mapped = poItems.map((item) => ({
        ingredient: item.ingredient || null,
        ingredientName: item.ingredientName || item.productData?.nameProduct || "",
        product: item.product || null,
        qty: item.quantity,
        unit: item.unit || "pcs",
        qtyReceived: "0",
        conditionNotes: "",
        isFromPo: true
      }));
      setItems(mapped);
    }
  }, [poDetail]);

  const selectedPO = purchaseOrders.find((po) => po.id === parseInt(poId));

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!poId || items.length === 0) {
      toast.error(t("page.goodsReceipt.add.toast.validation"), {
        description: t("page.goodsReceipt.add.toast.poRequired")
      });
      return;
    }
    const validItems = items.filter(
      (it) => parseFloat(it.qtyReceived) > 0 && (it.ingredientName || it.ingredient)
    );
    if (validItems.length === 0) {
      toast.error(t("page.goodsReceipt.add.toast.validation"), {
        description: t("page.goodsReceipt.add.toast.itemRequired")
      });
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        purchaseOrderId: parseInt(poId),
        receivedDate:
          receivedDate instanceof Date ? receivedDate.toISOString().split("T")[0] : receivedDate,
        notes,
        items: validItems.map((it) => ({
          ingredient: it.ingredient,
          ingredientName: it.ingredientName,
          product: it.product,
          qtyReceived: parseFloat(it.qtyReceived),
          unit: it.unit,
          conditionNotes: it.conditionNotes
        }))
      };
      await addGoodsReceipt(payload);
      toast.success(t("page.goodsReceipt.add.toast.success"), {
        description: t("page.goodsReceipt.add.toast.successDesc")
      });
      queryClient.invalidateQueries(["goods-receipts"]);
      navigate("/goods-receipt");
    } catch (err) {
      toast.error(t("page.goodsReceipt.add.toast.error"), {
        description: err?.response?.data?.message || err.message
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show">
      <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <button
          onClick={() => navigate("/dashboard-super-admin")}
          className="hover:text-foreground">
          {t("breadcrumb.dashboard")}
        </button>
        <span className="text-xs">/</span>
        <button onClick={() => navigate("/goods-receipt")} className="hover:text-foreground">
          {t("breadcrumb.goodsReceipt")}
        </button>
        <span className="text-xs">/</span>
        <span className="text-primary font-semibold">{t("breadcrumb.add")}</span>
      </nav>

      <div>
        <h1 className="text-2xl font-bold">{t("page.goodsReceipt.add.title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t("page.goodsReceipt.add.description")}
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-card p-6 rounded-xl border border-border space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>
              {t("page.goodsReceipt.add.form.purchaseOrder")}{" "}
              <span className="text-destructive">*</span>
            </Label>
            <select
              value={poId}
              onChange={(e) => {
                setPoId(e.target.value);
                setItems([]);
              }}
              className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm">
              <option value="">{t("page.goodsReceipt.add.form.selectPO")}</option>
              {purchaseOrders.map((po) => (
                <option key={po.id} value={po.id}>
                  {po.orderNumber}
                </option>
              ))}
            </select>
            {selectedPO && (
              <div className="flex items-center gap-3 mt-1">
                <span className="text-xs text-muted-foreground">
                  {t("page.goodsReceipt.add.form.status")}: {selectedPO.status}
                </span>
                <span className="text-xs text-muted-foreground">|</span>
                <span className="text-xs text-muted-foreground">
                  {t("page.goodsReceipt.add.form.store")}: {selectedPO.storeData?.name || "-"}
                </span>
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label>{t("page.goodsReceipt.add.form.receivedDate")}</Label>
            <DatePicker date={receivedDate} setDate={setReceivedDate} />
          </div>
        </div>

        <div className="space-y-2">
          <Label>{t("page.goodsReceipt.add.form.items")}</Label>
          {loadingPo ? (
            <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
              {t("page.goodsReceipt.add.loading.items")}
            </div>
          ) : poId ? (
            <div className="overflow-x-auto border rounded-lg">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/60 border-b">
                    <th className="px-3 py-2 text-left font-semibold text-muted-foreground text-xs">
                      {t("page.goodsReceipt.add.table.name")}
                    </th>
                    <th className="px-3 py-2 text-center font-semibold text-muted-foreground text-xs">
                      {t("page.goodsReceipt.add.table.qtyPo")}
                    </th>
                    <th className="px-3 py-2 text-center font-semibold text-muted-foreground text-xs">
                      {t("page.goodsReceipt.add.table.unit")}
                    </th>
                    <th className="px-3 py-2 text-right font-semibold text-muted-foreground text-xs">
                      {t("page.goodsReceipt.add.table.qtyReceived")}
                    </th>
                    <th className="px-3 py-2 text-left font-semibold text-muted-foreground text-xs">
                      {t("page.goodsReceipt.add.table.notes")}
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
                          <Input
                            type="text"
                            value={item.ingredientName}
                            onChange={(e) => updateItem(idx, "ingredientName", e.target.value)}
                            className="h-8 text-xs"
                            placeholder={t("page.goodsReceipt.add.placeholder.name")}
                          />
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
                            placeholder={t("page.goodsReceipt.add.placeholder.qty")}
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
                          placeholder={t("page.goodsReceipt.add.placeholder.qty")}
                        />
                      </td>
                      <td className="px-3 py-2">
                        <Input
                          type="text"
                          value={item.conditionNotes}
                          onChange={(e) => updateItem(idx, "conditionNotes", e.target.value)}
                          className="h-8 text-xs"
                          placeholder={t("page.goodsReceipt.add.placeholder.condition")}
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
              {t("page.goodsReceipt.add.form.noPO")}
            </div>
          )}
          {poId && (
            <Button type="button" variant="outline" size="sm" onClick={addItem} className="gap-1">
              <Plus size={14} /> {t("page.goodsReceipt.add.form.addItem")}
            </Button>
          )}
        </div>

        <div className="space-y-2">
          <Label>{t("page.goodsReceipt.add.form.notesLabel")}</Label>
          <Textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t("page.goodsReceipt.add.placeholder.notes")}
          />
        </div>

        <div className="flex items-center justify-between gap-4 pt-4 border-t">
          <Button type="button" variant="outline" onClick={() => setCancelModal(true)}>
            <X size={16} className="mr-1" /> {t("page.goodsReceipt.add.form.cancel")}
          </Button>
          <Button type="submit" disabled={isSubmitting || items.length === 0}>
            <Save size={16} className="mr-1" />{" "}
            {isSubmitting
              ? t("page.goodsReceipt.add.form.saving")
              : t("page.goodsReceipt.add.form.save")}
          </Button>
        </div>
      </form>

      {isSubmitting && (
        <Loading fullscreen size="lg" label={t("page.goodsReceipt.add.form.saving")} />
      )}

      <Modal
        type="confirm"
        open={cancelModal}
        onOpenChange={(o) => !o && setCancelModal(false)}
        title={t("page.goodsReceipt.add.modal.title")}
        description={t("page.goodsReceipt.add.modal.description")}
        confirmText={t("page.goodsReceipt.add.modal.confirm")}
        onConfirm={() => {
          setCancelModal(false);
          navigate("/goods-receipt");
        }}
      />
    </div>
    </motion.div>
  );
};

export default AddGoodsReceipt;
