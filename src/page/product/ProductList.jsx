import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useCookies } from "react-cookie";
import { useTranslation } from "react-i18next";
import { Plus, Search, Edit, Trash2, Upload, Download, Package, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  getAllProductTable,
  deleteProduct,
  downloadProductTemplate,
  downloadProductExcel
} from "@/services/product";
import { getAllCategoryActive } from "@/services/category";
import { getAllLocation } from "@/services/location";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Modal from "@/components/organism/modal";
import PageHeader from "@/components/ui/PageHeader";
import UploadProductModal from "./components/UploadProductModal";
import DataTable from "@/components/ui/DataTable";
import { formatCurrencyRupiah } from "@/utils/formatter-currency";
import { canAccess } from "@/utils/permission";

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
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [isDownloadingTemplate, setIsDownloadingTemplate] = useState(false);
  const [isDownloadingData, setIsDownloadingData] = useState(false);

  const user = cookie?.user;
  const MENU_KEY = "/product-list";
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

  const columns = [
    {
      header: t("page.product.table.image"),
      render: (product) => {
        const imageUrl = product.image || product.images?.[0];
        return (
          <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted border border-border flex items-center justify-center">
            {imageUrl ? (
              <img src={imageUrl} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <Package size={16} className="text-muted-foreground" />
            )}
          </div>
        );
      }
    },
    {
      header: t("page.product.table.name"),
      render: (product) => (
        <div>
          <p className="font-medium text-foreground text-sm">{product.name}</p>
          <p className="text-xs text-muted-foreground font-mono">{product.sku || "-"}</p>
        </div>
      )
    },
    {
      header: t("page.product.table.category"),
      render: (product) => (
        <span className="text-sm text-foreground">
          {product.category || product.categoryId?.name || "-"}
        </span>
      )
    },
    {
      header: t("page.product.table.price"),
      align: "right",
      render: (product) => (
        <span className="font-semibold text-foreground text-sm">
          {formatCurrencyRupiah(product.price || product.harga || 0)}
        </span>
      )
    },
    {
      header: t("page.product.table.stock"),
      render: (product) => {
        const stock = product.stock || product.quantity || 0;
        return (
          <span
            className={`text-sm font-mono ${stock <= 0 ? "text-destructive font-semibold" : stock <= 10 ? "text-orange-600 font-semibold" : "text-foreground"}`}>
            {stock} {product.unit || ""}
          </span>
        );
      }
    },
    {
      header: t("page.product.table.status"),
      render: (product) => {
        const badge = getStatusBadge(product);
        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tight ${badge.className}`}>
            {badge.label}
          </span>
        );
      }
    },
    {
      header: t("common.createdBy"),
      render: (item) => (
        <span className="text-sm text-muted-foreground">
          {item.createdByUser?.fullName || item.createdByUser?.userName || item.createdBy || "-"}
        </span>
      )
    },
    {
      header: t("common.modifiedBy"),
      render: (item) => (
        <span className="text-sm text-muted-foreground">
          {item.modifiedByUser?.fullName || item.modifiedByUser?.userName || item.modifiedBy || "-"}
        </span>
      )
    },
    {
      header: t("common.actions"),
      align: "right",
      render: (product) => (
        <div className="flex items-center justify-end gap-1">
          {canAccess(user, MENU_KEY, "edit") && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-primary"
              onClick={() => navigate(`/edit-product?id=${product.id || product._id}`)}>
              <Edit size={15} />
            </Button>
          )}
          {canAccess(user, MENU_KEY, "delete") && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive"
              onClick={() => handleDelete(product.id || product._id)}>
              <Trash2 size={15} />
            </Button>
          )}
        </div>
      )
    }
  ];

  return (
    <div data-tour="page-products" className="space-y-6">
      <div>
        <div>
          <PageHeader
            breadcrumbs={[
              {
                href:
                  role === "super_admin"
                    ? "/dashboard-super-admin"
                    : role === "admin"
                      ? "/dashboard-admin"
                      : "/home",
                i18nKey: "breadcrumb.home"
              },
              ...(role === "super_admin" && locationParam
                ? [{ href: "/location-list", i18nKey: "sidebar.kelolaToko" }]
                : []),
              { i18nKey: "breadcrumb.product" }
            ]}
            title={t("page.product.list.title")}
            description={t("page.product.list.description")}>
            {canAccess(user, MENU_KEY, "export") && (
              <Button
                variant="outline"
                disabled={isDownloadingTemplate}
                onClick={async () => {
                  setIsDownloadingTemplate(true);
                  try {
                    await downloadProductTemplate();
                    toast.success(t("common.success"), {
                      description: t("page.product.toast.templateSuccess")
                    });
                  } catch (err) {
                    toast.error(t("common.error"), {
                      description:
                        err?.response?.data?.message ||
                        err.message ||
                        t("page.product.toast.templateError")
                    });
                  } finally {
                    setIsDownloadingTemplate(false);
                  }
                }}>
                {isDownloadingTemplate ? (
                  <Loader2 size={16} className="mr-1 animate-spin" />
                ) : (
                  <Download size={16} className="mr-1" />
                )}
                {t("page.product.button.downloadTemplate")}
              </Button>
            )}
            {canAccess(user, MENU_KEY, "export") && (
              <Button
                variant="outline"
                disabled={isDownloadingData}
                onClick={async () => {
                  setIsDownloadingData(true);
                  try {
                    await downloadProductExcel();
                    toast.success(t("common.success"), {
                      description: t("page.product.toast.dataSuccess")
                    });
                  } catch (err) {
                    toast.error(t("common.error"), {
                      description:
                        err?.response?.data?.message ||
                        err.message ||
                        t("page.product.toast.dataError")
                    });
                  } finally {
                    setIsDownloadingData(false);
                  }
                }}>
                {isDownloadingData ? (
                  <Loader2 size={16} className="mr-1 animate-spin" />
                ) : (
                  <Download size={16} className="mr-1" />
                )}
                {t("page.product.button.export")}
              </Button>
            )}
            {canAccess(user, MENU_KEY, "import") && <span className="w-px h-7 bg-border mx-1" />}
            {canAccess(user, MENU_KEY, "import") && (
              <Button
                data-tour="product-import"
                variant="default"
                onClick={() => setUploadModalOpen(true)}>
                <Upload size={16} className="mr-1" />
                {t("page.product.button.import")}
              </Button>
            )}
            {canAccess(user, MENU_KEY, "add") && (
              <Button
                data-tour="product-add"
                onClick={() => navigate("/add-product")}
                className="shadow-md">
                <Plus size={16} className="mr-1" />
                {t("page.product.button.add")}
              </Button>
            )}
          </PageHeader>
        </div>
      </div>

      <div>
        <div>
          <div
            data-tour="product-search"
            className="bg-card rounded-xl border border-border p-4 flex flex-col md:flex-row gap-3 items-center">
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

          <div data-tour="product-table" className="mt-6">
            <DataTable
              columns={columns}
              data={filteredProducts}
              isLoading={isLoading}
              emptyMessage={t("page.product.list.empty")}
              emptyIcon={Package}
              pagination={{
                page,
                totalPages,
                total,
                onPageChange: setPage
              }}
            />
          </div>
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

      {uploadModalOpen && (
        <UploadProductModal
          onClose={() => setUploadModalOpen(false)}
          onUploadSuccess={() => queryClient.invalidateQueries(["products"])}
        />
      )}
    </div>
  );
};

export default ProductList;
