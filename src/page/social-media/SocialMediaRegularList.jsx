import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { useCookies } from "react-cookie";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { Plus, Search, Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import {
  getAllSocialMedia,
  addSocialMedia,
  editSocialMedia,
  deleteSocialMedia
} from "@/services/social-media";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";
import Modal from "@/components/organism/modal";
import PageHeader from "@/components/ui/PageHeader";

const SocialMediaRegularList = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [cookie] = useCookies();
  const store = cookie?.user?.store;

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [formData, setFormData] = useState({ platform: "", url: "" });

  const { data, isLoading } = useQuery(
    ["social-media-regular", store],
    () => getAllSocialMedia({ location: store }),
    { enabled: !!store, keepPreviousData: true }
  );

  const addMutation = useMutation(addSocialMedia, {
    onSuccess: () => {
      toast.success(t("common.success"), { description: t("page.socialMediaRegular.toast.added") });
      queryClient.invalidateQueries(["social-media-regular"]);
      closeForm();
    },
    onError: (err) => {
      toast.error(t("common.error"), { description: err?.response?.data?.message || err.message });
    }
  });

  const editMutation = useMutation(editSocialMedia, {
    onSuccess: () => {
      toast.success(t("common.success"), {
        description: t("page.socialMediaRegular.toast.updated")
      });
      queryClient.invalidateQueries(["social-media-regular"]);
      closeForm();
    },
    onError: (err) => {
      toast.error(t("common.error"), { description: err?.response?.data?.message || err.message });
    }
  });

  const deleteMutation = useMutation(deleteSocialMedia, {
    onSuccess: () => {
      toast.success(t("common.success"), {
        description: t("page.socialMediaRegular.toast.deleted")
      });
      queryClient.invalidateQueries(["social-media-regular"]);
    },
    onError: (err) => {
      toast.error(t("common.error"), { description: err?.response?.data?.message || err.message });
    }
  });

  const items = data?.data || [];
  const total = items.length;
  const totalPages = Math.ceil(total / limit) || 1;

  const filtered = items.filter((item) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (item.platform || item.platformName || "").toLowerCase().includes(q) ||
      (item.url || item.profile || "").toLowerCase().includes(q)
    );
  });

  const paginatedItems = filtered.slice((page - 1) * limit, page * limit);

  const openAdd = () => {
    setEditTarget(null);
    setFormData({ platform: "", url: "" });
    setFormOpen(true);
  };

  const openEdit = (item) => {
    setEditTarget(item);
    setFormData({
      platform: item.platform || item.platformName || "",
      url: item.url || item.profile || ""
    });
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditTarget(null);
    setFormData({ platform: "", url: "" });
  };

  const handleSave = () => {
    if (!formData.platform.trim() || !formData.url.trim()) {
      toast.error(t("common.error"), {
        description: t("page.socialMediaRegular.validation.required")
      });
      return;
    }
    const payload = {
      location: store,
      platform: formData.platform,
      url: formData.url
    };
    if (editTarget) {
      editMutation.mutate({ id: editTarget.id || editTarget._id, ...payload });
    } else {
      addMutation.mutate(payload);
    }
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      deleteMutation.mutate({ id: deleteTarget.id || deleteTarget._id });
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[
          { label: t("breadcrumb.home"), href: "/dashboard" },
          { label: t("page.socialMediaRegular.list.title") }
        ]}
        title={t("page.socialMediaRegular.list.title")}
        description={t("page.socialMediaRegular.list.description")}>
        <Button onClick={openAdd} className="shrink-0">
          <Plus size={18} />
          {t("page.socialMediaRegular.button.add")}
        </Button>
      </PageHeader>

      <Card className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-3 bg-muted/30">
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              placeholder={t("page.socialMediaRegular.list.search")}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-9 h-9 text-sm"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loading />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50 text-muted-foreground">
                  <th className="text-left px-4 py-3.5 font-semibold text-xs uppercase tracking-wider">
                    {t("page.socialMediaRegular.table.platform")}
                  </th>
                  <th className="text-left px-4 py-3.5 font-semibold text-xs uppercase tracking-wider">
                    {t("page.socialMediaRegular.table.url")}
                  </th>
                  <th className="text-left px-4 py-3.5 font-semibold text-xs uppercase tracking-wider">
                    {t("page.socialMediaRegular.table.status")}
                  </th>
                  <th className="text-right px-4 py-3.5 font-semibold text-xs uppercase tracking-wider">
                    {t("page.socialMediaRegular.table.actions")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginatedItems.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-12 text-center text-muted-foreground">
                      {t("page.socialMediaRegular.list.empty")}
                    </td>
                  </tr>
                ) : (
                  paginatedItems.map((item) => (
                    <tr key={item.id || item._id} className="hover:bg-accent/30 transition-colors">
                      <td className="px-4 py-4 font-medium text-foreground">
                        {item.platform || item.platformName}
                      </td>
                      <td className="px-4 py-4">
                        <a
                          href={item.url || item.profile}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline truncate max-w-[200px] block">
                          {item.url || item.profile}
                        </a>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tight ${
                            item.isActive
                              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800"
                              : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800"
                          }`}>
                          {item.isActive ? t("common.active") : t("common.inactive")}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-primary"
                            onClick={() => openEdit(item)}>
                            <Edit size={15} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => setDeleteTarget(item)}>
                            <Trash2 size={15} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="px-4 py-3 border-t border-border bg-muted/30 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-muted-foreground">
            {t("page.socialMediaRegular.list.showing", { count: paginatedItems.length, total })}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page <= 1}
              className="w-9 h-9 flex items-center justify-center border border-border rounded-lg text-muted-foreground hover:bg-accent disabled:opacity-30">
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const p = i + 1;
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium border transition-colors ${
                    page === p
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border text-muted-foreground hover:bg-accent"
                  }`}>
                  {p}
                </button>
              );
            })}
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages}
              className="w-9 h-9 flex items-center justify-center border border-border rounded-lg text-muted-foreground hover:bg-accent disabled:opacity-30">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </Card>

      <Modal
        type="form"
        open={formOpen}
        onOpenChange={(o) => {
          if (!o) closeForm();
        }}
        title={
          editTarget
            ? t("page.socialMediaRegular.form.titleEdit")
            : t("page.socialMediaRegular.form.titleAdd")
        }
        confirmText={t("common.save")}
        onConfirm={handleSave}>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">
              {t("page.socialMediaRegular.form.platform")}
            </label>
            <Input
              placeholder={t("page.socialMediaRegular.form.platformPlaceholder")}
              value={formData.platform}
              onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">
              {t("page.socialMediaRegular.form.url")}
            </label>
            <Input
              placeholder={t("page.socialMediaRegular.form.urlPlaceholder")}
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            />
          </div>
        </div>
      </Modal>

      <Modal
        type="confirm"
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title={t("page.socialMediaRegular.delete.title")}
        confirmText={t("page.socialMediaRegular.delete.confirm")}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default SocialMediaRegularList;
