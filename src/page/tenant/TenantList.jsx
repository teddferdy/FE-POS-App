import React, { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Building2, Pencil, Plus } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import DataTable from "@/components/ui/DataTable";
import { AccessDenied } from "@/components/ui/RequireRole";
import { SearchInput } from "@/components/ui/SearchInput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { createTenant, getTenants, updateTenant } from "@/services/tenant";
import { useTenantManagePermission } from "@/hooks/useTenantManagePermission";

export const TENANTS_QUERY_KEY = "tenants";
const DEFAULT_LIMIT = 20;
const P = "page.tenant";

// Mirrors the BE contract: 1-50 lowercase letters/digits, inner hyphens only.
const CODE_PATTERN = /^[a-z0-9](?:[a-z0-9-]{0,48}[a-z0-9])?$/;

// "Warung Bakso Pak Kumis" → "warung-bakso-pak-kumis" (suggestion only; the
// code stays editable until the tenant is created, immutable afterwards).
export const suggestTenantCode = (name) =>
  (name || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50)
    .replace(/-+$/g, "");

const STATUS_TONES = {
  active: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
  suspended: "bg-destructive/10 text-destructive border-destructive/20"
};

const TenantStatusPill = ({ status }) => {
  const { t } = useTranslation();
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
        STATUS_TONES[status] || STATUS_TONES.suspended
      }`}>
      {t(`${P}.status.${status}`, { defaultValue: status })}
    </span>
  );
};

// BE error codes → field-level message keys.
const errorMessage = (t, error) => {
  const code = error?.response?.data?.code;
  if (code === "TENANT_CODE_TAKEN") return { field: "code", message: t(`${P}.error.codeTaken`) };
  if (code === "INVALID_CODE") return { field: "code", message: t(`${P}.error.invalidCode`) };
  if (code === "INVALID_NAME") return { field: "name", message: t(`${P}.error.invalidName`) };
  if (error?.response?.status === 403) return { field: null, message: t(`${P}.error.forbidden`) };
  return { field: null, message: t(`${P}.error.generic`) };
};

const TenantFormDialog = ({ open, tenant, onClose }) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const isEdit = !!tenant;
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [codeTouched, setCodeTouched] = useState(false);
  const [status, setStatus] = useState("active");
  const [fieldError, setFieldError] = useState({ field: null, message: null });

  useEffect(() => {
    if (!open) return;
    setName(tenant?.name || "");
    setCode(tenant?.code || "");
    setCodeTouched(false);
    setStatus(tenant?.status || "active");
    setFieldError({ field: null, message: null });
  }, [open, tenant]);

  const mutation = useMutation(
    () =>
      isEdit
        ? updateTenant(tenant.id, {
            ...(name.trim() !== tenant.name ? { name: name.trim() } : {}),
            ...(status !== tenant.status ? { status } : {})
          })
        : createTenant({ code: code.trim(), name: name.trim() }),
    {
      onSuccess: () => {
        toast.success(t(isEdit ? `${P}.toast.updated` : `${P}.toast.created`));
        queryClient.invalidateQueries(TENANTS_QUERY_KEY);
        onClose();
      },
      onError: (error) => {
        const mapped = errorMessage(t, error);
        setFieldError(mapped);
        if (!mapped.field) toast.error(mapped.message);
      }
    }
  );

  const nameValid = name.trim().length > 0 && name.trim().length <= 100;
  const codeValid = isEdit || CODE_PATTERN.test(code.trim());
  const changed = !isEdit || name.trim() !== tenant.name || status !== tenant.status;
  const canSubmit = nameValid && codeValid && changed && !mutation.isLoading;

  const onNameChange = (value) => {
    setName(value);
    if (!isEdit && !codeTouched) setCode(suggestTenantCode(value));
    if (fieldError.field === "name") setFieldError({ field: null, message: null });
  };

  const submit = (e) => {
    e.preventDefault();
    if (canSubmit) mutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && !mutation.isLoading && onClose()}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={submit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>{t(isEdit ? `${P}.form.editTitle` : `${P}.form.createTitle`)}</DialogTitle>
            <DialogDescription>
              {t(isEdit ? `${P}.form.editDescription` : `${P}.form.createDescription`)}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-1.5">
            <Label htmlFor="tenant-name">{t(`${P}.form.name`)}</Label>
            <Input
              id="tenant-name"
              value={name}
              maxLength={100}
              autoComplete="off"
              placeholder={t(`${P}.form.namePlaceholder`)}
              aria-invalid={fieldError.field === "name" || undefined}
              onChange={(e) => onNameChange(e.target.value)}
            />
            {fieldError.field === "name" && (
              <p role="alert" className="text-sm text-destructive">
                {fieldError.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="tenant-code">{t(`${P}.form.code`)}</Label>
            <Input
              id="tenant-code"
              value={code}
              maxLength={50}
              autoComplete="off"
              disabled={isEdit}
              placeholder="warung-bakso"
              aria-invalid={fieldError.field === "code" || (!codeValid && code !== "") || undefined}
              aria-describedby="tenant-code-hint"
              className="font-mono"
              onChange={(e) => {
                setCode(e.target.value.toLowerCase());
                setCodeTouched(true);
                if (fieldError.field === "code") setFieldError({ field: null, message: null });
              }}
            />
            {fieldError.field === "code" ? (
              <p id="tenant-code-hint" role="alert" className="text-sm text-destructive">
                {fieldError.message}
              </p>
            ) : (
              <p id="tenant-code-hint" className="text-xs text-muted-foreground">
                {t(isEdit ? `${P}.form.codeImmutable` : `${P}.form.codeHint`)}
              </p>
            )}
          </div>

          {isEdit && (
            <div className="space-y-1.5">
              <Label htmlFor="tenant-status">{t(`${P}.form.status`)}</Label>
              <select
                id="tenant-status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                <option value="active">{t(`${P}.status.active`)}</option>
                <option value="suspended">{t(`${P}.status.suspended`)}</option>
              </select>
              {status === "suspended" && tenant.status !== "suspended" && (
                <p role="alert" className="text-sm text-amber-700 dark:text-amber-400">
                  {t(`${P}.form.suspendWarning`)}
                </p>
              )}
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={mutation.isLoading}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={!canSubmit}>
              {mutation.isLoading ? t(`${P}.form.saving`) : t(`${P}.form.save`)}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const TenantTable = ({ onEdit }) => {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const { data, isLoading, isFetching, isError, error, refetch } = useQuery(
    [TENANTS_QUERY_KEY, page, limit, search, status],
    () => getTenants({ page, limit, search, status }),
    { keepPreviousData: true, retry: false, refetchOnWindowFocus: false }
  );

  if (error?.response?.status === 403) return <AccessDenied />;

  const rows = data?.data || [];
  const pagination = data?.pagination || {};

  const columns = [
    {
      header: t(`${P}.table.code`),
      render: (row) => (
        <span className="font-mono text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded">
          {row.code}
        </span>
      )
    },
    {
      header: t(`${P}.table.name`),
      render: (row) => <span className="font-medium text-foreground">{row.name}</span>
    },
    {
      header: t(`${P}.table.stores`),
      render: (row) => <span className="text-sm tabular-nums">{row.storeCount}</span>
    },
    {
      header: t(`${P}.table.members`),
      render: (row) => <span className="text-sm tabular-nums">{row.activeMemberCount}</span>
    },
    {
      header: t(`${P}.table.status`),
      render: (row) => <TenantStatusPill status={row.status} />
    },
    {
      header: t(`${P}.table.actions`),
      render: (row) => (
        <Button
          variant="ghost"
          size="sm"
          aria-label={t(`${P}.action.editNamed`, { name: row.name })}
          onClick={(e) => {
            e.stopPropagation();
            onEdit(row);
          }}>
          <Pencil size={14} aria-hidden="true" />
          <span className="ml-1.5">{t(`${P}.action.edit`)}</span>
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <SearchInput
          value={search}
          onChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          isLoading={isFetching && !isLoading}
          placeholder={t(`${P}.searchPlaceholder`)}
          className="sm:max-w-xs"
        />
        <select
          aria-label={t(`${P}.table.status`)}
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm sm:w-44">
          <option value="all">{t(`${P}.status.all`)}</option>
          <option value="active">{t(`${P}.status.active`)}</option>
          <option value="suspended">{t(`${P}.status.suspended`)}</option>
        </select>
      </div>
      <DataTable
        columns={columns}
        data={rows}
        rowKey={(row) => row.id}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
        emptyMessage={t(`${P}.empty`)}
        emptyIcon={Building2}
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
    </div>
  );
};

const TenantList = () => {
  const { t } = useTranslation();
  const permission = useTenantManagePermission();
  const [dialog, setDialog] = useState({ open: false, tenant: null });

  if (permission.isLoading) {
    return (
      <div className="mx-auto w-full max-w-5xl space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

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

  if (!permission.canManageTenants) return <AccessDenied />;

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <PageHeader
          breadcrumbs={[
            {
              label: t("breadcrumb.home"),
              href: "/dashboard-super-admin",
              i18nKey: "breadcrumb.home"
            },
            { label: t(`${P}.title`), i18nKey: `${P}.title` }
          ]}
          title={t(`${P}.title`)}
          description={t(`${P}.description`)}
        />
        <Button onClick={() => setDialog({ open: true, tenant: null })} className="shrink-0">
          <Plus size={16} aria-hidden="true" />
          <span className="ml-1.5">{t(`${P}.action.create`)}</span>
        </Button>
      </div>
      <TenantTable onEdit={(tenant) => setDialog({ open: true, tenant })} />
      <TenantFormDialog
        open={dialog.open}
        tenant={dialog.tenant}
        onClose={() => setDialog({ open: false, tenant: null })}
      />
    </div>
  );
};

export default TenantList;
