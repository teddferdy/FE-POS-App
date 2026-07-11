import React, { useState } from "react";
import { useQuery } from "react-query";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { TrendingUp, TrendingDown } from "lucide-react";
import { getProfitPerProduct } from "@/services/report";
import { Card } from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";
import { Input } from "@/components/ui/input";
import AbortController from "@/components/organism/abort-controller";
import { formatCurrency } from "@/utils/reportUtils";

const ProfitPerProduct = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [cookie] = useCookies();
  const store = cookie?.store;
  const today = new Date().toISOString().slice(0, 10);
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);

  const { data, isLoading, isError, refetch } = useQuery(
    ["profit-per-product", store, startDate, endDate],
    () =>
      getProfitPerProduct({
        store,
        startDate,
        endDate
      }),
    { enabled: true, staleTime: 30000 }
  );

  const items = data?.data || [];
  const totalSales = items.reduce((s, i) => s + i.totalSales, 0);
  const totalHpp = items.reduce((s, i) => s + i.totalHpp, 0);
  const totalProfit = items.reduce((s, i) => s + i.profit, 0);

  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <button
          onClick={() => navigate("/dashboard-super-admin")}
          className="hover:text-foreground transition-colors">
          {t("breadcrumb.home")}
        </button>
        <span className="text-xs">/</span>
        <span className="text-primary font-semibold">
          {t("page.report.profitPerProduct.title")}
        </span>
      </nav>

      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground tracking-tight">
            {t("page.report.profitPerProduct.title")}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {t("page.report.profitPerProduct.description")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-40"
          />
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-40"
          />
        </div>
      </div>

      {isError ? (
        <AbortController refetch={refetch} />
      ) : isLoading ? (
        <Loading fullscreen size="lg" />
      ) : items.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <p className="text-muted-foreground">{t("page.report.profitPerProduct.noData")}</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-4">
            <Card className="p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                {t("page.report.profitPerProduct.totalSales")}
              </p>
              <p className="text-xl font-bold text-foreground mt-1">{formatCurrency(totalSales)}</p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                {t("page.report.profitPerProduct.totalHpp")}
              </p>
              <p className="text-xl font-bold text-foreground mt-1">{formatCurrency(totalHpp)}</p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                {t("page.report.profitPerProduct.totalProfit")}
              </p>
              <p
                className={`text-xl font-bold mt-1 ${totalProfit >= 0 ? "text-green-600" : "text-destructive"}`}>
                {formatCurrency(totalProfit)}
              </p>
            </Card>
          </div>
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/60 border-b">
                    <th className="px-3 py-3 text-left font-semibold text-muted-foreground text-xs uppercase">
                      {t("page.report.profitPerProduct.table.product")}
                    </th>
                    <th className="px-3 py-3 text-right font-semibold text-muted-foreground text-xs uppercase">
                      {t("page.report.profitPerProduct.table.qty")}
                    </th>
                    <th className="px-3 py-3 text-right font-semibold text-muted-foreground text-xs uppercase">
                      {t("page.report.profitPerProduct.table.sales")}
                    </th>
                    <th className="px-3 py-3 text-right font-semibold text-muted-foreground text-xs uppercase">
                      {t("page.report.profitPerProduct.table.hpp")}
                    </th>
                    <th className="px-3 py-3 text-right font-semibold text-muted-foreground text-xs uppercase">
                      {t("page.report.profitPerProduct.table.profit")}
                    </th>
                    <th className="px-3 py-3 text-right font-semibold text-muted-foreground text-xs uppercase">
                      {t("page.report.profitPerProduct.table.margin")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.productId} className="border-b border-muted/30 hover:bg-muted/15">
                      <td className="px-3 py-3 font-medium">{item.productName}</td>
                      <td className="px-3 py-3 text-right">{item.qtySold}</td>
                      <td className="px-3 py-3 text-right">{formatCurrency(item.totalSales)}</td>
                      <td className="px-3 py-3 text-right">{formatCurrency(item.totalHpp)}</td>
                      <td
                        className={`px-3 py-3 text-right font-semibold ${item.profit >= 0 ? "text-green-600" : "text-destructive"}`}>
                        {formatCurrency(item.profit)}
                      </td>
                      <td className="px-3 py-3 text-right">
                        <span
                          className={`inline-flex items-center gap-1 ${item.margin >= 0 ? "text-green-600" : "text-destructive"}`}>
                          {item.margin >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                          {item.margin}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  );
};

export default ProfitPerProduct;
