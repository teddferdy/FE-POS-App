import React, { useState, useMemo } from "react";
import { useQuery } from "react-query";
import { useTranslation } from "react-i18next";
import { Store, ArrowLeft } from "lucide-react";
import { getAllLocation } from "@/services/location";
import { getProductByOutlet } from "@/services/product";
import { Card } from "@/components/ui/card";

const PriceStoreList = () => {
  const { t } = useTranslation();

  const [selectedStore, setSelectedStore] = useState("");
  console.log("selectedStore", selectedStore);

  const { data: locData } = useQuery(["locations-for-price"], getAllLocation, { staleTime: 60000 });
  const stores = useMemo(() => locData?.data || locData || [], [locData]);

  const { data: prodData } = useQuery(
    ["products-for-price", selectedStore],
    () => getProductByOutlet({ location: selectedStore }),
    {
      enabled: !!selectedStore,
      staleTime: 60000
    }
  );
  const allProducts = useMemo(() => prodData?.data || prodData || [], [prodData]);

  // ponytail: FE-side store filter — BE doesn't filter by store for super_admin
  const products = useMemo(() => {
    if (!selectedStore) return allProducts;
    return allProducts.filter((p) => {
      if (!p.store || p.store?.length === 0) return true;
      return p.store.map(Number).includes(Number(selectedStore));
    });
  }, [allProducts, selectedStore]);

  return (
    <div className="space-y-6">
      {!selectedStore ? (
        <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
          <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
            <Store size={40} className="text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {t("page.priceStore.list.title")}
          </h1>
          <p className="text-muted-foreground text-lg mb-10 max-w-md">
            {t("page.priceStore.list.desc")}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-3xl">
            {stores.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedStore(String(s.id))}
                className="group relative flex flex-col items-center gap-3 p-8 rounded-xl border-2 border-border bg-card hover:border-primary hover:shadow-lg hover:shadow-primary/5 transition-all duration-200">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                  <Store size={28} className="text-primary" />
                </div>
                <span className="text-lg font-semibold text-foreground">{s.name}</span>
                <span className="text-sm text-muted-foreground">
                  {t("page.priceStore.list.selectStore")}
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSelectedStore("")}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft size={18} />
              {t("common.back")}
            </button>
            <div className="h-5 w-px bg-border" />
            <div className="flex items-center gap-2">
              <Store size={18} className="text-primary" />
              <span className="font-semibold text-lg">
                {stores.find((s) => String(s.id) === selectedStore)?.name}
              </span>
            </div>
          </div>
          <Card className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-3 font-medium">{t("page.priceStore.list.product")}</th>
                    <th className="pb-3 font-medium">{t("page.priceStore.list.category")}</th>
                    <th className="pb-3 font-medium text-right">
                      {t("page.priceStore.list.defaultPrice")}
                    </th>
                    <th className="pb-3 font-medium text-right">
                      {t("page.priceStore.list.costPrice")}
                    </th>
                    <th className="pb-3 font-medium text-right">
                      {t("page.priceStore.list.stock")}
                    </th>
                    <th className="pb-3 font-medium">{t("page.priceStore.list.unit")}</th>
                  </tr>
                </thead>
                <tbody>
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-muted-foreground">
                        {t("common.loading")}
                      </td>
                    </tr>
                  ) : (
                    products.map((p) => (
                      <tr key={p.id} className="border-b last:border-0">
                        <td className="py-3">{p.nameProduct || p.name}</td>
                        <td className="py-3 text-muted-foreground">{p.nameCategory || "-"}</td>
                        <td className="py-3 text-right font-medium">
                          {Number(p.price).toLocaleString("id-ID")}
                        </td>
                        <td className="py-3 text-right text-muted-foreground">
                          {Number(p.costPrice).toLocaleString("id-ID")}
                        </td>
                        <td className="py-3 text-right">{p.stock}</td>
                        <td className="py-3 text-muted-foreground">{p.unit || "-"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default PriceStoreList;
