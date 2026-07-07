import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "react-query";
import { Save, Search, Package, Info } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useCookies } from "react-cookie";
import { adjustStock } from "@/services/stock";
import { getAllProduct } from "@/services/product";
import { getAllLocation } from "@/services/location";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import NoStore from "@/components/ui/NoStore";
import UserGuide from "@/components/organism/UserGuide";

const StockAdjustment = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [cookie] = useCookies();
  const store = cookie?.store;
  const user = cookie?.user;
  const isSuperAdmin = user?.roleType === "super_admin";

  const { data: locData } = useQuery(["locations-stock-adjustment"], () => getAllLocation(), {
    staleTime: 5 * 60 * 1000,
    enabled: isSuperAdmin
  });

  const [product, setProduct] = useState(null);
  const [productOpen, setProductOpen] = useState(false);
  const [sign, setSign] = useState("+");
  const [value, setValue] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { data: productsData, isLoading: productsLoading } = useQuery(
    ["products-adjustment", store],
    () => getAllProduct({ location: store }),
    { enabled: !!store, keepPreviousData: true }
  );
  const products = productsData?.data || [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!product) {
      toast.error(t("page.stockAdjustment.validation.productRequired"));
      return;
    }
    const val = parseInt(value, 10);
    if (isNaN(val) || val <= 0) {
      toast.error(t("page.stockAdjustment.validation.qtyRequired"));
      return;
    }
    setSubmitting(true);
    try {
      await adjustStock({ productId: product.id, sign, value: val, reason });
      toast.success(t("page.stockAdjustment.toast.success"));
      queryClient.invalidateQueries(["products-adjustment"]);
      setProduct(null);
      setSign("+");
      setValue("");
      setReason("");
    } catch (err) {
      toast.error(err.message || t("page.stockAdjustment.toast.error"));
    } finally {
      setSubmitting(false);
    }
  };

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
          <span className="text-primary font-semibold">{t("page.stockAdjustment.title")}</span>
        </nav>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("page.stockAdjustment.title")}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("page.stockAdjustment.description")}
          </p>
        </div>
        <UserGuide guideKey="adjust-stock" />
      </div>

      {locData && (locData?.data || []).length === 0 ? (
        <NoStore />
      ) : (
        <div className="space-y-6">
          {productsLoading ? (
            <Loading />
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <Card className="p-6 shadow-sm border-muted space-y-5">
                <div className="space-y-2">
                  <Label>
                    {t("page.stockAdjustment.form.product")}{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Popover open={productOpen} onOpenChange={setProductOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        className="w-full justify-between h-9">
                        {product
                          ? `${product.nameProduct} (${t("page.stockAdjustment.form.stockAvailable")}: ${product.stock || 0})`
                          : t("page.stockAdjustment.form.productPlaceholder")}
                        <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                      <Command>
                        <CommandInput
                          placeholder={t("page.stockAdjustment.form.productPlaceholder")}
                        />
                        <CommandList>
                          <CommandEmpty>
                            {t("page.stockAdjustment.form.productPlaceholder")}
                          </CommandEmpty>
                          {products.map((p) => (
                            <CommandItem
                              key={p.id}
                              value={`${p.id}-${p.nameProduct}`}
                              onSelect={() => {
                                setProduct(p);
                                setProductOpen(false);
                              }}>
                              <Package className="mr-2 h-4 w-4 shrink-0" />
                              <span className="flex-1">{p.nameProduct}</span>
                              <span className="text-muted-foreground text-sm">
                                {t("page.stockAdjustment.form.stockAvailable")}: {p.stock || 0}
                              </span>
                            </CommandItem>
                          ))}
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>
                    {t("page.stockAdjustment.form.qty")} <span className="text-destructive">*</span>
                    <span className="text-xs text-muted-foreground ml-2 font-normal">
                      ({t("page.stockAdjustment.form.qtyHint")})
                    </span>
                  </Label>
                  <div className="flex gap-2">
                    <Select value={sign} onValueChange={setSign}>
                      <SelectTrigger className="w-14 h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="w-14 max-w-14">
                        <SelectItem value="+">+</SelectItem>
                        <SelectItem value="-">-</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      type="text"
                      inputMode="numeric"
                      placeholder={t("page.stockAdjustment.form.qtyPlaceholder")}
                      value={value}
                      onChange={(e) => setValue(e.target.value.replace(/\D/g, ""))}
                      className="h-9 flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>{t("page.stockAdjustment.form.reason")}</Label>
                  <Textarea
                    placeholder={t("page.stockAdjustment.form.reasonPlaceholder")}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="bg-blue-50/80 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg px-4 py-3 text-xs text-blue-700 dark:text-blue-300 flex flex-col gap-2 transition-colors">
                  <div className="flex items-start gap-2">
                    <Info size={14} className="mt-0.5 shrink-0" />
                    <span>{t("page.stockAdjustment.tips.direction")}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Info size={14} className="mt-0.5 shrink-0" />
                    <span>{t("page.stockAdjustment.tips.effect")}</span>
                  </div>
                </div>
              </Card>
              <Card className="p-6 shadow-sm border-muted">
                <div className="flex justify-between items-center">
                  <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                    {t("page.stockAdjustment.form.cancel")}
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? <Loading /> : <Save className="mr-2 h-4 w-4" />}
                    {t("page.stockAdjustment.form.submit")}
                  </Button>
                </div>
              </Card>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default StockAdjustment;
