import React from "react";
import { useQuery } from "react-query";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Package, Edit3, Calendar, DollarSign, Tag, Box, Ruler } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { getProductById } from "@/services/product";

const DetailProduct = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();

  const { data, isLoading, isError } = useQuery(["product", id], () => getProductById(id), {
    enabled: !!id
  });

  const product = data?.data || data;

  const formatPrice = (value) => {
    if (value == null || isNaN(value)) return "0";
    return Number(value).toLocaleString("id-ID");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">{t("page.product.notFound")}</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate("/product")}>
            {t("common.back")}
          </Button>
        </div>
      </div>
    );
  }

  const imageUrl = product.image || product.imageProduct || product.photo || null;
  const hasVariants =
    product.variant && Array.isArray(product.variant) && product.variant.length > 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto p-6">
        <div className="flex items-center gap-3 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate("/product")}>
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-xl font-bold">{product.nameProduct || product.name || "-"}</h1>
            <p className="text-sm text-muted-foreground">{t("page.product.detailDesc")}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="ml-auto"
            onClick={() => navigate(`/product/edit/${id}`)}>
            <Edit3 size={14} />
            {t("common.edit")}
          </Button>
        </div>

        <div className="bg-card border border-border/50 rounded-xl overflow-hidden">
          {imageUrl && (
            <div className="w-full h-48 overflow-hidden bg-muted/30">
              <img
                src={imageUrl || "/placeholder.svg"}
                alt={product.nameProduct || product.name || ""}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="p-6 space-y-5">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Package size={16} />
              {t("page.product.info")}
            </div>
            <div className="grid gap-4">
              <div>
                <p className="text-xs text-muted-foreground">{t("page.product.name")}</p>
                <p className="font-medium">{product.nameProduct || product.name || "-"}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Tag size={12} />
                    SKU
                  </p>
                  <p className="font-medium">{product.sku || "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <DollarSign size={12} />
                    {t("page.product.price")}
                  </p>
                  <p className="font-medium">
                    Rp {formatPrice(product.price || product.sellPrice || 0)}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Ruler size={12} />
                    {t("page.product.stock")}
                  </p>
                  <p className="font-medium">{product.stock || product.qty || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Box size={12} />
                    {t("page.product.category")}
                  </p>
                  <p className="font-medium">
                    {product.category?.nameCategory ||
                      product.category?.name ||
                      product.categoryName ||
                      "-"}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t("page.product.description")}</p>
                <p className="font-medium">{product.descProduct || product.description || "-"}</p>
              </div>

              {hasVariants && (
                <div className="border-t border-border/30 pt-4">
                  <p className="text-sm font-medium text-muted-foreground mb-3">
                    {t("page.product.variants")}
                  </p>
                  <div className="space-y-2">
                    {product.variant.map((v, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/40">
                        <div className="flex items-center gap-2">
                          {v.image && (
                            <div className="w-8 h-8 rounded-md overflow-hidden">
                              <img
                                src={v.image || "/placeholder.svg"}
                                alt={v.nameVariant || v.name || ""}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <span className="font-medium text-sm">
                            {v.nameVariant || v.name || "-"}
                          </span>
                        </div>
                        <span className="font-bold text-sm">Rp {formatPrice(v.price || 0)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar size={12} />
                  {t("common.createdAt")}
                </p>
                <p className="font-medium">
                  {product.createdAt
                    ? new Date(product.createdAt).toLocaleDateString("id-ID", {
                        year: "numeric",
                        month: "long",
                        day: "numeric"
                      })
                    : "-"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailProduct;
