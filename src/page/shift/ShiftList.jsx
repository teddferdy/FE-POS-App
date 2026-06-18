import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { toast } from "sonner";
import { Plus, Search, Edit, Trash2, Clock } from "lucide-react";
import { useTranslation } from "react-i18next";
import { getAllShift, deleteShift } from "@/services/shift";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import DataTable from "@/components/ui/DataTable";
import Modal from "@/components/organism/modal";
import { canAccess } from "@/utils/permission";
import AbortController from "@/components/organism/abort-controller";

const ShiftList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [cookie] = useCookies();
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);

  const user = cookie?.user;
  const MENU_KEY = "/shift-list";
  const locationParam = user?.store || "";

  const { data, isLoading, isError, refetch } = useQuery(
    ["shifts", page, limit, search],
    () => getAllShift({ store: locationParam, page, limit, statusShift: search }),
    { keepPreviousData: true }
  );

  const deleteMutation = useMutation(deleteShift, {
    onSuccess: () => {
      toast.success(t("common.success"), { description: t("page.shift.toast.deleteSuccess") });
      queryClient.invalidateQueries(["shifts"]);
    },
    onError: (err) => {
      toast.error(t("common.failed"), { description: err?.response?.data?.message || err.message });
    }
  });

  const shifts = data?.data || [];
  const pagination = data?.pagination || {};
  const total = pagination?.total || pagination?.totalItems || data?.total || 0;
  const totalPages = pagination?.totalPages || Math.ceil(total / limit) || 1;

  const handleDelete = (shift) => {
    setDeleteTarget(shift);
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      deleteMutation.mutate({ id: deleteTarget.id });
      setDeleteTarget(null);
    }
  };

  const columns = [
    {
      header: t("page.shift.table.name"),
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
            {row.nama_shift?.charAt(0)?.toUpperCase() || "S"}
          </div>
          <span className="font-medium text-foreground">{row.nama_shift || "-"}</span>
        </div>
      )
    },
    { header: t("page.shift.table.startTime"), accessor: "jam_mulai" },
    { header: t("page.shift.table.endTime"), accessor: "jam_selesai" },
    {
      header: t("page.shift.table.status"),
      render: (row) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            row.status === "Aktif" || row.status === 1 || row.status === true
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}>
          {row.status === "Aktif" || row.status === 1 || row.status === true
            ? t("common.active")
            : t("common.inactive")}
        </span>
      )
    },
    {
      header: t("common.actions"),
      align: "right",
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          {canAccess(user, MENU_KEY, "edit") && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-primary"
              onClick={() => navigate(`/edit-shift?id=${row.id || row._id}`)}>
              <Edit size={15} />
            </Button>
          )}
          {canAccess(user, MENU_KEY, "delete") && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive"
              onClick={() => handleDelete(row)}>
              <Trash2 size={15} />
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
          <span className="text-primary font-semibold">{t("page.shift.list.title")}</span>
        </nav>
      </div>

      <div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{t("page.shift.list.title")}</h1>
            <p className="text-sm text-muted-foreground mt-1">{t("page.shift.list.description")}</p>
          </div>
          {canAccess(user, MENU_KEY, "add") && (
            <Button onClick={() => navigate("/add-shift")} className="gap-2" data-tour="shift-add">
              <Plus size={18} />
              {t("breadcrumb.add")}
            </Button>
          )}
        </div>
      </div>

      {isError ? (
        <AbortController refetch={refetch} />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Card className="p-5">
                <p className="text-sm text-muted-foreground">{t("page.shift.table.name")}</p>
                <p className="text-2xl font-bold text-foreground mt-1">{total}</p>
              </Card>
            </div>
            <div>
              <Card className="p-5">
                <p className="text-sm text-muted-foreground">{t("common.active")}</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{data?.stats?.active ?? 0}</p>
              </Card>
            </div>
            <div>
              <Card className="p-5">
                <p className="text-sm text-muted-foreground">{t("common.inactive")}</p>
                <p className="text-2xl font-bold text-red-600 mt-1">{data?.stats?.inactive ?? 0}</p>
              </Card>
            </div>
          </div>

          <div>
            <div className="relative w-full sm:w-72">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                placeholder={t("page.shift.list.search")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 text-sm"
              />
            </div>
          </div>

          <div data-tour="shift-table">
            <DataTable
              columns={columns}
              data={shifts}
              isLoading={isLoading}
              emptyIcon={Clock}
              emptyMessage={t("page.shift.list.empty")}
              pagination={{ page, totalPages, total, onPageChange: (p) => setPage(p) }}
            />
          </div>
        </>
      )}
      <Modal
        type="confirm"
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={t("modal.confirmDelete")}
        description={`${t("common.delete")} ${deleteTarget?.nama_shift || ""}?`}
        confirmText={t("common.delete")}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default ShiftList;
