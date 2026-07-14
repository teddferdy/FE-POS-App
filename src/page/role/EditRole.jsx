import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useCookies } from "react-cookie";
import { toast } from "sonner";
import { ChevronDown, ChevronRight } from "lucide-react";
import { editRole, getRoleById } from "@/services/role";
import { sidebarMenuSuperAdmin } from "@/utils/sidebar-menu";
import {
  buildAccessMenuPayload,
  parseAccessMenuToPermissions,
  normalizePermissionActions,
  findMenuPermission
} from "@/utils/permission";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/loading";
import { Skeleton } from "@/components/ui/skeleton";
import Modal from "@/components/organism/modal";
import AbortController from "@/components/organism/abort-controller";

// ponytail: action labels map to translation keys. Add new actions here and in id.json/en.json.
const actionLabelKeys = {
  view: "page.role.action.view",
  add: "page.role.action.add",
  edit: "page.role.action.edit",
  delete: "page.role.action.delete",
  import: "page.role.action.import",
  export: "page.role.action.export",
  approve: "page.role.action.approve",
  print: "page.role.action.print",
  "edit-points": "page.role.action.editPoints",
  "edit-access": "page.role.action.editAccess",
  "reset-password": "page.role.action.resetPassword",
  "update-status": "page.role.action.updateStatus"
};

const actionColors = {
  view: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30",
  add: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30",
  edit: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30",
  delete: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30",
  import: "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/30",
  export: "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30",
  approve: "text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/30",
  print: "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/30",
  "edit-points": "text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-950/30",
  "edit-access": "text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/30",
  "reset-password": "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30",
  "update-status": "text-lime-600 dark:text-lime-400 bg-lime-50 dark:bg-lime-950/30"
};

const collectLeaves = (items) => {
  const leaves = [];
  for (const item of items) {
    if (item.href && !item.href.startsWith("#")) leaves.push(item);
    if (item.children && item.children.length > 0) leaves.push(...collectLeaves(item.children));
  }
  return leaves;
};

const getLeafItemsGrouped = () => {
  const groups = [];
  sidebarMenuSuperAdmin.forEach((parent) => {
    if (parent.href && (!parent.children || parent.children.length === 0)) {
      groups.push({ parentTitle: "", parentIcon: null, items: [parent] });
    } else if (parent.children && parent.children.length > 0) {
      const leafChildren = collectLeaves(parent.children);
      if (leafChildren.length > 0) {
        groups.push({
          parentTitle: parent.title,
          parentIcon: parent.icon,
          items: leafChildren
        });
      }
    }
  });
  return groups;
};

const allActionTypes = [
  "view",
  "add",
  "edit",
  "delete",
  "import",
  "export",
  "approve",
  "print",
  "edit-points",
  "edit-access",
  "reset-password",
  "update-status"
];

const buildInitialPermissions = (groups, existingAccessMenu = {}, roleType = "") => {
  const perms = {};
  groups.forEach((g) => {
    g.items.forEach((item) => {
      const key = item.href;
      const existing =
        normalizePermissionActions(findMenuPermission(existingAccessMenu, key)) || {};
      const allGranted =
        roleType === "super_admin" ||
        (Object.values(existing).length > 0 && Object.values(existing).every(Boolean));
      perms[key] = {};
      allActionTypes.forEach((a) => {
        if (!item.actions?.includes(a)) {
          perms[key][a] = null;
        } else if (existing[a] !== undefined) {
          perms[key][a] = !!existing[a];
        } else {
          perms[key][a] = allGranted;
        }
      });
    });
  });
  return perms;
};

