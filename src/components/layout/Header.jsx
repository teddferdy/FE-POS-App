/* eslint-disable react/prop-types */
import React, { useState, useEffect, useRef } from "react";
import { useCookies } from "react-cookie";
import { useQuery } from "react-query";
import { useTranslation } from "react-i18next";
import { Moon, Sun, Bell, Search, Menu, Store, ChevronDown, Check, Building2 } from "lucide-react";
import { translationSelect } from "@/state/translation";
import { getAllLocation } from "@/services/location";

const StoreSelector = ({ cookie, setCookie }) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const user = cookie?.user;
  const role = user?.role || user?.roleType || "";

  const { data: locationsData } = useQuery(["all-locations-header"], getAllLocation, {
    enabled: role === "super_admin"
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
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-muted/50 hover:bg-accent transition-colors text-sm max-w-[200px]">
        <Building2 size={16} className="text-primary shrink-0" />
        <span className="truncate font-medium text-foreground">{storeName}</span>
        <ChevronDown
          size={14}
          className={`shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute top-full mt-1 left-0 w-64 bg-card border border-border rounded-xl shadow-lg z-50 py-1 max-h-72 overflow-y-auto">
          <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            {t("header.selectStore")}
          </p>
          {locations.length === 0 ? (
            <div className="px-4 py-6 text-center space-y-3">
              <Store size={24} className="mx-auto text-muted-foreground" />
              <p className="text-sm text-muted-foreground">{t("header.noStore")}</p>
              <button
                onClick={() => {
                  setOpen(false);
                  window.location.href = "/add-location";
                }}
                className="text-sm font-medium text-primary hover:underline">
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
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-colors hover:bg-accent ${
                    isSelected ? "bg-primary/10 text-primary font-medium" : "text-foreground"
                  }`}>
                  <Store
                    size={16}
                    className={isSelected ? "text-primary" : "text-muted-foreground"}
                  />
                  <span className="truncate flex-1 text-left">{name}</span>
                  {isSelected && <Check size={14} className="text-primary shrink-0" />}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

const Header = ({ onMenuToggle }) => {
  const { t } = useTranslation();
  const [cookie, setCookie] = useCookies();
  const { translation, updateTranslation } = translationSelect();
  const [showSearch, setShowSearch] = useState(false);

  const user = cookie?.user;
  const userName = user?.userName || user?.name || "Admin";

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
          <div className="hidden md:flex items-center bg-muted/50 px-3 py-1.5 rounded-full border border-border">
            <Search size={16} className="text-muted-foreground shrink-0" />
            <input
              className="bg-transparent border-none focus:ring-0 text-sm px-2 w-48 lg:w-64 text-foreground placeholder:text-muted-foreground/60"
              placeholder={t("header.search")}
              type="text"
            />
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          <StoreSelector cookie={cookie} setCookie={setCookie} />

          {/* Mobile Search */}
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="md:hidden p-2 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
            <Search size={18} />
          </button>

          {/* Language Switcher */}
          <div className="flex items-center bg-muted/50 rounded-full p-0.5 border border-border">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => updateTranslation(lang.code)}
                className={`px-2 py-1 text-[10px] font-bold tracking-widest rounded-full transition-all duration-200 ${
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
            onClick={toggleTheme}
            className="p-2 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
            <Sun size={18} className="hidden dark:block" />
            <Moon size={18} className="block dark:hidden" />
          </button>

          {/* Notifications */}
          <button className="relative p-2 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
          </button>

          {/* Avatar */}
          <div className="h-8 w-8 rounded-full overflow-hidden border-2 border-primary flex items-center justify-center bg-accent text-foreground text-xs font-bold shrink-0">
            {userName.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>

      {/* Mobile Search Bar */}
      {showSearch && (
        <div className="md:hidden px-4 pb-3">
          <div className="flex items-center bg-muted/50 px-3 py-2 rounded-lg border border-border">
            <Search size={16} className="text-muted-foreground shrink-0" />
            <input
              className="bg-transparent border-none focus:ring-0 text-sm px-2 w-full text-foreground placeholder:text-muted-foreground/60"
              placeholder={t("header.search")}
              type="text"
              autoFocus
            />
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
