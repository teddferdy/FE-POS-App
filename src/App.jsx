import React, { useEffect, useState, Suspense } from "react";
import { BrowserRouter, Navigate, Route } from "react-router-dom";
import { AnimatedRoutes } from "@/components/ui/page-transition";
import RouteProgress from "@/components/ui/route-progress";
import { useTranslation } from "react-i18next";
import { translationSelect } from "@/state/translation";

// Offline
import OfflineIndicator from "./components/organism/OfflineIndicator";
import { setupAutoSync } from "@/services/offline";

// Layout
import DashboardLayout from "./components/layout/DashboardLayout";

import Modal from "@/components/organism/modal";

import { Loading } from "@/components/ui/loading";

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

const Support = React.lazy(() => import("./page/support"));

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
        <Suspense
          fallback={
            <div className="flex items-center justify-center min-h-screen">
              <Loading />
            </div>
          }>
          <SupportComponent />
          <RouteProgress />
          <AnimatedRoutes>
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
            <Route path="/reservation/:id" element={withLayout(<DetailReservation />)} />

            {/* Super Admin & Admin Routes */}

            <Route path="/product-list" element={withLayout(<ProductList />)} />
            <Route path="/add-product" element={withLayout(<AddProduct />)} />
            <Route path="/edit-product" element={withLayout(<EditProduct />)} />
            <Route path="/detail-product/:id" element={withLayout(<DetailProduct />)} />

            <Route path="/category-list" element={withLayout(<CategoryList />)} />
            <Route path="/add-category" element={withLayout(<AddCategory />)} />
            <Route path="/edit-category" element={withLayout(<EditCategory />)} />
            <Route path="/detail-category" element={withLayout(<DetailCategory />)} />

            <Route path="/member-list" element={withLayout(<MemberList />)} />
            <Route path="/add-member" element={withLayout(<AddMember />)} />
            <Route path="/edit-member" element={withLayout(<EditMember />)} />
            <Route path="/detail-member" element={withLayout(<MemberDetail />)} />
            <Route path="/member-point-history" element={withLayout(<MemberPointHistory />)} />

            <Route path="/member-tier" element={withLayout(<MemberTier />)} />
            <Route
              path="/add-member-tier"
              element={withLayout(<AddMemberTier title="Add Member Tier" />)}
            />
            <Route path="/edit-member-tier/:id" element={withLayout(<EditMemberTier />)} />
            <Route path="/detail-member-tier" element={withLayout(<DetailMemberTier />)} />

            <Route path="/discount-list" element={withLayout(<DiscountList />)} />
            <Route path="/add-discount" element={withLayout(<AddDiscount />)} />
            <Route path="/edit-discount" element={withLayout(<EditDiscount />)} />
            <Route path="/detail-discount" element={withLayout(<DetailDiscount />)} />

            <Route path="/accounts-receivable" element={withLayout(<AccountsReceivableList />)} />
            <Route
              path="/accounts-receivable/detail"
              element={withLayout(<AccountsReceivableDetail />)}
            />
            <Route path="/ar-payment" element={withLayout(<ARPaymentList />)} />

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

            <Route path="/supplier" element={withLayout(<SupplierList />)} />
            <Route path="/add-supplier" element={withLayout(<AddSupplier />)} />
            <Route path="/edit-supplier" element={withLayout(<EditSupplier />)} />
            <Route path="/detail-supplier" element={withLayout(<DetailSupplier />)} />

            <Route path="/ingredient" element={withLayout(<IngredientList />)} />
            <Route path="/add-ingredient" element={withLayout(<AddIngredient />)} />
            <Route path="/edit-ingredient" element={withLayout(<EditIngredient />)} />
            <Route path="/detail-ingredient" element={withLayout(<DetailIngredient />)} />

            <Route path="/ingredient-category" element={withLayout(<IngredientCategoryList />)} />
            <Route
              path="/add-ingredient-category"
              element={withLayout(<AddIngredientCategory />)}
            />
            <Route
              path="/edit-ingredient-category"
              element={withLayout(<EditIngredientCategory />)}
            />

            <Route path="/tax-list" element={withLayout(<TaxConfigList />)} />
            <Route path="/add-tax" element={withLayout(<AddTaxConfig />)} />
            <Route path="/edit-tax" element={withLayout(<EditTaxConfig />)} />

            <Route path="/purchase-order" element={withLayout(<PurchaseOrderList />)} />
            <Route path="/add-purchase-order" element={withLayout(<AddPurchaseOrder />)} />
            <Route path="/purchase-order/detail" element={withLayout(<DetailPurchaseOrder />)} />
            <Route path="/edit-purchase-order" element={withLayout(<EditPurchaseOrder />)} />
            <Route path="/purchase-payment" element={withLayout(<PurchasePaymentList />)} />
            <Route
              path="/purchase-payment-detail"
              element={withLayout(<PurchasePaymentDetail />)}
            />

            <Route path="/production-order" element={withLayout(<ProductionOrderList />)} />
            <Route path="/add-production-order" element={withLayout(<AddProductionOrder />)} />
            <Route
              path="/production-order/detail"
              element={withLayout(<DetailProductionOrder />)}
            />

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

            <Route
              path="/cash-register/open-close"
              element={withLayout(<CashRegisterOpenClose />)}
            />
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
            <Route path="/stock-adjustment" element={withLayout(<StockAdjustment />)} />
            <Route path="/notification" element={withLayout(<NotificationPage />)} />

            <Route path="/expense-category" element={withLayout(<ExpenseCategoryList />)} />
            <Route path="/add-expense-category" element={withLayout(<AddExpenseCategory />)} />
            <Route path="/edit-expense-category" element={withLayout(<EditExpenseCategory />)} />
            <Route
              path="/detail-expense-category"
              element={withLayout(<ExpenseCategoryDetail />)}
            />

            <Route path="/expense" element={withLayout(<ExpenseList />)} />
            <Route path="/add-expense" element={withLayout(<AddExpense />)} />
            <Route path="/edit-expense" element={withLayout(<EditExpense />)} />
            <Route path="/detail-expense" element={withLayout(<DetailExpense />)} />

            <Route path="/backup" element={withLayout(<BackupPage />)} />
            <Route path="/support" element={withLayout(<Support />)} />
            <Route path="/profile" element={withLayout(<ProfilePage />)} />

            <Route path="/report/sales" element={withLayout(<SalesReportPage />)} />
            <Route path="/best-selling" element={withLayout(<BestSellingReportPage />)} />
            <Route path="/report/daily" element={withLayout(<DailyReport />)} />
            <Route path="/report/profit-loss" element={withLayout(<ProfitLossReport />)} />
            <Route path="/report/cash-flow" element={withLayout(<CashFlowReport />)} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </AnimatedRoutes>
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
