import React, { useState } from "react";
import { useGlobalStoreFilter } from "@/hooks/useGlobalStoreFilter";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { Eye, Receipt, Plus, RotateCcw, X, Coins } from "lucide-react";
import { useCookies } from "react-cookie";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { getCashRegisterHistory, closeCashRegister } from "@/services/cash-register";
import { getAllLocation } from "@/services/location";
import AbortController from "@/components/organism/abort-controller";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SearchInput } from "@/components/ui/SearchInput";
import DataTable from "@/components/ui/DataTable";
import StoreFilter from "@/components/ui/StoreFilter";
import { Skeleton } from "@/components/ui/skeleton";
import PageHeader from "@/components/ui/PageHeader";
import Modal from "@/components/organism/modal";

const formatIDR = (num) => {
  if (!num && num !== 0) return "-";
  return "Rp " + Number(num).toLocaleString("id-ID");
};

const parseIDR = (str) => {
  if (!str) return 0;
  return Number(str.replace(/[^0-9]/g, "")) || 0;
};

const CashRegisterHistory = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [cookie] = useCookies();
  const user = cookie?.user;
  const isSuperAdmin = user?.roleType === "super_admin";
  // const defaultStoreId = cookie?.activeStore || user?.store;
  const [storeFilter, setGlobalStoreFilter] = useGlobalStoreFilter();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [closeTarget, setCloseTarget] = useState(null);
  const [rawClosing, setRawClosing] = useState("0");
  const closingBalance = parseIDR(rawClosing);

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

  const closeMut = useMutation(
    () =>
      closeCashRegister(closeTarget?.id, {
        storeId: closeTarget?.store || closeTarget?.storeData?.id,
        closedBy: user?.id,
        closingBalance
      }),
    {
      onSuccess: () => {
        toast.success(t("page.cashRegister.history.closeSuccess"));
        queryClient.invalidateQueries(["cash-register-history"]);
        queryClient.invalidateQueries(["cash-register-current"]);
        setCloseTarget(null);
        setRawClosing("0");
        refetch();
      },
      onError: (err) =>
        toast.error(t("page.cashRegister.history.closeFail"), {
          description: err?.response?.data?.message || err.message
        })
    }
  );

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
      render: (item) => {
        const d = item.openedAt ? new Date(item.openedAt) : null;
        const valid = d && !isNaN(d.getTime());
        return (
          <div className="text-xs">
            <div>{valid ? d.toLocaleDateString("id") : "-"}</div>
            <div className="text-muted-foreground">
              {valid ? d.toTimeString().slice(0, 8) : ""}
            </div>
          </div>
        );
      }
    },
    {
      header: t("page.cashRegister.history.closed"),
      render: (item) => (
        <div className="text-xs">
          {item.closedAt && !isNaN(new Date(item.closedAt).getTime()) ? (
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
      legend: [
        { icon: Eye, label: t("common.view") },
        { icon: X, label: t("page.cashRegister.history.closeRegister") }
      ],
      render: (item) => (
        <div className="flex items-center justify-end gap-1">
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
          {item.status === "open" && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                const expected =
                  (item.openingBalance || 0) + (item.totalSales || 0) - (item.totalExpenses || 0);
                setRawClosing(String(expected > 0 ? Math.round(expected) : 0));
                setCloseTarget(item);
              }}>
              <X size={18} />
            </Button>
          )}
        </div>
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
              <div className="flex flex-wrap lg:flex-nowrap items-end gap-3 w-full">
                <h4 className="text-base font-semibold text-foreground shrink-0 self-center mr-1">
                  {t("page.cashRegister.history.title")}
                </h4>
                {isLoadingLocations || isLoading ? (
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Skeleton className="h-9 flex-1 rounded-md" />
                    {isSuperAdmin && <Skeleton className="h-9 w-44 rounded-md" />}
                    <Skeleton className="h-9 w-24 rounded-md" />
                  </div>
                ) : (
                  <>
                    <div className="flex-1 min-w-[160px]">
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
                    </div>
                    {isSuperAdmin && (
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                          Store
                        </label>
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
                    )}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        &nbsp;
                      </label>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-9 gap-1.5"
                        onClick={resetFilters}
                        disabled={!isFiltered}>
                        <RotateCcw size={14} />
                        {t("common.resetFilter")}
                      </Button>
                    </div>
                  </>
                )}
                <Button
                  variant="default"
                  onClick={() => navigate("/cash-register/open-close")}
                  className="shrink-0 gap-2">
                  <Plus size={16} /> {t("page.cashRegister.history.openRegister")}
                </Button>
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

      <Modal
        type="form"
        open={!!closeTarget}
        onOpenChange={(o) => !o && setCloseTarget(null)}
        title={t("page.cashRegister.history.closeRegister")}
        description={t("page.cashRegister.history.closeDesc")}
        confirmText={t("page.cashRegister.history.closeConfirm")}
        loading={closeMut.isLoading}
        onConfirm={() => closeMut.mutate()}>
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            {t("page.cashRegister.current.closingBalance")}{" "}
            <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-muted-foreground pointer-events-none">
              <Coins size={16} />
            </div>
            <Input
              type="text"
              inputMode="numeric"
              value={formatIDR(rawClosing === "0" ? "" : rawClosing)}
              placeholder={t("page.cashRegister.current.placeholder")}
              onChange={(e) => {
                const cleaned = e.target.value.replace(/[^0-9]/g, "");
                setRawClosing(cleaned || "0");
              }}
              className="pl-10 h-12 text-lg font-semibold tabular-nums"
              autoFocus
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CashRegisterHistory;
