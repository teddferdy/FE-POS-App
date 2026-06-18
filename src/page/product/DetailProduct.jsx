import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "react-query";
import { useTranslation } from "react-i18next";
import {
  Package,
  DollarSign,
  Barcode,
  Tag,
  Building2,
  Layers,
  ShoppingCart,
  AlertTriangle,
  Star,
  Scale,
  Clock,
  Edit,
  ArrowLeft,
  Hash,
  CalendarDays
} from "lucide-react";
import { getProductById, getProductBatches } from "@/services/product";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import AbortController from "@/components/organism/abort-controller";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const formatCurrency = (num) => {
  if (num === null || num === undefined) return "Rp0";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0
  }).format(num);
};

const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "-";
    return d.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  } catch {
    return "-";
  }
};

const DetailProduct = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const productId = searchParams.get("id");

  const { data, isLoading, isError, refetch } = useQuery(
    ["product-detail", productId],
    () => getProductById(productId),
    { enabled: !!productId }
  );

  const product = data?.data || {};

  const { data: batchesData, isLoading: loadingBatches } = useQuery(
    ["product-batches", productId],
    () => getProductBatches({ productId, store: product.store || "" }),
    { enabled: !!productId && !!product.store }
  );
  const batches = batchesData?.data || [];

  if (!productId) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground gap-3">
        <Package size={48} className="opacity-30" />
        <p>{t("page.product.detail.idNotFound")}</p>
        <Button variant="outline" onClick={() => navigate("/product-list")}>
          {t("common.back")}
        </Button>
      </div>
    );
  }

  if (isError) return <AbortController refetch={refetch} />;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-3" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-3" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="rounded-2xl border border-border overflow-hidden">
          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-start gap-6">
              <Skeleton className="w-full md:w-56 h-56 rounded-xl" />
              <div className="flex-1 min-w-0 space-y-3">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <div className="flex flex-wrap gap-4 pt-2">
                  <Skeleton className="h-6 w-28 rounded-full" />
                  <Skeleton className="h-6 w-36 rounded-full" />
                  <Skeleton className="h-6 w-24 rounded-full" />
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-border">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="p-5 flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
                <div className="space-y-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {[...Array(4)].map((_, ci) => (
              <div key={ci} className="rounded-xl border border-border overflow-hidden">
                <div className="p-5 border-b border-border">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
                <div className="p-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <Skeleton className="w-9 h-9 rounded-lg shrink-0" />
                        <div className="space-y-1.5">
                          <Skeleton className="h-3 w-16" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-5 w-12 rounded-full" />
                    </div>
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-5 w-12 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-6">
            <div className="rounded-xl border border-border overflow-hidden">
              <div className="p-5 border-b border-border">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
              <div className="p-5 space-y-4">
                <div className="text-center space-y-2">
                  <Skeleton className="h-10 w-20 mx-auto" />
                  <Skeleton className="h-3 w-32 mx-auto" />
                </div>
                <Skeleton className="h-2.5 w-full rounded-full" />
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-12" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-between items-center gap-3 pt-2">
          <Skeleton className="h-10 w-28 rounded-md" />
          <Skeleton className="h-10 w-36 rounded-md" />
        </div>
      </div>
    );
  }

  if (!product || !product.id) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground gap-3">
        <Package size={48} className="opacity-30" />
        <p>{t("page.product.detail.notFound")}</p>
        <Button variant="outline" onClick={() => navigate("/product-list")}>
          {t("common.back")}
        </Button>
      </div>
    );
  }

  const isActive = product.status === "active";
  const stock = product.stock || 0;
  const minStock = product.minStock || 0;
  const isLowStock = stock > 0 && stock <= minStock;
  const isOutOfStock = stock <= 0;

  return (
    <motion.div variants={container} initial="hidden" animate="show">
      <div className="space-y-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <button
            onClick={() => navigate("/dashboard-super-admin")}
            className="hover:text-foreground transition-colors">
            {t("breadcrumb.home")}
          </button>
          <span className="text-xs">/</span>
          <button
            onClick={() => navigate("/product-list")}
            className="hover:text-foreground transition-colors">
            {t("breadcrumb.product")}
          </button>
          <span className="text-xs">/</span>
          <span className="text-primary font-semibold">{product.nameProduct}</span>
        </nav>

        {/* Hero Section */}
        <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-start gap-6">
              {/* Image */}
              <div className="w-full md:w-56 h-56 rounded-xl overflow-hidden bg-muted shrink-0 border border-border">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.nameProduct}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <Package size={64} className="opacity-20" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 space-y-3">
                <div className="flex items-start gap-3 flex-wrap">
                  <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                    {product.nameProduct}
                  </h1>
                  <Badge variant={isActive ? "default" : "secondary"} className="mt-1">
                    <span
                      className={`w-1.5 h-1.5 rounded-full mr-1.5 ${isActive ? "bg-green-400" : "bg-gray-400"}`}
                    />
                    {isActive ? t("common.active") : t("common.inactive")}
                  </Badge>
                  {isOutOfStock && (
                    <Badge variant="destructive" className="mt-1">
                      {t("page.product.detail.outOfStock")}
                    </Badge>
                  )}
                  {isLowStock && (
                    <Badge
                      variant="warning"
                      className="mt-1 bg-orange-100 text-orange-700 border-orange-200">
                      {t("page.product.detail.lowStock")}
                    </Badge>
                  )}
                </div>

                <p className="text-sm text-muted-foreground">
                  {product.description || t("page.product.detail.noDescription")}
                </p>

                <div className="flex flex-wrap items-center gap-4 pt-2">
                  {product.sku && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full">
                      <Hash size={12} />
                      <span className="font-mono font-medium">{product.sku}</span>
                    </div>
                  )}
                  {product.barcode && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full">
                      <Barcode size={12} />
                      <span className="font-mono">{product.barcode}</span>
                    </div>
                  )}
                  {product.brand && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full">
                      <Building2 size={12} />
                      <span>{product.brand}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-border">
            <div className="p-5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
                <DollarSign size={20} className="text-green-600" />
              </div>
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  {t("page.product.detail.sellingPrice")}
                </p>
                <p className="text-sm font-bold text-foreground">{formatCurrency(product.price)}</p>
              </div>
            </div>
            <div className="p-5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                <ShoppingCart size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  {t("page.product.detail.costPrice")}
                </p>
                <p className="text-sm font-bold text-foreground">
                  {product.costPrice ? formatCurrency(product.costPrice) : "-"}
                </p>
              </div>
            </div>
            <div className="p-5 flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isOutOfStock ? "bg-red-100" : isLowStock ? "bg-orange-100" : "bg-primary/10"}`}>
                <Package
                  size={20}
                  className={
                    isOutOfStock ? "text-red-600" : isLowStock ? "text-orange-600" : "text-primary"
                  }
                />
              </div>
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  {t("page.product.detail.stock")}
                </p>
                <p
                  className={`text-sm font-bold ${isOutOfStock ? "text-red-600" : isLowStock ? "text-orange-600" : "text-foreground"}`}>
                  {stock} {product.unit || t("page.product.detail.unitPcs")}
                </p>
              </div>
            </div>
            <div className="p-5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center shrink-0">
                <Star size={20} className="text-purple-600" />
              </div>
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  {t("page.product.detail.memberPoints")}
                </p>
                <p className="text-sm font-bold text-foreground">{product.point || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Detail Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left - Detailed Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <div className="p-5 border-b border-border flex items-center gap-2">
                <Tag size={16} className="text-primary" />
                <h3 className="font-semibold text-sm">{t("page.product.detail.productInfo")}</h3>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Tag size={16} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase">
                        {t("page.product.detail.category")}
                      </p>
                      <p className="text-sm font-medium text-foreground">
                        {product.categoryData?.name || "-"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Scale size={16} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase">
                        {t("page.product.detail.unit")}
                      </p>
                      <p className="text-sm font-medium text-foreground">{product.unit || "pcs"}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <AlertTriangle size={16} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase">
                        {t("page.product.detail.minStock")}
                      </p>
                      <p className="text-sm font-medium text-foreground">
                        {minStock} {product.unit || t("page.product.detail.unitPcs")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <div className="p-5 border-b border-border flex items-center gap-2">
                <Layers size={16} className="text-primary" />
                <h3 className="font-semibold text-sm">{t("page.product.detail.variants")}</h3>
              </div>
              <div className="p-5">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {t("page.product.detail.hasVariant")}
                    </span>
                    <Badge variant={product.isOption ? "default" : "secondary"}>
                      {product.isOption ? t("common.yes") : t("common.no")}
                    </Badge>
                  </div>
                  {product.isOption && product.options?.length > 0 && (
                    <div className="space-y-2 pl-4 border-l-2 border-primary/20">
                      {product.options.map((group, gi) => (
                        <div key={gi} className="text-sm">
                          <p className="font-medium text-foreground">
                            {group.name || `${t("page.product.detail.variant")} ${gi + 1}`}
                          </p>
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {group.options?.map((opt, oi) => (
                              <span
                                key={oi}
                                className="inline-block px-2 py-0.5 bg-muted rounded text-xs">
                                {opt}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {t("page.product.detail.hasModifier")}
                    </span>
                    <Badge variant={product.hasModifiers ? "default" : "secondary"}>
                      {product.hasModifiers ? t("common.yes") : t("common.no")}
                    </Badge>
                  </div>
                  {product.hasModifiers && product.modifiers?.length > 0 && (
                    <div className="space-y-1.5 pl-4 border-l-2 border-primary/20">
                      {product.modifiers.map((m, mi) => (
                        <div key={mi} className="flex items-center justify-between text-sm">
                          <span className="text-foreground">{m.name}</span>
                          <span className="text-muted-foreground font-mono">
                            +{formatCurrency(m.price)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Batch & Expiry */}
            <Card>
              <div className="p-5 border-b border-border flex items-center gap-2">
                <CalendarDays size={16} className="text-primary" />
                <h3 className="font-semibold text-sm">{t("page.product.detail.batchExpiry")}</h3>
              </div>
              <div className="p-5">
                {loadingBatches ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-2 pb-2 border-b border-border">
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-3 w-16 ml-auto" />
                    </div>
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="grid grid-cols-3 gap-2 py-1.5">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-12 ml-auto" />
                      </div>
                    ))}
                  </div>
                ) : batches.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    {t("page.product.detail.noBatch")}
                  </p>
                ) : (
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider pb-2 border-b border-border">
                      <span>{t("page.product.detail.batchNumber")}</span>
                      <span>{t("page.product.detail.expiryDate")}</span>
                      <span className="text-right">{t("page.product.detail.stock")}</span>
                    </div>
                    {batches.map((batch, idx) => (
                      <div key={idx} className="grid grid-cols-3 gap-2 text-sm items-center py-1.5">
                        <span className="font-medium text-foreground">{batch.batchNumber}</span>
                        <span className="text-muted-foreground">
                          {batch.expiryDate
                            ? new Date(batch.expiryDate).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "short",
                                year: "numeric"
                              })
                            : "-"}
                        </span>
                        <span className="text-right font-medium">{batch.stock || 0}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>

            <Card>
              <div className="p-5 border-b border-border flex items-center gap-2">
                <Clock size={16} className="text-primary" />
                <h3 className="font-semibold text-sm">{t("page.product.detail.systemInfo")}</h3>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase">
                      {t("page.product.detail.createdAt")}
                    </p>
                    <p className="text-sm font-medium text-foreground">
                      {formatDate(product.createdAt)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {product.createdBy || t("common.system")}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase">
                      {t("page.product.detail.updatedAt")}
                    </p>
                    <p className="text-sm font-medium text-foreground">
                      {formatDate(product.updatedAt)}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Right - Stock Status */}
          <div className="space-y-6">
            <Card
              className={isOutOfStock ? "border-red-200" : isLowStock ? "border-orange-200" : ""}>
              <div
                className={`p-5 border-b border-border ${isOutOfStock ? "bg-red-50" : isLowStock ? "bg-orange-50" : ""}`}>
                <div className="flex items-center gap-2">
                  <Package
                    size={16}
                    className={
                      isOutOfStock
                        ? "text-red-600"
                        : isLowStock
                          ? "text-orange-600"
                          : "text-primary"
                    }
                  />
                  <h3 className="font-semibold text-sm">{t("page.product.detail.stockStatus")}</h3>
                </div>
              </div>
              <div className="p-5 space-y-4">
                <div className="text-center">
                  <p
                    className={`text-4xl font-bold ${isOutOfStock ? "text-red-600" : isLowStock ? "text-orange-600" : "text-foreground"}`}>
                    {stock}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("page.product.detail.currentStock", {
                      unit: product.unit || t("page.product.detail.unitPcs")
                    })}
                  </p>
                </div>
                <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${isOutOfStock ? "bg-red-500" : isLowStock ? "bg-orange-500" : "bg-primary"}`}
                    style={{
                      width: `${minStock > 0 ? Math.min(100, (stock / minStock) * 100) : 100}%`
                    }}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{t("page.product.detail.minStockLabel", { minStock })}</span>
                  <span>
                    {stock > minStock
                      ? t("page.product.detail.safe")
                      : isOutOfStock
                        ? t("page.product.detail.outOfStock")
                        : t("page.product.detail.lowStock")}
                  </span>
                </div>
              </div>
            </Card>

            {product.point > 0 && (
              <Card>
                <div className="p-5 border-b border-border bg-purple-50">
                  <div className="flex items-center gap-2">
                    <Star size={16} className="text-purple-600" />
                    <h3 className="font-semibold text-sm">
                      {t("page.product.detail.memberPointsTitle")}
                    </h3>
                  </div>
                </div>
                <div className="p-5 text-center">
                  <p className="text-3xl font-bold text-purple-600">{product.point}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("page.product.detail.pointsPerPurchase")}
                  </p>
                </div>
              </Card>
            )}
            {product.redeemPoints > 0 && (
              <Card>
                <div className="p-5 border-b border-border bg-amber-50">
                  <div className="flex items-center gap-2">
                    <Star size={16} className="text-amber-600" />
                    <h3 className="font-semibold text-sm">
                      {t("page.product.detail.redeemTitle")}
                    </h3>
                  </div>
                </div>
                <div className="p-5 text-center">
                  <p className="text-3xl font-bold text-amber-600">{product.redeemPoints}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("page.product.detail.redeemInfo")}
                  </p>
                </div>
              </Card>
            )}

            {product.isAvailable !== undefined && (
              <Card>
                <div className="p-5 border-b border-border">
                  <div className="flex items-center gap-2">
                    <ShoppingCart size={16} className="text-primary" />
                    <h3 className="font-semibold text-sm">
                      {t("page.product.detail.availability")}
                    </h3>
                  </div>
                </div>
                <div className="p-5 text-center">
                  <Badge
                    variant={product.isAvailable ? "default" : "secondary"}
                    className="text-sm px-4 py-1">
                    {product.isAvailable
                      ? t("page.product.detail.available")
                      : t("page.product.detail.unavailable")}
                  </Badge>
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center gap-3 pt-2">
          <Button variant="outline" onClick={() => navigate("/product-list")} className="gap-2">
            <ArrowLeft size={16} />
            {t("common.back")}
          </Button>
          <Button
            onClick={() => navigate(`/edit-product?id=${product.id}`)}
            className="gap-2 shadow-md">
            <Edit size={16} />
            {t("page.product.detail.editProduct")}
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default DetailProduct;
