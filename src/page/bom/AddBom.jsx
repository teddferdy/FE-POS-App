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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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

  const [productId, setProductId] = useState(preselectedId || "");
  const [disabledProduct] = useState(!!preselectedId);
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [lines, setLines] = useState([{ ingredientId: "", qty: "", unit: "pcs", notes: "" }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cancelModal, setCancelModal] = useState(false);
  const [draftModal, setDraftModal] = useState(false);
  const [missingFieldsModal, setMissingFieldsModal] = useState(false);
  const [missingFieldsList, setMissingFieldsList] = useState([]);

  const bomFieldLabels = useMemo(
    () => ({
      productId: t("page.bom.add.form.product"),
      firstIngredient: t("page.bom.add.form.ingredients")
    }),
    [t]
  );

  const { data: prodData } = useQuery(["products-for-bom"], () => getAllProduct({}), {
    
  });
  const products = prodData?.data || [];

  const { data: ingData } = useQuery(
    ["ingredients-for-bom", user?.store],
    () => getAllIngredients({ store: user?.store, limit: 999 }),
    { }
  );
  const ingredients = (ingData?.data || []).filter((i) => i.status === "active");

  const addLine = () =>
    setLines((prev) => [...prev, { ingredientId: "", qty: "", unit: "pcs", notes: "" }]);
  const removeLine = (idx) => {
    if (lines.length > 1) setLines((prev) => prev.filter((_, i) => i !== idx));
  };
  const updateLine = (idx, field, value) =>
    setLines((prev) => prev.map((it, i) => (i !== idx ? it : { ...it, [field]: value })));

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
      toast.error(t("page.bom.add.toast.error"), {
        description: err?.response?.data?.message || err.message
      });
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>
                {t("page.bom.add.form.product")} <span className="text-destructive">*</span>
              </Label>
              <select
                value={productId}
                disabled={disabledProduct}
                onChange={(e) => setProductId(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm disabled:opacity-60 disabled:cursor-not-allowed">
                <option value="">{t("page.bom.add.form.selectProduct")}</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nameProduct} ({p.sku || "-"})
                  </option>
                ))}
              </select>
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
            <div className="overflow-x-auto border rounded-lg">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/60 border-b">
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
                      <td className="px-3 py-2">
                        <select
                          value={line.ingredientId}
                          onChange={(e) => updateLine(idx, "ingredientId", e.target.value)}
                          className="w-full h-8 px-2 rounded border border-input bg-background text-xs">
                          <option value="">{t("page.bom.add.form.selectIngredient")}</option>
                          {ingredients.map((ing) => (
                            <option key={ing.id} value={ing.id} disabled={ing.stock === 0}>
                              {ing.name}
                              {ing.stock === 0 ? " (kosong)" : ""}
                            </option>
                          ))}
                        </select>
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
                        <select
                          value={line.unit}
                          onChange={(e) => updateLine(idx, "unit", e.target.value)}
                          className="w-full h-8 px-2 rounded border border-input bg-background text-xs">
                          <option value="pcs">{t("unit.pcs")}</option>
                          <option value="kg">{t("unit.kg")}</option>
                          <option value="liter">{t("unit.liter")}</option>
                          <option value="box">{t("unit.box")}</option>
                        </select>
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
                          onClick={() => removeLine(idx)}
                          className="text-muted-foreground/30 hover:text-destructive disabled:opacity-20">
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={addLine} className="gap-1">
              <Plus size={14} /> {t("page.bom.add.form.addRow")}
            </Button>
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

          <div className="flex items-center justify-between gap-4 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setCancelModal(true)}>
              <X size={16} className="mr-1" /> {t("page.bom.add.form.cancel")}
            </Button>
            <div className="flex items-center gap-3">
              <Button type="button" variant="outline" onClick={() => setDraftModal(true)} disabled={isSubmitting} className="gap-2">
                <Save size={16} />
                {t("page.bom.add.form.saveDraft")}
              </Button>
              <Button type="button" onClick={() => handleSaveClick()} disabled={isSubmitting}>
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
          navigate("/bom");
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
      <MissingFieldsModal
        open={missingFieldsModal}
        onOpenChange={setMissingFieldsModal}
        fields={missingFieldsList}
      />
    </div>
  );
};

export default AddBom;
