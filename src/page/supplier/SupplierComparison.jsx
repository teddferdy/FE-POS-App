import React, { useState, useMemo } from "react";
import { useQuery } from "react-query";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCookies } from "react-cookie";
import {
  ArrowLeft,
  Search,
  Building2,
  Star,
  Clock,
  Package,
  TrendingDown,
  TrendingUp,
  Scale,
  Filter,
  Info,
  Eye
} from "lucide-react";
import { getAllSupplier } from "@/services/supplier";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

const SupplierComparison = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [cookie] = useCookies();
  const user = cookie?.user;

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("price");
  const [selectedProduct, setSelectedProduct] = useState("all");

  const { data, isLoading } = useQuery(
    ["suppliers-comparison"],
    () => getAllSupplier({ page: 1, limit: 999, status: "active", includeProducts: true }),
    { staleTime: 30000 }
  );

  const suppliers = data?.data || [];

  const allProducts = useMemo(() => {
    const map = new Map();
    for (const supplier of suppliers) {
      const products = supplier.products || [];
      for (const product of products) {
        const key = product.name?.toLowerCase().trim();
        if (!key) continue;
        if (!map.has(key)) {
          map.set(key, { name: product.name, entries: [] });
        }
        map.get(key).entries.push({
          supplierId: supplier.id,
          supplierName: supplier.name,
          supplierPhone: supplier.phone,
          productId: product.productId,
          price: product.price || 0,
          unit: product.unit || "pcs",
          leadTime: product.leadTime || 0,
          leadTimeUnit: product.leadTimeUnit || "hari",
          qualityRating: Number(product.qualityRating) || 0,
          minOrderQty: product.minOrderQty || 1,
          lastPrice: product.lastPrice || 0
        });
      }
    }
    return Array.from(map.values());
  }, [suppliers]);

  const productNames = useMemo(() => allProducts.map((p) => p.name), [allProducts]);

  const filteredProducts = useMemo(() => {
    let result = allProducts;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((p) => p.name.toLowerCase().includes(q));
    }
    if (selectedProduct && selectedProduct !== "all") {
      result = result.filter((p) => p.name === selectedProduct);
    }
    return result;
  }, [allProducts, searchQuery, selectedProduct]);

  const allEntries = useMemo(() => {
    const entries = [];
    for (const product of filteredProducts) {
      for (const entry of product.entries) {
        entries.push({ ...entry, productName: product.name });
      }
    }
    switch (sortBy) {
      case "price":
        return entries.sort((a, b) => a.price - b.price);
      case "price_desc":
        return entries.sort((a, b) => b.price - a.price);
      case "quality":
        return entries.sort((a, b) => b.qualityRating - a.qualityRating);
      case "leadtime":
        return entries.sort((a, b) => a.leadTime - b.leadTime);
      case "name":
        return entries.sort((a, b) => a.supplierName.localeCompare(b.supplierName));
      default:
        return entries;
    }
  }, [filteredProducts, sortBy]);

  const summary = useMemo(() => {
    if (allEntries.length === 0) return {};
    const prices = allEntries.map((e) => e.price).filter((p) => p > 0);
    const uniqueSuppliers = new Set(allEntries.map((e) => e.supplierId));
    return {
      supplierCount: uniqueSuppliers.size,
      lowestPrice: prices.length ? Math.min(...prices) : 0,
      highestPrice: prices.length ? Math.max(...prices) : 0,
      avgPrice: prices.length ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : 0,
      totalProducts: filteredProducts.length
    };
  }, [allEntries, filteredProducts]);

  const formatIDR = (num) => {
    if (!num && num !== 0) return "-";
    return `Rp ${Number(num).toLocaleString("id-ID")}`;
  };

  const getQualityStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating || 0);
    const hasHalf = (rating || 0) % 1 >= 0.5;
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />);
      } else if (i === fullStars && hasHalf) {
        stars.push(<Star key={i} size={14} className="fill-yellow-400/50 text-yellow-400" />);
      } else {
        stars.push(<Star key={i} size={14} className="text-gray-300" />);
      }
    }
    return stars;
  };

  const RankBadge = ({ idx }) => (
    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
      idx === 0
        ? "bg-green-500 text-white"
        : idx === 1
          ? "bg-blue-500 text-white"
          : idx === 2
            ? "bg-orange-500 text-white"
            : "bg-muted text-muted-foreground"
    }`}>
      {idx + 1}
    </span>
  );

  return (
    <div className="space-y-4 md:space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <button onClick={() => navigate("/")} className="hover:text-foreground">
          {t("breadcrumb.home")}
        </button>
        <span className="text-xs">/</span>
        <button onClick={() => navigate("/supplier")} className="hover:text-foreground">
          {t("breadcrumb.supplier")}
        </button>
        <span className="text-xs">/</span>
        <span className="text-primary font-semibold">
          {t("page.supplier.comparison.title")}
        </span>
      </nav>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={() => navigate("/supplier")}>
            <ArrowLeft size={16} />
          </Button>
          <div>
            <h1 className="text-lg sm:text-2xl font-bold">{t("page.supplier.comparison.title")}</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {t("page.supplier.comparison.subtitle")}
            </p>
          </div>
        </div>
      </div>

      <Card className="p-4 md:p-5 space-y-3 md:space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
          <Filter size={16} />
          {t("page.supplier.comparison.filters")}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              {t("page.supplier.comparison.selectProduct")}
            </label>
            <Select value={selectedProduct} onValueChange={setSelectedProduct}>
              <SelectTrigger>
                <SelectValue placeholder={t("page.supplier.comparison.allProducts")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("page.supplier.comparison.allProducts")}</SelectItem>
                {productNames.map((name) => (
                  <SelectItem key={name} value={name}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              {t("page.supplier.comparison.searchProduct")}
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
              <Input
                placeholder={t("page.supplier.comparison.searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          <div className="space-y-1.5 sm:col-span-2 md:col-span-1">
            <label className="text-xs font-medium text-muted-foreground">
              {t("page.supplier.comparison.sortBy")}
            </label>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="price">{t("page.supplier.comparison.sortPriceLow")}</SelectItem>
                <SelectItem value="price_desc">{t("page.supplier.comparison.sortPriceHigh")}</SelectItem>
                <SelectItem value="quality">{t("page.supplier.comparison.sortQuality")}</SelectItem>
                <SelectItem value="leadtime">{t("page.supplier.comparison.sortLeadTime")}</SelectItem>
                <SelectItem value="name">{t("page.supplier.comparison.sortName")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {summary.supplierCount > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
          <Card className="p-3 md:p-4 text-center">
            <div className="flex items-center justify-center gap-1.5 text-muted-foreground mb-1">
              <Scale size={14} />
              <span className="text-xs font-medium">{t("page.supplier.comparison.stats.supplierCount")}</span>
            </div>
            <p className="text-xl md:text-2xl font-bold">{summary.supplierCount}</p>
          </Card>
          <Card className="p-3 md:p-4 text-center">
            <div className="flex items-center justify-center gap-1.5 text-muted-foreground mb-1">
              <Package size={14} />
              <span className="text-xs font-medium">{t("page.supplier.comparison.stats.totalProducts")}</span>
            </div>
            <p className="text-xl md:text-2xl font-bold">{summary.totalProducts}</p>
          </Card>
          <Card className="p-3 md:p-4 text-center">
            <div className="flex items-center justify-center gap-1.5 text-green-600 mb-1">
              <TrendingDown size={14} />
              <span className="text-xs font-medium">{t("page.supplier.comparison.stats.lowestPrice")}</span>
            </div>
            <p className="text-xl md:text-2xl font-bold text-green-600">{formatIDR(summary.lowestPrice)}</p>
          </Card>
          <Card className="p-3 md:p-4 text-center">
            <div className="flex items-center justify-center gap-1.5 text-red-600 mb-1">
              <TrendingUp size={14} />
              <span className="text-xs font-medium">{t("page.supplier.comparison.stats.highestPrice")}</span>
            </div>
            <p className="text-xl md:text-2xl font-bold text-red-600">{formatIDR(summary.highestPrice)}</p>
          </Card>
          <Card className="p-3 md:p-4 text-center col-span-2 sm:col-span-1">
            <div className="flex items-center justify-center gap-1.5 text-muted-foreground mb-1">
              <Info size={14} />
              <span className="text-xs font-medium">{t("page.supplier.comparison.stats.avgPrice")}</span>
            </div>
            <p className="text-xl md:text-2xl font-bold">{formatIDR(summary.avgPrice)}</p>
          </Card>
        </div>
      )}

      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="p-4 md:p-6 space-y-3 md:space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : allEntries.length === 0 ? (
          <div className="p-8 md:p-12 text-center">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-3">
              <Building2 size={24} className="text-muted-foreground/60" />
            </div>
            <p className="text-sm font-semibold text-foreground">
              {t("page.supplier.comparison.empty")}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {t("page.supplier.comparison.emptyDesc")}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-12 font-semibold">#</TableHead>
                    <TableHead className="font-semibold">{t("page.supplier.comparison.table.supplier")}</TableHead>
                    <TableHead className="font-semibold">{t("page.supplier.comparison.table.product")}</TableHead>
                    <TableHead className="font-semibold text-right">{t("page.supplier.comparison.table.price")}</TableHead>
                    <TableHead className="font-semibold text-center">{t("page.supplier.comparison.table.quality")}</TableHead>
                    <TableHead className="font-semibold text-right">{t("page.supplier.comparison.table.leadTime")}</TableHead>
                    <TableHead className="font-semibold text-right">{t("page.supplier.comparison.table.minOrder")}</TableHead>
                    <TableHead className="font-semibold text-right">{t("page.supplier.comparison.table.lastPrice")}</TableHead>
                    <TableHead className="font-semibold text-center sticky right-0 bg-muted/50 z-10">{t("page.supplier.comparison.table.action")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allEntries.map((entry, idx) => (
                    <TableRow key={`${entry.supplierId}-${entry.productName}`} className={idx === 0 ? "bg-green-50/50" : ""}>
                      <TableCell><RankBadge idx={idx} /></TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{entry.supplierName}</p>
                          <p className="text-xs text-muted-foreground">{entry.supplierPhone || "-"}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{entry.productName}</TableCell>
                      <TableCell className="text-right">
                        <span className={`font-semibold ${idx === 0 ? "text-green-600" : ""}`}>
                          {formatIDR(entry.price)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-1">
                          {getQualityStars(entry.qualityRating)}
                          <span className="text-xs text-muted-foreground ml-1">
                            {entry.qualityRating || 0}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Clock size={12} className="text-muted-foreground" />
                          <span className="text-sm">{entry.leadTime || 0} {entry.leadTimeUnit || t("page.supplier.comparison.stats.day")}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-sm">{entry.minOrderQty || 1}</TableCell>
                      <TableCell className="text-right text-sm">{formatIDR(entry.lastPrice)}</TableCell>
                      <TableCell className="text-center sticky right-0 bg-white z-10">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-primary hover:text-primary/80"
                          onClick={() => navigate(`/detail-supplier?id=${entry.supplierId}`)}>
                          <Eye size={16} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile card list */}
            <div className="md:hidden divide-y">
              {allEntries.map((entry, idx) => (
                <div key={`${entry.supplierId}-${entry.productName}`} className={`p-4 space-y-3 ${idx === 0 ? "bg-green-50/50" : ""}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <RankBadge idx={idx} />
                      <div className="min-w-0">
                        <p className="font-semibold text-sm truncate">{entry.supplierName}</p>
                        <p className="text-xs text-muted-foreground">{entry.supplierPhone || "-"}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0 text-primary hover:text-primary/80"
                      onClick={() => navigate(`/detail-supplier?id=${entry.supplierId}`)}>
                      <Eye size={16} />
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{t("page.supplier.comparison.table.product")}</span>
                    <span className="text-sm font-medium">{entry.productName}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center justify-between bg-muted/30 rounded-lg px-3 py-2">
                      <span className="text-xs text-muted-foreground">{t("page.supplier.comparison.table.price")}</span>
                      <span className={`text-sm font-semibold ${idx === 0 ? "text-green-600" : ""}`}>
                        {formatIDR(entry.price)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between bg-muted/30 rounded-lg px-3 py-2">
                      <span className="text-xs text-muted-foreground">{t("page.supplier.comparison.table.lastPrice")}</span>
                      <span className="text-sm font-medium">{formatIDR(entry.lastPrice)}</span>
                    </div>
                    <div className="flex items-center justify-between bg-muted/30 rounded-lg px-3 py-2">
                      <span className="text-xs text-muted-foreground">{t("page.supplier.comparison.table.quality")}</span>
                      <div className="flex items-center gap-1">
                        {getQualityStars(entry.qualityRating)}
                        <span className="text-xs text-muted-foreground ml-0.5">{entry.qualityRating || 0}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between bg-muted/30 rounded-lg px-3 py-2">
                      <span className="text-xs text-muted-foreground">{t("page.supplier.comparison.table.leadTime")}</span>
                      <div className="flex items-center gap-1">
                        <Clock size={12} className="text-muted-foreground" />
                        <span className="text-sm">{entry.leadTime || 0} {entry.leadTimeUnit || t("page.supplier.comparison.stats.day")}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{t("page.supplier.comparison.table.minOrder")}: <span className="font-medium text-foreground">{entry.minOrderQty || 1}</span></span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

export default SupplierComparison;
