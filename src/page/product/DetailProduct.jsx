import React from "react";
import { useQuery } from "react-query";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Package,
  Edit3,
  Calendar,
  User,
  // Tag,
  // DollarSign,
  // Box,
  // Ruler,
  ShoppingCart,
  // Coffee,
  // Beef,
  // Star,
  // BadgePercent,
  // Repeat,
  Scale,
  Info
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getProductById } from "@/services/product";

const statusBadge = (status, t) => {
  if (status === "active")
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800">
        <span className="w-1.5 h-1.5 rounded-full bg-green-500 dark:bg-green-400" />
        {t("common.active")}
      </span>
    );
  if (status === "draft")
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 dark:bg-amber-400" />
        {t("common.draft")}
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800">
      <span className="w-1.5 h-1.5 rounded-full bg-red-500 dark:bg-red-400" />
      {t("common.inactive")}
    </span>
  );
};

const availableBadge = (isAvailable, t) => {
  if (isAvailable)
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800">
        <span className="w-1.5 h-1.5 rounded-full bg-green-500 dark:bg-green-400" />
        {t("page.product.detail.available")}
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800">
      <span className="w-1.5 h-1.5 rounded-full bg-red-500 dark:bg-red-400" />
      {t("page.product.detail.unavailable")}
    </span>
  );
};

