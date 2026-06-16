import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { toast } from "sonner";
import { Plus, Search, Edit, Tag, DollarSign, CheckCircle, XCircle, Eye } from "lucide-react";
import { getAllExpenses, approveExpense, rejectExpense } from "@/services/expense";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import DataTable from "@/components/ui/DataTable";
import { canAccess } from "@/utils/permission";

const ExpenseList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [cookie] = useCookies();
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");

  const user = cookie?.user;
  const MENU_KEY = "/expense";
  const locationParam = user?.store || "";

  const { data, isLoading } = useQuery(
    ["expenses", page, limit],
    () => getAllExpenses({ location: locationParam, page, limit }),
    { keepPreviousData: true }
  );

  const approveMutation = useMutation(approveExpense, {
    onSuccess: () => {
      queryClient.invalidateQueries(["expenses"]);
      toast.success(t("page.expense.list.toast.approveSuccess"), { description: t("page.expense.list.toast.approveDescription") });
    },
    onError: (err) => {
      toast.error(t("page.expense.list.toast.error"), { description: err?.response?.data?.message || err.message });
    }
  });

  const rejectMutation = useMutation(rejectExpense, {
    onSuccess: () => {
      queryClient.invalidateQueries(["expenses"]);
      toast.success(t("page.expense.list.toast.rejectSuccess"), { description: t("page.expense.list.toast.rejectDescription") });
    },
    onError: (err) => {
      toast.error(t("page.expense.list.toast.error"), { description: err?.response?.data?.message || err.message });
    }
  });

  const expenses = data?.data || [];
  const pagination = data?.pagination || {};
  const total = pagination?.total || pagination?.totalItems || data?.total || 0;
  const totalPages = pagination?.totalPages || Math.ceil(total / limit) || 1;

  const pendingExpenses = expenses.filter(
    (e) => e.status === "need approve" || e.status === "pending"
  ).length;
  const approvedExpenses = expenses.filter(
    (e) => e.status === "approved" || e.status === "disetujui"
  ).length;
  const rejectedExpenses = expenses.filter(
    (e) => e.status === "rejected" || e.status === "ditolak"
  ).length;

  const filtered = expenses.filter(
    (item) =>
      !search ||
      item.description?.toLowerCase().includes(search.toLowerCase()) ||
      item.categoryData?.name?.toLowerCase().includes(search.toLowerCase())
  );

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
      header: t("page.expense.table.actions"),
      align: "right",
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
                <Eye size={15} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-primary"
                onClick={() => navigate(`/edit-expense?id=${item.id || item._id}`)}>
                <Edit size={15} />
              </Button>
            </>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <button
          onClick={() => navigate("/dashboard-super-admin")}
          className="hover:text-foreground transition-colors">
          {t("breadcrumb.home")}
        </button>
        <span className="text-xs">/</span>
        <span className="text-primary font-semibold">{t("page.expense.list.title")}</span>
      </nav>

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

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="p-5">
          <p className="text-sm text-muted-foreground">{t("page.expense.list.total")}</p>
          <p className="text-2xl font-bold text-foreground mt-1">{total}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-muted-foreground">{t("page.expense.list.pending")}</p>
          <p className="text-2xl font-bold text-orange-600 mt-1">{pendingExpenses}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-muted-foreground">{t("page.expense.list.approved")}</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{approvedExpenses}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-muted-foreground">{t("page.expense.list.rejected")}</p>
          <p className="text-2xl font-bold text-red-600 mt-1">{rejectedExpenses}</p>
        </Card>
      </div>

      <div className="relative w-full sm:w-72">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          placeholder={t("page.expense.list.search")}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="pl-9 h-10"
        />
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        isLoading={isLoading}
        emptyMessage={t("page.expense.list.empty")}
        emptyIcon={DollarSign}
        pagination={{ page, totalPages, total, onPageChange: setPage }}
      />
    </div>
  );
};

export default ExpenseList;
