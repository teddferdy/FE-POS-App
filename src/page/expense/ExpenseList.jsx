import React, { useState } from "react";
import { useGlobalStoreFilter } from "@/hooks/useGlobalStoreFilter";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { toast } from "sonner";
import { Plus, Edit, Tag, DollarSign, CheckCircle, XCircle, Eye, Wallet, FileEdit } from "lucide-react";
import { getAllExpenses, approveExpense, rejectExpense } from "@/services/expense";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/SearchInput";
import { useTranslation } from "react-i18next";
import DataTable from "@/components/ui/DataTable";
import { canAccess } from "@/utils/permission";
import AbortController from "@/components/organism/abort-controller";
import StatCard from "@/components/ui/StatCard";
import { getAllLocation } from "@/services/location";
import NoStore from "@/components/ui/NoStore";
import StoreFilter from "@/components/ui/StoreFilter";
import { Loading } from "@/components/ui/loading";
import { Skeleton } from "@/components/ui/skeleton";

const ExpenseList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [cookie] = useCookies();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [storeFilter, setGlobalStoreFilter] = useGlobalStoreFilter();
  const [showFilters, setShowFilters] = useState(false);

  const user = cookie?.user;
  const isSuperAdmin = user?.roleType === "super_admin";
  const MENU_KEY = "/expense";
  const locationParam = storeFilter !== "all" ? storeFilter : user?.store || "";

  const { data: locData, isLoading: isLoadingLocations } = useQuery(["locations-expense"], () => getAllLocation(), {
    
    enabled: isSuperAdmin
  });

  const { data, isLoading, isFetching, isError, refetch } = useQuery(
    ["expenses", page, limit, search, statusFilter, storeFilter],
    () =>
      getAllExpenses({
        location: locationParam,
        page,
        limit,
        search: search || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined
      }),
    { }
  );

  const approveMutation = useMutation(approveExpense, {
    onSuccess: () => {
      queryClient.invalidateQueries(["expenses"]);
      toast.success(t("page.expense.list.toast.approveSuccess"), {
        description: t("page.expense.list.toast.approveDescription")
      });
    },
    onError: (err) => {
      toast.error(t("page.expense.list.toast.error"), {
        description: err?.response?.data?.message || err.message
      });
    }
  });

  const rejectMutation = useMutation(rejectExpense, {
    onSuccess: () => {
      queryClient.invalidateQueries(["expenses"]);
      toast.success(t("page.expense.list.toast.rejectSuccess"), {
        description: t("page.expense.list.toast.rejectDescription")
      });
    },
    onError: (err) => {
      toast.error(t("page.expense.list.toast.error"), {
        description: err?.response?.data?.message || err.message
      });
    }
  });

  const expenses = data?.data || [];
  const pagination = data?.pagination || {};
  const total = pagination?.total || 0;
  const totalPages = pagination?.totalPages || 1;
  const stats = data?.stats || {};

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  const getStatusBadge = (status) => {
    if (status === "draft") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          {t("page.expense.list.statusDraft")}
        </span>
      );
    }
    if (status === "pending" || status === "need approve") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
          {t("page.expense.list.statusPending")}
        </span>
      );
    }
    if (status === "rejected" || status === "ditolak") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          {t("page.expense.list.statusRejected")}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        {t("page.expense.list.statusApproved")}
      </span>
    );
  };

  const columns = [
    {
      header: t("page.expense.table.description"),
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
            <Tag size={14} />
          </div>
          <span className="font-medium text-foreground">{item.description || "-"}</span>
        </div>
      )
    },
    {
      header: t("page.expense.table.category"),
      render: (item) => item.categoryData?.name || item.category?.name || "-"
    },
    {
      header: t("page.expense.table.amount"),
      accessor: "amount",
      align: "right",
      render: (item) => <span className="font-medium">{formatCurrency(item.amount)}</span>
    },
    {
      header: t("page.expense.table.status"),
      align: "center",
      render: (item) => getStatusBadge(item.status)
    },
    {
      header: t("page.expense.table.date"),
      render: (item) => (
        <span className="text-sm text-muted-foreground">{formatDate(item.date)}</span>
      )
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
      header: t("common.createdAt"),
      render: (item) => {
        if (!item.createdAt) return <span className="text-sm text-muted-foreground">-</span>;
        const d = new Date(item.createdAt);
        if (isNaN(d.getTime())) return <span className="text-sm text-muted-foreground">-</span>;
        return (
          <span className="text-sm font-mono text-muted-foreground">
            {d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}{" "}
            {d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
          </span>
        );
      }
    },
    {
      header: t("common.updatedAt"),
      render: (item) => {
        if (!item.updatedAt) return <span className="text-sm text-muted-foreground">-</span>;
        const d = new Date(item.updatedAt);
        if (isNaN(d.getTime())) return <span className="text-sm text-muted-foreground">-</span>;
        return (
          <span className="text-sm font-mono text-muted-foreground">
            {d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}{" "}
            {d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
          </span>
        );
      }
    },
    {
      header: t("page.expense.table.actions"),
      align: "right",
      stickyRight: true,
      render: (item) => (
        <div className="flex items-center justify-end gap-1">
          {item.status === "pending" && canAccess(user, MENU_KEY, "edit") && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-green-600"
                disabled={approveMutation.isLoading}
                onClick={() => approveMutation.mutate(item.id || item._id)}>
                <CheckCircle size={18} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-red-600"
                disabled={rejectMutation.isLoading}
                onClick={() => rejectMutation.mutate(item.id || item._id)}>
                <XCircle size={18} />
              </Button>
            </>
          )}
          {canAccess(user, MENU_KEY, "edit") && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-primary"
                onClick={() => navigate(`/detail-expense?id=${item.id || item._id}`)}>
                <Eye size={18} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-primary"
                onClick={() => navigate(`/edit-expense?id=${item.id || item._id}`)}>
                <Edit size={18} />
              </Button>
            </>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <button
            onClick={() => navigate("/dashboard-super-admin")}
            className="hover:text-foreground transition-colors">
            {t("breadcrumb.home")}
          </button>
          <span className="text-xs">/</span>
          <span className="text-primary font-semibold">{t("page.expense.list.title")}</span>
        </nav>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("page.expense.list.title")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t("page.expense.list.description")}</p>
        </div>
        {canAccess(user, MENU_KEY, "add") && (
          <Button onClick={() => navigate("/add-expense")} className="gap-2">
            <Plus size={18} />
            {t("page.expense.button.add")}
          </Button>
        )}
      </div>

      {isError ? (
        <AbortController refetch={refetch} />
      ) : (
        <>
          {locData && (locData?.data || []).length === 0 ? (
            <NoStore />
          ) : (
            <>
              {isFetching || isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="bg-card rounded-xl border border-border p-4">
                      <div className="flex items-start justify-between mb-3">
                        <Skeleton className="h-3 w-24" />
                        <Skeleton className="h-4 w-4 rounded" />
                      </div>
                      <Skeleton className="h-8 w-28 mb-2" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
                  <StatCard
                    label={t("page.expense.list.total")}
                    value={total}
                    icon={Wallet}
                    variant="default"
                  />
                  <StatCard
                    label={t("page.expense.list.draft")}
                    value={stats.draft || 0}
                    icon={FileEdit}
                    variant="draft"
                  />
                  <StatCard
                    label={t("page.expense.list.pending")}
                    value={stats.pending || 0}
                    icon={FileEdit}
                    variant="warning"
                  />
                  <StatCard
                    label={t("page.expense.list.approved")}
                    value={stats.approved || 0}
                    icon={CheckCircle}
                    variant="active"
                  />
                  <StatCard
                    label={t("page.expense.list.rejected")}
                    value={stats.rejected || 0}
                    icon={XCircle}
                    variant="inactive"
                  />
                </div>
              )}

              {isLoadingLocations || isLoading || isFetching ? (
                <div className="flex flex-wrap items-center gap-2">
                  <Skeleton className="h-9 w-72 rounded-md" />
                  <Skeleton className="h-9 w-48 rounded-md" />
                  <Skeleton className="h-9 w-32 rounded-md" />
                </div>
              ) : (
              <div className="flex flex-wrap items-center gap-2">
                <SearchInput
                  value={search}
                  onChange={(val) => { setSearch(val); setPage(1); }}
                  placeholder={t("page.expense.list.search")}
                  isLoading={isFetching}
                />
                {isSuperAdmin && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 h-9 lg:hidden"
                      onClick={() => setShowFilters(!showFilters)}>
                      <span className="material-symbols-outlined text-base">filter_list</span>
                      {showFilters ? "Tutup" : "Filter"}
                    </Button>
                    <div
                      className={`${showFilters ? "flex" : "hidden"} lg:flex flex-wrap items-center gap-2`}>
                      <StoreFilter
                        locations={locData?.data || []}
                        value={storeFilter}
                        onChange={(v) => {
                          setGlobalStoreFilter(v);
                          setPage(1);
                        }}
                        isSuperAdmin={isSuperAdmin}
                        t={t}
                      />
                      <select
                        value={statusFilter}
                        onChange={(e) => {
                          setStatusFilter(e.target.value);
                          setPage(1);
                        }}
                        className="h-9 px-3 rounded-md border border-input bg-background text-sm">
                        <option value="all">{t("common.all")}</option>
                        <option value="draft">{t("page.expense.list.statusDraft")}</option>
                        <option value="pending">{t("page.expense.list.statusPending")}</option>
                        <option value="approved">{t("page.expense.list.statusApproved")}</option>
                        <option value="rejected">{t("page.expense.list.statusRejected")}</option>
                      </select>
                    </div>
                  </>
                )}
              </div>
              )}

              <div>
                <DataTable
                  columns={columns}
                  data={expenses}
                  isLoading={isLoading || isFetching}
                  emptyMessage={t("page.expense.list.empty")}
                  emptyIcon={DollarSign}
                  pagination={{
                    page,
                    totalPages,
                    total,
                    onPageChange: setPage,
                    pageSize: limit,
                    onPageSizeChange: (v) => {
                      setLimit(v);
                      setPage(1);
                    }
                  }}
                />
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default ExpenseList;
