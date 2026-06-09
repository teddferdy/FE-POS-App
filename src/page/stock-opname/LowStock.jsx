import React from "react";
import { useQuery } from "react-query";
import { useCookies } from "react-cookie";
import { AlertTriangle, Package, ShoppingBasket } from "lucide-react";
import { getLowStockProducts } from "@/services/stock";
import { Card } from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell
} from "@/components/ui/table";
import PageHeader from "@/components/ui/PageHeader";
import { useTranslation } from "react-i18next";

const formatNumber = (num) => {
  if (num === null || num === undefined) return "0";
  return Number(num).toLocaleString("id-ID");
};

const LowStock = () => {
  const { t } = useTranslation();
  const [cookie] = useCookies();
  const user = cookie?.user;
  const role = user?.role || user?.type || "";

   const { data, isLoading } = useQuery(["low-stock"], () => getLowStockProducts(), {
     staleTime: 30 * 1000
   });

  const lowStockData = data?.data || {};
  const products = lowStockData.products || [];
  const ingredients = lowStockData.ingredients || [];

  const getStockStatus = (stock, t) => {
    if (stock <= 0)
      return {
        label: t("page.stockOpname.status.habis"),
        cls: "bg-red-100 text-red-700 border-red-200"
      };
    return {
      label: t("page.stockOpname.status.menipis"),
      cls: "bg-orange-100 text-orange-700 border-orange-200"
    };
  };

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[
          {
            label: t("breadcrumb.home"),
            href:
              role === "super_admin"
                ? "/dashboard-super-admin"
                : role === "admin"
                  ? "/dashboard-admin"
                  : "/home"
          },
          { label: t("breadcrumb.inventory") },
          { label: t("breadcrumb.lowStock") }
        ]}
        title={t("page.lowStock.title")}
        description={t("page.lowStock.description")}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
            <Package size={24} className="text-red-600" />
          </div>
          <div>
            <p className="text-2xl font-bold">{lowStockData.totalProducts || 0}</p>
            <p className="text-sm text-muted-foreground">{t("page.lowStock.productLowStock")}</p>
          </div>
        </Card>
        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center shrink-0">
            <ShoppingBasket size={24} className="text-orange-600" />
          </div>
          <div>
            <p className="text-2xl font-bold">{lowStockData.totalIngredients || 0}</p>
            <p className="text-sm text-muted-foreground">{t("page.lowStock.ingredientLowStock")}</p>
          </div>
        </Card>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loading />
        </div>
      ) : products.length === 0 && ingredients.length === 0 ? (
        <Card className="p-12 text-center text-muted-foreground">
          <AlertTriangle size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">{t("page.lowStock.empty")}</p>
          <p className="text-sm mt-1">{t("page.lowStock.emptyDetail")}</p>
        </Card>
      ) : (
        <>
          {products.length > 0 && (
            <Card className="overflow-hidden">
              <div className="p-4 border-b border-border bg-muted/30">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <Package size={16} className="text-destructive" />
                  {t("page.lowStock.product")} ({products.length})
                </h3>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("page.lowStock.table.productName")}</TableHead>
                      <TableHead className="text-right">
                        {t("page.lowStock.table.currentStock")}
                      </TableHead>
                      <TableHead className="text-right">
                        {t("page.lowStock.table.minStock")}
                      </TableHead>
                      <TableHead>{t("page.lowStock.table.unit")}</TableHead>
                      <TableHead>{t("common.status")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((p) => {
                      const status = getStockStatus(p.stock, t);
                      return (
                        <TableRow key={p.id}>
                          <TableCell className="font-medium">{p.nameProduct}</TableCell>
                          <TableCell className="text-right font-semibold">
                            {formatNumber(p.stock)}
                          </TableCell>
                          <TableCell className="text-right text-muted-foreground">
                            {formatNumber(p.minStock)}
                          </TableCell>
                          <TableCell>{p.unit || "pcs"}</TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${status.cls}`}>
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${p.stock <= 0 ? "bg-red-500" : "bg-orange-500"}`}
                              />
                              {status.label}
                            </span>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </Card>
          )}

          {ingredients.length > 0 && (
            <Card className="overflow-hidden">
              <div className="p-4 border-b border-border bg-muted/30">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <ShoppingBasket size={16} className="text-orange-500" />
                  {t("page.lowStock.ingredient")} ({ingredients.length})
                </h3>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("page.lowStock.table.ingredientName")}</TableHead>
                      <TableHead className="text-right">
                        {t("page.lowStock.table.currentStock")}
                      </TableHead>
                      <TableHead className="text-right">
                        {t("page.lowStock.table.minStock")}
                      </TableHead>
                      <TableHead>{t("page.lowStock.table.unit")}</TableHead>
                      <TableHead>{t("common.status")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ingredients.map((i) => {
                      const status = getStockStatus(i.stock, t);
                      return (
                        <TableRow key={i.id}>
                          <TableCell className="font-medium">{i.name}</TableCell>
                          <TableCell className="text-right font-semibold">
                            {formatNumber(i.stock)}
                          </TableCell>
                          <TableCell className="text-right text-muted-foreground">
                            {formatNumber(i.minStock)}
                          </TableCell>
                          <TableCell>{i.unit || "pcs"}</TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${status.cls}`}>
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${i.stock <= 0 ? "bg-red-500" : "bg-orange-500"}`}
                              />
                              {status.label}
                            </span>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default LowStock;
