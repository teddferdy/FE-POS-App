import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { getProductPriceByStore, updateProductPriceByStore } from "@/services/price-store";
import { getAllLocation } from "@/services/location";
import { getAllProduct } from "@/services/product";

const PriceStoreList = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [selectedStore] = useState("");
  const [, setEditMode] = useState(false);
  const [, setPrices] = useState({});

  useQuery(["locations-for-price"], getAllLocation, { staleTime: 60000 });

  useQuery(["products-for-price"], () => getAllProduct({}), {
    staleTime: 60000
  });

  useQuery(
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

  useMutation((payload) => updateProductPriceByStore(payload), {
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
};

export default PriceStoreList;
