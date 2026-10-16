import { safeGet } from "@/lib/safe-lookup";
import { sidebarMenuSuperAdmin } from "@/utils/sidebar-menu";
import {
  buildAccessMenuPayload,
  parseAccessMenu,
  normalizePermissionActions,
  findMenuPermission
} from "@/utils/permission";

// Shared by the role editor pages (/add-role, /edit-role/:id): the menu
// matrix, its initial state, and the payload/diff rules.

// ponytail: action labels map to translation keys. Add new actions here and in the locale files.
export const actionLabelKeys = {
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

export const allActionTypes = Object.keys(actionLabelKeys);

const collectLeaves = (items) => {
  const leaves = [];
  for (const item of items) {
    if (item.href && !item.href.startsWith("#")) leaves.push(item);
    if (item.children && item.children.length > 0) leaves.push(...collectLeaves(item.children));
  }
  return leaves;
};

export const getLeafItemsGrouped = (menu = sidebarMenuSuperAdmin) => {
  const groups = [];
  menu.forEach((parent) => {
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

export const getVisibleActions = (itemActions) =>
  allActionTypes.filter((a) => itemActions?.includes(a));

// `existingAccessMenu` is the stored list parsed into {menuKey: actions}.
export const buildInitialPermissions = (groups, existingAccessMenu = {}, roleType = "") => {
  // ponytail: rebuild literal + safeGet — bebas object injection (Codacy)
  let perms = {};
  groups.forEach((g) => {
    g.items.forEach((item) => {
      const key = item.href;
      const existing =
        normalizePermissionActions(findMenuPermission(existingAccessMenu, key)) || {};
      // An action missing from the stored entry is not granted at runtime
      // (canAccess reads only stored flags), so it shows unchecked. Treating
      // "every stored flag true" as all-granted displayed — and on the next
      // save wrote — permissions the role never had.
      const allGranted = roleType === "super_admin";
      let actions = {};
      allActionTypes.forEach((a) => {
        if (!item.actions?.includes(a)) {
          actions = { ...actions, [a]: null };
        } else {
          const prevVal = safeGet(existing, a);
          actions = {
            ...actions,
            [a]: prevVal !== undefined ? !!prevVal : allGranted
          };
        }
      });
      perms = { ...perms, [key]: actions };
    });
  });
  return perms;
};

export const setAllPermissions = (permissions, checked) =>
  // ponytail: rebuild literal via reduce — bebas object injection
  Object.keys(permissions).reduce((acc, key) => {
    const actions = safeGet(permissions, key) ?? {};
    const nextActions = Object.keys(actions).reduce(
      (inner, action) => ({
        ...inner,
        [action]: safeGet(actions, action) === null ? null : checked
      }),
      {}
    );
    return { ...acc, [key]: nextActions };
  }, {});

export const togglePermissionValue = (permissions, href, action) => {
  const current = safeGet(safeGet(permissions, href), action);
  if (current === null || current === undefined) return permissions;
  return { ...permissions, [href]: { ...safeGet(permissions, href), [action]: !current } };
};

export const isAllSelected = (permissions) =>
  Object.values(permissions).every((p) =>
    Object.values(p).every((val) => val === null || val === true)
  );

export const countGranted = (permissions) =>
  Object.values(permissions).reduce(
    (sum, p) => sum + Object.values(p).filter((val) => val === true).length,
    0
  );

// Menu search: keeps groups whose title or items match; matching a group
// title keeps all of its items.
export const filterGroups = (groups, query) => {
  const q = (query || "").trim().toLowerCase();
  if (!q) return groups;
  return groups
    .map((group) => {
      if ((group.parentTitle || "").toLowerCase().includes(q)) return group;
      const items = group.items.filter(
        (item) =>
          (item.title || "").toLowerCase().includes(q) ||
          (item.href || "").toLowerCase().includes(q)
      );
      return items.length > 0 ? { ...group, items } : null;
    })
    .filter(Boolean);
};

// Every action that changed between two matrix states, labelled by menu.
export const diffPermissions = (groups, before, after) => {
  const added = [];
  const removed = [];
  groups.forEach((group) => {
    group.items.forEach((item) => {
      const prev = safeGet(before, item.href) || {};
      const next = safeGet(after, item.href) || {};
      allActionTypes.forEach((action) => {
        const a = safeGet(prev, action);
        const b = safeGet(next, action);
        if (a === null || b === null || a === undefined || b === undefined) return;
        if (!a && b) added.push({ href: item.href, title: item.title, action });
        if (a && !b) removed.push({ href: item.href, title: item.title, action });
      });
    });
  });
  return { added, removed };
};

const legacyKey = (href) =>
  href?.replace("/", "").replace("-list", "").replace("-page", "").replace("-super-admin", "");

// Stored accessMenu entries that the matrix does not show (keys outside the
// sidebar). They are carried over unchanged so saving the matrix never
// drops them silently.
export const unmatchedAccessMenuEntries = (accessMenu, groups) => {
  const covered = new Set();
  groups.forEach((group) =>
    group.items.forEach((item) => {
      covered.add(item.href);
      covered.add(legacyKey(item.href));
    })
  );
  return parseAccessMenu(accessMenu).filter((entry) => entry && !covered.has(entry.menu));
};

export const buildRoleAccessMenu = (permissions, storedAccessMenu = [], groups = []) => [
  ...buildAccessMenuPayload(permissions),
  ...unmatchedAccessMenuEntries(storedAccessMenu, groups)
];

// R-02: an edit sends only what changed. roleType and store are never sent
// from this editor, so the server keeps them.
export const buildRoleEditPayload = ({ id, initial, current, storedAccessMenu, groups }) => {
  const payload = { id: Number(id) };
  if (current.name !== initial.name) payload.name = current.name;
  if (current.description !== initial.description) payload.description = current.description;
  if (current.status !== initial.status) payload.status = current.status;
  const { added, removed } = diffPermissions(groups, initial.permissions, current.permissions);
  if (added.length > 0 || removed.length > 0) {
    payload.accessMenu = buildRoleAccessMenu(current.permissions, storedAccessMenu, groups);
  }
  return payload;
};

const ROLE_TYPE_LABEL_KEYS = {
  super_admin: "page.role.type.superAdmin",
  admin: "page.role.type.admin",
  kasir: "page.role.type.kasir",
  user: "page.role.type.user"
};

export const roleTypeLabelKey = (roleType) =>
  safeGet(ROLE_TYPE_LABEL_KEYS, roleType) || "page.role.type.user";
