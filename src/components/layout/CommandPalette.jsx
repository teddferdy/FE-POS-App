import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { useTranslation } from "react-i18next";
import { Search, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  sidebarMenuSuperAdmin,
  sidebarMenuAdmin,
  sidebarMenuCashier,
  sidebarMenuUser
} from "@/utils/sidebar-menu";
import { filterMenuByPermission } from "@/utils/permission";
import { isAdminRole, isCashierRole, isSuperAdminRole } from "@/utils/role";

// ponytail: halaman di luar struktur section sidebar (form add/edit & utilitas)
const extraPages = [
  { path: "/add-product", label: "Tambah Produk", keywords: "tambah produk add product" },
  { path: "/edit-product", label: "Edit Produk", keywords: "edit produk product" },
  { path: "/add-category", label: "Tambah Kategori", keywords: "tambah kategori add category" },
  { path: "/add-supplier", label: "Tambah Supplier", keywords: "tambah supplier add" },
  {
    path: "/supplier-comparison",
    label: "Bandingkan Supplier",
    keywords: "bandingkan supplier compare"
  },
  { path: "/add-member", label: "Tambah Member", keywords: "tambah member add" },
  { path: "/add-discount", label: "Tambah Diskon", keywords: "tambah diskon add discount" },
  { path: "/add-stock-opname", label: "Tambah Stock Opname", keywords: "tambah stock opname add" },
  { path: "/add-purchase-order", label: "Tambah PO", keywords: "tambah purchase order po" },
  { path: "/add-employee", label: "Tambah Karyawan", keywords: "tambah karyawan add employee" },
  { path: "/add-location", label: "Tambah Toko", keywords: "tambah toko add location store" },
  { path: "/store-geospatial", label: "Peta Toko", keywords: "peta toko geospatial map" },
  { path: "/add-user", label: "Tambah Admin", keywords: "tambah admin add user" },
  { path: "/support", label: "Support", keywords: "support bantuan help faq kontak cs" },
  { path: "/add-role", label: "Tambah Role", keywords: "tambah role add" },
  { path: "/add-tax", label: "Tambah Pajak", keywords: "tambah pajak add tax" },
  { path: "/notification", label: "Notifikasi", keywords: "notifikasi notification" }
];

const CommandPalette = ({ open, onClose }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [cookie] = useCookies();
  const inputRef = useRef(null);
  const itemRefs = useRef({});
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  // ponytail: resolusi user sama seperti Sidebar agar grup palette selalu sinkron dengan menu
  const user = useMemo(() => {
    let session = null;
    try {
      const stored = sessionStorage.getItem("user");
      session = stored ? JSON.parse(stored) : null;
    } catch {
      session = null;
    }
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

  const groups = useMemo(() => {
    const hasAccessMenu =
      user?.accessMenu && Array.isArray(user.accessMenu) && user.accessMenu.length > 0;

    let baseMenu;
    if (hasAccessMenu || isSuperAdminRole(user)) baseMenu = sidebarMenuSuperAdmin;
    else if (isAdminRole(user)) baseMenu = sidebarMenuAdmin;
    else if (isCashierRole(user)) baseMenu = sidebarMenuCashier;
    else baseMenu = sidebarMenuUser;

    const menuItems = filterMenuByPermission(baseMenu, user);

    const knownPaths = new Set();
    const sectionGroups = [];
    const directItems = [];

    menuItems.forEach((item) => {
      const children = (item.children || []).filter((c) => c.href);
      if (children.length > 0) {
        children.forEach((c) => knownPaths.add(c.href));
        sectionGroups.push({
          id: item.i18nKey || item.title,
          title: t(item.i18nKey, { defaultValue: item.title }),
          items: children
        });
      } else if (item.href) {
        directItems.push(item);
        knownPaths.add(item.href);
      }
    });

    const result = [];
    if (directItems.length > 0) {
      result.push({ id: "main", title: t("commandPalette.groupMain"), items: directItems });
    }
    result.push(...sectionGroups);

    const extras = extraPages.filter((p) => !knownPaths.has(p.path));
    if (extras.length > 0) {
      result.push({ id: "more", title: t("commandPalette.groupMore"), items: extras });
    }
    return result;
  }, [user, t]);

  const filteredGroups = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return groups;
    const matchItem = (item) => {
      const label = item.i18nKey
        ? t(item.i18nKey, { defaultValue: item.title })
        : t(item.path, { defaultValue: item.label });
      const haystack = `${label} ${item.keywords || ""} ${item.title || ""} ${
        item.href || item.path || ""
      }`.toLowerCase();
      return haystack.includes(q);
    };
    return groups
      .map((g) => ({ ...g, items: g.items.filter(matchItem) }))
      .filter((g) => g.items.length > 0);
  }, [groups, query, t]);

  const flatItems = useMemo(() => filteredGroups.flatMap((g) => g.items), [filteredGroups]);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery("");
      setSelectedIndex(0);
    }
  }, [open]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    itemRefs.current[selectedIndex]?.scrollIntoView({ block: "nearest" });
  }, [selectedIndex]);

  const getItemLabel = (item) =>
    item.i18nKey
      ? t(item.i18nKey, { defaultValue: item.title })
      : t(item.path, { defaultValue: item.label });

  const handleSelect = (path) => {
    navigate(path);
    onClose();
  };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, flatItems.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      const item = flatItems[selectedIndex];
      if (item) handleSelect(item.href || item.path);
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  useEffect(() => {
    const handleGlobalKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (open) document.addEventListener("keydown", handleGlobalKey);
    return () => document.removeEventListener("keydown", handleGlobalKey);
  }, [open, onClose]);

  if (!open) return null;

  let runningIndex = -1;

  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center pt-[10vh]">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg mx-4 bg-card border border-border rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <Search size={18} className="text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none"
            placeholder={t("commandPalette.placeholder")}
          />
          <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground bg-muted rounded border border-border">
            ESC
          </kbd>
        </div>

        <div className="max-h-80 overflow-y-auto py-1">
          {flatItems.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              {t("commandPalette.notFound", { query })}
            </div>
          ) : (
            filteredGroups.map((group) => (
              <div key={group.id}>
                <div className="px-4 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted/40 border-y border-border/50">
                  {group.title}
                </div>
                {group.items.map((item) => {
                  runningIndex += 1;
                  const i = runningIndex;
                  const Icon = item.icon;
                  const selected = i === selectedIndex;
                  return (
                    <button
                      key={item.href || item.path}
                      ref={(el) => {
                        itemRefs.current[i] = el;
                      }}
                      onClick={() => handleSelect(item.href || item.path)}
                      onMouseEnter={() => setSelectedIndex(i)}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-2 text-sm text-left transition-colors",
                        selected
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-foreground hover:bg-accent"
                      )}>
                      {Icon ? (
                        <Icon size={15} className="shrink-0" />
                      ) : (
                        <ArrowRight size={14} className="shrink-0" />
                      )}
                      <span className="flex-1 truncate">{getItemLabel(item)}</span>
                      <span className="text-[10px] text-muted-foreground truncate max-w-[120px] hidden sm:inline">
                        {item.href || item.path}
                      </span>
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
