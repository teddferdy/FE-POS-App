/* eslint-disable no-empty */
/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { useTranslation } from "react-i18next";
import { ChevronDown, LogOut, LifeBuoy, PanelLeftClose, PanelLeft } from "lucide-react";
import {
  sidebarMenuSuperAdmin,
  sidebarMenuAdmin,
  sidebarMenuCashier,
  sidebarMenuUser
} from "@/utils/sidebar-menu";
import { filterMenuByPermission } from "@/utils/permission";
import { logOut } from "@/services/auth";
import Modal from "@/components/organism/modal";

const Sidebar = ({ collapsed, onToggle }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [cookie, , removeCookie] = useCookies();

  const matchPath = (href, item) => {
    if (!href) return false;
    if (location.pathname === href) return true;

    if (item?.activePaths?.includes(location.pathname)) return true;

    if (href.endsWith("-list")) {
      const base = href.replace("/", "").replace("-list", "");
      return ["add", "edit", "detail"].some((action) => location.pathname === `/${action}-${base}`);
    }

    const exceptionMap = {
      "/role-management": ["/add-role", "/edit-role", "/detail-role"],
      "/cash-register/current": [
        "/cash-register/history",
        "/cash-register/open-close",
        "/cash-register/current",
        "/cash-register/history/detail"
      ]
    };

    if (exceptionMap[href]) {
      return exceptionMap[href].some((path) => {
        if (location.pathname === path) return true;
        if (location.pathname.startsWith(path + "/")) return true;
        return false;
      });
    }

    const resource = href.replace("/", "");
    if (resource) {
      return ["add", "edit", "detail"].some(
        (action) => location.pathname === `/${action}-${resource}`
      );
    }

    return false;
  };

  const hasActiveChild = (item) => {
    if (!item.children) return false;
    return item.children.some((child) => matchPath(child.href, child) || hasActiveChild(child));
  };

  const markActiveParents = (items, result) => {
    items.forEach((item) => {
      if (!item.children) return;
      if (hasActiveChild(item)) {
        result[item.title] = true;
        markActiveParents(item.children, result);
      }
    });
  };

  const [expandedMenus, setExpandedMenus] = useState(() => {
    const result = {};
    const allMenus = [sidebarMenuSuperAdmin, sidebarMenuAdmin, sidebarMenuCashier, sidebarMenuUser];
    allMenus.forEach((group) => markActiveParents(group, result));
    return result;
  });
  const [logoutModal, setLogoutModal] = useState(false);

  const handleSupportClick = () => {
    navigate("/support");
  };

  const user = useMemo(() => {
    const fromSession = () => {
      try {
        const stored = sessionStorage.getItem("user");
        return stored ? JSON.parse(stored) : null;
      } catch (e) {
        return null;
      }
    };
    const session = fromSession();
    if (
      session &&
      session.accessMenu &&
      Array.isArray(session.accessMenu) &&
      session.accessMenu.length > 0
    ) {
      return session;
    }
    return cookie?.user;
  }, [cookie?.user]);
  const role = user?.roleType || "user";
  const hasAccessMenu =
    user?.accessMenu && Array.isArray(user.accessMenu) && user.accessMenu.length > 0;

  const baseMenu = useMemo(() => {
    if (hasAccessMenu || role === "super_admin") return sidebarMenuSuperAdmin;
    if (role === "admin") return sidebarMenuAdmin;
    if (role === "cashier" || role === "kasir") return sidebarMenuCashier;
    return sidebarMenuUser;
  }, [hasAccessMenu, role]);

  const menuItems = useMemo(() => filterMenuByPermission(baseMenu, user), [baseMenu, user]);

  useEffect(() => {
    if (collapsed) return;
    const toOpen = {};
    markActiveParents(menuItems, toOpen);
    setExpandedMenus((prev) => {
      const hasChanges = Object.keys(toOpen).some((k) => prev[k] !== toOpen[k]);
      if (!hasChanges) return prev;
      return { ...prev, ...toOpen };
    });
  }, [location.pathname, collapsed, menuItems]);

  const isActive = (href, item) => {
    if (!href) return false;
    return matchPath(href, item);
  };

  const isParentActive = (item) => {
    return hasActiveChild(item);
  };

  const toggleSubmenu = (title) => {
    setExpandedMenus((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  const confirmLogout = async () => {
    try {
      await logOut();
    try {
      sessionStorage.removeItem("user");
    removeCookie("token");
    removeCookie("user");
    removeCookie("activeStore");
    removeCookie("activeStoreName");
    navigate("/");
  };

  const handleLogout = () => setLogoutModal(true);

  const renderIcon = (IconComponent, size = 20) => {
    if (!IconComponent) return <PanelLeft size={size} />;
    return <IconComponent size={size} />;
  };

  const renderNavItem = (item, depth = 0) => {
    if (item.section) {
      return (
        <div key={item.title}>
          {!collapsed && (
            <div className="flex items-center gap-2 px-3 py-1.5 mt-3 mb-0.5">
              {item.icon && (
                <span className="text-muted-foreground/40">{renderIcon(item.icon, 13)}</span>
              )}
              <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/40">
                {t(item.i18nKey) || item.title}
              </span>
              <div className="flex-1 border-t border-border/30" />
            </div>
          )}
          <div className="space-y-0.5">
            {item.children?.map((child) => renderNavItem(child, depth + 1))}
          </div>
        </div>
      );
    }

    if (item.children && item.children.length > 0) {
      if (item.children.length === 1) {
        const child = item.children[0];
        return (
          <button
            key={item.title}
            onClick={() => {
              if (child.href) navigate(child.href);
            }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group ${
              isActive(child.href, child)
                ? "bg-primary text-primary-foreground font-medium shadow-sm"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}>
            <span className="shrink-0">{renderIcon(item.icon)}</span>
            <span
              className={`text-sm whitespace-nowrap overflow-hidden transition-all duration-300 ${
                collapsed ? "w-0 opacity-0" : "w-auto opacity-100"
              }`}>
              {t(item.i18nKey) || item.title}
            </span>
          </button>
        );
      }

      const parentActive = isParentActive(item);
      const isOpen = expandedMenus[item.title];

      return (
        <div key={item.title}>
          <button
            onClick={() => {
              if (collapsed) {
                onToggle();
                setTimeout(() => toggleSubmenu(item.title), 300);
              } else {
                toggleSubmenu(item.title);
              }
            }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group ${
              parentActive
                ? "bg-primary/10 text-primary font-medium"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}>
            <span className="shrink-0">{renderIcon(item.icon)}</span>
            <span
              className={`text-sm whitespace-nowrap overflow-hidden transition-all duration-300 ${
                collapsed ? "w-0 opacity-0" : "w-auto opacity-100"
              }`}>
              {t(item.i18nKey) || item.title}
            </span>
            <span
              className={`ml-auto shrink-0 transition-all duration-200 ${
                collapsed ? "hidden" : ""
              } ${isOpen ? "rotate-180" : ""}`}>
              <ChevronDown size={14} />
            </span>
          </button>
          <div
            className={`overflow-y-auto transition-all duration-300 ${
              collapsed ? "max-h-0" : isOpen ? "max-h-[800px]" : "max-h-0"
            }`}>
            <div className="ml-2 mt-1 space-y-0.5 pl-3">
              {item.children.map((child) => renderNavItem(child, depth + 1))}
            </div>
          </div>
        </div>
      );
    }

    return (
      <button
        key={item.href || item.title}
        onClick={() => {
          if (item.href) navigate(item.href);
        }}
        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group ${
          isActive(item.href, item)
            ? "bg-primary text-primary-foreground font-medium shadow-sm"
            : "text-muted-foreground hover:bg-accent hover:text-foreground"
        }`}>
        <span className="shrink-0">{renderIcon(item.icon)}</span>
        <span
          className={`text-sm whitespace-nowrap overflow-hidden transition-all duration-300 ${
            collapsed ? "w-0 opacity-0" : "w-auto opacity-100"
          }`}>
          {t(item.i18nKey) || item.title}
        </span>
      </button>
    );
  };

  return (
    <aside
      className={`fixed left-0 top-0 h-screen z-50 bg-card border-r border-border shadow-sm flex flex-col py-4 px-2 transition-all duration-300 ${
        collapsed ? "w-16" : "w-64"
      }`}>
      {/* Brand */}
      <div className="mb-6 px-2 flex items-center justify-between">
        <div
          className={`overflow-hidden transition-all duration-300 ${collapsed ? "w-0" : "w-full"}`}>
          <h1 className="text-base font-bold text-foreground truncate">{t("sidebar.brandName")}</h1>
          <p className="text-[10px] text-muted-foreground tracking-wider uppercase truncate">
            {t("sidebar.terminalId")}
          </p>
        </div>
        <button
          onClick={onToggle}
          className="shrink-0 p-1.5 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
          {collapsed ? <PanelLeft size={18} /> : <PanelLeftClose size={18} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-1 overflow-y-auto no-scrollbar">
        {menuItems.map((item) => renderNavItem(item))}
      </nav>

      {/* Bottom */}
      <div className="mt-auto border-t border-border pt-3 flex flex-col gap-1">
        <button
          onClick={handleSupportClick}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
            location.pathname === "/support"
              ? "bg-primary text-primary-foreground font-medium shadow-sm"
              : "text-muted-foreground hover:bg-accent hover:text-foreground"
          }`}>
          <LifeBuoy size={20} className="shrink-0" />
          <span
            className={`text-sm whitespace-nowrap overflow-hidden transition-all duration-300 ${
              collapsed ? "w-0 opacity-0" : "w-auto opacity-100"
            }`}>
            Support
          </span>
        </button>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-destructive hover:bg-destructive/10 transition-colors group">
          <LogOut size={20} className="shrink-0" />
          <span
            className={`text-sm whitespace-nowrap overflow-hidden transition-all duration-300 ${
              collapsed ? "w-0 opacity-0" : "w-auto opacity-100"
            }`}>
            {t("header.logout")}
          </span>
        </button>
      </div>

      <Modal
        open={logoutModal}
        onOpenChange={setLogoutModal}
        type="confirm"
        title={t("header.logoutConfirmTitle")}
        description={t("header.logoutConfirmDesc")}
        confirmText={t("header.logoutYes")}
        onConfirm={confirmLogout}
      />
    </aside>
  );
};

export default Sidebar;
