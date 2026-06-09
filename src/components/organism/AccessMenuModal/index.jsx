/* eslint-disable react/prop-types */
import React, { useState, useMemo, useEffect, useCallback } from "react";
import { ChevronDown, ChevronRight, Loader } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { sidebarMenuSuperAdmin } from "@/utils/sidebar-menu";
import { buildAccessMenuPayload, parseAccessMenuToPermissions } from "@/utils/permission";

const allActions = [
  "view", "add", "edit", "delete", "import", "export",
  "approve", "print", "edit-points", "edit-access", "reset-password", "update-status"
];

const actionLabels = {
  view: "Lihat", add: "Tambah", edit: "Ubah", delete: "Hapus",
  import: "Import", export: "Ekspor", approve: "Setujui", print: "Cetak",
  "edit-points": "Edit Poin", "edit-access": "Edit Akses",
  "reset-password": "Reset Password", "update-status": "Update Status"
};

const getLeafItemsGrouped = () => {
  const groups = [];
  sidebarMenuSuperAdmin.forEach((parent) => {
    if (parent.href && (!parent.children || parent.children.length === 0)) {
      groups.push({ parentTitle: "", parentIcon: null, items: [parent] });
    } else if (parent.children && parent.children.length > 0) {
      const leafChildren = parent.children.filter((c) => c.href && !c.href.startsWith("#"));
      if (leafChildren.length > 0) {
        groups.push({ parentTitle: parent.title, parentIcon: parent.icon, items: leafChildren });
      }
    }
  });
  return groups;
};

const buildInitialPermissions = (groups, existingPerms = {}) => {
  const perms = {};
  groups.forEach((g) => {
    g.items.forEach((item) => {
      const key = item.href;
      perms[key] = {};
      allActions.forEach((a) => {
        if (item.actions?.includes(a)) {
          perms[key][a] = existingPerms?.[key]?.[a] ?? false;
        } else {
          perms[key][a] = null;
        }
      });
    });
  });
  return perms;
};

export default function AccessMenuModal({ open, onOpenChange, value = "", roleAccessMenu, onSave }) {
  const groups = useMemo(() => getLeafItemsGrouped(), []);
  const [collapsed, setCollapsed] = useState({});

  const initPerms = useCallback(() => {
    const rolePerms = {};
    const raw = roleAccessMenu || {};
    if (Array.isArray(raw)) {
      raw.forEach((item) => {
        const menu = item.menu;
        if (menu) {
          rolePerms[menu] = {};
          allActions.forEach((a) => {
            if (item[a] !== undefined) rolePerms[menu][a] = item[a];
          });
        }
      });
    } else {
      Object.entries(raw).forEach(([menu, actions]) => {
        if (Array.isArray(actions)) {
          rolePerms[menu] = {};
          allActions.forEach((a) => {
            rolePerms[menu][a] = actions.includes(a);
          });
        }
      });
    }
    let employeePerms = {};
    try {
      const parsed = value ? JSON.parse(value) : [];
      employeePerms = Array.isArray(parsed) ? parseAccessMenuToPermissions(parsed) : {};
    } catch {}
    const merged = { ...rolePerms };
    Object.keys(employeePerms).forEach((menu) => {
      merged[menu] = { ...(merged[menu] || {}), ...employeePerms[menu] };
    });
    return buildInitialPermissions(groups, merged);
  }, [value, roleAccessMenu, groups]);

  const [permissions, setPermissions] = useState(initPerms);

  useEffect(() => {
    setPermissions(initPerms());
  }, [initPerms]);

  const togglePermission = (href, action) => {
    setPermissions((prev) => {
      const current = prev[href]?.[action];
      if (current === null) return prev;
      return { ...prev, [href]: { ...prev[href], [action]: !current } };
    });
  };

  const isAllSelected = () =>
    Object.values(permissions).every((p) =>
      Object.entries(p).every(([, val]) => val === null || val === true)
    );

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

  const [saving, setSaving] = useState(false);

  const getVisibleActions = (itemActions) => allActions.filter((a) => itemActions?.includes(a));

  const handleSave = () => {
    setSaving(true);
    const payload = buildAccessMenuPayload(permissions);
    onSave(JSON.stringify(payload));
    setTimeout(() => {
      setSaving(false);
      onOpenChange(false);
    }, 300);
  };

  const toggleGroup = (idx) => {
    setCollapsed((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Atur Izin Akses Tambahan</DialogTitle>
          <DialogDescription>
            Atur izin akses tambahan untuk karyawan ini (di luar izin dari role).
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-between py-2">
          <p className="text-xs text-muted-foreground">
            Centang aksi yang ingin diberikan untuk setiap menu.
          </p>
          <label className="flex items-center gap-2 cursor-pointer select-none group">
            <input
              type="checkbox"
              checked={isAllSelected()}
              onChange={(e) => selectAll(e.target.checked)}
              className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
            />
            <span className="text-xs font-semibold text-muted-foreground group-hover:text-primary transition-colors">
              Pilih Semua
            </span>
          </label>
        </div>

        <div className="divide-y divide-border border rounded-lg">
          {groups.map((group, idx) => {
            const visibleActions = getVisibleActions(
              group.items.reduce((acc, item) => {
                (item.actions || []).forEach((a) => {
                  if (!acc.includes(a)) acc.push(a);
                });
                return acc;
              }, [])
            );
            const isCollapsed = collapsed[idx];

            return (
              <div key={idx}>
                {group.parentTitle && (
                  <button
                    type="button"
                    onClick={() => toggleGroup(idx)}
                    className="w-full flex items-center gap-2 px-4 py-2.5 bg-muted/10 hover:bg-muted/20 transition-colors text-left"
                  >
                    {isCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
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
                          <th className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-48">
                            Menu
                          </th>
                          {visibleActions.map((action) => (
                            <th
                              key={action}
                              className="px-2 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center min-w-[60px]"
                            >
                              {actionLabels[action] || action}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {group.items.map((item) => {
                          const itemActions = getVisibleActions(item.actions || []);
                          return (
                            <tr key={item.href} className="hover:bg-muted/10 transition-colors">
                              <td className="px-4 py-2.5">
                                <div className="flex items-center gap-2">
                                  {item.icon && (
                                    <item.icon size={14} className="text-muted-foreground shrink-0" />
                                  )}
                                  <span className="text-sm text-foreground">{item.title}</span>
                                </div>
                              </td>
                              {itemActions.map((action) => {
                                const val = permissions[item.href]?.[action];
                                const isDisabled = val === null;
                                return (
                                  <td key={action} className="px-2 py-2.5 text-center">
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

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button type="button" onClick={handleSave} disabled={saving}>
            {saving && <Loader className="mr-2 h-4 w-4 animate-spin" />}
            Simpan Izin
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
