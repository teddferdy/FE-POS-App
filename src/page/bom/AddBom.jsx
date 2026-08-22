import React, { useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useQueryClient } from "react-query";
import { useCookies } from "react-cookie";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { Save, X, Plus, Trash2 } from "lucide-react";
import { addBom } from "@/services/bom";
import { getAllProduct } from "@/services/product";
import { getAllIngredients } from "@/services/ingredient";
import { getAllSupplier } from "@/services/supplier";
import { getAllLocation } from "@/services/location";
import { normalizeStoreId } from "@/utils/storeId";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Combobox } from "@/components/ui/combobox";
import Modal from "@/components/organism/modal";
import { Loading } from "@/components/ui/loading";
import MissingFieldsModal from "@/components/organism/MissingFieldsModal";
import { getMissingFields } from "@/lib/validation";

const formSchema = z.object({
  productId: z.string().min(1, "Required"),
  firstIngredient: z.string().min(1, "Required")
});

const AddBom = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const [cookies] = useCookies();
  const user = cookies?.user;
  const preselectedId = searchParams.get("productId");
  const isSuperAdmin = user?.roleType === "super_admin";

  const [selectedStore, setSelectedStore] = useState(
    isSuperAdmin ? "" : normalizeStoreId(user?.store) || ""
  );
  const [productId, setProductId] = useState(preselectedId || "");
  const [disabledProduct] = useState(!!preselectedId);
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [lines, setLines] = useState([
    { supplierId: "", ingredientId: "", qty: "", unit: "pcs", notes: "" }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorModal, setErrorModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [cancelModal, setCancelModal] = useState(false);
  const [draftModal, setDraftModal] = useState(false);
  const [missingFieldsModal, setMissingFieldsModal] = useState(false);
  const [missingFieldsList, setMissingFieldsList] = useState([]);
  const [deleteLineIdx, setDeleteLineIdx] = useState(null);

  const bomFieldLabels = useMemo(
    () => ({
      productId: t("page.bom.add.form.product"),
      firstIngredient: t("page.bom.add.form.ingredients")
    }),
    [t]
  );

  const { data: prodData } = useQuery(
    ["products-for-bom", selectedStore],
    () => getAllProduct({ location: selectedStore || undefined }),
    { enabled: !!selectedStore }
  );
  const products = prodData?.data || [];

  const { data: locationsData } = useQuery(["locations-for-bom"], () => getAllLocation(), {
    enabled: isSuperAdmin,
    staleTime: 30000
  });
  const locations = locationsData?.data || [];

  const { data: ingData } = useQuery(
    ["ingredients-for-bom", selectedStore],
    () => getAllIngredients({ store: selectedStore || undefined, limit: 999 }),
    { enabled: !!selectedStore }
  );
  const ingredients = (ingData?.data || []).filter((i) => i.status === "active");

  const { data: supData } = useQuery(
    ["suppliers-for-bom", selectedStore],
    () =>
      getAllSupplier({ limit: 999, store: selectedStore, status: "active", includeProducts: true }),
    { enabled: !!selectedStore, staleTime: 30000 }
  );
  const suppliers = supData?.data || [];

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
      map[String(sup.id)] = (sup.products || []).map((p) => {
        const match = ingredients.find(
          (ing) =>
            ing.name && p.name && ing.name.trim().toLowerCase() === p.name.trim().toLowerCase()
        );
        return {
          value: match ? String(match.id) : "",
          label: p.name,
          unit: match?.unit || p.unit || "pcs",
          matched: !!match
        };
      });
    }
    return map;
  }, [suppliers, ingredients]);

  const itemsForLine = (line) =>
    line.supplierId ? supplierItemsBySupplier[String(line.supplierId)] || [] : [];

  const addLine = () =>
    setLines((prev) => [
      ...prev,
      { supplierId: "", ingredientId: "", qty: "", unit: "pcs", notes: "" }
    ]);
  const removeLine = (idx) => {
    if (lines.length > 1) setLines((prev) => prev.filter((_, i) => i !== idx));
  };
  const updateLine = (idx, field, value) =>
    setLines((prev) =>
      prev.map((it, i) => {
        if (i !== idx) return it;
        if (field === "supplierId") return { ...it, supplierId: value, ingredientId: "" };
        return { ...it, [field]: value };
      })
    );

  const handleSaveClick = (saveAsDraft = false) => {
    if (!saveAsDraft) {
      const missing = getMissingFields(
        { productId, firstIngredient: lines[0]?.ingredientId || "" },
        formSchema,
        bomFieldLabels
      );
      if (missing.length > 0) {
        setMissingFieldsList(missing);
        setMissingFieldsModal(true);
        return;
      }
    }
    handleSubmit(null, saveAsDraft);
  };

  const handleSubmit = async (e, saveAsDraft = false) => {
    if (e?.preventDefault) e.preventDefault();
    setIsSubmitting(true);
    try {
      await addBom({
        productId: parseInt(productId),
        name: name || undefined,
        notes,
        status: saveAsDraft ? "draft" : "active",
        createdBy: user?.id,
        lines: lines
          .filter((l) => l.ingredientId && parseInt(l.qty) > 0)
          .map((l) => ({
            ingredientId: parseInt(l.ingredientId),
            qty: parseInt(l.qty),
            unit: l.unit,
            notes: l.notes
          }))
      });
      toast.success(t("page.bom.add.toast.success"), {
        description: t("page.bom.add.toast.successDesc")
      });
      queryClient.invalidateQueries(["bom-list"]);
      navigate("/bom");
    } catch (err) {
      setModalMessage(err?.response?.data?.message || err.message);
      setErrorModal(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
      <div>
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <button
            onClick={() => navigate("/dashboard-super-admin")}
            className="hover:text-foreground">
            {t("breadcrumb.dashboard")}
          </button>
          <span className="text-xs">/</span>
          <button onClick={() => navigate("/bom")} className="hover:text-foreground">
            {t("breadcrumb.bom")}
          </button>
          <span className="text-xs">/</span>
          <span className="text-primary font-semibold">{t("breadcrumb.add")}</span>
        </nav>
      </div>
      <div>
        <div>
          <h1 className="text-2xl font-bold">{t("page.bom.add.title")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t("page.bom.add.description")}</p>
        </div>
      </div>

      <div>
        <form
          onSubmit={(e) => e.preventDefault()}
          className="bg-card p-6 rounded-xl border border-border space-y-6">
          {isSuperAdmin && (
            <div className="space-y-2">
              <Label>
                {t("page.bom.add.form.store")} <span className="text-destructive">*</span>
              </Label>
              <Combobox
                options={[
                  { value: "", label: t("page.bom.add.form.selectStore") },
                  ...locations.map((loc) => ({
                    value: normalizeStoreId(loc.id),
                    label: loc.name
                  }))
                ]}
                value={selectedStore}
                onChange={(val) => {
                  setSelectedStore(val);
                  if (!disabledProduct) setProductId("");
                  setLines([{ supplierId: "", ingredientId: "", qty: "", unit: "pcs", notes: "" }]);
                }}
                placeholder={t("page.bom.add.form.selectStore")}
                searchPlaceholder={t("common.search")}
              />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>
                {t("page.bom.add.form.product")} <span className="text-destructive">*</span>
              </Label>
              <Combobox
                options={[
                  { value: "", label: t("page.bom.add.form.selectProduct") },
                  ...products.map((p) => ({
                    value: p.id,
                    label: `${p.nameProduct} (${p.sku || "-"})`
                  }))
                ]}
                value={productId}
                onChange={setProductId}
                disabled={disabledProduct || !selectedStore}
                placeholder={
                  selectedStore
                    ? t("page.bom.add.form.selectProduct")
                    : t("page.bom.add.form.selectStoreFirst")
                }
                searchPlaceholder={t("common.search")}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("page.bom.add.form.name")}</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("page.bom.add.placeholder.name")}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t("page.bom.add.form.ingredients")}</Label>
            {!selectedStore ? (
              <div className="flex flex-col items-center justify-center py-10 text-center px-4 border border-dashed border-border rounded-lg bg-muted/30">
                <p className="text-sm font-medium text-foreground">
                  {t("page.bom.add.form.selectStoreFirst")}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {t("page.bom.add.form.selectStoreHint")}
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto border rounded-lg">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/60 border-b">
                        <th className="px-3 py-2 text-left font-semibold text-muted-foreground text-xs">
                          {t("page.bom.add.table.supplier")}
                        </th>
                        <th className="px-3 py-2 text-left font-semibold text-muted-foreground text-xs">
                          {t("page.bom.add.table.ingredient")}
                        </th>
                        <th className="px-3 py-2 text-right font-semibold text-muted-foreground text-xs">
                          {t("page.bom.add.table.qty")}
                        </th>
                        <th className="px-3 py-2 text-center font-semibold text-muted-foreground text-xs">
                          {t("page.bom.add.table.unit")}
                        </th>
                        <th className="px-3 py-2 text-left font-semibold text-muted-foreground text-xs">
                          {t("page.bom.add.table.notes")}
                        </th>
                        <th className="w-10"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {lines.map((line, idx) => (
                        <tr key={idx} className="border-b border-muted/20">
                          <td className="px-3 py-2 min-w-[200px]">
                            <Combobox
                              options={[
                                { value: "", label: t("page.bom.add.form.selectSupplier") },
                                ...supplierOptions
                              ]}
                              value={line.supplierId}
                              onChange={(val) => updateLine(idx, "supplierId", val)}
                              placeholder={t("page.bom.add.form.selectSupplier")}
                              searchPlaceholder={t("common.search")}
                            />
                          </td>
                          <td className="px-3 py-2 min-w-[220px]">
                            <Combobox
                              options={[
                                { value: "", label: t("page.bom.add.form.selectIngredient") },
                                ...itemsForLine(line).map((it) => ({
                                  value: it.value,
                                  label: it.matched
                                    ? it.label
                                    : `${it.label} ${t("page.bom.add.form.notInIngredients")}`,
                                  disabled: !it.matched
                                }))
                              ]}
                              value={line.ingredientId}
                              onChange={(val) => {
                                const picked = itemsForLine(line).find((o) => o.value === val);
                                updateLine(idx, "ingredientId", val);
                                if (picked?.unit) updateLine(idx, "unit", picked.unit);
                              }}
                              disabled={!line.supplierId}
                              placeholder={
                                line.supplierId
                                  ? t("page.bom.add.form.selectIngredient")
                                  : t("page.bom.add.form.selectSupplierFirst")
                              }
                              searchPlaceholder={t("common.search")}
                            />
                          </td>
                          <td className="px-3 py-2">
                            <Input
                              type="number"
                              min="1"
                              value={line.qty}
                              onChange={(e) => updateLine(idx, "qty", e.target.value)}
                              className="h-8 text-xs text-right"
                              placeholder={t("page.bom.add.placeholder.qty")}
                            />
                          </td>
                          <td className="px-3 py-2">
                            <Combobox
                              options={[
                                { value: "pcs", label: t("unit.pcs") },
                                { value: "kg", label: t("unit.kg") },
                                { value: "liter", label: t("unit.liter") },
                                { value: "box", label: t("unit.box") }
                              ]}
                              value={line.unit}
                              onChange={(val) => updateLine(idx, "unit", val)}
                              placeholder={t("unit.pcs")}
                              searchPlaceholder={t("common.search")}
                            />
                          </td>
                          <td className="px-3 py-2">
                            <Input
                              value={line.notes}
                              onChange={(e) => updateLine(idx, "notes", e.target.value)}
                              className="h-8 text-xs"
                              placeholder={t("page.bom.add.placeholder.notes")}
                            />
                          </td>
                          <td className="px-3 py-2 text-center">
                            <button
                              type="button"
                              disabled={lines.length <= 1}
                              onClick={() => setDeleteLineIdx(idx)}
                              className="text-muted-foreground/30 hover:text-destructive disabled:opacity-20">
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addLine}
                  className="gap-1 mt-2">
                  <Plus size={14} /> {t("page.bom.add.form.addRow")}
                </Button>
              </>
            )}
          </div>

          <div className="space-y-2">
            <Label>{t("page.bom.add.form.notesLabel")}</Label>
            <Textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t("page.bom.add.placeholder.globalNotes")}
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto justify-center"
              onClick={() => setCancelModal(true)}>
              <X size={16} className="mr-1" /> {t("page.bom.add.form.cancel")}
            </Button>
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDraftModal(true)}
                disabled={isSubmitting}
                className="gap-2 w-full sm:w-auto justify-center">
                <Save size={16} />
                {t("page.bom.add.form.saveDraft")}
              </Button>
              <Button
                type="button"
                className="w-full sm:w-auto justify-center"
                onClick={() => handleSaveClick()}
                disabled={isSubmitting}>
                <Save size={16} className="mr-1" />{" "}
                {isSubmitting ? t("page.bom.add.form.saving") : t("page.bom.add.form.save")}
              </Button>
            </div>
          </div>
        </form>
      </div>
      {isSubmitting && <Loading fullscreen size="lg" label={t("page.bom.add.form.saving")} />}
      <Modal
        type="confirm"
        open={cancelModal}
        onOpenChange={(o) => !o && setCancelModal(false)}
        title={t("page.bom.add.modal.title")}
        description={t("page.bom.add.modal.description")}
        confirmText={t("page.bom.add.modal.confirm")}
        onConfirm={() => {
          setCancelModal(false);
          setTimeout(() => navigate("/bom"), 150);
        }}
      />
      <Modal
        type="confirm"
        open={draftModal}
        onOpenChange={(o) => !o && setDraftModal(false)}
        title={t("page.bom.add.modal.draftTitle")}
        description={t("page.bom.add.modal.draftDesc")}
        confirmText={t("page.bom.add.modal.draftConfirm")}
        onConfirm={() => {
          setDraftModal(false);
          handleSaveClick(true);
        }}
      />
      <Modal
        type="confirm"
        open={deleteLineIdx !== null}
        onOpenChange={(o) => !o && setDeleteLineIdx(null)}
        title={t("page.bom.add.modal.deleteLineTitle")}
        description={t("page.bom.add.modal.deleteLineDesc")}
        confirmText={t("common.yes") || "Ya"}
        cancelText={t("common.no") || "Batal"}
        onConfirm={() => {
          if (deleteLineIdx !== null) removeLine(deleteLineIdx);
          setDeleteLineIdx(null);
        }}
      />
      <MissingFieldsModal
        open={missingFieldsModal}
        onOpenChange={setMissingFieldsModal}
        fields={missingFieldsList}
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
  );
};

export default AddBom;
