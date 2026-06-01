/* eslint-disable react/prop-types */
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { toast } from "sonner";
import { Plus, Search, Edit, Trash2, Power, PowerOff } from "lucide-react";
import {
  getAllInvoiceSocialMedia,
  deleteInvoiceSocialMedia,
  activateOrNotActiveInvoiceSocialMedia
} from "@/services/invoice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";
import Modal from "@/components/organism/modal";
import PageHeader from "@/components/ui/PageHeader";

const SocialMediaList = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [cookie] = useCookies();
  const store = cookie?.store;

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data, isLoading } = useQuery(
    ["social-media-invoice", store],
    () => getAllInvoiceSocialMedia({ location: store }),
    { enabled: !!store, keepPreviousData: true }
  );

  const deleteMutation = useMutation(deleteInvoiceSocialMedia, {
    onSuccess: () => {
      toast.success("Success", { description: "Social media deleted successfully" });
      queryClient.invalidateQueries(["social-media-invoice"]);
    },
    onError: (err) => {
      toast.error("Failed", { description: err?.response?.data?.message || err.message });
    }
  });

  const toggleMutation = useMutation(activateOrNotActiveInvoiceSocialMedia, {
    onSuccess: () => {
      toast.success("Success", { description: "Status updated successfully" });
      queryClient.invalidateQueries(["social-media-invoice"]);
    },
    onError: (err) => {
      toast.error("Failed", { description: err?.response?.data?.message || err.message });
    }
  });

  const items = data?.data || data?.socialMedias || [];

  const filtered = items.filter((item) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (item.platformName || "").toLowerCase().includes(q) ||
      (item.url || "").toLowerCase().includes(q)
    );
  });

  const totalPages = Math.ceil(filtered.length / limit) || 1;
  const paginatedItems = filtered.slice((page - 1) * limit, page * limit);

  const handleDelete = (id) => {
    setDeleteTarget(id);
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      deleteMutation.mutate({ id: deleteTarget });
      setDeleteTarget(null);
    }
  };

  const handleToggle = (item) => {
    toggleMutation.mutate({
      id: item.id || item._id,
      isActive: !item.isActive
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Social Media Invoice" }
        ]}
        title="Social Media Invoice"
        description="Manage social media links displayed on invoices.">
        <Button onClick={() => navigate("/add-social-media")} className="shrink-0">
          <Plus size={18} />
          Add Social Media
        </Button>
      </PageHeader>

      <Card className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border flex flex-col gap-3 bg-muted/30">
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              placeholder="Search by platform name or URL..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-9 h-9 text-sm"
            />
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Showing {Math.min(limit, filtered.length)} of {items.length} items
            </p>
            <div className="flex items-center border border-border rounded-md overflow-hidden">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page <= 1}
                className="p-1.5 hover:bg-accent transition-colors disabled:opacity-30">
                <span className="material-symbols-outlined text-sm">chevron_left</span>
              </button>
              <div className="w-px h-5 bg-border" />
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page >= totalPages}
                className="p-1.5 hover:bg-accent transition-colors disabled:opacity-30">
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </button>
            </div>
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
                    Platform Name
                  </th>
                  <th className="text-left px-4 py-3.5 font-semibold text-xs uppercase tracking-wider">
                    URL
                  </th>
                  <th className="text-left px-4 py-3.5 font-semibold text-xs uppercase tracking-wider">
                    Icon
                  </th>
                  <th className="text-left px-4 py-3.5 font-semibold text-xs uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-right px-4 py-3.5 font-semibold text-xs uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginatedItems.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                      No social media found
                    </td>
                  </tr>
                ) : (
                  paginatedItems.map((item) => (
                    <tr
                      key={item.id || item._id}
                      className="hover:bg-accent/30 transition-colors group">
                      <td className="px-4 py-4">
                        <p className="font-medium text-foreground">{item.platformName}</p>
                      </td>
                      <td className="px-4 py-4">
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline truncate max-w-[200px] block">
                          {item.url}
                        </a>
                      </td>
                      <td className="px-4 py-4">
                        <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                          {item.icon ? (
                            <span className="material-symbols-outlined text-primary">
                              {item.icon}
                            </span>
                          ) : (
                            <span className="material-symbols-outlined text-muted-foreground">
                              link
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tight ${
                            item.isActive
                              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800"
                              : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800"
                          }`}>
                          {item.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-primary"
                            onClick={() =>
                              navigate(`/edit-social-media?id=${item.id || item._id}`)
                            }>
                            <Edit size={15} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className={`h-8 w-8 ${item.isActive ? "text-amber-600" : "text-green-600"}`}
                            onClick={() => handleToggle(item)}>
                            {item.isActive ? <PowerOff size={15} /> : <Power size={15} />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => handleDelete(item.id || item._id)}>
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
          <div className="flex items-center gap-3">
            <p className="text-xs text-muted-foreground">Rows per page:</p>
            <select
              className="bg-background border border-border rounded px-2 py-1 text-xs"
              value={limit}
              disabled>
              <option>10</option>
            </select>
          </div>
          <div className="flex gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`px-3 py-1 rounded text-xs font-medium border transition-colors ${
                    page === pageNum
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border hover:bg-accent"
                  }`}>
                  {pageNum}
                </button>
              );
            })}
          </div>
        </div>
      </Card>

      <Modal
        type="confirm"
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Social Media?"
        confirmText="Yes, Delete"
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default SocialMediaList;
