import React, { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "react-query";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { useTranslation } from "react-i18next";
import { Save, Plus, Trash2, Package, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { createBundle } from "@/services/productBundle";
import { getAllProduct } from "@/services/product";
import MissingFieldsModal from "@/components/organism/MissingFieldsModal";
import { getMissingFields } from "@/lib/validation";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

const AddBundle = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [cookie] = useCookies();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: "",
    bundlePrice: 0,
    isAvailable: true,
    status: "draft",
    validFrom: "",
    validUntil: "",
    minQuantity: 1,
    maxQuantity: ""
  });

  const [bundleItems, setBundleItems] = useState([
    { product: "", quantity: 1, unitPrice: 0, isOptional: false }
  ]);

  const [missingFieldsModal, setMissingFieldsModal] = useState(false);
  const [missingFields, setMissingFields] = useState([]);

  const saveSchema = z.object({
    name: z.string().min(1, "Nama Bundle harus diisi"),
    bundlePrice: z.coerce.number().min(1, "Harga Bundle harus diisi"),
  });

  const { data: productsData, isLoading: isLoadingProducts } = useQuery(
    ["products-for-bundle"],
    () => getAllProduct()
  );

  const products = productsData?.data?.items || [];

  const createMutation = useMutation(createBundle, {
    onSuccess: () => {
      toast.success(t("common.success"), {
        description: t("page.bundle.createSuccess")
      });
      queryClient.invalidateQueries(["bundles"]);
      navigate("/bundle");
    },
    onError: (err) => {
      toast.error(t("common.error"), {
        description: err?.response?.data?.message || err.message
      });
    }
  });

  const updateFormData = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const updateBundleItem = (index, key, value) => {
    setBundleItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [key]: value };

      if (key === "product") {
        const product = products.find((p) => p.id === Number(value));
        if (product) {
          updated[index].unitPrice = product.price;
        }
      }

      return updated;
    });
  };

  const addBundleItem = () => {
    setBundleItems((prev) => [
      ...prev,
      { product: "", quantity: 1, unitPrice: 0, isOptional: false }
    ]);
  };

  const removeBundleItem = (index) => {
    if (bundleItems.length <= 1) return;
    setBundleItems((prev) => prev.filter((_, i) => i !== index));
  };

  const bundleFieldLabels = {
    name: "Nama Bundle",
    bundlePrice: "Harga Bundle",
    items: "Item Bundle",
  };

  const calculateOriginalPrice = () => {
    return bundleItems.reduce((sum, item) => {
      return sum + item.unitPrice * (item.quantity || 1);
    }, 0);
  };

  const handleSubmit = (asDraft) => {
    if (!asDraft) {
      const missing = getMissingFields({ ...formData, items: bundleItems }, saveSchema, bundleFieldLabels, 
        bundleItems.filter(i => i.product).length === 0 ? [{ name: "items" }] : []);
      
      if (missing.length > 0) {
        setMissingFields(missing);
        setMissingFieldsModal(true);
        return;
      }
    }

    const payload = {
      ...formData,
      status: asDraft ? "draft" : formData.status,
      bundlePrice: Number(formData.bundlePrice),
      minQuantity: Number(formData.minQuantity),
      maxQuantity: formData.maxQuantity ? Number(formData.maxQuantity) : null,
      items: bundleItems
        .filter((item) => item.product)
        .map((item) => ({
          product: Number(item.product),
          quantity: Number(item.quantity) || 1,
          unitPrice: Number(item.unitPrice) || 0,
          isOptional: item.isOptional
        }))
    };

    if (!asDraft && payload.items.length === 0) {
      toast.error(t("common.error"), {
        description: "Minimal harus ada 1 item bundle"
      });
      return;
    }

    createMutation.mutate(payload);
  };

  return (
    <div className="space-y-6">
      <div>
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <button
            onClick={() => navigate(-1)}
            className="hover:text-foreground transition-colors">
            <ArrowLeft size={14} className="inline mr-1" />
            {t("common.back")}
          </button>
          <span className="text-xs">/</span>
          <span className="text-primary font-semibold">
            {t("page.bundle.addTitle")}
          </span>
        </nav>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {t("page.bundle.addTitle")}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t("page.bundle.addDescription")}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <h3 className="font-semibold text-sm mb-4">
              {t("page.bundle.form.generalInfo")}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("page.bundle.form.name")} *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => updateFormData("name", e.target.value)}
                  placeholder={t("page.bundle.form.namePlaceholder")}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("page.bundle.form.image")}</Label>
                <Input
                  value={formData.image}
                  onChange={(e) => updateFormData("image", e.target.value)}
                  placeholder="https://..."
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label>{t("page.bundle.form.description")}</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => updateFormData("description", e.target.value)}
                  placeholder={t("page.bundle.form.descriptionPlaceholder")}
                  rows={3}
                />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm">
                {t("page.bundle.form.items")} *
              </h3>
              <Button size="sm" variant="outline" onClick={addBundleItem} className="gap-1.5">
                <Plus size={14} />
                {t("page.bundle.form.addItem")}
              </Button>
            </div>

            <div className="space-y-3">
              {bundleItems.map((item, index) => (
                <div key={index} className="flex items-end gap-3 p-3 rounded-lg border border-border bg-muted/20">
                  <div className="flex-1 space-y-1">
                    <Label className="text-xs">{t("page.bundle.form.selectProduct")}</Label>
                    <Select
                      value={item.product}
                      onValueChange={(v) => updateBundleItem(index, "product", v)}>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder={t("page.bundle.form.selectProduct")} />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((p) => (
                          <SelectItem key={p.id} value={String(p.id)}>
                            {p.nameProduct}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-20 space-y-1">
                    <Label className="text-xs">{t("page.bundle.form.quantity")}</Label>
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateBundleItem(index, "quantity", e.target.value)}
                      className="h-9"
                    />
                  </div>
                  <div className="w-28 space-y-1">
                    <Label className="text-xs">{t("page.bundle.form.unitPrice")}</Label>
                    <Input
                      type="number"
                      value={item.unitPrice}
                      onChange={(e) => updateBundleItem(index, "unitPrice", e.target.value)}
                      className="h-9"
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-destructive hover:text-destructive"
                    onClick={() => removeBundleItem(index)}
                    disabled={bundleItems.length <= 1}>
                    <Trash2 size={14} />
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="font-semibold text-sm mb-4">
              {t("page.bundle.form.pricing")}
            </h3>
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-muted/30">
                <p className="text-xs text-muted-foreground">{t("page.bundle.form.originalPrice")}</p>
                <p className="text-lg font-semibold">
                  Rp{calculateOriginalPrice().toLocaleString("id-ID")}
                </p>
              </div>
              <div className="space-y-2">
                <Label>{t("page.bundle.form.bundlePrice")} *</Label>
                <Input
                  type="number"
                  value={formData.bundlePrice}
                  onChange={(e) => updateFormData("bundlePrice", e.target.value)}
                  placeholder="0"
                />
              </div>
              <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                <p className="text-xs text-green-600 dark:text-green-400">{t("page.bundle.form.savings")}</p>
                <p className="text-lg font-bold text-green-600 dark:text-green-400">
                  Rp{Math.max(calculateOriginalPrice() - Number(formData.bundlePrice || 0), 0).toLocaleString("id-ID")}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold text-sm mb-4">
              {t("page.bundle.form.settings")}
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{t("page.bundle.form.status")}</Label>
                <Select
                  value={formData.status}
                  onValueChange={(v) => updateFormData("status", v)}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">{t("common.draft")}</SelectItem>
                    <SelectItem value="active">{t("common.active")}</SelectItem>
                    <SelectItem value="inactive">{t("common.inactive")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("page.bundle.form.validFrom")}</Label>
                <Input
                  type="datetime-local"
                  value={formData.validFrom}
                  onChange={(e) => updateFormData("validFrom", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("page.bundle.form.validUntil")}</Label>
                <Input
                  type="datetime-local"
                  value={formData.validUntil}
                  onChange={(e) => updateFormData("validUntil", e.target.value)}
                />
              </div>
            </div>
          </Card>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => handleSubmit(true)}
              disabled={createMutation.isLoading || !formData.name}>
              <Save size={16} className="mr-2" />
              {createMutation.isLoading ? t("common.processing") : t("common.saveDraft")}
            </Button>
            <Button
              className="flex-1"
              onClick={() => handleSubmit(false)}
              disabled={createMutation.isLoading || !formData.name}>
              <Save size={16} className="mr-2" />
              {createMutation.isLoading ? t("common.processing") : t("common.save")}
            </Button>
          </div>
        </div>
      </div>
      <MissingFieldsModal
        open={missingFieldsModal}
        onOpenChange={setMissingFieldsModal}
        fields={missingFields}
      />
    </div>
  );
};

export default AddBundle;
