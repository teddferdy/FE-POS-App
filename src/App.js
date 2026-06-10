import React, { useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { translationSelect } from "@/state/translation";
import { setAuthExpiredCallback } from "@/services";

// Offline
import OfflineIndicator from "./components/organism/OfflineIndicator";

// Tour Guide
import SuperAdminTour from "./components/organism/SuperAdminTour";

// Auth
import LoginPage from "./page/auth/login";
import Register from "./page/auth/register";
import ResetPassword from "./page/auth/reset-password";

// Layout
import DashboardLayout from "./components/layout/DashboardLayout";

// Dashboard
import Dashboard from "./page/dashboard";

// Location
import LocationList from "./page/location/LocationList";
import AddLocation from "./page/location/AddLocation";
import EditLocation from "./page/location/EditLocation";
import LocationDetail from "./page/location/LocationDetail";
import StoreGeospatial from "./page/location/StoreGeospatial";

// Invoice
import InvoicePage from "./page/invoice/InvoicePage";
// import InvoiceLogoList from "./page/invoice-logo/InvoiceLogoList";
// import AddInvoiceLogo from "./page/invoice-logo/AddInvoiceLogo";
// import EditInvoiceLogo from "./page/invoice-logo/EditInvoiceLogo";
// import AddInvoiceFooter from "./page/invoice-footer/AddInvoiceFooter";
// import EditInvoiceFooter from "./page/invoice-footer/EditInvoiceFooter";
// import SocialMediaList from "./page/social-media/SocialMediaList";

// Product
import ProductList from "./page/product/ProductList";
import AddProduct from "./page/product/AddProduct";
import EditProduct from "./page/product/EditProduct";

// Category
import CategoryList from "./page/category/CategoryList";
import AddCategory from "./page/category/AddCategory";
import EditCategory from "./page/category/EditCategory";
import DetailCategory from "./page/category/DetailCategory";

// User
import AdminList from "./page/user/AdminList";
import AddAdmin from "./page/user/AddAdmin";
// import AddRole from "./page/user/AddRole";

// Member
import MemberList from "./page/member/MemberList";
import AddMember from "./page/member/AddMember";
import EditMember from "./page/member/EditMember";

import MemberTier from "./page/member-tier";

// Report
import GlobalReport from "./page/report/GlobalReport";
import DailyReport from "./page/report/DailyReport";
import ProfitLossReport from "./page/report/ProfitLossReport";
import CashFlowReport from "./page/report/CashFlowReport";
import AddRole from "./page/user/AddRole";
import RoleManagement from "./page/role/RoleManagement";
import EditRole from "./page/role/EditRole";
import DetailRole from "./page/role/DetailRole";
import AddMemberTier from "./page/member-tier/AddMemberTier";
import DetailMemberTier from "./page/member-tier/DetailMemberTier";

// Employee
import EmployeeList from "./page/employee/EmployeeList";
import StockOpnameList from "./page/stock-opname/StockOpnameList";
import AddStockOpname from "./page/stock-opname/AddStockOpname";
import DetailStockOpname from "./page/stock-opname/DetailStockOpname";
import StockHistory from "./page/stock-opname/StockHistory";
import LowStock from "./page/stock-opname/LowStock";
import LowStockAll from "./page/stock-opname/LowStockAll";
import AddEmployee from "./page/employee/AddEmployee";
import EditEmployee from "./page/employee/EditEmployee";
import DetailEmployee from "./page/employee/DetailEmployee";
import PositionList from "./page/position/PositionList";
import AddPosition from "./page/position/AddPosition";
import EditPosition from "./page/position/EditPosition";
import DetailPosition from "./page/position/DetailPosition";
import DepartmentList from "./page/department/DepartmentList";
import AddDepartment from "./page/department/AddDepartment";
import EditDepartment from "./page/department/EditDepartment";
import DetailDepartment from "./page/department/DetailDepartment";

// Supplier
import SupplierList from "./page/supplier/SupplierList";
import AddSupplier from "./page/supplier/AddSupplier";
import EditSupplier from "./page/supplier/EditSupplier";

// Tax Config
import TaxConfigList from "./page/tax-config/TaxConfigList";
import AddTaxConfig from "./page/tax-config/AddTaxConfig";
import EditTaxConfig from "./page/tax-config/EditTaxConfig";

// Purchase Order
import PurchaseOrderList from "./page/purchase-order/PurchaseOrderList";
import AddPurchaseOrder from "./page/purchase-order/AddPurchaseOrder";

// Cashier
import CashierPage from "./page/cashier/CashierPage";

// Profile
import ProfilePage from "./page/profile/ProfilePage";

// Table
import TableList from "./page/table/TableList";

// Notification
import NotificationPage from "./page/notification/NotificationPage";

// Discount
import DiscountList from "./page/discount/DiscountList";
import AddDiscount from "./page/discount/AddDiscount";
import EditDiscount from "./page/discount/EditDiscount";

// Type Payment
import TypePaymentList from "./page/type-payment/TypePaymentList";
import AddTypePayment from "./page/type-payment/AddTypePayment";
import EditTypePayment from "./page/type-payment/EditTypePayment";

// Shift
import ShiftList from "./page/shift/ShiftList";
import AddShift from "./page/shift/AddShift";
import EditShift from "./page/shift/EditShift";

// Expense Category
import ExpenseCategoryList from "./page/expense-category/ExpenseCategoryList";
import AddExpenseCategory from "./page/expense-category/AddExpenseCategory";
import EditExpenseCategory from "./page/expense-category/EditExpenseCategory";

// Expense
import ExpenseList from "./page/expense/ExpenseList";
import AddExpense from "./page/expense/AddExpense";
import EditExpense from "./page/expense/EditExpense";

import Support from "./page/support";

import Modal from "@/components/organism/modal";

function App() {
  const { i18n } = useTranslation();
  const { translation } = translationSelect();
  const [authExpiredModalOpen, setAuthExpiredModalOpen] = useState(false);

  useEffect(() => {
    if (translation) {
      i18n.changeLanguage(translation);
    }
  }, [translation]);

  useEffect(() => {
    setAuthExpiredCallback(() => {
      setAuthExpiredModalOpen(true);
    });
  }, []);

  const withLayout = (element) => <DashboardLayout>{element}</DashboardLayout>;

  return (
    <React.Fragment>
      <OfflineIndicator />
      <BrowserRouter>
        <SuperAdminTour />
        <Routes>
          {/* Auth */}
          <Route path="/" element={<LoginPage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Dashboard Routes */}
          <Route path="/dashboard-super-admin" element={withLayout(<Dashboard />)} />
          <Route path="/dashboard-admin" element={withLayout(<Dashboard />)} />

          <Route path="/home" element={<CashierPage />} />

          {/* Super Admin & Admin Routes */}

          <Route path="/product-list" element={withLayout(<ProductList />)} />
          <Route path="/add-product" element={withLayout(<AddProduct />)} />
          <Route path="/edit-product" element={withLayout(<EditProduct />)} />

          <Route path="/category-list" element={withLayout(<CategoryList />)} />
          <Route path="/add-category" element={withLayout(<AddCategory />)} />
          <Route path="/edit-category" element={withLayout(<EditCategory />)} />
          <Route path="/detail-category" element={withLayout(<DetailCategory />)} />

          <Route path="/member-list" element={withLayout(<MemberList />)} />
          <Route path="/add-member" element={withLayout(<AddMember />)} />
          <Route path="/edit-member" element={withLayout(<EditMember />)} />

          <Route path="/member-tier" element={withLayout(<MemberTier />)} />
          <Route
            path="/add-member-tier"
            element={withLayout(<AddMemberTier title="Add Member Tier" />)}
          />
          <Route
            path="/detail-member-tier"
            element={withLayout(<DetailMemberTier />)}
          />

          <Route path="/discount-list" element={withLayout(<DiscountList />)} />
          <Route path="/add-discount" element={withLayout(<AddDiscount />)} />
          <Route path="/edit-discount" element={withLayout(<EditDiscount />)} />

          <Route path="/type-payment-list" element={withLayout(<TypePaymentList />)} />
          <Route path="/add-type-payment" element={withLayout(<AddTypePayment />)} />
          <Route path="/edit-type-payment" element={withLayout(<EditTypePayment />)} />

          <Route path="/shift-list" element={withLayout(<ShiftList />)} />
          <Route path="/add-shift" element={withLayout(<AddShift />)} />
          <Route path="/edit-shift" element={withLayout(<EditShift />)} />

          <Route path="/user-list" element={withLayout(<AdminList />)} />
          <Route path="/add-user" element={withLayout(<AddAdmin />)} />
          <Route path="/add-employee" element={withLayout(<AddEmployee />)} />
          <Route path="/edit-employee" element={withLayout(<EditEmployee />)} />
          <Route path="/add-role" element={withLayout(<AddRole />)} />
          <Route path="/edit-role/:id" element={withLayout(<EditRole />)} />
          <Route path="/detail-role/:id" element={withLayout(<DetailRole />)} />
          <Route path="/role-management" element={withLayout(<RoleManagement />)} />
          <Route path="/employee-list" element={withLayout(<EmployeeList />)} />
          <Route path="/detail-employee" element={withLayout(<DetailEmployee />)} />

          <Route path="/location-list" element={withLayout(<LocationList />)} />
          <Route path="/add-location" element={withLayout(<AddLocation />)} />
          <Route path="/edit-location" element={withLayout(<EditLocation />)} />
          <Route path="/detail-location" element={withLayout(<LocationDetail />)} />
          <Route path="/store-geospatial" element={withLayout(<StoreGeospatial />)} />

          <Route path="/invoice-page" element={withLayout(<InvoicePage />)} />
          {/* <Route path="/logo-invoice-list" element={withLayout(<InvoiceLogoList />)} />
          <Route path="/add-logo-invoice" element={withLayout(<AddInvoiceLogo />)} />
          <Route path="/edit-logo-invoice" element={withLayout(<EditInvoiceLogo />)} /> */}
          {/* <Route path="/footer-invoice-list" element={withLayout(<AddInvoiceFooter />)} />
          <Route path="/add-footer-invoice" element={withLayout(<AddInvoiceFooter />)} /> */}
          {/* <Route path="/edit-footer-invoice" element={withLayout(<EditInvoiceFooter />)} /> */}
          {/* <Route path="/social-media-invoice-list" element={withLayout(<SocialMediaList />)} />
          <Route path="/add-social-media-invoice" element={withLayout(<SocialMediaList />)} />
          <Route path="/edit-social-media-invoice" element={withLayout(<SocialMediaList />)} /> */}

          <Route path="/position-list" element={withLayout(<PositionList />)} />
          <Route path="/add-position" element={withLayout(<AddPosition />)} />
          <Route path="/edit-position" element={withLayout(<EditPosition />)} />
          <Route path="/detail-position" element={withLayout(<DetailPosition />)} />
          <Route path="/department-list" element={withLayout(<DepartmentList />)} />
          <Route path="/add-department" element={withLayout(<AddDepartment />)} />
          <Route path="/edit-department" element={withLayout(<EditDepartment />)} />
          <Route path="/detail-department" element={withLayout(<DetailDepartment />)} />

          {/* Table Routes */}
          <Route path="/table-list" element={withLayout(<TableList />)} />
          {/* Mobile add/edit handled in TableList modal */}

          <Route path="/supplier" element={withLayout(<SupplierList />)} />
          <Route path="/add-supplier" element={withLayout(<AddSupplier />)} />
          <Route path="/edit-supplier" element={withLayout(<EditSupplier />)} />

          <Route path="/tax-list" element={withLayout(<TaxConfigList />)} />
          <Route path="/add-tax" element={withLayout(<AddTaxConfig />)} />
          <Route path="/edit-tax" element={withLayout(<EditTaxConfig />)} />

          <Route path="/purchase-order" element={withLayout(<PurchaseOrderList />)} />
          <Route path="/add-purchase-order" element={withLayout(<AddPurchaseOrder />)} />

          <Route path="/stock-opname" element={withLayout(<StockOpnameList />)} />
          <Route path="/stock-opname/detail" element={withLayout(<DetailStockOpname />)} />
          <Route path="/add-stock-opname" element={withLayout(<AddStockOpname />)} />

          <Route path="/stock-history" element={withLayout(<StockHistory />)} />
          <Route path="/low-stock" element={withLayout(<LowStock />)} />
          <Route path="/low-stock-all" element={withLayout(<LowStockAll />)} />
          <Route path="/notification" element={withLayout(<NotificationPage />)} />

          <Route path="/expense-category" element={withLayout(<ExpenseCategoryList />)} />
          <Route path="/add-expense-category" element={withLayout(<AddExpenseCategory />)} />
          <Route path="/edit-expense-category" element={withLayout(<EditExpenseCategory />)} />

          <Route path="/expense" element={withLayout(<ExpenseList />)} />
          <Route path="/add-expense" element={withLayout(<AddExpense />)} />
          <Route path="/edit-expense" element={withLayout(<EditExpense />)} />

          <Route path="/support" element={withLayout(<Support />)} />

          <Route path="/profile" element={withLayout(<ProfilePage />)} />

          <Route path="/report/sales" element={withLayout(<GlobalReport />)} />
          <Route path="/best-selling" element={withLayout(<GlobalReport />)} />
          <Route path="/report/daily" element={withLayout(<DailyReport />)} />
          <Route path="/report/profit-loss" element={withLayout(<ProfitLossReport />)} />
          <Route path="/report/cash-flow" element={withLayout(<CashFlowReport />)} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>

      <Modal
        type="error"
        open={authExpiredModalOpen}
        onOpenChange={setAuthExpiredModalOpen}
        title="Sesi Berakhir"
        description="Sesi login Anda telah berakhir. Silakan login kembali untuk melanjutkan."
        confirmText="Login Ulang"
        onConfirm={() => {
          setAuthExpiredModalOpen(false);
          window.location.href = "/";
        }}
      />
    </React.Fragment>
  );
}

export default App;
