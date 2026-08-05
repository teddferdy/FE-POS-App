import React, { useState } from "react";
import { useGlobalStoreFilter } from "@/hooks/useGlobalStoreFilter";
import { useNavigate } from "react-router-dom";
import { useQuery } from "react-query";
import { Eye, Receipt, Plus } from "lucide-react";
import { useCookies } from "react-cookie";
import { useTranslation } from "react-i18next";
import { getCashRegisterHistory } from "@/services/cash-register";
import { getAllLocation } from "@/services/location";
import AbortController from "@/components/organism/abort-controller";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/SearchInput";
import DataTable from "@/components/ui/DataTable";
import TableToolbar from "@/components/ui/TableToolbar";
import StoreFilter from "@/components/ui/StoreFilter";
import { Skeleton } from "@/components/ui/skeleton";
import PageHeader from "@/components/ui/PageHeader";

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
  // const defaultStoreId = cookie?.activeStore || user?.store;
  const [storeFilter, setGlobalStoreFilter] = useGlobalStoreFilter();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");

  const isFiltered = search !== "" || storeFilter !== "all";

  const resetFilters = () => {
    setSearch("");
    setGlobalStoreFilter("all");
    setPage(1);
  };

  const { data: locData, isLoading: isLoadingLocations } = useQuery(
    ["locations-cat"],
    () => getAllLocation(),
    {
      enabled: isSuperAdmin
    }
  );

  const { data, isLoading, isFetching, isError, refetch } = useQuery(
    ["cash-register-history", page, limit, search, storeFilter],
    () =>
      getCashRegisterHistory({
        page,
        limit,
        search: search || undefined,
        store: storeFilter === "all" ? undefined : storeFilter
      }),
    { keepPreviousData: true }
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
      legend: [{ icon: Eye, label: t("common.view") }],
      render: (item) => (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-primary"
          onClick={(e) => {
            e.stopPropagation();
            navigate("/cash-register/history/detail", { state: { item } });
          }}>
          <Eye size={18} />
        </Button>
      )
    }
  ];

  const breadcrumbs = isSuperAdmin
    ? [
        {
          href: "/dashboard-super-admin",
          i18nKey: "page.cashRegister.history.breadcrumbDashboard"
        },
        { i18nKey: "page.cashRegister.history.breadcrumb" }
      ]
    : [
        {
          href: "/dashboard-super-admin",
          i18nKey: "page.cashRegister.history.breadcrumbDashboard"
        },
        {
          href: "/cash-register/current",
          i18nKey: "page.cashRegister.history.breadcrumbCashier"
        },
        { i18nKey: "page.cashRegister.history.breadcrumb" }
      ];

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={breadcrumbs}
        title={t("page.cashRegister.history.title")}
        description={t("page.cashRegister.history.desc")}
      />

      {isError ? (
        <AbortController refetch={refetch} />
      ) : (
        <div>
          <DataTable
            columns={columns}
            data={items}
            isLoading={isLoading}
            emptyMessage={t("page.cashRegister.history.empty")}
            emptyIcon={Receipt}
            toolbar={
              <div className="flex flex-col gap-3 w-full">
                <div className="flex flex-col lg:flex-row lg:items-end gap-3 w-full">
                  <div className="flex-1 min-w-0 w-full">
                    <TableToolbar
                      title={t("page.cashRegister.history.title")}
                      onReset={resetFilters}
                      isFiltered={isFiltered}>
                      {isLoadingLocations || isLoading ? (
                        <div className="flex items-center gap-3 w-full md:w-auto">
                          <Skeleton className="h-9 w-64 rounded-md" />
                          <Skeleton className="h-9 w-48 rounded-md" />
                        </div>
                      ) : (
                        <>
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                              Cari
                            </label>
                            <SearchInput
                              value={search}
                              onChange={(val) => {
                                setSearch(val);
                                setPage(1);
                              }}
                              placeholder={t("page.cashRegister.history.search")}
                              isLoading={isFetching}
                            />
                          </div>
                          {isSuperAdmin && (
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                                Store
                              </label>
                              <div className="w-44">
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
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </TableToolbar>
                  </div>
                  {!(isLoadingLocations || isLoading) && (
                    <Button
                      variant="default"
                      onClick={() => navigate("/cash-register/open-close")}
                      className="shrink-0 gap-2">
                      <Plus size={16} /> {t("page.cashRegister.history.openRegister")}
                    </Button>
                  )}
                </div>
              </div>
            }
            onRowClick={(item) => navigate("/cash-register/history/detail", { state: { item } })}
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
      )}
    </div>
  );
};

export default CashRegisterHistory;
