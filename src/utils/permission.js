/* eslint-disable no-unused-vars */
import { sidebarMenuSuperAdmin } from "@/utils/sidebar-menu";

export const parseAccessMenu = (accessMenu) => {
  if (Array.isArray(accessMenu)) return accessMenu;
  if (typeof accessMenu === "string") {
    try {
      return JSON.parse(accessMenu);
    } catch (e) {
      return [];
    }
  }
  return [];
};

export const getAllMenuItems = () => {
  const items = [];
  const walk = (list, parentKey = "") => {
    list.forEach((item) => {
      const key = parentKey ? `${parentKey}.${item.i18nKey}` : item.i18nKey;
      if (item.children && item.children.length > 0) {
        walk(item.children, key);
      } else {
        items.push({
          key,
          label: item.title,
          i18nKey: item.i18nKey,
          href: item.href,
          actions: item.actions || []
        });
      }
    });
  };
  walk(sidebarMenuSuperAdmin);
  return items;
};

export const getMenuActions = (menuItems) => {
  const allActions = new Set();
  menuItems.forEach((item) => {
    (item.actions || []).forEach((a) => allActions.add(a));
    if (item.children) {
      item.children.forEach((child) => (child.actions || []).forEach((a) => allActions.add(a)));
    }
  });
  return [
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
};

export const buildAccessMenuPayload = (permissions) => {
  return Object.entries(permissions).map(([menuKey, actions]) => ({
    menu: menuKey,
    ...actions
  }));
};

export const parseAccessMenuToPermissions = (accessMenu = []) => {
  if (!Array.isArray(accessMenu)) return {};
  const result = {};
  accessMenu.forEach((item) => {
    result[item.menu] = { ...item };
    delete result[item.menu].menu;
  });
  return result;
};

export const findMenuPermission = (permissions, href) => {
  if (permissions[href]) return permissions[href];
  const pathPart = href
    ?.replace("/", "")
    .replace("-list", "")
    .replace("-page", "")
    .replace("-super-admin", "");
  const result = permissions[pathPart];
  if (!result) return null;
  return result;
};

const ACTION_MAP = {
  read: "view",
  create: "add",
  update: "edit",
  upload: "import",
  download: "export",
  view: "view",
  add: "add",
  edit: "edit",
  import: "import",
  export: "export"
};

export const normalizePermissionActions = (perm) => {
  if (!perm) return perm;
  const normalized = {};
  Object.entries(perm).forEach(([key, val]) => {
    const mapped = ACTION_MAP[key] || key;
    normalized[mapped] = val;
  });
  return normalized;
};

export const canAccess = (user, menuKey, action) => {
  if (!user) return false;
  const role = user.role || user.roleType || user.type || user.userType;
  if (role === "super_admin") return true;
  const accessMenu = parseAccessMenu(user.accessMenu);
  if (!accessMenu || accessMenu.length === 0) return false;
  const menu = accessMenu.find(
    (m) =>
      m.menu === menuKey ||
      m.menu ===
        menuKey
          .replace("/", "")
          .replace("-list", "")
          .replace("-page", "")
          .replace("-super-admin", "")
  );
  if (!menu) return false;
  const normalized = normalizePermissionActions(menu);
  return !!normalized[action];
};

export const filterMenuByPermission = (menuItems, user) => {
  if (!user) return [];
  const role = user.role || user.roleType || user.type || user.userType;
  if (role === "super_admin") return menuItems;
  const accessMenu = parseAccessMenu(user.accessMenu);
  if (!accessMenu || accessMenu.length === 0) return [];

  const permissions = parseAccessMenuToPermissions(accessMenu);

  const hasAccess = (href, actions) => {
    const perm = normalizePermissionActions(findMenuPermission(permissions, href));
    if (!perm) return false;
    if (actions && actions.length > 0) {
      return actions.some((a) => !!perm[a]);
    }
    return !!perm.view;
  };

  const filterItems = (items) => {
    return items.filter((item) => {
      if (item.children && item.children.length > 0) {
        const filteredChildren = filterItems(item.children);
        item.children = filteredChildren;
        return filteredChildren.length > 0;
      }
      return hasAccess(item.href, item.actions);
    });
  };

  return filterItems([...menuItems]);
};
