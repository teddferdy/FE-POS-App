import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Edit3,
  Trash2,
  Search,
  Package,
  ChevronRight,
  Tag,
  DollarSign,
  Box
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DeleteAlert } from "@/components/organism/alert";
import { Toast } from "@/components/organism/toast";
import { getAllProduct, deleteProduct } from "@/services/product";
import UploadProductModal from "./components/UploadProductModal";

const ProductList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [showUpload, setShowUpload] = useState(false);

  const { data, isLoading } = useQuery(["products"], () => getAllProduct());

  const products = data?.data || data || [];

  const deleteMutation = useMutation(deleteProduct, {
    onSuccess: () => {
      queryClient.invalidateQueries("products");
      Toast.fire({ icon: "success", title: t("page.product.deleted") });
    },
    onError: () => {
      Toast.fire({ icon: "error", title: t("page.product.deleteError") });
    }
  });

  const handleDelete = (id) => {
    DeleteAlert.fire({
      title: t("page.product.deleteConfirm"),
      showCancelButton: true,
      confirmButtonText: t("common.delete"),
      cancelButtonText: t("common.cancel")
    }).then((result) => {
      if (result.isConfirmed) {
        deleteMutation.mutate(id);
      }
    });
  };

  const formatPrice = (value) => {
    if (value == null || isNaN(value)) return "0";
    return Number(value).toLocaleString("id-ID");
  };

  const filteredProducts = products.filter((p) => {
    if (!search) return true;
    const name = (p.nameProduct || p.name || "").toLowerCase();
    const sku = (p.sku || "").toLowerCase();
    const q = search.toLowerCase();
    return name.includes(q) || sku.includes(q);
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package size={20} className="text-primary" />
          <h1 className="text-xl font-bold">{t("page.product.title")}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowUpload(true)}>
            <Box size={14} />
            {t("page.product.import")}
          </Button>
          <Button size="sm" onClick={() => navigate("/product/add")}>
            <Plus size={14} />
            {t("page.product.add")}
          </Button>
        </div>
      </div>

      <div className="relative">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("page.product.search")}
          className="pl-9 h-10"
        />
      </div>

      <div className="grid gap-3">
        {filteredProducts.map((product, idx) => {
          const id = product?.id || product?._id || product?.ID || product?.idProduct || "";
          const img = product.image || product.imageProduct || product.photo || null;
          const hasVariants =
            product.variant && Array.isArray(product.variant) && product.variant.length > 0;
          return (
            <div
              key={id || idx}
              className="group bg-card border border-border/50 rounded-xl p-4 hover:border-border hover:shadow-sm transition-all cursor-pointer"
              onClick={() => navigate(`/product/${id}`)}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {img ? (
                    <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-muted/50">
                      <img
                        src={img || "/placeholder.svg"}
                        alt={product.nameProduct || product.name || ""}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/10 flex items-center justify-center">
                      <Package size={18} className="text-primary/60" />
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{product.nameProduct || product.name || "-"}</p>
                      {hasVariants && (
                        <span className="px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-500 text-[9px] font-bold uppercase tracking-wider">
                          <Tag size={8} className="inline mr-0.5" />
                          {t("page.product.variant")}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      {product.sku && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Tag size={10} />
                          {product.sku}
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <DollarSign size={10} />
                        Rp {formatPrice(product.price || product.sellPrice || 0)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/product/edit/${id}`);
                    }}>
                    <Edit3 size={14} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(id);
                    }}>
                    <Trash2 size={14} />
                  </Button>
                  <ChevronRight size={14} className="text-muted-foreground/40" />
                </div>
              </div>
            </div>
          );
        })}
        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-3">
              <Package size={20} className="text-muted-foreground/40" />
            </div>
            <p className="font-medium text-muted-foreground">{t("page.product.noProducts")}</p>
          </div>
        )}
      </div>

      {showUpload && <UploadProductModal onClose={() => setShowUpload(false)} />}
    </div>
  );
};

export default ProductList;
