/* eslint-disable react/prop-types */
import React, { useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { translationSelect } from "@/state/translation";

// Auth
import LoginPage from "./page/auth/login";
import Register from "./page/auth/register";
import ResetPassword from "./page/auth/reset-password";

// Layout
import DashboardLayout from "./components/layout/DashboardLayout";

// Dashboard
import Dashboard from "./page/dashboard";
import GlobalSetting from "./page/global-setting";

// Location
import LocationList from "./page/location/LocationList";
import AddLocation from "./page/location/AddLocation";
import EditLocation from "./page/location/EditLocation";
import LocationDetail from "./page/location/LocationDetail";

// Product
import ProductList from "./page/product/ProductList";

// Category
import CategoryList from "./page/category/CategoryList";
import AddCategory from "./page/category/AddCategory";

// User
import AdminList from "./page/user/AdminList";
import AddAdmin from "./page/user/AddAdmin";
// import AddRole from "./page/user/AddRole";

// Member
import MemberList from "./page/member/MemberList";
import AddMember from "./page/member/AddMember";
import MemberDetail from "./page/member/MemberDetail";
import MemberTier from "./page/member-tier";

// Report
import GlobalReport from "./page/report/GlobalReport";
import AddRole from "./page/user/AddRole";
import AddMemberTier from "./page/member-tier/AddMemberTier";

function App() {
  const { i18n } = useTranslation();
  const { translation } = translationSelect();

  useEffect(() => {
    if (translation) {
      i18n.changeLanguage(translation);
    }
  }, [translation]);

  const withLayout = (element) => <DashboardLayout>{element}</DashboardLayout>;

  const ComingSoon = ({ title }) => (
    <div className="flex items-center justify-center h-64 text-muted-foreground">
      {title || "Coming Soon"}
    </div>
  );

  return (
    <BrowserRouter>
      <Routes>
        {/* Auth */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Dashboard Routes */}
        <Route path="/dashboard-super-admin" element={withLayout(<Dashboard />)} />
        <Route path="/dashboard-admin" element={withLayout(<Dashboard />)} />
        <Route path="/dashboard-by-outlet" element={withLayout(<Dashboard />)} />
        <Route path="/home" element={withLayout(<Dashboard />)} />

        {/* Super Admin & Admin Routes */}
        <Route path="/product-page" element={withLayout(<ComingSoon title="Product Page" />)} />
        <Route
          path="/product-by-outlet"
          element={withLayout(<ComingSoon title="Products By Outlet" />)}
        />
        <Route path="/product-list" element={withLayout(<ProductList />)} />
        <Route path="/add-product" element={withLayout(<ComingSoon title="Add Product" />)} />
        <Route path="/edit-product" element={withLayout(<ComingSoon title="Edit Product" />)} />

        <Route path="/category-list" element={withLayout(<CategoryList />)} />
        <Route path="/add-category" element={withLayout(<AddCategory />)} />
        <Route path="/edit-category" element={withLayout(<ComingSoon title="Edit Category" />)} />

        <Route
          path="/sub-category-list"
          element={withLayout(<ComingSoon title="Sub Category List" />)}
        />
        <Route
          path="/add-sub-category"
          element={withLayout(<ComingSoon title="Add Sub Category" />)}
        />
        <Route
          path="/edit-sub-category"
          element={withLayout(<ComingSoon title="Edit Sub Category" />)}
        />

        <Route path="/member-list" element={withLayout(<MemberList />)} />
        <Route path="/add-member" element={withLayout(<AddMember />)} />
        <Route path="/member-detail" element={withLayout(<MemberDetail />)} />
        <Route path="/member-tier" element={withLayout(<MemberTier />)} />
        <Route
          path="/add-member-tier"
          element={withLayout(<AddMemberTier title="Add Member Tier" />)}
        />
        <Route
          path="/edit-member-tier"
          element={withLayout(<ComingSoon title="Edit Member Tier" />)}
        />

        <Route path="/discount-list" element={withLayout(<ComingSoon title="Discount List" />)} />
        <Route path="/add-discount" element={withLayout(<ComingSoon title="Add Discount" />)} />
        <Route path="/edit-discount" element={withLayout(<ComingSoon title="Edit Discount" />)} />

        <Route
          path="/type-payment-list"
          element={withLayout(<ComingSoon title="Type Payment List" />)}
        />
        <Route
          path="/add-type-payment"
          element={withLayout(<ComingSoon title="Add Type Payment" />)}
        />
        <Route
          path="/edit-type-payment"
          element={withLayout(<ComingSoon title="Edit Type Payment" />)}
        />

        <Route path="/shift-list" element={withLayout(<ComingSoon title="Shift List" />)} />
        <Route path="/add-shift" element={withLayout(<ComingSoon title="Add Shift" />)} />
        <Route path="/edit-shift" element={withLayout(<ComingSoon title="Edit Shift" />)} />

        <Route path="/user-list" element={withLayout(<AdminList />)} />
        <Route path="/add-user" element={withLayout(<AddAdmin />)} />
        <Route path="/add-role" element={withLayout(<AddRole />)} />
        <Route path="/employee-list" element={withLayout(<ComingSoon title="Employee List" />)} />

        <Route path="/location-list" element={withLayout(<LocationList />)} />
        <Route path="/add-location" element={withLayout(<AddLocation />)} />
        <Route path="/edit-location" element={withLayout(<EditLocation />)} />
        <Route path="/detail-location" element={withLayout(<LocationDetail />)} />

        <Route path="/invoice-page" element={withLayout(<ComingSoon title="Invoice Page" />)} />
        <Route
          path="/logo-invoice-list"
          element={withLayout(<ComingSoon title="Logo Invoice" />)}
        />
        <Route
          path="/footer-invoice-list"
          element={withLayout(<ComingSoon title="Footer Invoice" />)}
        />
        <Route
          path="/social-media-invoice-list"
          element={withLayout(<ComingSoon title="Social Media Invoice" />)}
        />
        <Route
          path="/add-social-media"
          element={withLayout(<ComingSoon title="Add Social Media" />)}
        />
        <Route
          path="/edit-social-media"
          element={withLayout(<ComingSoon title="Edit Social Media" />)}
        />

        {/* Global Setting Routes */}
        <Route path="/global-setting" element={withLayout(<GlobalSetting />)} />
        <Route
          path="/social-media-list"
          element={withLayout(<ComingSoon title="Social Media" />)}
        />
        <Route
          path="/add-social-media"
          element={withLayout(<ComingSoon title="Add Social Media" />)}
        />
        <Route
          path="/edit-social-media"
          element={withLayout(<ComingSoon title="Edit Social Media" />)}
        />
        <Route
          path="/add-invoice-logo"
          element={withLayout(<ComingSoon title="Add Invoice Logo" />)}
        />
        <Route
          path="/edit-invoice-logo"
          element={withLayout(<ComingSoon title="Edit Invoice Logo" />)}
        />
        <Route
          path="/add-invoice-footer"
          element={withLayout(<ComingSoon title="Add Invoice Footer" />)}
        />
        <Route
          path="/edit-invoice-footer"
          element={withLayout(<ComingSoon title="Edit Invoice Footer" />)}
        />
        <Route
          path="/add-invoice-social-media"
          element={withLayout(<ComingSoon title="Add Invoice Social Media" />)}
        />
        <Route
          path="/edit-invoice-social-media"
          element={withLayout(<ComingSoon title="Edit Invoice Social Media" />)}
        />

        <Route path="/role-list" element={withLayout(<ComingSoon title="Role List" />)} />
        <Route path="/position-list" element={withLayout(<ComingSoon title="Position List" />)} />

        {/* New Feature Routes */}
        <Route path="/table-list" element={withLayout(<ComingSoon title="Table List" />)} />
        <Route path="/add-table" element={withLayout(<ComingSoon title="Add Table" />)} />
        <Route path="/edit-table" element={withLayout(<ComingSoon title="Edit Table" />)} />

        <Route path="/supplier" element={withLayout(<ComingSoon title="Supplier" />)} />
        <Route path="/add-supplier" element={withLayout(<ComingSoon title="Add Supplier" />)} />
        <Route path="/edit-supplier" element={withLayout(<ComingSoon title="Edit Supplier" />)} />

        <Route path="/purchase-order" element={withLayout(<ComingSoon title="Purchase Order" />)} />
        <Route
          path="/add-purchase-order"
          element={withLayout(<ComingSoon title="Add Purchase Order" />)}
        />

        <Route path="/stock-opname" element={withLayout(<ComingSoon title="Stock Opname" />)} />
        <Route
          path="/add-stock-opname"
          element={withLayout(<ComingSoon title="Add Stock Opname" />)}
        />

        <Route path="/stock-history" element={withLayout(<ComingSoon title="Stock History" />)} />

        <Route
          path="/expense-category"
          element={withLayout(<ComingSoon title="Expense Category" />)}
        />
        <Route
          path="/add-expense-category"
          element={withLayout(<ComingSoon title="Add Expense Category" />)}
        />
        <Route
          path="/edit-expense-category"
          element={withLayout(<ComingSoon title="Edit Expense Category" />)}
        />

        <Route path="/expense" element={withLayout(<ComingSoon title="Expense" />)} />
        <Route path="/add-expense" element={withLayout(<ComingSoon title="Add Expense" />)} />
        <Route path="/edit-expense" element={withLayout(<ComingSoon title="Edit Expense" />)} />

        <Route path="/report/sales" element={withLayout(<GlobalReport />)} />
        <Route path="/best-selling" element={withLayout(<GlobalReport />)} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
