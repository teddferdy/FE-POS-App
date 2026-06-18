import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "react-query";
import { ArrowLeft, Eye, Store } from "lucide-react";
import { useCookies } from "react-cookie";
import { useTranslation } from "react-i18next";
import { getCashRegisterHistory } from "@/services/cash-register";
import { getAllLocation } from "@/services/location";
import AbortController from "@/components/organism/abort-controller";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import DataTable from "@/components/ui/DataTable";

const formatIDR = (num) => {
  if (!num && num !== 0) return "-";
  return "Rp " + Number(num).toLocaleString("id-ID");
};

const CashRegisterHistory = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [cookie] = useCookies();
  const user = cookie?.user;
  const isSuperAdmin = user?.roleType === "super_admin";
  const defaultStoreId = cookie?.activeStore || user?.store;
  const [selectedStore, setSelectedStore] = useState(defaultStoreId);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const { data: stores } = useQuery(["all-stores"], () => getAllLocation(), {
    enabled: isSuperAdmin
  });
  const storeList = stores?.data || stores || [];

  const { data, isLoading, isError, refetch } = useQuery(
    ["cash-register-history", page, limit, selectedStore],
    () => getCashRegisterHistory({ page, limit, store: selectedStore }),
    { keepPreviousData: true, enabled: !!selectedStore }
  );

  const items = data?.data || [];
  const total = data?.pagination?.total || 0;
  const totalPages = data?.pagination?.totalPages || 1;

  const statusCfg = {
    open: {
      label: t("page.cashRegister.history.statusOpen"),
      class: "bg-green-100 text-green-800"
    },
    closed: {
      label: t("page.cashRegister.history.statusClosed"),
      class: "bg-gray-100 text-gray-800"
    }
  };

  const columns = [
    {
      header: t("page.cashRegister.history.store"),
      render: (item) => (
        <div className="text-sm">
          <div>{item.storeData?.name || "-"}</div>
          {item.storeData?.address && (
            <div className="text-[10px] text-muted-foreground">
              {[item.storeData.address, item.storeData.city].filter(Boolean).join(", ")}
            </div>
          )}
        </div>
      )
    },
    {
      header: t("page.cashRegister.history.openedBy"),
      render: (item) => <span className="text-sm">{item.userData?.fullName || "-"}</span>
    },
    {
      header: t("page.cashRegister.history.open"),
      render: (item) => (
        <div className="text-xs">
          <div>{new Date(item.openedAt).toLocaleDateString("id")}</div>
          <div className="text-muted-foreground">
            {new Date(item.openedAt).toTimeString().slice(0, 8)}
          </div>
        </div>
      )
    },
    {
      header: t("page.cashRegister.history.closed"),
      render: (item) => (
        <div className="text-xs">
          {item.closedAt ? (
            <>
              <div>{new Date(item.closedAt).toLocaleDateString("id")}</div>
              <div className="text-muted-foreground">
                {new Date(item.closedAt).toTimeString().slice(0, 8)}
              </div>
            </>
          ) : (
            <span className="text-muted-foreground">-</span>
          )}
        </div>
      )
    },
    {
      header: t("page.cashRegister.history.openingBalance"),
      align: "right",
      render: (item) => <span className="font-mono text-sm">{formatIDR(item.openingBalance)}</span>
    },
    {
      header: t("page.cashRegister.history.sales"),
      align: "right",
      render: (item) => <span className="font-mono text-sm">{formatIDR(item.totalSales)}</span>
    },
    {
      header: t("page.cashRegister.history.expenses"),
      align: "right",
      render: (item) => <span className="font-mono text-sm">{formatIDR(item.totalExpenses)}</span>
    },
    {
      header: t("page.cashRegister.history.closingBalance"),
      align: "right",
      render: (item) => <span className="font-mono text-sm">{formatIDR(item.closingBalance)}</span>
    },
    {
      header: t("page.cashRegister.history.status"),
      align: "center",
      render: (item) => {
        const sc = statusCfg[item.status] || statusCfg.closed;
        return (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${sc.class}`}>
            {sc.label}
          </span>
        );
      }
    },
    {
      header: t("page.cashRegister.history.action"),
      align: "right",
      render: (item) => (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-primary"
          onClick={(e) => {
            e.stopPropagation();
            navigate("/cash-register/history/detail", { state: { item } });
          }}>
          <Eye size={15} />
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <button
          onClick={() => navigate("/dashboard-super-admin")}
          className="hover:text-foreground">
          {t("page.cashRegister.history.breadcrumbDashboard")}
        </button>
        <span className="text-xs">/</span>
        <button
          onClick={() => navigate("/cash-register/current")}
          className="hover:text-foreground">
          {t("page.cashRegister.history.breadcrumbCashier")}
        </button>
        <span className="text-xs">/</span>
        <span className="text-primary font-semibold">
          {t("page.cashRegister.history.breadcrumb")}
        </span>
      </nav>
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t("page.cashRegister.history.title")}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("page.cashRegister.history.desc")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isSuperAdmin && (
            <div className="w-56">
              <Select
                value={String(selectedStore)}
                onValueChange={(v) => {
                  setSelectedStore(Number(v));
                  setPage(1);
                }}>
                <SelectTrigger className="h-9 text-sm">
                  <Store size={14} className="mr-1" />
                  <SelectValue placeholder={t("page.cashRegister.history.selectStore")} />
                </SelectTrigger>
                <SelectContent>
                  {storeList.map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <Button
            variant="outline"
            onClick={() => navigate("/cash-register/current")}
            className="shrink-0 gap-2">
            <ArrowLeft size={16} /> {t("page.cashRegister.history.back")}
          </Button>
        </div>
      </div>

      {isError ? (
        <AbortController refetch={refetch} />
      ) : (
        <div>
          <DataTable
            columns={columns}
            data={items}
            isLoading={isLoading}
            emptyMessage={t("page.cashRegister.history.empty")}
            onRowClick={(item) => navigate("/cash-register/history/detail", { state: { item } })}
            pagination={{ page, totalPages, total, onPageChange: setPage }}
          />
        </div>
      )}
    </div>
  );
};

export default CashRegisterHistory;