const DetailProduct = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();

  const { data, isLoading, isError, refetch } = useQuery(
    ["product", id],
    () => getProductById(id),
    {
      enabled: !!id
    }
  );

  const product = data?.data || data;

  const formatPrice = (value) => {
    if (value == null || isNaN(value)) return "0";
    return Number(value).toLocaleString("id-ID");
  };

  if (!id)
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">{t("page.product.detail.notFound")}</p>
      </div>
    );

  if (isError)
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-muted-foreground">{t("page.product.detail.notFound")}</p>
        <Button variant="outline" onClick={() => refetch()}>
          {t("common.retry")}
        </Button>
        <Button variant="ghost" onClick={() => navigate("/product-list")}>
          {t("common.back")}
        </Button>
      </div>
    );

  const imageUrl = product.image || product.imageProduct || product.photo || null;
  const hasImage = imageUrl && (imageUrl.startsWith("http") || imageUrl.startsWith("/"));

  const parseOptions = () => {
    if (product.isOption && Array.isArray(product.options)) return product.options;
    if (Array.isArray(product.variant)) return product.variant;
    return [];
  };
  const options = parseOptions();
  const hasOptions = options.length > 0;

  const parseComposition = () => {
    if (Array.isArray(product.composition)) return product.composition;
    if (typeof product.composition === "string") {
      try {
        return JSON.parse(product.composition);
      } catch {
        return [];
      }
    }
    return [];
  };
  const composition = parseComposition();
  const hasComposition = composition.length > 0;

  // const typeIcon =
  //   product.tipeProduk === "menu" ? Coffee : product.tipeProduk === "bahan" ? Beef : Package;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <button onClick={() => navigate("/")} className="hover:text-foreground transition-colors">
          {t("breadcrumb.dashboard")}
        </button>
        <span className="text-xs">/</span>
        <button
          onClick={() => navigate("/product-list")}
          className="hover:text-foreground transition-colors">
          {t("breadcrumb.product")}
        </button>
        <span className="text-xs">/</span>
        <span className="text-primary font-semibold">
          {isLoading ? (
            <Skeleton className="h-4 w-32 inline-block" />
          ) : (
            product.nameProduct || product.name || "Detail"
          )}
        </span>
      </nav>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={() => navigate("/product-list")}>
            <ArrowLeft size={16} />
          </Button>
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            {imageUrl && !imageUrl.startsWith("http") ? (
              <span className="material-symbols-outlined text-3xl">{imageUrl}</span>
            ) : (
              <Package size={24} />
            )}
          </div>
          <div>
            {isLoading ? (
              <>
                <Skeleton className="h-7 w-48 mb-2" />
                <Skeleton className="h-4 w-64" />
              </>
            ) : (
              <>
                <h1 className="text-2xl font-bold">{product.nameProduct || product.name || "-"}</h1>
                <p className="text-sm text-muted-foreground">{t("page.product.detail.description")}</p>
              </>
            )}
          </div>
        </div>
        {!isLoading && (
          <Button variant="outline" onClick={() => navigate(`/edit-product?id=${id}`)}>
            <Edit3 size={14} className="mr-1.5" />
            {t("common.edit")}
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-5 col-span-1 md:col-span-2 space-y-4">
            <Skeleton className="h-4 w-32" />
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-4 w-32" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="col-span-2 space-y-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-4 w-48" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
            </div>
          </Card>
          <div className="space-y-4">
            <Card className="p-5 space-y-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </Card>
            <Card className="p-5 space-y-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-40" />
            </Card>
          </div>
        </div>
      ) : (
        <>
      {hasImage && (
        <div className="w-full h-56 rounded-xl overflow-hidden bg-muted/30 border border-border/50">
          <img
            src={imageUrl}
            alt={product.nameProduct || product.name || ""}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5 col-span-1 md:col-span-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-5">
            <Package size={16} />
            {t("page.product.detail.productInfo")}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6 text-sm">
            <div>
              <p className="text-xs text-muted-foreground mb-1">{t("page.product.form.name")}</p>
              <p className="font-medium">{product.nameProduct || product.name || "-"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">SKU</p>
              <p className="font-mono text-sm">{product.sku || "-"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">
                {t("page.product.detail.category")}
              </p>
              <p className="font-medium">
                {product.nameCategory ||
                  product.categoryData?.name ||
                  product.category?.name ||
                  "-"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">{t("page.product.table.status")}</p>
              {statusBadge(product.status, t)}
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">
                {t("page.product.detail.sellingPrice")}
              </p>
              <p className="font-medium">Rp {formatPrice(product.price || 0)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">
                {t("page.product.detail.costPrice")}
              </p>
              <p className="font-medium">Rp {formatPrice(product.costPrice || 0)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">{t("page.product.detail.stock")}</p>
              <p className="font-medium">
                {product.stock ?? 0} {product.unit || ""}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">
                {t("page.product.detail.minStock")}
              </p>
              <p className="font-medium">{product.minStock ?? 0}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">{t("page.product.detail.type")}</p>
              <p className="font-medium capitalize">{product.tipeProduk || "menu"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">
                {t("page.product.detail.availability")}
              </p>
              {availableBadge(product.isAvailableHariIni ?? product.isAvailable ?? true, t)}
            </div>
            {product.brand && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">{t("page.product.form.brand")}</p>
                <p className="font-medium">{product.brand}</p>
              </div>
            )}
            {product.barcode && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  {t("page.product.form.barcode")}
                </p>
                <p className="font-mono text-sm">{product.barcode}</p>
              </div>
            )}
            <div className="md:col-span-2">
              <p className="text-xs text-muted-foreground mb-1">
                {t("page.product.form.description")}
              </p>
              <p className="font-medium">{product.description || product.descProduct || "-"}</p>
            </div>
          </div>

          {hasOptions && (
            <div className="border-t border-border/50 mt-5 pt-4">
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                {product.isOption
                  ? t("page.product.detail.form.option")
                  : t("page.product.detail.variants")}
              </p>
              <div className="space-y-2">
                {options.map((opt, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/40">
                    <div className="flex items-center gap-2">
                      {opt.image && (
                        <div className="w-8 h-8 rounded-md overflow-hidden">
                          <img
                            src={opt.image}
                            alt={opt.nameVariant || opt.name || ""}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <span className="text-sm font-medium">
                        {opt.nameVariant || opt.name || opt.nameOption || opt.label || "-"}
                      </span>
                    </div>
                    <span className="text-sm font-bold">
                      Rp {formatPrice(opt.price || opt.priceOption || 0)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {hasComposition && (
            <div className="border-t border-border/50 mt-5 pt-4">
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                {t("page.product.detail.composition")}
              </p>
              <div className="space-y-2">
                {composition.map((comp, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/40">
                    <span className="text-sm font-medium">
                      {comp.name || comp.bahan || comp.ingredient || "-"}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {comp.qty || comp.quantity || comp.jumlah || ""}{" "}
                      {comp.unit || comp.satuan || ""}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-3 grid grid-cols-3 gap-3 text-xs text-muted-foreground">
                <div className="p-2 rounded bg-muted/20">
                  <p>{t("page.product.detail.hppPerPortion")}</p>
                  <p className="font-semibold text-foreground">
                    Rp {formatPrice(product.hppPerPorsi || 0)}
                  </p>
                </div>
                <div className="p-2 rounded bg-muted/20">
                  <p>{t("page.product.detail.foodCost")}</p>
                  <p className="font-semibold text-foreground">{product.foodCostPersen || "0"}%</p>
                </div>
                <div className="p-2 rounded bg-muted/20">
                  <p>{t("page.product.detail.margin")}</p>
                  <p className="font-semibold text-foreground">{product.marginPersen || "0"}%</p>
                </div>
              </div>
              <div className="mt-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/40 text-xs text-blue-700 dark:text-blue-300 space-y-1.5">
                <div className="flex items-center gap-1.5 font-semibold">
                  <Info size={13} />
                  {t("page.product.detail.marginTips.title")}
                </div>
                <p>
                  {t("page.product.detail.marginTips.hpp")}{" "}
                  <strong>Rp {formatPrice(product.hppPerPorsi || 0)}</strong>
                </p>
                <p>
                  {t("page.product.detail.marginTips.foodCost", {
                    sellingPrice: formatPrice(product.price || 0),
                    hpp: formatPrice(product.hppPerPorsi || 0)
                  })}
                </p>
                <p>
                  {t("page.product.detail.marginTips.margin", {
                    foodCost: product.foodCostPersen || "0"
                  })}
                </p>
              </div>
            </div>
          )}

          {!hasComposition && (
            <div className="border-t border-border/50 mt-5 pt-4">
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                {t("page.product.detail.composition")}
              </p>
              <div className="flex flex-col items-center gap-3 py-6 text-center">
                <p className="text-sm text-muted-foreground">
                  {t("page.product.detail.noComposition")}
                </p>
                <Button onClick={() => navigate(`/bom/add?productId=${id}`)}>
                  {t("page.product.detail.addComposition")}
                </Button>
              </div>
              <div className="mt-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-xs text-amber-700 dark:text-amber-300 space-y-1.5">
                <div className="flex items-center gap-1.5 font-semibold">
                  <Info size={13} />
                  {t("page.product.detail.noCompositionTips.title")}
                </div>
                <p>{t("page.product.detail.noCompositionTips.desc")}</p>
                <p>{t("page.product.detail.noCompositionTips.benefit1")}</p>
                <p>{t("page.product.detail.noCompositionTips.benefit2")}</p>
              </div>
            </div>
          )}

          <div className="border-t border-border/50 mt-5 pt-4 grid grid-cols-2 gap-2.5 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <User size={13} className="shrink-0" />
              <span>
                {t("common.createdBy")}:{" "}
                {product.createdByUser?.fullName ||
                  product.createdByUser?.userName ||
                  product.createdBy ||
                  "-"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <User size={13} className="shrink-0" />
              <span>
                {t("common.modifiedBy")}:{" "}
                {product.modifiedByUser?.fullName ||
                  product.modifiedByUser?.userName ||
                  product.modifiedBy ||
                  "-"}
              </span>
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="p-5">
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-4">
              <Calendar size={14} />
              {t("page.product.detail.timeInfo")}
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground">{t("common.createdAt")}</p>
                <p className="text-sm font-medium">
                  {product.createdAt
                    ? new Date(product.createdAt).toLocaleDateString("id-ID", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      })
                    : "-"}
                </p>
              </div>
              <div className="pt-2 border-t border-border/50">
                <p className="text-xs text-muted-foreground">{t("common.updatedAt")}</p>
                <p className="text-sm font-medium">
                  {product.updatedAt
                    ? new Date(product.updatedAt).toLocaleDateString("id-ID", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      })
                    : "-"}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-4">
              <ShoppingCart size={14} />
              {t("page.product.detail.summary")}
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {t("page.product.detail.stock")}
                </span>
                <span className="text-sm font-bold">{product.stock ?? 0}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-border/50">
                <span className="text-sm text-muted-foreground">
                  {t("page.product.detail.sellingPrice")}
                </span>
                <span className="text-sm font-bold">Rp {formatPrice(product.price || 0)}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-border/50">
                <span className="text-sm text-muted-foreground">
                  {t("page.product.detail.costPrice")}
                </span>
                <span className="text-sm font-bold">Rp {formatPrice(product.costPrice || 0)}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-border/50">
                <span className="text-sm text-muted-foreground">
                  {t("page.product.detail.margin")}
                </span>
                <span className="text-sm font-bold">{product.marginPersen || "0"}%</span>
              </div>
              {product.point > 0 && (
                <div className="flex items-center justify-between pt-2 border-t border-border/50">
                  <span className="text-sm text-muted-foreground">
                    {t("page.product.detail.memberPoints")}
                  </span>
                  <span className="text-sm font-bold">{product.point}</span>
                </div>
              )}
            </div>
          </Card>

          {product.unit && product.baseUnit && (
            <Card className="p-5">
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-4">
                <Scale size={14} />
                Satuan
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{t("page.product.form.unit")}</span>
                  <span className="font-medium">{product.baseUnit}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-border/50">
                  <span className="text-muted-foreground">{t("page.product.form.unit")}</span>
                  <span className="font-medium">{product.unit}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-border/50">
                  <span className="text-muted-foreground">
                    {t("page.product.detail.conversionFactor")}
                  </span>
                  <span className="font-medium">{product.conversionFactor || 1}</span>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
        </>
      )}
    </div>
  );
};

export default DetailProduct;
