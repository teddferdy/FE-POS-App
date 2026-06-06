/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { useState, useEffect, useRef } from "react";
import { useCookies } from "react-cookie";
import { useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "react-query";
import { useTranslation } from "react-i18next";
import {
  Moon,
  Sun,
  Bell,
  Search,
  Menu,
  Store,
  ChevronDown,
  Check,
  Building2,
  Settings,
  LogOut,
  ChevronRight,
  LifeBuoy
} from "lucide-react";
import { translationSelect } from "@/state/translation";
import { getAllLocation } from "@/services/location";
import { useSocket } from "@/services/socket";
import { useQueryClient } from "react-query";
import { axiosInstance } from "@/services";
import { getUnreadCount } from "@/services/notification";
import CommandPalette from "./CommandPalette";
import { useTourStore } from "@/state/tour";

const StoreSelector = ({ cookie, setCookie }) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const ref = useRef(null);
  const user = cookie?.user;
  const role = user?.role || user?.roleType || "";

  const { data: locationsData } = useQuery(["all-locations-header"], getAllLocation, {
    enabled: role === "super_admin",
    staleTime: 5 * 60 * 1000
  });
  const locations = locationsData?.data || [];

  const activeStoreId = cookie?.activeStore;
  const activeStore = locations.find((l) => (l.id || l._id) === activeStoreId);
  const storeName =
    activeStore?.name ||
    activeStore?.storeName ||
    cookie?.activeStoreName ||
    t("header.selectStore");

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (role !== "super_admin") return null;

  const handleSelect = (loc) => {
    const id = loc.id || loc._id;
    const name = loc.name || loc.storeName || "";
    setCookie("activeStore", id, { path: "/" });
    setCookie("activeStoreName", name, { path: "/" });
    setCookie("user", { ...user, store: id, storeName: name }, { path: "/" });
    setOpen(false);
    window.location.reload();
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-1.5 rounded-lg border border-border bg-muted/50 hover:bg-accent transition-colors text-sm max-w-[160px] md:max-w-[200px]">
        <Building2 size={16} className="text-primary shrink-0" />
        <span className="truncate font-medium text-foreground hidden sm:inline">{storeName}</span>
        <ChevronDown
          size={14}
          className={`shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute top-full mt-1 left-0 right-0 md:left-auto md:right-auto md:w-64 bg-card border border-border rounded-xl shadow-lg z-50 py-1 max-h-72 overflow-y-auto">
          <p className="px-2 sm:px-3 py-1.5 sm:py-2 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            {t("header.selectStore")}
          </p>
          {locations.length === 0 ? (
            <div className="px-3 sm:px-4 py-3 sm:py-6 text-center space-y-2 sm:space-y-3">
              <Store size={20} className="sm:size-[24px] mx-auto text-muted-foreground" />
              <p className="text-[9px] sm:text-sm text-muted-foreground">{t("header.noStore")}</p>
              <button
                onClick={() => {
                  setOpen(false);
                  window.location.href = "/add-location";
                }}
                className="text-[9px] sm:text-sm font-medium text-primary hover:underline">
                + {t("header.addStore")}
              </button>
            </div>
          ) : (
            locations.map((loc) => {
              const id = loc.id || loc._id;
              const name = loc.name || loc.storeName || "";
              const isSelected = id === activeStoreId;
              return (
                <button
                  key={id}
                  onClick={() => handleSelect(loc)}
                  className={`w-full flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-1.5 sm:py-2.5 text-[9px] sm:text-sm transition-colors hover:bg-accent ${
                    isSelected ? "bg-primary/10 text-primary font-medium" : "text-foreground"
                  }`}>
                  <Store
                    size={14}
                    className={isSelected ? "text-primary" : "text-muted-foreground"}
                  />
                  <span className="truncate flex-1 text-left">{name}</span>
                  {isSelected && <Check size={12} className="text-primary shrink-0" />}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

const UserDropdown = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const [cookie, , removeCookie] = useCookies();

  const user = cookie?.user;
  const userName = user?.userName || user?.name || "Admin";
  const userRole = user?.role || user?.roleType || "admin";

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleLogout = () => {
    removeCookie("token");
    removeCookie("user");
    navigate("/");
  };

  return (
    <div data-tour="header-user" className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="h-7 w-7 sm:h-8 sm:w-8 rounded-full overflow-hidden border-2 border-primary flex items-center justify-center bg-accent text-foreground text-[10px] sm:text-xs font-bold shrink-0 hover:brightness-90 transition-all">
        {userName.charAt(0).toUpperCase()}
      </button>

      {open && (
        <div className="absolute top-full mt-2 right-0 w-48 sm:w-56 bg-card border border-border rounded-xl shadow-lg z-50 py-2 overflow-hidden">
          <div className="px-3 sm:px-4 py-2 sm:py-3 border-b border-border">
            <p className="text-[11px] sm:text-sm font-semibold text-foreground truncate">
              {userName}
            </p>
            <p className="text-[10px] sm:text-[11px] text-muted-foreground capitalize">
              {userRole.replace("_", " ")}
            </p>
          </div>

          <button
            onClick={() => {
              setOpen(false);
              navigate("/invoice-page");
            }}
            className="w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-2.5 text-[11px] sm:text-sm text-foreground hover:bg-accent transition-colors">
            <Settings size={14} className="sm:size-[16px] text-muted-foreground" />
            {t("header.settings")}
            <ChevronRight size={12} className="sm:size-[14px] ml-auto text-muted-foreground" />
          </button>

          <div className="border-t border-border mt-1 pt-1">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-2.5 text-[11px] sm:text-sm text-destructive hover:bg-destructive/10 transition-colors">
              <LogOut size={14} className="sm:size-[16px]" />
              {t("header.logout")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const NotificationBell = () => {
  const navigate = useNavigate();
  const { newNotification } = useSocket() || {};
  const queryClient = useQueryClient();
  const { data: unreadData } = useQuery("unread-notifications", getUnreadCount, {
    refetchInterval: 30000
  });
  const unreadCount = unreadData?.data?.count || unreadData?.count || 0;

  return (
    <button
      data-tour="header-notification"
      onClick={() => navigate("/notification")}
      className="relative p-1.5 sm:p-2 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
      <Bell size={16} className="sm:size-[18px]" />
      {unreadCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 min-w-[16px] sm:min-w-[18px] h-[16px] sm:h-[18px] flex items-center justify-center bg-destructive text-destructive-foreground text-[9px] sm:text-[10px] font-bold rounded-full px-1 leading-none shadow-sm">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </button>
  );
};

const globalPages = [
  "/dashboard-super-admin",
  "/location-list",
  "/add-location",
  "/edit-location",
  "/detail-location",
  "/store-geospatial",
  "/department-list",
  "/add-department",
  "/edit-department",
  "/detail-department",
  "/position-list",
  "/add-position",
  "/edit-position",
  "/detail-position",
  "/employee-list",
  "/add-employee",
  "/edit-employee",
  "/detail-employee",
  "/role-management",
  "/add-role",
  "/edit-role",
  "/user-list",
  "/add-user",
  "/notification"
];

const Header = ({ onMenuToggle, onOpenPalette }) => {
  const { t } = useTranslation();
  const [cookie, setCookie] = useCookies();
  const { translation, updateTranslation } = translationSelect();
  const navigate = useNavigate();

  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const { startTour } = useTourStore();
  const location = useLocation();
  const showStoreSelector = !globalPages.some((p) => location.pathname.startsWith(p));

  const toggleTheme = () => {
    document.documentElement.classList.toggle("dark");
  };

  const languages = [
    { code: "id", label: "ID" },
    { code: "en", label: "EN" }
  ];

  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="flex items-center justify-between px-4 lg:px-6 py-3 gap-4">
        {/* Left */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
            <Menu size={20} />
          </button>
          <div>
            <h1 className="text-lg font-bold text-foreground hidden sm:block">SwiftPOS Admin</h1>
          </div>
          <button
            data-tour="header-search"
            onClick={onOpenPalette}
            className="hidden md:flex items-center gap-2 bg-muted/50 hover:bg-accent px-3 py-1.5 rounded-lg lg:rounded-full border border-border transition-colors text-muted-foreground text-sm">
            <Search size={14} className="lg:size-[16px] shrink-0" />
            <span className="text-[11px] lg:text-sm">{t("header.search")}</span>
            <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono bg-background rounded border border-border ml-4">
              <span>⌘</span>K
            </kbd>
          </button>
        </div>

        {/* Right */}
        <div className="flex items-center gap-1 sm:gap-2">
          {showStoreSelector && <StoreSelector cookie={cookie} setCookie={setCookie} />}

          {/* Mobile Search */}
          <button
            onClick={onOpenPalette}
            className="md:hidden p-1.5 sm:p-2 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
            <Search size={16} className="sm:size-[18px]" />
          </button>

          {/* Language Switcher */}
          <div
            data-tour="header-translation"
            className="flex items-center bg-muted/50 rounded-full p-0.5 border border-border">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => updateTranslation(lang.code)}
                className={`px-1.5 sm:px-2 py-0.5 sm:py-1 text-[9px] sm:text-[10px] font-bold tracking-widest rounded-full transition-all duration-200 ${
                  translation === lang.code
                    ? "bg-foreground text-background shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}>
                {lang.label}
              </button>
            ))}
          </div>

          {/* Theme Toggle */}
          <button
            data-tour="header-theme"
            onClick={toggleTheme}
            className="p-1.5 sm:p-2 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
            <Sun size={16} className="hidden dark:block sm:size-[18px]" />
            <Moon size={16} className="block dark:hidden sm:size-[18px]" />
          </button>

          {/* Tour Guide */}
          <button
            data-tour="header-tour"
            onClick={() => startTour()}
            className="p-1.5 sm:p-2 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            title={t("guide.dashboard.startTour")}>
            <LifeBuoy size={16} className="sm:size-[18px]" />
          </button>

          {/* Notifications */}
          <NotificationBell />

          {/* User Dropdown */}
          <UserDropdown />
        </div>
      </div>

      <CommandPalette open={isPaletteOpen} onClose={() => setIsPaletteOpen(false)} />
    </header>
  );
};

export default Header;
