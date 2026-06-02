import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useCookies } from "react-cookie";
import { useTranslation } from "react-i18next";
import {
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
  Upload,
  Download,
  Package,
  AlertTriangle
} from "lucide-react";
import { toast } from "sonner";
import { getAllProductTable, deleteProduct } from "@/services/product";
import { getAllCategoryActive } from "@/services/category";
import { getAllLocation } from "@/services/location";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";
import Modal from "@/components/organism/modal";
import { formatCurrencyRupiah } from "@/utils/formatter-currency";

const ProductList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [cookie] = useCookies();
  const [searchParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [sortFilter, setSortFilter] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [noStoreModal, setNoStoreModal] = useState(false);

  const user = cookie?.user;
  const role = user?.role || user?.type || "";
  const locationParam = searchParams.get("location");

  const { data: locationsData, isLoading: isLoadingLocations } = useQuery(
    ["locations-all"],
    getAllLocation,
    { enabled: role === "super_admin" }
  );

  const locations = locationsData?.data || [];

  useEffect(() => {
    if (role !== "super_admin" || isLoadingLocations) return;
    if (locations.length === 0) {
      setNoStoreModal(true);
    } else if (!locationParam) {
      navigate("/location-list", { replace: true });
    }
  }, [role, locations, locationParam, isLoadingLocations, navigate]);

  if (role === "super_admin" && !isLoadingLocations && !locationParam && locations.length > 0) {
    return null;
  }

  const { data, isLoading } = useQuery(
    ["products", page, limit, locationParam],
    () => getAllProductTable({ location: locationParam || "", page, limit, statusProduct: "all" }),
    { keepPreviousData: true }
  );

  const { data: categoriesData } = useQuery(
    ["categories-active", locationParam],
    () => getAllCategoryActive({ location: locationParam || "" }),
    { enabled: !!locationParam || role !== "super_admin" }
  );

  const categories = categoriesData?.data || [];

  const deleteMutation = useMutation(deleteProduct, {
    onSuccess: () => {
      toast.success(t("common.success"), { description: t("page.product.toast.deleteSuccess") });
      queryClient.invalidateQueries(["products"]);
    },
    onError: (err) => {
      toast.error(t("common.error"), { description: err?.response?.data?.message || err.message });
    }
  });

  const products = data?.data || data?.products || [];
  const total = data?.total || data?.pagination?.total || 0;
  const totalPages = data?.pagination?.totalPages || Math.ceil(total / limit) || 1;

  const handleDelete = (id) => {
    setDeleteTarget(id);
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      deleteMutation.mutate({ id: deleteTarget });
      setDeleteTarget(null);
    }
  };

  const filteredProducts = products
    .filter((product) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return product.name?.toLowerCase().includes(q) || product.sku?.toLowerCase().includes(q);
    })
    .filter((product) => {
      if (!categoryFilter) return true;
      const cat = product.category || product.categoryId?.name || "";
      return cat === categoryFilter;
    })
    .sort((a, b) => {
      if (sortFilter === "price-asc") return (a.price || 0) - (b.price || 0);
      if (sortFilter === "price-desc") return (b.price || 0) - (a.price || 0);
      if (sortFilter === "stock-asc") return (a.stock || 0) - (b.stock || 0);
      return 0;
    });

  const getStatusBadge = (product) => {
    const stock = product.stock || product.quantity || 0;
    if (stock <= 0) {
      return {
        label: t("page.product.status.outOfStock"),
        className: "bg-destructive/10 text-destructive border border-destructive/20"
      };
    }
    if (stock <= 10) {
      return {
        label: t("page.product.status.lowStock"),
        className:
          "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border border-orange-200 dark:border-orange-800"
      };
    }
    if (product.isActive || product.status === "active") {
      return {
        label: t("common.active"),
        className:
          "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800"
      };
    }
    return {
      label: t("common.inactive"),
      className: "bg-muted text-muted-foreground border border-border"
    };
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <button
          onClick={() =>
            navigate(
              role === "super_admin"
                ? "/dashboard-super-admin"
                : role === "admin"
                  ? "/dashboard-admin"
                  : "/home"
            )
          }
          className="hover:text-foreground transition-colors">
          {t("breadcrumb.home")}
        </button>
        <span className="text-xs">/</span>
        {role === "super_admin" && locationParam && (
          <>
            <button
              onClick={() => navigate("/location-list")}
              className="hover:text-foreground transition-colors">
              {t("sidebar.kelolaToko")}
            </button>
            <span className="text-xs">/</span>
          </>
        )}
        <span className="text-primary font-semibold">{t("breadcrumb.product")}</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("page.product.list.title")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t("page.product.list.description")}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" className="gap-2">
            <Upload size={16} />
            {t("page.product.button.import")}
          </Button>
          <Button variant="outline" className="gap-2">
            <Download size={16} />
            {t("page.product.button.export")}
          </Button>
          <Button onClick={() => navigate("/add-product")} className="gap-2">
            <Plus size={18} />
            {t("page.product.button.add")}
          </Button>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="bg-card rounded-xl border border-border p-4 flex flex-col md:flex-row gap-3 items-center">
        <div className="flex-1 w-full relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            placeholder={t("page.product.list.searchSku")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="flex-1 md:w-44 h-10 px-3 bg-background border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none">
            <option value="">{t("common.all")} Kategori</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>
          <select
            value={sortFilter}
            onChange={(e) => setSortFilter(e.target.value)}
            className="flex-1 md:w-44 h-10 px-3 bg-background border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none">
            <option value="">{t("page.product.list.filter.newest")}</option>
            <option value="price-asc">{t("page.product.list.filter.priceLowHigh")}</option>
            <option value="price-desc">{t("page.product.list.filter.priceHighLow")}</option>
            <option value="stock-asc">{t("page.product.list.filter.stockLow")}</option>
          </select>
        </div>
      </div>

      {/* Product Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loading />
        </div>
      ) : filteredProducts.length === 0 ? (
        <Card className="p-12 text-center text-muted-foreground">
          <Package size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">{t("page.product.list.empty")}</p>
          <p className="text-sm mt-1">{t("page.product.list.emptyHint")}</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredProducts.map((product) => {
            const badge = getStatusBadge(product);
            const stock = product.stock || product.quantity || 0;
            const imageUrl = product.image || product.images?.[0];

            return (
              <Card
                key={product.id || product._id}
                className="overflow-hidden group hover:shadow-md transition-shadow">
                {/* Image */}
                <div className="aspect-[4/3] relative overflow-hidden bg-muted">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <Package size={48} className="opacity-30" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tight ${badge.className}`}>
                      {badge.label}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2 gap-2">
                    <h3 className="font-semibold text-foreground text-sm leading-tight line-clamp-2">
                      {product.name}
                    </h3>
                    <span className="font-semibold text-primary text-sm whitespace-nowrap">
                      {formatCurrencyRupiah(product.price || product.harga || 0)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
                    <Package size={14} />
                    <span>
                      {t("page.product.stockLabel")} {stock} {product.unit || ""}
                    </span>
                    {stock > 0 && stock <= 10 && (
                      <span className="flex items-center gap-1 text-destructive font-medium ml-1">
                        <AlertTriangle size={14} />
                        {t("page.product.stockLow")}
                      </span>
                    )}
                    {stock <= 0 && (
                      <span className="text-destructive font-medium ml-1">
                        {t("page.product.status.outOfStock")}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-3 border-t border-border">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-1.5 h-8 text-xs"
                      onClick={() => navigate(`/edit-product?id=${product.id || product._id}`)}>
                      <Edit size={14} />
                      {t("common.edit")}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-1.5 h-8 text-xs text-destructive border-destructive/30 hover:bg-destructive/10"
                      onClick={() => handleDelete(product.id || product._id)}>
                      <Trash2 size={14} />
                      {t("common.delete")}
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-3 pt-2">
        <p className="text-xs text-muted-foreground">
          {t("page.product.list.pagination", {
            count: Math.min(limit, filteredProducts.length),
            total
          })}
        </p>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page <= 1}
            className="w-9 h-9 flex items-center justify-center border border-border rounded-lg text-muted-foreground hover:bg-accent transition-colors disabled:opacity-30">
            <ChevronLeft size={16} />
          </button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const pageNum = i + 1;
            return (
              <button
                key={pageNum}
                onClick={() => setPage(pageNum)}
                className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium border transition-colors ${
                  page === pageNum
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border text-muted-foreground hover:bg-accent"
                }`}>
                {pageNum}
              </button>
            );
          })}
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages}
            className="w-9 h-9 flex items-center justify-center border border-border rounded-lg text-muted-foreground hover:bg-accent transition-colors disabled:opacity-30">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <Modal
        type="confirm"
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={t("modal.deleteTitle")}
        confirmText={t("modal.deleteConfirm")}
        onConfirm={confirmDelete}
      />
      <Modal
        type="confirm"
        open={noStoreModal}
        onOpenChange={setNoStoreModal}
        title={t("page.product.noStore.title")}
        description={t("page.product.noStore.description")}
        confirmText={t("page.product.noStore.button")}
        onConfirm={() => navigate("/add-location")}
      />
    </div>
  );
};

export default ProductList;
