import React, { useState } from "react";
import { useQuery } from "react-query";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { Plus, Search, Edit, Tag, DollarSign } from "lucide-react";
import { getAllExpenses } from "@/services/expense";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import DataTable from "@/components/ui/DataTable";

const ExpenseList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [cookie] = useCookies();
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");

  const user = cookie?.user;
  const locationParam = user?.store || "";

  const { data, isLoading } = useQuery(
    ["expenses", page, limit],
    () => getAllExpenses({ location: locationParam, page, limit }),
    { keepPreviousData: true }
  );

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

  const filtered = expenses.filter(
    (item) =>
      !search ||
      item.description?.toLowerCase().includes(search.toLowerCase()) ||
      item.category?.name?.toLowerCase().includes(search.toLowerCase())
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
    const isPending = status === "need approve" || status === "pending";
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          isPending ? "bg-orange-100 text-orange-800" : "bg-green-100 text-green-800"
        }`}>
        {isPending ? "Perlu Approve" : "Disetujui"}
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
      render: (item) => item.category?.name || "-"
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
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-primary"
            onClick={() => navigate(`/edit-expense?id=${item.id || item._id}`)}>
            <Edit size={15} />
          </Button>
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
        <Button onClick={() => navigate("/add-expense")} className="gap-2">
          <Plus size={18} />
          {t("page.expense.button.add")}
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5">
          <p className="text-sm text-muted-foreground">Total Biaya</p>
          <p className="text-2xl font-bold text-foreground mt-1">{total}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-muted-foreground">Perlu Approve</p>
          <p className="text-2xl font-bold text-orange-600 mt-1">{pendingExpenses}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-muted-foreground">Disetujui</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{approvedExpenses}</p>
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
        emptyMessage="Tidak ada biaya ditemukan"
        emptyIcon={DollarSign}
        pagination={{ page, totalPages, total, onPageChange: setPage }}
      />
    </div>
  );
};

export default ExpenseList;
