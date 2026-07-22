import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { useCookies } from "react-cookie";
import { useTranslation } from "react-i18next";
import { useGlobalStoreFilter } from "@/hooks/useGlobalStoreFilter";
import {
  TrendingUp,
  Award,
  Eye,
  Calculator,
  Star,
  AlertTriangle
} from "lucide-react";
import { toast } from "sonner";
import {
  getSupplierScores,
  getTopSuppliers,
  calculateSupplierScore
} from "@/services/supplierPerformance";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/SearchInput";
import { Skeleton } from "@/components/ui/skeleton";
import DataTable from "@/components/ui/DataTable";
import StatCard from "@/components/ui/StatCard";
import PageHeader from "@/components/ui/PageHeader";
import StoreFilter from "@/components/ui/StoreFilter";
import Modal from "@/components/organism/modal";
import { canAccess } from "@/utils/permission";

const periodOptions = [
  { value: "all", label: "All Periods" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "yearly", label: "Yearly" },
  { value: "all_time", label: "All Time" }
];

const gradeOptions = [
  { value: "all", label: "All Grades" },
  { value: "A", label: "Grade A" },
  { value: "B", label: "Grade B" },
  { value: "C", label: "Grade C" },
  { value: "D", label: "Grade D" },
  { value: "F", label: "Grade F" }
];

const gradeBadge = (grade) => {
  const map = {
    A: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800",
    B: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800",
    C: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800",
    D: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border border-orange-200 dark:border-orange-800",
    F: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800"
  };
  return map[grade] || "bg-gray-100 text-gray-800";
};

