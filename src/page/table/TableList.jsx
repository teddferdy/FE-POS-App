import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { toast } from "sonner";
import { Plus, Search, Edit, Trash2, Sofa, QrCode } from "lucide-react";
import { getTablesByStore, addTable, editTable, deleteTable } from "@/services/table";
import { getAllLocation } from "@/services/location";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DataTable from "@/components/ui/DataTable";
import Modal from "@/components/organism/modal";
import TableQRModal from "@/components/organism/TableQRModal";
import { useTranslation } from "react-i18next";
import { canAccess } from "@/utils/permission";

const statusColors = {
  available: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
  occupied: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
  reserved: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
};

const TableList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [cookie] = useCookies();
  const user = cookie?.user;
  const MENU_KEY = "/table";
  const locationParam = user?.store || "";

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [qrTarget, setQrTarget] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formName, setFormName] = useState("");
  const [formCapacity, setFormCapacity] = useState(4);
  const [formStore, setFormStore] = useState("");

  const isSuperAdmin = user?.role === "super_admin";
  const { data: locationsData } = useQuery(
    ["allLocations"],
    getAllLocation,
    { enabled: isSuperAdmin }
  );
  const locations = locationsData?.data || [];

  const { data, isLoading } = useQuery(
    ["tables", locationParam, page, limit, search],
    () => getTablesByStore({ location: locationParam, page, limit, search }),
    { keepPreviousData: true }
  );

  const deleteMutation = useMutation(deleteTable, {
    onSuccess: () => {
      toast.success(t("common.success"), { description: t("page.table.toast.deleted") });
      queryClient.invalidateQueries(["tables"]);
    },
    onError: (err) => {
      toast.error(t("common.error"), { description: err?.response?.data?.message || err.message });
    }
  });

  const saveMutation = useMutation(editTarget ? editTable : addTable, {
    onSuccess: () => {
      toast.success(t("common.success"), {
        description: editTarget ? t("page.table.toast.updated") : t("page.table.toast.added")
      });
      setShowAddModal(false);
      setEditTarget(null);
      setFormName("");
      setFormCapacity(4);
      setFormStore("");
      queryClient.invalidateQueries(["tables"]);
    },
    onError: (err) => {
      toast.error(t("common.error"), { description: err?.response?.data?.message || err.message });
    }
  });

  const tables = data?.data || [];
  const pagination = data?.pagination || {};
  const total = pagination?.total || pagination?.totalItems || data?.total || 0;
  const totalPages = pagination?.totalPages || Math.ceil(total / limit) || 1;

  const openEdit = (table) => {
    setEditTarget(table);
    setFormName(table.name || "");
    setFormCapacity(table.capacity || 4);
    setFormStore(table.store?.toString() || "");
  };

  const handleSave = () => {
    if (!formName.trim()) {
      toast.error(t("page.table.validation.nameRequired"));
      return;
    }
    const storeId = isSuperAdmin ? formStore : locationParam;
    if (!storeId) {
      toast.error(t("page.table.validation.storeRequired"));
      return;
    }
    const payload = { store: storeId, name: formName, capacity: formCapacity };
    if (editTarget) saveMutation.mutate({ id: editTarget.id || editTarget._id, ...payload });
    else saveMutation.mutate(payload);
  };

  const columns = [
    {
      header: t("page.table.table.name"),
      render: (row) => row.name || row.number || `${t("page.table.table.name")} ${row.id}`
    },
    {
      header: t("page.table.table.capacity"),
      render: (row) => t("page.table.table.capacityValue", { capacity: row.capacity || "-" })
    },
    {
      header: t("common.status"),
      render: (row) => (
        <span
          className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[row.status] || statusColors.available}`}>
          {t(`page.table.status.${row.status || "available"}`)}
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
              onClick={() => openEdit(row)}>
              <Edit size={15} />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setQrTarget(row)}>
            <QrCode size={15} />
          </Button>
          {canAccess(user, MENU_KEY, "delete") && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive"
              onClick={() => setDeleteTarget(row)}>
              <Trash2 size={15} />
            </Button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <button
          onClick={() => navigate("/dashboard-admin")}
          className="hover:text-foreground transition-colors">
          {t("breadcrumb.home")}
        </button>
        <span className="text-xs">/</span>
        <span className="text-primary font-semibold">{t("breadcrumb.table")}</span>
      </nav>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("page.table.list.title")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t("page.table.list.description")}</p>
        </div>
        {canAccess(user, MENU_KEY, "add") && (
          <Button
            onClick={() => {
              setShowAddModal(true);
              setEditTarget(null);
              setFormName("");
              setFormCapacity(4);
              setFormStore(isSuperAdmin ? "" : locationParam);
            }}
            className="gap-2">
            <Plus size={18} />
            {t("page.table.button.add")}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-5">
          <p className="text-sm text-muted-foreground">{t("page.table.stats.total")}</p>
          <p className="text-2xl font-bold text-foreground mt-1">{total}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-muted-foreground">{t("page.table.stats.available")}</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{data?.stats?.available ?? 0}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-muted-foreground">{t("page.table.stats.reserved")}</p>
          <p className="text-2xl font-bold text-yellow-600 mt-1">{data?.stats?.reserved ?? 0}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-muted-foreground">{t("page.table.stats.occupied")}</p>
          <p className="text-2xl font-bold text-red-600 mt-1">{data?.stats?.occupied ?? 0}</p>
        </Card>
      </div>

      <div className="relative w-full sm:w-72">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          placeholder={t("page.table.list.search")}
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
        data={tables}
        isLoading={isLoading}
        emptyIcon={Sofa}
        emptyMessage={t("page.table.list.empty")}
        pagination={{ page, totalPages, total, onPageChange: setPage }}
      />

      <Modal
        type="form"
        open={showAddModal || editTarget !== null}
        onOpenChange={(open) => {
          if (!open) {
            setShowAddModal(false);
            setEditTarget(null);
          }
        }}
        title={editTarget ? t("page.table.modal.editTitle") : t("page.table.modal.addTitle")}
        confirmText={t("common.save")}
        onConfirm={handleSave}>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">
              {t("page.table.form.name")}
            </label>
            <Input
              placeholder={t("page.table.form.namePlaceholder")}
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">
              {t("page.table.form.capacity")}
            </label>
            <Input
              type="number"
              placeholder="4"
              value={formCapacity}
              onChange={(e) => setFormCapacity(Number(e.target.value))}
            />
          </div>
          {isSuperAdmin && (
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                {t("page.table.form.store")}
              </label>
              <Select value={formStore} onValueChange={setFormStore}>
                <SelectTrigger>
                  <SelectValue placeholder={t("page.table.form.storePlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((loc) => (
                    <SelectItem key={loc.id} value={loc.id.toString()}>
                      {loc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </Modal>

      <Modal
        type="confirm"
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title={t("page.table.modal.deleteTitle")}
        description={t("page.table.modal.deleteDescription", { name: deleteTarget?.name || "" })}
        confirmText={t("page.table.modal.confirmDelete")}
        onConfirm={() => {
          deleteMutation.mutate({ id: deleteTarget.id });
          setDeleteTarget(null);
        }}
      />

      <TableQRModal
        open={!!qrTarget}
        onOpenChange={(o) => !o && setQrTarget(null)}
        table={qrTarget}
      />
    </div>
  );
};

export default TableList;
