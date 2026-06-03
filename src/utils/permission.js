import { sidebarMenuSuperAdmin } from "@/utils/sidebar-menu";

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

export const canAccess = (user, menuKey, action) => {
  if (!user) return false;
  const role = user.role || user.roleType || user.type || user.userType;
  if (role === "super_admin") return true;
  const accessMenu = user.accessMenu;
  if (!accessMenu) return false;
  const menu = Array.isArray(accessMenu) ? accessMenu.find((m) => m.menu === menuKey) : null;
  return menu ? !!menu[action] : false;
};

export const filterMenuByPermission = (menuItems, user) => {
  if (!user) return [];
  const role = user.role || user.roleType || user.type || user.userType;
  if (role === "super_admin") return menuItems;
  const accessMenu = user.accessMenu;
  if (!accessMenu || !Array.isArray(accessMenu)) return [];

  const hasAccess = (href, actions) => {
    const menuEntry = accessMenu.find((m) => {
      if (m.menu === href) return true;
      const pathPart = href?.replace("/", "").replace("-list", "").replace("-page", "");
      return m.menu === pathPart;
    });
    if (!menuEntry) return false;
    if (actions && actions.length > 0) {
      return actions.some((a) => !!menuEntry[a]);
    }
    return !!menuEntry.view;
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