const SupplierScoreList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [cookie] = useCookies();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [periodFilter, setPeriodFilter] = useState("all");
  const [gradeFilter, setGradeFilter] = useState("all");
  const [calculateModal, setCalculateModal] = useState(false);
  const [calculateForm, setCalculateForm] = useState({
    supplierId: "",
    period: "monthly"
  });
  const [storeFilter, setGlobalStoreFilter] = useGlobalStoreFilter();

  const user = cookie?.user;
  const MENU_KEY = "/supplier-score-list";

  const { data, isLoading, isFetching } = useQuery(
    ["supplier-scores", page, limit, storeFilter, search, periodFilter, gradeFilter],
    () =>
      getSupplierScores({
        store: storeFilter === "all" ? "" : storeFilter,
        page,
        limit,
        search,
        period: periodFilter,
        grade: gradeFilter
      }),
    { retry: 1, keepPreviousData: true }
  );

  const { data: topData } = useQuery(
    ["top-suppliers", storeFilter],
    () => getTopSuppliers({ store: storeFilter === "all" ? "" : storeFilter, limit: 5 }),
    { retry: 1 }
  );

  const calculateMutation = useMutation(calculateSupplierScore, {
    onSuccess: () => {
      toast.success(t("common.success"), {
        description: t("page.supplierPerformance.toast.calculateSuccess")
      });
      queryClient.invalidateQueries(["supplier-scores"]);
      queryClient.invalidateQueries(["top-suppliers"]);
      setCalculateModal(false);
      setCalculateForm({ supplierId: "", period: "monthly" });
    },
    onError: (err) => {
      toast.error(t("common.error"), {
        description: err?.response?.data?.message || err.message
      });
    }
  });

  const topSuppliers = topData?.data || [];

  const columns = [
    {
      header: t("page.supplierPerformance.list.rank"),
      accessorKey: "rank",
      cell: ({ row }) => {
        const idx = (page - 1) * limit + row.index + 1;
        return (
          <span className="font-semibold text-foreground">#{idx}</span>
        );
      }
    },
    {
      header: t("page.supplierPerformance.list.supplier"),
      accessorKey: "supplier",
      cell: ({ row }) => (
        <div>
          <div className="font-medium text-foreground">
            {row.original.supplier?.name || "-"}
          </div>
          <div className="text-xs text-muted-foreground">
            {row.original.supplier?.phone || row.original.supplier?.email || ""}
          </div>
        </div>
      )
    },
    {
      header: t("page.supplierPerformance.list.period"),
      accessorKey: "period",
      cell: ({ row }) => (
        <span className="text-sm capitalize">{row.original.period?.replace("_", " ")}</span>
      )
    },
    {
      header: t("page.supplierPerformance.list.onTimeRate"),
      accessorKey: "onTimeRate",
      cell: ({ row }) => {
        const rate = parseFloat(row.original.onTimeRate || 0);
        return (
          <div className="flex items-center gap-2">
            <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${rate >= 80 ? "bg-green-500" : rate >= 60 ? "bg-yellow-500" : "bg-red-500"}`}
                style={{ width: `${rate}%` }}
              />
            </div>
            <span className="text-sm font-medium">{rate.toFixed(1)}%</span>
          </div>
        );
      }
    },
    {
      header: t("page.supplierPerformance.list.defectRate"),
      accessorKey: "defectRate",
      cell: ({ row }) => {
        const rate = parseFloat(row.original.defectRate || 0);
        return (
          <span className={`text-sm font-medium ${rate > 5 ? "text-red-600" : rate > 2 ? "text-yellow-600" : "text-green-600"}`}>
            {rate.toFixed(1)}%
          </span>
        );
      }
    },
    {
      header: t("page.supplierPerformance.list.score"),
      accessorKey: "overallScore",
      cell: ({ row }) => (
        <span className="text-lg font-bold text-foreground">
          {parseFloat(row.original.overallScore || 0).toFixed(1)}
        </span>
      )
    },
    {
      header: t("page.supplierPerformance.list.grade"),
      accessorKey: "grade",
      cell: ({ row }) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${gradeBadge(row.original.grade)}`}>
          {row.original.grade}
        </span>
      )
    },
    {
      header: t("common.action"),
      accessorKey: "actions",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => navigate(`/detail-supplier-score?id=${row.original.id}`)}>
          <Eye size={14} />
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[
          {
            href:
              user?.roleType === "super_admin"
                ? "/dashboard-super-admin"
                : user?.roleType === "admin"
                  ? "/dashboard-admin"
                  : "/home",
            i18nKey: "breadcrumb.home"
          },
          { i18nKey: "sidebar.supplierPerformance" }
        ]}
        title={t("page.supplierPerformance.list.title")}
        description={t("page.supplierPerformance.list.description")}>
        {canAccess(user, MENU_KEY, "create") && (
          <Button onClick={() => setCalculateModal(true)}>
            <Calculator size={16} className="mr-2" />
            {t("page.supplierPerformance.list.calculateButton")}
          </Button>
        )}
      </PageHeader>

      {topSuppliers.length > 0 && (
        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Award size={18} className="text-yellow-500" />
            {t("page.supplierPerformance.list.topSuppliers")}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {topSuppliers.map((supplier, idx) => (
              <div
                key={supplier.id}
                className={`p-4 rounded-lg border ${idx === 0 ? "border-yellow-300 bg-yellow-50 dark:bg-yellow-900/10" : "border-border bg-background"}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-lg font-bold ${idx === 0 ? "text-yellow-600" : "text-muted-foreground"}`}>
                    #{idx + 1}
                  </span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${gradeBadge(supplier.grade)}`}>
                    {supplier.grade}
                  </span>
                </div>
                <div className="font-medium text-sm text-foreground truncate">
                  {supplier.supplier?.name || "-"}
                </div>
                <div className="text-lg font-bold text-foreground">
                  {parseFloat(supplier.overallScore || 0).toFixed(1)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-card rounded-xl border border-border p-4">
        <div className="flex flex-col md:flex-row gap-3 mb-4">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder={t("page.supplierPerformance.list.searchPlaceholder")}
            className="w-full md:w-64"
          />
          <StoreFilter value={storeFilter} onChange={setGlobalStoreFilter} />
          <select
            value={periodFilter}
            onChange={(e) => setPeriodFilter(e.target.value)}
            className="h-10 px-3 bg-background border border-input rounded-lg text-sm focus:ring-2 focus:ring-ring outline-none">
            {periodOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <select
            value={gradeFilter}
            onChange={(e) => setGradeFilter(e.target.value)}
            className="h-10 px-3 bg-background border border-input rounded-lg text-sm focus:ring-2 focus:ring-ring outline-none">
            {gradeOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <DataTable
          columns={columns}
          data={data?.data || []}
          loading={isLoading}
          isFetching={isFetching}
          pagination={data?.pagination}
          onPageChange={setPage}
          onLimitChange={setLimit}
          emptyMessage={t("page.supplierPerformance.list.empty")}
        />
      </div>

      {/* Calculate Modal */}
      <Modal
        type="confirm"
        open={calculateModal}
        onOpenChange={setCalculateModal}
        title={t("page.supplierPerformance.modal.calculateTitle")}
        description={t("page.supplierPerformance.modal.calculateDescription")}
        confirmText={t("page.supplierPerformance.modal.confirmCalculate")}
        onConfirm={() => {
          if (!calculateForm.supplierId) {
            toast.error(t("common.error"), {
              description: "Please select a supplier"
            });
            return;
          }
          calculateMutation.mutate({
            store: storeFilter === "all" ? "" : storeFilter,
            supplierId: calculateForm.supplierId,
            period: calculateForm.period
          });
        }}
        isLoading={calculateMutation.isLoading}>
        <div className="space-y-4 mt-4">
          <div>
            <label className="text-sm font-medium text-foreground">Supplier ID</label>
            <input
              type="number"
              value={calculateForm.supplierId}
              onChange={(e) => setCalculateForm({ ...calculateForm, supplierId: e.target.value })}
              className="mt-1 w-full h-10 px-3 bg-background border border-input rounded-lg text-sm focus:ring-2 focus:ring-ring outline-none"
              placeholder="Enter supplier ID"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">Period</label>
            <select
              value={calculateForm.period}
              onChange={(e) => setCalculateForm({ ...calculateForm, period: e.target.value })}
              className="mt-1 w-full h-10 px-3 bg-background border border-input rounded-lg text-sm focus:ring-2 focus:ring-ring outline-none">
              {periodOptions.filter(o => o.value !== "all").map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SupplierScoreList;
