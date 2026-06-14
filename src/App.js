import React, { useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { translationSelect } from "@/state/translation";

// Offline
import OfflineIndicator from "./components/organism/OfflineIndicator";
import { setupAutoSync } from "@/services/offline";

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
import DetailSupplier from "./page/supplier/DetailSupplier";

// Ingredient
import IngredientList from "./page/ingredient/IngredientList";
import AddIngredient from "./page/ingredient/AddIngredient";
import EditIngredient from "./page/ingredient/EditIngredient";
import DetailIngredient from "./page/ingredient/DetailIngredient";

// Ingredient Category
import IngredientCategoryList from "./page/ingredient-category/CategoryList";
import AddIngredientCategory from "./page/ingredient-category/AddCategory";

// Tax Config
import TaxConfigList from "./page/tax-config/TaxConfigList";
import AddTaxConfig from "./page/tax-config/AddTaxConfig";
import EditTaxConfig from "./page/tax-config/EditTaxConfig";

// Purchase Order
import PurchaseOrderList from "./page/purchase-order/PurchaseOrderList";
import AddPurchaseOrder from "./page/purchase-order/AddPurchaseOrder";
import DetailPurchaseOrder from "./page/purchase-order/DetailPurchaseOrder";
import EditPurchaseOrder from "./page/purchase-order/EditPurchaseOrder";
import PurchasePaymentList from "./page/purchase-order/PurchasePaymentList";

// Production Order
import ProductionOrderList from "./page/production-order/ProductionOrderList";
import AddProductionOrder from "./page/production-order/AddProductionOrder";
import DetailProductionOrder from "./page/production-order/DetailProductionOrder";

// Goods Receipt
import GoodsReceiptList from "./page/goods-receipt/GoodsReceiptList";
import AddGoodsReceipt from "./page/goods-receipt/AddGoodsReceipt";
import DetailGoodsReceipt from "./page/goods-receipt/DetailGoodsReceipt";
import EditGoodsReceipt from "./page/goods-receipt/EditGoodsReceipt";

// Sales Return
import SalesReturnList from "./page/sales-return/SalesReturnList";
import DetailSalesReturn from "./page/sales-return/DetailSalesReturn";

// Purchase Return
import PurchaseReturnList from "./page/purchase-return/PurchaseReturnList";
import DetailPurchaseReturn from "./page/purchase-return/DetailPurchaseReturn";

// Stock Transfer
import StockTransferList from "./page/stock-transfer/StockTransferList";
import AddStockTransfer from "./page/stock-transfer/AddStockTransfer";
import DetailStockTransfer from "./page/stock-transfer/DetailStockTransfer";

// Cash Register
import CashRegisterOpenClose from "./page/cash-register/CashRegisterOpenClose";
import CashRegisterCurrent from "./page/cash-register/CashRegisterCurrent";
import CashRegisterHistory from "./page/cash-register/CashRegisterHistory";
import CashRegisterDetail from "./page/cash-register/CashRegisterDetail";

// Price Store
import PriceStoreList from "./page/price-store/PriceStoreList";

// BOM
import BomList from "./page/bom/BomList";
import AddBom from "./page/bom/AddBom";
import DetailBom from "./page/bom/DetailBom";

// Cashier
import CashierPage from "./page/cashier/CashierPage";

// Kitchen Display
import KitchenDisplay from "./page/kitchen-display";

// Customer Order
import CustomerOrder from "./page/customer-order";

// Customer Display
import CustomerDisplay from "./page/customer-display";

// Reservation
import ReservationList from "./page/reservation/ReservationList";
import AddReservation from "./page/reservation/AddReservation";
import EditReservation from "./page/reservation/EditReservation";

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
import DetailTypePayment from "./page/type-payment/DetailTypePayment";

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
    const cleanup = setupAutoSync();
    return cleanup;
  }, []);

  useEffect(() => {
    const handleSessionExpired = () => setAuthExpiredModalOpen(true);
    window.addEventListener("auth:session-expired", handleSessionExpired);
    return () => window.removeEventListener("auth:session-expired", handleSessionExpired);
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
          <Route path="/kitchen-display" element={withLayout(<KitchenDisplay />)} />

          {/* Customer Order */}
          <Route path="/customer-order" element={<CustomerOrder />} />

          {/* Customer Display */}
          <Route path="/customer-display" element={<CustomerDisplay />} />

          {/* Reservation Routes */}
          <Route path="/reservation" element={withLayout(<ReservationList />)} />
          <Route path="/add-reservation" element={withLayout(<AddReservation />)} />
          <Route path="/edit-reservation" element={withLayout(<EditReservation />)} />

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
          <Route path="/detail-member-tier" element={withLayout(<DetailMemberTier />)} />

          <Route path="/discount-list" element={withLayout(<DiscountList />)} />
          <Route path="/add-discount" element={withLayout(<AddDiscount />)} />
          <Route path="/edit-discount" element={withLayout(<EditDiscount />)} />

          <Route path="/type-payment-list" element={withLayout(<TypePaymentList />)} />
          <Route path="/add-type-payment" element={withLayout(<AddTypePayment />)} />
          <Route path="/edit-type-payment" element={withLayout(<EditTypePayment />)} />
          <Route path="/detail-type-payment" element={withLayout(<DetailTypePayment />)} />

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
          <Route path="/detail-supplier" element={withLayout(<DetailSupplier />)} />

          <Route path="/ingredient" element={withLayout(<IngredientList />)} />
          <Route path="/add-ingredient" element={withLayout(<AddIngredient />)} />
          <Route path="/edit-ingredient" element={withLayout(<EditIngredient />)} />
          <Route path="/detail-ingredient" element={withLayout(<DetailIngredient />)} />

          <Route path="/ingredient-category" element={withLayout(<IngredientCategoryList />)} />
          <Route path="/add-ingredient-category" element={withLayout(<AddIngredientCategory />)} />
          <Route path="/edit-ingredient-category" element={withLayout(<AddIngredientCategory />)} />

          <Route path="/tax-list" element={withLayout(<TaxConfigList />)} />
          <Route path="/add-tax" element={withLayout(<AddTaxConfig />)} />
          <Route path="/edit-tax" element={withLayout(<EditTaxConfig />)} />

          <Route path="/purchase-order" element={withLayout(<PurchaseOrderList />)} />
          <Route path="/add-purchase-order" element={withLayout(<AddPurchaseOrder />)} />
          <Route path="/purchase-order/detail" element={withLayout(<DetailPurchaseOrder />)} />
          <Route path="/edit-purchase-order" element={withLayout(<EditPurchaseOrder />)} />
          <Route path="/purchase-payment" element={withLayout(<PurchasePaymentList />)} />

          <Route path="/production-order" element={withLayout(<ProductionOrderList />)} />
          <Route path="/add-production-order" element={withLayout(<AddProductionOrder />)} />
          <Route path="/production-order/detail" element={withLayout(<DetailProductionOrder />)} />

          <Route path="/goods-receipt" element={withLayout(<GoodsReceiptList />)} />
          <Route path="/add-goods-receipt" element={withLayout(<AddGoodsReceipt />)} />
          <Route path="/goods-receipt/detail" element={withLayout(<DetailGoodsReceipt />)} />
          <Route path="/edit-goods-receipt" element={withLayout(<EditGoodsReceipt />)} />

          <Route path="/sales-return" element={withLayout(<SalesReturnList />)} />
          <Route path="/sales-return/detail" element={withLayout(<DetailSalesReturn />)} />

          <Route path="/purchase-return" element={withLayout(<PurchaseReturnList />)} />
          <Route path="/purchase-return/detail" element={withLayout(<DetailPurchaseReturn />)} />

          <Route path="/stock-transfer" element={withLayout(<StockTransferList />)} />
          <Route path="/add-stock-transfer" element={withLayout(<AddStockTransfer />)} />
          <Route path="/stock-transfer/detail" element={withLayout(<DetailStockTransfer />)} />

          <Route path="/cash-register/open-close" element={withLayout(<CashRegisterOpenClose />)} />
          <Route path="/cash-register/current" element={withLayout(<CashRegisterCurrent />)} />
          <Route path="/cash-register/history" element={withLayout(<CashRegisterHistory />)} />
          <Route
            path="/cash-register/history/detail"
            element={withLayout(<CashRegisterDetail />)}
          />

          <Route path="/price-list-template" element={withLayout(<PriceStoreList />)} />

          <Route path="/bom" element={withLayout(<BomList />)} />
          <Route path="/bom/add" element={withLayout(<AddBom />)} />
          <Route path="/bom/detail" element={withLayout(<DetailBom />)} />

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
