import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "react-query";
import { useTranslation } from "react-i18next";
import { Store } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import DataTable from "@/components/ui/DataTable";
import { AccessDenied } from "@/components/ui/RequireRole";
import { Button } from "@/components/ui/button";
import { getStoreConfigurations } from "@/services/location";
import { useStoreManagePermission } from "@/hooks/useStoreManagePermission";
import { STORE_CONFIGURATIONS_QUERY_KEY } from "@/lib/store-configuration";
import { StoreConfigurationSkeleton, StoreStatusPill, useCategoryLabel } from "./shared";

const DEFAULT_LIMIT = 20;

const StoreConfigurationTable = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const categoryLabel = useCategoryLabel();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);

  // Scope is resolved by the server from the canonical context; the request
  // carries only page and limit.
  const { data, isLoading, isError, error, refetch } = useQuery(
    [STORE_CONFIGURATIONS_QUERY_KEY, page, limit],
    () => getStoreConfigurations(page, limit),
    { keepPreviousData: true, retry: false, refetchOnWindowFocus: false }
  );

  if (error?.response?.status === 403) return <AccessDenied />;

  const rows = data?.data || [];
  const pagination = data?.pagination || {};

  const columns = [
    {
      header: t("page.location.table.storeId"),
      render: (row) => (
        <span className="font-mono text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded">
          {row.storeId}
        </span>
      )
    },
    {
      header: t("page.location.table.storeName"),
      render: (row) => <span className="font-medium text-foreground">{row.name}</span>
    },
    {
      header: t("page.location.table.category"),
      render: (row) => (
        <span className="text-sm text-foreground">{categoryLabel(row.category)}</span>
      )
    },
    {
      header: t("page.storeConfiguration.field.timezone"),
      render: (row) => <span className="text-sm text-muted-foreground">{row.timezone || "-"}</span>
    },
    {
      header: t("page.location.table.dailyTarget"),
      render: (row) => (
        <span className="text-sm tabular-nums text-foreground">
          {row.dailyTarget ? `Rp ${Number(row.dailyTarget).toLocaleString("id-ID")}` : "-"}
        </span>
      )
    },
    {
      header: t("page.location.table.status"),
      render: (row) => <StoreStatusPill status={row.status} />
    }
  ];

  return (
    <DataTable
      columns={columns}
      data={rows}
      rowKey={(row) => row.id}
      isLoading={isLoading}
      isError={isError}
      onRetry={() => refetch()}
      emptyMessage={t("page.storeConfiguration.list.empty")}
      emptyIcon={Store}
      onRowClick={(row) => navigate(`/store-configuration/${row.id}`)}
      pagination={{
        page: pagination.page || page,
        totalPages: pagination.totalPages || 1,
        total: pagination.total || 0,
        pageSize: limit,
        onPageChange: setPage,
        onPageSizeChange: (value) => {
          setLimit(Number(value) || DEFAULT_LIMIT);
          setPage(1);
        }
      }}
    />
  );
};

const StoreConfigurationList = () => {
  const { t } = useTranslation();
  const permission = useStoreManagePermission();

  if (permission.isLoading) return <StoreConfigurationSkeleton />;

  if (permission.isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
        <p className="text-sm text-muted-foreground">{t("common.loadError")}</p>
        <Button variant="outline" size="sm" onClick={() => permission.refetch()}>
          {t("common.retry")}
        </Button>
      </div>
    );
  }

  if (!permission.canManageStores) return <AccessDenied />;

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <PageHeader
        breadcrumbs={[
          {
            label: t("breadcrumb.home"),
            href: "/dashboard-super-admin",
            i18nKey: "breadcrumb.home"
          },
          { label: t("page.storeConfiguration.title"), i18nKey: "page.storeConfiguration.title" }
        ]}
        title={t("page.storeConfiguration.title")}
        description={t("page.storeConfiguration.list.description")}
      />
      <StoreConfigurationTable />
    </div>
  );
};

export default StoreConfigurationList;
