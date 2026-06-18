import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { useCookies } from "react-cookie";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Search, Save, Pencil, Store } from "lucide-react";
import { canAccess } from "@/utils/permission";
import { getProductPriceByStore, updateProductPriceByStore } from "@/services/price-store";
import { getAllLocation } from "@/services/location";
import { getAllProduct } from "@/services/product";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DataTable from "@/components/ui/DataTable";
import AbortController from "@/components/organism/abort-controller";

const PriceStoreList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [cookie] = useCookies();
  const user = cookie?.user;
  const MENU_KEY = "/price-list-template";

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
  };

  const [selectedStore, setSelectedStore] = useState("");
  const [search, setSearch] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [prices, setPrices] = useState({});

  const { data: locData } = useQuery(["locations-for-price"], getAllLocation, { staleTime: 60000 });
  const locations = locData?.data || locData?.locations || locData || [];

  const { data: prodData } = useQuery(["products-for-price"], () => getAllProduct({}), {
    staleTime: 60000
  });
  const products = prodData?.data || [];

  const {
    isLoading: priceLoading,
    isError,
    refetch
  } = useQuery(
    ["prices-by-store", selectedStore],
    () => getProductPriceByStore({ productId: "", storeIds: [selectedStore] }),
    {
      enabled: !!selectedStore,
      onSuccess: (res) => {
        if (res?.data) {
          const map = {};
          res.data.forEach((p) => {
            map[p.productId] = p.price;
          });
          setPrices(map);
        }
      }
    }
  );

  const updateMut = useMutation((payload) => updateProductPriceByStore(payload), {
    onSuccess: () => {
      toast.success(t("page.priceStore.list.success"), {
        description: t("page.priceStore.list.updatedDesc")
      });
      queryClient.invalidateQueries(["prices-by-store"]);
      setEditMode(false);
    },
    onError: (err) =>
      toast.error(t("page.priceStore.list.fail"), {
        description: err?.response?.data?.message || err.message
      })
  });

  const filteredProducts = products.filter((p) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return p.nameProduct?.toLowerCase().includes(q) || p.sku?.toLowerCase().includes(q);
  });

  const handleSave = () => {
    const entries = Object.entries(prices).filter(
      ([, v]) => v !== undefined && v !== "" && v !== null
    );
    if (entries.length === 0) {
      toast.error(t("page.priceStore.list.validation"), {
        description: t("page.priceStore.list.noChanges")
      });
      return;
    }
    const payload = {
      storeId: parseInt(selectedStore),
      prices: entries.map(([productId, price]) => ({
        productId: parseInt(productId),
        price: parseFloat(price)
      }))
    };
    updateMut.mutate(payload);
  };

  const columns = [
    {
      header: t("page.priceStore.list.image"),
      render: (item) =>
        item.image ? (
          <img src={item.image} alt={item.nameProduct} className="w-10 h-10 object-cover rounded" />
        ) : (
          <div className="w-10 h-10 rounded bg-muted flex items-center justify-center text-xs text-muted-foreground">
            -
          </div>
        )
    },
    {
      header: t("page.priceStore.list.barcode"),
      render: (item) => <span className="text-xs font-mono">{item.barcode || "-"}</span>
    },
    {
      header: t("page.priceStore.list.product"),
      render: (item) => (
        <div>
          <p className="font-medium text-sm">{item.nameProduct}</p>
          <p className="text-xs text-muted-foreground">{item.sku || "-"}</p>
        </div>
      )
    },
    {
      header: t("page.priceStore.list.category"),
      render: (item) => (
        <span className="text-xs">{item.nameCategory || item.categoryData?.name || "-"}</span>
      )
    },
    {
      header: t("page.priceStore.list.brand"),
      render: (item) => <span className="text-xs">{item.brand || "-"}</span>
    },
    {
      header: t("page.priceStore.list.stock"),
      align: "right",
      render: (item) => <span className="text-xs font-mono">{item.stock ?? 0}</span>
    },
    {
      header: t("page.priceStore.list.unit"),
      render: (item) => <span className="text-xs">{item.unit || "-"}</span>
    },
    {
      header: t("page.priceStore.list.costPrice"),
      align: "right",
      render: (item) => (
        <span className="font-mono text-xs">
          Rp {parseInt(item.costPrice || 0).toLocaleString("id")}
        </span>
      )
    },
    {
      header: t("page.priceStore.list.defaultPrice"),
      align: "right",
      render: (item) => (
        <span className="font-mono text-xs">
          Rp {parseInt(item.sellingPrice || 0).toLocaleString("id")}
        </span>
      )
    },
    {
      header: t("page.priceStore.list.storePrice"),
      align: "right",
      render: (item) =>
        editMode ? (
          <div className="relative inline-block">
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">
              Rp
            </span>
            <input
              type="number"
              value={prices[item.id] ?? ""}
              onChange={(e) => setPrices((prev) => ({ ...prev, [item.id]: e.target.value }))}
              className="w-28 h-8 pl-7 pr-2 text-xs text-right rounded border border-input bg-background font-mono"
              placeholder={t("page.priceStore.list.pricePlaceholder")}
            />
          </div>
        ) : (
          <span className="font-mono text-xs">
            {prices[item.id] !== undefined
              ? `Rp ${parseInt(prices[item.id]).toLocaleString("id")}`
              : "-"}
          </span>
        )
    }
  ];

  return (
    <motion.div variants={item} initial="hidden" animate="show" className="space-y-6">
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <button
          onClick={() => navigate("/dashboard-super-admin")}
          className="hover:text-foreground">
          {t("page.priceStore.list.breadcrumbDashboard")}
        </button>
        <span className="text-xs">/</span>
        <span className="text-primary font-semibold">{t("page.priceStore.list.breadcrumb")}</span>
      </nav>

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t("page.priceStore.list.title")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t("page.priceStore.list.desc")}</p>
        </div>
        <div className="flex items-center gap-2">
          {editMode ? (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  setEditMode(false);
                  setPrices({});
                }}
                size="sm">
                {t("page.priceStore.list.cancel")}
              </Button>
              <Button onClick={handleSave} disabled={updateMut.isLoading} size="sm">
                <Save size={15} className="mr-1" /> {t("page.priceStore.list.save")}
              </Button>
            </>
          ) : (
            canAccess(user, MENU_KEY, "edit") && (
              <Button variant="outline" onClick={() => setEditMode(true)} size="sm">
                <Pencil size={15} className="mr-1" /> {t("page.priceStore.list.edit")}
              </Button>
            )
          )}
        </div>
      </div>

      {isError ? (
        <AbortController refetch={refetch} />
      ) : (
        <>
          <motion.div
            variants={item}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="flex items-center gap-3">
            <div className="relative w-full sm:w-64">
              <Store
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <select
                value={selectedStore}
                onChange={(e) => {
                  setSelectedStore(e.target.value);
                  setEditMode(false);
                }}
                className="w-full h-9 pl-9 pr-3 rounded-md border border-input bg-background text-sm appearance-none cursor-pointer">
                <option value="">{t("page.priceStore.list.selectStore")}</option>
                {locations.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="relative w-full sm:w-64">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                placeholder={t("page.priceStore.list.searchPlaceholder")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 text-sm"
              />
            </div>
          </motion.div>

          <motion.div variants={item} initial="hidden" whileInView="show" viewport={{ once: true }}>
            <DataTable
              columns={columns}
              data={filteredProducts}
              isLoading={priceLoading}
              emptyMessage={
                !selectedStore
                  ? t("page.priceStore.list.emptySelectStore")
                  : t("page.priceStore.list.emptyProducts")
              }
              pagination={false}
            />
          </motion.div>
        </>
      )}
    </motion.div>
  );
};

export default PriceStoreList;
