import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery, useQueryClient } from "react-query";
import { useCookies } from "react-cookie";
import { Save, X, Plus, Trash2, ArrowLeft, User } from "lucide-react";
import { toast } from "sonner";
import { addGoodsRequest } from "@/services/goods-request";
import { getAllLocation } from "@/services/location";
import { getAllSupplier } from "@/services/supplier";
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

const emptyItem = {
  name: "",
  ingredient: null,
  ingredientName: null,
  product: null,
  productName: null,
  qty: 1,
  unit: "pcs",
  notes: ""
};

const emptyGroup = () => ({ supplier: null, items: [{ ...emptyItem }] });

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
  const [groups, setGroups] = useState([emptyGroup()]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorModal, setErrorModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [cancelModal, setCancelModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);
  const [missingFieldsModal, setMissingFieldsModal] = useState(false);
  const [missingFields, setMissingFields] = useState([]);
  const [changeStoreModal, setChangeStoreModal] = useState(false);
  const [pendingStoreId, setPendingStoreId] = useState("");
  const [successModal, setSuccessModal] = useState(false);

  const fieldLabels = {
    storeId: t("page.goodsRequest.add.form.store"),
    items: t("page.goodsRequest.add.form.items")
  };

  const formSchema = z.object({
    storeId: z.union([z.string().min(1), z.number().min(1)]),
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

  const { data: suppliersData, isLoading: suppliersLoading } = useQuery(
    ["suppliers-goods-request", storeId],
    () =>
      getAllSupplier({
        store: storeId,
        limit: 999,
        status: "active",
        includeProducts: true
      }),
    { enabled: !!storeId }
  );
  const suppliers = suppliersData?.data || [];

  const supplierOptions = useMemo(
    () =>
      (suppliers || []).map((sup) => ({
        value: String(sup.id),
        label: sup.name || sup.supplierName || `Supplier #${sup.id}`
      })),
    [suppliers]
  );

  const supplierItemsBySupplier = useMemo(() => {
    const map = {};
    for (const sup of suppliers || []) {
      map[sup.id] = (sup.products || []).map((p) => ({
        value: `sp-${p.id}`,
        productId: p.productId || null,
        name: p.name,
        unit: p.unit || "pcs"
      }));
    }
    return map;
  }, [suppliers]);

  const selectedItemValue = (item, supplier) => {
    if (!supplier) return "";
    const list = supplierItemsBySupplier[supplier] || [];
    const match = list.find(
      (opt) =>
        (item.product && item.product === opt.productId) ||
        (item.ingredientName && item.ingredientName === opt.name) ||
        (item.productName && item.productName === opt.name)
    );
    return match?.value || "";
  };

  const itemOptionsForRow = (gIdx, iIdx, supplier) => {
    if (!supplier) return [];
    const list = supplierItemsBySupplier[supplier] || [];
    const taken = new Set();
    const group = groups[gIdx];
    (group?.items || []).forEach((other, j) => {
      if (j === iIdx) return;
      const val = selectedItemValue(other, supplier);
      if (val) taken.add(val);
    });
    return list
      .filter((it) => !taken.has(it.value))
      .map((it) => ({ value: it.value, label: it.name }));
  };

  const allItems = useMemo(
    () =>
      groups.flatMap((g) =>
        g.items.map((it) => ({
          name: it.name,
          qty: it.qty,
          supplier: g.supplier
        }))
      ),
    [groups]
  );

  const hasFilledItems = useMemo(
    () =>
      groups.some(
        (g) =>
          g.supplier || g.items.some((it) => it.name.trim() !== "" || it.ingredient || it.product)
      ),
    [groups]
  );

  const addGroup = () => setGroups((prev) => [...prev, emptyGroup()]);

  const removeGroup = (gIdx) => setGroups((prev) => prev.filter((_, i) => i !== gIdx));

  const addItem = (gIdx) =>
    setGroups((prev) =>
      prev.map((g, i) => (i === gIdx ? { ...g, items: [...g.items, { ...emptyItem }] } : g))
    );

  const removeItem = (gIdx, iIdx) =>
    setGroups((prev) =>
      prev.map((g, i) => (i === gIdx ? { ...g, items: g.items.filter((_, j) => j !== iIdx) } : g))
    );

  const updateItem = (gIdx, iIdx, field, value) =>
    setGroups((prev) =>
      prev.map((g, i) =>
        i === gIdx
          ? {
              ...g,
              items: g.items.map((it, j) => (j === iIdx ? { ...it, [field]: value } : it))
            }
          : g
      )
    );

  const pickGroupSupplier = (gIdx, value) => {
    const supplierId = value ? Number(value) : null;
    setGroups((prev) =>
      prev.map((g, i) =>
        i === gIdx ? { supplier: supplierId, items: g.items.map(() => ({ ...emptyItem })) } : g
      )
    );
  };

  const pickItemOption = (gIdx, iIdx, value) => {
    setGroups((prev) =>
      prev.map((g, gi) => {
        if (gi !== gIdx) return g;
        const list = supplierItemsBySupplier[g.supplier] || [];
        const opt = list.find((o) => o.value === value);
        return {
          ...g,
          items: g.items.map((it, ii) => {
            if (ii !== iIdx) return it;
            if (!opt) {
              return {
                ...it,
                name: "",
                ingredient: null,
                ingredientName: null,
                product: null,
                productName: null
              };
            }
            if (opt.productId) {
              return {
                ...it,
                name: opt.name,
                product: opt.productId,
                productName: opt.name,
                ingredient: null,
                ingredientName: null,
                unit: opt.unit || it.unit
              };
            }
            return {
              ...it,
              name: opt.name,
              ingredient: null,
              ingredientName: opt.name,
              product: null,
              productName: null,
              unit: opt.unit || it.unit
            };
          })
        };
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
    const validItems = [];
    for (const g of groups) {
      for (const it of g.items) {
        if (it.name.trim() && it.qty > 0) validItems.push({ ...it, supplier: g.supplier });
      }
    }
    if (validItems.length === 0) {
      toast.error(t("page.goodsRequest.add.toast.validation"), {
        description: t("page.goodsRequest.add.toast.itemRequired")
      });
      return;
    }
    if (validItems.some((it) => !it.supplier)) {
      toast.error(t("page.goodsRequest.add.toast.validation"), {
        description: t("page.goodsRequest.add.toast.supplierRequired")
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
          ingredientName: it.ingredientName || null,
          product: it.product,
          productName: it.productName || null,
          supplier: it.supplier || null,
          qty: it.qty,
          unit: it.unit,
          notes: it.notes || null
        }))
      });
      queryClient.invalidateQueries(["goods-requests"]);
      setSuccessModal(true);
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
                onChange={(val) => {
                  if (val === storeId) return;
                  if (storeId && hasFilledItems) {
                    setPendingStoreId(val);
                    setChangeStoreModal(true);
                    return;
                  }
                  setStoreId(val);
                }}
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

            {groups.map((group, gIdx) => (
              <div key={gIdx} className="border rounded-lg overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 p-3 border-b bg-muted/40">
                  <Label className="shrink-0 text-xs text-muted-foreground">
                    {t("page.goodsRequest.add.table.supplier")}
                  </Label>
                  <div className="flex-1 min-w-[220px]">
                    <Combobox
                      options={supplierOptions}
                      value={group.supplier ? String(group.supplier) : ""}
                      onChange={(val) => pickGroupSupplier(gIdx, val)}
                      placeholder={t("page.goodsRequest.add.placeholder.selectSupplier")}
                      searchPlaceholder={t("common.search")}
                      emptyMessage={t("page.goodsRequest.add.table.noSupplier")}
                      disabled={!storeId || suppliersLoading}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={() => removeGroup(gIdx)}
                    disabled={groups.length === 1}>
                    <Trash2 size={14} />
                  </Button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm min-w-[760px]">
                    <thead>
                      <tr className="border-b">
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
                      {group.items.map((item, iIdx) => (
                        <tr key={iIdx} className="border-b border-muted/20">
                          <td className="px-3 py-2 min-w-[280px]">
                            <Combobox
                              options={itemOptionsForRow(gIdx, iIdx, group.supplier)}
                              value={selectedItemValue(item, group.supplier)}
                              onChange={(val) => pickItemOption(gIdx, iIdx, val)}
                              placeholder={t("page.goodsRequest.add.placeholder.selectItem")}
                              searchPlaceholder={t("common.search")}
                              emptyMessage={t("page.goodsRequest.add.table.noItem")}
                              disabled={!group.supplier}
                            />
                            {item.name && !selectedItemValue(item, group.supplier) && (
                              <p className="text-[10px] text-muted-foreground mt-1 truncate">
                                {item.name}
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
                                  gIdx,
                                  iIdx,
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
                                onChange={(val) => updateItem(gIdx, iIdx, "unit", val)}
                                placeholder="pcs"
                                searchPlaceholder={t("common.search")}
                              />
                            </div>
                          </td>
                          <td className="px-3 py-2">
                            <Input
                              value={item.notes}
                              onChange={(e) => updateItem(gIdx, iIdx, "notes", e.target.value)}
                              className="h-8 text-xs"
                              placeholder={t("page.goodsRequest.add.placeholder.notes")}
                            />
                          </td>
                          <td className="px-3 py-2 text-center">
                            <button
                              type="button"
                              onClick={() => removeItem(gIdx, iIdx)}
                              className="text-muted-foreground/40 hover:text-destructive">
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="p-3 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addItem(gIdx)}
                    className="gap-1">
                    <Plus size={14} /> {t("page.goodsRequest.add.form.addItem")}
                  </Button>
                </div>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addGroup}
              disabled={!storeId || suppliersLoading}
              className="gap-1">
              <Plus size={14} /> {t("page.goodsRequest.add.form.addSupplier")}
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
              disabled={isSubmitting || allItems.length === 0}
              onClick={() => {
                const missing = getMissingFields(
                  { storeId, items: allItems },
                  formSchema,
                  fieldLabels
                );
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
        <Modal
          type="confirm"
          open={changeStoreModal}
          onOpenChange={(o) => !o && setChangeStoreModal(false)}
          title={t("page.goodsRequest.add.changeStoreModal.title")}
          description={t("page.goodsRequest.add.changeStoreModal.description")}
          confirmText={t("page.goodsRequest.add.changeStoreModal.confirm")}
          onConfirm={() => {
            setGroups([emptyGroup()]);
            setStoreId(pendingStoreId);
            setChangeStoreModal(false);
            setPendingStoreId("");
          }}
        />
        <MissingFieldsModal
          open={missingFieldsModal}
          onOpenChange={setMissingFieldsModal}
          fields={missingFields}
        />
        <Modal
          type="success"
          open={successModal}
          onOpenChange={setSuccessModal}
          title={t("page.goodsRequest.add.successModal.title")}
          description={t("page.goodsRequest.add.successModal.description")}
          onConfirm={() => navigate("/goods-request")}
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
