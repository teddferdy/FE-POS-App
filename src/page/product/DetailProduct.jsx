import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "react-query";
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
  Hash
} from "lucide-react";
import { getProductById } from "@/services/product";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

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
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const productId = searchParams.get("id");

  const { data, isLoading } = useQuery(
    ["product-detail", productId],
    () => getProductById(productId),
    { enabled: !!productId }
  );

  const product = data?.data || {};

  if (!productId) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground gap-3">
        <Package size={48} className="opacity-30" />
        <p>ID produk tidak ditemukan</p>
        <Button variant="outline" onClick={() => navigate("/product-list")}>
          Kembali
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loading />
      </div>
    );
  }

  if (!product || !product.id) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground gap-3">
        <Package size={48} className="opacity-30" />
        <p>Produk tidak ditemukan</p>
        <Button variant="outline" onClick={() => navigate("/product-list")}>
          Kembali
        </Button>
      </div>
    );
  }

  const isActive = product.status ?? true;
  const stock = product.stock || 0;
  const minStock = product.minStock || 0;
  const isLowStock = stock > 0 && stock <= minStock;
  const isOutOfStock = stock <= 0;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <button
          onClick={() => navigate("/dashboard-super-admin")}
          className="hover:text-foreground transition-colors">
          Dashboard
        </button>
        <span className="text-xs">/</span>
        <button
          onClick={() => navigate("/product-list")}
          className="hover:text-foreground transition-colors">
          Produk
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
                  {isActive ? "Aktif" : "Nonaktif"}
                </Badge>
                {isOutOfStock && (
                  <Badge variant="destructive" className="mt-1">
                    Stok Habis
                  </Badge>
                )}
                {isLowStock && (
                  <Badge
                    variant="warning"
                    className="mt-1 bg-orange-100 text-orange-700 border-orange-200">
                    Stok Menipis
                  </Badge>
                )}
              </div>

              <p className="text-sm text-muted-foreground">
                {product.description || "Tidak ada deskripsi"}
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
                Harga Jual
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
                Harga Modal
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
                Stok
              </p>
              <p
                className={`text-sm font-bold ${isOutOfStock ? "text-red-600" : isLowStock ? "text-orange-600" : "text-foreground"}`}>
                {stock} {product.unit || "pcs"}
              </p>
            </div>
          </div>
          <div className="p-5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center shrink-0">
              <Star size={20} className="text-purple-600" />
            </div>
            <div>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Poin Member
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
              <h3 className="font-semibold text-sm">Informasi Produk</h3>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Tag size={16} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase">
                      Kategori
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
                      Satuan
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
                      Min. Stok
                    </p>
                    <p className="text-sm font-medium text-foreground">
                      {minStock} {product.unit || "pcs"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Clock size={16} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase">
                      Waktu Persiapan
                    </p>
                    <p className="text-sm font-medium text-foreground">
                      {product.preparationTime || 0} menit
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-5 border-b border-border flex items-center gap-2">
              <Layers size={16} className="text-primary" />
              <h3 className="font-semibold text-sm">Varian & Opsi</h3>
            </div>
            <div className="p-5">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Punya varian</span>
                  <Badge variant={product.isOption ? "default" : "secondary"}>
                    {product.isOption ? "Ya" : "Tidak"}
                  </Badge>
                </div>
                {product.isOption && product.options?.length > 0 && (
                  <div className="space-y-2 pl-4 border-l-2 border-primary/20">
                    {product.options.map((group, gi) => (
                      <div key={gi} className="text-sm">
                        <p className="font-medium text-foreground">
                          {group.name || `Varian ${gi + 1}`}
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
                  <span className="text-sm text-muted-foreground">Punya modifier</span>
                  <Badge variant={product.hasModifiers ? "default" : "secondary"}>
                    {product.hasModifiers ? "Ya" : "Tidak"}
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

          <Card>
            <div className="p-5 border-b border-border flex items-center gap-2">
              <Clock size={16} className="text-primary" />
              <h3 className="font-semibold text-sm">Informasi Sistem</h3>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase">
                    Dibuat Pada
                  </p>
                  <p className="text-sm font-medium text-foreground">
                    {formatDate(product.createdAt)}
                  </p>
                  <p className="text-xs text-muted-foreground">{product.createdBy || "System"}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase">
                    Diperbarui Pada
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
          <Card className={isOutOfStock ? "border-red-200" : isLowStock ? "border-orange-200" : ""}>
            <div
              className={`p-5 border-b border-border ${isOutOfStock ? "bg-red-50" : isLowStock ? "bg-orange-50" : ""}`}>
              <div className="flex items-center gap-2">
                <Package
                  size={16}
                  className={
                    isOutOfStock ? "text-red-600" : isLowStock ? "text-orange-600" : "text-primary"
                  }
                />
                <h3 className="font-semibold text-sm">Status Stok</h3>
              </div>
            </div>
            <div className="p-5 space-y-4">
              <div className="text-center">
                <p
                  className={`text-4xl font-bold ${isOutOfStock ? "text-red-600" : isLowStock ? "text-orange-600" : "text-foreground"}`}>
                  {stock}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Stok saat ini ({product.unit || "pcs"})
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
                <span>Min. stok: {minStock}</span>
                <span>{stock > minStock ? "Aman" : isOutOfStock ? "Habis" : "Menipis"}</span>
              </div>
            </div>
          </Card>

          {product.point > 0 && (
            <Card>
              <div className="p-5 border-b border-border bg-purple-50">
                <div className="flex items-center gap-2">
                  <Star size={16} className="text-purple-600" />
                  <h3 className="font-semibold text-sm">Poin Member</h3>
                </div>
              </div>
              <div className="p-5 text-center">
                <p className="text-3xl font-bold text-purple-600">{product.point}</p>
                <p className="text-xs text-muted-foreground mt-1">Poin per pembelian</p>
              </div>
            </Card>
          )}

          {product.isAvailable !== undefined && (
            <Card>
              <div className="p-5 border-b border-border">
                <div className="flex items-center gap-2">
                  <ShoppingCart size={16} className="text-primary" />
                  <h3 className="font-semibold text-sm">Ketersediaan</h3>
                </div>
              </div>
              <div className="p-5 text-center">
                <Badge
                  variant={product.isAvailable ? "default" : "secondary"}
                  className="text-sm px-4 py-1">
                  {product.isAvailable ? "Tersedia" : "Tidak Tersedia"}
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
          Kembali
        </Button>
        <Button
          onClick={() => navigate(`/edit-product?id=${product.id}`)}
          className="gap-2 shadow-md">
          <Edit size={16} />
          Edit Produk
        </Button>
      </div>
    </div>
  );
};

export default DetailProduct;
