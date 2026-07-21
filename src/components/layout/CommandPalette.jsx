/* eslint-disable react/prop-types */
import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Search, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const pages = [
  {
    path: "/dashboard-super-admin",
    label: "Dashboard Super Admin",
    keywords: "dashboard super admin"
  },
  { path: "/dashboard-admin", label: "Dashboard Admin", keywords: "dashboard admin" },
  { path: "/home", label: "Kasir", keywords: "kasir cashier pos" },
  { path: "/product-list", label: "Daftar Produk", keywords: "produk product list daftar" },
  { path: "/add-product", label: "Tambah Produk", keywords: "tambah produk add product" },
  { path: "/edit-product", label: "Edit Produk", keywords: "edit produk product" },
  { path: "/category-list", label: "Kategori", keywords: "kategori category" },
  { path: "/add-category", label: "Tambah Kategori", keywords: "tambah kategori add category" },
  { path: "/supplier", label: "Supplier", keywords: "supplier pemasok" },
  { path: "/add-supplier", label: "Tambah Supplier", keywords: "tambah supplier add" },
  { path: "/supplier-comparison", label: "Bandingkan Supplier", keywords: "bandingkan supplier compare" },
  { path: "/member-list", label: "Daftar Member", keywords: "member pelanggan customer" },
  { path: "/add-member", label: "Tambah Member", keywords: "tambah member add" },
  { path: "/member-tier", label: "Member Tier", keywords: "member tier level" },
  { path: "/discount-list", label: "Diskon", keywords: "diskon discount promo" },
  { path: "/add-discount", label: "Tambah Diskon", keywords: "tambah diskon add discount" },
  {
    path: "/type-payment-list",
    label: "Metode Pembayaran",
    keywords: "pembayaran payment metode type"
  },
  { path: "/shift-list", label: "Shift", keywords: "shift jadwal" },
  { path: "/table-list", label: "Meja", keywords: "meja table" },
  { path: "/stock-opname", label: "Stock Opname", keywords: "stock opname stok" },
  { path: "/add-stock-opname", label: "Tambah Stock Opname", keywords: "tambah stock opname add" },
  { path: "/stock-history", label: "Riwayat Stok", keywords: "riwayat stok stock history" },
  { path: "/low-stock", label: "Stok Menipis", keywords: "stok menipis low stock" },
  { path: "/purchase-order", label: "Purchase Order", keywords: "purchase order po beli" },
  { path: "/add-purchase-order", label: "Tambah PO", keywords: "tambah purchase order po" },
  { path: "/employee-list", label: "Daftar Karyawan", keywords: "karyawan employee staff" },
  { path: "/add-employee", label: "Tambah Karyawan", keywords: "tambah karyawan add employee" },
  { path: "/department-list", label: "Departemen", keywords: "departemen department" },
  { path: "/position-list", label: "Posisi", keywords: "posisi position jabatan" },
  { path: "/location-list", label: "Kelola Toko", keywords: "toko location store kelola" },
  { path: "/add-location", label: "Tambah Toko", keywords: "tambah toko add location store" },
  { path: "/store-geospatial", label: "Peta Toko", keywords: "peta toko geospatial map" },
  { path: "/user-list", label: "Admin", keywords: "admin user pengguna" },
  { path: "/add-user", label: "Tambah Admin", keywords: "tambah admin add user" },
  { path: "/support", label: "Support", keywords: "support bantuan help faq kontak cs" },
  { path: "/role-management", label: "Role Management", keywords: "role hak akses permission" },
  { path: "/add-role", label: "Tambah Role", keywords: "tambah role add" },
  { path: "/invoice-page", label: "Pengaturan Invoice", keywords: "invoice struk pengaturan" },
  { path: "/tax-list", label: "Pajak", keywords: "pajak tax ppn" },
  { path: "/add-tax", label: "Tambah Pajak", keywords: "tambah pajak add tax" },
  { path: "/report/sales", label: "Laporan Penjualan", keywords: "laporan penjualan sales report" },
  { path: "/best-selling", label: "Produk Terlaris", keywords: "produk terlaris best selling" },
  {
    path: "/expense-category",
    label: "Kategori Pengeluaran",
    keywords: "kategori pengeluaran expense"
  },
  { path: "/expense", label: "Pengeluaran", keywords: "pengeluaran expense" },
  { path: "/notification", label: "Notifikasi", keywords: "notifikasi notification" }
];

const getLabel = (page, tFn) => tFn(page.path, { defaultValue: page.label });

const CommandPalette = ({ open, onClose }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const filtered = useMemo(() => {
    if (!query.trim()) return pages;
    const q = query.toLowerCase();
    return pages.filter((p) => {
      const displayLabel = getLabel(p, t).toLowerCase();
      return (
        displayLabel.includes(q) ||
        p.keywords.toLowerCase().includes(q) ||
        p.path.toLowerCase().includes(q)
      );
    });
  }, [query, t]);

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

  const handleSelect = (path) => {
    navigate(path);
    onClose();
  };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && filtered[selectedIndex]) {
      handleSelect(filtered[selectedIndex].path);
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

  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center pt-[15vh]">
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

        <div className="max-h-72 overflow-y-auto py-1">
          {filtered.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              {t("commandPalette.notFound", { query })}
            </div>
          ) : (
            filtered.map((page, i) => (
              <button
                key={page.path}
                onClick={() => handleSelect(page.path)}
                onMouseEnter={() => setSelectedIndex(i)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors",
                  i === selectedIndex
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-foreground hover:bg-accent"
                )}>
                <ArrowRight
                  size={14}
                  className={i === selectedIndex ? "text-primary" : "text-muted-foreground"}
                />
                <span className="flex-1 truncate">{getLabel(page, t)}</span>
                <span className="text-[10px] text-muted-foreground truncate max-w-[120px] hidden sm:inline">
                  {page.path}
                </span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
