import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { useCookies } from "react-cookie";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { Plus, Eye, Edit, Trash2 } from "lucide-react";
import { canAccess } from "@/utils/permission";
import { getAllBom, deleteBom } from "@/services/bom";
import { getAllLocation } from "@/services/location";
import AbortController from "@/components/organism/abort-controller";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/SearchInput";
import DataTable from "@/components/ui/DataTable";
import { Loading } from "@/components/ui/loading";
import Modal from "@/components/organism/modal";
import NoStore from "@/components/ui/NoStore";

const BomList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [cookie] = useCookies();
  const user = cookie?.user;
  const isSuperAdmin = user?.roleType === "super_admin";
  const MENU_KEY = "/bom";
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: locData } = useQuery(["locations-bom"], () => getAllLocation(), {
    
    enabled: isSuperAdmin
  });

  const { data, isLoading, isFetching, isError, refetch } = useQuery(
    ["bom-list", page, limit, search, statusFilter],
    () => getAllBom({ page, limit, search, status: statusFilter }),
    { }
  );

  const items = data?.data || [];
  const total = data?.pagination?.total || 0;
  const totalPages = data?.pagination?.totalPages || 1;

  const deleteMut = useMutation(() => deleteBom(deleteTarget), {
    onSuccess: () => {
      toast.success(t("page.bom.list.toast.success"), {
        description: t("page.bom.list.toast.successDesc")
      });
      queryClient.invalidateQueries(["bom-list"]);
      setDeleteTarget(null);
    },
    onError: (err) =>
      toast.error(t("page.bom.list.toast.error"), {
        description: err?.response?.data?.message || err.message
      })
  });

  const columns = [
    {
      header: t("page.bom.list.table.name"),
      render: (item) => (
        <span className="font-medium text-sm">{item.name || `BOM #${item.id}`}</span>
      )
    },
    {
      header: t("page.bom.list.table.product"),
      render: (item) => (
        <div>
          <p className="text-sm font-medium">{item.productData?.nameProduct || "-"}</p>
          <p className="text-xs text-muted-foreground">{item.productData?.sku || ""}</p>
        </div>
      )
    },
    {
      header: t("page.bom.list.table.totalItems"),
      align: "center",
      render: (item) => <span className="font-mono text-sm">{item.lines?.length || 0}</span>
    },
    {
      header: t("page.bom.list.table.totalQty"),
      align: "center",
      render: (item) => <span className="font-mono text-sm">{item.totalQty || 0}</span>
    },
    {
      header: t("page.bom.list.table.notes"),
      render: (item) => (
        <span className="text-xs text-muted-foreground max-w-[150px] truncate block">
          {item.notes || "-"}
        </span>
      )
    },
    {
      header: t("page.bom.list.table.actions"),
      align: "right",
      render: (item) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-primary"
            onClick={() => navigate(`/bom/detail?id=${item.id}`)}>
            <Eye size={18} />
          </Button>
          {canAccess(user, MENU_KEY, "edit") && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-primary"
              onClick={() => navigate(`/bom/add?id=${item.id}`)}>
              <Edit size={18} />
            </Button>
          )}
          {canAccess(user, MENU_KEY, "delete") && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive"
              onClick={() => setDeleteTarget(item.id)}>
              <Trash2 size={18} />
            </Button>
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
          <span className="text-primary font-semibold">{t("breadcrumb.bom")}</span>
        </nav>
      </div>
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t("page.bom.list.title")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t("page.bom.list.description")}</p>
        </div>
        {canAccess(user, MENU_KEY, "add") && (
          <Button onClick={() => navigate("/bom/add")} className="shrink-0 gap-2">
            <Plus size={16} /> {t("page.bom.list.addButton")}
          </Button>
        )}
      </div>

      {locData && (locData?.data || []).length === 0 ? (
        <NoStore />
      ) : (
        <>
          {isError ? (
            <AbortController refetch={refetch} />
          ) : (
            <div data-tour="bom-table" className="mt-6">
              <DataTable
                columns={columns}
                data={items}
                isLoading={isLoading}
                emptyMessage={t("page.bom.list.empty")}
                toolbar={
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 w-full">
                    <h4 className="text-base font-semibold text-foreground">
                      {t("page.bom.list.title")}
                    </h4>
                    <div className="flex items-center gap-3 w-full md:w-auto">
                      <select
                        value={statusFilter}
                        onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                        className="h-9 px-3 bg-background border border-input rounded-lg text-sm focus:ring-2 focus:ring-ring outline-none">
                        <option value="all">{t("common.all")}</option>
                        <option value="active">{t("common.active")}</option>
                        <option value="inactive">{t("common.inactive")}</option>
                        <option value="draft">{t("common.draft")}</option>
                      </select>
                      <SearchInput
                        value={search}
                        onChange={(val) => { setSearch(val); setPage(1); }}
                        placeholder={t("page.bom.list.searchPlaceholder")}
                        isLoading={isFetching}
                        resultCount={total}
                      />
                    </div>
                  </div>
                }
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
            type="confirm"
            open={!!deleteTarget}
            onOpenChange={(o) => !o && setDeleteTarget(null)}
            title={t("page.bom.list.modal.deleteTitle")}
            description={t("page.bom.list.modal.deleteDescription")}
            confirmText={t("page.bom.list.modal.confirmDelete")}
            loading={deleteMut.isLoading}
            onConfirm={() => deleteMut.mutate()}
          />
          {deleteMut.isLoading && <Loading fullscreen size="lg" label={t("common.loadingData")} />}
        </>
      )}
    </div>
  );
};

export default BomList;
