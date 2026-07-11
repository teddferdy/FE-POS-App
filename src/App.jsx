import React, { useEffect, useState, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import RouteProgress from "@/components/ui/route-progress";
import { useTranslation } from "react-i18next";
import { translationSelect } from "@/state/translation";
import useKeyboardShortcuts from "@/hooks/useKeyboardShortcuts";

// Offline
import OfflineIndicator from "./components/organism/OfflineIndicator";
import { setupAutoSync } from "@/services/offline";

// Layout
import DashboardLayout from "./components/layout/DashboardLayout";
import NotFoundPage from "@/components/ui/NotFoundPage";

import Modal from "@/components/organism/modal";
import ErrorBoundary from "@/components/ErrorBoundary";

// Auth
const LoginPage = React.lazy(() => import("./page/auth/login"));
const Register = React.lazy(() => import("./page/auth/register"));
const ResetPassword = React.lazy(() => import("./page/auth/reset-password"));

// Dashboard
const Dashboard = React.lazy(() => import("./page/dashboard"));

// Location
const LocationList = React.lazy(() => import("./page/location/LocationList"));
const AddLocation = React.lazy(() => import("./page/location/AddLocation"));
const EditLocation = React.lazy(() => import("./page/location/EditLocation"));
const LocationDetail = React.lazy(() => import("./page/location/LocationDetail"));
const StoreGeospatial = React.lazy(() => import("./page/location/StoreGeospatial"));

// Invoice
const InvoicePage = React.lazy(() => import("./page/invoice/InvoicePage"));

// Product
const ProductList = React.lazy(() => import("./page/product/ProductList"));
const AddProduct = React.lazy(() => import("./page/product/AddProduct"));
const EditProduct = React.lazy(() => import("./page/product/EditProduct"));
const DetailProduct = React.lazy(() => import("./page/product/DetailProduct"));

// Category
const CategoryList = React.lazy(() => import("./page/category/CategoryList"));
const AddCategory = React.lazy(() => import("./page/category/AddCategory"));
const EditCategory = React.lazy(() => import("./page/category/EditCategory"));
const DetailCategory = React.lazy(() => import("./page/category/DetailCategory"));

// User
const AdminList = React.lazy(() => import("./page/user/AdminList"));
const AddAdmin = React.lazy(() => import("./page/user/AddAdmin"));

// Member
const MemberList = React.lazy(() => import("./page/member/MemberList"));
const AddMember = React.lazy(() => import("./page/member/AddMember"));
const EditMember = React.lazy(() => import("./page/member/EditMember"));
const MemberDetail = React.lazy(() => import("./page/member/MemberDetail"));
const MemberPointHistory = React.lazy(() => import("./page/member/MemberPointHistory"));

const MemberTier = React.lazy(() => import("./page/member-tier"));

// Report
const SalesReportPage = React.lazy(() => import("./page/report/SalesReportPage"));
const BestSellingReportPage = React.lazy(() => import("./page/report/BestSellingReportPage"));
const DailyReport = React.lazy(() => import("./page/report/DailyReport"));
const ProfitLossReport = React.lazy(() => import("./page/report/ProfitLossReport"));
const CashFlowReport = React.lazy(() => import("./page/report/CashFlowReport"));
const ProfitPerProduct = React.lazy(() => import("./page/report/ProfitPerProduct"));
const AddRole = React.lazy(() => import("./page/user/AddRole"));
const RoleManagement = React.lazy(() => import("./page/role/RoleManagement"));
const EditRole = React.lazy(() => import("./page/role/EditRole"));
const DetailRole = React.lazy(() => import("./page/role/DetailRole"));
const AddMemberTier = React.lazy(() => import("./page/member-tier/AddMemberTier"));
const EditMemberTier = React.lazy(() => import("./page/member-tier/EditMemberTier"));
const DetailMemberTier = React.lazy(() => import("./page/member-tier/DetailMemberTier"));

// Employee
const EmployeeList = React.lazy(() => import("./page/employee/EmployeeList"));
const StockOpnameList = React.lazy(() => import("./page/stock-opname/StockOpnameList"));
const AddStockOpname = React.lazy(() => import("./page/stock-opname/AddStockOpname"));
const DetailStockOpname = React.lazy(() => import("./page/stock-opname/DetailStockOpname"));
const StockHistory = React.lazy(() => import("./page/stock-opname/StockHistory"));
const LowStock = React.lazy(() => import("./page/stock-opname/LowStock"));
const LowStockAll = React.lazy(() => import("./page/stock-opname/LowStockAll"));
const StockAdjustment = React.lazy(() => import("./page/stock-adjustment/StockAdjustment"));
const AddEmployee = React.lazy(() => import("./page/employee/AddEmployee"));
const EditEmployee = React.lazy(() => import("./page/employee/EditEmployee"));
const DetailEmployee = React.lazy(() => import("./page/employee/DetailEmployee"));
const PositionList = React.lazy(() => import("./page/position/PositionList"));
const AddPosition = React.lazy(() => import("./page/position/AddPosition"));
const EditPosition = React.lazy(() => import("./page/position/EditPosition"));
const DetailPosition = React.lazy(() => import("./page/position/DetailPosition"));
const DepartmentList = React.lazy(() => import("./page/department/DepartmentList"));
const AddDepartment = React.lazy(() => import("./page/department/AddDepartment"));
const EditDepartment = React.lazy(() => import("./page/department/EditDepartment"));
const DetailDepartment = React.lazy(() => import("./page/department/DetailDepartment"));

// Supplier
const SupplierList = React.lazy(() => import("./page/supplier/SupplierList"));
const AddSupplier = React.lazy(() => import("./page/supplier/AddSupplier"));
const EditSupplier = React.lazy(() => import("./page/supplier/EditSupplier"));
const DetailSupplier = React.lazy(() => import("./page/supplier/DetailSupplier"));

// Ingredient
const IngredientList = React.lazy(() => import("./page/ingredient/IngredientList"));
const AddIngredient = React.lazy(() => import("./page/ingredient/AddIngredient"));
const EditIngredient = React.lazy(() => import("./page/ingredient/EditIngredient"));
const DetailIngredient = React.lazy(() => import("./page/ingredient/DetailIngredient"));

// Ingredient Category
const IngredientCategoryList = React.lazy(() => import("./page/ingredient-category/CategoryList"));
const AddIngredientCategory = React.lazy(() => import("./page/ingredient-category/AddCategory"));
const EditIngredientCategory = React.lazy(() => import("./page/ingredient-category/EditCategory"));

// Tax Config
const TaxConfigList = React.lazy(() => import("./page/tax-config/TaxConfigList"));
const AddTaxConfig = React.lazy(() => import("./page/tax-config/AddTaxConfig"));
const EditTaxConfig = React.lazy(() => import("./page/tax-config/EditTaxConfig"));

// Purchase Order
const PurchaseOrderList = React.lazy(() => import("./page/purchase-order/PurchaseOrderList"));
const AddPurchaseOrder = React.lazy(() => import("./page/purchase-order/AddPurchaseOrder"));
const DetailPurchaseOrder = React.lazy(() => import("./page/purchase-order/DetailPurchaseOrder"));
const EditPurchaseOrder = React.lazy(() => import("./page/purchase-order/EditPurchaseOrder"));
const PurchasePaymentList = React.lazy(() => import("./page/purchase-order/PurchasePaymentList"));
const PurchasePaymentDetail = React.lazy(
  () => import("./page/purchase-order/PurchasePaymentDetail")
);
const DashboardUtang = React.lazy(() => import("./page/purchase-order/DashboardUtang"));

// Production Order
const ProductionOrderList = React.lazy(() => import("./page/production-order/ProductionOrderList"));
const AddProductionOrder = React.lazy(() => import("./page/production-order/AddProductionOrder"));
const DetailProductionOrder = React.lazy(
  () => import("./page/production-order/DetailProductionOrder")
);

// Goods Receipt
const GoodsReceiptList = React.lazy(() => import("./page/goods-receipt/GoodsReceiptList"));
const AddGoodsReceipt = React.lazy(() => import("./page/goods-receipt/AddGoodsReceipt"));
const DetailGoodsReceipt = React.lazy(() => import("./page/goods-receipt/DetailGoodsReceipt"));
const EditGoodsReceipt = React.lazy(() => import("./page/goods-receipt/EditGoodsReceipt"));

// Sales Return
const SalesReturnList = React.lazy(() => import("./page/sales-return/SalesReturnList"));
const DetailSalesReturn = React.lazy(() => import("./page/sales-return/DetailSalesReturn"));

// Purchase Return
const PurchaseReturnList = React.lazy(() => import("./page/purchase-return/PurchaseReturnList"));
const DetailPurchaseReturn = React.lazy(
  () => import("./page/purchase-return/DetailPurchaseReturn")
);

// Stock Transfer
const StockTransferList = React.lazy(() => import("./page/stock-transfer/StockTransferList"));
const AddStockTransfer = React.lazy(() => import("./page/stock-transfer/AddStockTransfer"));
const DetailStockTransfer = React.lazy(() => import("./page/stock-transfer/DetailStockTransfer"));

// Cash Register
const CashRegisterOpenClose = React.lazy(
  () => import("./page/cash-register/CashRegisterOpenClose")
);
const CashRegisterCurrent = React.lazy(() => import("./page/cash-register/CashRegisterCurrent"));
const CashRegisterHistory = React.lazy(() => import("./page/cash-register/CashRegisterHistory"));
const CashRegisterDetail = React.lazy(() => import("./page/cash-register/CashRegisterDetail"));

// Price Store
const PriceStoreList = React.lazy(() => import("./page/price-store/PriceStoreList"));

// BOM
const BomList = React.lazy(() => import("./page/bom/BomList"));
const AddBom = React.lazy(() => import("./page/bom/AddBom"));
const DetailBom = React.lazy(() => import("./page/bom/DetailBom"));

// Cashier
const CashierPage = React.lazy(() => import("./page/cashier/CashierPage"));

// Kitchen Display
const KitchenDisplay = React.lazy(() => import("./page/kitchen-display"));

// Customer Order
const CustomerOrder = React.lazy(() => import("./page/customer-order"));
const CustomerOrderDetail = React.lazy(() => import("./page/customer-order/detail"));
const CustomerOrderCart = React.lazy(() => import("./page/customer-order/cart"));
const CustomerOrderTracking = React.lazy(() => import("./page/customer-order/tracking"));
const CustomerOrderManagement = React.lazy(() => import("./page/customer-order/management"));

// Customer Display
const CustomerDisplay = React.lazy(() => import("./page/customer-display"));

// Reservation
const ReservationList = React.lazy(() => import("./page/reservation/ReservationList"));
const AddReservation = React.lazy(() => import("./page/reservation/AddReservation"));
const EditReservation = React.lazy(() => import("./page/reservation/EditReservation"));
const DetailReservation = React.lazy(() => import("./page/reservation/DetailReservation"));

// Profile
const ProfilePage = React.lazy(() => import("./page/profile/ProfilePage"));

// Table
const TableList = React.lazy(() => import("./page/table/TableList"));

// Notification
const NotificationPage = React.lazy(() => import("./page/notification/NotificationPage"));

// Accounts Receivable
const AccountsReceivableList = React.lazy(
  () => import("./page/accounts-receivable/AccountsReceivableList")
);
const AccountsReceivableDetail = React.lazy(
  () => import("./page/accounts-receivable/AccountsReceivableDetail")
);
const ARPaymentList = React.lazy(() => import("./page/accounts-receivable/ARPaymentList"));

// Backup
const BackupPage = React.lazy(() => import("./page/backup/BackupPage"));

// Discount
const DiscountList = React.lazy(() => import("./page/discount/DiscountList"));
const AddDiscount = React.lazy(() => import("./page/discount/AddDiscount"));
const EditDiscount = React.lazy(() => import("./page/discount/EditDiscount"));
const DetailDiscount = React.lazy(() => import("./page/discount/DetailDiscount"));

// Type Payment
const TypePaymentList = React.lazy(() => import("./page/type-payment/TypePaymentList"));
const AddTypePayment = React.lazy(() => import("./page/type-payment/AddTypePayment"));
const EditTypePayment = React.lazy(() => import("./page/type-payment/EditTypePayment"));
const DetailTypePayment = React.lazy(() => import("./page/type-payment/DetailTypePayment"));

// Shift
const ShiftList = React.lazy(() => import("./page/shift/ShiftList"));
const AddShift = React.lazy(() => import("./page/shift/AddShift"));
const EditShift = React.lazy(() => import("./page/shift/EditShift"));

// Expense Category
const ExpenseCategoryList = React.lazy(() => import("./page/expense-category/ExpenseCategoryList"));
const AddExpenseCategory = React.lazy(() => import("./page/expense-category/AddExpenseCategory"));
const EditExpenseCategory = React.lazy(() => import("./page/expense-category/EditExpenseCategory"));
const ExpenseCategoryDetail = React.lazy(
  () => import("./page/expense-category/ExpenseCategoryDetail")
);

// Expense
const ExpenseList = React.lazy(() => import("./page/expense/ExpenseList"));
const AddExpense = React.lazy(() => import("./page/expense/AddExpense"));
const EditExpense = React.lazy(() => import("./page/expense/EditExpense"));
const DetailExpense = React.lazy(() => import("./page/expense/DetailExpense"));

// FAQ
const SupportComponent = React.lazy(() => import("@/components/organism/Support"));

const ShortcutHandler = () => {
  useKeyboardShortcuts();
  return null;
};

const Support = React.lazy(() => import("./page/support"));

const SentryInitializer = React.lazy(() => import("./components/organism/SentryInitializer"));

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

  return (
    <React.Fragment>
      <OfflineIndicator />
      <BrowserRouter>
        <Suspense>
          <SupportComponent />
          <RouteProgress />
          <ShortcutHandler />
          <SentryInitializer />
          <ErrorBoundary>
            <Routes>
              {/* Auth (no layout) */}
              <Route path="/" element={<LoginPage />} />
              <Route path="/register" element={<Register />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/home" element={<CashierPage />} />
              <Route path="/customer-order" element={<CustomerOrder />} />
              <Route path="/customer-order/menu/:id" element={<CustomerOrderDetail />} />
              <Route path="/customer-order/cart" element={<CustomerOrderCart />} />
              <Route path="/customer-order/tracking/:id" element={<CustomerOrderTracking />} />
              <Route path="/customer-display" element={<CustomerDisplay />} />

              {/* App layout: sidebar & header persist across route changes */}
              <Route element={<DashboardLayout />}>
                <Route path="/dashboard-super-admin" element={<Dashboard />} />
                <Route path="/dashboard-admin" element={<Dashboard />} />
                <Route path="/kitchen-display" element={<KitchenDisplay />} />
                <Route path="/qr-order-management" element={<CustomerOrderManagement />} />

                <Route path="/reservation" element={<ReservationList />} />
                <Route path="/add-reservation" element={<AddReservation />} />
                <Route path="/edit-reservation" element={<EditReservation />} />
                <Route path="/reservation/:id" element={<DetailReservation />} />

                <Route path="/product-list" element={<ProductList />} />
                <Route path="/add-product" element={<AddProduct />} />
                <Route path="/edit-product" element={<EditProduct />} />
                <Route path="/detail-product/:id" element={<DetailProduct />} />

                <Route path="/category-list" element={<CategoryList />} />
                <Route path="/add-category" element={<AddCategory />} />
                <Route path="/edit-category" element={<EditCategory />} />
                <Route path="/detail-category" element={<DetailCategory />} />

                <Route path="/member-list" element={<MemberList />} />
                <Route path="/add-member" element={<AddMember />} />
                <Route path="/edit-member" element={<EditMember />} />
                <Route path="/detail-member" element={<MemberDetail />} />
                <Route path="/member-point-history" element={<MemberPointHistory />} />

                <Route path="/member-tier" element={<MemberTier />} />
                <Route
                  path="/add-member-tier"
                  element={<AddMemberTier title="Add Member Tier" />}
                />
                <Route path="/edit-member-tier/:id" element={<EditMemberTier />} />
                <Route path="/detail-member-tier" element={<DetailMemberTier />} />

                <Route path="/discount-list" element={<DiscountList />} />
                <Route path="/add-discount" element={<AddDiscount />} />
                <Route path="/edit-discount" element={<EditDiscount />} />
                <Route path="/detail-discount" element={<DetailDiscount />} />

                <Route path="/accounts-receivable" element={<AccountsReceivableList />} />
                <Route path="/accounts-receivable/detail" element={<AccountsReceivableDetail />} />
                <Route path="/ar-payment" element={<ARPaymentList />} />

                <Route path="/type-payment-list" element={<TypePaymentList />} />
                <Route path="/add-type-payment" element={<AddTypePayment />} />
                <Route path="/edit-type-payment" element={<EditTypePayment />} />
                <Route path="/detail-type-payment" element={<DetailTypePayment />} />

                <Route path="/shift-list" element={<ShiftList />} />
                <Route path="/add-shift" element={<AddShift />} />
                <Route path="/edit-shift" element={<EditShift />} />

                <Route path="/user-list" element={<AdminList />} />
                <Route path="/add-user" element={<AddAdmin />} />
                <Route path="/add-employee" element={<AddEmployee />} />
                <Route path="/edit-employee" element={<EditEmployee />} />
                <Route path="/add-role" element={<AddRole />} />
                <Route path="/edit-role/:id" element={<EditRole />} />
                <Route path="/detail-role/:id" element={<DetailRole />} />
                <Route path="/role-management" element={<RoleManagement />} />
                <Route path="/employee-list" element={<EmployeeList />} />
                <Route path="/detail-employee" element={<DetailEmployee />} />

                <Route path="/location-list" element={<LocationList />} />
                <Route path="/add-location" element={<AddLocation />} />
                <Route path="/edit-location" element={<EditLocation />} />
                <Route path="/detail-location" element={<LocationDetail />} />
                <Route path="/store-geospatial" element={<StoreGeospatial />} />

                <Route path="/invoice-page" element={<InvoicePage />} />

                <Route path="/position-list" element={<PositionList />} />
                <Route path="/add-position" element={<AddPosition />} />
                <Route path="/edit-position" element={<EditPosition />} />
                <Route path="/detail-position" element={<DetailPosition />} />
                <Route path="/department-list" element={<DepartmentList />} />
                <Route path="/add-department" element={<AddDepartment />} />
                <Route path="/edit-department" element={<EditDepartment />} />
                <Route path="/detail-department" element={<DetailDepartment />} />

                <Route path="/table-list" element={<TableList />} />

                <Route path="/supplier" element={<SupplierList />} />
                <Route path="/add-supplier" element={<AddSupplier />} />
                <Route path="/edit-supplier" element={<EditSupplier />} />
                <Route path="/detail-supplier" element={<DetailSupplier />} />

                <Route path="/ingredient" element={<IngredientList />} />
                <Route path="/add-ingredient" element={<AddIngredient />} />
                <Route path="/edit-ingredient" element={<EditIngredient />} />
                <Route path="/detail-ingredient" element={<DetailIngredient />} />

                <Route path="/ingredient-category" element={<IngredientCategoryList />} />
                <Route path="/add-ingredient-category" element={<AddIngredientCategory />} />
                <Route path="/edit-ingredient-category" element={<EditIngredientCategory />} />

                <Route path="/tax-list" element={<TaxConfigList />} />
                <Route path="/add-tax" element={<AddTaxConfig />} />
                <Route path="/edit-tax" element={<EditTaxConfig />} />

                <Route path="/purchase-order" element={<PurchaseOrderList />} />
                <Route path="/add-purchase-order" element={<AddPurchaseOrder />} />
                <Route path="/purchase-order/detail" element={<DetailPurchaseOrder />} />
                <Route path="/edit-purchase-order" element={<EditPurchaseOrder />} />
                <Route path="/purchase-payment" element={<PurchasePaymentList />} />
                <Route path="/purchase-payment-detail" element={<PurchasePaymentDetail />} />
                <Route path="/ap-dashboard" element={<DashboardUtang />} />

                <Route path="/production-order" element={<ProductionOrderList />} />
                <Route path="/add-production-order" element={<AddProductionOrder />} />
                <Route path="/production-order/detail" element={<DetailProductionOrder />} />

                <Route path="/goods-receipt" element={<GoodsReceiptList />} />
                <Route path="/add-goods-receipt" element={<AddGoodsReceipt />} />
                <Route path="/goods-receipt/detail" element={<DetailGoodsReceipt />} />
                <Route path="/edit-goods-receipt" element={<EditGoodsReceipt />} />

                <Route path="/sales-return" element={<SalesReturnList />} />
                <Route path="/sales-return/detail" element={<DetailSalesReturn />} />

                <Route path="/purchase-return" element={<PurchaseReturnList />} />
                <Route path="/purchase-return/detail" element={<DetailPurchaseReturn />} />

                <Route path="/stock-transfer" element={<StockTransferList />} />
                <Route path="/add-stock-transfer" element={<AddStockTransfer />} />
                <Route path="/stock-transfer/detail" element={<DetailStockTransfer />} />

                <Route path="/cash-register/open-close" element={<CashRegisterOpenClose />} />
                <Route path="/cash-register/current" element={<CashRegisterCurrent />} />
                <Route path="/cash-register/history" element={<CashRegisterHistory />} />
                <Route path="/cash-register/history/detail" element={<CashRegisterDetail />} />

                <Route path="/price-list-template" element={<PriceStoreList />} />

                <Route path="/bom" element={<BomList />} />
                <Route path="/bom/add" element={<AddBom />} />
                <Route path="/bom/detail" element={<DetailBom />} />

                <Route path="/stock-opname" element={<StockOpnameList />} />
                <Route path="/stock-opname/detail" element={<DetailStockOpname />} />
                <Route path="/add-stock-opname" element={<AddStockOpname />} />

                <Route path="/stock-history" element={<StockHistory />} />
                <Route path="/low-stock" element={<LowStock />} />
                <Route path="/low-stock-all" element={<LowStockAll />} />
                <Route path="/stock-adjustment" element={<StockAdjustment />} />
                <Route path="/notification" element={<NotificationPage />} />

                <Route path="/expense-category" element={<ExpenseCategoryList />} />
                <Route path="/add-expense-category" element={<AddExpenseCategory />} />
                <Route path="/edit-expense-category" element={<EditExpenseCategory />} />
                <Route path="/detail-expense-category" element={<ExpenseCategoryDetail />} />

                <Route path="/expense" element={<ExpenseList />} />
                <Route path="/add-expense" element={<AddExpense />} />
                <Route path="/edit-expense" element={<EditExpense />} />
                <Route path="/detail-expense" element={<DetailExpense />} />

                <Route path="/backup" element={<BackupPage />} />
                <Route path="/support" element={<Support />} />
                <Route path="/profile" element={<ProfilePage />} />

                <Route path="/report/sales" element={<SalesReportPage />} />
                <Route path="/best-selling" element={<BestSellingReportPage />} />
                <Route path="/report/daily" element={<DailyReport />} />
                <Route path="/report/profit-loss" element={<ProfitLossReport />} />
                <Route path="/report/cash-flow" element={<CashFlowReport />} />
                <Route path="/report/profit-per-product" element={<ProfitPerProduct />} />
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Routes>
          </ErrorBoundary>
        </Suspense>
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
