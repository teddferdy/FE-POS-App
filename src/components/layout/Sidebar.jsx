import React, { useState, useMemo, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { useTranslation } from "react-i18next";
import { LogOut, LifeBuoy, Crown, Calculator, ChefHat, MoreHorizontal } from "lucide-react";
import {
  sidebarMenuSuperAdmin,
  sidebarMenuAdmin,
  sidebarMenuCashier,
  sidebarMenuUser,
  navCategories
} from "@/utils/sidebar-menu";
import { filterMenuByPermission } from "@/utils/permission";
import { isAdminRole, isCashierRole, isSuperAdminRole } from "@/utils/role";
import { logOut } from "@/services/auth";
import { Loading } from "@/components/ui/loading";
import Modal from "@/components/organism/modal";
import NavigationModal from "./NavigationModal";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";

const Sidebar = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [cookie, , removeCookie] = useCookies();

  const [logoutModal, setLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [navModalOpen, setNavModalOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);

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
    if (hasAccessMenu || isSuperAdminRole(user)) return sidebarMenuSuperAdmin;
    if (isAdminRole(user)) return sidebarMenuAdmin;
    if (isCashierRole(user)) return sidebarMenuCashier;
    return sidebarMenuUser;
  }, [hasAccessMenu, user]);

  const menuItems = useMemo(() => filterMenuByPermission(baseMenu, user), [baseMenu, user]);

  const categories = useMemo(() => {
    if (hasAccessMenu || isSuperAdminRole(user)) return navCategories.super_admin || [];
    if (isAdminRole(user)) return navCategories.admin || [];
    return [];
  }, [hasAccessMenu, user]);

  const directItems = useMemo(() => {
    const items = [];
    menuItems.forEach((item) => {
      if (item.section) return;
      if (item.children && item.children.length > 1) return;

      const target = item.children?.length === 1 ? item.children[0] : item;
      if (!target?.href) return;

      if (isCashierRole(user)) {
        items.push({
          title: target.title,
          i18nKey: target.i18nKey,
          href: target.href,
          icon: target.icon || item.icon
        });
      } else if (target.href === "/home" || target.href?.startsWith("/dashboard")) {
        items.push({
          title: target.title,
          i18nKey: target.i18nKey,
          href: target.href,
          icon: target.icon || item.icon
        });
      }
    });
    return items;
  }, [menuItems, user]);

  const handleOpenCategory = useCallback(
    (catId) => {
      const cat = categories.find((c) => c.id === catId);
      if (cat) {
        setActiveCategory(cat);
        setNavModalOpen(true);
      }
    },
    [categories]
  );

  const handleNavigate = useCallback(
    (href) => {
      if (!href) return;
      navigate(href);
    },
    [navigate]
  );

  const handleSupportClick = useCallback(() => {
    navigate("/support");
  }, [navigate]);

  const confirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logOut();
    } catch (e) {}
    try {
      sessionStorage.removeItem("user");
    } catch (e) {}
    removeCookie("token");
    removeCookie("user");
    removeCookie("activeStore");
    removeCookie("activeStoreName");
    navigate("/");
  };

  const handleLogout = () => setLogoutModal(true);

  const isActive = (href) => {
    if (!href) return false;
    return location.pathname === href;
  };

  const DashboardIcon = isSuperAdminRole(user) ? Crown : Crown;

  return (
    <TooltipProvider delayDuration={0}>
      <aside className="fixed left-0 top-0 h-screen z-50 bg-card border-r border-border shadow-sm flex flex-col items-center py-4 px-1.5 w-16 transition-all duration-300">
        {isLoggingOut && (
          <Loading fullscreen size="lg" label={t("header.loggingOut") || "Logging out..."} />
        )}

        {/* Brand */}
        <div className="mb-4 px-1 flex items-center justify-center">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <span className="text-sm font-bold text-primary">
              {(t("sidebar.brandName") || "BN").charAt(0)}
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 flex flex-col items-center gap-1 w-full">
          {/* Dashboard - always direct navigate */}
          {directItems
            .filter((item) => item.href?.startsWith("/dashboard"))
            .map((item) => (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => handleNavigate(item.href)}
                    className={`w-11 h-11 flex items-center justify-center rounded-xl transition-all duration-200 ${
                      isActive(item.href)
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    }`}>
                    <DashboardIcon size={20} />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={8}>
                  {t(item.i18nKey) || item.title}
                </TooltipContent>
              </Tooltip>
            ))}

          {/* Kasir - always direct navigate */}
          {directItems
            .filter((item) => item.href === "/home")
            .map((item) => (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => handleNavigate(item.href)}
                    className={`w-11 h-11 flex items-center justify-center rounded-xl transition-all duration-200 ${
                      isActive(item.href)
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    }`}>
                    <Calculator size={20} />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={8}>
                  {t(item.i18nKey) || item.title}
                </TooltipContent>
              </Tooltip>
            ))}

          {/* KDS - direct navigate for cashier */}
          {isCashierRole(user) &&
            menuItems
              .filter((item) => item.section && item.children)
              .forEach((section) => {
                section.children?.forEach((child) => {
                  if (child.href === "/kitchen-display") {
                    directItems.push({
                      title: child.title,
                      i18nKey: child.i18nKey,
                      href: child.href,
                      icon: ChefHat
                    });
                  }
                });
              })}

          {/* Divider */}
          {(categories.length > 0 || directItems.some((i) => i.href === "/home")) && (
            <div className="w-6 border-t border-border/50 my-1" />
          )}

          {/* Category buttons - open modal */}
          {categories.map((cat) => (
            <Tooltip key={cat.id}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => handleOpenCategory(cat.id)}
                  className="w-11 h-11 flex items-center justify-center rounded-xl text-muted-foreground hover:bg-accent hover:text-foreground transition-all duration-200">
                  <cat.icon size={20} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={8}>
                {t(cat.i18nKey) || cat.title}
              </TooltipContent>
            </Tooltip>
          ))}

          {/* More button for cashier/user with extra items */}
          {isCashierRole(user) && (
            <>
              {menuItems
                .filter((item) => item.section)
                .map((section) =>
                  section.children
                    ?.filter((child) => child.href !== "/home" && child.href !== "/kitchen-display")
                    .map((child) => (
                      <Tooltip key={child.href}>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => handleNavigate(child.href)}
                            className={`w-11 h-11 flex items-center justify-center rounded-xl transition-all duration-200 ${
                              isActive(child.href)
                                ? "bg-primary text-primary-foreground shadow-sm"
                                : "text-muted-foreground hover:bg-accent hover:text-foreground"
                            }`}>
                            {child.icon ? <child.icon size={20} /> : <MoreHorizontal size={20} />}
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="right" sideOffset={8}>
                          {t(child.i18nKey) || child.title}
                        </TooltipContent>
                      </Tooltip>
                    ))
                )}
            </>
          )}
        </nav>

        {/* Bottom */}
        <div className="mt-auto flex flex-col items-center gap-1 w-full pt-2 border-t border-border/50">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleSupportClick}
                className={`w-11 h-11 flex items-center justify-center rounded-xl transition-all duration-200 ${
                  location.pathname === "/support"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}>
                <LifeBuoy size={20} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={8}>
              Support
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleLogout}
                className="w-11 h-11 flex items-center justify-center rounded-xl text-destructive hover:bg-destructive/10 transition-colors">
                <LogOut size={20} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={8}>
              {t("header.logout")}
            </TooltipContent>
          </Tooltip>
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

        {activeCategory && (
          <NavigationModal
            open={navModalOpen}
            onOpenChange={setNavModalOpen}
            categories={[activeCategory]}
          />
        )}
      </aside>
    </TooltipProvider>
  );
};

export default Sidebar;
