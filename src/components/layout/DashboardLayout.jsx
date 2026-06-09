/* eslint-disable react/prop-types */
import React, { useState, useEffect } from "react";
import { useCookies } from "react-cookie";
import { useQuery } from "react-query";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getAllLocation } from "@/services/location";
import Sidebar from "./Sidebar";
import Header from "./Header";
import CommandPalette from "./CommandPalette";
import { TipsCard } from "@/components/ui/tips-card";
import FloatingTourButton from "@/components/organism/FloatingTourButton";

const tipsKeys = {
  "/product-list": ["tips.product", "tips.product2", "tips.product3"],
  "/add-product": ["tips.product", "tips.product2", "tips.product3"],
  "/edit-product": ["tips.product", "tips.product2", "tips.product3"],
  "/category-list": ["tips.category", "tips.category2"],
  "/supplier": ["tips.supplier", "tips.supplier2"],
  "/member-list": ["tips.member", "tips.member2"],
  "/member-tier": ["tips.memberTier", "tips.memberTier2"],
  "/discount-list": ["tips.discount", "tips.discount2"],
  "/type-payment-list": ["tips.payment", "tips.payment2"],
  "/shift-list": ["tips.shift", "tips.shift2"],
  "/purchase-order": ["tips.purchaseOrder", "tips.purchaseOrder2"],
  "/stock-opname": ["tips.stockOpname", "tips.stockOpname2"],
  "/stock-history": ["tips.stockHistory", "tips.stockHistory2"],
  "/low-stock": ["tips.lowStock", "tips.lowStock2"],
  "/expense-category": ["tips.expense", "tips.expense2"],
  "/expense": ["tips.expense", "tips.expense2"],
  "/employee-list": ["tips.employee", "tips.employee2"],
  "/department-list": ["tips.department", "tips.department2"],
  "/position-list": ["tips.position", "tips.position2"],
  "/table-list": ["tips.table"],
  "/tax-list": ["tips.tax", "tips.tax2"],
  "/location-list": ["tips.location", "tips.location2"],
  "/user-list": ["tips.user", "tips.user2"],
  "/report/sales": ["tips.report", "tips.report2"],
  "/best-selling": ["tips.report", "tips.report2"],
  "/invoice-page": ["tips.invoice", "tips.invoice2", "tips.invoice3"],
  "/cashier": ["tips.cashier", "tips.cashier2", "tips.cashier3"],
  "/dashboard": ["tips.dashboard", "tips.dashboard2"]
};

const DashboardLayout = ({ children }) => {
  const { t } = useTranslation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [cookie, setCookie] = useCookies();
  const location = useLocation();

  const user = cookie?.user;
  const role = user?.role || user?.roleType || "";

   const { data: locationsData } = useQuery(["allLocations"], getAllLocation, {
     enabled: role === "super_admin" && !cookie?.activeStore
   });
  const locations = locationsData?.data || [];

  useEffect(() => {
    if (role === "super_admin" && locations.length > 0 && !cookie?.activeStore) {
      const first = locations[0];
      const firstId = first.id || first._id;
      const firstName = first.name || first.storeName || "";
      setCookie("activeStore", firstId, { path: "/" });
      setCookie("activeStoreName", firstName, { path: "/" });
      setCookie("user", { ...user, store: firstId, storeName: firstName }, { path: "/" });
    }
  }, [locations]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (
        e.target.tagName === "INPUT" ||
        e.target.tagName === "TEXTAREA" ||
        e.target.tagName === "SELECT"
      )
        return;
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsPaletteOpen(true);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleToggleSidebar = () => {
    setSidebarCollapsed((prev) => !prev);
  };

  const handleMobileMenuToggle = () => {
    setMobileSidebarOpen((prev) => !prev);
  };

  const currentPath = location.pathname;
  const matchedKeys = Object.entries(tipsKeys).find(([path]) => currentPath.startsWith(path));
  const tips = matchedKeys?.[1]?.map((key) => t(key));

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar collapsed={sidebarCollapsed} onToggle={handleToggleSidebar} />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="fixed left-0 top-0 h-screen w-64 animate-in slide-in-from-left">
            <Sidebar collapsed={false} onToggle={() => setMobileSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarCollapsed ? "lg:ml-16" : "lg:ml-64"}`}>
        <Header
          onMenuToggle={handleMobileMenuToggle}
          onOpenPalette={() => setIsPaletteOpen(true)}
        />
        <main className="p-4 lg:p-6">
          {children}
          {tips && (
            <div className="mt-6">
              <TipsCard title="Tips" variant="default" tips={tips} />
            </div>
          )}
        </main>
      </div>

      {/* Command Palette - above everything */}
      <CommandPalette open={isPaletteOpen} onClose={() => setIsPaletteOpen(false)} />

      {/* Floating Tour Button - super_admin only */}
      <FloatingTourButton />
    </div>
  );
};

export default DashboardLayout;
