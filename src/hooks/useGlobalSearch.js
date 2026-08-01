import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const searchItems = [
  // Navigation items
  { 
    id: "nav-dashboard", 
    label: "navigation.dashboard", 
    description: "navigation.dashboardDesc", 
    icon: "LayoutDashboard", 
    path: "/dashboard-super-admin", 
    category: "navigation" 
  },
  { 
    id: "nav-cashier", 
    label: "navigation.cashier", 
    description: "navigation.cashierDesc", 
    icon: "ShoppingCart", 
    path: "/home", 
    category: "navigation" 
  },
  { 
    id: "nav-qrorder", 
    label: "navigation.qrOrder", 
    description: "navigation.qrOrderDesc", 
    icon: "QrCode", 
    path: "/qr-order-management", 
    category: "navigation" 
  },
  { 
    id: "nav-products", 
    label: "navigation.products", 
    description: "navigation.productsDesc", 
    icon: "Package", 
    path: "/product", 
    category: "navigation" 
  },
  { 
    id: "nav-members", 
    label: "navigation.members", 
    description: "navigation.membersDesc", 
    icon: "Users", 
    path: "/member", 
    category: "navigation" 
  },
  { 
    id: "nav-orders", 
    label: "navigation.orders", 
    description: "navigation.ordersDesc", 
    icon: "List", 
    path: "/order", 
    category: "navigation" 
  },
  { 
    id: "nav-inventory", 
    label: "navigation.inventory", 
    description: "navigation.inventoryDesc", 
    icon: "Package", 
    path: "/inventory", 
    category: "navigation" 
  },
  { 
    id: "nav-reports", 
    label: "navigation.reports", 
    description: "navigation.reportsDesc", 
    icon: "BarChart3", 
    path: "/report", 
    category: "navigation" 
  },
  { 
    id: "nav-settings", 
    label: "navigation.settings", 
    description: "navigation.settingsDesc", 
    icon: "Settings", 
    path: "/settings", 
    category: "navigation" 
  },
];

export const useGlobalSearch = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSelect = useCallback((item) => {
    if (item.path) {
      navigate(item.path);
    }
    setIsOpen(false);
  }, [navigate]);

  const searchItemsWithLabels = searchItems.map(item => ({
    ...item,
    label: t(item.label),
    description: t(item.description),
  }));

  return {
    isOpen,
    setIsOpen,
    searchItems: searchItemsWithLabels,
    handleSelect,
  };
};
