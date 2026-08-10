import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery, useQueryClient } from "react-query";
import { useCookies } from "react-cookie";
import { Save, X, Plus, Trash2, ArrowLeft, User } from "lucide-react";
import { toast } from "sonner";
import { addGoodsRequest } from "@/services/goods-request";
import { getAllLocation } from "@/services/location";
import { getAllIngredients } from "@/services/ingredient";
import { getAllProduct } from "@/services/product";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Combobox } from "@/components/ui/combobox";
import { z } from "zod";
import Modal from "@/components/organism/modal";
import { Loading } from "@/components/ui/loading";
import MissingFieldsModal from "@/components/organism/MissingFieldsModal";
import { getMissingFields } from "@/lib/validation";

const unitOptions = [
  { value: "pcs", label: "pcs" },
  { value: "buah", label: "buah" },
  { value: "kg", label: "kg" },
  { value: "gram", label: "gram" },
  { value: "liter", label: "liter" },
  { value: "ml", label: "ml" },
  { value: "meter", label: "meter" },
  { value: "cm", label: "cm" },
  { value: "lusin", label: "lusin" },
  { value: "box", label: "box" },
  { value: "pack", label: "pack" },
  { value: "karton", label: "karton" }
];

const AddGoodsRequest = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [cookie] = useCookies();
  const user = cookie?.user;
  const isSuperAdmin = user?.roleType === "super_admin";

  const [storeId, setStoreId] = useState(isSuperAdmin ? "" : user?.store || "");
  const [requestedBy, setRequestedBy] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState([
    { name: "", ingredient: null, product: null, qty: 1, unit: "pcs", notes: "" }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorModal, setErrorModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [cancelModal, setCancelModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);
  const [missingFieldsModal, setMissingFieldsModal] = useState(false);
  const [missingFields, setMissingFields] = useState([]);

  const fieldLabels = {
    storeId: t("page.goodsRequest.add.form.store"),
    items: t("page.goodsRequest.add.form.items")
  };

  const formSchema = z.object({
    storeId: z.string().min(1),
    items: z
      .array(
        z.object({
          name: z.string().min(1),
          qty: z.number().min(1)
        })
      )
      .min(1)
  });

  const { data: locData } = useQuery(["locations-goods-request-add"], () => getAllLocation(), {
    enabled: isSuperAdmin
  });
  const locations = locData?.data || [];

  const { data: ingredientsData } = useQuery(
    ["ingredients-goods-request", storeId],
    () => getAllIngredients({ store: storeId, limit: 999, status: "active" }),
    { enabled: !!storeId }
  );
  const ingredients = ingredientsData?.data || [];

  const { data: productsData } = useQuery(
    ["products-goods-request", storeId],
    () => getAllProduct({ location: storeId, status: "active" }),
    { enabled: !!storeId }
  );
  const products = productsData?.data || [];

  const itemOptions = useMemo(() => {
    const opts = [];
    for (const ing of ingredients) {
      opts.push({
        value: `ing-${ing.id}`,
        label: `${ing.name || ing.ingredientName || "Bahan Baku"} (bahan baku)`
      });
    }
    for (const prod of products) {
      opts.push({
        value: `prod-${prod.id || prod._id}`,
        label: `${prod.nameProduct || prod.name || "Produk"} (produk)`
      });
    }
    return opts;
  }, [ingredients, products]);

  const itemOptionLabel = (value) => {
    const opt = itemOptions.find((o) => o.value === value);
    return opt?.label || "";
  };

  const addItem = () =>
    setItems((prev) => [
      ...prev,
      { name: "", ingredient: null, product: null, qty: 1, unit: "pcs", notes: "" }
    ]);

  const removeItem = (idx) => setItems((prev) => prev.filter((_, i) => i !== idx));

  const updateItem = (idx, field, value) => {
    setItems((prev) => prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item)));
  };

  const pickItemOption = (idx, value) => {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i !== idx) return item;
        if (value.startsWith("ing-")) {
          const ing = ingredients.find((x) => `ing-${x.id}` === value);
          return {
            ...item,
            ingredient: ing?.id || null,
            product: null,
            name: ing?.name || ing?.ingredientName || ""
          };
        }
        if (value.startsWith("prod-")) {
          const prod = products.find((x) => `prod-${x.id || x._id}` === value);
          return {
            ...item,
            ingredient: null,
            product: prod?.id || prod?._id || null,
            name: prod?.nameProduct || prod?.name || ""
          };
        }
        return { ...item, ingredient: null, product: null, name: value };
      })
    );
  };

  const doSubmit = async () => {
    if (!storeId) {
      toast.error(t("page.goodsRequest.add.toast.validation"), {
        description: t("page.goodsRequest.add.toast.storeRequired")
      });
      return;
    }
    const validItems = items.filter((it) => it.name.trim() && it.qty > 0);
    if (validItems.length === 0) {
      toast.error(t("page.goodsRequest.add.toast.validation"), {
        description: t("page.goodsRequest.add.toast.itemRequired")
      });
      return;
    }
    setIsSubmitting(true);
    try {
      await addGoodsRequest({
        store: storeId,
        requestedBy,
        notes,
        items: validItems.map((it) => ({
          ingredient: it.ingredient,
          ingredientName: it.ingredient ? it.name : null,
          product: it.product,
          productName: it.product ? it.name : null,
          qty: it.qty,
          unit: it.unit,
          notes: it.notes || null
        }))
      });
      toast.success(t("page.goodsRequest.add.toast.success"), {
        description: t("page.goodsRequest.add.toast.successDesc")
      });
      queryClient.invalidateQueries(["goods-requests"]);
      navigate("/goods-request");
    } catch (err) {
      setModalMessage(err?.response?.data?.message || err.message);
      setErrorModal(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 shrink-0"
            onClick={() => setCancelModal(true)}>
            <ArrowLeft size={16} />
          </Button>
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <button
              onClick={() => navigate("/dashboard-super-admin")}
              className="hover:text-foreground">
              {t("breadcrumb.dashboard")}
            </button>
            <span className="text-xs">/</span>
            <button onClick={() => navigate("/goods-request")} className="hover:text-foreground">
              {t("breadcrumb.goodsRequest")}
            </button>
            <span className="text-xs">/</span>
            <span className="text-primary font-semibold">{t("breadcrumb.add")}</span>
          </nav>
        </div>

        <div>
          <h1 className="text-2xl font-bold">{t("page.goodsRequest.add.title")}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("page.goodsRequest.add.description")}
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            doSubmit();
          }}
          className="bg-card p-4 sm:p-6 rounded-xl border border-border space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>
                {t("page.goodsRequest.add.form.store")} <span className="text-destructive">*</span>
              </Label>
              <Combobox
                options={[
                  { value: "", label: t("page.goodsRequest.add.form.selectStore") },
                  ...locations.map((loc) => ({ value: loc.id, label: loc.name }))
                ]}
                value={storeId}
                onChange={(val) => setStoreId(val)}
                disabled={!isSuperAdmin}
                placeholder={t("page.goodsRequest.add.form.selectStore")}
                searchPlaceholder={t("common.search")}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("page.goodsRequest.add.form.requestedBy")}</Label>
              <div className="relative">
                <User
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  value={requestedBy}
                  onChange={(e) => setRequestedBy(e.target.value)}
                  placeholder={t("page.goodsRequest.add.placeholder.requestedBy")}
                  className="pl-9"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>
              {t("page.goodsRequest.add.form.items")} <span className="text-destructive">*</span>
            </Label>
            <div className="overflow-x-auto border rounded-lg">
              <table className="w-full text-sm min-w-[760px]">
                <thead>
                  <tr className="bg-muted/60 border-b">
                    <th className="px-3 py-2 text-left font-semibold text-muted-foreground text-xs">
                      {t("page.goodsRequest.add.table.name")}
                    </th>
                    <th className="px-3 py-2 text-center font-semibold text-muted-foreground text-xs">
                      {t("page.goodsRequest.add.table.qty")}
                    </th>
                    <th className="px-3 py-2 text-center font-semibold text-muted-foreground text-xs">
                      {t("page.goodsRequest.add.table.unit")}
                    </th>
                    <th className="px-3 py-2 text-left font-semibold text-muted-foreground text-xs">
                      {t("page.goodsRequest.add.table.notes")}
                    </th>
                    <th className="w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => {
                    const selectedValue = item.ingredient
                      ? `ing-${item.ingredient}`
                      : item.product
                        ? `prod-${item.product}`
                        : "";
                    return (
                      <tr key={idx} className="border-b border-muted/20">
                        <td className="px-3 py-2 min-w-[260px]">
                          <Combobox
                            options={itemOptions}
                            value={selectedValue}
                            onChange={(val) => pickItemOption(idx, val)}
                            placeholder={t("page.goodsRequest.add.placeholder.selectItem")}
                            searchPlaceholder={t("common.search")}
                            emptyMessage={t("page.goodsRequest.add.table.noItem")}
                          />
                          <Input
                            value={item.name}
                            onChange={(e) => {
                              updateItem(idx, "name", e.target.value);
                              updateItem(idx, "ingredient", null);
                              updateItem(idx, "product", null);
                            }}
                            placeholder={t("page.goodsRequest.add.placeholder.name")}
                            className="h-8 text-xs mt-1.5"
                          />
                          {selectedValue && (
                            <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
                              {itemOptionLabel(selectedValue)}
                            </p>
                          )}
                        </td>
                        <td className="px-3 py-2">
                          <Input
                            type="text"
                            inputMode="numeric"
                            value={item.qty === 0 ? "" : String(item.qty)}
                            onChange={(e) =>
                              updateItem(
                                idx,
                                "qty",
                                Number(e.target.value.replace(/[^0-9]/g, "")) || 0
                              )
                            }
                            className="h-8 text-xs text-center w-20 mx-auto"
                            placeholder="0"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex justify-center">
                            <Combobox
                              options={unitOptions}
                              value={item.unit}
                              onChange={(val) => updateItem(idx, "unit", val)}
                              placeholder="pcs"
                              searchPlaceholder={t("common.search")}
                            />
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          <Input
                            value={item.notes}
                            onChange={(e) => updateItem(idx, "notes", e.target.value)}
                            className="h-8 text-xs"
                            placeholder={t("page.goodsRequest.add.placeholder.notes")}
                          />
                        </td>
                        <td className="px-3 py-2 text-center">
                          <button
                            type="button"
                            onClick={() => removeItem(idx)}
                            className="text-muted-foreground/40 hover:text-destructive">
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={addItem} className="gap-1">
              <Plus size={14} /> {t("page.goodsRequest.add.form.addItem")}
            </Button>
          </div>

          <div className="space-y-2">
            <Label>{t("page.goodsRequest.add.form.notesLabel")}</Label>
            <Textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t("page.goodsRequest.add.placeholder.notes")}
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto justify-center"
              onClick={() => setCancelModal(true)}>
              <X size={16} className="mr-1" /> {t("page.goodsRequest.add.form.cancel")}
            </Button>
            <Button
              type="button"
              className="w-full sm:w-auto justify-center"
              disabled={isSubmitting || items.length === 0}
              onClick={() => {
                const missing = getMissingFields({ storeId, items }, formSchema, fieldLabels);
                if (missing.length > 0) {
                  setMissingFields(missing);
                  setMissingFieldsModal(true);
                  return;
                }
                setConfirmModal(true);
              }}>
              <Save size={16} className="mr-1" />{" "}
              {isSubmitting
                ? t("page.goodsRequest.add.form.saving")
                : t("page.goodsRequest.add.form.save")}
            </Button>
          </div>
        </form>

        {isSubmitting && (
          <Loading fullscreen size="lg" label={t("page.goodsRequest.add.form.saving")} />
        )}

        <Modal
          type="confirm"
          open={cancelModal}
          onOpenChange={(o) => !o && setCancelModal(false)}
          title={t("page.goodsRequest.add.modal.title")}
          description={t("page.goodsRequest.add.modal.description")}
          confirmText={t("page.goodsRequest.add.modal.confirm")}
          onConfirm={() => {
            setCancelModal(false);
            navigate("/goods-request");
          }}
        />
        <Modal
          type="confirm"
          open={confirmModal}
          onOpenChange={setConfirmModal}
          title={t("page.goodsRequest.add.confirmModal.title")}
          description={t("page.goodsRequest.add.confirmModal.description")}
          confirmText={t("page.goodsRequest.add.confirmModal.confirm")}
          onConfirm={() => {
            setConfirmModal(false);
            doSubmit();
          }}
        />
        <MissingFieldsModal
          open={missingFieldsModal}
          onOpenChange={setMissingFieldsModal}
          fields={missingFields}
        />
        <Modal
          type="error"
          open={errorModal}
          onOpenChange={setErrorModal}
          title={t("common.error")}
          description={modalMessage}
          onConfirm={() => setErrorModal(false)}
        />
      </div>
    </>
  );
};

export default AddGoodsRequest;
