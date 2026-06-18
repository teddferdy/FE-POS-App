import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { useCookies } from "react-cookie";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { Plus, Search, Eye, Trash2 } from "lucide-react";
import { canAccess } from "@/utils/permission";
import { getAllBom, deleteBom } from "@/services/bom";
import AbortController from "@/components/organism/abort-controller";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DataTable from "@/components/ui/DataTable";
import Modal from "@/components/organism/modal";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

const BomList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [cookie] = useCookies();
  const user = cookie?.user;
  const MENU_KEY = "/bom";
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data, isLoading, isError, refetch } = useQuery(
    ["bom-list", page, limit, search],
    () => getAllBom({ page, limit, search }),
    { keepPreviousData: true }
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
            <Eye size={15} />
          </Button>
          {canAccess(user, MENU_KEY, "delete") && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive"
              onClick={() => setDeleteTarget(item.id)}>
              <Trash2 size={15} />
            </Button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <motion.div variants={fadeInUp} initial="hidden" animate="show">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <button
            onClick={() => navigate("/dashboard-super-admin")}
            className="hover:text-foreground">
            {t("breadcrumb.dashboard")}
          </button>
          <span className="text-xs">/</span>
          <span className="text-primary font-semibold">{t("breadcrumb.bom")}</span>
        </nav>
      </motion.div>
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="show"
        className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t("page.bom.list.title")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t("page.bom.list.description")}</p>
        </div>
        {canAccess(user, MENU_KEY, "add") && (
          <Button onClick={() => navigate("/bom/add")} className="shrink-0 gap-2">
            <Plus size={16} /> {t("page.bom.list.addButton")}
          </Button>
        )}
      </motion.div>

      {isError ? (
        <AbortController refetch={refetch} />
      ) : (
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}>
          <DataTable
            columns={columns}
            data={items}
            isLoading={isLoading}
            emptyMessage={t("page.bom.list.empty")}
            toolbar={
              <div className="relative w-full sm:w-64">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  placeholder={t("page.bom.list.searchPlaceholder")}
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="pl-9 h-9 text-sm"
                />
              </div>
            }
            pagination={{ page, totalPages, total, onPageChange: setPage }}
          />
        </motion.div>
      )}
      <Modal
        type="confirm"
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title={t("page.bom.list.modal.deleteTitle")}
        description={t("page.bom.list.modal.deleteDescription")}
        confirmText={t("page.bom.list.modal.confirmDelete")}
        onConfirm={() => deleteMut.mutate()}
      />
    </div>
  );
};

export default BomList;