const EditRole = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [cookie] = useCookies();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [permissions, setPermissions] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [cancelModal, setCancelModal] = useState(false);
  const [draftModal, setDraftModal] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState({});

  const groups = useMemo(() => getLeafItemsGrouped(), []);

  const {
    data: roleData,
    isLoading: isLoadingRole,
    isError,
    refetch
  } = useQuery(["role-by-id", id], () => getRoleById(id), {
    enabled: !!id,
    onSuccess: (res) => {
      const role = res?.data || res;
      if (role) {
        setName(role.name || "");
        setDescription(role.description || "");
        const existingPerms = parseAccessMenuToPermissions(role.accessMenu);
        setPermissions(buildInitialPermissions(groups, existingPerms, role.roleType));
      }
    }
  });

  const editMutation = useMutation(editRole, {
    onSuccess: () => {
      queryClient.invalidateQueries(["roles-all"]);
      queryClient.invalidateQueries(["roles-table"]);
      queryClient.invalidateQueries(["role-by-id", id]);
      setIsSubmitting(false);
      setSuccessModal(true);
    },
    onError: (err) => {
      toast.error(t("common.error"), {
        description: err?.response?.data?.message || err.message
      });
      setIsSubmitting(false);
    }
  });

  const togglePermission = (href, action) => {
    setPermissions((prev) => {
      const current = prev[href]?.[action];
      if (current === null) return prev;
      return {
        ...prev,
        [href]: { ...prev[href], [action]: !current }
      };
    });
  };

  const isAllSelected = () => {
    return Object.values(permissions).every((p) =>
      Object.entries(p).every(([, val]) => val === null || val === true)
    );
  };

  const selectAll = (checked) => {
    const updated = {};
    Object.keys(permissions).forEach((key) => {
      updated[key] = {};
      Object.keys(permissions[key]).forEach((action) => {
        updated[key][action] = permissions[key][action] === null ? null : checked;
      });
    });
    setPermissions(updated);
  };

  const getVisibleActions = (itemActions) => {
    return allActionTypes.filter((a) => itemActions?.includes(a));
  };

  const handleSubmit = (e, saveAsDraft = false) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error(t("common.error"), {
        description: t("page.role.edit.nameRequired")
      });
      return;
    }
    setIsSubmitting(true);

    const accessMenu = buildAccessMenuPayload(permissions);
    const user = cookie?.user;
    const currentStatus = roleData?.data?.status;
    const statusStr =
      typeof currentStatus === "string"
        ? currentStatus
        : currentStatus === true || currentStatus === undefined
          ? "active"
          : "inactive";
    editMutation.mutate({
      id: Number(id),
      name: name.trim(),
      description: description.trim(),
      status: saveAsDraft ? "draft" : statusStr,
      modifiedBy: user?.id || user?.userId || null,
      accessMenu
    });
  };

  const toggleGroup = (idx) => {
    setCollapsedGroups((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  if (isError) return <AbortController refetch={refetch} />;

  if (isLoadingRole) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-80" />
        <div className="flex justify-end gap-3">
          <Skeleton className="h-10 w-24 rounded-lg" />
          <Skeleton className="h-10 w-32 rounded-lg" />
          <Skeleton className="h-10 w-32 rounded-lg" />
        </div>
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
            <div className="bg-card p-6 rounded-xl border border-border space-y-4">
              <Skeleton className="h-5 w-32" />
              <div className="space-y-3">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full rounded-lg" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-24 w-full rounded-lg" />
              </div>
            </div>
            <div className="bg-card p-6 rounded-xl border border-border space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
          <div className="col-span-12 lg:col-span-8">
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="p-6 border-b border-border flex items-center justify-between">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-5 w-24" />
              </div>
              <div className="divide-y divide-border">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="px-6 py-3 flex items-center gap-4">
                    <Skeleton className="h-4 w-40" />
                    {[...Array(6)].map((_, j) => (
                      <Skeleton key={j} className="h-4 w-10 mx-auto" />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div>
        <nav className="mb-6 flex items-center gap-1 text-sm text-muted-foreground">
          <button
            onClick={() => navigate("/role-management")}
            className="hover:text-primary transition-colors">
            {t("page.role.detail.breadcrumbParent")}
          </button>
          <ChevronRight size={14} />
          <span className="text-foreground font-bold">{t("page.role.edit.title")}</span>
        </nav>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-foreground tracking-tight">
              {`${t("page.role.edit.title")}: ${name}`}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {t("page.role.edit.description")}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
            <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-primary">info</span>
                <h3 className="text-base font-semibold text-foreground">
                  {t("page.role.detail.infoTitle")}
                </h3>
              </div>
              <div className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {t("page.role.detail.nameLabel")} <span className="text-destructive">*</span>
                  </label>
                  <input
                    data-tour="role-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    placeholder={t("page.role.edit.namePlaceholder")}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {t("page.role.edit.descLabel")}
                  </label>
                  <textarea
                    data-tour="role-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none"
                    placeholder={t("page.role.edit.descPlaceholder")}
                    rows={5}
                  />
                </div>
              </div>
            </div>

            <div className="bg-primary/5 p-6 rounded-xl border border-primary/20">
              <h4 className="text-base font-semibold text-primary mb-2">
                {t("page.role.edit.guideTitle")}
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t("page.role.edit.guideDescription")}
              </p>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-8">
            <div
              data-tour="role-permissions-matrix"
              className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
              <div className="p-6 border-b border-border flex items-center justify-between bg-muted/30">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">rule</span>
                  <h3 className="text-base font-semibold text-foreground">
                    {t("page.role.detail.matrixTitle")}
                  </h3>
                </div>
                <label className="flex items-center gap-2 cursor-pointer select-none group">
                  <input
                    type="checkbox"
                    checked={isAllSelected()}
                    onChange={(e) => selectAll(e.target.checked)}
                    className="w-5 h-5 rounded border-border text-primary focus:ring-primary"
                  />
                  <span className="text-xs font-semibold text-muted-foreground group-hover:text-primary transition-colors">
                    {t("page.role.edit.selectAll")}
                  </span>
                </label>
              </div>

              <div className="divide-y divide-border">
                {groups.map((group, idx) => {
                  const visibleActions = getVisibleActions(
                    group.items.reduce((acc, item) => {
                      (item.actions || []).forEach((a) => {
                        if (!acc.includes(a)) acc.push(a);
                      });
                      return acc;
                    }, [])
                  );
                  const isCollapsed = collapsedGroups[idx];

                  return (
                    <div key={idx}>
                      {group.parentTitle && (
                        <button
                          type="button"
                          onClick={() => toggleGroup(idx)}
                          className="w-full flex items-center gap-2 px-6 py-3 bg-muted/10 hover:bg-muted/20 transition-colors text-left">
                          {isCollapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
                          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                            {group.parentTitle}
                          </span>
                        </button>
                      )}
                      {!isCollapsed && (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="bg-muted/10">
                                <th className="px-6 py-3 text-xs font-bold text-foreground uppercase tracking-wider w-56 bg-slate-100 dark:bg-slate-800">
                                  {t("page.role.detail.menuColumn")}
                                </th>
                                {visibleActions.map((action) => (
                                  <th
                                    key={action}
                                    className={`px-2 py-3 text-xs font-semibold uppercase tracking-wider text-center min-w-[60px] ${actionColors[action] || "text-muted-foreground"}`}>
                                    {t(actionLabelKeys[action]) || action}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                              {group.items.map((item) => {
                                const itemActions = getVisibleActions(item.actions || []);
                                return (
                                  <tr
                                    key={item.href}
                                    className="hover:bg-muted/10 transition-colors">
                                    <td className="px-6 py-3">
                                      <div className="flex items-center gap-2">
                                        {item.icon && (
                                          <item.icon
                                            size={16}
                                            className="text-muted-foreground shrink-0"
                                          />
                                        )}
                                        <span className="text-sm text-foreground">
                                          {item.title}
                                        </span>
                                      </div>
                                    </td>
                                    {itemActions.map((action) => {
                                      const val = permissions[item.href]?.[action];
                                      const isDisabled = val === null;
                                      return (
                                        <td key={action} className="px-2 py-3 text-center">
                                          {isDisabled ? (
                                            <span className="text-muted-foreground/30">—</span>
                                          ) : (
                                            <input
                                              type="checkbox"
                                              checked={!!val}
                                              onChange={() => togglePermission(item.href, action)}
                                              className="w-4 h-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
                                            />
                                          )}
                                        </td>
                                      );
                                    })}
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="p-4 bg-muted/20 text-right border-t border-border">
                <p className="text-xs text-muted-foreground italic">
                  {t("page.role.edit.footerNote")}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center gap-4 mt-6 bg-card border border-border rounded-xl p-4">
          <Button variant="outline" onClick={() => setCancelModal(true)}>
            {t("common.cancel")}
          </Button>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setDraftModal(true)}
              disabled={isSubmitting}>
              {t("common.saveAsDraft")}
            </Button>
            <Button
              data-tour="role-save"
              onClick={(e) => handleSubmit(e, false)}
              disabled={isSubmitting}>
              {t("page.role.edit.saveChanges")}
            </Button>
          </div>
        </div>

        {isSubmitting && <Loading fullscreen size="lg" label={t("common.saving")} />}

        <Modal
          type="success"
          open={successModal}
          onOpenChange={setSuccessModal}
          title={t("page.role.edit.successTitle")}
          onConfirm={() => navigate("/role-management")}
        />
        <Modal
          type="confirm"
          open={cancelModal}
          onOpenChange={setCancelModal}
          title={t("modal.cancelTitle")}
          confirmText={t("modal.yesCancel")}
          onConfirm={() => navigate("/role-management")}
        />

        <Modal
          type="confirm"
          open={draftModal}
          onOpenChange={setDraftModal}
          title={t("common.saveAsDraftTitle")}
          description={t("common.saveAsDraftDesc")}
          confirmText={t("common.yesSaveDraft")}
          onConfirm={() => {
            setDraftModal(false);
            handleSubmit(new Event("submit"), true);
          }}
        />
      </div>
    </div>
  );
};

export default EditRole;
