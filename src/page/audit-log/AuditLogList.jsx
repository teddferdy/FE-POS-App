import React, { useState, useCallback } from "react";
import { useGlobalStoreFilter } from "@/hooks/useGlobalStoreFilter";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Filter,
  Download,
  Clock,
  User,
  Database,
  RefreshCw,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/SearchInput";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { toast } from "sonner";
import { useQuery } from "react-query";
import StoreFilter from "@/components/ui/StoreFilter";
import { Skeleton } from "@/components/ui/skeleton";
import { getAllLocation } from "@/services/location";
import NoStore from "@/components/ui/NoStore";
import { getAuditLogs } from "@/services/auditLog";

const actionColors = {
  CREATE: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  UPDATE: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  DELETE: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  LOGIN: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  LOGOUT: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400",
  PAYMENT: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  REFUND: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  VOID: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
  PRINT: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
  EXPORT: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400",
  IMPORT: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
  STATUS_CHANGE: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
  SETTINGS_CHANGE: "bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400"
};

const ActionBadge = ({ action }) => {
  const colorClass = actionColors[action] || "bg-gray-100 text-gray-700";
  return (
    <Badge variant="secondary" className={`text-[10px] ${colorClass}`}>
      {action}
    </Badge>
  );
};

const AuditLogList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [cookie] = useCookies();
  const user = cookie?.user;
  const isSuperAdmin = user?.roleType === "super_admin";
  const store = cookie?.activeStore || cookie.user?.store;
  const [storeFilter, setGlobalStoreFilter] = useGlobalStoreFilter();
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [entityFilter, setEntityFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const { data: locData, isLoading: isLoadingLocations } = useQuery(
    ["locations-audit-log"],
    () => getAllLocation("all"),
    { enabled: isSuperAdmin }
  );

  const fetchParams = {
    page,
    pageSize,
    action: actionFilter || undefined,
    entity: entityFilter || undefined,
    search: search || undefined,
    ...(isSuperAdmin
      ? storeFilter === "all"
        ? {}
        : { store: storeFilter || store }
      : { store })
  };

  const {
    data: logsData,
    isLoading,
    isError,
    refetch
  } = useQuery(
    ["audit-logs", fetchParams],
    () => getAuditLogs(fetchParams),
    {
      enabled: isSuperAdmin || !!store,
      keepPreviousData: true,
      staleTime: 10000
    }
  );

  const logs = logsData?.data || [];
  const pagination = logsData?.pagination || { total: 0, totalPages: 1 };

  const handleFetch = useCallback(() => {
    refetch();
  }, [refetch]);

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });
  };

  const formatChanges = (oldVals, newVals) => {
    if (!oldVals && !newVals) return null;
    const changes = [];
    const allKeys = new Set([...Object.keys(oldVals || {}), ...Object.keys(newVals || {})]);
    for (const key of allKeys) {
      const oldV = oldVals?.[key];
      const newV = newVals?.[key];
      if (JSON.stringify(oldV) !== JSON.stringify(newV)) {
        changes.push(
          <div key={key} className="text-xs font-mono">
            <span className="text-red-500">− {key}: {JSON.stringify(oldV)}</span>
            <span className="text-green-500">+ {key}: {JSON.stringify(newV)}</span>
          </div>
        );
      }
    }
    return changes.length > 0 ? (
      <div className="mt-2 p-2 bg-muted/50 rounded text-xs font-mono max-h-32 overflow-auto">
        {changes}
      </div>
    ) : null;
  };

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
          <span className="text-primary font-semibold">{t("sidebar.auditLog")}</span>
        </nav>
      </div>

      <div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{t("sidebar.auditLog")}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {t("page.auditLog.description", { count: logs.length })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleFetch} disabled={isLoading}>
              {isLoading ? <RefreshCw size={14} className="animate-spin mr-1" /> : null}
              {t("page.auditLog.refresh")}
            </Button>
          </div>
        </div>
      </div>

      {locData && (locData?.data || []).length === 0 ? (
        <NoStore />
      ) : (
        <>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
            {isLoadingLocations ? (
              <>
                <Skeleton className="h-9 w-48 rounded-md" />
                <Skeleton className="h-9 w-full md:w-64 rounded-md" />
              </>
            ) : (
              <>
                {isSuperAdmin && (
                  <StoreFilter
                    locations={(locData?.data || []).filter((l) => l.status === "active")}
                    value={storeFilter}
                    onChange={(v) => setGlobalStoreFilter(v)}
                    isSuperAdmin={isSuperAdmin}
                    t={t}
                  />
                )}
                <div className="flex flex-col sm:flex-row gap-2 w-full">
                  <SearchInput
                    value={search}
                    onChange={setSearch}
                    placeholder={t("page.auditLog.searchPlaceholder")}
                    isLoading={isLoading}
                    className="flex-1"
                  />
                  <Select
                    value={actionFilter}
                    onChange={setActionFilter}
                    options={[
                      { value: "", label: t("page.auditLog.allActions") },
                      { value: "CREATE", label: "CREATE" },
                      { value: "UPDATE", label: "UPDATE" },
                      { value: "DELETE", label: "DELETE" },
                      { value: "PAYMENT", label: "PAYMENT" },
                      { value: "REFUND", label: "REFUND" },
                      { value: "VOID", label: "VOID" },
                      { value: "LOGIN", label: "LOGIN" },
                      { value: "STATUS_CHANGE", label: "STATUS_CHANGE" }
                    ]}
                    className="w-full sm:w-48"
                  />
                  <Select
                    value={entityFilter}
                    onChange={setEntityFilter}
                    options={[
                      { value: "", label: t("page.auditLog.allEntities") },
                      { value: "order", label: "Order" },
                      { value: "product", label: "Product" },
                      { value: "member", label: "Member" },
                      { value: "memberTier", label: "Member Tier" },
                      { value: "user", label: "User" },
                      { value: "payment", label: "Payment" },
                      { value: "cashRegister", label: "Cash Register" }
                    ]}
                    className="w-full sm:w-48"
                  />
                </div>
              </>
            )}
          </div>

          {isError ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Database size={40} className="text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-sm mb-4">{t("page.auditLog.loadFailed")}</p>
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                <RefreshCw size={14} className="mr-1" />
                {t("page.auditLog.retry")}
              </Button>
            </div>
          ) : isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((n) => (
                <div key={n} className="h-20 rounded-xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : logs.length === 0 ? (
            <Card className="p-12 text-center text-muted-foreground">
              {search || actionFilter || entityFilter
                ? t("page.auditLog.noMatching")
                : t("page.auditLog.noLogs")}
            </Card>
          ) : (
            <>
              <div className="space-y-3">
                {logs.map((log) => (
                  <Card key={log.id} className="p-4 border-l-4 border-l-primary">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            log.action === "CREATE" ? "bg-emerald-100 text-emerald-700" :
                            log.action === "UPDATE" ? "bg-blue-100 text-blue-700" :
                            log.action === "DELETE" ? "bg-red-100 text-red-700" :
                            log.action === "LOGIN" ? "bg-purple-100 text-purple-700" :
                            log.action === "PAYMENT" ? "bg-amber-100 text-amber-700" :
                            log.action === "REFUND" ? "bg-orange-100 text-orange-700" :
                            log.action === "VOID" ? "bg-rose-100 text-rose-700" :
                            log.action === "STATUS_CHANGE" ? "bg-violet-100 text-violet-700" :
                            "bg-gray-100 text-gray-700"
                          }`}>
                            {log.action}
                          </span>
                          <span className="font-bold text-sm font-mono text-primary">
                            {log.entity}
                            {log.entityId && <span className="text-muted-foreground">:#{log.entityId}</span>}
                          </span>
                          <span className="px-2 py-0.5 bg-muted text-[10px] rounded">
                            <Clock size={10} className="mr-1 inline" />
                            {new Date(log.createdAt).toLocaleString("id-ID")}
                          </span>
                        </div>
                        <div className="mt-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <User size={12} />
                            {log.userName || log.userId || t("page.auditLog.system")}
                          </span>
                          {log.description && (
                            <p className="mt-1 text-sm text-foreground">{log.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0 text-xs text-muted-foreground">
                        {log.ipAddress && <span>IP: {log.ipAddress}</span>}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-muted-foreground">
                    {t("page.auditLog.showing", {
                      start: (page - 1) * pageSize + 1,
                      end: Math.min(page * pageSize, pagination.total),
                      total: pagination.total
                    })}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      <ChevronLeft size={14} />
                    </Button>
                    <span className="px-3 text-sm">
                      {page} / {pagination.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                      disabled={page === pagination.totalPages}
                    >
                      <ChevronRight size={14} />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default AuditLogList;
